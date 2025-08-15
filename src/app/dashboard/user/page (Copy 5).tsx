"use client";

import React, { useState, useEffect } from "react";
import {
  Column,
  Flex,
  Card,
  Text,
  Button,
  Badge,
  Select,
  Heading,
  Input,
  Logo,
  Line,
  LetterFx,
} from "@once-ui-system/core";
import {
  CreditCard,
  Plus,
  ArrowUpCircle,
  Copy,
  CheckCircle,
  LogOut,
} from "lucide-react";

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

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Column gap="m">{children}</Column>
);

export default function UserDashboardFullScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [cardId, setCardId] = useState("");
  const [walletCopied, setWalletCopied] = useState(false);
  const [cards, setCards] = useState<CardType[]>([]);

  const walletAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) window.location.href = "/login";
    else setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const cardsRes = await fetch("/api/cards", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cardsRes.ok) throw new Error("Fetch error");
        const cardsData = await cardsRes.json();
        setCards(cardsData.cards ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

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
        alert("Card request submitted successfully!");
        const updatedCardsRes = await fetch("/api/cards", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedCardsData = await updatedCardsRes.json();
        if (updatedCardsRes.ok) setCards(updatedCardsData.cards);
      } else alert("Error: " + (data.error ?? "Unknown error"));
    } catch (err) {
      alert("Failed to request card: " + err);
    }
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("User not authenticated");
    if (!cardId) return alert("Please select a card.");
    if (!topupAmount || parseFloat(topupAmount) < 10)
      return alert("Minimum top-up is $10.");
    if (!txid.trim()) return alert("Transaction ID required.");

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
      } else alert("Error: " + (data.error ?? "Unknown error"));
    } catch (err) {
      alert("Failed to submit top-up: " + err);
    }
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Column fillWidth fillHeight padding="l" style={{ minHeight: "100vh" }} gap="l">
      {/* Header */}
      <Column gap="m">
        <Badge
          textVariant="code-default-s"
          border="neutral-alpha-medium"
          onBackground="neutral-medium"
          vertical="center"
          gap="16"
        >
          <Logo dark icon="/trademarks/wordmark-dark.svg" href="/" size="xs" />
          <Logo light icon="/trademarks/wordmark-light.svg" href="/" size="xs" />
          <Line vert background="neutral-alpha-strong" />
          <Text marginX="4">
            <LetterFx trigger="instant">KripiCard Dashboard</LetterFx>
          </Text>
        </Badge>
        <Text variant="label-default-m" onBackground="neutral-medium">
          Manage your cards and top-ups
        </Text>
        <Button variant="outline" onClick={handleLogout} icon={<LogOut />}>
          Logout
        </Button>
      </Column>

      {/* Side-by-Side Cards & Top-Up */}
      <Flex gap="l" fillWidth wrap={false} style={{ alignItems: "flex-start" }}>
        {/* Cards Section */}
        <Card radius="xl" shadow="xl" padding="l" style={{ flex: 1 }}>
          <Heading variant="title-strong-m" style={{ marginBottom: "1rem" }}>
            <CreditCard style={{ marginRight: "8px" }} />
            My Virtual Cards
          </Heading>
          <CardContent>
            {cards.length === 0 ? (
              <Text>No cards found.</Text>
            ) : (
              cards.map((card) => (
                <Card
                  key={card.id}
                  radius="lg"
                  padding="m"
                  style={{ background: "#1f2937", marginBottom: "1rem" }}
                >
                  <Column gap="s">
                    <Text variant="label-strong-m">{card.type}</Text>
                    <Heading variant="title-strong-s">{card.maskedNumber}</Heading>
                    <Text variant="label-default-s">CVV: {card.cvv}</Text>
                    <Text variant="label-default-s">
                      Created: {new Date(card.created_at).toLocaleDateString()}
                    </Text>
                    <Flex justify="space-between">
                      <Column>
                        <Text variant="label-default-s">Balance</Text>
                        <Text>${card.balance.toFixed(2)}</Text>
                      </Column>
                      <Column>
                        <Text variant="label-default-s">Status</Text>
                        <Badge textVariant="label-default-s">{card.status}</Badge>
                      </Column>
                    </Flex>
                  </Column>
                </Card>
              ))
            )}
            <Button onClick={handleRequestCard} icon={<Plus />} fillWidth>
              Request New Card
            </Button>
          </CardContent>
        </Card>

        {/* Top-Up Section */}
        <Card radius="xl" shadow="xl" padding="l" style={{ flex: 1 }}>
          <Heading variant="title-strong-m" style={{ marginBottom: "1rem" }}>
            <ArrowUpCircle style={{ marginRight: "8px" }} />
            Top Up Card
          </Heading>
          <CardContent>
            <form onSubmit={handleTopupSubmit}>
              <Column gap="m">
                <Text variant="label-default-s">Select Card</Text>
                <Select
                  value={cardId}
                  onChange={(val) => setCardId(val as string)}
                  required
                  options={[
                    { label: "-- Select a card --", value: "" },
                    ...cards.map((card) => ({
                      label: `${card.maskedNumber} ($${card.balance.toFixed(2)})`,
                      value: card.id,
                    })),
                  ]}
                />
                <Text variant="label-default-s">Amount (USD)</Text>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  required
                  min={10}
                />
                <Text variant="label-default-s">USDT TRC20 Wallet Address</Text>
                <Flex gap="s">
                  <Text style={{ flex: 1, wordBreak: "break-all" }}>{walletAddress}</Text>
                  <Button onClick={copyWalletAddress} icon={walletCopied ? <CheckCircle /> : <Copy />} />
                </Flex>
                <Text variant="label-default-s">Transaction ID (TXID)</Text>
                <Input
                  type="text"
                  placeholder="Enter transaction ID"
                  value={txid}
                  onChange={(e) => setTxid(e.target.value)}
                  required
                />
                <Button type="submit" fillWidth>
                  Submit Top-Up Request
                </Button>
              </Column>
            </form>
          </CardContent>
        </Card>
      </Flex>
    </Column>
  );
}

