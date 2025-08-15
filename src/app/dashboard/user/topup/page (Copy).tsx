"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CreditCard, Home, ArrowUpCircle, Receipt, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function TopUpPage() {
  const [topupAmount, setTopupAmount] = useState("")
  const [txid, setTxid] = useState("")
  const [cardId, setCardId] = useState("") // user chooses which card to top up
  const [walletCopied, setWalletCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<any[]>([])

  const walletAddress = process.env.NEXT_PUBLIC_TRC20_WALLET || "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const res = await fetch("/api/topup/history", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) {
        console.error(data)
        return
      }
      setHistory(data.data || [])
    } catch (e) {
      console.error("History fetch error", e)
    }
  }

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!topupAmount || !txid || !cardId) {
      setError("Please fill amount, card id and transaction id")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Not authenticated")

      const res = await fetch("/api/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(topupAmount),
          cardId,
          txid
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || data.message || "Top-up failed")
        setLoading(false)
        return
      }

      // success, refresh history and clear form
      await fetchHistory()
      setTopupAmount("")
      setTxid("")
      setError(null)
      alert(data.message || "Top-up submitted")
    } catch (err: any) {
      setError(err.message || "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  const copyWalletAddress = async () => {
    await navigator.clipboard.writeText(walletAddress)
    setWalletCopied(true)
    setTimeout(() => setWalletCopied(false), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case "failed":
        return <Badge variant="outline" className="text-red-600 border-red-600">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* If your AppSidebar is a shared component, import & render it instead */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <SidebarTrigger className="md:hidden mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">Top Up</h1>
              <p className="text-gray-600">Add funds to your virtual cards using USDT TRC20</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUpCircle className="h-5 w-5 text-green-600" />
                  <span>Add Funds</span>
                </CardTitle>
                <CardDescription>Send USDT TRC20 to top up your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTopupSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="cardId">Card ID</Label>
                    <Input id="cardId" value={cardId} onChange={(e)=>setCardId(e.target.value)} placeholder="Enter card id"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input id="amount" type="number" value={topupAmount} onChange={(e)=>setTopupAmount(e.target.value)} min={10} step="0.01" />
                    <p className="text-xs text-gray-500">Minimum amount: $10.00</p>
                  </div>

                  <div className="space-y-2">
                    <Label>USDT TRC20 Wallet Address</Label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
                      <code className="flex-1 text-sm font-mono break-all">{walletAddress}</code>
                      <Button type="button" onClick={copyWalletAddress}>{walletCopied ? "Copied" : "Copy"}</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="txid">Transaction ID (TXID)</Label>
                    <Input id="txid" value={txid} onChange={(e)=>setTxid(e.target.value)} placeholder="Enter transaction ID" />
                  </div>

                  {error && <p className="text-red-600">{error}</p>}

                  <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Top-Up Request"}</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>How to Top Up</CardTitle>
                <CardDescription>Follow these steps to add funds to your account</CardDescription>
              </CardHeader>
              <CardContent>
                {/* ...instructions same as your original... */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">1</div>
                    <div><p className="font-medium">Enter Amount</p><p className="text-sm text-gray-600">Specify how much USD you want to add (minimum $10)</p></div>
                  </div>
                  {/* ... */}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle>Top-up History</CardTitle>
              <CardDescription>Your recent USDT top-up transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.length === 0 && <p className="text-sm text-gray-500">No top-ups yet.</p>}
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <ArrowUpCircle className="h-5 w-5 text-gray-600"/>
                      </div>
                      <div>
                        <p className="font-medium">${Number(h.amount).toFixed(2)} USDT</p>
                        <p className="text-sm text-gray-500">{new Date(h.created_at).toLocaleString()}</p>
                        <p className="text-xs text-gray-400 font-mono">{(h.txid || "").substring(0, 20)}...</p>
                      </div>
                    </div>
                    <div className="text-right">{getStatusBadge(h.status)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  )
}

