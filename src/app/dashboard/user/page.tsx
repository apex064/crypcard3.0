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
  Feedback, // import Feedback
} from "@once-ui-system/core";
import { CreditCard, Plus, Copy, CheckCircle } from "lucide-react";
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

  // --- Feedback state ---
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    variant?: "success" | "warning" | "danger" | "info";
    title: string;
    description: string;
  }>({ visible: false, title: "", description: "" });

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
        showFeedback("danger", "Error", "Failed to fetch cards");
      }
    };
    fetchCards();
  }, [token]);

  // --- Feedback helper ---
  const showFeedback = (variant: "success" | "warning" | "danger" | "info", title: string, description: string) => {
    setFeedback({ visible: true, variant, title, description });
    setTimeout(() => setFeedback(prev => ({ ...prev, visible: false })), 3000);
  };

  // --- Request New Card ---
  const handleRequestCard = async () => {
    if (!token) return showFeedback("warning", "Not Authenticated", "User not authenticated.");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback("success", "Card Requested", "Card request submitted!");
        const updatedRes = await fetch("/api/cards", { headers: { Authorization: `Bearer ${token}` } });
        const updatedData = await updatedRes.json();
        if (updatedRes.ok) setCards(updatedData.cards);
      } else showFeedback("danger", "Error", data.error ?? "Unknown error");
    } catch (err) {
      showFeedback("danger", "Error", "Failed to request card");
    }
  };

  // --- Submit Top-Up ---
  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return showFeedback("warning", "Not Authenticated", "User not authenticated.");
    if (!cardId) return showFeedback("warning", "Select Card", "Please select a card.");
    if (!topupAmount || parseFloat(topupAmount) < 10) return showFeedback("warning", "Invalid Amount", "Minimum top-up is $10.");
    if (!txid.trim()) return showFeedback("warning", "TXID Required", "Please enter the transaction ID.");

    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(topupAmount), txid, cardId }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback("success", "Top-Up Submitted", "Your top-up request has been submitted!");
        setTopupAmount("");
        setTxid("");
        setCardId("");
      } else showFeedback("danger", "Error", data.error ?? "Unknown error");
    } catch (err) {
      showFeedback("danger", "Error", "Failed to submit top-up");
    }
  };

  // --- Copy Wallet ---
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
    showFeedback("success", "Copied!", "Wallet address copied to clipboard.");
  };

  // --- Logout ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Column fillWidth fillHeight gap="l" padding="l" style={{ minHeight: "100vh" }}>
      {/* Feedback */}
      {feedback.visible && (
        <Feedback variant={feedback.variant} title={feedback.title} description={feedback.description} />
      )}

      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* My Cards Section Header */}
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
                    transition: "all 0.3s ease",
                    cursor: "pointer",
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
        <Column style={{ flex: "1 1 350px" }} gap="m">
          {/* Top Up Section Header */}
          <Flex align="center" gap="s" style={{ marginBottom: "0.5rem" }}>
            <Badge variant="contrast" size="m">
              Top Up
            </Badge>
          </Flex>

          <Card
            radius="xl"
            shadow="xl"
            padding="l"
            style={{
              background: "linear-gradient(135deg, var(--color-background-default) 0%, var(--color-background-subtle) 100%)",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
          >
            <form onSubmit={handleTopupSubmit}>
              <Column gap="m">
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
        </Column>
      </Flex>
    </Column>
  );
}
