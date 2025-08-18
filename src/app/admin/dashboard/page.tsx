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
  Dialog,
  ThemeSwitcher,
  BarChart,
  LineChart
} from "@once-ui-system/core";

import Header from "@/components/Header3";

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

  // Topup Dialog states
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [topupAmount, setTopupAmount] = useState<number>(0);
  const [topupLoading, setTopupLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [cardsData, topupsData, usersData] = await Promise.all([
        safeFetchJson("/api/admin/cards", { headers: authHeader }),
        safeFetchJson("/api/admin/topups", { headers: authHeader }),
        safeFetchJson("/api/admin/users", { headers: authHeader })
      ]);

      setCards(cardsData.cards || []);
      
      const processedTopups = (topupsData.rows || topupsData || []).map((t: TopupData) => ({
        ...t,
        amount: Number(t.amount) || 0,
      }));
      setTopups(processedTopups);
      
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

  // Card actions
  const createCard = async () => {
    if (!newCardUserId) return alert("Select a user to create a card");
    try {
      await safeFetchJson("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          user_id: newCardUserId,
          base_price: Number(basePrice),
          markup: Number(markup),
          profit_margin: Number(profitMargin),
        }),
      });
      alert("Card created!");
      setNewCardUserId("");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error creating card");
    }
  };

  const updateCard = async (card: CardData) => {
    try {
      await safeFetchJson("/api/admin/cards", {
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
      alert("Card updated!");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error updating card");
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    try {
      await safeFetchJson("/api/admin/cards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id: cardId }),
      });
      alert("Card deleted!");
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error deleting card");
    }
  };

  const handleTopup = async () => {
    if (!selectedCardId || topupAmount <= 0) return alert("Select a card and enter a valid amount");
    setTopupLoading(true);
    try {
      await safeFetchJson("/api/admin/funding", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ cardId: selectedCardId, amount: topupAmount }),
      });
      alert(`Card topped up with $${topupAmount}`);
      setSelectedCardId("");
      setTopupAmount(0);
      setTopupDialogOpen(false);
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error topping up card");
    } finally {
      setTopupLoading(false);
    }
  };

  const updateTopupStatus = async (topupId: number, status: string) => {
    try {
      await safeFetchJson("/api/admin/topups", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id: topupId, status }),
      });
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error updating topup status");
    }
  };

  const deleteTopup = async (topupId: number) => {
    if (!confirm("Are you sure you want to delete this topup?")) return;
    try {
      await safeFetchJson("/api/admin/topups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id: topupId }),
      });
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error deleting topup");
    }
  };

  const updateUserRole = async (userId: string | number, role: string) => {
    try {
      await safeFetchJson("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id: userId, role }),
      });
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error updating user role");
    }
  };

  const deleteUser = async (userId: string | number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await safeFetchJson("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id: userId }),
      });
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Error deleting user");
    }
  };

  // Helpers
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

  // Chart data
  const topupChartData = [
    {
      label: "Topups",
      approved: topups.filter(t => t.status === "approved").length,
      pending: topups.filter(t => t.status === "pending").length,
      rejected: topups.filter(t => t.status === "rejected").length
    }
  ];

  const userChartData = [
    {
      label: "Users",
      admin: users.filter(u => u.role === "admin").length,
      user: users.filter(u => u.role === "user").length
    }
  ];

  const cardBalanceData = cards.map(card => ({
    date: new Date(),
    balance: Number(card.balance || 0)
  }));

  return (
    <Column fillWidth padding="l" gap="l">
      <Row justify="space-between" align="center">
        <Header />
        <ThemeSwitcher
          direction="row"
          padding="2"
          gap="2"
          background="surface"
          border="surface"
          radius="full"
          style={{ marginLeft: "auto" }}
        />
      </Row>

      <Badge variant="primary" style={{ borderRadius: "9999px", padding: "6px 16px", fontSize: "1.25rem" }}>
        Admin Dashboard
      </Badge>

      {/* Compact Charts Row */}
      <Row gap="m" align="stretch" style={{ height: "300px" }}>
        {/* Topups Status Chart */}
        <Card style={{ flex: 1, minWidth: "250px", padding: "12px" }}>
          <BarChart
            title="Topups Status"
            height="100%"
            series={[
              { key: "approved", color: "green" },
              { key: "pending", color: "yellow" },
              { key: "rejected", color: "red" }
            ]}
            data={topupChartData}
          />
        </Card>

        {/* Users Role Chart */}
        <Card style={{ flex: 1, minWidth: "250px", padding: "12px" }}>
          <BarChart
            title="Users"
            height="100%"
            series={[
              { key: "admin", color: "cyan" },
              { key: "user", color: "magenta" }
            ]}
            data={userChartData}
          />
        </Card>

        {/* Card Balances Chart */}
        <Card style={{ flex: 1, minWidth: "250px", padding: "12px" }}>
          <LineChart
            title="Card Balances"
            height="100%"
            series={[{ key: "balance", color: "aqua" }]}
            data={cardBalanceData}
          />
        </Card>
      </Row>

      {/* Topups & Users Section */}
      <Row gap="l" wrap="wrap">
        <Card padding="l" radius="l" border="neutral-alpha-medium" style={{ flex: 1, minWidth: "300px" }}>
          <Heading variant="heading-default-xl">Topups</Heading>
          <Column gap="s" marginTop="s">
            {topups.map(topup => (
              <Card key={topup.id} padding="s" radius="l" border="neutral-alpha-medium" style={{ width: "100%" }}>
                <Row justify="space-between" align="center" wrap="wrap">
                  <Text>ID: {topup.id} | User ID: {topup.user_id} | Amount: ${Number(topup.amount || 0).toFixed(2)}</Text>
                  <Row gap="s" wrap="wrap" marginTop="xs">
                    {getStatusTag(topup.status)}
                    <label htmlFor={`topup-status-${topup.id}`}>Status:</label>
                    <select
                      id={`topup-status-${topup.id}`}
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

        <Card padding="l" radius="l" border="neutral-alpha-medium" style={{ flex: 1, minWidth: "300px" }}>
          <Heading variant="heading-default-xl">Users</Heading>
          <Column gap="s" marginTop="s">
            {users.map(user => (
              <Card key={user.id} padding="s" radius="l" border="neutral-alpha-medium">
                <Row justify="space-between" align="center" wrap="wrap">
                  <Text>{user.email} | Created At: {new Date(user.created_at).toLocaleString()}</Text>
                  <Row gap="s" wrap="wrap" marginTop="xs">
                    {getRoleBadge(user.role)}
                    <label htmlFor={`user-role-${user.id}`}>Role:</label>
                    <select
                      id={`user-role-${user.id}`}
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

      {/* Cards Section */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Heading variant="heading-default-xl">Cards</Heading>
        <Row gap="m" align="center" marginTop="s" wrap="wrap">
          <select value={newCardUserId} onChange={(e) => setNewCardUserId(e.target.value)} style={{ minWidth: "10px", padding: "3px 2px", borderRadius: "6px", border: "0.5px solid #ccc" }}>
            <option value="">Select User</option>
            {users.map(user => <option key={user.id} value={user.id.toString()}>{user.email} (ID: {user.id})</option>)}
          </select>
          <Input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} placeholder="Base Price" style={{ width: "100px" }} />
          <Input type="number" value={markup} onChange={e => setMarkup(Number(e.target.value))} placeholder="Markup" style={{ width: "100px" }} />
          <Input type="number" value={profitMargin} onChange={e => setProfitMargin(Number(e.target.value))} placeholder="Profit Margin (%)" style={{ width: "120px" }} />
          <Button variant="primary" size="s" onClick={createCard} disabled={!newCardUserId}>Create</Button>
          <Button variant="success" size="s" onClick={() => setTopupDialogOpen(true)}>Top Up Card</Button>
        </Row>

        <Column gap="s" marginTop="s">
          {cards.map(card => (
            <Card key={card.id} padding="s" radius="l" border="neutral-alpha-medium">
              <Row justify="space-between" align="center" wrap="wrap">
                <Text>{card.maskedNumber} | Type: {card.type} | Balance: ${Number(card.balance || 0).toFixed(2)}</Text>
                <Row gap="s" wrap="wrap" marginTop="xs">
                  {getCardStatusTag(card.status)}
                  <Button size="s" variant="secondary" onClick={() => updateCard(card)}>Update</Button>
                  <Button size="s" variant="danger" onClick={() => deleteCard(card.id)}>Delete</Button>
                </Row>
              </Row>
            </Card>
          ))}
        </Column>
      </Card>

      {/* Topup Dialog */}
      <Dialog isOpen={topupDialogOpen} onClose={() => setTopupDialogOpen(false)} title="Top Up Card" description="Select a card and enter the amount to top up.">
        <Column fillWidth gap="s" marginTop="s">
          <select value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #ccc" }}>
            <option value="">Select Card</option>
            {cards.map(card => <option key={card.id} value={card.id}>{card.maskedNumber} | Balance: ${Number(card.balance || 0).toFixed(2)}</option>)}
          </select>
          <Input type="number" placeholder="Amount" value={topupAmount} onChange={(e) => setTopupAmount(Number(e.target.value))} style={{ width: "100%" }} />
          <Row gap="8">
            <Button variant="success" onClick={handleTopup} disabled={topupLoading}>{topupLoading ? "Processing..." : "Top Up"}</Button>
            <Button variant="tertiary" onClick={() => setTopupDialogOpen(false)} disabled={topupLoading}>Cancel</Button>
          </Row>
        </Column>
      </Dialog>

      {/* Logout Button */}
      <Row justify="flex-end" style={{ marginTop: "24px" }}>
        <Button
          variant="outline"
          size="m"
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
              window.location.href = "/admin/login";
            }
          }}
        >
          Logout
        </Button>
      </Row>
    </Column>
  );
}
