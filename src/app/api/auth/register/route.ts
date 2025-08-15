// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { sendMail } from "@/lib/mail";

// --- Admin API helper functions ---

// Debug fetch
async function fetchWithDebug(url: string, options: any) {
  const response = await fetch(url, options);
  const text = await response.text();
  console.log("=== API RESPONSE DEBUG ===", url, options.method, response.status, text);
  try {
    return { ok: response.ok, data: JSON.parse(text) };
  } catch {
    throw new Error(`Failed to parse JSON: ${text}`);
  }
}

// Token management
async function saveTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  await query(
    `INSERT INTO api_tokens (id, access_token, refresh_token, expires_in, expires_at, updated_at)
     VALUES (1, $1, $2, $3, $4, NOW())
     ON CONFLICT (id) DO UPDATE SET access_token = $1, refresh_token = $2, expires_in = $3, expires_at = $4, updated_at = NOW()`,
    [accessToken, refreshToken, expiresIn, expiresAt]
  );
}

async function loginAndGetApiToken(): Promise<string> {
  const { ok, data } = await fetchWithDebug("https://omega.alpha.africa/oauth/token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "Idempotency-key": `token_${Date.now()}` },
    body: JSON.stringify({
      grant_type: "password",
      client_id: process.env.ALPHA_CLIENT_ID,
      client_secret: process.env.ALPHA_CLIENT_SECRET,
      username: process.env.ALPHA_USERNAME,
      password: process.env.ALPHA_PASSWORD,
    }),
  });
  if (!ok || !data.access_token) throw new Error(data.message || "Failed to get API token");
  await saveTokens(data.access_token, data.refresh_token, data.expires_in);
  return data.access_token;
}

async function refreshApiToken(): Promise<any> {
  const result = await query(`SELECT refresh_token FROM api_tokens WHERE id = 1`);
  const storedRefreshToken = result.rows[0]?.refresh_token;
  if (!storedRefreshToken) throw new Error("No stored refresh token found");

  const { ok, data } = await fetchWithDebug("https://omega.alpha.africa/oauth/token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "Idempotency-key": `refresh_${Date.now()}` },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: process.env.ALPHA_CLIENT_ID,
      client_secret: process.env.ALPHA_CLIENT_SECRET,
      refresh_token: storedRefreshToken,
    }),
  });
  if (!ok || !data.access_token) throw new Error(data.message || "Failed to refresh API token");
  await saveTokens(data.access_token, data.refresh_token, data.expires_in);
  return data;
}

async function getApiToken(): Promise<string> {
  const result = await query(`SELECT access_token, expires_at FROM api_tokens WHERE id = 1`);
  if (result.rows.length > 0) {
    const { access_token, expires_at } = result.rows[0];
    if (expires_at && new Date() < new Date(expires_at)) return access_token;
    try {
      const refreshed = await refreshApiToken();
      return refreshed.access_token;
    } catch (err) {
      console.error("Token refresh failed, logging in again:", err);
    }
  }
  return await loginAndGetApiToken();
}

// --- Register POST handler ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      first_name,
      mid_name,
      last_name,
      gender,
      date_of_birth,
      email,
      password,
    } = body;

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: "First name, last name, email, and password are required" },
        { status: 400 }
      );
    }

    const hashed = hashPassword(password);

    const existing = await query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Insert new user
    const result = await query(
      `INSERT INTO users (
        first_name, mid_name, last_name, gender, date_of_birth,
        email, password_hash, verified, cardholder_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,false,NULL)
      RETURNING id, email`,
      [first_name, mid_name || "", last_name, gender || 0, date_of_birth || "1990-01-01", email, hashed]
    );

    const userId = result.rows[0].id;

    // Create cardholder via API
    try {
      const apiToken = await getApiToken();
      const payload = {
        name: `${first_name} ${last_name}`.slice(0, 23),
        first_name: first_name.slice(0, 12),
        mid_name: mid_name || "",
        last_name: last_name.slice(0, 12),
        gender: gender || 0,
        date_of_birth: date_of_birth || "1990-01-01",
        email_address: email,
        purpose: "visacard-1",
      };

      const { ok, data } = await fetchWithDebug(
        "https://omega.alpha.africa/alpha/cards/holder",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (ok && data.data?.id) {
        const cardholderId = data.data.id;
        await query("UPDATE users SET cardholder_id = $1 WHERE id = $2", [cardholderId, userId]);
      } else {
        console.error("Cardholder creation failed:", data);
      }
    } catch (apiErr: any) {
      console.error("Cardholder API error:", apiErr);
    }

    // Generate verification token
    const token = signToken({ id: userId, email });
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;
    await sendMail(email, "Verify your account", `<a href="${verifyUrl}">Verify Account</a>`);

    return NextResponse.json({ message: "Registered. Check your email to verify account." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
