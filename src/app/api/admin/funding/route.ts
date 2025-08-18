import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// Mask card number helper
function maskCardNumber(number: string) {
  return number.slice(0, 4) + " **** **** " + number.slice(-4);
}

// Helper to get API token
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

// Helper to top up card
async function topupCard(token: string, cardId: string, amount: number) {
  const res = await fetch(`https://omega.alpha.africa/alpha/cards/fund/${cardId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-key": `fund_${Date.now()}`,
    },
    body: JSON.stringify({ amount }),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData?.error || "Failed to top up card");
  }
}

// --- GET: Fetch user cards ---
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const result = await query("SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC", [user.id]);
    const cards = result.rows.map((card) => ({
      id: card.id,
      number: card.number,
      maskedNumber: maskCardNumber(card.number),
      cvv: card.cvv,
      expiry: card.expiry,
      balance: parseFloat(card.balance),
      status: card.status,
      type: card.type,
      created_at: card.created_at,
    }));

    return NextResponse.json({ cards });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- POST: Top up existing card ---
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { cardId, amount } = body;

    if (!cardId || !amount) return NextResponse.json({ error: "cardId and amount are required" }, { status: 400 });

    const apiToken = await getApiToken();
    await topupCard(apiToken, cardId, amount);

    // Update balance in your DB
    await query("UPDATE cards SET balance = balance + $1 WHERE id = $2 AND user_id = $3", [amount, cardId, user.id]);

    return NextResponse.json({ message: `Card ${cardId} topped up with $${amount}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
