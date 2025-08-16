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
  Line
} from "@once-ui-system/core";

interface CardData {
  id: string;
  number: string;
  cvv: string;
  expiry: string;
  balance: number;
  status: string;
  type: string;
}

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  cardholder_id: string;
  cards: CardData[];
}

interface TopupData {
  id: string;
  user_id: number;
  card_id: string;
  amount: number;
  status: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fundAmount, setFundAmount] = useState<number>(0.1);
  const [pendingTopups, setPendingTopups] = useState<TopupData[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch admin data");
      const usersWithCards = data.users.map((user: any) => ({
        ...user,
        cards: data.cards.filter((c: any) => c.user_id === user.id),
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

  const performAction = async (action: string, payload: any) => {
    if (!token) return alert("No admin token found. Please log in.");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
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

  const formatAmount = (amt: any) => {
    const num = typeof amt === "number" ? amt : parseFloat(amt);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "active" ? "success" : 
                    status === "pending" ? "warning" : "destructive";
    return <Badge variant={variant}>{status}</Badge>;
  };

  // Simple loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <Column fillWidth padding="l" gap="l" style={{ minHeight: "100vh" }}>
      {/* Header Section */}
      <Row fillWidth justify="space-between" align="center">
        <Heading variant="display-strong-xl">Admin Dashboard</Heading>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </Row>

      {/* Controls Section */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Column gap="m">
          <Heading variant="heading-default-xl">Quick Actions</Heading>
          <Row gap="m" align="center">
            <Text>Amount:</Text>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              value={fundAmount}
              onChange={(e) => setFundAmount(parseFloat(e.target.value))}
              style={{ width: "120px" }}
            />
            <Button 
              variant="secondary" 
              onClick={() => performAction("sync_balances", {})}
            >
              Sync All Balances
            </Button>
          </Row>
        </Column>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Users Section */}
          <Column gap="m">
            <Heading variant="heading-default-xl">Users</Heading>
            <Column gap="m">
              {users.map(user => (
                <Card key={user.id} padding="l" radius="l" border="neutral-alpha-medium">
                  <Column gap="m">
                    <Row justify="space-between" align="center">
                      <Column gap="xs">
                        <Heading variant="heading-default-l">
                          {user.first_name} {user.last_name}
                        </Heading>
                        <Text onBackground="neutral-weak">{user.email}</Text>
                        <Text variant="label-default-s">ID: {user.id}</Text>
                      </Column>
                      <Row gap="s">
                        <Button 
                          variant="primary" 
                          onClick={() => performAction("create_card", { 
                            userId: user.id, 
                            fundAmount 
                          })}
                        >
                          Create Card
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => performAction("delete_user", { 
                            userId: user.id 
                          })}
                        >
                          Delete User
                        </Button>
                      </Row>
                    </Row>

                    {user.cards.length > 0 && (
                      <Column gap="s">
                        <Text variant="label-default-m">Cards:</Text>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left border-b border-neutral-alpha-medium">
                                <th className="p-3">Type</th>
                                <th className="p-3">Number</th>
                                <th className="p-3">Balance</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {user.cards.map(card => (
                                <tr key={card.id} className="border-b border-neutral-alpha-medium">
                                  <td className="p-3">{card.type}</td>
                                  <td className="p-3">•••• •••• •••• {card.number.slice(-4)}</td>
                                  <td className="p-3">${formatAmount(card.balance)}</td>
                                  <td className="p-3">{getStatusBadge(card.status)}</td>
                                  <td className="p-3">
                                    <Row gap="s">
                                      <Button 
                                        size="sm" 
                                        variant="primary" 
                                        onClick={() => performAction("topup_card", { 
                                          userId: user.id, 
                                          cardId: card.id, 
                                          amount: fundAmount 
                                        })}
                                      >
                                        Top-up
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive" 
                                        onClick={() => performAction("delete_card", { 
                                          cardId: card.id 
                                        })}
                                      >
                                        Delete
                                      </Button>
                                    </Row>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Column>
                    )}
                  </Column>
                </Card>
              ))}
            </Column>
          </Column>

          {/* Pending Top-ups Section */}
          {pendingTopups.length > 0 && (
            <Column gap="m">
              <Heading variant="heading-default-xl">Pending Top-ups</Heading>
              <Card padding="l" radius="l" border="neutral-alpha-medium">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-neutral-alpha-medium">
                        <th className="p-3">User ID</th>
                        <th className="p-3">Card ID</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTopups.map(topup => (
                        <tr key={topup.id} className="border-b border-neutral-alpha-medium">
                          <td className="p-3">{topup.user_id}</td>
                          <td className="p-3">{topup.card_id.slice(0, 8)}...</td>
                          <td className="p-3">${formatAmount(topup.amount)}</td>
                          <td className="p-3">{getStatusBadge(topup.status)}</td>
                          <td className="p-3">
                            <Button 
                              size="sm" 
                              variant="primary" 
                              onClick={() => performAction("mark_topup_completed", { 
                                topupId: topup.id 
                              })}
                            >
                              Mark Completed
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Column>
          )}
        </>
      )}
    </Column>
  );
}
