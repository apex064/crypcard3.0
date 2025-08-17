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
  Select,
  Badge,
} from "@once-ui-system/core";

interface CardData {
  id: string;
  number: string;
  maskedNumber: string;
  cvv?: string;
  expiry?: string;
  balance: number;
  status: string;
  type: string;
  final_price?: number;
}

interface UserData {
  id: number;
  username: string;
  email: string;
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCardUserId, setNewCardUserId] = useState<number | "">("");
  const [basePrice, setBasePrice] = useState(25);
  const [markup, setMarkup] = useState(0);
  const [profitMargin, setProfitMargin] = useState(5);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch cards
  const fetchCards = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cards", { headers: authHeader });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch cards");
      setCards(data.cards || []);
    } catch (err: any) {
      alert(err.message || "Error fetching cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // --- Actions ---
  const createCard = async () => {
    if (!newCardUserId) return alert("User ID required");
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          user_id: newCardUserId,
          base_price: basePrice,
          markup,
          profit_margin: profitMargin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create card");
      alert("Card created!");
      setNewCardUserId("");
      fetchCards();
    } catch (err: any) {
      alert(err.message || "Error creating card");
    }
  };

  const updateCard = async (card: CardData) => {
    try {
      const res = await fetch("/api/admin/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          id: card.id,
          base_price: basePrice,
          markup,
          profit_margin: profitMargin,
          status: card.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update card");
      alert("Card updated!");
      fetchCards();
    } catch (err: any) {
      alert(err.message || "Error updating card");
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    try {
      const res = await fetch("/api/admin/cards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ id: cardId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete card");
      alert("Card deleted!");
      fetchCards();
    } catch (err: any) {
      alert(err.message || "Error deleting card");
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "Active" ? "success" : status === "Pending" ? "warning" : "destructive";
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <Column fillWidth padding="l" gap="l">
      <Row justify="space-between" align="center">
        <Heading variant="display-strong-xl">Admin Cards</Heading>
        <Button variant="destructive" onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}>Logout</Button>
      </Row>

      {/* New Card */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Column gap="m">
          <Heading variant="heading-default-xl">Create Card</Heading>
          <Row gap="m" align="center">
            <Input placeholder="User ID" value={newCardUserId} onChange={e => setNewCardUserId(Number(e.target.value))} style={{ width: "100px" }} />
            <Input placeholder="Base Price" type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} style={{ width: "100px" }} />
            <Input placeholder="Markup" type="number" value={markup} onChange={e => setMarkup(Number(e.target.value))} style={{ width: "100px" }} />
            <Input placeholder="Profit Margin (%)" type="number" value={profitMargin} onChange={e => setProfitMargin(Number(e.target.value))} style={{ width: "120px" }} />
            <Button variant="primary" onClick={createCard}>Create</Button>
          </Row>
        </Column>
      </Card>

      {/* Cards List */}
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Column gap="s">
          {cards.map(card => (
            <Card key={card.id} padding="l" radius="l" border="neutral-alpha-medium">
              <Row justify="space-between" align="center">
                <Column gap="xs">
                  <Text>User ID: {card.id} | {card.maskedNumber} | Type: {card.type} | Balance: ${card.balance}</Text>
                  <Text>Email: {card?.email}</Text>
                </Column>
                <Row gap="s" align="center">
                  {getStatusBadge(card.status)}
                  <Button size="sm" variant="primary" onClick={() => updateCard(card)}>Update</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteCard(card.id)}>Delete</Button>
                </Row>
              </Row>
            </Card>
          ))}
        </Column>
      )}
    </Column>
  );
}
