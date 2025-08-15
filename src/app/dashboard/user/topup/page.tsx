"use client";

import { useEffect, useState } from "react";
import {
  Column,
  Flex,
  Card,
  Heading,
  Text,
  Input,
  Button,
  Badge,
  Icon,
} from "@once-ui-system/core";
import { ArrowUpCircle, CheckCircle, Copy } from "lucide-react";
import Header from "@/components/Header";

export default function TopUpPage() {
  const [topupAmount, setTopupAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [cardId, setCardId] = useState("");
  const [walletCopied, setWalletCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const walletAddress = process.env.NEXT_PUBLIC_TRC20_WALLET || "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/topup/history", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) return;
      setHistory(data.data || []);
    } catch (e) {
      console.error("History fetch error", e);
    }
  }

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!topupAmount || !txid || !cardId) return setError("Please fill all fields");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(topupAmount), cardId, txid }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Top-up failed");

      await fetchHistory();
      setTopupAmount("");
      setTxid("");
      alert(data.message || "Top-up submitted");
    } catch (err: any) {
      setError(err.message || "Unexpected error");
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
    switch ((status || "").toLowerCase()) {
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

  return (
    <Column fillWidth fillHeight style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      <Header />
      <Column fillWidth gap="l" padding="l">
        <Heading variant="title-strong-l">Top Up</Heading>
        <Text>Add funds to your virtual cards using USDT TRC20</Text>

        <Flex gap="l" wrap="wrap" style={{ marginTop: "1rem" }}>
          {/* Add Funds Card */}
          <Card radius="xl" shadow="xl" padding="l" style={{ flex: "1 1 400px" }}>
            <Flex align="center" gap="s">
              <Icon icon={ArrowUpCircle} size="m" />
              <Heading variant="title-strong-m">Add Funds</Heading>
            </Flex>

            <Column gap="m" style={{ marginTop: "1rem" }}>
              <form onSubmit={handleTopupSubmit}>
                <Column gap="m">
                  <div>
                    <Text>Card ID</Text>
                    <Input value={cardId} onChange={(e) => setCardId(e.target.value)} placeholder="Enter card ID" />
                  </div>

                  <div>
                    <Text>Amount (USD)</Text>
                    <Input
                      type="number"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      min={10}
                    />
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

                  {error && <Text style={{ color: "var(--color-danger)" }}>{error}</Text>}

                  <Button type="submit" fillWidth disabled={loading}>
                    {loading ? "Submitting..." : "Submit Top-Up Request"}
                  </Button>
                </Column>
              </form>
            </Column>
          </Card>

          {/* Top-up History */}
          <Card radius="xl" shadow="xl" padding="l" style={{ flex: "1 1 400px" }}>
            <Heading variant="title-strong-m">Top-up History</Heading>
            <Column gap="s" style={{ marginTop: "1rem" }}>
              {history.length === 0 && <Text>No top-ups yet.</Text>}
              {history.map((h) => (
                <Card key={h.id} radius="lg" padding="m">
                  <Flex justify="space-between" align="center">
                    <Column>
                      <Text>${Number(h.amount).toFixed(2)} USDT</Text>
                      <Text variant="label-default-s">{new Date(h.created_at).toLocaleString()}</Text>
                      <Text variant="label-default-s" style={{ fontFamily: "monospace" }}>
                        {h.txid?.substring(0, 20)}...
                      </Text>
                    </Column>
                    {getStatusBadge(h.status)}
                  </Flex>
                </Card>
              ))}
            </Column>
          </Card>
        </Flex>
      </Column>
    </Column>
  );
}

