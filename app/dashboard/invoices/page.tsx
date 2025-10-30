"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarIcon, Plus, RefreshCw, Search, FileText, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/django-api-client"
import { useInvoices, useSubscriptionPlans, useSubscriptionsList } from "@/hooks/use-django-api"
import { cn } from "@/lib/utils"

interface CreateInvoiceForm {
  subscriptionId: string
  dueDate: string
  notes: string
  currency: string
  description: string
  quantity: number
  unitAmount: string
}

const initialInvoiceForm: CreateInvoiceForm = {
  subscriptionId: "",
  dueDate: "",
  notes: "",
  currency: "ALGO",
  description: "",
  quantity: 1,
  unitAmount: "",
}

export default function InvoicesPage() {
  const { toast } = useToast()
  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useInvoices()
  const { subscriptions } = useSubscriptionsList()
  const { plans } = useSubscriptionPlans()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState<CreateInvoiceForm>(initialInvoiceForm)
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null)

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = [invoice.id, invoice.subscription && typeof invoice.subscription !== "string"
          ? invoice.subscription.plan?.name
          : "", invoice.currency]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, statusFilter])

  const openCreateDialog = () => {
    setInvoiceForm(initialInvoiceForm)
    setCreateDialogOpen(true)
  }

  const handleSubscriptionChange = (subscriptionId: string) => {
    const subscription = subscriptions.find((sub) => sub.id === subscriptionId)
    if (!subscription) {
      setInvoiceForm((prev) => ({ ...prev, subscriptionId, description: "", unitAmount: "", currency: "ALGO" }))
      return
    }

    const plan =
      typeof subscription.plan === "object"
        ? subscription.plan
        : plans.find((p) => p.id === subscription.plan)

    const tier = plan?.price_tiers?.[0]
    setInvoiceForm((prev) => ({
      ...prev,
      subscriptionId,
      currency: tier?.currency ?? plan?.metadata?.currency ?? "ALGO",
      unitAmount: tier?.unit_amount ? String(tier.unit_amount) : "",
      description: plan?.name ?? prev.description,
    }))
  }

  const handleCreateInvoice = async () => {
    if (!invoiceForm.subscriptionId || !invoiceForm.description || !invoiceForm.unitAmount) {
      toast({
        title: "Missing data",
        description: "Subscription, description and amount are required.",
        variant: "destructive",
      })
      return
    }

    const unitAmountValue = Number(invoiceForm.unitAmount)
    if (Number.isNaN(unitAmountValue)) {
      toast({
        title: "Invalid amount",
        description: "Unit amount must be a valid number.",
        variant: "destructive",
      })
      return
    }

    setCreatingInvoice(true)
    try {
      const response = await apiClient.createInvoice({
        subscription_id: invoiceForm.subscriptionId,
        currency: invoiceForm.currency,
        due_date: invoiceForm.dueDate || null,
        notes: invoiceForm.notes || null,
        metadata: {},
        line_items: [
          {
            description: invoiceForm.description,
            quantity: invoiceForm.quantity,
            unit_amount: unitAmountValue.toString(),
            total_amount: (unitAmountValue * Math.max(1, invoiceForm.quantity)).toString(),
          },
        ],
      })

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Invoice created",
        description: `Invoice ${response.data?.id ?? ""} successfully created.`,
      })

      setCreateDialogOpen(false)
      setInvoiceForm(initialInvoiceForm)
      await refetchInvoices()
    } catch (error) {
      toast({
        title: "Unable to create invoice",
        description: error instanceof Error ? error.message : "Unexpected server response.",
        variant: "destructive",
      })
    } finally {
      setCreatingInvoice(false)
    }
  }

  const handlePayInvoice = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId)
    try {
      const response = await apiClient.payInvoice(invoiceId)
      if (response.error) {
        throw new Error(response.error)
      }
      toast({
        title: "Invoice paid",
        description: `Invoice ${invoiceId} has been paid.`,
      })
      await refetchInvoices()
    } catch (error) {
      toast({
        title: "Unable to pay invoice",
        description: error instanceof Error ? error.message : "Unexpected server response.",
        variant: "destructive",
      })
    } finally {
      setPayingInvoiceId(null)
    }
  }

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + Number(invoice.total_amount ?? 0), 0)

  const formatDate = (value?: string | null) => {
    if (!value) return "—"
    try {
      return format(new Date(value), "PPP", { locale: fr })
    } catch {
      return value
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Follow the invoices generated for your subscriptions and trigger payments manually if needed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchInvoices()} disabled={invoicesLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog} disabled={subscriptions.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Create invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total invoices</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{invoices.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid invoices</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {invoices.filter((invoice) => invoice.status === "paid").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total amount</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{totalAmount.toFixed(2)}</CardContent>
        </Card>
      </div>

      {invoicesError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Unable to load invoices</CardTitle>
            <CardDescription>{invoicesError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refetchInvoices()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Search by identifier, plan or currency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Loading invoices…
                    </TableCell>
                  </TableRow>
                )}
                {!invoicesLoading && filteredInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No invoice matches your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filteredInvoices.map((invoice) => {
                  const subscription =
                    typeof invoice.subscription === "object" ? invoice.subscription : undefined
                  const planName = subscription?.plan?.name ?? "Subscription"
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{invoice.id}</span>
                          <span className="text-xs text-muted-foreground">
                            Created {formatDate(invoice.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{planName}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {Number(invoice.total_amount ?? 0).toFixed(2)} {invoice.currency}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(invoice.due_date)}</TableCell>
                      <TableCell className="text-sm capitalize">{invoice.status}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePayInvoice(invoice.id)}
                          disabled={invoice.status === "paid" || payingInvoiceId === invoice.id}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {payingInvoiceId === invoice.id ? "Paying…" : "Pay"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate invoice</DialogTitle>
            <DialogDescription>Select the subscription and adjust the billing details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-subscription">Subscription</Label>
              <Select
                value={invoiceForm.subscriptionId}
                onValueChange={handleSubscriptionChange}
                disabled={subscriptions.length === 0}
              >
                <SelectTrigger id="invoice-subscription">
                  <SelectValue placeholder="Select a subscription" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptions.map((subscription) => (
                    <SelectItem key={subscription.id} value={subscription.id}>
                      {subscription.plan?.name ?? subscription.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-description">Description</Label>
                <Input
                  id="invoice-description"
                  value={invoiceForm.description}
                  onChange={(event) => setInvoiceForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="e.g. Monthly subscription"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-quantity">Quantity</Label>
                <Input
                  id="invoice-quantity"
                  type="number"
                  min={1}
                  value={invoiceForm.quantity}
                  onChange={(event) =>
                    setInvoiceForm((prev) => ({ ...prev, quantity: Number(event.target.value) || 1 }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-amount">Unit amount</Label>
                <Input
                  id="invoice-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceForm.unitAmount}
                  onChange={(event) => setInvoiceForm((prev) => ({ ...prev, unitAmount: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-currency">Currency</Label>
                <Select
                  value={invoiceForm.currency}
                  onValueChange={(value) => setInvoiceForm((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger id="invoice-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALGO">ALGO</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-due">Due date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="invoice-due"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(event) => setInvoiceForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  className={cn("pl-8")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-notes">Notes (optional)</Label>
              <Textarea
                id="invoice-notes"
                placeholder="Internal notes or additional billing details"
                value={invoiceForm.notes}
                onChange={(event) => setInvoiceForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateDialogOpen(false)} disabled={creatingInvoice}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} disabled={creatingInvoice}>
              {creatingInvoice ? "Creating…" : "Create invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
