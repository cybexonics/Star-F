"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { billAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Plus, Eye, Loader2, ArrowLeft } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(true)

  // ✅ FIX: added state for preview
  const [showBillPreview, setShowBillPreview] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadBills()
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

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill)
    setShowBillPreview(true)
  }

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin")}
              className="hover:bg-violet-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="ml-4 text-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Billing
            </h1>
          </div>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            <Plus className="h-4 w-4 mr-2" /> New Bill
          </Button>
        </div>
      </header>

      {/* Content */}
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
              <p>
                <strong>Bill No:</strong> {selectedBill.bill_no_str}
              </p>
              <p>
                <strong>Total:</strong> ₹{selectedBill.total.toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {selectedBill.status}
              </p>
              {selectedBill.qr_code && (
                <div className="mt-3">
                  <img src={selectedBill.qr_code} alt="UPI QR" className="w-40 h-40" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
