"use client";

import React, { useState, useEffect } from "react";

const API_URL = "/api/admin"; // adjust as needed

export default function AdminDashboard() {
  const [token, setToken] = useState(
    typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : ""
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [topups, setTopups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Simple login to get JWT token (simulate your real login API)
  async function loginAdmin(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem("admin_token", data.token);
      loadData(data.token);
    } catch (e) {
      setError(e.message || "Login failed");
    }
  }

  // Logout
  function logout() {
    setToken("");
    localStorage.removeItem("admin_token");
    setUsers([]);
    setCards([]);
    setTopups([]);
    setTransactions([]);
  }

  // Generic fetch helper with auth header
  async function fetchWithAuth(url, authToken) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken || token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch " + url);
    return await res.json();
  }

  // Load all data needed for dashboard
  async function loadData(authToken = token) {
    if (!authToken) return;
    setLoading(true);
    setError("");
    try {
      const [usersData, cardsData, topupsData, txData] = await Promise.all([
        fetchWithAuth(`${API_URL}?type=users`, authToken),
        fetchWithAuth(`${API_URL}?type=cards`, authToken),
        fetchWithAuth(`${API_URL}?type=topups`, authToken),
        fetchWithAuth(`${API_URL}?type=transactions`, authToken),
      ]);
      setUsers(usersData.users || []);
      setCards(cardsData.cards || []);
      setTopups(topupsData.topups || []);
      setTransactions(txData.transactions || []);
    } catch (e) {
      setError(e.message || "Failed to load data");
    }
    setLoading(false);
  }

  // Run loadData on mount if token present
  useEffect(() => {
    if (token) loadData();
  }, [token]);

  // Admin actions

  // Update user role
  async function updateUserRole(userId, newRole) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "update_user_role", userId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update user role");
      await loadData();
    } catch (e) {
      alert(e.message || "Failed to update user role");
    }
  }

  // Create card for user
  async function createCard(userId, userEmail, userPassword, purpose = "visacard-1") {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "create_card", userId, userEmail, userPassword, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create card");
      alert("Card created: " + data.card.id);
      await loadData();
    } catch (e) {
      alert(e.message || "Failed to create card");
    }
  }

  // Get card balance
  async function getCardBalance(cardId, userEmail, userPassword) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "get_card_balance", cardId, userEmail, userPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get balance");
      alert(`Card balance: $${data.balance}`);
      await loadData();
    } catch (e) {
      alert(e.message || "Failed to get balance");
    }
  }

  // Change card status
  async function changeCardStatus(cardId, status, userEmail, userPassword) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "change_card_status", cardId, status, userEmail, userPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change status");
      alert(`Card status changed to ${data.status}`);
      await loadData();
    } catch (e) {
      alert(e.message || "Failed to change card status");
    }
  }

  // Update topup status
  async function updateTopupStatus(txid, status) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "update_topup_status", txid, status }),
      });
      if (!res.ok) throw new Error("Failed to update topup status");
      await loadData();
    } catch (e) {
      alert(e.message || "Failed to update topup status");
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto p-4 mt-10">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={loginAdmin}>
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
            className="border p-2 w-full mb-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            className="border p-2 w-full mb-3"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Login
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* USERS */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Role</th>
              <th className="border px-2 py-1">Created At</th>
              <th className="border px-2 py-1">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-2 py-1">{u.id}</td>
                <td className="border px-2 py-1">{u.email}</td>
                <td className="border px-2 py-1">{u.role}</td>
                <td className="border px-2 py-1">{new Date(u.created_at).toLocaleString()}</td>
                <td className="border px-2 py-1">
                  <select
                    value={u.role}
                    onChange={(e) => updateUserRole(u.id, e.target.value)}
                    className="border p-1"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* CARDS */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cards</h2>
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">User ID</th>
              <th className="border px-2 py-1">Number</th>
              <th className="border px-2 py-1">Balance</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id}>
                <td className="border px-2 py-1">{c.id}</td>
                <td className="border px-2 py-1">{c.user_id}</td>
                <td className="border px-2 py-1">{c.maskedNumber}</td>
                <td className="border px-2 py-1">${c.balance.toFixed(2)}</td>
                <td className="border px-2 py-1">{c.status}</td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    onClick={() => {
                      const email = prompt("Enter user email for API login:");
                      const pass = prompt("Enter user password for API login:");
                      if (email && pass) getCardBalance(c.id, email, pass);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Get Balance
                  </button>
                  <button
                    onClick={() => {
                      const email = prompt("Enter user email for API login:");
                      const pass = prompt("Enter user password for API login:");
                      if (email && pass) {
                        const newStatus = c.status === "Active" ? "deactivate" : "activate";
                        changeCardStatus(c.id, newStatus, email, pass);
                      }
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    {c.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mt-4 font-semibold">Create Card</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const userId = e.target.userId.value;
            const userEmail = e.target.userEmail.value;
            const userPassword = e.target.userPassword.value;
            const purpose = e.target.purpose.value;
            if (!userId || !userEmail || !userPassword) {
              alert("Please fill all fields");
              return;
            }
            await createCard(userId, userEmail, userPassword, purpose);
            e.target.reset();
          }}
          className="space-x-2 mt-2"
        >
          <input name="userId" placeholder="User ID" className="border p-1" required />
          <input
            name="userEmail"
            type="email"
            placeholder="User Email"
            className="border p-1"
            required
          />
          <input
            name="userPassword"
            type="password"
            placeholder="User Password"
            className="border p-1"
            required
          />
          <input
            name="purpose"
            placeholder="Purpose (default visacard-1)"
            className="border p-1"
            defaultValue="visacard-1"
          />
          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
            Create Card
          </button>
        </form>
      </section>

      {/* TOPUPS */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Top-ups</h2>
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">TxID</th>
              <th className="border px-2 py-1">User ID</th>
              <th className="border px-2 py-1">Card ID</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Created At</th>
              <th className="border px-2 py-1">Change Status</th>
            </tr>
          </thead>
          <tbody>
            {topups.map((t) => (
              <tr key={t.txid || t.id}>
                <td className="border px-2 py-1">{t.txid || "N/A"}</td>
                <td className="border px-2 py-1">{t.user_id}</td>
                <td className="border px-2 py-1">{t.card_id}</td>
                <td className="border px-2 py-1">${t.amount}</td>
                <td className="border px-2 py-1">{t.status}</td>
                <td className="border px-2 py-1">{new Date(t.created_at).toLocaleString()}</td>
                <td className="border px-2 py-1">
                  <select
                    value={t.status}
                    onChange={(e) => updateTopupStatus(t.txid, e.target.value)}
                    className="border p-1"
                  >
                    <option value="pending">pending</option>
                    <option value="completed">completed</option>
                    <option value="failed">failed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* TRANSACTIONS */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Transactions</h2>
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Time</th>
              <th className="border px-2 py-1">Card</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="border px-2 py-1">{t.id}</td>
                <td className="border px-2 py-1">{t.type}</td>
                <td className="border px-2 py-1">{t.description}</td>
                <td className="border px-2 py-1">${t.amount.toFixed(2)}</td>
                <td className="border px-2 py-1">{t.status}</td>
                <td className="border px-2 py-1">{t.date}</td>
                <td className="border px-2 py-1">{t.time}</td>
                <td className="border px-2 py-1">{t.card || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

