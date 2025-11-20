"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, RefreshCw, UserCheck, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCoupons, useSubscriptionPlans, useSubscriptionsList } from "@/hooks/use-django-api"
import { apiClient } from "@/lib/django-api-client"

type SubscriptionStatusDisplay = "active" | "cancelled" | "paused" | "expired" | "pending"

const statusLabels: Record<SubscriptionStatusDisplay, string> = {
  active: "Active",
  cancelled: "Cancelled",
  paused: "Paused",
  expired: "Expired",
  pending: "Pending",
}

export default function SubscribersPage() {
  const { toast } = useToast()
  const {
    subscriptions,
    loading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions,
  } = useSubscriptionsList()

  const { plans, loading: plansLoading } = useSubscriptionPlans()
  const { coupons } = useCoupons()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriptionStatusDisplay>("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creatingSubscription, setCreatingSubscription] = useState(false)
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<"cancel" | "resume" | null>(null)

  const [subscriptionForm, setSubscriptionForm] = useState({
    planId: "",
    walletAddress: "",
    quantity: 1,
    couponId: "",
    couponCode: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    customerType: "individual" as "individual" | "business",
    companyName: "",
    vatNumber: "",
    billingAddress: "",
    billingCity: "",
    billingPostalCode: "",
    billingCountry: "",
  })

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      const searchableText = [
        subscription.id,
        subscription.plan?.name,
        subscription.wallet_address,
        subscription.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch = searchableText.includes(searchTerm.toLowerCase())
      const status = (subscription.status?.toLowerCase() as SubscriptionStatusDisplay) || "pending"
      const matchesStatus = statusFilter === "all" || status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [subscriptions, searchTerm, statusFilter])

  const activeSubscriptions = filteredSubscriptions.filter((sub) => sub.status === "active").length
  const churnRate =
    filteredSubscriptions.length === 0
      ? 0
      : (filteredSubscriptions.filter((sub) => sub.status === "cancelled").length / filteredSubscriptions.length) * 100

  const handleCreateSubscription = async () => {
    if (!subscriptionForm.planId || !subscriptionForm.walletAddress) {
      toast({
        title: "Missing data",
        description: "A plan and a wallet address are required.",
        variant: "destructive",
      })
      return
    }

    setCreatingSubscription(true)
    try {
      const response = await apiClient.subscribe(subscriptionForm.planId, {
        walletAddress: subscriptionForm.walletAddress.trim(),
        couponId: subscriptionForm.couponId || undefined,
        couponCode: subscriptionForm.couponCode.trim() || undefined,
        email: subscriptionForm.email.trim() || undefined,
        firstName: subscriptionForm.firstName.trim() || undefined,
        lastName: subscriptionForm.lastName.trim() || undefined,
        phone: subscriptionForm.phone.trim() || undefined,
        customerType: subscriptionForm.customerType,
        companyName:
          subscriptionForm.customerType === "business"
            ? subscriptionForm.companyName.trim() || undefined
            : undefined,
        vatNumber:
          subscriptionForm.customerType === "business"
            ? subscriptionForm.vatNumber.trim() || undefined
            : undefined,
        billingAddress: subscriptionForm.billingAddress.trim() || undefined,
        billingCity: subscriptionForm.billingCity.trim() || undefined,
        billingPostalCode: subscriptionForm.billingPostalCode.trim() || undefined,
        billingCountry: subscriptionForm.billingCountry.trim() || undefined,
        quantity: subscriptionForm.quantity || undefined,
      })

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Subscription created",
        description: `Subscription ${response.data?.subscription?.id ?? ""} successfully created.`,
      })

      setSubscriptionForm({
        planId: "",
        walletAddress: "",
        quantity: 1,
        couponId: "",
        couponCode: "",
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        customerType: "individual",
        companyName: "",
        vatNumber: "",
        billingAddress: "",
        billingCity: "",
        billingPostalCode: "",
        billingCountry: "",
      })
      setCreateDialogOpen(false)
      await refetchSubscriptions()
    } catch (error) {
      toast({
        title: "Unable to create subscription",
        description: error instanceof Error ? error.message : "Unexpected server response.",
        variant: "destructive",
      })
    } finally {
      setCreatingSubscription(false)
    }
  }

  const handleCancel = async (subscriptionId: string, atPeriodEnd = true) => {
    setPendingAction("cancel")
    setSelectedSubscriptionId(subscriptionId)
    try {
      const response = await apiClient.cancelSubscription(subscriptionId, { atPeriodEnd })
      if (response.error) {
        throw new Error(response.error)
      }
      toast({
        title: "Subscription cancelled",
        description: atPeriodEnd
          ? "The subscription will end at the end of the current period."
          : "The subscription has been cancelled immediately.",
      })
      await refetchSubscriptions()
    } catch (error) {
      toast({
        title: "Unable to cancel subscription",
        description: error instanceof Error ? error.message : "Unexpected error.",
        variant: "destructive",
      })
    } finally {
      setPendingAction(null)
      setSelectedSubscriptionId(null)
    }
  }

  const handleResume = async (subscriptionId: string) => {
    setPendingAction("resume")
    setSelectedSubscriptionId(subscriptionId)
    try {
      const response = await apiClient.resumeSubscription(subscriptionId)
      if (response.error) {
        throw new Error(response.error)
      }
      toast({
        title: "Subscription resumed",
        description: "The subscription is active again.",
      })
      await refetchSubscriptions()
    } catch (error) {
      toast({
        title: "Unable to resume subscription",
        description: error instanceof Error ? error.message : "Unexpected error.",
        variant: "destructive",
      })
    } finally {
      setPendingAction(null)
      setSelectedSubscriptionId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscribers</h1>
          <p className="text-muted-foreground">Track and manage every active subscription.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchSubscriptions()} disabled={subscriptionsLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} disabled={plansLoading}>
            <Plus className="mr-2 h-4 w-4" />
            New subscription
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total subscribers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{subscriptions.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-3xl font-bold">
            <UserCheck className="h-5 w-5 text-primary" />
            {activeSubscriptions}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Churn rate</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{churnRate.toFixed(1)}%</CardContent>
        </Card>
      </div>

      {subscriptionsError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Unable to load subscribers</CardTitle>
            <CardDescription>{subscriptionsError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refetchSubscriptions()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>Search by plan name, wallet address or id.</CardDescription>
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
            <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionsLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Loading subscriptions…
                    </TableCell>
                  </TableRow>
                )}
                {!subscriptionsLoading && filteredSubscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No subscription matching your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filteredSubscriptions.map((subscription) => {
                  const status = (subscription.status?.toLowerCase() as SubscriptionStatusDisplay) || "pending"
                  return (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{subscription.plan?.name ?? "Unnamed plan"}</span>
                          <span className="text-xs text-muted-foreground">{subscription.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono">{subscription.wallet_address}</TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "active" ? "default" : status === "cancelled" ? "destructive" : "secondary"}
                          className="capitalize"
                        >
                          {statusLabels[status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(subscription.id)}
                          disabled={pendingAction !== null}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResume(subscription.id)}
                          disabled={pendingAction !== null}
                        >
                          Resume
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
            <DialogTitle>Create subscription</DialogTitle>
            <DialogDescription>
              Provide the wallet address that will be charged and choose the plan to subscribe to.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planId">Plan</Label>
                <Select
                  value={subscriptionForm.planId}
                  onValueChange={(value) => setSubscriptionForm((prev) => ({ ...prev, planId: value }))}
                  disabled={plansLoading}
                >
                  <SelectTrigger id="planId">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Wallet address</Label>
                <Input
                  id="walletAddress"
                  placeholder="ALGOWALLETADDRESS123…"
                  value={subscriptionForm.walletAddress}
                  onChange={(event) =>
                    setSubscriptionForm((prev) => ({ ...prev, walletAddress: event.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  The backend validates the wallet address; make sure it matches an Algorand account.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerType">Customer type</Label>
                <Select
                  value={subscriptionForm.customerType}
                  onValueChange={(value: "individual" | "business") =>
                    setSubscriptionForm((prev) => ({ ...prev, customerType: value }))
                  }
                >
                  <SelectTrigger id="customerType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={subscriptionForm.firstName}
                    onChange={(event) =>
                      setSubscriptionForm((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={subscriptionForm.lastName}
                    onChange={(event) =>
                      setSubscriptionForm((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={subscriptionForm.email}
                    onChange={(event) =>
                      setSubscriptionForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="customer@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={subscriptionForm.phone}
                    onChange={(event) =>
                      setSubscriptionForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    placeholder="+33123456789"
                  />
                </div>
              </div>

              {subscriptionForm.customerType === "business" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company name</Label>
                    <Input
                      id="companyName"
                      value={subscriptionForm.companyName}
                      onChange={(event) =>
                        setSubscriptionForm((prev) => ({ ...prev, companyName: event.target.value }))
                      }
                      placeholder="My Company SAS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT number</Label>
                    <Input
                      id="vatNumber"
                      value={subscriptionForm.vatNumber}
                      onChange={(event) =>
                        setSubscriptionForm((prev) => ({ ...prev, vatNumber: event.target.value }))
                      }
                      placeholder="FR12345678901"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="billing" className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={subscriptionForm.quantity}
                    onChange={(event) =>
                      setSubscriptionForm((prev) => ({
                        ...prev,
                        quantity: Number(event.target.value) || 1,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon">Coupon (optional)</Label>
                  <Select
                    value={subscriptionForm.couponId || "none"}
                    onValueChange={(value) =>
                      setSubscriptionForm((prev) => ({
                        ...prev,
                        couponId: value === "none" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger id="coupon">
                      <SelectValue placeholder="No coupon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No coupon</SelectItem>
                      {coupons.map((coupon) => (
                        <SelectItem key={coupon.id} value={coupon.id}>
                          {coupon.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="couponCode">Promo code</Label>
                  <Input
                    id="couponCode"
                    value={subscriptionForm.couponCode}
                    onChange={(event) =>
                      setSubscriptionForm((prev) => ({ ...prev, couponCode: event.target.value.toUpperCase() }))
                    }
                    placeholder="SAVE20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCountry">Billing country</Label>
                  <Input
                    id="billingCountry"
                    value={subscriptionForm.billingCountry}
                    onChange={(event) =>
                      setSubscriptionForm((prev) => ({ ...prev, billingCountry: event.target.value }))
                    }
                    placeholder="France"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing address</Label>
                  <Input
                    id="billingAddress"
                    value={subscriptionForm.billingAddress}
                    onChange={(event) =>
                      setSubscriptionForm((prev) => ({ ...prev, billingAddress: event.target.value }))
                    }
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCity">Billing city</Label>
                  <Input
                    id="billingCity"
                    value={subscriptionForm.billingCity}
                    onChange={(event) =>
                      setSubscriptionForm((prev) => ({ ...prev, billingCity: event.target.value }))
                    }
                    placeholder="Paris"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingPostalCode">Billing postal code</Label>
                <Input
                  id="billingPostalCode"
                  value={subscriptionForm.billingPostalCode}
                  onChange={(event) =>
                    setSubscriptionForm((prev) => ({ ...prev, billingPostalCode: event.target.value }))
                  }
                  placeholder="75001"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateDialogOpen(false)} disabled={creatingSubscription}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubscription} disabled={creatingSubscription}>
              {creatingSubscription ? "Creating…" : "Create subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
