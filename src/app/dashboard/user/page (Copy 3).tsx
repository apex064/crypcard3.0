"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CreditCard, Home, Plus, ArrowUpCircle, Receipt, Copy, CheckCircle } from "lucide-react"

type CardType = {
  id: string
  last4: string
  balance: number
  status: string
}

type TransactionType = {
  id: string
  type: string
  description: string
  date: string
  amount: number
  status: string
}

const sidebarItems = [
  { title: "Dashboard", icon: Home, url: "/dashboard/user" },
  { title: "My Cards", icon: CreditCard, url: "/dashboard/user/cards" },
  { title: "Top Up", icon: ArrowUpCircle, url: "/dashboard/user/topup" },
  { title: "Transactions", icon: Receipt, url: "/dashboard/user/transactions" },
]

function AppSidebar() {
  return (
    <Sidebar className="bg-gray-900 text-gray-300 w-64 min-h-screen flex-shrink-0">
      <SidebarContent className="flex flex-col justify-between">
        <div>
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">KripiCard</span>
            </div>
          </div>

          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-400">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className="flex items-center space-x-3 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

export default function UserDashboard() {
  const [topupAmount, setTopupAmount] = useState("")
  const [txid, setTxid] = useState("")
  const [cardId, setCardId] = useState("")
  const [walletCopied, setWalletCopied] = useState(false)
  const [cards, setCards] = useState<CardType[]>([])
  const [transactions, setTransactions] = useState<TransactionType[]>([])

  const walletAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch("/api/cards", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        })
        const data = await res.json()
        if (res.ok && Array.isArray(data.cards)) setCards(data.cards)
      } catch (err) {
        console.error("Error fetching cards:", err)
      }
    }

    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        })
        const data = await res.json()
        if (res.ok && Array.isArray(data.transactions)) setTransactions(data.transactions)
      } catch (err) {
        console.error("Error fetching transactions:", err)
      }
    }

    fetchCards()
    fetchTransactions()
  }, [])

  const handleRequestCard = async () => {
    try {
      const res = await fetch("/api/cards/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (res.ok) {
        alert("Card request submitted successfully!")
        const updatedCardsRes = await fetch("/api/cards", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        })
        const updatedCardsData = await updatedCardsRes.json()
        if (updatedCardsRes.ok) setCards(updatedCardsData.cards)
      } else {
        alert("Error: " + (data.error ?? "Unknown error"))
      }
    } catch (err) {
      alert("Failed to request card: " + err)
    }
  }

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cardId) {
      alert("Please select a card to top up.")
      return
    }

    if (!topupAmount || parseFloat(topupAmount) < 10) {
      alert("Minimum top-up amount is $10.")
      return
    }
    if (!txid.trim()) {
      alert("Transaction ID (TXID) is required.")
      return
    }

    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ amount: parseFloat(topupAmount), txid, cardId }),
      })
      const data = await res.json()
      if (res.ok) {
        alert("Top-up request submitted successfully!")
        setTopupAmount("")
        setTxid("")
        setCardId("")
        const updatedTxRes = await fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        })
        const updatedTxData = await updatedTxRes.json()
        if (updatedTxRes.ok) setTransactions(updatedTxData.transactions)
      } else {
        alert("Error: " + (data.error ?? "Unknown error"))
      }
    } catch (err) {
      alert("Failed to submit top-up: " + err)
    }
  }

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setWalletCopied(true)
    setTimeout(() => setWalletCopied(false), 2000)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-900 text-gray-200">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <SidebarTrigger className="md:hidden mb-4" />
            <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-gray-400">Manage your virtual cards and top-ups</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Cards Section */}
            <Card className="bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  <span>My Virtual Cards</span>
                </CardTitle>
                <CardDescription>Your active virtual USD cards</CardDescription>
              </CardHeader>
              <CardContent>
                {cards.length === 0 ? (
                  <p>No cards found.</p>
                ) : (
                  <div className="space-y-4">
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        className="p-4 bg-gradient-to-r from-blue-700 to-blue-800 rounded-lg text-white"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-blue-300 text-sm">Virtual Card</p>
                            <p className="text-2xl font-bold">**** **** **** {card.last4}</p>
                          </div>
                          <CreditCard className="h-8 w-8 text-blue-300" />
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <p className="text-blue-300 text-xs">Balance</p>
                            <p className="text-lg font-semibold">${card.balance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-blue-300 text-xs">Status</p>
                            <p className="text-sm font-medium">{card.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  onClick={handleRequestCard}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Request New Card
                </Button>
              </CardContent>
            </Card>

            {/* Top Up Section */}
            <Card className="bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUpCircle className="h-5 w-5 text-green-400" />
                  <span>Top Up Card</span>
                </CardTitle>
                <CardDescription>Add funds using USDT TRC20</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTopupSubmit} className="space-y-6">
                  <Label htmlFor="cardId" className="text-sm font-medium text-gray-300">
                    Select Card
                  </Label>
                  <select
                    id="cardId"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Select a card --</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        **** **** **** {card.last4} (${card.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>

                  <Label htmlFor="amount" className="text-sm font-medium text-gray-300">
                    Amount (USD)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="h-12 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    min={10}
                    step="0.01"
                  />

                  <Label className="text-sm font-medium text-gray-300">USDT TRC20 Wallet Address</Label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg">
                    <code className="flex-1 text-sm font-mono text-gray-300 break-all">{walletAddress}</code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyWalletAddress}
                      className="shrink-0 border-gray-500 text-gray-300 hover:border-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {walletCopied ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Send USDT to this address and submit the transaction ID below
                  </p>

                  <Label htmlFor="txid" className="text-sm font-medium text-gray-300">
                    Transaction ID (TXID)
                  </Label>
                  <Input
                    id="txid"
                    type="text"
                    placeholder="Enter transaction ID"
                    value={txid}
                    onChange={(e) => setTxid(e.target.value)}
                    className="h-12 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Submit Top-Up Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="bg-gray-800 shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-gray-400" />
                <span>Recent Transactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p>No transactions found.</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">
                          <ArrowUpCircle className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-200">{tx.type}</p>
                          <p className="text-sm text-gray-400">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            tx.amount > 0 ? "text-green-400" : "text-red-500"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">{tx.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  )
}

