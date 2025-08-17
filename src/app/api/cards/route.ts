import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// Mask card number helper
function maskCardNumber(number?: string) {
  if (!number) return "**** **** **** ****";
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
  if (!data.access_token) throw new Error("Failed to get API token");
  return data.access_token;
}

// Helper to create cardholder
async function createCardholder(token: string, user: any) {
  const res = await fetch("https://lion.alpha.africa/alpha/cards/holder", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `${user.first_name || ""} ${user.last_name || ""}`.slice(0, 23),
      first_name: (user.first_name || "").slice(0, 12),
      mid_name: user.mid_name || "",
      last_name: (user.last_name || "").slice(0, 12),
      email_address: user.email,
      purpose: "visacard-1",
    }),
  });

  const data = await res.json();
  if (!data?.data?.id) throw new Error("Failed to create cardholder");
  return data.data.id;
}

// Helper to create card
async function createCard(token: string, cardholderId: string) {
  const res = await fetch("https://lion.alpha.africa/alpha/cards/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ cardholder_id: cardholderId, purpose: "visacard-1" }),
  });

  const data = await res.json();
  if (!data?.data?.card?.id) throw new Error("Failed to create card");
  return data.data.card.id;
}

// Helper to top up card
async function topupCard(token: string, cardId: string, amount: number) {
  await fetch(`https://lion.alpha.africa/alpha/cards/fund/${cardId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
}

// Helper to get card details
async function getCardDetails(token: string, cardId: string) {
  const res = await fetch(`https://lion.alpha.africa/alpha/cards/details/${cardId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const data = await res.json();
  if (!data?.data?.card) throw new Error("Failed to fetch card details");
  return data.data;
}

// GET: Fetch user cards
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const result = await query("SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC", [
      user.id,
    ]);

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

// POST: Create new card using Lion API
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const topupAmount = body.amount || 5;

    // --- Lion API integration ---
    const apiToken = await getApiToken();
    const cardholderId = body.cardholderId || (await createCardholder(apiToken, user));
    const cardId = await createCard(apiToken, cardholderId);
    await topupCard(apiToken, cardId, topupAmount);
    const cardData = await getCardDetails(apiToken, cardId);

    const providerData = {
      id: cardData.card.id,
      number: cardData.card.card_number || "",
      cvv: cardData.details?.card_cvv || "",
      expiry: `${cardData.details?.card_exp_month || "00"}/${cardData.details?.card_exp_year || "00"}`,
      type: cardData.card.type || "Virtual USD Card",
      balance: parseFloat(cardData.card.balance || "0"),
      status: cardData.card.state || "Inactive",
    };

    // Insert into DB
    await query(
      `INSERT INTO cards (id, user_id, number, cvv, expiry, balance, status, type)
       VALUES ($1, $2, $3, $4, $5, $6::NUMERIC(18,6), $7, $8)`,
      [
        providerData.id,
        user.id,
        providerData.number,
        providerData.cvv,
        providerData.expiry,
        providerData.balance,
        providerData.status,
        providerData.type,
      ]
    );

    return NextResponse.json({
      message: "Card created",
      card: { ...providerData, maskedNumber: maskCardNumber(providerData.number) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
