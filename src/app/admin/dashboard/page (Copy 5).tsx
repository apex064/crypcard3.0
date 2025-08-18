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
  Tag,
} from "@once-ui-system/core";

interface CardData {
  id: string;
  number?: string;
  maskedNumber: string;
  cvv?: string;
  expiry?: string;
  balance: number | string;
  status: string;
  type: string;
  final_price?: number;
}

interface TopupData {
  id: number;
  user_id: string | number;
  amount: number | string;
  status: string;
  created_at: string;
}

interface UserData {
  id: string | number;
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
  const [newCardUserId, setNewCardUserId] = useState<string>("");
  const [basePrice, setBasePrice] = useState(25);
  const [markup, setMarkup] = useState(0);
  const [profitMargin, setProfitMargin] = useState(5);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const cardsRes = await fetch("/api/admin/cards", { headers: authHeader });
      const cardsData = await cardsRes.json();
      if (!cardsRes.ok) throw new Error(cardsData.error || "Failed to fetch cards");
      setCards(cardsData.cards || []);

      const topupsRes = await fetch("/api/admin/topups", { headers: authHeader });
      const topupsData = await topupsRes.json();
      if (!topupsRes.ok) throw new Error(topupsData.error || "Failed to fetch topups");
      const processedTopups = (topupsData.rows || topupsData || []).map((t: TopupData) => ({
        ...t,
        amount: Number(t.amount) || 0,
      }));
      setTopups(processedTopups);

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
          base_price: Number(basePrice),
          markup: Number(markup),
          profit_margin: Number(profitMargin),
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
          base_price: Number(basePrice),
          markup: Number(markup),
          profit_margin: Number(profitMargin),
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
  const updateUserRole = async (userId: string | number, role: string) => {
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

  const deleteUser = async (userId: string | number) => {
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
  const getStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Tag variant="success" label="Approved" prefixIcon="check" />;
      case "rejected":
        return <Tag variant="danger" label="Rejected" suffixIcon="x" />;
      default:
        return <Tag variant="brand" label="Pending" />;
    }
  };

  const getCardStatusTag = (status: string) => {
    switch (status) {
      case "Active":
        return <Tag variant="success" label="Active" prefixIcon="check" />;
      case "Pending":
        return <Tag variant="brand" label="Pending" />;
      default:
        return <Tag variant="danger" label="Inactive" suffixIcon="x" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variant = role === "admin" ? "success" : "neutral";
    return <Badge variant={variant}>{role}</Badge>;
  };

  return (
    <Column fillWidth padding="l" gap="l">
      <Badge variant="primary" style={{ borderRadius: "9999px", padding: "6px 16px", fontSize: "1.25rem" }}>
        Admin Dashboard
      </Badge>

      {/* --- Topups & Users Side by Side --- */}
      <Row gap="l" wrap="wrap">
        {/* Topups */}
        <Card padding="l" radius="l" border="neutral-alpha-medium" style={{ flex: 1, minWidth: "300px" }}>
          <Heading variant="heading-default-xl">Topups</Heading>
          <Column gap="s" marginTop="s">
            {topups.map(topup => (
              <Card key={topup.id} padding="s" radius="l" border="neutral-alpha-medium" style={{ width: "100%" }}>
                <Row justify="space-between" align="center" wrap="wrap">
                  <Text>ID: {topup.id} | User ID: {topup.user_id} | Amount: ${Number(topup.amount || 0).toFixed(2)}</Text>
                  <Row gap="s" wrap="wrap" marginTop="xs">
                    {getStatusTag(topup.status)}
                    <select
                      value={topup.status}
                      onChange={(e) => updateTopupStatus(topup.id, e.target.value)}
                      style={{ width: "120px", padding: "4px 6px", borderRadius: "6px", border: "1px solid #ccc" }}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <Button size="s" weight="default" variant="danger" onClick={() => deleteTopup(topup.id)}>Delete</Button>
                  </Row>
                </Row>
              </Card>
            ))}
          </Column>
        </Card>

        {/* Users */}
        <Card padding="l" radius="l" border="neutral-alpha-medium" style={{ flex: 1, minWidth: "300px" }}>
          <Heading variant="heading-default-xl">Users</Heading>
          <Column gap="s" marginTop="s">
            {users.map(user => (
              <Card key={user.id} padding="s" radius="l" border="neutral-alpha-medium">
                <Row justify="space-between" align="center" wrap="wrap">
                  <Text>{user.email} | Created At: {new Date(user.created_at).toLocaleString()}</Text>
                  <Row gap="s" wrap="wrap" marginTop="xs">
                    {getRoleBadge(user.role)}
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      style={{ minWidth: "120px", padding: "4px 6px", borderRadius: "6px", border: "1px solid #ccc" }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button size="s" weight="default" variant="danger" onClick={() => deleteUser(user.id)}>Delete</Button>
                  </Row>
                </Row>
              </Card>
            ))}
          </Column>
        </Card>
      </Row>

      {/* --- Cards Section --- */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Heading variant="heading-default-xl">Cards</Heading>
        <Row gap="m" align="center" marginTop="s" wrap="wrap">
          <select
            value={newCardUserId}
            onChange={(e) => setNewCardUserId(e.target.value)}
            style={{ minWidth: "10px", padding: "3px 2px", borderRadius: "6px", border: "0.5px solid #ccc" }}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id.toString()}>
                {user.email} (ID: {user.id})
              </option>
            ))}
          </select>
          <Input placeholder="Base Price" type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} style={{ width: "100px" }} />
          <Input placeholder="Markup" type="number" value={markup} onChange={e => setMarkup(Number(e.target.value))} style={{ width: "100px" }} />
          <Input placeholder="Profit Margin (%)" type="number" value={profitMargin} onChange={e => setProfitMargin(Number(e.target.value))} style={{ width: "120px" }} />
          <Button size="s" weight="default" variant="primary" onClick={createCard} disabled={newCardUserId === ""}>Create</Button>
        </Row>

        <Column gap="s" marginTop="s">
          {cards.map(card => (
            <Card key={card.id} padding="s" radius="l" border="neutral-alpha-medium">
              <Row justify="space-between" align="center" wrap="wrap">
                <Text>{card.maskedNumber} | Type: {card.type} | Balance: ${Number(card.balance || 0).toFixed(2)}</Text>
                <Row gap="s" wrap="wrap" marginTop="xs">
                  {getCardStatusTag(card.status)}
                  <Button size="s" weight="default" variant="secondary" onClick={() => updateCard(card)}>Update</Button>
                  <Button size="s" weight="default" variant="danger" onClick={() => deleteCard(card.id)}>Delete</Button>
                </Row>
              </Row>
            </Card>
          ))}
        </Column>
      </Card>

      {/* --- Logout Button at the bottom --- */}
      <Row justify="center" marginTop="l">
        <Button
          size="s"
          weight="default"
          variant="tertiary"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/admin/login";
          }}
        >
          Logout
        </Button>
      </Row>
    </Column>
  );
}

