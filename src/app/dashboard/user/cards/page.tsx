"use client";

import { useEffect, useState } from "react";
import { Column, Flex, Card, Heading, Text, Button, Badge, Icon } from "@once-ui-system/core";
import { CreditCard, Plus, Eye, EyeOff, Copy, CheckCircle } from "lucide-react";
import Header from "@/components/Header";

export default function MyCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [showCardDetails, setShowCardDetails] = useState<string | null>(null);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/cards", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (res.ok) setCards(data.cards);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestCard = async () => {
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create card");
      setCards((prev) => [
        ...prev,
        { ...data.card, maskedNumber: maskCardNumber(data.card.number), balance: 0, status: "Active" },
      ]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const maskCardNumber = (number: string) => number.slice(0, 4) + " **** **** " + number.slice(-4);

  const copyCardNumber = (cardId: string, cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ""));
    setCopiedCard(cardId);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "frozen":
        return <Badge variant="danger">Frozen</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Column fillWidth fillHeight style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      <Header />

      {/* Section Header */}
      <Flex align="center" gap="s" style={{ margin: "1rem 0" }}>
        <Badge variant="contrast" size="m">My Cards</Badge>
      </Flex>

      {/* Cards Grid */}
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
                {card.type || "Standard"}
              </Badge>
              {getStatusBadge(card.status)}
            </Flex>

            <div style={{ marginTop: "auto" }}>
              <Heading variant="title-strong-s" style={{ fontSize: "1.25rem" }}>
                {showCardDetails === card.id ? card.number : card.maskedNumber}
              </Heading>
              <Text variant="label-default-s">Balance: ${parseFloat(card.balance).toFixed(2)}</Text>
              {card.expiry && <Text variant="label-default-s">Expires: {card.expiry}</Text>}
            </div>

            {/* Card Details Reveal */}
            {showCardDetails === card.id && (
              <Card
                radius="xl"
                padding="m"
                style={{ marginTop: "0.5rem", background: "var(--color-background-subtle)" }}
              >
                <Column gap="s">
                  <Flex justify="space-between" align="center">
                    <Text variant="label-default-s">Card Number</Text>
                    <Flex gap="s" align="center">
                      <Text variant="label-default-s" style={{ fontFamily: "monospace" }}>
                        {card.number}
                      </Text>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={copiedCard === card.id ? <CheckCircle /> : <Copy />}
                        onClick={() => copyCardNumber(card.id, card.number)}
                      >
                        {copiedCard === card.id ? "Copied" : "Copy"}
                      </Button>
                    </Flex>
                  </Flex>

                  <Flex justify="space-between">
                    <Text variant="label-default-s">CVV</Text>
                    <Text variant="label-default-s" style={{ fontFamily: "monospace" }}>{card.cvv}</Text>
                  </Flex>

                  {card.expiry && (
                    <Flex justify="space-between">
                      <Text variant="label-default-s">Expiry</Text>
                      <Text variant="label-default-s" style={{ fontFamily: "monospace" }}>{card.expiry}</Text>
                    </Flex>
                  )}
                </Column>
              </Card>
            )}

            <Button
              variant="outline"
              onClick={() => setShowCardDetails(showCardDetails === card.id ? null : card.id)}
              icon={showCardDetails === card.id ? <EyeOff /> : <Eye />}
              style={{ marginTop: "0.5rem" }}
            >
              {showCardDetails === card.id ? "Hide Details" : "Show Details"}
            </Button>
          </Card>
        ))}
      </div>

      {/* Request New Card */}
      
    </Column>
  );
}

