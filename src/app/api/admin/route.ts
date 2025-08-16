import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// --- Helper Functions ---
function maskCardNumber(number: string) {
  return number.slice(0, 4) + " **** **** " + number.slice(-4);
}

async function fetchWithDebug(url: string, options: any) {
  const res = await fetch(url, options);
  const text = await res.text();
  console.log("=== API RESPONSE DEBUG ===", url, options.method, res.status, text);
  try {
    return { ok: res.ok, data: JSON.parse(text) };
  } catch {
    throw new Error(`Failed to parse JSON: ${text}`);
  }
}

// --- Token Management ---
async function saveTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  await query(
    `INSERT INTO api_tokens (id, access_token, refresh_token, expires_in, expires_at, updated_at)
     VALUES (1, $1, $2, $3, $4, NOW())
     ON CONFLICT (id) DO UPDATE 
     SET access_token = $1, refresh_token = $2, expires_in = $3, expires_at = $4, updated_at = NOW()`,
    [accessToken, refreshToken, expiresIn, expiresAt]
  );
}

async function loginAndGetApiToken(): Promise<string> {
  const { ok, data } = await fetchWithDebug("https://omega.alpha.africa/oauth/token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
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

async function refreshApiToken(): Promise<string> {
  const result = await query(`SELECT refresh_token FROM api_tokens WHERE id = 1`);
  const storedRefreshToken = result.rows[0]?.refresh_token;
  if (!storedRefreshToken) throw new Error("No stored refresh token found");

  const { ok, data } = await fetchWithDebug("https://omega.alpha.africa/oauth/token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: process.env.ALPHA_CLIENT_ID,
      client_secret: process.env.ALPHA_CLIENT_SECRET,
      refresh_token: storedRefreshToken,
    }),
  });
  if (!ok || !data.access_token) throw new Error(data.message || "Failed to refresh API token");
  await saveTokens(data.access_token, data.refresh_token, data.expires_in);
  return data.access_token;
}

async function getApiToken(): Promise<string> {
  const result = await query(`SELECT access_token, expires_at FROM api_tokens WHERE id = 1`);
  if (result.rows.length > 0) {
    const { access_token, expires_at } = result.rows[0];
    if (expires_at && new Date() < new Date(expires_at)) return access_token;
    try {
      return await refreshApiToken();
    } catch (err) {
      console.error("Token refresh failed, logging in again:", err);
    }
  }
  return await loginAndGetApiToken();
}

// --- Card API Functions ---
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

  const { ok, data } = await fetchWithDebug("https://omega.alpha.africa/alpha/cards/holder", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (!ok || !data?.data?.id) throw new Error(`Failed to create cardholder: ${JSON.stringify(data)}`);
  return data.data.id;
}

async function createCard(token: string, cardholderId: string) {
  const { ok, data } = await fetchWithDebug("https://omega.alpha.africa/alpha/cards/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ cardholder_id: cardholderId, purpose: "visacard-1" }),
  });

  if (!ok || !data?.data?.card?.id) throw new Error(`Failed to create card: ${JSON.stringify(data)}`);
  return data.data.card.id;
}

async function fundCard(token: string, cardId: string, amount: number) {
  const { ok, data } = await fetchWithDebug(`https://omega.alpha.africa/alpha/cards/fund/${cardId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  if (!ok) throw new Error(data.message || "Failed to fund card");
  return data;
}

async function getCardDetails(token: string, cardId: string) {
  const { ok, data } = await fetchWithDebug(`https://omega.alpha.africa/alpha/cards/details/${cardId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!ok || !data.data?.card) throw new Error(data.message || "Failed to get card details");
  return data.data.card;
}

async function deleteCardViaApi(token: string, cardId: string) {
  const { ok, data } = await fetchWithDebug(`https://omega.alpha.africa/alpha/cards/${cardId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!ok) throw new Error(data.message || "Failed to delete card via API");
  return data;
}

// --- User Management Functions ---
async function getAllUsers() {
  const result = await query(`SELECT id, first_name, last_name, email, role, cardholder_id FROM users ORDER BY created_at DESC`);
  return result.rows;
}

async function updateUser(userId: string, updates: any) {
  const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`).join(", ");
  const values = Object.values(updates);
  if (!fields) return;
  await query(`UPDATE users SET ${fields}, updated_at = NOW() WHERE id = $${values.length + 1}`, [...values, userId]);
}

async function deleteUser(userId: string) {
  await query(`DELETE FROM users WHERE id = $1`, [userId]);
}

// --- Top-up Management ---
async function recordTopup(userId: string, cardId: string, amount: number, status: string = "pending") {
  await query(`INSERT INTO topups (user_id, card_id, amount, status, created_at) VALUES ($1, $2, $3, $4, NOW())`, [userId, cardId, amount, status]);
}

async function markTopupCompleted(topupId: string) {
  await query(`UPDATE topups SET status = 'completed', updated_at = NOW() WHERE id = $1`, [topupId]);
}

async function getPendingTopups() {
  const result = await query(`SELECT * FROM topups WHERE status = 'pending' ORDER BY created_at DESC`);
  return result.rows;
}

// --- Sync Balances ---
async function syncAllBalances() {
  const apiToken = await getApiToken();
  const result = await query(`SELECT id FROM cards`);
  for (const card of result.rows) {
    const cardDetails = await getCardDetails(apiToken, card.id);
    await query(`UPDATE cards SET balance = $1 WHERE id = $2`, [parseFloat(cardDetails.balance), card.id]);
  }
}

// --- Handlers ---
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const users = await getAllUsers();
    const cards = await query("SELECT * FROM cards ORDER BY created_at DESC");
    const topups = await getPendingTopups();

    return NextResponse.json({ users, cards: cards.rows, pendingTopups: topups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    const user = verifyToken(token);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const apiToken = await getApiToken();

    switch (body.action) {
      case "create_card": {
        const { userId, purpose = "visacard-1", fundAmount = 0.1 } = body;
        if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

        const userResult = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
        if (!userResult.rows.length) return NextResponse.json({ error: "User not found" }, { status: 404 });
        const targetUser = userResult.rows[0];

        let cardholderId = targetUser.cardholder_id;
        if (!cardholderId) {
          cardholderId = await createCardholder(apiToken, targetUser, purpose);
          await query(`UPDATE users SET cardholder_id = $1, updated_at = NOW() WHERE id = $2`, [cardholderId, userId]);
        }

        const cardId = await createCard(apiToken, cardholderId);
        await fundCard(apiToken, cardId, fundAmount);

        const cardDetails = await getCardDetails(apiToken, cardId);
        await query(
          `INSERT INTO cards (id, user_id, number, cvv, expiry, balance, status, type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            cardDetails.id,
            userId,
            cardDetails.card_number,
            cardDetails.card_cvv,
            `${cardDetails.card_exp_month}/${cardDetails.card_exp_year}`,
            parseFloat(cardDetails.balance),
            cardDetails.state,
            cardDetails.brand,
          ]
        );

        return NextResponse.json({ message: "Card created and funded", card: cardDetails });
      }

      case "delete_card": {
        await deleteCardViaApi(apiToken, body.cardId);
        await query(`DELETE FROM cards WHERE id = $1`, [body.cardId]);
        return NextResponse.json({ success: true });
      }

      case "topup_card": {
        await fundCard(apiToken, body.cardId, body.amount);
        await query("UPDATE cards SET balance = balance + $1 WHERE id = $2", [body.amount, body.cardId]);
        await recordTopup(body.userId, body.cardId, body.amount, "completed");
        return NextResponse.json({ success: true });
      }

      case "sync_balances": {
        await syncAllBalances();
        return NextResponse.json({ success: true });
      }

      case "mark_topup_completed": {
        await markTopupCompleted(body.topupId);
        return NextResponse.json({ success: true });
      }

      case "delete_user": {
        await deleteUser(body.userId);
        return NextResponse.json({ success: true });
      }

      case "update_user": {
        await updateUser(body.userId, body.updates);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
