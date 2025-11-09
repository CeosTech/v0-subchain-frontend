"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Percent, Plus, RefreshCcw, Trash2, ToggleLeft, ToggleRight } from "lucide-react"

import { useCoupons } from "@/hooks/use-django-api"
import { apiClient, type Coupon } from "@/lib/django-api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

type DiscountType = "percent" | "amount"

const durations = [
  { value: "forever", label: "Forever" },
  { value: "once", label: "One-time" },
  { value: "repeating", label: "Repeating" },
]

const currencies = ["ALGO", "USDC", "USDT", "EUROC"]

interface CouponFormState {
  code: string
  duration: string
  discountType: DiscountType
  discountValue: string
  durationInMonths: string
  maxRedemptions: string
  redeemBy: string
  currency: string
}

const defaultForm: CouponFormState = {
  code: "",
  duration: "forever",
  discountType: "percent",
  discountValue: "10",
  durationInMonths: "",
  maxRedemptions: "",
  redeemBy: "",
  currency: "ALGO",
}

const asNumber = (value: string) => {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const buildCouponPayload = (form: CouponFormState) => {
  const payload: Parameters<typeof apiClient.createCoupon>[0] = {
    code: form.code.trim(),
    duration: form.duration as "once" | "forever" | "repeating",
    metadata: {},
  }

  if (form.duration === "repeating") {
    const months = asNumber(form.durationInMonths)
    if (months) payload.duration_in_months = months
  }

  const value = asNumber(form.discountValue)
  if (form.discountType === "percent" && value !== undefined) {
    payload.percent_off = value
  }
  if (form.discountType === "amount" && value !== undefined) {
    payload.amount_off = value
    payload.currency = form.currency
  }

  const maxUses = asNumber(form.maxRedemptions)
  if (maxUses !== undefined) payload.max_redemptions = maxUses

  if (form.redeemBy) {
    payload.redeem_by = form.redeemBy
  }

  return payload
}

const renderDiscount = (coupon: Coupon) => {
  if (coupon.percent_off) {
    return `${coupon.percent_off}%`
  }
  if (coupon.amount_off) {
    return `${coupon.amount_off} ${coupon.currency ?? ""}`.trim()
  }
  return "—"
}

const formatDuration = (coupon: Coupon) => {
  if (coupon.duration === "repeating" && coupon.duration_in_months) {
    return `Repeating (${coupon.duration_in_months} months)`
  }
  return coupon.duration.charAt(0).toUpperCase() + coupon.duration.slice(1)
}

export default function CouponsPage() {
  const { toast } = useToast()
  const { coupons, loading, mutating, error, createCoupon, updateCoupon, deleteCoupon, refetch } = useCoupons()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<CouponFormState>(defaultForm)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  const isSubmitting = mutating

  const openCreateDialog = () => {
    setEditingCoupon(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setForm({
      code: coupon.code,
      duration: coupon.duration,
      discountType: coupon.percent_off ? "percent" : "amount",
      discountValue: coupon.percent_off || coupon.amount_off || "0",
      durationInMonths: coupon.duration_in_months?.toString() ?? "",
      maxRedemptions: coupon.max_redemptions?.toString() ?? "",
      redeemBy: coupon.redeem_by ? coupon.redeem_by.slice(0, 10) : "",
      currency: coupon.currency || "ALGO",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      toast({ title: "Coupon code required", variant: "destructive" })
      return
    }

    const payload = buildCouponPayload(form)

    if (editingCoupon) {
      const { success, error: err } = await updateCoupon(editingCoupon.id, payload)
      if (!success) {
        toast({ title: "Unable to update coupon", description: err, variant: "destructive" })
        return
      }
      toast({ title: "Coupon updated" })
    } else {
      const { success, error: err } = await createCoupon(payload)
      if (!success) {
        toast({ title: "Unable to create coupon", description: err, variant: "destructive" })
        return
      }
      toast({ title: "Coupon created" })
    }

    setDialogOpen(false)
  }

  const handleToggleActive = async (coupon: Coupon) => {
    const { success, error: err } = await updateCoupon(coupon.id, { is_active: !coupon.is_active })
    if (!success) {
      toast({ title: "Unable to update coupon", description: err, variant: "destructive" })
    } else {
      toast({ title: `Coupon ${coupon.is_active ? "disabled" : "activated"}` })
    }
  }

  const handleDelete = async (coupon: Coupon) => {
    const confirmed = window.confirm(`Delete coupon ${coupon.code}? This action cannot be undone.`)
    if (!confirmed) return
    const { success, error: err } = await deleteCoupon(coupon.id)
    if (!success) {
      toast({ title: "Unable to delete coupon", description: err, variant: "destructive" })
    } else {
      toast({ title: "Coupon deleted" })
    }
  }

  const sortedCoupons = useMemo(
    () => [...coupons].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [coupons],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Coupons & promotions</h1>
          <p className="text-sm text-muted-foreground">
            Create promo codes, manage eligibility, and track usage to boost your subscription conversions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> New coupon
          </Button>
        </div>
      </div>

      <Card className="glass-panel border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Percent className="h-5 w-5" /> Active coupons
          </CardTitle>
          <CardDescription className="text-white/60">
            {error ? error : "Coupons apply automatically when customers enter the code at checkout."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              Loading coupons…
            </div>
          ) : sortedCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">No coupons yet. Create your first promotion.</p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" /> Create coupon
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expire</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">{coupon.code}</TableCell>
                      <TableCell>{renderDiscount(coupon)}</TableCell>
                      <TableCell>{formatDuration(coupon)}</TableCell>
                      <TableCell>
                        {coupon.max_redemptions ? `${coupon.max_redemptions} max` : "Unlimited"}
                      </TableCell>
                      <TableCell>
                        {coupon.redeem_by ? format(new Date(coupon.redeem_by), "PP") : "—"}
                      </TableCell>
                      <TableCell>
                        {coupon.is_active ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(coupon)}
                            disabled={isSubmitting}
                          >
                            {coupon.is_active ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(coupon)}>
                            <Percent className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(coupon)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit coupon" : "Create coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
                placeholder="SUMMER25"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={form.duration} onValueChange={(value) => setForm((prev) => ({ ...prev, duration: value }))}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.duration === "repeating" && (
              <div className="grid gap-2">
                <Label htmlFor="durationInMonths">Number of billing cycles</Label>
                <Input
                  id="durationInMonths"
                  value={form.durationInMonths}
                  onChange={(event) => setForm((prev) => ({ ...prev, durationInMonths: event.target.value }))}
                  placeholder="3"
                  type="number"
                  min={1}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label>Discount</Label>
              <div className="grid grid-cols-[130px,1fr] gap-3">
                <Select
                  value={form.discountType}
                  onValueChange={(value: DiscountType) => setForm((prev) => ({ ...prev, discountType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage</SelectItem>
                    <SelectItem value="amount">Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={form.discountValue}
                  onChange={(event) => setForm((prev) => ({ ...prev, discountValue: event.target.value }))}
                  placeholder={form.discountType === "percent" ? "10" : "25"}
                  type="number"
                  min={0}
                />
              </div>
            </div>

            {form.discountType === "amount" && (
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={form.currency} onValueChange={(value) => setForm((prev) => ({ ...prev, currency: value }))}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="maxRedemptions">Maximum redemptions</Label>
              <Input
                id="maxRedemptions"
                value={form.maxRedemptions}
                onChange={(event) => setForm((prev) => ({ ...prev, maxRedemptions: event.target.value }))}
                placeholder="Unlimited"
                type="number"
                min={0}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="redeemBy">Redeem by (optional)</Label>
              <Input
                id="redeemBy"
                type="date"
                value={form.redeemBy}
                onChange={(event) => setForm((prev) => ({ ...prev, redeemBy: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editingCoupon ? "Save changes" : "Create coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
