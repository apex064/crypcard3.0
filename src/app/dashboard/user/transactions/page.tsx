"use client";

import React, { useState, useEffect } from "react";
import {
  Column,
  Flex,
  Card,
  Heading,
  Text,
  Badge,
  Icon,
} from "@once-ui-system/core";
import { ArrowUpCircle, ArrowDownCircle, Receipt } from "lucide-react";
import Header from "@/components/Header";

type Transaction = {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  card?: string;
};

export default function TransactionsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) window.location.href = "/login";
    else setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setTransactions(data.transactions ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTransactions();
  }, [token]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge variant="success">{status}</Badge>;
      case "pending":
        return <Badge variant="warning">{status}</Badge>;
      case "failed":
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string, description: string) => {
    if (type === "topup") return <ArrowUpCircle />;
    if (description.toLowerCase().includes("refund")) return <ArrowDownCircle />;
    return <Receipt />;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Column
      fillWidth
      fillHeight
      gap="l"
      padding="l"
      style={{ minHeight: "100vh", background: "var(--color-background)" }}
    >
      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* Transactions Header as Pill */}
      <Flex align="center" style={{ marginBottom: "1rem" }}>
        <Badge
          variant="contrast"
          size="m"
          style={{ borderRadius: "50px", padding: "0.5rem 1.5rem" }}
        >
          Transactions
        </Badge>
      </Flex>

      {/* Transactions List */}
      <Column gap="m">
        {transactions.length === 0 ? (
          <Column align="center" gap="m" style={{ marginTop: "2rem" }}>
            <Icon icon={Receipt} size="xl" />
            <Text>No transactions found.</Text>
          </Column>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id} radius="xl" shadow="xl" padding="l">
              <Flex justify="space-between" align="center">
                <Flex align="center" gap="m">
                  <Card radius="xl" padding="s">
                    {getTransactionIcon(tx.type, tx.description)}
                  </Card>
                  <Column>
                    <Text>{tx.description}</Text>
                    <Text variant="label-default-s">{tx.date} • Card {tx.card ?? "N/A"}</Text>
                  </Column>
                </Flex>
                <Column align="end">
                  <Text style={{ color: tx.amount > 0 ? "#4ade80" : "#f87171" }}>
                    {tx.amount > 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                  </Text>
                  {getStatusBadge(tx.status)}
                </Column>
              </Flex>
            </Card>
          ))
        )}
      </Column>
    </Column>
  );
}
