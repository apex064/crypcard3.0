import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET: List users
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const result = await query("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC");
    return NextResponse.json({ users: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create, update role, or delete user
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    switch (body.action) {
      case "create_user": {
        const { email, password, role = "user" } = body;
        if (!email || !password) return NextResponse.json({ error: "email & password required" }, { status: 400 });

        // hash password
        const bcrypt = require("bcryptjs");
        const hashed = await bcrypt.hash(password, 10);

        const result = await query(
          `INSERT INTO users (email, password, role, created_at)
           VALUES ($1, $2, $3, NOW()) RETURNING id, email, role`,
          [email, hashed, role]
        );

        return NextResponse.json({ message: "User created", user: result.rows[0] });
      }

      case "update_user_role": {
        const { userId, role } = body;
        if (!userId || !role) return NextResponse.json({ error: "userId and role required" }, { status: 400 });

        await query("UPDATE users SET role = $1 WHERE id = $2", [role, userId]);
        return NextResponse.json({ message: "User role updated" });
      }

      case "delete_user": {
        const { userId } = body;
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        await query("DELETE FROM users WHERE id = $1", [userId]);
        return NextResponse.json({ message: "User deleted" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
