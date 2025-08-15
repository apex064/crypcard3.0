// app/api/topup/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const res = await query(
      "SELECT id, card_id, amount, txid, status, created_at FROM topups WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100",
      [user.id]
    );

    return NextResponse.json({ data: res.rows });
  } catch (err: any) {
    console.error("GET /api/topup/history error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

