"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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

  // --- Fetch admin data ---
  const fetchAdminData = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch admin data")
      // Merge cards into users
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

  // --- Admin actions ---
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

  // --- Helper ---
  const formatAmount = (amt: any) => {
    const num = typeof amt === "number" ? amt : parseFloat(amt)
    return isNaN(num) ? "0.00" : num.toFixed(2)
  }

  // --- Logout ---
  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.reload()
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
          Logout
        </Button>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="fundAmount" className="text-white">Amount:</label>
        <Input
          id="fundAmount"
          type="number"
          min={0.01}
          step={0.01}
          value={fundAmount}
          onChange={(e) => setFundAmount(parseFloat(e.target.value))}
          className="w-24"
        />
        <Button
          onClick={() => performAction("sync_balances", {})}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Sync All Balances
        </Button>
      </div>

      {loading && <p className="text-gray-400">Loading admin data...</p>}

      <div className="grid gap-6">
        {users.map(user => (
          <Card key={user.id} className="bg-gray-800 text-white">
            <CardHeader>
              <CardTitle>{user.first_name} {user.last_name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  onClick={() => performAction("create_card", { userId: user.id, fundAmount })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Card
                </Button>
                <Button
                  onClick={() => performAction("delete_user", { userId: user.id })}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete User
                </Button>
              </div>

              {user.cards.length > 0 && (
                <div className="space-y-2">
                  {user.cards.map(card => (
                    <div key={card.id} className="p-3 bg-gray-700 rounded-lg flex justify-between items-center">
                      <div>
                        <p>{card.type} - {card.number}</p>
                        <p>Balance: ${formatAmount(card.balance)}</p>
                        <p>Status: {card.status}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => performAction("topup_card", { userId: user.id, cardId: card.id, amount: fundAmount })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Top-up
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => performAction("delete_card", { cardId: card.id })}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingTopups.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Pending Top-ups</h2>
          <div className="space-y-2">
            {pendingTopups.map(topup => (
              <div key={topup.id} className="p-3 bg-gray-700 rounded-lg flex justify-between items-center">
                <p>
                  User ID: {topup.user_id} | Card ID: {topup.card_id} | Amount: ${formatAmount(topup.amount)} | Status: {topup.status}
                </p>
                <Button
                  size="sm"
                  onClick={() => performAction("mark_topup_completed", { topupId: topup.id })}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark Completed
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
