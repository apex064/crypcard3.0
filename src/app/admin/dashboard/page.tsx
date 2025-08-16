"use client"

import { useState, useEffect } from "react"
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@once-ui-system/core"

interface CardData {
  id: string
  number: string
  cvv: string
  expiry: string
  balance: number
  status: string
  type: string
}

interface UserData {
  id: number
  first_name: string
  last_name: string
  email: string
  cardholder_id: string
  cards: CardData[]
}

interface TopupData {
  id: string
  user_id: number
  card_id: string
  amount: number
  status: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(false)
  const [fundAmount, setFundAmount] = useState<number>(0.1)
  const [pendingTopups, setPendingTopups] = useState<TopupData[]>([])
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const fetchAdminData = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch admin data")
      const usersWithCards = data.users.map((user: any) => ({
        ...user,
        cards: data.cards.filter((c: any) => c.user_id === user.id),
      }))
      setUsers(usersWithCards)
      setPendingTopups(data.pendingTopups || [])
    } catch (err: any) {
      alert(err.message || "Failed to fetch admin data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const performAction = async (action: string, payload: any) => {
    if (!token) return alert("No admin token found. Please log in.")
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, ...payload }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(`${action.replace("_", " ")} success!`)
        fetchAdminData()
      } else {
        alert(data.error || `${action} failed`)
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong")
    }
  }

  const formatAmount = (amt: any) => {
    const num = typeof amt === "number" ? amt : parseFloat(amt)
    return isNaN(num) ? "0.00" : num.toFixed(2)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.reload()
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="fundAmount" className="text-text">Amount:</label>
        <Input
          id="fundAmount"
          type="number"
          min={0.01}
          step={0.01}
          value={fundAmount}
          onChange={(e) => setFundAmount(parseFloat(e.target.value))}
          className="w-24"
        />
        <Button variant="secondary" onClick={() => performAction("sync_balances", {})}>
          Sync All Balances
        </Button>
      </div>

      {loading && <p className="text-text-subtle">Loading admin data...</p>}

      <div className="grid gap-6">
        {users.map(user => (
          <Card key={user.id} variant="subtle">
            <CardHeader>
              <CardTitle>{user.first_name} {user.last_name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button variant="primary" onClick={() => performAction("create_card", { userId: user.id, fundAmount })}>
                  Create Card
                </Button>
                <Button variant="destructive" onClick={() => performAction("delete_user", { userId: user.id })}>
                  Delete User
                </Button>
              </div>

              {user.cards.length > 0 && (
                <div className="space-y-2">
                  {user.cards.map(card => (
                    <Card key={card.id} variant="outline" className="p-3 flex justify-between items-center">
                      <div>
                        <p>{card.type} - {card.number}</p>
                        <p>Balance: ${formatAmount(card.balance)}</p>
                        <p>Status: {card.status}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="primary" onClick={() => performAction("topup_card", { userId: user.id, cardId: card.id, amount: fundAmount })}>
                          Top-up
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => performAction("delete_card", { cardId: card.id })}>
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingTopups.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-text mb-4">Pending Top-ups</h2>
          <div className="space-y-2">
            {pendingTopups.map(topup => (
              <Card key={topup.id} variant="outline" className="p-3 flex justify-between items-center">
                <p>
                  User ID: {topup.user_id} | Card ID: {topup.card_id} | Amount: ${formatAmount(topup.amount)} | Status: {topup.status}
                </p>
                <Button size="sm" variant="primary" onClick={() => performAction("mark_topup_completed", { topupId: topup.id })}>
                  Mark Completed
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
