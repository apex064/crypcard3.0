"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Column,
  Row,
  Heading,
  Text,
  Badge,
} from "@once-ui-system/core";

interface TopupData {
  id: number;
  user_id: number;
  amount: number | string; // can be string from DB
  status: string;
  created_at: string;
}

export default function AdminTopupsPage() {
  const [topups, setTopups] = useState<TopupData[]>([]);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // --- Fetch all topups ---
  const fetchTopups = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/topups", { headers: authHeader });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch topups");

      // ensure amounts are numbers
      const processed = (data.rows || data || []).map((t: TopupData) => ({
        ...t,
        amount: Number(t.amount),
      }));
      setTopups(processed);
    } catch (err: any) {
      alert(err.message || "Error fetching topups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopups();
  }, []);

  // --- Actions ---
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
      fetchTopups();
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
      fetchTopups();
    } catch (err: any) {
      alert(err.message || "Error deleting topup");
    }
  };

  const getStatusBadge = (status: string) => {
    const variant =
      status.toLowerCase() === "approved"
        ? "success"
        : status.toLowerCase() === "rejected"
        ? "destructive"
        : "neutral";
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <Column fillWidth padding="l" gap="l">
      <Row justify="space-between" align="center">
        <Heading variant="display-strong-xl">Admin Topups</Heading>
        <Button
          variant="destructive"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
        >
          Logout
        </Button>
      </Row>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Column gap="s">
          {topups.length === 0 && <Text>No topups found.</Text>}
          {topups.map((topup) => (
            <Card key={topup.id} padding="l" radius="l" border="neutral-alpha-medium">
              <Row justify="space-between" align="center">
                <Column gap="xs">
                  <Text>ID: {topup.id} | User ID: {topup.user_id}</Text>
                  <Text>Amount: ${Number(topup.amount).toFixed(2)}</Text>
                  <Text>Created At: {new Date(topup.created_at).toLocaleString()}</Text>
                </Column>
                <Row gap="s" align="center">
                  {getStatusBadge(topup.status)}
                  <select
                    value={topup.status}
                    onChange={(e) => updateTopupStatus(topup.id, e.target.value)}
                    style={{ width: "150px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <Button size="sm" variant="destructive" onClick={() => deleteTopup(topup.id)}>
                    Delete
                  </Button>
                </Row>
              </Row>
            </Card>
          ))}
        </Column>
      )}
    </Column>
  );
}
