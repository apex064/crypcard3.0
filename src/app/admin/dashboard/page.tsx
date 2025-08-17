"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  Column,
  Row,
  Heading,
  Text,
  Badge,
} from "@once-ui-system/core";

interface CardData {
  id: string;
  number?: string;
  maskedNumber: string;
  cvv?: string;
  expiry?: string;
  balance: number;
  status: string;
  type: string;
  final_price?: number;
}

interface TopupData {
  id: number;
  user_id: number;
  amount: number | string;
  status: string;
  created_at: string;
}

interface UserData {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [topups, setTopups] = useState<TopupData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newCardUserId, setNewCardUserId] = useState<number | "">("");
  const [basePrice, setBasePrice] = useState(25);
  const [markup, setMarkup] = useState(0);
  const [profitMargin, setProfitMargin] = useState(5);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // --- Fetch all data ---
  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Cards
      const cardsRes = await fetch("/api/admin/cards", { headers: authHeader });
      const cardsData = await cardsRes.json();
      if (!cardsRes.ok) throw new Error(cardsData.error || "Failed to fetch cards");
      setCards(cardsData.cards || []);

      // Topups
      const topupsRes = await fetch("/api/admin/topups", { headers: authHeader });
      const topupsData = await topupsRes.json();
      if (!topupsRes.ok) throw new Error(topupsData.error || "Failed to fetch topups");
      const processedTopups = (topupsData.rows || topupsData || []).map((t: TopupData) => ({
        ...t,
        amount: Number(t.amount),
      }));
      setTopups(processedTopups);

      // Users
      const usersRes = await fetch("/api/admin/users", { headers: authHeader });
      const usersData = await usersRes.json();
      if (!usersRes.ok) throw new Error(usersData.error || "Failed to fetch users");
      setUsers(usersData.users || []);
    } catch (err: any) {
      alert(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- Card actions ---
  const createCard = async () => {
    if (!newCardUserId) return alert("Select a user to create a card");
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          user_id: newCardUserId,
          base_price: basePrice,
          markup,
          profit_margin: profitMargin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create card");
      alert("Card created!");
      setNewCardUserId("");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error creating card");
    }
  };

  const updateCard = async (card: CardData) => {
    try {
      const res = await fetch("/api/admin/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          id: card.id,
          base_price: basePrice,
          markup,
          profit_margin: profitMargin,
          status: card.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update card");
      alert("Card updated!");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error updating card");
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    try {
      const res = await fetch("/api/admin/cards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id: cardId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete card");
      alert("Card deleted!");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error deleting card");
    }
  };

  // --- Topup actions ---
  const updateTopupStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/admin/topups", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update topup");
      alert("Topup status updated!");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error updating topup");
    }
  };

  const deleteTopup = async (id: number) => {
    if (!confirm("Are you sure you want to delete this topup?")) return;
    try {
      const res = await fetch("/api/admin/topups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete topup");
      alert("Topup deleted!");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error deleting topup");
    }
  };

  // --- User actions ---
  const createUser = async () => {
    if (!newEmail || !newPassword) return alert("Email and password required");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          action: "create_user",
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      alert("User created!");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error creating user");
    }
  };

  const updateUserRole = async (userId: number, role: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          action: "update_user_role",
          userId,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      alert("User role updated!");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error updating role");
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ action: "delete_user", userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      alert("User deleted!");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error deleting user");
    }
  };

  // --- Helpers ---
  const getStatusBadge = (status: string) => {
    const variant =
      status.toLowerCase() === "approved"
        ? "success"
        : status.toLowerCase() === "rejected"
        ? "destructive"
        : "neutral";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variant = role === "admin" ? "success" : "neutral";
    return <Badge variant={variant}>{role}</Badge>;
  };

  const getCardStatusBadge = (status: string) => {
    const variant = status === "Active" ? "success" : status === "Pending" ? "warning" : "destructive";
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <Column fillWidth padding="l" gap="l">
      <Row justify="space-between" align="center">
        <Heading variant="display-strong-xl">Admin Dashboard</Heading>
        <Button variant="destructive" onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}>Logout</Button>
      </Row>

      {/* --- Cards Section --- */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Heading variant="heading-default-xl">Cards</Heading>
        <Row gap="m" align="center" marginTop="s">
          <select
            value={newCardUserId}
            onChange={(e) => setNewCardUserId(Number(e.target.value))}
            style={{ width: "200px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} (ID: {user.id})
              </option>
            ))}
          </select>
          <Input placeholder="Base Price" type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} style={{ width: "100px" }} />
          <Input placeholder="Markup" type="number" value={markup} onChange={e => setMarkup(Number(e.target.value))} style={{ width: "100px" }} />
          <Input placeholder="Profit Margin (%)" type="number" value={profitMargin} onChange={e => setProfitMargin(Number(e.target.value))} style={{ width: "120px" }} />
          <Button variant="primary" onClick={createCard}>Create</Button>
        </Row>

        {cards.map(card => (
          <Card key={card.id} padding="s" radius="l" border="neutral-alpha-medium" marginTop="s">
            <Row justify="space-between" align="center">
              <Text>{card.maskedNumber} | Type: {card.type} | Balance: ${card.balance}</Text>
              <Row gap="s">
                {getCardStatusBadge(card.status)}
                <Button size="sm" variant="primary" onClick={() => updateCard(card)}>Update</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteCard(card.id)}>Delete</Button>
              </Row>
            </Row>
          </Card>
        ))}
      </Card>

      {/* --- Topups Section --- */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Heading variant="heading-default-xl">Topups</Heading>
        {topups.map(topup => (
          <Card key={topup.id} padding="s" radius="l" border="neutral-alpha-medium" marginTop="s">
            <Row justify="space-between" align="center">
              <Text>ID: {topup.id} | User ID: {topup.user_id} | Amount: ${Number(topup.amount).toFixed(2)}</Text>
              <Row gap="s">
                {getStatusBadge(topup.status)}
                <select value={topup.status} onChange={(e) => updateTopupStatus(topup.id, e.target.value)} style={{ width: "120px" }}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button size="sm" variant="destructive" onClick={() => deleteTopup(topup.id)}>Delete</Button>
              </Row>
            </Row>
          </Card>
        ))}
      </Card>

      {/* --- Users Section --- */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Heading variant="heading-default-xl">Users</Heading>
        <Row gap="m" align="center" marginTop="s">
          <Input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ width: "200px" }} />
          <Input placeholder="Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "150px" }} />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ width: "120px" }}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <Button variant="primary" onClick={createUser}>Create</Button>
        </Row>

        {users.map(user => (
          <Card key={user.id} padding="s" radius="l" border="neutral-alpha-medium" marginTop="s">
            <Row justify="space-between" align="center">
              <Text>{user.email} | Created At: {new Date(user.created_at).toLocaleString()}</Text>
              <Row gap="s">
                {getRoleBadge(user.role)}
                <select value={user.role} onChange={(e) => updateUserRole(user.id, e.target.value)} style={{ width: "120px" }}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>Delete</Button>
              </Row>
            </Row>
          </Card>
        ))}
      </Card>
    </Column>
  );
}
