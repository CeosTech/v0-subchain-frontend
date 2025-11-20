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
  Share2,
  X,
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
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useSubscriptionPlans, useCoupons } from "@/hooks/use-django-api"
import { useToast } from "@/hooks/use-toast"
import { apiClient, type SubscriptionPlan } from "@/lib/django-api-client"

type PlanDialogMode = "create" | "edit"

interface PlanFormState {
  code: string
  name: string
  description: string
  amount: string
  currency: string
  interval: "month" | "year"
  trial_days: string
  is_active: boolean
  metadata: string
  contract_app_id: string
  payout_wallet_address: string
}

const defaultFormState: PlanFormState = {
  code: "",
  name: "",
  description: "",
  amount: "",
  currency: "ALGO",
  interval: "month",
  trial_days: "0",
  is_active: true,
  metadata: "{}",
  contract_app_id: "",
  payout_wallet_address: "",
}

const slugifyPlanCode = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

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
  const [codeTouched, setCodeTouched] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareTarget, setShareTarget] = useState<SubscriptionPlan | null>(null)
  const [shareResult, setShareResult] = useState<{ share_url: string; qr_code: string } | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

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
    setCodeTouched(false)
    setDialogOpen(true)
  }

  const openEditDialog = (plan: SubscriptionPlan) => {
    const primaryTier = plan.price_tiers?.[0]
    setDialogMode("edit")
    setEditingPlan(plan)
    setFormState({
      code: plan.code ?? "",
      name: plan.name,
      description: plan.description ?? "",
      amount: plan.amount ?? primaryTier?.unit_amount ?? "",
      currency: plan.currency ?? primaryTier?.currency ?? "ALGO",
      interval: (plan.interval as "month" | "year") || "month",
      trial_days: plan.trial_days != null ? String(plan.trial_days) : "0",
      is_active: plan.is_active ?? plan.status === "active",
      metadata: plan.metadata ? JSON.stringify(plan.metadata, null, 2) : "{}",
      contract_app_id: plan.contract_app_id != null ? String(plan.contract_app_id) : "",
      payout_wallet_address: plan.payout_wallet_address ?? "",
    })
    setCodeTouched(true)
    setDialogOpen(true)
  }

  const handleNameChange = (value: string) => {
    setFormState((prev) => {
      const nextState = {
        ...prev,
        name: value,
      }
      if (!codeTouched) {
        nextState.code = slugifyPlanCode(value)
      }
      return nextState
    })
  }

  const handleCodeChange = (value: string) => {
    setCodeTouched(true)
    setFormState((prev) => ({ ...prev, code: value.toLowerCase() }))
  }

  const handleSharePlan = async (plan: SubscriptionPlan) => {
    setShareTarget(plan)
    setShareDialogOpen(true)
    setShareResult(null)
    setShareError(null)
    setShareCopied(false)
    setShareLoading(true)
    try {
      const response = await apiClient.sharePlan(plan.id)
      if (response.error || !response.data) {
        throw new Error(response.error || "Unable to generate share link.")
      }
      setShareResult(response.data)
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "Unable to generate share link.")
    } finally {
      setShareLoading(false)
    }
  }

  const handleCopyShareUrl = async () => {
    if (!shareResult?.share_url) return
    try {
      await navigator.clipboard.writeText(shareResult.share_url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      toast({
        title: "Copy failed",
        description: "Unable to copy the share link.",
        variant: "destructive",
      })
    }
  }

  const codePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  const decimalPattern = /^\d+(\.\d{1,6})?$/

  const handleSubmit = async () => {
    const trimmedName = formState.name.trim()
    const trimmedCode = formState.code.trim()

    if (!trimmedName || !trimmedCode) {
      toast({
        title: "Missing data",
        description: "Name and code are required.",
        variant: "destructive",
      })
      return
    }

    if (!codePattern.test(trimmedCode)) {
      toast({
        title: "Invalid code",
        description: "Use lowercase letters, numbers and hyphens only (no spaces).",
        variant: "destructive",
      })
      return
    }

    const normalizedAmount = formState.amount.trim()
    if (!decimalPattern.test(normalizedAmount) || Number(normalizedAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be a positive decimal with up to 6 digits after the dot.",
        variant: "destructive",
      })
      return
    }

    let trialDays = 0
    if (formState.trial_days.trim()) {
      trialDays = Number(formState.trial_days.trim())
      if (!Number.isInteger(trialDays) || trialDays < 0) {
        toast({
          title: "Invalid trial period",
          description: "Trial days must be a positive integer.",
          variant: "destructive",
        })
        return
      }
    }

    let contractAppId: number | undefined
    if (formState.contract_app_id.trim()) {
      contractAppId = Number(formState.contract_app_id.trim())
      if (!Number.isInteger(contractAppId) || contractAppId < 0) {
        toast({
          title: "Invalid contract app ID",
          description: "Provide a valid Algorand app ID (integer).",
          variant: "destructive",
        })
        return
      }
    }

    let metadataObject: Record<string, unknown> = {}
    const metadataInput = formState.metadata.trim()
    if (metadataInput) {
      try {
        const parsed = JSON.parse(metadataInput)
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Metadata must be a JSON object.")
        }
        metadataObject = parsed as Record<string, unknown>
      } catch (error) {
        toast({
          title: "Invalid metadata",
          description: error instanceof Error ? error.message : "Unable to parse metadata JSON.",
          variant: "destructive",
        })
        return
      }
    }

    const payload: {
      code: string
      name: string
      description?: string | null
      amount: string
      currency: string
      interval: "month" | "year"
      trial_days?: number
      is_active: boolean
      metadata: Record<string, unknown>
      contract_app_id?: number
      payout_wallet_address?: string
    } = {
      code: trimmedCode,
      name: trimmedName,
      description: formState.description.trim() || null,
      amount: normalizedAmount,
      currency: formState.currency,
      interval: formState.interval,
      trial_days: trialDays,
      is_active: formState.is_active,
      metadata: metadataObject,
    }

    if (contractAppId !== undefined) {
      payload.contract_app_id = contractAppId
    }
    const payoutAddress = formState.payout_wallet_address.trim()
    if (payoutAddress) {
      payload.payout_wallet_address = payoutAddress
    }

    setProcessing(true)
    try {
      if (dialogMode === "create") {
        const response = await apiClient.createPlan(payload)

        if (response.error || !response.data) {
          throw new Error(response.error || "Server rejected plan creation.")
        }

        toast({
          title: "Plan created",
          description: `${response.data.name} is now available.`,
        })
      } else if (dialogMode === "edit" && editingPlan) {
        const response = await apiClient.updatePlan(editingPlan.id, payload)

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
                  <TableHead className="w-[200px]">Plan ID</TableHead>
                  <TableHead className="w-[220px]">Payout wallet</TableHead>
                  <TableHead className="w-[140px] text-right">Price</TableHead>
                  <TableHead className="w-[120px] text-right">Status</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plansLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Loading plans…
                    </TableCell>
                  </TableRow>
                )}
                {!plansLoading && filteredPlans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                          <span className="text-xs text-muted-foreground">{plan.code || "No code"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {plan.description || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground break-all">{plan.id}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground break-all">
                        {plan.payout_wallet_address || "Default"}
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
                            <DropdownMenuItem onClick={() => handleSharePlan(plan)}>
                              <Share2 className="mr-2 h-4 w-4" /> Share
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <div className="flex items-start justify-between gap-4">
            <DialogHeader className="text-left">
              <DialogTitle>{dialogMode === "create" ? "Create a new plan" : "Edit plan"}</DialogTitle>
              <DialogDescription>
                {dialogMode === "create"
                  ? "Define the plan details; price tiers and metadata will be adjusted automatically."
                  : "Update the plan details; changes take effect immediately for new subscriptions."}
              </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-code">Plan code</Label>
                <Input
                  id="plan-code"
                  value={formState.code}
                  onChange={(event) => handleCodeChange(event.target.value)}
                  placeholder="starter-plan"
                />
                <p className="text-xs text-muted-foreground">Lowercase slug without spaces (used as the API identifier).</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-name">Name</Label>
                <Input
                  id="plan-name"
                  value={formState.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Starter Plan"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-description">Description</Label>
              <Textarea
                id="plan-description"
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Short summary displayed to your customers"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-amount">Amount</Label>
                <Input
                  id="plan-amount"
                  type="text"
                  inputMode="decimal"
                  value={formState.amount}
                  onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
                  placeholder="15.000000"
                />
                <p className="text-xs text-muted-foreground">Decimal string with up to 6 decimals (e.g. 10 or 10.500000).</p>
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-interval">Billing interval</Label>
                <Select
                  value={formState.interval}
                  onValueChange={(value: "month" | "year") => setFormState((prev) => ({ ...prev, interval: value }))}
                >
                  <SelectTrigger id="plan-interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-trial">Trial days</Label>
                <Input
                  id="plan-trial"
                  type="number"
                  min="0"
                  step="1"
                  value={formState.trial_days}
                  onChange={(event) => setFormState((prev) => ({ ...prev, trial_days: event.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="plan-active"
                checked={formState.is_active}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({ ...prev, is_active: checked === true }))
                }
              />
              <Label htmlFor="plan-active" className="text-sm font-medium">
                Plan is active
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-contract">Contract app ID (optional)</Label>
              <Input
                id="plan-contract"
                type="number"
                min="0"
                value={formState.contract_app_id}
                onChange={(event) => setFormState((prev) => ({ ...prev, contract_app_id: event.target.value }))}
                placeholder="123456789"
              />
              <p className="text-xs text-muted-foreground">Algorand application used for this plan, if applicable.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-payout-wallet">Payout wallet (optional)</Label>
              <Input
                id="plan-payout-wallet"
                placeholder="ALGOSOMEADDRESS..."
                value={formState.payout_wallet_address}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, payout_wallet_address: event.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to reuse your account wallet. Set it to direct funds to another Algorand address.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-metadata">Metadata (JSON)</Label>
              <Textarea
                id="plan-metadata"
                value={formState.metadata}
                onChange={(event) => setFormState((prev) => ({ ...prev, metadata: event.target.value }))}
                rows={4}
              />
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

      <Dialog
        open={shareDialogOpen}
        onOpenChange={(open) => {
          setShareDialogOpen(open)
          if (!open) {
            setShareTarget(null)
            setShareResult(null)
            setShareError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {shareTarget?.name ?? "plan"}</DialogTitle>
            <DialogDescription>
              Generate a public checkout link and QR code to share this plan with customers.
            </DialogDescription>
          </DialogHeader>
          {shareLoading && <p className="text-sm text-muted-foreground">Generating link…</p>}
          {shareError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {shareError}
            </div>
          )}
          {shareResult && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="share-url">Share URL</Label>
                <div className="flex gap-2">
                  <Input id="share-url" readOnly value={shareResult.share_url} />
                  <Button onClick={handleCopyShareUrl} variant="outline">
                    {shareCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>QR code</Label>
                <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shareResult.qr_code}
                    alt="Plan QR code"
                    className="h-40 w-40 object-contain"
                  />
                </div>
              </div>
            </div>
          )}
          {!shareLoading && !shareResult && !shareError && (
            <p className="text-sm text-muted-foreground">No share link generated yet.</p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
