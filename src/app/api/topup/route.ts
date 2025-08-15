// app/api/topup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import TronWeb from "tronweb";

const TRC20_ADDRESS = process.env.TRC20_WALLET as string; // receiving address (base58)
const MARKUP_PERCENT = Number(process.env.TOPUP_MARKUP || "5"); // default 5%
const TRONGRID_API = process.env.TRONGRID_API || "https://api.trongrid.io";

async function verifyTrc20Tx(txid: string, expectedAddress: string, expectedAmount: number) {
  try {
    // Use TronGrid v1 endpoint
    const res = await fetch(`${TRONGRID_API}/v1/transactions/${txid}`);
    if (!res.ok) return false;

    const json = await res.json();
    const data = json.data ?? json;
    if (!data || data.length === 0) return false;

    const tx = data[0];
    const contract = tx.raw_data.contract?.[0];
    if (!contract) return false;

    // Validate contract type
    if (contract.type !== "TriggerSmartContract") return false;

    const params = contract.parameter.value;
    // tronWeb expects hex address prefixed with '41'
    const decodedHex = params.to_address; // this is raw hex buffer in many responses
    const hexStr = typeof decodedHex === "string" ? decodedHex : Buffer.from(decodedHex).toString("hex");
    const decodedTo = "41" + hexStr;
    const tronWeb = new TronWeb({ fullHost: TRONGRID_API });
    const toBase58 = tronWeb.address.fromHex(decodedTo);

    // Amount for TRC20 typically is integer in smallest unit (USDT 6 decimals)
    const amount = Number(params.amount) / 1_000_000;

    return (
      toBase58 === expectedAddress &&
      amount >= expectedAmount &&
      Array.isArray(tx.ret) && tx.ret[0].contractRet === "SUCCESS"
    );
  } catch (err) {
    console.error("TRC20 verification error:", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token); // throws if invalid; adjust if your verifyToken returns null
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const amount = Number(body.amount);
    const cardId = String(body.cardId ?? "");
    const txid = String(body.txid ?? "").trim();

    if (!amount || !cardId || !txid) {
      return NextResponse.json({ error: "Amount, cardId, and txid are required" }, { status: 400 });
    }

    if (amount < 10) {
      return NextResponse.json({ error: "Minimum top-up amount is $10" }, { status: 400 });
    }

    // Insert pending topup
    await query(
      "INSERT INTO topups (user_id, card_id, amount, txid, status, created_at) VALUES ($1,$2,$3,$4,$5, NOW())",
      [user.id, cardId, amount, txid, "pending"]
    );

    // Verify TX on TRON chain
    const isConfirmed = await verifyTrc20Tx(txid, TRC20_ADDRESS, amount);
    if (!isConfirmed) {
      return NextResponse.json(
        { message: "Payment not yet confirmed on TRON chain. Will remain pending." },
        { status: 202 }
      );
    }

    // Apply markup (we deduct markup from amount when funding)
    const fundedAmount = Math.max(0, amount - amount * (MARKUP_PERCENT / 100));

    // Fund card via provider
    const providerRes = await fetch(`${process.env.PROVIDER_BASE_URL}/cards/${cardId}/fund`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PROVIDER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount: fundedAmount })
    });

    let providerData = null;
    try {
      providerData = await providerRes.json();
    } catch (e) {
      // ignore JSON parse errors
      providerData = null;
    }

    if (!providerRes.ok) {
      // keep topup pending or mark failed
      await query("UPDATE topups SET status = $1 WHERE txid = $2", ["failed", txid]);
      return NextResponse.json({ error: providerData?.error || "Failed to fund card" }, { status: providerRes.status });
    }

    // mark completed
    await query("UPDATE topups SET status = $1 WHERE txid = $2", ["completed", txid]);

    return NextResponse.json({
      message: "Card funded successfully",
      fundedAmount,
      providerData
    });
  } catch (err: any) {
    console.error("POST /api/topup error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

