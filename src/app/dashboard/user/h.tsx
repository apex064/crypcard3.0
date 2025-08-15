"use client"

import { useState, useEffect } from "react"
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
  SidebarTrigger
} from "@/components/ui/sidebar"
import { CreditCard, Home, Plus, ArrowUpCircle, Receipt, Copy, CheckCircle } from 'lucide-react'

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
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">KripiCard</span>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default function UserDashboard() {
  const [topupAmount, setTopupAmount] = useState("")
  const [txid, setTxid] = useState("")
  const [walletCopied, setWalletCopied] = useState(false)
  const [cards, setCards] = useState<CardType[]>([])
  const [transactions, setTransactions] = useState<TransactionType[]>([])

  const walletAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"

  useEffect(() => {
    // Fetch user cards
    async function fetchCards() {
      try {
        const res = await fetch("/api/cards", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
        })
        const data = await res.json()
        if (res.ok && Array.isArray(data.cards)) setCards(data.cards)
        else console.error("Fetch cards error:", data.error)
      } catch (err) {
        console.error("Fetch cards failed:", err)
      }
    }

    // Fetch recent transactions
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
        })
        const data = await res.json()
        if (res.ok && Array.isArray(data.transactions)) setTransactions(data.transactions)
        else console.error("Fetch transactions error:", data.error)
      } catch (err) {
        console.error("Fetch transactions failed:", err)
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
        body: JSON.stringify({}), // pass any necessary data here
      })
      const data = await res.json()
      if (res.ok) {
        alert("Card request submitted successfully!")
        // Optionally, refresh cards list after request
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
    if (!topupAmount || parseFloat(topupAmount) < 10) {
      alert("Minimum top-up amount is $10.")
      return
    }
    if (!txid.trim()) {
      alert("Transaction ID (TXID) is required.")
      return
    }
    try {
      const res = await fetch("/api/topups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ amount: parseFloat(topupAmount), txid }),
      })
      const data = await res.json()
      if (res.ok) {
        alert("Top-up request submitted successfully!")
        setTopupAmount("")
        setTxid("")
        // Refresh transactions after successful top-up
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
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar />

        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <SidebarTrigger className="md:hidden mb-4" />
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Manage your virtual cards and top-ups</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Card Summary */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span>My Virtual Cards</span>
                  </CardTitle>
                  <CardDescription>
                    Your active virtual USD cards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cards.length === 0 && <p>No cards found.</p>}
                    {cards.map((card) => (
                      <div key={card.id} className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-blue-100 text-sm">Virtual Card</p>
                            <p className="text-2xl font-bold">**** **** **** {card.last4}</p>
                          </div>
                          <CreditCard className="h-8 w-8 text-blue-200" />
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <p className="text-blue-100 text-xs">Balance</p>
                            <p className="text-lg font-semibold">${card.balance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-blue-100 text-xs">Status</p>
                            <p className="text-sm font-medium">{card.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleRequestCard} className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Request New Card
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Top Up Panel */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ArrowUpCircle className="h-5 w-5 text-green-600" />
                    <span>Top Up Card</span>
                  </CardTitle>
                  <CardDescription>
                    Add funds using USDT TRC20
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTopupSubmit} className="space-y-6">
                    <Label htmlFor="amount" className="text-sm font-medium">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      className="h-12 rounded-lg"
                      required
                      min={10}
                      step="0.01"
                    />

                    <Label className="text-sm font-medium">USDT TRC20 Wallet Address</Label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
                      <code className="flex-1 text-sm font-mono text-gray-700 break-all">{walletAddress}</code>
                      <Button type="button" variant="outline" size="sm" onClick={copyWalletAddress} className="shrink-0">
                        {walletCopied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Send USDT to this address and submit the transaction ID below</p>

                    <Label htmlFor="txid" className="text-sm font-medium">Transaction ID (TXID)</Label>
                    <Input
                      id="txid"
                      type="text"
                      placeholder="Enter transaction ID"
                      value={txid}
                      onChange={(e) => setTxid(e.target.value)}
                      className="h-12 rounded-lg"
                      required
                    />

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Submit Top-Up Request</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5 text-gray-600" />
                  <span>Recent Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 && <p>No transactions found.</p>}
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "topup" ? "bg-green-100" : "bg-blue-100"
                        }`}>
                          {tx.type === "topup" ? (
                            <ArrowUpCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                          {tx.amount > 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">{tx.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

