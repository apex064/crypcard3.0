// app/api/admin/cards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// --- Helpers (adapted from your user cards code) ---
function maskCardNumber(number?: string) {
  if (!number) return "**** **** **** ****";
  return number.slice(0, 4) + " **** **** " + number.slice(-4);
}

async function getApiToken() {
  const res = await fetch("https://omega.alpha.africa/oauth/token", {
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

  const data = await res.json();
  if (!data?.access_token) throw new Error(`Failed to get API token: ${JSON.stringify(data)}`);
  return data.access_token;
}

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
    const body = await res.text();
    throw new Error(`Provider fund failed: ${body}`);
  }
}

async function getCardDetails(token: string, cardId: string) {
  const res = await fetch(`https://omega.alpha.africa/alpha/cards/details/${cardId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const data = await res.json();
  if (!data?.data?.card) throw new Error(`Failed to get card details: ${JSON.stringify(data)}`);
  return data.data;
}

// --- Pricing calculation ---
function calculateFinal(base: number, markup: number, profit_margin_pct: number) {
  // base + markup (fixed) then apply profit margin %
  const withMarkup = (base || 0) + (markup || 0);
  const finalPrice = withMarkup * (1 + (profit_margin_pct || 0) / 100);
  return Number(finalPrice.toFixed(2));
}

// --- Admin guard ---
function requireAdminFromToken(authHeader?: string | null) {
  if (!authHeader) return null;
  const token = authHeader.replace?.("Bearer ", "") ?? authHeader;
  try {
    const user = verifyToken(token);
    if (!user || user.role !== "admin") return null;
    return user;
  } catch {
    return null;
  }
}

// --- GET: list all cards (admin) ---
export async function GET(req: NextRequest) {
  try {
    const admin = requireAdminFromToken(req.headers.get("authorization"));
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await query(
      `SELECT c.*, u.email
       FROM cards c
       LEFT JOIN users u ON u.id = c.user_id
       ORDER BY c.created_at DESC
       LIMIT 500`
    );
    const rows = result.rows.map((r: any) => ({
      ...r,
      maskedNumber: maskCardNumber(r.number),
    }));
    return NextResponse.json({ cards: rows });
  } catch (err: any) {
    console.error("GET /api/admin/cards error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch cards" }, { status: 500 });
  }
}

// --- POST: create card for a user (admin) ---
export async function POST(req: NextRequest) {
  try {
    const admin = requireAdminFromToken(req.headers.get("authorization"));
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { user_id, base_price = 25, markup = 0, profit_margin = 5 } = body;

    if (!user_id) return NextResponse.json({ error: "user_id is required" }, { status: 400 });

    // compute final funding amount
    const finalAmount = calculateFinal(Number(base_price), Number(markup), Number(profit_margin));

    // get target user from DB
    const r = await query("SELECT * FROM users WHERE id = $1", [user_id]);
    if (r.rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const targetUser = r.rows[0];

    // create cardholder (if user.cardholder_id absent we create and store)
    const apiToken = await getApiToken();
    let cardholderId = targetUser.cardholder_id;
    if (!cardholderId) {
      cardholderId = await createCardholder(apiToken, targetUser);
      // persist to users table (best-effort)
      await query("UPDATE users SET cardholder_id = $1 WHERE id = $2", [cardholderId, user_id]);
    }

    // create card at provider
    const cardId = await createCard(apiToken, cardholderId);

    // fund with computed amount
    await topupCard(apiToken, cardId, finalAmount);

    // fetch card details and store
    const cardData = await getCardDetails(apiToken, cardId);
    const providerCard = {
      id: cardData.card.id,
      number: cardData.card.card_number ?? "",
      cvv: cardData.details?.card_cvv ?? "",
      expiry: `${cardData.details?.card_exp_month ?? "00"}/${cardData.details?.card_exp_year ?? "00"}`,
      type: cardData.card.type ?? "Virtual",
      balance: parseFloat(cardData.card.balance ?? "0"),
      status: cardData.card.state ?? "Inactive",
    };

    await query(
      `INSERT INTO cards (id, user_id, number, cvv, expiry, balance, status, type, base_price, markup, profit_margin, final_price, created_at)
       VALUES ($1,$2,$3,$4,$5,$6::NUMERIC(18,6),$7,$8,$9,$10,$11,$12,NOW())`,
      [
        providerCard.id,
        user_id,
        providerCard.number,
        providerCard.cvv,
        providerCard.expiry,
        providerCard.balance,
        providerCard.status,
        providerCard.type,
        Number(base_price),
        Number(markup),
        Number(profit_margin),
        finalAmount,
      ]
    );

    return NextResponse.json({
      message: "Card created for user",
      card: { ...providerCard, maskedNumber: maskCardNumber(providerCard.number), final_price: finalAmount },
    });
  } catch (err: any) {
    console.error("POST /api/admin/cards error:", err);
    return NextResponse.json({ error: err.message || "Failed to create card" }, { status: 500 });
  }
}

// --- PUT: update card (pricing/status) ---
export async function PUT(req: NextRequest) {
  try {
    const admin = requireAdminFromToken(req.headers.get("authorization"));
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, base_price = 0, markup = 0, profit_margin = 0, status } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const finalPrice = calculateFinal(Number(base_price), Number(markup), Number(profit_margin));

    const res = await query(
      `UPDATE cards SET base_price=$1, markup=$2, profit_margin=$3, final_price=$4, status=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [Number(base_price), Number(markup), Number(profit_margin), finalPrice, status ?? undefined, id]
    );
    if (res.rows.length === 0) return NextResponse.json({ error: "Card not found" }, { status: 404 });

    return NextResponse.json(res.rows[0]);
  } catch (err: any) {
    console.error("PUT /api/admin/cards error:", err);
    return NextResponse.json({ error: err.message || "Failed to update card" }, { status: 500 });
  }
}

// --- DELETE: remove card ---
export async function DELETE(req: NextRequest) {
  try {
    const admin = requireAdminFromToken(req.headers.get("authorization"));
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const res = await query("DELETE FROM cards WHERE id=$1 RETURNING *", [id]);
    if (res.rows.length === 0) return NextResponse.json({ error: "Card not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/admin/cards error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete card" }, { status: 500 });
  }
}
