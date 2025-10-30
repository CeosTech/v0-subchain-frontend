"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  RefreshCcw,
  Search,
  Copy,
  Check,
  Gift,
  BadgePercent,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSubscriptionPlans, useCoupons } from "@/hooks/use-django-api"
import { useToast } from "@/hooks/use-toast"
import { apiClient, type SubscriptionPlan } from "@/lib/django-api-client"

type PlanDialogMode = "create" | "edit"

interface PlanFormState {
  name: string
  description: string
  price: string
  currency: string
}

const defaultFormState: PlanFormState = {
  name: "",
  description: "",
  price: "",
  currency: "ALGO",
}

export default function PlansPage() {
  const { toast } = useToast()
  const {
    plans,
    loading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useSubscriptionPlans()
  const { coupons, loading: couponsLoading } = useCoupons()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<PlanDialogMode>("create")
  const [formState, setFormState] = useState<PlanFormState>(defaultFormState)
  const [processing, setProcessing] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      const planStatus = plan.status || (plan.is_active ? "active" : "inactive")
      const matchesStatus = statusFilter === "all" || planStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [plans, searchTerm, statusFilter])

  const handleCopyPlanId = (planId: string) => {
    navigator.clipboard
      .writeText(planId)
      .then(() => {
        setCopiedPlanId(planId)
        setTimeout(() => setCopiedPlanId(null), 2000)
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Unable to copy the plan identifier to the clipboard.",
          variant: "destructive",
        })
      })
  }

  const openCreateDialog = () => {
    setDialogMode("create")
    setEditingPlan(null)
    setFormState(defaultFormState)
    setDialogOpen(true)
  }

  const openEditDialog = (plan: SubscriptionPlan) => {
    const primaryTier = plan.price_tiers?.[0]
    setDialogMode("edit")
    setEditingPlan(plan)
    setFormState({
      name: plan.name,
      description: plan.description ?? "",
      price: primaryTier ? String(Number(primaryTier.unit_amount)) : "",
      currency: primaryTier?.currency ?? "ALGO",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formState.name.trim() || !formState.price) {
      toast({
        title: "Missing data",
        description: "Plan name and price are required.",
        variant: "destructive",
      })
      return
    }

    const priceValue = Number(formState.price)
    if (Number.isNaN(priceValue) || priceValue < 0) {
      toast({
        title: "Invalid price",
        description: "Price must be a positive number.",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      if (dialogMode === "create") {
        const response = await apiClient.createPlan({
          name: formState.name.trim(),
          description: formState.description.trim() || null,
          price_tiers: [
            {
              unit_amount: priceValue.toString(),
              currency: formState.currency,
              up_to: null,
            },
          ],
          metadata: {},
          features: [],
        })

        if (response.error || !response.data) {
          throw new Error(response.error || "Server rejected plan creation.")
        }

        toast({
          title: "Plan created",
          description: `${response.data.name} is now available.`,
        })
      } else if (dialogMode === "edit" && editingPlan) {
        const primaryTier = editingPlan.price_tiers?.[0]
        const response = await apiClient.updatePlan(editingPlan.id, {
          name: formState.name.trim(),
          description: formState.description.trim() || null,
          price_tiers: [
            {
              id: primaryTier?.id,
              unit_amount: priceValue.toString(),
              currency: formState.currency,
              up_to: primaryTier?.up_to ?? null,
            },
          ],
        })

        if (response.error || !response.data) {
          throw new Error(response.error || "Server rejected plan update.")
        }

        toast({
          title: "Plan updated",
          description: `${response.data.name} has been updated.`,
        })
      }

      setDialogOpen(false)
      await refetchPlans()
    } catch (error) {
      toast({
        title: dialogMode === "create" ? "Unable to create plan" : "Unable to update plan",
        description: error instanceof Error ? error.message : "Unexpected server response.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (plan: SubscriptionPlan) => {
    const confirmed = window.confirm(`Delete plan "${plan.name}"?`)
    if (!confirmed) return

    setDeletingPlanId(plan.id)
    try {
      const response = await apiClient.deletePlan(plan.id)
      if (response.error && response.status !== 204) {
        throw new Error(response.error)
      }
      toast({
        title: "Plan deleted",
        description: `${plan.name} has been removed.`,
      })
      await refetchPlans()
    } catch (error) {
      toast({
        title: "Unable to delete plan",
        description: error instanceof Error ? error.message : "Unexpected server response.",
        variant: "destructive",
      })
    } finally {
      setDeletingPlanId(null)
    }
  }

  const activePlans = plans.filter((plan) => plan.is_active ?? plan.status === "active").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage the offers that are available to your customers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchPlans()} disabled={plansLoading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog}>New Plan</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activePlans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">{coupons.length}</span>
              {couponsLoading && <span className="text-sm text-muted-foreground">Loading…</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {plansError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Failed to load plans</CardTitle>
            <CardDescription>{plansError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refetchPlans()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
          <CardDescription>Search, filter and copy plan details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or description…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[140px] text-right">Price</TableHead>
                  <TableHead className="w-[120px] text-right">Status</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plansLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Loading plans…
                    </TableCell>
                  </TableRow>
                )}
                {!plansLoading && filteredPlans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No plan matching your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filteredPlans.map((plan) => {
                  const primaryTier = plan.price_tiers?.[0]
                  const amount = primaryTier ? Number(primaryTier.unit_amount) : 0
                  const currency = primaryTier?.currency ?? plan.metadata?.currency ?? "ALGO"
                  const status = plan.status || (plan.is_active ? "active" : "inactive")

                  return (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{plan.name}</span>
                          <span className="text-xs text-muted-foreground">{plan.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {plan.description || "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {primaryTier ? `${amount.toFixed(2)} ${currency}` : "On demand"}
                      </TableCell>
                      <TableCell className="text-right text-sm capitalize">{status}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopyPlanId(plan.id)}>
                              {copiedPlanId === plan.id ? (
                                <>
                                  <Check className="mr-2 h-4 w-4" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="mr-2 h-4 w-4" /> Copy ID
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(plan)}
                              disabled={deletingPlanId === plan.id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />{" "}
                              {deletingPlanId === plan.id ? "Deleting…" : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
          <CardDescription>Promotional codes available for your plans.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {coupons.length === 0 && !couponsLoading && (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                No coupon configured yet.
              </div>
            )}
            {coupons.map((coupon) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <BadgePercent className="h-4 w-4 text-muted-foreground" />
                    {coupon.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {coupon.duration} •{" "}
                    {coupon.percent_off
                      ? `${coupon.percent_off}%`
                      : coupon.amount_off
                        ? `${coupon.amount_off} ${coupon.currency ?? ""}`
                        : "Custom discount"}
                  </p>
                </div>
                <span className="text-xs uppercase text-muted-foreground">
                  {coupon.is_active ? "Active" : "Inactive"}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Create a new plan" : "Edit plan"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Define the plan details; price tiers and metadata will be adjusted automatically."
                : "Update the plan details; changes take effect immediately for new subscriptions."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Pro Monthly"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-description">Description</Label>
              <Textarea
                id="plan-description"
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Description displayed in checkout"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-price">Price</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.price}
                  onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-currency">Currency</Label>
                <Select
                  value={formState.currency}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger id="plan-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALGO">ALGO</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={processing}>
              {processing ? (dialogMode === "create" ? "Creating…" : "Saving…") : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
