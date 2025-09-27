"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

// Interfaces
interface BillItem {
  name: string
  quantity: number
  price: number
}

interface Bill {
  _id: string
  billNoStr: string
  customerId: string
  customerName: string
  items: BillItem[]
  total: number
  balance: number
  createdDate: string
  status: string
  qr_code?: string
}

export function BillingSystem() {
  const { toast } = useToast()

  // States
  const [showBillPreview, setShowBillPreview] = useState(false)
  const [currentBill, setCurrentBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(false)

  // Example: creating a bill (called when admin submits)
  const generateBill = async () => {
    try {
      setLoading(true)

      // Example payload, adjust as per your form
      const payload = {
        customer_id: "some-customer-id",
        items: [{ name: "Blouse", quantity: 1, price: 500 }],
        total: 500,
      }

      const res = await api.post("/bills", payload)
      const created = res.data.bill

      const bill: Bill = {
        _id: created._id,
        billNoStr: created.bill_no_str,
        customerId: created.customer_id,
        customerName: "Demo Customer",
        items: created.items,
        total: created.total,
        balance: created.total, // assuming unpaid
        createdDate: created.created_at,
        status: created.status,
        qr_code: created.qr_code, // ✅ backend sends QR
      }

      setCurrentBill(bill)
      setShowBillPreview(true)
    } catch (err) {
      toast({ title: "Error", description: "Failed to generate bill", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-xl font-bold mb-4">Billing System</h1>
      <Button onClick={generateBill} disabled={loading}>
        {loading ? "Generating..." : "Generate Bill"}
      </Button>

      {/* Bill Preview Dialog */}
      <Dialog open={showBillPreview} onOpenChange={setShowBillPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bill Preview</DialogTitle>
            <DialogDescription>Review and print the bill</DialogDescription>
          </DialogHeader>

          {currentBill && (
            <div className="space-y-4">
              <div className="border p-3">
                <p><strong>Bill No:</strong> {currentBill.billNoStr}</p>
                <p><strong>Date:</strong> {new Date(currentBill.createdDate).toLocaleDateString()}</p>
                <p><strong>Total:</strong> ₹{currentBill.total}</p>
                <p><strong>Status:</strong> {currentBill.status}</p>
              </div>

              {currentBill.qr_code && (
                <div className="text-center">
                  <p className="mb-2 text-sm">Scan to Pay</p>
                  <img
                    src={currentBill.qr_code}
                    alt="UPI QR"
                    className="w-32 h-32 mx-auto border"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
