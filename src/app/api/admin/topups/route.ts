import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// ✅ Get all topups
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const topups = await query("SELECT * FROM topups ORDER BY created_at DESC");
    return NextResponse.json(topups);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ Update topup status (approve/reject/pending)
export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await query("UPDATE topups SET status = $1 WHERE id = $2", [status, id]);

    return NextResponse.json({ message: "Topup updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ Delete topup
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing topup id" }, { status: 400 });
    }

    await query("DELETE FROM topups WHERE id = $1", [id]);

    return NextResponse.json({ message: "Topup deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
