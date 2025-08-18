"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input, Row, Column, Heading, Text, Badge } from "@once-ui-system/core";

interface Transaction {
  id: string;
  user_id: string;
  card_id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const res = await fetch(`/api/transactions?page=${page}&status=${filter}&search=${search}`);
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [page, filter, search]);

  return (
    <Column gap="lg" p="xl" fillWidth>
      <Heading level={2}>Transactions</Heading>

      <Row gap="md" wrap>
        <Input
          placeholder="Search by User ID or Card ID"
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <Button onClick={() => setPage(1)}>Apply</Button>
      </Row>

      {loading ? (
        <Text>Loading transactions...</Text>
      ) : transactions.length === 0 ? (
        <Text>No transactions found.</Text>
      ) : (
        <Column gap="md">
          {transactions.map((txn) => (
            <Card key={txn.id} p="md" shadow="sm">
              <Row justify="between" align="center">
                <Column>
                  <Text><b>User ID:</b> {txn.user_id}</Text>
                  <Text><b>Card ID:</b> {txn.card_id}</Text>
                  <Text><b>Amount:</b> ${txn.amount}</Text>
                  <Text><b>Type:</b> {txn.type}</Text>
                  <Text><b>Date:</b> {new Date(txn.created_at).toLocaleString()}</Text>
                </Column>
                <Badge color={txn.status === "completed" ? "green" : txn.status === "pending" ? "yellow" : "red"}>
                  {txn.status}
                </Badge>
              </Row>
            </Card>
          ))}
        </Column>
      )}

      <Row gap="md" justify="center">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <Text>Page {page}</Text>
        <Button onClick={() => setPage(page + 1)}>Next</Button>
      </Row>
    </Column>
  );
}

