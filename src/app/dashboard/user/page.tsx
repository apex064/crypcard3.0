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
  Icon,
  Badge,
} from "@once-ui-system/core";
import {
  CreditCard,
  Plus,
  ArrowUpCircle,
  Copy,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/Header";

type CardType = {
  id: string;
  number: string;
  maskedNumber: string;
  cvv: string;
  balance: number;
  status: string;
  type: string;
  created_at: string;
};

export default function UserDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [cardId, setCardId] = useState("");
  const [walletCopied, setWalletCopied] = useState(false);
  const [cards, setCards] = useState<CardType[]>([]);

  const walletAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";

  // --- Authentication ---
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) window.location.href = "/login";
    else setToken(storedToken);
  }, []);

  // --- Fetch Cards ---
  useEffect(() => {
    if (!token) return;
    const fetchCards = async () => {
      try {
        const res = await fetch("/api/cards", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch cards");
        const data = await res.json();
        setCards(data.cards ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCards();
  }, [token]);

  // --- Request New Card ---
  const handleRequestCard = async () => {
    if (!token) return alert("User not authenticated");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Card request submitted!");
        const updatedRes = await fetch("/api/cards", { headers: { Authorization: `Bearer ${token}` } });
        const updatedData = await updatedRes.json();
        if (updatedRes.ok) setCards(updatedData.cards);
      } else alert("Error: " + (data.error ?? "Unknown"));
    } catch (err) {
      alert("Failed to request card: " + err);
    }
  };

  // --- Submit Top-Up ---
  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("User not authenticated");
    if (!cardId) return alert("Select a card.");
    if (!topupAmount || parseFloat(topupAmount) < 10) return alert("Minimum top-up is $10.");
    if (!txid.trim()) return alert("TXID required.");

    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(topupAmount), txid, cardId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Top-up submitted!");
        setTopupAmount("");
        setTxid("");
        setCardId("");
      } else alert("Error: " + (data.error ?? "Unknown"));
    } catch (err) {
      alert("Failed to submit top-up: " + err);
    }
  };

  // --- Copy Wallet ---
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
  };

  // --- Logout ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Column fillWidth fillHeight gap="l" padding="l" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* Section Header */}
      <Flex align="center" gap="s" style={{ marginBottom: "0.5rem" }}>
        <Badge variant="contrast" size="m">
          My Cards
        </Badge>
      </Flex>

      {/* Cards & Top-Up Section */}
      <Flex gap="l" wrap="wrap" fillWidth>
        {/* Cards Section */}
        <Column style={{ flex: "1 1 350px" }} gap="m">
          {cards.length === 0 ? (
            <Text>No cards found.</Text>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1rem",
              }}
            >
              {cards.map((card) => (
                <Card
                  key={card.id}
                  radius="2xl"
                  padding="m"
                  shadow="l"
                  style={{
                    borderRadius: "var(--radius-2xl, 24px)",
                    overflow: "hidden",
                    aspectRatio: "1.586",
                    background: "linear-gradient(135deg, var(--color-background-default) 0%, var(--color-background-subtle) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    width: "100%",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg, var(--color-background-subtle) 0%, var(--color-primary-subtle) 100%)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg, var(--color-background-default) 0%, var(--color-background-subtle) 100%)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  <Flex justify="space-between">
                    <Badge variant={card.type === "Premium" ? "success" : "primary"}>
                      {card.type}
                    </Badge>
                    <Badge variant={card.status === "active" ? "success" : "warning"}>
                      {card.status}
                    </Badge>
                  </Flex>

                  <div style={{ marginTop: "auto" }}>
                    <Heading variant="title-strong-s" style={{ fontSize: "1.25rem" }}>
                      {card.maskedNumber}
                    </Heading>
                    <Text variant="label-default-s">CVV: {card.cvv}</Text>
                    <Text variant="label-default-s">
                      Created: {new Date(card.created_at).toLocaleDateString()}
                    </Text>
                  </div>

                  <Flex justify="space-between" style={{ marginTop: "0.5rem" }}>
                    <Column>
                      <Text variant="label-default-s">Balance</Text>
                      <Text>${card.balance.toFixed(2)}</Text>
                    </Column>
                  </Flex>
                </Card>
              ))}
            </div>
          )}

          <Button
            onClick={handleRequestCard}
            icon={<Plus />}
            fillWidth
            style={{ marginTop: "1rem" }}
          >
            Request New Card
          </Button>
        </Column>

        {/* Top-Up Section */}
        <Card
          radius="xl"
          shadow="xl"
          padding="l"
          style={{
            flex: "1 1 350px",
            background: "linear-gradient(135deg, var(--color-background-default) 0%, var(--color-background-subtle) 100%)",
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg, var(--color-background-subtle) 0%, var(--color-primary-subtle) 100%)";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg, var(--color-background-default) 0%, var(--color-background-subtle) 100%)";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          }}
        >
          <Flex align="center" gap="s">
            <Icon icon={ArrowUpCircle} size="m" />
            <Heading variant="title-strong-m">Top Up</Heading>
          </Flex>

          <form onSubmit={handleTopupSubmit}>
            <Column gap="m" style={{ marginTop: "1rem" }}>
              {/* Select Card */}
              <div>
                <Text variant="label-default-s" style={{ marginBottom: "0.5rem" }}>
                  Select Card
                </Text>
                <select
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "var(--color-background-default)",
                    border: "1px solid var(--color-border-default)",
                    color: "var(--color-text-default)",
                  }}
                >
                  <option value="">-- Select a card --</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.maskedNumber} (${card.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <Text variant="label-default-s" style={{ marginBottom: "0.5rem" }}>
                  Amount (USD)
                </Text>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  required
                  min={10}
                />
              </div>

              {/* Wallet Address */}
              <div>
                <Text variant="label-default-s" style={{ marginBottom: "0.5rem" }}>
                  USDT TRC20 Wallet Address
                </Text>
                <Flex gap="s" vertical="center">
                  <Text
                    style={{
                      flex: 1,
                      wordBreak: "break-all",
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      background: "var(--color-background-subtle)",
                    }}
                  >
                    {walletAddress}
                  </Text>
                  <Button
                    onClick={copyWalletAddress}
                    icon={walletCopied ? <CheckCircle /> : <Copy />}
                    variant="outline"
                  >
                    {walletCopied ? "Copied!" : "Copy"}
                  </Button>
                </Flex>
              </div>

              {/* TXID */}
              <div>
                <Text variant="label-default-s" style={{ marginBottom: "0.5rem" }}>
                  Transaction ID (TXID)
                </Text>
                <Input
                  type="text"
                  placeholder="Enter transaction ID"
                  value={txid}
                  onChange={(e) => setTxid(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" fillWidth style={{ marginTop: "0.5rem" }}>
                Submit Top-Up Request
              </Button>
            </Column>
          </form>
        </Card>
      </Flex>
    </Column>
  );
}
