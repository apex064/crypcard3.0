"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CreditCard, Home, Plus, ArrowUpCircle, Receipt, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react'

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

export default function MyCardsPage() {
  const [showCardDetails, setShowCardDetails] = useState<string | null>(null)
  const [copiedCard, setCopiedCard] = useState<string | null>(null)
  const [cards, setCards] = useState<any[]>([])

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/cards", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await res.json()
      if (res.ok) {
        setCards(data.cards)
      } else {
        console.error(data.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRequestCard = async () => {
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create card")
      setCards((prev) => [...prev, { ...data.card, maskedNumber: maskCardNumber(data.card.number), balance: 0, status: "Active" }])
    } catch (err: any) {
      alert(err.message)
    }
  }

  const maskCardNumber = (number: string) => {
    return number.slice(0, 4) + " **** **** " + number.slice(-4)
  }

  const copyCardNumber = (cardId: string, cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''))
    setCopiedCard(cardId)
    setTimeout(() => setCopiedCard(null), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
      case "frozen":
        return <Badge variant="outline" className="text-red-600 border-red-600">Frozen</Badge>
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
                <h1 className="text-3xl font-bold text-gray-900">My Cards</h1>
                <p className="text-gray-600">Manage your virtual USD cards</p>
              </div>
              <Button onClick={handleRequestCard} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Request New Card
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {cards.map((card) => (
                <Card key={card.id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    {/* Card Visual */}
                    <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white mb-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-blue-100 text-sm">{card.type}</p>
                          <p className="text-xl font-bold">
                            {showCardDetails === card.id ? card.number : card.maskedNumber}
                          </p>
                        </div>
                        <CreditCard className="h-8 w-8 text-blue-200" />
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-blue-100 text-xs">Balance</p>
                          <p className="text-lg font-semibold">${parseFloat(card.balance).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-100 text-xs">Expires</p>
                          <p className="text-sm font-medium">{card.expiry}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        {getStatusBadge(card.status)}
                      </div>

                      {showCardDetails === card.id && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Card Number</span>
                            <div className="flex items-center space-x-2">
                              <code className="text-sm font-mono">{card.number}</code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyCardNumber(card.id, card.number)}
                              >
                                {copiedCard === card.id ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">CVV</span>
                            <code className="text-sm font-mono">{card.cvv}</code>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Expiry</span>
                            <code className="text-sm font-mono">{card.expiry}</code>
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowCardDetails(showCardDetails === card.id ? null : card.id)}
                      >
                        {showCardDetails === card.id ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show Details
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

