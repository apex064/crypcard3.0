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
  Select,
  Badge,
} from "@once-ui-system/core";

interface CardData {
  id: string;
  number: string;
  cvv?: string;
  expiry?: string;
  balance: number;
  status: string;
  type: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  cards: CardData[];
}

interface TopupData {
  id: string;
  user_id: number;
  card_id: string;
  amount: number;
  status: string;
}

const roles = ["user", "admin"];

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "cards" | "topups">("users");
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "user" });
  const [pendingTopups, setPendingTopups] = useState<TopupData[]>([]);
  const [fundAmount, setFundAmount] = useState<number>(0.1);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // --- Fetch all admin data ---
  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin", { headers: authHeader });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch admin data");

      // Ensure cards array exists
      const usersWithCards = (data.users || []).map((u: any) => ({
        ...u,
        cards: (data.cards || []).filter((c: any) => c.user_id === u.id),
      }));

      setUsers(usersWithCards);
      setPendingTopups(data.pendingTopups || []);
    } catch (err: any) {
      alert(err.message || "Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const formatAmount = (amt: any) => {
    const num = typeof amt === "number" ? amt : parseFloat(amt);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "active" ? "success" : status === "pending" ? "warning" : "destructive";
    return <Badge variant={variant}>{status}</Badge>;
  };

  // --- Actions ---
  const performAction = async (action: string, payload: any) => {
    if (!token) return alert("No admin token found. Please log in.");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`${action.replace("_", " ")} success!`);
        fetchAdminData();
      } else {
        alert(data.error || `${action} failed`);
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // --- Users CRUD ---
  const handleCreateUser = async () => {
    const safeRole = roles.includes(newUser.role) ? newUser.role : "user";
    await performAction("create_user", { ...newUser, role: safeRole });
    setNewUser({ username: "", email: "", password: "", role: "user" });
  };

  const handleUpdateRole = async (userId: number, role: string) => {
    const safeRole = roles.includes(role) ? role : "user";
    await performAction("update_user_role", { userId, role: safeRole });
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await performAction("delete_user", { userId });
  };

  // --- Loading Spinner ---
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <Column fillWidth padding="l" gap="l" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Row justify="space-between" align="center">
        <Heading variant="display-strong-xl">Admin Dashboard</Heading>
        <Button variant="destructive" onClick={handleLogout}>Logout</Button>
      </Row>

      {/* Tabs */}
      <Row gap="s">
        <Button variant={activeTab === "users" ? "primary" : "secondary"} onClick={() => setActiveTab("users")}>Users</Button>
        <Button variant={activeTab === "cards" ? "primary" : "secondary"} onClick={() => setActiveTab("cards")}>Cards</Button>
        <Button variant={activeTab === "topups" ? "primary" : "secondary"} onClick={() => setActiveTab("topups")}>Topups</Button>
      </Row>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Users Tab */}
          {activeTab === "users" && (
            <Column gap="l">
              {/* Create User */}
              <Card padding="l" radius="l" border="neutral-alpha-medium">
                <Column gap="m">
                  <Heading variant="heading-default-xl">Create New User</Heading>
                  <Row gap="m">
                    <Input placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                    <Input placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                    <Input placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                    <Select
                      value={roles.includes(newUser.role) ? newUser.role : "user"}
                      onValueChange={role => setNewUser({ ...newUser, role })}
                      style={{ width: "120px" }}
                    >
                      {roles.map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
                    </Select>
                    <Button variant="primary" onClick={handleCreateUser}>Create User</Button>
                  </Row>
                </Column>
              </Card>

              {/* Users List */}
              <Column gap="s">
                {users.map(user => (
                  <Card key={user.id} padding="l" radius="l" border="neutral-alpha-medium">
                    <Row justify="space-between" align="center">
                      <Column gap="xs">
                        <Text>{user.username}</Text>
                        <Text variant="label-default-s">{user.email}</Text>
                        <Text variant="label-default-s">ID: {user.id}</Text>
                      </Column>
                      <Row gap="s">
                        <Select
                          value={roles.includes(user.role) ? user.role : "user"}
                          onValueChange={role => handleUpdateRole(user.id, role)}
                          style={{ width: "120px" }}
                        >
                          {roles.map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
                        </Select>
                        <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                      </Row>
                    </Row>

                    {/* Cards */}
                    {user.cards.length > 0 && (
                      <Column gap="s" style={{ marginTop: "1rem" }}>
                        <Text variant="label-default-m">Cards:</Text>
                        {user.cards.map(card => (
                          <Card key={card.id} padding="s" radius="l" border="neutral-alpha-medium">
                            <Row justify="space-between" align="center">
                              <Text>{card.type} • •••• •••• •••• {card.number.slice(-4)} • Balance: ${formatAmount(card.balance)}</Text>
                              {getStatusBadge(card.status)}
                              <Row gap="s">
                                <Button size="sm" variant="primary" onClick={() => performAction("topup_card", { userId: user.id, cardId: card.id, amount: fundAmount })}>Top-up</Button>
                                <Button size="sm" variant="destructive" onClick={() => performAction("delete_card", { cardId: card.id })}>Delete</Button>
                              </Row>
                            </Row>
                          </Card>
                        ))}
                      </Column>
                    )}
                  </Card>
                ))}
              </Column>
            </Column>
          )}

          {/* Cards Tab */}
          {activeTab === "cards" && (
            <Column gap="s">
              {users.flatMap(u => u.cards).map(card => (
                <Card key={card.id} padding="l" radius="l" border="neutral-alpha-medium">
                  <Text>{card.type} • •••• •••• •••• {card.number.slice(-4)} • Balance: ${formatAmount(card.balance)}</Text>
                </Card>
              ))}
            </Column>
          )}

          {/* Topups Tab */}
          {activeTab === "topups" && (
            <Column gap="s">
              {pendingTopups.map(topup => (
                <Card key={topup.id} padding="l" radius="l" border="neutral-alpha-medium">
                  <Row justify="space-between" align="center">
                    <Text>User ID: {topup.user_id} | Card ID: {topup.card_id.slice(0, 8)}... | Amount: ${formatAmount(topup.amount)}</Text>
                    {getStatusBadge(topup.status)}
                    {topup.status === "pending" && (
                      <Button size="sm" variant="primary" onClick={() => performAction("mark_topup_completed", { topupId: topup.id })}>Mark Completed</Button>
                    )}
                  </Row>
                </Card>
              ))}
            </Column>
          )}
        </>
      )}
    </Column>
  );
}
