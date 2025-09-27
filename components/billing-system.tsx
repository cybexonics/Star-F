"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { billAPI, customerAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Plus, Eye, ArrowLeft, Loader2 } from "lucide-react"

interface Customer {
  _id: string
  name: string
  phone: string
}

interface Bill {
  _id: string
  bill_number: number
  bill_no_str: string
  customer_id: string
  items: { name: string; price: number; qty: number }[]
  subtotal: number
  total: number
  created_at: string
  status: string
  qr_code?: string
}

export default function BillingSystem() {
  const [bills, setBills] = useState<Bill[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBillPreview, setShowBillPreview] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  // Add bill dialog
  const [isNewBillOpen, setIsNewBillOpen] = useState(false)
  const [newBill, setNewBill] = useState({
    customer_id: "",
    items: [{ name: "", price: 0, qty: 1 }],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // ================== Load Data ==================
  useEffect(() => {
    loadBills()
    loadCustomers()
  }, [])

  const loadBills = async () => {
    try {
      setIsLoading(true)
      const res = await billAPI.getAll()
      setBills(res.bills || [])
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load bills",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const res = await customerAPI.getAll({})
      setCustomers(res.customers || [])
    } catch {
      // ignore silently
    }
  }

  // ================== Handlers ==================
  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill)
    setShowBillPreview(true)
  }

  const handleAddBill = async () => {
    if (!newBill.customer_id || newBill.items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a customer and add at least one item",
        variant: "destructive",
      })
      return
    }
    try {
      setIsSubmitting(true)
      const subtotal = newBill.items.reduce((s, i) => s + i.price * i.qty, 0)
      const res = await billAPI.create({
        ...newBill,
        subtotal,
        total: subtotal,
      })
      toast({
        title: "Success",
        description: `Bill #${res.bill.bill_no_str} created successfully`,
      })
      setIsNewBillOpen(false)
      setNewBill({ customer_id: "", items: [{ name: "", price: 0, qty: 1 }] })
      loadBills()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create bill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ================== Render ==================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
        <span className="ml-2 text-gray-600">Loading bills...</span>
      </div>
    )
  }

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
              Billing
            </h1>
          </div>
          <Button
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
            onClick={() => setIsNewBillOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> New Bill
          </Button>
        </div>
      </header>

      {/* Bills Table */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell>{b.bill_no_str}</TableCell>
                    <TableCell>{customers.find((c) => c._id === b.customer_id)?.name || "N/A"}</TableCell>
                    <TableCell>₹{b.total.toLocaleString()}</TableCell>
                    <TableCell>{b.status}</TableCell>
                    <TableCell>{new Date(b.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleViewBill(b)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Bill Preview */}
      <Dialog open={showBillPreview} onOpenChange={setShowBillPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bill Preview</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-3">
              <p><strong>Bill No:</strong> {selectedBill.bill_no_str}</p>
              <p><strong>Total:</strong> ₹{selectedBill.total.toLocaleString()}</p>
              <p><strong>Status:</strong> {selectedBill.status}</p>
              {selectedBill.qr_code && (
                <div className="mt-3">
                  <img src={selectedBill.qr_code} alt="UPI QR" className="w-40 h-40" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Bill Dialog */}
      <Dialog open={isNewBillOpen} onOpenChange={setIsNewBillOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <select
              className="w-full border rounded p-2"
              value={newBill.customer_id}
              onChange={(e) => setNewBill({ ...newBill, customer_id: e.target.value })}
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
              ))}
            </select>

            {newBill.items.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => {
                    const updated = [...newBill.items]
                    updated[idx].name = e.target.value
                    setNewBill({ ...newBill, items: updated })
                  }}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => {
                    const updated = [...newBill.items]
                    updated[idx].price = parseFloat(e.target.value) || 0
                    setNewBill({ ...newBill, items: updated })
                  }}
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => {
                    const updated = [...newBill.items]
                    updated[idx].qty = parseInt(e.target.value) || 1
                    setNewBill({ ...newBill, items: updated })
                  }}
                />
              </div>
            ))}

            <Button
              onClick={() => setNewBill({ ...newBill, items: [...newBill.items, { name: "", price: 0, qty: 1 }] })}
              variant="outline"
            >
              + Add Item
            </Button>

            <Button onClick={handleAddBill} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Create Bill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
