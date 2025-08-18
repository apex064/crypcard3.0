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

interface CardData { /* ... keep as is ... */ }
interface TopupData { /* ... keep as is ... */ }
interface UserData { /* ... keep as is ... */ }

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
      const cardsRes = await fetch("/api/admin/cards", { headers: authHeader });
      const cardsData = await cardsRes.json();
      if (!cardsRes.ok) throw new Error(cardsData.error || "Failed to fetch cards");
      setCards(cardsData.cards || []);

      const topupsRes = await fetch("/api/admin/topups", { headers: authHeader });
      const topupsData = await topupsRes.json();
      if (!topupsRes.ok) throw new Error(topupsData.error || "Failed to fetch topups");
      setTopups((topupsData.rows || topupsData || []).map((t: TopupData) => ({
        ...t,
        amount: Number(t.amount),
      })));

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

  useEffect(() => { fetchAll(); }, []);

  // --- Card actions ---
  const createCard = async () => { /* keep as is */ };
  const updateCard = async (card: CardData) => { /* keep as is */ };
  const deleteCard = async (cardId: string) => { /* keep as is */ };

  // --- Topup actions ---
  const updateTopupStatus = async (id: number, status: string) => { /* keep as is */ };
  const deleteTopup = async (id: number) => { /* keep as is */ };

  // --- User actions ---
  const createUser = async () => { /* keep as is */ };
  const updateUserRole = async (userId: string | number, role: string) => { /* keep as is */ };
  const deleteUser = async (userId: string | number) => { /* keep as is */ };

  // --- Helpers ---
  const getStatusBadge = (status: string) => { /* keep as is */ };
  const getRoleBadge = (role: string) => { /* keep as is */ };
  const getCardStatusBadge = (status: string) => { /* keep as is */ };

  return (
    <Column fillWidth padding="l" gap="l" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Row justify="space-between" align="center">
        <Heading variant="display-strong-xl">Admin Dashboard</Heading>
        <Button
          variant="destructive"
          onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}
        >
          Logout
        </Button>
      </Row>

      {/* --- Cards Section --- */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Heading variant="heading-default-xl">Cards</Heading>
        <Column gap="s" marginTop="s">
          {/* Card creation form */}
          <Row gap="m" align="center" wrap>
            <select
              value={newCardUserId}
              onChange={(e) => setNewCardUserId(e.target.value)}
              style={{ minWidth: "200px", padding: "6px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id.toString()}>
                  {user.email} (ID: {user.id})
                </option>
              ))}
            </select>
            <Input placeholder="Base Price" type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} style={{ width: "100px" }} />
            <Input placeholder="Markup" type="number" value={markup} onChange={e => setMarkup(Number(e.target.value))} style={{ width: "100px" }} />
            <Input placeholder="Profit Margin (%)" type="number" value={profitMargin} onChange={e => setProfitMargin(Number(e.target.value))} style={{ width: "120px" }} />
            <Button variant="primary" onClick={createCard} disabled={!newCardUserId}>Create</Button>
          </Row>

          {/* Existing cards list */}
          <Column gap="s" marginTop="s">
            {cards.map(card => (
              <Card key={card.id} padding="s" radius="l" border="neutral-alpha-medium">
                <Row justify="space-between" align="center" wrap>
                  <Text>{card.maskedNumber} | Type: {card.type} | Balance: ${card.balance}</Text>
                  <Row gap="s" wrap>
                    {getCardStatusBadge(card.status)}
                    <Button size="sm" variant="primary" onClick={() => updateCard(card)}>Update</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteCard(card.id)}>Delete</Button>
                  </Row>
                </Row>
              </Card>
            ))}
          </Column>
        </Column>
      </Card>

      {/* --- Topups Section --- */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Heading variant="heading-default-xl">Topups</Heading>
        <Column gap="s" marginTop="s">
          {topups.map(topup => (
            <Card key={topup.id} padding="s" radius="l" border="neutral-alpha-medium">
              <Row justify="space-between" align="center" wrap>
                <Text>ID: {topup.id} | User ID: {topup.user_id} | Amount: ${Number(topup.amount).toFixed(2)}</Text>
                <Row gap="s" wrap>
                  {getStatusBadge(topup.status)}
                  <select
                    value={topup.status}
                    onChange={(e) => updateTopupStatus(topup.id, e.target.value)}
                    style={{ minWidth: "120px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <Button size="sm" variant="destructive" onClick={() => deleteTopup(topup.id)}>Delete</Button>
                </Row>
              </Row>
            </Card>
          ))}
        </Column>
      </Card>

      {/* --- Users Section --- */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Heading variant="heading-default-xl">Users</Heading>
        <Column gap="s" marginTop="s">
          {/* User creation form */}
          <Row gap="m" align="center" wrap>
            <Input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ minWidth: "200px" }} />
            <Input placeholder="Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ minWidth: "150px" }} />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ minWidth: "120px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <Button variant="primary" onClick={createUser}>Create</Button>
          </Row>

          {/* Existing users list */}
          <Column gap="s" marginTop="s">
            {users.map(user => (
              <Card key={user.id} padding="s" radius="l" border="neutral-alpha-medium">
                <Row justify="space-between" align="center" wrap>
                  <Text>{user.email} | Created At: {new Date(user.created_at).toLocaleString()}</Text>
                  <Row gap="s" wrap>
                    {getRoleBadge(user.role)}
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      style={{ minWidth: "120px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>Delete</Button>
                  </Row>
                </Row>
              </Card>
            ))}
          </Column>
        </Column>
      </Card>
    </Column>
  );
}

