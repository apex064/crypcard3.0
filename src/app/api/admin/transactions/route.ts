// app/api/admin/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// --- Helpers ---
function maskCardNumber(number: string) {
  return number ? number.slice(0, 4) + " **** **** " + number.slice(-4) : null;
}

async function getApiToken() {
  const response = await fetch("https://omega.alpha.africa/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "password",
      client_id: process.env.ALPHA_CLIENT_ID,
      client_secret: process.env.ALPHA_CLIENT_SECRET,
      username: process.env.ALPHA_USERNAME,
      password: process.env.ALPHA_PASSWORD,
    }),
  });

  const data = await response.json();
  if (!data.access_token) throw new Error(`Failed to get API token: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function fetchExternalCardTransactions(cardId: string, apiToken: string) {
  try {
    const res = await fetch(`https://lion.alpha.africa/alpha/cards/transactions/${cardId}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("Error fetching external transactions:", err);
    return [];
  }
}

// --- GET: Admin fetches ALL transactions (local + topup + external) ---
export async function GET(req: NextRequest) {
  try {
    // 🔐 Authentication first
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch local transactions
    const txnResult = await query(
      `SELECT id, user_id, type, description, amount, status, date, time, card_number
       FROM transactions`
    );

    const localTransactions = txnResult.rows.map((t) => ({
      id: t.id,
      user_id: t.user_id,
      type: t.type,
      description: t.description,
      amount: parseFloat(t.amount),
      status: t.status,
      date: t.date,
      time: t.time,
      card: t.card_number ? maskCardNumber(t.card_number) : null,
      source: "local",
    }));

    // Fetch top-ups
    const topupResult = await query(
      `SELECT tp.id, tp.user_id, tp.card_id, tp.amount, tp.status, tp.created_at, c.card_number
       FROM topups tp
       LEFT JOIN cards c ON tp.card_id = c.id`
    );

    const topupTransactions = topupResult.rows.map((t) => ({
      id: "TOPUP-" + t.id,
      user_id: t.user_id,
      type: "topup",
      description: "Card Top-Up",
      amount: parseFloat(t.amount),
      status: t.status,
      date: t.created_at.toISOString().split("T")[0],
      time: t.created_at.toTimeString().split(" ")[0].slice(0, 5),
      card: t.card_number ? maskCardNumber(t.card_number) : null,
      source: "topup",
    }));

    // 🔑 Get API token for external fetch
    const apiToken = await getApiToken();

    // Fetch external transactions
    const cardsResult = await query(`SELECT id FROM cards`);
    const cardIds = cardsResult.rows.map((c) => c.id);

    let externalTransactions: any[] = [];
    for (const cardId of cardIds) {
      const externalTxs = await fetchExternalCardTransactions(cardId, apiToken);

      for (const tx of externalTxs) {
        const txId = "EXT-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);

        await query(
          `INSERT INTO transactions (id, user_id, type, description, amount, status, date, time, card_number)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (id) DO NOTHING`,
          [
            txId,
            tx.user_id || null,
            "external",
            tx.merchant || tx.description || "External Transaction",
            tx.amount || 0,
            tx.status || "completed",
            tx.date_created ? tx.date_created.split("T")[0] : new Date().toISOString().split("T")[0],
            tx.date_created ? tx.date_created.split("T")[1]?.slice(0, 5) : new Date().toTimeString().slice(0, 5),
            cardId
          ]
        );

        externalTransactions.push({
          id: txId,
          user_id: tx.user_id || null,
          type: "external",
          description: tx.merchant || tx.description || "External Transaction",
          amount: tx.amount || 0,
          status: tx.status || "completed",
          date: tx.date_created ? tx.date_created.split("T")[0] : new Date().toISOString().split("T")[0],
          time: tx.date_created ? tx.date_created.split("T")[1]?.slice(0, 5) : new Date().toTimeString().slice(0, 5),
          card: maskCardNumber(cardId),
          source: "external",
        });
      }
    }

    // Combine all transactions
    const allTransactions = [...localTransactions, ...topupTransactions, ...externalTransactions];

    // Sort by date + time descending
    allTransactions.sort((a, b) => {
      const dtA = new Date(`${a.date}T${a.time}`);
      const dtB = new Date(`${b.date}T${b.time}`);
      return dtB.getTime() - dtA.getTime();
    });

    return NextResponse.json({ transactions: allTransactions });
  } catch (error: any) {
    console.error("GET /api/admin/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

