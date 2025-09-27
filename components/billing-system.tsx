"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2, Printer, Calculator, Loader2, Pen, Eraser } from "lucide-react"
import { api } from "@/lib/api"

// ... your interfaces and constants (Customer, BillItem, Bill, ITEM_TYPES) remain unchanged

export function BillingSystem() {
  // ... all your states and hooks remain unchanged
  const [upiId, setUpiId] = useState<string>("raghukatti9912-1@okhdfcbank")

  // ✅ Fetch UPI ID from backend settings
  useEffect(() => {
    const fetchUpi = async () => {
      try {
        const res = await api.get("/api/settings/upi")
        if (res?.upi_id) {
          setUpiId(res.upi_id)
        }
      } catch (err) {
        console.error("Failed to fetch UPI settings", err)
      }
    }
    fetchUpi()
  }, [])

  // ... all helper functions remain unchanged

  const generateBill = async () => {
    // ... same as before

    const created = billResponse.bill || billResponse
    const billNoStr =
      created?.bill_no_str ||
      created?.billNoStr ||
      (created?.bill_no != null ? String(created.bill_no).padStart(3, "0") : undefined)

    const bill: Bill = {
      _id: created?._id || billResponse._id,
      billNoStr: billNoStr,
      customerId: customerId,
      customerName: newCustomer.name,
      customerPhone: newCustomer.phone,
      customerAddress: newCustomer.address,
      items: billItems,
      subtotal: calculateSubtotal(),
      discount,
      total: calculateTotal(),
      advance,
      balance: calculateBalance(),
      dueDate,
      specialInstructions,
      designImages,
      drawings,
      signature,
      createdDate: new Date().toISOString().split("T")[0],
      status: "pending",
      // ✅ Include backend-provided QR code if available
      qr_code: created?.qr_code || null,
    }

    setCurrentBill(bill)
    setShowBillPreview(true)

    // ... rest unchanged
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 overflow-hidden">
      {/* ... all your header, form, and content unchanged */}

      {/* Bill Preview Dialog */}
      <Dialog open={showBillPreview} onOpenChange={setShowBillPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Preview</DialogTitle>
            <DialogDescription>Review and print the bill</DialogDescription>
          </DialogHeader>

          {currentBill && (
            <div className="bill-content print:text-black" id="bill-content">
              <div className="border border-gray-300 print:border-black">
                <div className="grid grid-cols-2 divide-x divide-gray-300 print:divide-black">
                  
                  {/* Tailor Copy */}
                  <div className="p-3">
                    <div className="text-center border-b pb-2 mb-2">
                      <h2 className="text-xl font-bold">{businessName}</h2>
                      <p className="text-xs">EXCLUSIVE LADIES & CUSTOM TAILOR</p>
                      <p className="text-xs">{businessAddress}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div className="border p-2 text-center">
                        <div className="font-semibold">{currentBill.billNoStr}</div>
                        <div className="text-[10px]">Bill No</div>
                      </div>
                      <div className="border p-2 text-center">
                        <div className="font-semibold">
                          {new Date(currentBill.createdDate).toLocaleDateString()}
                        </div>
                        <div className="text-[10px]">Date</div>
                      </div>
                      <div className="border p-2 text-center">
                        <div className="font-semibold">
                          {currentBill.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)}
                        </div>
                        <div className="text-[10px]">Qty</div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Copy */}
                  <div className="p-3">
                    <div className="text-center border-b pb-2 mb-2">
                      <h2 className="text-xl font-bold">{businessName}</h2>
                      <p className="text-xs">EXCLUSIVE LADIES & CUSTOM TAILOR</p>
                      <p className="text-xs">{businessAddress}</p>
                      <div className="mt-1 text-right text-xs">
                        CASH MEMO<br />
                        Bill No - <span className="font-semibold">{currentBill.billNoStr}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ Payment QR */}
                {currentBill.balance > 0 && (
                  <div className="border p-3 mb-2">
                    <div className="text-center text-xs mb-2">Scan to Pay Balance Amount</div>
                    <div className="flex items-center justify-center">
                      {currentBill.qr_code ? (
                        <img
                          src={currentBill.qr_code}
                          alt="Payment QR Code"
                          className="w-28 h-28 border"
                        />
                      ) : (
                        <p className="text-xs">QR code not available</p>
                      )}
                    </div>
                    <div className="text-center text-xs mt-2">
                      <div className="font-semibold">UPI Payment</div>
                      <div>₹{currentBill.balance.toFixed(2)}</div>
                      <div>UPI: {upiId}</div>
                      <div>Order #{currentBill.billNoStr}</div>
                    </div>

                    {/* ✅ Mobile Tap-to-Pay */}
                    <div className="text-center mt-2">
                      <a
                        href={`upi://pay?pa=${upiId}&pn=MyShop&am=${currentBill.balance}&cu=INR`}
                        className="text-blue-600 underline"
                      >
                        Pay Now via UPI
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
