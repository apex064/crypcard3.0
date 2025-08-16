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
    fetchCards();
    fetchHistory();
  }, [token]);

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

  const copyWalletAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy wallet address", err);
    }
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId || !topupAmount || !txid)
      return alert("Please fill all fields");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardId,
          amount: parseFloat(topupAmount),
          txid,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Top-up failed");
      alert(data.message || "Top-up submitted!");
      setTopupAmount("");
      setTxid("");
      setCardId("");
      fetchHistory();
    } catch (err: any) {
      alert(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "failed":
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1rem",
    width: "100%",
  };

  return (
    <Column fillWidth fillHeight gap="l" padding="l" style={{ minHeight: "100vh" }}>
      <Header />

      {/* Top-Up Title Pill */}
      <Flex align="center" style={{ marginBottom: "0.5rem" }}>
        <Badge
          variant="contrast"
          size="m"
          style={{ borderRadius: "50px", padding: "0.5rem 1.5rem" }}
        >
          Top Up
        </Badge>
      </Flex>
      <Text>Add funds to your virtual cards using USDT TRC20</Text>

      {/* Cards & Form */}
      <Flex gap="l" wrap="wrap" style={{ marginTop: "1rem", justifyContent: "space-between" }}>
        {/* Cards Section */}
        <Column style={{ flex: "1 1 400px", minWidth: "300px" }} gap="m">
          <Flex align="center" gap="s" style={{ marginBottom: "0.5rem" }}>
            <Badge
              variant="contrast"
              style={{ borderRadius: "50px", padding: "0.25rem 1rem" }}
            >
              Select Card
            </Badge>
          </Flex>
          <div style={gridStyle}>
            {cards.map((card) => (
              <Card
                key={card.id}
                radius="2xl"
                padding="m"
                shadow="l"
                style={{
                  aspectRatio: "1.586",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background:
                    "linear-gradient(135deg, var(--color-background-default) 0%, var(--color-background-subtle) 100%)",
                  cursor: "pointer",
                  border:
                    cardId === card.id
                      ? "2px solid var(--color-primary-default)"
                      : "none",
                  width: "100%",
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
                <Text>
                  Balance: $
                  {isNaN(Number(card.balance)) ? "0.00" : Number(card.balance).toFixed(2)}
                </Text>
              </Card>
            ))}
          </div>
        </Column>

        {/* Top-Up Form */}
        <Column style={{ flex: "1 1 400px", minWidth: "300px" }} gap="m">
          <Card radius="xl" padding="l" shadow="xl">
            <Flex align="center" gap="s">
              <ArrowUpCircle size={24} />
              <Heading variant="title-strong-m">Add Funds</Heading>
            </Flex>

            <form onSubmit={handleTopupSubmit}>
              <Column gap="m" style={{ marginTop: "1rem" }}>
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
                      {card.maskedNumber} ($
                      {isNaN(Number(card.balance))
                        ? "0.00"
                        : Number(card.balance).toFixed(2)}
                      )
                    </option>
                  ))}
                </select>

                <Text>Amount (USD)</Text>
                <Input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min={10}
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
                <Input value={txid} onChange={(e) => setTxid(e.target.value)} />

                <Button type="submit" fillWidth disabled={loading}>
                  {loading ? "Submitting..." : "Submit Top-Up"}
                </Button>
              </Column>
            </form>
          </Card>
        </Column>
      </Flex>

      {/* Top-Up History Pill */}
      <Flex align="center" style={{ marginTop: "2rem", marginBottom: "0.5rem" }}>
        <Badge
          variant="contrast"
          size="m"
          style={{ borderRadius: "50px", padding: "0.5rem 1.5rem" }}
        >
          Top-Up History
        </Badge>
      </Flex>

      <div style={{ ...gridStyle, gridTemplateColumns: "1fr" }}>
        {history.length === 0 && <Text>No top-ups yet.</Text>}
        {history.map((h) => (
          <Card key={h.id} radius="xl" padding="m" shadow="l" style={{ width: "100%" }}>
            <Flex justify="space-between" align="flex-start">
              <Column>
                <Text>
                  ${isNaN(Number(h.amount)) ? "0.00" : Number(h.amount).toFixed(2)} USDT
                </Text>
                <Text variant="label-default-s">
                  {new Date(h.created_at).toLocaleString()}
                </Text>
                <Text variant="label-default-s" style={{ fontFamily: "monospace" }}>
                  {h.txid.substring(0, 20)}...
                </Text>
              </Column>
              <Column justify="center" style={{ alignItems: "flex-end" }}>
                {getStatusBadge(h.status)}
              </Column>
            </Flex>
          </Card>
        ))}
      </div>
    </Column>
  );
}
