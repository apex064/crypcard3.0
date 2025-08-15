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
import { CreditCard, Plus, ArrowUpCircle, Copy, CheckCircle } from "lucide-react";
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
    <Column fillWidth fillHeight style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      <Header onLogout={handleLogout} />

      {/* Section Header */}
      <Flex align="center" gap="s" style={{ marginBottom: "0.5rem", padding: "0 1rem" }}>
        <Badge variant="contrast" size="m">My Cards</Badge>
      </Flex>

      <Flex gap="l" wrap="wrap" style={{ padding: "0 1rem" }}>
        {/* Cards Section */}
        <Column style={{ flex: "1 1 350px" }} gap="m">
          {cards.length === 0 ? (
            <Text>No cards found.</Text>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
              {cards.map((card) => (
                <Card
                  key={card.id}
                  radius="xl"
                  shadow="xl"
                  padding="l"
                  style={{
                    flexDirection: "column",
                    justifyContent: "space-between",
                    display: "flex",
                    transition: "all 0.2s",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, var(--color-background-default) 0%, var(--color-background-subtle) 100%)",
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
                    <Heading variant="title-strong-s">{card.maskedNumber}</Heading>
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

          <Button onClick={handleRequestCard} icon={<Plus />} fillWidth>
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
            display: "flex",
            flexDirection: "column",
            transition: "all 0.2s",
            cursor: "pointer",
            background: "linear-gradient(135deg, var(--color-background-default) 0%, var(--color-background-subtle) 100%)",
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

          <form onSubmit={handleTopupSubmit} style={{ marginTop: "1rem" }}>
            <Column gap="m">
              <div>
                <Text>Select Card</Text>
                <Input value={cardId} onChange={(e) => setCardId(e.target.value)} placeholder="Enter card ID" />
              </div>
              <div>
                <Text>Amount (USD)</Text>
                <Input type="number" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} min={10} />
              </div>
              <div>
                <Text>USDT TRC20 Wallet Address</Text>
                <Flex gap="s" align="center">
                  <Text
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
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
              </div>
              <div>
                <Text>Transaction ID (TXID)</Text>
                <Input value={txid} onChange={(e) => setTxid(e.target.value)} placeholder="Enter transaction ID" />
              </div>
              <Button type="submit" fillWidth>
                Submit Top-Up Request
              </Button>
            </Column>
          </form>
        </Card>
      </Flex>
    </Column>
  );
}
