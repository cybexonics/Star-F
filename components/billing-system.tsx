"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { billAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"

interface Item {
  type: string
  qty: number
  rate: number
  advance: number
  due_date: string
  measurements: Record<string, string>
  notes?: string
}

export default function BillingSystem() {
  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [items, setItems] = useState<Item[]>([
    {
      type: "",
      qty: 1,
      rate: 0,
      advance: 0,
      due_date: "",
      measurements: {},
      notes: "",
    },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!customerName || !phone) {
      toast({
        title: "Error",
        description: "Customer Name and Phone are required",
        variant: "destructive",
      })
      return
    }
    try {
      setIsSubmitting(true)
      const payload = {
        customer_id: phone,
        items,
        total: items.reduce((sum, i) => sum + i.qty * i.rate, 0),
      }
      await billAPI.create(payload)
      toast({
        title: "Success",
        description: "Bill generated successfully",
      })
      setCustomerName("")
      setPhone("")
      setItems([
        {
          type: "",
          qty: 1,
          rate: 0,
          advance: 0,
          due_date: "",
          measurements: {},
          notes: "",
        },
      ])
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate bill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Button variant="ghost" onClick={() => router.push("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-xl font-bold">Billing System</h1>
        <Button
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Generate & Preview
        </Button>
      </header>

      <main className="max-w-5xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Billing Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Customer Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Item Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                placeholder="Select Type *"
                value={items[0].type}
                onChange={(e) =>
                  setItems([{ ...items[0], type: e.target.value }])
                }
              />
              <Input
                type="number"
                placeholder="Qty"
                value={items[0].qty}
                onChange={(e) =>
                  setItems([{ ...items[0], qty: Number(e.target.value) }])
                }
              />
              <Input
                type="number"
                placeholder="Rate *"
                value={items[0].rate}
                onChange={(e) =>
                  setItems([{ ...items[0], rate: Number(e.target.value) }])
                }
              />
              <Input
                type="number"
                placeholder="Advance"
                value={items[0].advance}
                onChange={(e) =>
                  setItems([{ ...items[0], advance: Number(e.target.value) }])
                }
              />
              <Input
                type="date"
                placeholder="Due Date"
                value={items[0].due_date}
                onChange={(e) =>
                  setItems([{ ...items[0], due_date: e.target.value }])
                }
              />
            </div>

            {/* Measurements */}
            <div>
              <Label>Measurements (inches)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {["Length", "Shoulder", "Sleeve", "Chest", "Waist", "Hips", "Front Neck", "Back Neck"].map(
                  (field) => (
                    <Input
                      key={field}
                      placeholder={field}
                      value={items[0].measurements[field] || ""}
                      onChange={(e) =>
                        setItems([
                          {
                            ...items[0],
                            measurements: {
                              ...items[0].measurements,
                              [field]: e.target.value,
                            },
                          },
                        ])
                      }
                    />
                  )
                )}
              </div>
            </div>

            {/* Notes */}
            <Textarea
              placeholder="Additional Notes"
              value={items[0].notes}
              onChange={(e) =>
                setItems([{ ...items[0], notes: e.target.value }])
              }
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
