import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// Mask card number for display
function maskCardNumber(number: string) {
  return number.slice(0, 4) + " **** **** " + number.slice(-4);
}

// Debug wrapper for fetch
async function fetchWithDebug(url: string, options: any) {
  const response = await fetch(url, options);
  const text = await response.text();

  console.log("=== API RESPONSE DEBUG ===");
  console.log("URL:", url);
  console.log("METHOD:", options.method);
  console.log("STATUS:", response.status, response.statusText);
  console.log("HEADERS:", response.headers);
  console.log("RESPONSE BODY:", text);
  console.log("=== END DEBUG ===");

  try {
    const data = JSON.parse(text);
    return { ok: response.ok, data };
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${text}`);
  }
}

// Save tokens to DB with calculated expiry
async function saveTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  await query(
    `INSERT INTO api_tokens (id, access_token, refresh_token, expires_in, expires_at, updated_at)
     VALUES (1, $1, $2, $3, $4, NOW())
     ON CONFLICT (id)
     DO UPDATE SET access_token = $1, refresh_token = $2, expires_in = $3, expires_at = $4, updated_at = NOW()`,
    [accessToken, refreshToken, expiresIn, expiresAt]
  );
}

// Login to external API (OAuth without 2FA)
async function loginAndGetApiToken(): Promise<string> {
  const { ok, data } = await fetchWithDebug("https://omega.alpha.africa/oauth/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-key": `token_${Date.now()}`,
    },
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

// Refresh API token
async function refreshApiToken(): Promise<any> {
  const result = await query(`SELECT refresh_token FROM api_tokens WHERE id = 1`);
  const storedRefreshToken = result.rows[0]?.refresh_token;
  if (!storedRefreshToken) throw new Error("No stored refresh token found");

  const { ok, data } = await fetchWithDebug("https://omega.alpha.africa/oauth/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-key": `refresh_${Date.now()}`,
    },
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

// Get API token (check expiry → refresh → login)
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

// Create cardholder via API
async function createCardholderViaApi(token: string, user: any, purpose: string = "visacard-1") {
  const payload = {
    name: `${user.first_name} ${user.last_name}`.slice(0, 23),
    first_name: user.first_name.slice(0, 12),
    mid_name: user.mid_name || "",
    last_name: user.last_name.slice(0, 12),
    gender: user.gender ?? 0,
    date_of_birth: user.date_of_birth || "1990-01-01",
    address_line_1: user.address_line_1 || "123 Main St",
    address_line_2: user.address_line_2 || "",
    city: user.city || "Kalmar",
    state: user.state || "WY",
    country: user.country || "US",
    zip_code: user.zip_code || "82801",
    phone_number: user.phone_number || "1234567890",
    cell_number: user.cell_number || "1234567890",
    calling_code: user.calling_code || "001",
    country_calling_code: user.country_calling_code || "US",
    email_address: user.email,
    nationality: user.nationality || "USA",
    place_of_birth: user.place_of_birth || "USA",
    purpose,
  };

  const { ok, data } = await fetchWithDebug("https://omega.alpha.africa/alpha/cards/holder", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-key": `create_holder_${Date.now()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!ok || !data.data?.id) throw new Error(data.message || "Failed to create cardholder");
  return data.data.id;
}

// Create card via API
async function createCardViaApi(token: string, cardholderId: string, purpose: string) {
  const { ok, data } = await fetchWithDebug("https://omega.alpha.africa/alpha/cards/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-key": `create_card_${Date.now()}`,
    },
    body: JSON.stringify({ cardholder_id: cardholderId, purpose }),
  });

  if (!ok) throw new Error(data.message || "Failed to create card");
  return data;
}

// Delete card via API
async function deleteCardViaApi(token: string, cardId: string) {
  const { ok, data } = await fetchWithDebug(`https://omega.alpha.africa/alpha/cards/${cardId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Idempotency-key": `delete_card_${Date.now()}`,
    },
  });

  if (!ok) throw new Error(data.message || "Failed to delete card via API");
  return data;
}

// GET handler
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    if (type === "cards") {
      const result = await query("SELECT * FROM cards");
      return NextResponse.json({
        cards: result.rows.map((card) => ({
          id: card.id,
          user_id: card.user_id,
          number: card.number,
          maskedNumber: maskCardNumber(card.number),
          cvv: card.cvv,
          expiry: card.expiry,
          balance: parseFloat(card.balance),
          status: card.status,
          type: card.type,
        })),
      });
    }

    if (type === "topups") {
      const result = await query("SELECT * FROM topups ORDER BY created_at DESC LIMIT 100");
      return NextResponse.json({ topups: result.rows });
    }

    if (type === "transactions") {
      const result = await query(`
        SELECT id::text, user_id, type, description, amount::numeric, status::text, date::date, time::time(0), card_number::text
        FROM transactions
        ORDER BY date DESC, time DESC
        LIMIT 100
      `);
      return NextResponse.json({ transactions: result.rows });
    }

    if (type === "users") {
      const result = await query("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC");
      return NextResponse.json({ users: result.rows });
    }

    return NextResponse.json({ error: "Invalid type param" }, { status: 400 });
  } catch (error: any) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST handler
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    switch (body.action) {
      case "create_card": {
        const { userId, purpose = "visacard-1" } = body;
        if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

        const apiToken = await getApiToken();
        const userResult = await query(
          "SELECT * FROM users WHERE id = $1",
          [userId]
        );
        if (userResult.rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const userRecord = userResult.rows[0];
        let { cardholder_id } = userRecord;

        if (!cardholder_id) {
          cardholder_id = await createCardholderViaApi(apiToken, userRecord, purpose);
          await query("UPDATE users SET cardholder_id = $1 WHERE id = $2", [cardholder_id, userId]);
        }

        const cardApiResponse = await createCardViaApi(apiToken, cardholder_id, purpose);
        const cardData = cardApiResponse.data.card;

        await query(
          `INSERT INTO cards (id, user_id, number, cvv, expiry, balance, status, type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            cardData.id,
            userId,
            cardData.card_number,
            cardData.card_cvv,
            `${cardData.card_exp_month}/${cardData.card_exp_year}`,
            parseFloat(cardData.balance),
            cardData.state,
            cardData.brand,
          ]
        );

        return NextResponse.json({
          message: "Card created",
          card: {
            id: cardData.id,
            user_id: userId,
            number: cardData.card_number,
            maskedNumber: cardData.masked_number,
            cvv: cardData.card_cvv,
            expiry: `${cardData.card_exp_month}/${cardData.card_exp_year}`,
            balance: parseFloat(cardData.balance),
            status: cardData.state,
            type: cardData.brand,
          },
        });
      }

      case "delete_card": {
        const { cardId } = body;
        if (!cardId) return NextResponse.json({ error: "cardId is required" }, { status: 400 });

        const apiToken = await getApiToken();
        await deleteCardViaApi(apiToken, cardId);
        await query("DELETE FROM cards WHERE id = $1", [cardId]);

        return NextResponse.json({ message: "Card deleted successfully" });
      }

      case "delete_card_local": {
        const { cardId } = body;
        if (!cardId) return NextResponse.json({ error: "cardId is required" }, { status: 400 });

        await query("DELETE FROM cards WHERE id = $1", [cardId]);
        return NextResponse.json({ message: "Card deleted locally" });
      }

      case "refresh_token": {
        const data = await refreshApiToken();
        return NextResponse.json({ message: "Token refreshed successfully", ...data });
      }

      case "update_topup_status": {
        const { txid, status } = body;
        if (!txid || !status) return NextResponse.json({ error: "txid and status required" }, { status: 400 });

        await query("UPDATE topups SET status = $1 WHERE txid = $2", [status, txid]);
        return NextResponse.json({ message: "Top-up status updated" });
      }

      case "update_user_role": {
        const { userId, role } = body;
        if (!userId || !role) return NextResponse.json({ error: "userId and role required" }, { status: 400 });

        await query("UPDATE users SET role = $1 WHERE id = $2", [role, userId]);
        return NextResponse.json({ message: "User role updated" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("POST ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
