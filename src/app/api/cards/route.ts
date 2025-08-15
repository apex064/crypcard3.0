import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// Mask card number helper
function maskCardNumber(number: string) {
  return number.slice(0, 4) + " **** **** " + number.slice(-4);
}

// GET: Fetch user cards
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = await verifyToken(token); // async-safe
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const result = await query(
      "SELECT * FROM cards WHERE user_id = $1",
      [user.id]
    );

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

// POST: Create new card
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = await verifyToken(token); // async-safe
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Simulating provider API response
    const providerData = {
      id: "card_" + Date.now(),
      number:
        "4532 " +
        Math.floor(1000 + Math.random() * 9000) +
        " " +
        Math.floor(1000 + Math.random() * 9000) +
        " " +
        Math.floor(1000 + Math.random() * 9000),
      cvv: String(Math.floor(100 + Math.random() * 900)),
      expiry: "12/27",
      type: "Virtual USD Card",
      balance: 0,
      status: "Active",
    };

    // Save to DB
    await query(
      `INSERT INTO cards (id, user_id, number, cvv, expiry, balance, status, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
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

    // Return in same shape as GET
    return NextResponse.json({
      message: "Card created",
      card: {
        ...providerData,
        maskedNumber: maskCardNumber(providerData.number),
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
