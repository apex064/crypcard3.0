"use client";

import React, { useState, useEffect } from "react";
import {
  Column,
  Flex,
  Card,
  Heading,
  Text,
  Button,
  Input,
  Badge,
} from "@once-ui-system/core";
import { ArrowUpCircle, Copy, CheckCircle } from "lucide-react";
import Header from "@/components/Header";

type CardType = {
  id: string;
  number: string;
  maskedNumber: string;
  cvv: string;
  balance: number | string;
  status: string;
  type: string;
  created_at: string;
};

type TopupHistoryType = {
  id: string;
  amount: number | string;
  txid: string;
  status: string;
  created_at: string;
};

export default function TopUpPage() {
  const [token, setToken] = useState<string | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [cardId, setCardId] = useState("");
  const [topupAmount, setTopupAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [walletCopied, setWalletCopied] = useState(false);
  const [history, setHistory] = useState<TopupHistoryType[]>([]);
  const [loading, setLoading] = useState(false);

  const walletAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) window.location.href = "/login";
    else setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchCards = async () => {
      try {
        const res = await fetch("/api/cards", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCards(data.cards ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/topup/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHistory(data.data ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCards();
    fetchHistory();
  }, [token]);

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("User not authenticated");
    if (!cardId) return alert("Select a card.");
    if (!topupAmount || parseFloat(topupAmount) < 10) return alert("Minimum top-up is $10.");
    if (!txid.trim()) return alert("TXID required.");

    setLoading(true);
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId, amount: parseFloat(topupAmount), txid }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Top-up submitted!");
        setTopupAmount("");
        setTxid("");
        setCardId("");
        const updated = await fetch("/api/topup/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedData = await updated.json();
        setHistory(updatedData.data ?? []);
      } else alert("Error: " + (data.error ?? "Unknown"));
    } catch (err) {
      alert("Failed to submit top-up: " + err);
    } finally {
      setLoading(false);
    }
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
  };

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

  return (
    <Column fillWidth fillHeight gap="l" padding="l" style={{ minHeight: "100vh" }}>
      <Header />

      {/* Cards Section */}
      <Flex gap="l" wrap="wrap" fillWidth>
        <Column style={{ flex: "1 1 100%", gap: "m" }}>
          <Heading variant="title-strong-l">My Cards</Heading>
          {cards.length === 0 ? (
            <Text>No cards found.</Text>
          ) : (
            <Column gap="m">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  radius="3xl"
                  padding="m"
                  shadow="l"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    width: "100%",
                    cursor: "pointer",
                    background:
                      "linear-gradient(135deg, var(--color-background-default) 0%, var(--color-background-subtle) 100%)",
                  }}
                  onClick={() => setCardId(card.id)}
                >
                  <Flex justify="space-between">
                    <Badge variant={card.type === "Premium" ? "success" : "primary"}>
                      {card.type}
                    </Badge>
                    <Badge variant={card.status === "active" ? "success" : "warning"}>
                      {card.status}
                    </Badge>
                  </Flex>
                  <Heading variant="title-strong-s">{card.maskedNumber}</Heading>
                  <Text>Balance: ${isNaN(Number(card.balance)) ? "0.00" : Number(card.balance).toFixed(2)}</Text>
                </Card>
              ))}
            </Column>
          )}
        </Column>

        {/* Top-Up Form */}
        <Column style={{ flex: "1 1 100%", gap: "m" }}>
          <Heading variant="title-strong-l">Top Up</Heading>
          <Card radius="3xl" padding="l" shadow="xl">
            <form onSubmit={handleTopupSubmit}>
              <Column gap="m">
                <Text>Select Card</Text>
                <select
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "1rem",
                    border: "1px solid var(--color-border-default)",
                  }}
                >
                  <option value="">-- Select a card --</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.maskedNumber} (${isNaN(Number(card.balance)) ? "0.00" : Number(card.balance).toFixed(2)})
                    </option>
                  ))}
                </select>

                <Text>Amount (USD)</Text>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min={10}
                  required
                />

                <Text>Wallet Address</Text>
                <Flex gap="s" align="center">
                  <Text
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "1rem",
                      background: "var(--color-background-subtle)",
                      wordBreak: "break-all",
                    }}
                  >
                    {walletAddress}
                  </Text>
                  <Button onClick={copyWalletAddress} variant="outline">
                    {walletCopied ? <CheckCircle /> : <Copy />}
                  </Button>
                </Flex>

                <Text>Transaction ID (TXID)</Text>
                <Input
                  type="text"
                  placeholder="Enter transaction ID"
                  value={txid}
                  onChange={(e) => setTxid(e.target.value)}
                  required
                />

                <Button type="submit" fillWidth disabled={loading}>
                  {loading ? "Submitting..." : "Submit Top-Up"}
                </Button>
              </Column>
            </form>
          </Card>
        </Column>
      </Flex>

      {/* Top-Up History */}
      <Column gap="m" style={{ marginTop: "2rem", width: "100%" }}>
        <Heading variant="title-strong-l">Top-Up History</Heading>
        <Column gap="m">
          {history.length === 0 ? (
            <Text>No top-ups yet.</Text>
          ) : (
            history.map((h) => (
              <Card
                key={h.id}
                radius="3xl"
                padding="m"
                shadow="l"
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Column>
                  <Text style={{ fontWeight: 600 }}>
                    ${isNaN(Number(h.amount)) ? "0.00" : Number(h.amount).toFixed(2)} USDT
                  </Text>
                  <Text variant="label-default-s">{new Date(h.created_at).toLocaleString()}</Text>
                  <Text variant="label-default-s" style={{ fontFamily: "monospace" }}>
                    TXID: {h.txid.substring(0, 20)}...
                  </Text>
                </Column>
                <div>{getStatusBadge(h.status)}</div>
              </Card>
            ))
          )}
        </Column>
      </Column>
    </Column>
  );
}
