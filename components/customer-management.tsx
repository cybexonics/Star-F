"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { customerAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Calendar, IndianRupee, Eye, Edit, Trash2, Plus } from "lucide-react"

interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
  address?: string
  created_at: string
  total_spent: number
  outstanding_balance: number
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [stats, setStats] = useState({
    total_customers: 0,
    customers_with_outstanding: 0,
    total_outstanding_amount: 0,
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
    loadStats()
  }, [])

  const loadCustomers = async () => {
    try {
      const res = await customerAPI.getAll({ search })
      setCustomers(res.customers || [])
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const loadStats = async () => {
    try {
      const res = await customerAPI.getStats()
      setStats(res)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return
    try {
      await customerAPI.delete(id)
      toast({ title: "Deleted", description: "Customer removed" })
      loadCustomers()
      loadStats()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Button variant="ghost" onClick={() => router.push("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-xl font-bold">Customer Management</h1>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </header>

      {/* Search + Stats */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        <Input
          placeholder="Search by name or phone"
          className="mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">{stats.total_customers} Customers</Card>
          <Card className="p-4">{stats.customers_with_outstanding} With Outstanding</Card>
          <Card className="p-4">₹{customers.reduce((s, c) => s + (c.total_spent || 0), 0).toLocaleString()} Revenue</Card>
          <Card className="p-4">₹{stats.total_outstanding_amount.toLocaleString()} Outstanding</Card>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c) => (
            <Card key={c._id} className="p-4 space-y-2">
              <h2 className="font-semibold">{c.name}</h2>
              <p>{c.phone}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> Joined {new Date(c.created_at).toLocaleDateString()}
              </p>
              <p className="flex items-center">
                <IndianRupee className="h-3 w-3 mr-1" /> Spent ₹{c.total_spent.toLocaleString()}
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="sm"><Eye className="h-4 w-4" /></Button>
                <Button size="sm"><Edit className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(c._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
