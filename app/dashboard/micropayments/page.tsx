"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import {
  AlertCircle,
  Copy,
  Edit3,
  ExternalLink,
  History,
  Link as LinkIcon,
  Plus,
  RefreshCcw,
  Trash2,
  Wallet2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  useAuth,
  useX402PricingRules,
  useX402Receipts,
  useX402Links,
  useX402Widgets,
  useX402CreditPlans,
  useX402CreditSubscriptions,
  useX402CreditUsage,
} from "@/hooks/use-django-api"
import type {
  X402CreditPlan,
  X402CreditSubscription,
  X402CreditUsageEntry,
  X402Link,
  X402PricingRule,
  X402Receipt,
  X402Widget,
} from "@/lib/django-api-client"

const methodOptions = ["GET", "POST", "PUT", "PATCH", "DELETE"]
const statusFilterOptions = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "Failed", value: "failed" },
]
const usageTypeFilters = [
  { label: "All usage", value: "" },
  { label: "Top ups", value: "top_up" },
  { label: "Consumption", value: "consumption" },
]

const safeNumber = (value: string | number | undefined | null): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (!value) return 0
  const normalized = typeof value === "string" ? value.replace(/,/g, "") : value
  const parsed = Number.parseFloat(normalized as string)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatDateTime = (value?: string | null) => (value ? format(new Date(value), "PP pp") : "—")

const sumRevenue = (events: Array<{ fee_amount?: string; merchant_amount?: string; amount?: string }> = []) => {
  return events.reduce(
    (acc, event) => {
      const fee = safeNumber(event.fee_amount)
      const merchant = safeNumber(event.merchant_amount)
      const gross = safeNumber(event.amount)
      return {
        fee: acc.fee + fee,
        merchant: acc.merchant + merchant,
        gross: acc.gross + (gross || fee + merchant),
      }
    },
    { fee: 0, merchant: 0, gross: 0 },
  )
}

const copyToClipboard = async (value: string) => {
  if (!value) return false
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch (error) {
    console.warn("Copy failed", error)
    return false
  }
}

const parseJSON = (value: string): { data: Record<string, unknown> | null; error?: string } => {
  if (!value.trim()) return { data: null }
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === "object" && parsed ? { data: parsed } : { data: null, error: "Metadata must be a JSON object" }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Invalid JSON" }
  }
}

const parseMethods = (input: string) =>
  input
    .split(/[;,\s]+/)
    .map((method) => method.trim().toUpperCase())
    .filter(Boolean)

const buildPaywallUrl = (base: string | undefined, tenantId: string, type: "links" | "widgets" | "credits", slug: string, consumer?: string) => {
  const origin = base?.replace(/\/$/, "") || ""
  const path = type === "credits" && consumer
    ? `/paywall/tenant/${tenantId}/credits/${slug}/?consumer=${encodeURIComponent(consumer)}`
    : `/paywall/tenant/${tenantId}/${type}/${slug}/`
  return `${origin}${path}`
}

interface PricingRuleFormState {
  pattern: string
  methods: string
  amount: string
  currency: string
  network: string
  priority: string
  description: string
  isActive: boolean
}

const defaultRuleForm: PricingRuleFormState = {
  pattern: "",
  methods: "GET",
  amount: "0.10",
  currency: "USDC",
  network: "algorand",
  priority: "0",
  description: "",
  isActive: true,
}

interface LinkFormState {
  name: string
  slug: string
  amount: string
  currency: string
  network: string
  payToAddress: string
  platformFeePercent: string
  successUrl: string
  callbackUrl: string
  metadata: string
}

const defaultLinkForm: LinkFormState = {
  name: "",
  slug: "",
  amount: "1.00",
  currency: "USDC",
  network: "algorand",
  payToAddress: "",
  platformFeePercent: "5",
  successUrl: "",
  callbackUrl: "",
  metadata: "",
}

interface WidgetFormState extends LinkFormState {
  description: string
}

const defaultWidgetForm: WidgetFormState = {
  ...defaultLinkForm,
  description: "",
}

interface CreditPlanFormState {
  name: string
  slug: string
  amount: string
  currency: string
  network: string
  creditsPerPayment: string
  payToAddress: string
  platformFeePercent: string
  description: string
  metadata: string
}

const defaultCreditPlanForm: CreditPlanFormState = {
  name: "",
  slug: "",
  amount: "10.00",
  currency: "USDC",
  network: "algorand",
  creditsPerPayment: "100",
  payToAddress: "",
  platformFeePercent: "5",
  description: "",
  metadata: "",
}

function PricingRulesTab() {
  const { toast } = useToast()
  const { rules, loading, error, mutating, createRule, updateRule, deleteRule, toggleRuleStatus, refetch } =
    useX402PricingRules()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<X402PricingRule | null>(null)
  const [form, setForm] = useState<PricingRuleFormState>(defaultRuleForm)

  const sortedRules = useMemo(() => [...rules].sort((a, b) => b.priority - a.priority), [rules])

  const openCreateDialog = () => {
    setEditingRule(null)
    setForm(defaultRuleForm)
    setDialogOpen(true)
  }

  const openEditDialog = (rule: X402PricingRule) => {
    setEditingRule(rule)
    setForm({
      pattern: rule.pattern,
      methods: rule.methods.join(", "),
      amount: rule.amount,
      currency: rule.currency,
      network: rule.network,
      priority: rule.priority.toString(),
      description: rule.description ?? "",
      isActive: rule.is_active,
    })
    setDialogOpen(true)
  }

  const handleFormChange = (field: keyof PricingRuleFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const buildPayload = () => {
    const pattern = form.pattern.trim()
    if (!pattern) {
      toast({ title: "Pattern is required", variant: "destructive" })
      return null
    }

    const methods = parseMethods(form.methods)
    if (!methods.length) {
      toast({ title: "Add at least one HTTP method", variant: "destructive" })
      return null
    }

    const amountValue = safeNumber(form.amount)
    if (!amountValue || amountValue <= 0) {
      toast({ title: "Amount must be greater than 0", variant: "destructive" })
      return null
    }

    const priorityValue = Number.parseInt(form.priority, 10)

    return {
      pattern,
      methods,
      amount: form.amount.trim(),
      currency: form.currency.trim().toUpperCase(),
      network: form.network.trim().toLowerCase(),
      priority: Number.isFinite(priorityValue) ? priorityValue : 0,
      description: form.description.trim() ? form.description.trim() : null,
      is_active: form.isActive,
    }
  }

  const handleSubmit = async () => {
    const payload = buildPayload()
    if (!payload) return

    if (editingRule) {
      const { success, error: err } = await updateRule(editingRule.id, payload)
      if (!success) {
        toast({ title: "Unable to update rule", description: err, variant: "destructive" })
        return
      }
      toast({ title: "Pricing rule updated" })
    } else {
      const { success, error: err } = await createRule(payload)
      if (!success) {
        toast({ title: "Unable to create rule", description: err, variant: "destructive" })
        return
      }
      toast({ title: "Pricing rule created" })
    }

    setDialogOpen(false)
  }

  const handleDelete = async (rule: X402PricingRule) => {
    if (!window.confirm(`Delete pricing rule for ${rule.pattern}?`)) return
    const { success, error: err } = await deleteRule(rule.id)
    if (!success) {
      toast({ title: "Unable to delete rule", description: err, variant: "destructive" })
    } else {
      toast({ title: "Pricing rule deleted" })
    }
  }

  const handleToggle = async (rule: X402PricingRule) => {
    const { success, error: err } = await toggleRuleStatus(rule)
    if (!success) {
      toast({ title: "Unable to update status", description: err, variant: "destructive" })
    } else {
      toast({ title: `Rule ${rule.is_active ? "disabled" : "activated"}` })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-2xl">Pricing rules</CardTitle>
          <CardDescription>Configure micropayment requirements based on path, method, and priority.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={loading || mutating}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> New rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading pricing rules...</div>
        ) : sortedRules.length ? (
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Methods</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-mono text-xs sm:text-sm">{rule.pattern}</TableCell>
                    <TableCell>{rule.methods.join(", ")}</TableCell>
                    <TableCell>{rule.amount}</TableCell>
                    <TableCell>{rule.currency}</TableCell>
                    <TableCell className="capitalize">{rule.network}</TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={rule.is_active} onCheckedChange={() => handleToggle(rule)} disabled={mutating} />
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(rule)} disabled={mutating}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rule)} disabled={mutating}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
            No pricing rules yet. Create one to start protecting your endpoints with x402 micropayments.
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit pricing rule" : "Create pricing rule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pattern">Request pattern</Label>
              <Input
                id="pattern"
                placeholder="/api/analytics/reports"
                value={form.pattern}
                onChange={(event) => handleFormChange("pattern", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="methods">HTTP methods</Label>
              <Input
                id="methods"
                placeholder="GET, POST"
                value={form.methods}
                onChange={(event) => handleFormChange("methods", event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separated by comma or space. Methods will be uppercased automatically.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => handleFormChange("amount", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" value={form.currency} onChange={(event) => handleFormChange("currency", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Input id="network" value={form.network} onChange={(event) => handleFormChange("network", event.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={form.priority}
                  onChange={(event) => handleFormChange("priority", event.target.value)}
                />
                <p className="text-xs text-muted-foreground">Higher priority rules match first.</p>
              </div>
              <div className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
                <div>
                  <Label htmlFor="is-active" className="text-sm font-medium">
                    Active by default
                  </Label>
                  <p className="text-xs text-muted-foreground">Toggle to disable without deleting the rule.</p>
                </div>
                <Switch id="is-active" checked={form.isActive} onCheckedChange={(checked) => handleFormChange("isActive", checked)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional context for admins"
                value={form.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={mutating}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutating}>
              {mutating ? "Saving..." : editingRule ? "Save changes" : "Create rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function PaymentLinksTab({ defaultPayToAddress, tenantId, paywallBase }: { defaultPayToAddress: string; tenantId: string; paywallBase?: string }) {
  const { toast } = useToast()
  const { links, loading, error, mutating, refetch, createLink, updateLink, deleteLink } = useX402Links()

  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [eventsDialogOpen, setEventsDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<X402Link | null>(null)
  const [selectedLink, setSelectedLink] = useState<X402Link | null>(null)
  const [form, setForm] = useState<LinkFormState>({ ...defaultLinkForm, payToAddress: defaultPayToAddress })

  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return links
    return links.filter((link) =>
      [link.name, link.slug, link.pay_to_address].some((value) => value?.toLowerCase().includes(query)),
    )
  }, [links, search])

  const totals = useMemo(() => {
    return filteredLinks.reduce(
      (acc, link) => {
        const revenue = sumRevenue(link.events)
        return {
          fee: acc.fee + revenue.fee,
          merchant: acc.merchant + revenue.merchant,
          gross: acc.gross + revenue.gross,
        }
      },
      { fee: 0, merchant: 0, gross: 0 },
    )
  }, [filteredLinks])

  const openCreateDialog = () => {
    setEditingLink(null)
    setForm({ ...defaultLinkForm, payToAddress: defaultPayToAddress })
    setDialogOpen(true)
  }

  const openEditDialog = (link: X402Link) => {
    setEditingLink(link)
    setForm({
      name: link.name,
      slug: link.slug,
      amount: link.amount,
      currency: link.currency,
      network: link.network,
      payToAddress: link.pay_to_address,
      platformFeePercent: link.platform_fee_percent,
      successUrl: link.success_url ?? "",
      callbackUrl: link.callback_url ?? "",
      metadata: link.metadata ? JSON.stringify(link.metadata, null, 2) : "",
    })
    setDialogOpen(true)
  }

  const handleFormChange = (field: keyof LinkFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const buildPayload = () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" })
      return null
    }

    const metadata = parseJSON(form.metadata)
    if (metadata.error) {
      toast({ title: "Invalid metadata", description: metadata.error, variant: "destructive" })
      return null
    }

    return {
      name: form.name.trim(),
      slug: form.slug.trim(),
      amount: form.amount.trim(),
      currency: form.currency.trim().toUpperCase(),
      network: form.network.trim().toLowerCase(),
      pay_to_address: form.payToAddress.trim(),
      platform_fee_percent: form.platformFeePercent.trim(),
      success_url: form.successUrl.trim() || null,
      callback_url: form.callbackUrl.trim() || null,
      metadata: metadata.data,
    }
  }

  const handleSubmit = async () => {
    const payload = buildPayload()
    if (!payload) return

    if (editingLink) {
      const { success, error: err } = await updateLink(editingLink.id, payload)
      if (!success) {
        toast({ title: "Unable to update link", description: err, variant: "destructive" })
        return
      }
      toast({ title: "Payment link updated" })
    } else {
      const { success, error: err } = await createLink(payload)
      if (!success) {
        toast({ title: "Unable to create link", description: err, variant: "destructive" })
        return
      }
      toast({ title: "Payment link created" })
    }

    setDialogOpen(false)
  }

  const handleDelete = async (link: X402Link) => {
    if (!window.confirm(`Delete payment link ${link.name}?`)) return
    const { success, error: err } = await deleteLink(link.id)
    if (!success) {
      toast({ title: "Unable to delete link", description: err, variant: "destructive" })
    } else {
      toast({ title: "Payment link deleted" })
    }
  }

  const handleCopyUrl = async (link: X402Link) => {
    const url = buildPaywallUrl(paywallBase, tenantId, "links", link.slug)
    const ok = await copyToClipboard(url)
    toast({ title: ok ? "Paywall URL copied" : "Unable to copy URL", variant: ok ? "default" : "destructive" })
  }

  const openEventsDialog = (link: X402Link) => {
    setSelectedLink(link)
    setEventsDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-2xl">Payment links</CardTitle>
          <CardDescription>Shareable checkout pages with real-time fee tracking.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search by name, slug, or address"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-56"
          />
          <Button variant="outline" onClick={() => refetch()} disabled={loading || mutating}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> New link
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
            <p className="text-xs uppercase text-muted-foreground">Total gross</p>
            <p className="mt-1 text-lg font-semibold">{totals.gross.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
            <p className="text-xs uppercase text-muted-foreground">Merchant revenue</p>
            <p className="mt-1 text-lg font-semibold text-emerald-400">{totals.merchant.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
            <p className="text-xs uppercase text-muted-foreground">Platform fees</p>
            <p className="mt-1 text-lg font-semibold text-sky-400">{totals.fee.toFixed(2)}</p>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading links...</div>
        ) : filteredLinks.length ? (
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Pay to</TableHead>
                  <TableHead>Platform fee %</TableHead>
                  <TableHead>Merchant revenue</TableHead>
                  <TableHead>Platform fees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link) => {
                  const revenue = sumRevenue(link.events)
                  return (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{link.name}</span>
                          <span className="text-xs text-muted-foreground">{link.currency} · {link.network}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{link.slug}</TableCell>
                      <TableCell>{link.amount}</TableCell>
                      <TableCell className="font-mono text-xs">{link.pay_to_address}</TableCell>
                      <TableCell>{link.platform_fee_percent}</TableCell>
                      <TableCell>{revenue.merchant.toFixed(2)}</TableCell>
                      <TableCell>{revenue.fee.toFixed(2)}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleCopyUrl(link)} title="Copy paywall URL">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEventsDialog(link)} title="View revenue events">
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(link)} disabled={mutating}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(link)} disabled={mutating}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
            No payment links yet. Create one to let customers unlock premium API calls.
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Edit payment link" : "Create payment link"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="link-name">Name</Label>
              <Input id="link-name" value={form.name} onChange={(event) => handleFormChange("name", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-slug">Slug</Label>
              <Input id="link-slug" value={form.slug} onChange={(event) => handleFormChange("slug", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-amount">Amount</Label>
              <Input
                id="link-amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(event) => handleFormChange("amount", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-currency">Currency</Label>
              <Input
                id="link-currency"
                value={form.currency}
                onChange={(event) => handleFormChange("currency", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-network">Network</Label>
              <Input id="link-network" value={form.network} onChange={(event) => handleFormChange("network", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-payto">Pay to address</Label>
              <Input
                id="link-payto"
                value={form.payToAddress}
                onChange={(event) => handleFormChange("payToAddress", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-fee">Platform fee %</Label>
              <Input
                id="link-fee"
                type="number"
                step="0.1"
                value={form.platformFeePercent}
                onChange={(event) => handleFormChange("platformFeePercent", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-success">Success URL</Label>
              <Input
                id="link-success"
                placeholder="https://app.yourcompany.com/success"
                value={form.successUrl}
                onChange={(event) => handleFormChange("successUrl", event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="link-callback">Callback URL</Label>
              <Input
                id="link-callback"
                placeholder="https://api.yourcompany.com/webhooks/x402"
                value={form.callbackUrl}
                onChange={(event) => handleFormChange("callbackUrl", event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="link-metadata">Metadata (JSON)</Label>
              <Textarea
                id="link-metadata"
                rows={4}
                placeholder='{"product_id":"report-pro"}'
                value={form.metadata}
                onChange={(event) => handleFormChange("metadata", event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={mutating}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutating}>
              {mutating ? "Saving..." : editingLink ? "Save changes" : "Create link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={eventsDialogOpen} onOpenChange={setEventsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Revenue events</DialogTitle>
            <CardDescription>{selectedLink?.name}</CardDescription>
          </DialogHeader>
          {selectedLink?.events?.length ? (
            <div className="max-h-96 overflow-y-auto rounded-md border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gross</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Platform fee</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedLink.events?.map((event) => (
                    <TableRow key={event.created_at + (event.id ?? "")}> 
                      <TableCell>{safeNumber(event.amount).toFixed(2)}</TableCell>
                      <TableCell>{safeNumber(event.merchant_amount).toFixed(2)}</TableCell>
                      <TableCell>{safeNumber(event.fee_amount).toFixed(2)}</TableCell>
                      <TableCell>{formatDateTime(event.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
              No events recorded yet.
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setEventsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function WidgetsTab({ defaultPayToAddress, tenantId, paywallBase }: { defaultPayToAddress: string; tenantId: string; paywallBase?: string }) {
  const { toast } = useToast()
  const { widgets, loading, error, mutating, refetch, createWidget, updateWidget, deleteWidget } = useX402Widgets()

  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<X402Widget | null>(null)
  const [eventsDialogOpen, setEventsDialogOpen] = useState(false)
  const [form, setForm] = useState<WidgetFormState>({ ...defaultWidgetForm, payToAddress: defaultPayToAddress })

  const filteredWidgets = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return widgets
    return widgets.filter((widget) =>
      [widget.name, widget.slug, widget.pay_to_address].some((value) => value?.toLowerCase().includes(query)),
    )
  }, [widgets, search])

  const totals = useMemo(() => {
    return filteredWidgets.reduce(
      (acc, widget) => {
        const revenue = sumRevenue(widget.events)
        return {
          fee: acc.fee + revenue.fee,
          merchant: acc.merchant + revenue.merchant,
          gross: acc.gross + revenue.gross,
        }
      },
      { fee: 0, merchant: 0, gross: 0 },
    )
  }, [filteredWidgets])

  const openCreateDialog = () => {
    setSelectedWidget(null)
    setForm({ ...defaultWidgetForm, payToAddress: defaultPayToAddress })
    setDialogOpen(true)
  }

  const openEditDialog = (widget: X402Widget) => {
    setSelectedWidget(widget)
    setForm({
      name: widget.name,
      slug: widget.slug,
      amount: widget.amount,
      currency: widget.currency,
      network: widget.network,
      payToAddress: widget.pay_to_address,
      platformFeePercent: widget.platform_fee_percent,
      successUrl: widget.success_url ?? "",
      callbackUrl: widget.callback_url ?? "",
      metadata: widget.metadata ? JSON.stringify(widget.metadata, null, 2) : "",
      description: widget.metadata?.description ? String(widget.metadata.description) : "",
    })
    setDialogOpen(true)
  }

  const handleFormChange = (field: keyof WidgetFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const buildPayload = () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" })
      return null
    }

    const metadata = parseJSON(form.metadata)
    if (metadata.error) {
      toast({ title: "Invalid metadata", description: metadata.error, variant: "destructive" })
      return null
    }

    const mergedMetadata = metadata.data ?? (form.description.trim() ? { description: form.description.trim() } : null)
    const payload: Parameters<typeof createWidget>[0] = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      amount: form.amount.trim(),
      currency: form.currency.trim().toUpperCase(),
      network: form.network.trim().toLowerCase(),
      pay_to_address: form.payToAddress.trim(),
      platform_fee_percent: form.platformFeePercent.trim(),
      success_url: form.successUrl.trim() || null,
      callback_url: form.callbackUrl.trim() || null,
      metadata: mergedMetadata,
    }
    return payload
  }

  const handleSubmit = async () => {
    const payload = buildPayload()
    if (!payload) return

    if (selectedWidget) {
      const { success, error: err } = await updateWidget(selectedWidget.id, payload)
      if (!success) {
        toast({ title: "Unable to update widget", description: err, variant: "destructive" })
        return
      }
      toast({ title: "Widget updated" })
    } else {
      const { success, error: err } = await createWidget(payload)
      if (!success) {
        toast({ title: "Unable to create widget", description: err, variant: "destructive" })
        return
      }
      toast({ title: "Widget created" })
    }

    setDialogOpen(false)
  }

  const handleDelete = async (widget: X402Widget) => {
    if (!window.confirm(`Delete widget ${widget.name}?`)) return
    const { success, error: err } = await deleteWidget(widget.id)
    if (!success) {
      toast({ title: "Unable to delete widget", description: err, variant: "destructive" })
    } else {
      toast({ title: "Widget deleted" })
    }
  }

  const handleCopyEmbed = async (widget: X402Widget) => {
    const paywallUrl = buildPaywallUrl(paywallBase, tenantId, "widgets", widget.slug)
    const snippet = `<div id="x402-widget" data-widget-slug="${widget.slug}" data-tenant-id="${tenantId}"></div>\n<script src="${paywallUrl}" async></script>`
    const ok = await copyToClipboard(snippet)
    toast({ title: ok ? "Embed code copied" : "Unable to copy embed code", variant: ok ? "default" : "destructive" })
  }

  const openEventsDialog = (widget: X402Widget) => {
    setSelectedWidget(widget)
    setEventsDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-2xl">Embedded widgets</CardTitle>
          <CardDescription>Configure and embed checkout widgets into your product.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search by name, slug, or address"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-56"
          />
          <Button variant="outline" onClick={() => refetch()} disabled={loading || mutating}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> New widget
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
            <p className="text-xs uppercase text-muted-foreground">Total gross</p>
            <p className="mt-1 text-lg font-semibold">{totals.gross.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
            <p className="text-xs uppercase text-muted-foreground">Merchant revenue</p>
            <p className="mt-1 text-lg font-semibold text-emerald-400">{totals.merchant.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
            <p className="text-xs uppercase text-muted-foreground">Platform fees</p>
            <p className="mt-1 text-lg font-semibold text-sky-400">{totals.fee.toFixed(2)}</p>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading widgets...</div>
        ) : filteredWidgets.length ? (
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Pay to</TableHead>
                  <TableHead>Platform fee %</TableHead>
                  <TableHead>Merchant revenue</TableHead>
                  <TableHead>Platform fees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWidgets.map((widget) => {
                  const revenue = sumRevenue(widget.events)
                  return (
                    <TableRow key={widget.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{widget.name}</span>
                          <span className="text-xs text-muted-foreground">{widget.currency} · {widget.network}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{widget.slug}</TableCell>
                      <TableCell>{widget.amount}</TableCell>
                      <TableCell className="font-mono text-xs">{widget.pay_to_address}</TableCell>
                      <TableCell>{widget.platform_fee_percent}</TableCell>
                      <TableCell>{revenue.merchant.toFixed(2)}</TableCell>
                      <TableCell>{revenue.fee.toFixed(2)}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleCopyEmbed(widget)} title="Copy embed snippet">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEventsDialog(widget)} title="View revenue events">
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(widget)} disabled={mutating}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(widget)} disabled={mutating}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
            No widgets yet. Create one to embed the paywall in your app.
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedWidget ? "Edit widget" : "Create widget"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="widget-name">Name</Label>
              <Input id="widget-name" value={form.name} onChange={(event) => handleFormChange("name", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-slug">Slug</Label>
              <Input id="widget-slug" value={form.slug} onChange={(event) => handleFormChange("slug", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-amount">Amount</Label>
              <Input
                id="widget-amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(event) => handleFormChange("amount", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-currency">Currency</Label>
              <Input
                id="widget-currency"
                value={form.currency}
                onChange={(event) => handleFormChange("currency", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-network">Network</Label>
              <Input id="widget-network" value={form.network} onChange={(event) => handleFormChange("network", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-payto">Pay to address</Label>
              <Input
                id="widget-payto"
                value={form.payToAddress}
                onChange={(event) => handleFormChange("payToAddress", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-fee">Platform fee %</Label>
              <Input
                id="widget-fee"
                type="number"
                step="0.1"
                value={form.platformFeePercent}
                onChange={(event) => handleFormChange("platformFeePercent", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-success">Success URL</Label>
              <Input
                id="widget-success"
                placeholder="https://app.yourcompany.com/success"
                value={form.successUrl}
                onChange={(event) => handleFormChange("successUrl", event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="widget-callback">Callback URL</Label>
              <Input
                id="widget-callback"
                placeholder="https://api.yourcompany.com/webhooks/x402"
                value={form.callbackUrl}
                onChange={(event) => handleFormChange("callbackUrl", event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="widget-description">Description</Label>
              <Input
                id="widget-description"
                placeholder="Optional helper text for users"
                value={form.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="widget-metadata">Metadata (JSON)</Label>
              <Textarea
                id="widget-metadata"
                rows={4}
                placeholder='{"product_id":"report-pro"}'
                value={form.metadata}
                onChange={(event) => handleFormChange("metadata", event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={mutating}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutating}>
              {mutating ? "Saving..." : selectedWidget ? "Save changes" : "Create widget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={eventsDialogOpen} onOpenChange={setEventsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Revenue events</DialogTitle>
            <CardDescription>{selectedWidget?.name}</CardDescription>
          </DialogHeader>
          {selectedWidget?.events?.length ? (
            <div className="max-h-96 overflow-y-auto rounded-md border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gross</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Platform fee</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedWidget.events?.map((event) => (
                    <TableRow key={event.created_at + (event.id ?? "")}> 
                      <TableCell>{safeNumber(event.amount).toFixed(2)}</TableCell>
                      <TableCell>{safeNumber(event.merchant_amount).toFixed(2)}</TableCell>
                      <TableCell>{safeNumber(event.fee_amount).toFixed(2)}</TableCell>
                      <TableCell>{formatDateTime(event.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
              No events recorded yet.
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setEventsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function CreditPlansTab({ defaultPayToAddress }: { defaultPayToAddress: string }) {
  const { toast } = useToast()
  const { plans, loading, error, mutating, refetch, createPlan, updatePlan, deletePlan } = useX402CreditPlans()

  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<X402CreditPlan | null>(null)
  const [form, setForm] = useState<CreditPlanFormState>({ ...defaultCreditPlanForm, payToAddress: defaultPayToAddress })

  const filteredPlans = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return plans
    return plans.filter((plan) => [plan.name, plan.slug, plan.pay_to_address].some((value) => value?.toLowerCase().includes(query)))
  }, [plans, search])

  const openCreateDialog = () => {
    setEditingPlan(null)
    setForm({ ...defaultCreditPlanForm, payToAddress: defaultPayToAddress })
    setDialogOpen(true)
  }

  const openEditDialog = (plan: X402CreditPlan) => {
    setEditingPlan(plan)
    setForm({
      name: plan.name,
      slug: plan.slug,
      amount: plan.amount,
      currency: plan.currency,
      network: plan.network,
      creditsPerPayment: String(plan.credits_per_payment ?? ""),
      payToAddress: plan.pay_to_address,
      platformFeePercent: plan.platform_fee_percent,
      description: plan.description ?? "",
      metadata: plan.metadata ? JSON.stringify(plan.metadata, null, 2) : "",
    })
    setDialogOpen(true)
  }

  const handleFormChange = (field: keyof CreditPlanFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const buildPayload = () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" })
      return null
    }

    const credits = Number.parseInt(form.creditsPerPayment, 10)
    if (!Number.isFinite(credits) || credits <= 0) {
      toast({ title: "Credits per payment must be greater than 0", variant: "destructive" })
      return null
    }

    const metadata = parseJSON(form.metadata)
    if (metadata.error) {
      toast({ title: "Invalid metadata", description: metadata.error, variant: "destructive" })
      return null
    }

    return {
      name: form.name.trim(),
      slug: form.slug.trim(),
      amount: form.amount.trim(),
      currency: form.currency.trim().toUpperCase(),
      network: form.network.trim().toLowerCase(),
      credits_per_payment: credits,
      pay_to_address: form.payToAddress.trim(),
      platform_fee_percent: form.platformFeePercent.trim(),
      description: form.description.trim() || null,
      metadata: metadata.data,
    }
  }

  const handleSubmit = async () => {
    const payload = buildPayload()
    if (!payload) return

    if (editingPlan) {
      const { success, error: err } = await updatePlan(editingPlan.id, payload)
      if (!success) {
        toast({ title: "Unable to update credit plan", description: err, variant: "destructive" })
        return
      }
      toast({ title: "Credit plan updated" })
    } else {
      const { success, error: err } = await createPlan(payload)
      if (!success) {
        toast({ title: "Unable to create credit plan", description: err, variant: "destructive" })
        return
      }
      toast({ title: "Credit plan created" })
    }

    setDialogOpen(false)
  }

  const handleDelete = async (plan: X402CreditPlan) => {
    if (!window.confirm(`Delete credit plan ${plan.name}?`)) return
    const { success, error: err } = await deletePlan(plan.id)
    if (!success) {
      toast({ title: "Unable to delete credit plan", description: err, variant: "destructive" })
    } else {
      toast({ title: "Credit plan deleted" })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-2xl">Credit plans</CardTitle>
          <CardDescription>Prepaid credit packs used by consumers to unlock usage.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search plans"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-56"
          />
          <Button variant="outline" onClick={() => refetch()} disabled={loading || mutating}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> New plan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading credit plans...</div>
        ) : filteredPlans.length ? (
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Pay to</TableHead>
                  <TableHead>Platform fee %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-xs text-muted-foreground">{plan.currency} · {plan.network}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{plan.slug}</TableCell>
                    <TableCell>{plan.amount}</TableCell>
                    <TableCell>{plan.credits_per_payment}</TableCell>
                    <TableCell className="font-mono text-xs">{plan.pay_to_address}</TableCell>
                    <TableCell>{plan.platform_fee_percent}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)} disabled={mutating}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(plan)} disabled={mutating}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
            No credit plans yet. Create one to start selling prepaid usage.
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit credit plan" : "Create credit plan"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input id="plan-name" value={form.name} onChange={(event) => handleFormChange("name", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-slug">Slug</Label>
              <Input id="plan-slug" value={form.slug} onChange={(event) => handleFormChange("slug", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-amount">Amount</Label>
              <Input
                id="plan-amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(event) => handleFormChange("amount", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-currency">Currency</Label>
              <Input
                id="plan-currency"
                value={form.currency}
                onChange={(event) => handleFormChange("currency", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-network">Network</Label>
              <Input id="plan-network" value={form.network} onChange={(event) => handleFormChange("network", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-credits">Credits per payment</Label>
              <Input
                id="plan-credits"
                type="number"
                min="1"
                value={form.creditsPerPayment}
                onChange={(event) => handleFormChange("creditsPerPayment", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-payto">Pay to address</Label>
              <Input
                id="plan-payto"
                value={form.payToAddress}
                onChange={(event) => handleFormChange("payToAddress", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-fee">Platform fee %</Label>
              <Input
                id="plan-fee"
                type="number"
                step="0.1"
                value={form.platformFeePercent}
                onChange={(event) => handleFormChange("platformFeePercent", event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="plan-description">Description</Label>
              <Input
                id="plan-description"
                placeholder="Optional helper text"
                value={form.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="plan-metadata">Metadata (JSON)</Label>
              <Textarea
                id="plan-metadata"
                rows={4}
                placeholder='{"tier":"gold"}'
                value={form.metadata}
                onChange={(event) => handleFormChange("metadata", event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={mutating}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutating}>
              {mutating ? "Saving..." : editingPlan ? "Save changes" : "Create plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function ReceiptsTab() {
  const { receipts, loading, error, count, refetch } = useX402Receipts()
  const [status, setStatus] = useState("")
  const [path, setPath] = useState("")
  const [method, setMethod] = useState("")

  const totals = useMemo(() => {
    return receipts.reduce(
      (acc, receipt) => ({
        gross: acc.gross + safeNumber(receipt.amount),
      }),
      { gross: 0 },
    )
  }, [receipts])

  const buildFilters = () => {
    const filters: Record<string, string> = {}
    if (status) filters.status = status
    if (path) filters.path = path
    if (method) filters.method = method
    return filters
  }

  const applyFilters = async () => {
    await refetch(buildFilters())
  }

  const resetFilters = async () => {
    setStatus("")
    setPath("")
    setMethod("")
    await refetch({})
  }

  const handleManualRefresh = async () => {
    const filters = buildFilters()
    await refetch(Object.keys(filters).length ? filters : undefined)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-2xl">Payment receipts</CardTitle>
          <CardDescription>Track wallet receipts returned by the x402 pay-per-call workflow.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleManualRefresh}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="receipt-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="receipt-status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((option) => (
                  <SelectItem key={option.value || "all"} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt-path">Path contains</Label>
            <Input
              id="receipt-path"
              placeholder="/api/analytics"
              value={path}
              onChange={(event) => setPath(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt-method">Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="receipt-method">
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All methods</SelectItem>
                {methodOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={applyFilters} className="flex-1" disabled={loading}>
              Apply filters
            </Button>
            <Button variant="outline" onClick={resetFilters} disabled={loading}>
              Reset
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>Total receipts: {count}</span>
          <span>Total amount: {totals.gross.toFixed(2)}</span>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading receipts...</div>
        ) : receipts.length ? (
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nonce</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Expected receiver</TableHead>
                  <TableHead>Verified at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-mono text-xs sm:text-sm">{receipt.nonce}</TableCell>
                    <TableCell>{receipt.amount}</TableCell>
                    <TableCell>{receipt.currency}</TableCell>
                    <TableCell>
                      <Badge variant={receipt.status === "verified" ? "default" : "secondary"} className="capitalize">
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs sm:text-sm">{receipt.payer_address || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs sm:text-sm">{receipt.request_path}</span>
                        <span className="text-xs text-muted-foreground">{receipt.request_method ?? ""}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs sm:text-sm">
                      {(receipt.metadata as { expected_receiver?: string } | undefined)?.expected_receiver ?? "—"}
                    </TableCell>
                    <TableCell>{formatDateTime(receipt.verified_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
            No receipts recorded yet. Payments will appear here after users unlock protected endpoints.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CreditSubscriptionsTab({ tenantId, paywallBase }: { tenantId: string; paywallBase?: string }) {
  const { toast } = useToast()
  const { plans } = useX402CreditPlans()
  const {
    subscriptions,
    loading: subsLoading,
    error: subsError,
    count: subsCount,
    refetch: refetchSubscriptions,
    consumeCredits,
    mutating,
  } = useX402CreditSubscriptions()
  const { usage, loading: usageLoading, error: usageError, count: usageCount, refetch: refetchUsage } = useX402CreditUsage()

  const [planFilter, setPlanFilter] = useState("")
  const [consumerFilter, setConsumerFilter] = useState("")
  const [usageType, setUsageType] = useState("")
  const [consumeDialogOpen, setConsumeDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<X402CreditSubscription | null>(null)
  const [creditsToConsume, setCreditsToConsume] = useState("1")
  const [consumeDescription, setConsumeDescription] = useState("")

  const subscriptionTotals = useMemo(() => {
    return subscriptions.reduce(
      (acc, sub) => ({
        remaining: acc.remaining + (sub.credits_remaining ?? 0),
        total: acc.total + (sub.total_credits ?? 0),
      }),
      { remaining: 0, total: 0 },
    )
  }, [subscriptions])

  const usageTotals = useMemo(() => {
    return usage.reduce(
      (acc, entry) => ({
        credits: acc.credits + safeNumber(entry.credits_delta),
        merchant: acc.merchant + safeNumber(entry.merchant_amount),
        fee: acc.fee + safeNumber(entry.fee_amount),
      }),
      { credits: 0, merchant: 0, fee: 0 },
    )
  }, [usage])

  const buildFilters = () => {
    const filters: Record<string, string> = {}
    if (planFilter) filters.plan = planFilter
    if (consumerFilter) filters.consumer = consumerFilter
    return filters
  }

  const applyFilters = async () => {
    const filters = buildFilters()
    await Promise.all([
      refetchSubscriptions(filters),
      refetchUsage({ ...filters, ...(usageType ? { type: usageType } : {}) }),
    ])
  }

  const resetFilters = async () => {
    setPlanFilter("")
    setConsumerFilter("")
    setUsageType("")
    await Promise.all([refetchSubscriptions({}), refetchUsage({})])
  }

  const openConsumeDialog = (subscription: X402CreditSubscription) => {
    setSelectedSubscription(subscription)
    setCreditsToConsume("1")
    setConsumeDescription("")
    setConsumeDialogOpen(true)
  }

  const handleConsume = async () => {
    if (!selectedSubscription) return
    const credits = Number.parseInt(creditsToConsume, 10)
    if (!Number.isFinite(credits) || credits <= 0) {
      toast({ title: "Credits must be greater than 0", variant: "destructive" })
      return
    }

    const { success, error: err } = await consumeCredits(selectedSubscription.id, {
      credits,
      description: consumeDescription.trim() || undefined,
    })

    if (!success) {
      toast({ title: "Unable to consume credits", description: err, variant: "destructive" })
      return
    }

    toast({ title: "Credits consumed" })
    setConsumeDialogOpen(false)
    await applyFilters()
  }

  const handleCopyCreditUrl = async (subscription: X402CreditSubscription) => {
    const planSlug = typeof subscription.plan === "string" ? subscription.plan : subscription.plan.slug
    const url = buildPaywallUrl(paywallBase, tenantId, "credits", planSlug, subscription.consumer_ref)
    const ok = await copyToClipboard(url)
    toast({ title: ok ? "Credits URL copied" : "Unable to copy credits URL", variant: ok ? "default" : "destructive" })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Credit subscriptions</CardTitle>
            <CardDescription>Monitor prepaid balances and trigger manual consumption when needed.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All plans</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.slug}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Consumer reference"
              value={consumerFilter}
              onChange={(event) => setConsumerFilter(event.target.value)}
              className="w-48"
            />
            <Button onClick={applyFilters} disabled={subsLoading || usageLoading}>
              Apply filters
            </Button>
            <Button variant="outline" onClick={resetFilters} disabled={subsLoading || usageLoading}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
              <p className="text-xs uppercase text-muted-foreground">Subscriptions</p>
              <p className="mt-1 text-lg font-semibold">{subsCount}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
              <p className="text-xs uppercase text-muted-foreground">Credits remaining</p>
              <p className="mt-1 text-lg font-semibold text-emerald-400">{subscriptionTotals.remaining}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
              <p className="text-xs uppercase text-muted-foreground">Credits sold</p>
              <p className="mt-1 text-lg font-semibold text-sky-400">{subscriptionTotals.total}</p>
            </div>
          </div>

          {subsError ? (
            <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{subsError}</span>
            </div>
          ) : null}

          {subsLoading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading subscriptions...</div>
          ) : subscriptions.length ? (
            <div className="overflow-hidden rounded-lg border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consumer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Credits remaining</TableHead>
                    <TableHead>Total credits</TableHead>
                    <TableHead>Last purchase</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => {
                    const plan = typeof subscription.plan === "string" ? subscription.plan : subscription.plan.name
                    return (
                      <TableRow key={subscription.id}>
                        <TableCell className="font-mono text-xs sm:text-sm">{subscription.consumer_ref}</TableCell>
                        <TableCell>{plan}</TableCell>
                        <TableCell>{subscription.credits_remaining}</TableCell>
                        <TableCell>{subscription.total_credits}</TableCell>
                        <TableCell>{formatDateTime(subscription.last_purchase_at)}</TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyCreditUrl(subscription)}
                            title="Copy paywall URL"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openConsumeDialog(subscription)}
                            disabled={mutating}
                            title="Consume credits"
                          >
                            <Wallet2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
              No active credit subscriptions yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Credit usage</CardTitle>
            <CardDescription>Auditable top-ups and consumption events.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={usageType} onValueChange={setUsageType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Usage type" />
              </SelectTrigger>
              <SelectContent>
                {usageTypeFilters.map((option) => (
                  <SelectItem key={option.value || "all"} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={applyFilters} disabled={subsLoading || usageLoading}>
              Update view
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
              <p className="text-xs uppercase text-muted-foreground">Events</p>
              <p className="mt-1 text-lg font-semibold">{usageCount}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
              <p className="text-xs uppercase text-muted-foreground">Credits delta</p>
              <p className="mt-1 text-lg font-semibold text-emerald-400">{usageTotals.credits}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-muted/20 p-4">
              <p className="text-xs uppercase text-muted-foreground">Revenue split</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Merchant {usageTotals.merchant.toFixed(2)} · Platform {usageTotals.fee.toFixed(2)}
              </p>
            </div>
          </div>

          {usageError ? (
            <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{usageError}</span>
            </div>
          ) : null}

          {usageLoading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading usage...</div>
          ) : usage.length ? (
            <div className="overflow-hidden rounded-lg border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Credits delta</TableHead>
                    <TableHead>Merchant revenue</TableHead>
                    <TableHead>Platform fee</TableHead>
                    <TableHead>Consumer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge variant={entry.usage_type === "top_up" ? "default" : "secondary"} className="capitalize">
                          {entry.usage_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.credits_delta}</TableCell>
                      <TableCell>{safeNumber(entry.merchant_amount).toFixed(2)}</TableCell>
                      <TableCell>{safeNumber(entry.fee_amount).toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">{entry.consumer_ref ?? "—"}</TableCell>
                      <TableCell>
                        {typeof entry.plan === "string"
                          ? entry.plan
                          : entry.plan?.name ?? "—"}
                      </TableCell>
                      <TableCell>{entry.description ?? "—"}</TableCell>
                      <TableCell>{formatDateTime(entry.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
              No usage events recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={consumeDialogOpen} onOpenChange={setConsumeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consume credits</DialogTitle>
            <CardDescription>
              {selectedSubscription
                ? `Consumer ${selectedSubscription.consumer_ref} · Remaining ${selectedSubscription.credits_remaining}`
                : null}
            </CardDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consume-credits">Credits to consume</Label>
              <Input
                id="consume-credits"
                type="number"
                min="1"
                value={creditsToConsume}
                onChange={(event) => setCreditsToConsume(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consume-description">Description</Label>
              <Input
                id="consume-description"
                placeholder="e.g. API call /analytics/report"
                value={consumeDescription}
                onChange={(event) => setConsumeDescription(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConsumeDialogOpen(false)} disabled={mutating}>
              Cancel
            </Button>
            <Button onClick={handleConsume} disabled={mutating}>
              {mutating ? "Logging..." : "Log consumption"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MicropaymentsPage() {
  const { user } = useAuth()
  const defaultPayToAddress = user?.wallet_address ?? ""
  const tenantId = user?.id ?? "tenant"
  const paywallBase =
    (typeof window !== "undefined" ? process.env.NEXT_PUBLIC_PAYWALL_URL : undefined) ||
    process.env.NEXT_PUBLIC_PAYWALL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Micropayments</h1>
        <p className="text-sm text-muted-foreground">
          Manage x402 pricing rules, payment links, widgets, credit packs, and payment history from a single place.
        </p>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="pricing">Pricing rules</TabsTrigger>
          <TabsTrigger value="links">Payment links</TabsTrigger>
          <TabsTrigger value="widgets">Embedded widgets</TabsTrigger>
          <TabsTrigger value="plans">Credit plans</TabsTrigger>
          <TabsTrigger value="receipts">Payment receipts</TabsTrigger>
          <TabsTrigger value="subscriptions">Credit subscriptions & usage</TabsTrigger>
        </TabsList>
        <TabsContent value="pricing">
          <PricingRulesTab />
        </TabsContent>
        <TabsContent value="links">
          <PaymentLinksTab
            defaultPayToAddress={defaultPayToAddress}
            tenantId={tenantId}
            paywallBase={paywallBase}
          />
        </TabsContent>
        <TabsContent value="widgets">
          <WidgetsTab
            defaultPayToAddress={defaultPayToAddress}
            tenantId={tenantId}
            paywallBase={paywallBase}
          />
        </TabsContent>
        <TabsContent value="plans">
          <CreditPlansTab defaultPayToAddress={defaultPayToAddress} />
        </TabsContent>
        <TabsContent value="receipts">
          <ReceiptsTab />
        </TabsContent>
        <TabsContent value="subscriptions">
          <CreditSubscriptionsTab tenantId={tenantId} paywallBase={paywallBase} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
