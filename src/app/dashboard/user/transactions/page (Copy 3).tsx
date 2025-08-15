"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger
} from "@/components/ui/sidebar"
import {
  CreditCard, Home, ArrowUpCircle, Receipt, Search, Download,
  ArrowDownCircle, ShoppingCart, Fuel, Coffee
} from 'lucide-react'

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
            <CreditCard className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold text-gray-200">KripiCard</span>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center space-x-3 text-gray-300 hover:text-white">
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

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        })
        const data = await res.json()
        if (res.ok) {
          setTransactions(data.transactions)
        } else {
          console.error(data.error)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.card?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    transaction.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge variant="outline" className="text-green-400 border-green-400">Completed</Badge>
      case "pending":
        return <Badge variant="outline" className="text-yellow-400 border-yellow-400">Pending</Badge>
      case "failed":
        return <Badge variant="outline" className="text-red-400 border-red-400">Failed</Badge>
      default:
        return <Badge variant="outline" className="text-gray-400 border-gray-400">{status}</Badge>
    }
  }

  const getTransactionIcon = (type: string, description: string) => {
    if (type === "topup") {
      return <ArrowUpCircle className="h-5 w-5 text-green-400" />
    }
    if (description.toLowerCase().includes("amazon") || description.toLowerCase().includes("shopping")) {
      return <ShoppingCart className="h-5 w-5 text-blue-400" />
    }
    if (description.toLowerCase().includes("gas")) {
      return <Fuel className="h-5 w-5 text-orange-400" />
    }
    if (description.toLowerCase().includes("starbucks") || description.toLowerCase().includes("coffee")) {
      return <Coffee className="h-5 w-5 text-amber-400" />
    }
    return <ArrowDownCircle className="h-5 w-5 text-red-400" />
  }

  const totalIncome = transactions
    .filter(t => t.amount > 0 && t.status.toLowerCase() === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = Math.abs(transactions
    .filter(t => t.amount < 0 && t.status.toLowerCase() === "completed")
    .reduce((sum, t) => sum + t.amount, 0))

  const handleExport = () => {
    alert("Transaction export feature coming soon! (Demo mode)")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-900 text-gray-200">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <SidebarTrigger className="md:hidden mb-4" />
                <h1 className="text-3xl font-bold text-white">Transactions</h1>
                <p className="text-gray-400">View and manage your transaction history</p>
              </div>
              <Button onClick={handleExport} variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-800">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg bg-gray-800 text-gray-100">
                <CardContent className="p-6 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Income</p>
                    <p className="text-2xl font-bold text-green-400">+${totalIncome.toFixed(2)}</p>
                  </div>
                  <ArrowUpCircle className="h-8 w-8 text-green-400" />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gray-800 text-gray-100">
                <CardContent className="p-6 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-400">-${totalExpenses.toFixed(2)}</p>
                  </div>
                  <ArrowDownCircle className="h-8 w-8 text-red-400" />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gray-800 text-gray-100">
                <CardContent className="p-6 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Net Balance</p>
                    <p className="text-2xl font-bold text-blue-400">${(totalIncome - totalExpenses).toFixed(2)}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-blue-400" />
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="border-0 shadow-lg mb-6 bg-gray-800 text-gray-100">
              <CardContent className="p-6 flex space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-gray-700 text-gray-200 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card className="border-0 shadow-lg bg-gray-800 text-gray-100">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription className="text-gray-400">All your card transactions and top-ups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex space-x-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-sm">
                          {getTransactionIcon(transaction.type, transaction.description)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-400">
                            {transaction.date} at {transaction.time} • Card {transaction.card ?? "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">ID: {transaction.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

