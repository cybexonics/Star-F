"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { customerAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  ArrowLeft,
  Loader2,
} from "lucide-react"

interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
  total_orders: number
  total_spent: number
  outstanding_balance: number
  bills?: { bill_no_str: string; total: number; status: string }[]
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [stats, setStats] = useState({
    total_customers: 0,
    customers_with_outstanding: 0,
    total_outstanding_amount: 0,
  })

  const router = useRouter()
  const { toast } = useToast()

  // ================== Load Data ==================
  useEffect(() => {
    loadCustomers()
    loadStats()
  }, [])

  useEffect(() => {
    const delay = setTimeout(() => loadCustomers(), 300)
    return () => clearTimeout(delay)
  }, [searchTerm])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      const res = await customerAPI.getAll({ search: searchTerm })
      setCustomers(res.customers || [])
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load customers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await customerAPI.getStats()
      setStats(res)
    } catch {
      // ignore silently
    }
  }

  // ================== Handlers ==================
  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast({
        title: "Validation Error",
        description: "Name and Phone are required",
        variant: "destructive",
      })
      return
    }
    try {
      setIsSubmitting(true)
      const res = await customerAPI.create(newCustomer)
      toast({
        title: "Success",
        description: `${res.customer.name} added successfully`,
      })
      setNewCustomer({ name: "", phone: "", email: "", address: "", notes: "" })
      setIsAddDialogOpen(false)
      loadCustomers()
      loadStats()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add customer",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCustomer = async () => {
    if (!editingCustomer) return
    if (!editingCustomer.name || !editingCustomer.phone) {
      toast({
        title: "Validation Error",
        description: "Name and Phone are required",
        variant: "destructive",
      })
      return
    }
    try {
      setIsSubmitting(true)
      await customerAPI.update(editingCustomer._id, editingCustomer)
      toast({
        title: "Success",
        description: "Customer updated successfully",
      })
      setIsEditDialogOpen(false)
      setEditingCustomer(null)
      loadCustomers()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update customer",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Delete this customer? This will also delete all their bills.")) return
    try {
      const res = await customerAPI.delete(id)
      toast({
        title: "Deleted",
        description: `Removed customer with ${res.deleted_bills || 0} bills.`,
      })
      loadCustomers()
      loadStats()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete customer",
        variant: "destructive",
      })
    }
  }

  const handleViewCustomer = async (customer: Customer) => {
    try {
      const res = await customerAPI.getById(customer._id)
      setSelectedCustomer(res.customer)
      setIsViewDialogOpen(true)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load customer details",
        variant: "destructive",
      })
    }
  }

  // ================== Render ==================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
        <span className="ml-2 text-gray-600">Loading customers...</span>
      </div>
    )
  }

  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-violet-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="hover:bg-violet-100">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="ml-4 text-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Customer Management
            </h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Customer</DialogTitle>
                <DialogDescription>Enter customer details</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Name" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                <Input placeholder="Phone" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                <Input placeholder="Email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                <Textarea placeholder="Address" value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} />
                <Textarea placeholder="Notes" value={newCustomer.notes} onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })} />
                <Button onClick={handleAddCustomer} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 text-violet-400 h-4 w-4" />
          <Input placeholder="Search by name or phone" className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent>{stats.total_customers} Customers</CardContent></Card>
          <Card><CardContent>{stats.customers_with_outstanding} With Outstanding</CardContent></Card>
          <Card><CardContent>₹{customers.reduce((s, c) => s + (c.total_spent || 0), 0).toLocaleString()} Revenue</CardContent></Card>
          <Card><CardContent>₹{stats.total_outstanding_amount.toLocaleString()} Outstanding</CardContent></Card>
        </div>

        {/* Customer List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((c) => (
            <Card key={c._id}>
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
                <CardDescription>{c.phone}</CardDescription>
                {c.outstanding_balance > 0 && (
                  <Badge variant="destructive">₹{c.outstanding_balance}</Badge>
                )}
              </CardHeader>
              <CardContent>
                {c.email && <p><Mail className="inline h-3 w-3 mr-1" /> {c.email}</p>}
                {c.address && <p><MapPin className="inline h-3 w-3 mr-1" /> {c.address}</p>}
                <p><Calendar className="inline h-3 w-3 mr-1" /> Joined {new Date(c.created_at).toLocaleDateString()}</p>
                <p><IndianRupee className="inline h-3 w-3 mr-1" /> Spent ₹{c.total_spent.toLocaleString()}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => handleViewCustomer(c)}><Eye className="h-3 w-3" /></Button>
                  <Button size="sm" onClick={() => { setEditingCustomer(c); setIsEditDialogOpen(true) }}><Edit className="h-3 w-3" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteCustomer(c._id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
          {editingCustomer && (
            <div className="space-y-3">
              <Input value={editingCustomer.name} onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })} />
              <Input value={editingCustomer.phone} onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })} />
              <Input value={editingCustomer.email || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })} />
              <Textarea value={editingCustomer.address || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })} />
              <Textarea value={editingCustomer.notes || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })} />
              <Button onClick={handleEditCustomer} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Update
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          {selectedCustomer && (
            <div>
              <h2 className="font-semibold text-lg">{selectedCustomer.name}</h2>
              <p>{selectedCustomer.phone}</p>
              {selectedCustomer.email && <p>{selectedCustomer.email}</p>}
              {selectedCustomer.address && <p>{selectedCustomer.address}</p>}
              <p>Total Orders: {selectedCustomer.total_orders}</p>
              <p>Total Spent: ₹{selectedCustomer.total_spent.toLocaleString()}</p>
              <p>Outstanding: ₹{selectedCustomer.outstanding_balance.toLocaleString()}</p>
              {selectedCustomer.bills && selectedCustomer.bills.length > 0 && (
                <div className="mt-3">
                  <h3 className="font-semibold">Bills</h3>
                  <ul className="list-disc pl-5">
                    {selectedCustomer.bills.map((b, idx) => (
                      <li key={idx}>
                        #{b.bill_no_str} - ₹{b.total} ({b.status})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
