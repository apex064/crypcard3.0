import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// Mask card number helper
function maskCardNumber(number: string) {
  return number.slice(0, 4) + " **** **** " + number.slice(-4);
}

// Helper to get API token (fixed for OAuth2)
async function getApiToken() {
  const response = await fetch("https://omega.alpha.africa/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      client_id: process.env.ALPHA_CLIENT_ID!,
      client_secret: process.env.ALPHA_CLIENT_SECRET!,
      username: process.env.ALPHA_USERNAME!,
      password: process.env.ALPHA_PASSWORD!,
    }),
  });

  const data = await response.json();
  if (!data.access_token) throw new Error(`Failed to get API token: ${JSON.stringify(data)}`);
  return data.access_token;
}

// Helper to create cardholder via Lion API
async function createCardholder(token: string, user: any, purpose: string = "visacard-1") {
  const payload = {
    name: `${(user.first_name || "John").slice(0, 12)} ${(user.last_name || "Doe").slice(0, 12)}`.slice(0, 23),
    first_name: (user.first_name || "John").slice(0, 12),
    mid_name: (user.mid_name || "").slice(0, 12),
    last_name: (user.last_name || "Doe").slice(0, 12),
    gender: user.gender ?? 0,
    date_of_birth: user.date_of_birth || "1990-01-01",
    email_address: user.email || "john.doe@example.com",
    purpose,
  };

  const res = await fetch("https://omega.alpha.africa/alpha/cards/holder", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Idempotency-key": `holder_${Date.now()}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data?.data?.id) throw new Error(`Failed to create cardholder: ${JSON.stringify(data)}`);
  return data.data.id;
}

// Helper to create card
async function createCard(token: string, cardholderId: string) {
  const res = await fetch("https://omega.alpha.africa/alpha/cards/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-key": `card_${Date.now()}`,
    },
    body: JSON.stringify({ cardholder_id: cardholderId, purpose: "visacard-1" }),
  });

  const data = await res.json();
  if (!data?.data?.card?.id) throw new Error(`Failed to create card: ${JSON.stringify(data)}`);
  return data.data.card.id;
}

// Helper to top up card
async function topupCard(token: string, cardId: string, amount: number) {
  await fetch(`https://omega.alpha.africa/alpha/cards/fund/${cardId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-key": `fund_${Date.now()}`,
    },
    body: JSON.stringify({ amount }),
  });
}

// Helper to get card details
async function getCardDetails(token: string, cardId: string) {
  const res = await fetch(`https://omega.alpha.africa/alpha/cards/details/${cardId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const data = await res.json();
  return data.data;
}

// --- GET: Fetch user cards & refresh balances ---
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const result = await query("SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC", [user.id]);
    let cards = result.rows;

    if (cards.length > 0) {
      const apiToken = await getApiToken();

      cards = await Promise.all(
        cards.map(async (card) => {
          try {
            const cardData = await getCardDetails(apiToken, card.id);
            const latestBalance = parseFloat(cardData.card.balance);
            const latestStatus = cardData.card.state;

            await query(
              `UPDATE cards SET balance = $1, status = $2 WHERE id = $3`,
              [latestBalance, latestStatus, card.id]
            );

            return {
              ...card,
              balance: latestBalance,
              status: latestStatus,
            };
          } catch (err) {
            console.error(`Failed to refresh card ${card.id}:`, err);
            return card;
          }
        })
      );
    }

    const maskedCards = cards.map((card) => ({
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

    return NextResponse.json({ cards: maskedCards });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- POST: Create new cardholder + card + top-up ---
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const topupAmount = body.amount || 5;

    const apiToken = await getApiToken();
    const cardholderId = body.cardholderId || (await createCardholder(apiToken, user));
    const cardId = await createCard(apiToken, cardholderId);
    await topupCard(apiToken, cardId, topupAmount);
    const cardData = await getCardDetails(apiToken, cardId);

    const providerData = {
      id: cardData.card.id,
      number: cardData.card.card_number,
      cvv: cardData.details.card_cvv,
      expiry: `${cardData.details.card_exp_month}/${cardData.details.card_exp_year}`,
      type: cardData.card.type,
      balance: parseFloat(cardData.card.balance),
      status: cardData.card.state,
    };

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
      message: "Card created successfully",
      card: { ...providerData, maskedNumber: maskCardNumber(providerData.number) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
