"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  X,
  User,
  Building,
  Filter,
  Download,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const mockSubscribers = [
  {
    id: "sub_1",
    email: "john@example.com",
    name: "John Doe",
    plan: "Pro Monthly",
    status: "active",
    amount: 29.99,
    currency: "EUR",
    nextBilling: "2024-02-15",
    customerType: "individual",
    country: "France",
    createdAt: "2024-01-15",
  },
  {
    id: "sub_2",
    email: "sarah@company.com",
    name: "Sarah Wilson",
    plan: "Business Monthly",
    status: "active",
    amount: 49.99,
    currency: "USD",
    nextBilling: "2024-02-20",
    customerType: "business",
    country: "USA",
    createdAt: "2024-01-10",
  },
  {
    id: "sub_3",
    email: "mike@startup.io",
    name: "Mike Johnson",
    plan: "Starter Monthly",
    status: "cancelled",
    amount: 19.99,
    currency: "EUR",
    nextBilling: null,
    customerType: "business",
    country: "Germany",
    createdAt: "2024-01-05",
  },
]

export default function SubscribersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cancelDialog, setCancelDialog] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [addSubscriberDialog, setAddSubscriberDialog] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    plan_id: "",
    wallet_address: "",
    customer_type: "individual",
    first_name: "",
    last_name: "",
    company_name: "",
    phone: "",
    address: "",
    postal_code: "",
    city: "",
    country: "France",
    vat_number: "",
    billing_same_as_personal: true,
    billing_address: "",
    billing_postal_code: "",
    billing_city: "",
    billing_country: "France",
  })

  const filteredSubscribers = mockSubscribers.filter((subscriber) => {
    const matchesSearch =
      subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.plan.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || subscriber.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCancelSubscription = (subscriberId: string) => {
    if (!cancelReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Subscription Cancelled",
      description: `Subscription has been cancelled successfully.`,
    })

    setCancelDialog(null)
    setCancelReason("")
  }

  const handleAddSubscriber = () => {
    if (!formData.email || !formData.first_name || !formData.last_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Subscriber Added",
      description: `${formData.first_name} ${formData.last_name} has been added successfully.`,
    })

    setAddSubscriberDialog(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      email: "",
      plan_id: "",
      wallet_address: "",
      customer_type: "individual",
      first_name: "",
      last_name: "",
      company_name: "",
      phone: "",
      address: "",
      postal_code: "",
      city: "",
      country: "France",
      vat_number: "",
      billing_same_as_personal: true,
      billing_address: "",
      billing_postal_code: "",
      billing_city: "",
      billing_country: "France",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800">
            <UserX className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      case "paused":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <User className="w-3 h-3 mr-1" />
            Paused
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const activeSubscribers = mockSubscribers.filter((s) => s.status === "active").length
  const totalRevenue = mockSubscribers.filter((s) => s.status === "active").reduce((sum, s) => sum + s.amount, 0)
  const churnRate = (
    (mockSubscribers.filter((s) => s.status === "cancelled").length / mockSubscribers.length) *
    100
  ).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSubscribers.length}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscribers}</div>
            <p className="text-xs text-muted-foreground">Currently paying</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRate}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Subscribers</CardTitle>
              <CardDescription>Manage your subscription customers</CardDescription>
            </div>
            <Button onClick={() => setAddSubscriberDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subscriber
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscriber</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {subscriber.customerType === "business" ? (
                          <Building className="w-4 h-4 text-blue-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{subscriber.name}</div>
                        <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{subscriber.plan}</TableCell>
                  <TableCell>
                    {subscriber.amount} {subscriber.currency}
                  </TableCell>
                  <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                  <TableCell>{subscriber.nextBilling || "—"}</TableCell>
                  <TableCell>{subscriber.country}</TableCell>
                  <TableCell>{subscriber.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Subscriber
                        </DropdownMenuItem>
                        {subscriber.status === "active" && (
                          <DropdownMenuItem className="text-red-600" onClick={() => setCancelDialog(subscriber.id)}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel Subscription
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription? This action cannot be undone and the subscriber will
              lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">Reason for Cancellation *</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this subscription..."
                rows={3}
                required
              />
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ This action is permanent. The subscriber will be notified and their access will be revoked
                immediately.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(null)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelDialog && handleCancelSubscription(cancelDialog)}
              disabled={!cancelReason.trim()}
            >
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subscriber Dialog */}
      <Dialog open={addSubscriberDialog} onOpenChange={setAddSubscriberDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Subscriber</DialogTitle>
            <DialogDescription>Add a new subscriber with complete information</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Customer Type</Label>
                  <Select
                    value={formData.customer_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, customer_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Individual
                        </div>
                      </SelectItem>
                      <SelectItem value="business">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Business
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {formData.customer_type === "business" && (
                  <div className="grid gap-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
                      placeholder="My Company Inc."
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+33123456789"
                  />
                </div>

                {formData.customer_type === "business" && (
                  <div className="grid gap-2">
                    <Label htmlFor="vat_number">VAT Number</Label>
                    <Input
                      id="vat_number"
                      value={formData.vat_number}
                      onChange={(e) => setFormData((prev) => ({ ...prev, vat_number: e.target.value }))}
                      placeholder="FR12345678901"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postal_code">Postal Code *</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData((prev) => ({ ...prev, postal_code: e.target.value }))}
                      placeholder="75001"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      placeholder="Paris"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "France",
                          "USA",
                          "UK",
                          "Germany",
                          "Spain",
                          "Italy",
                          "Canada",
                          "Australia",
                          "Japan",
                          "Other",
                        ].map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="billing_same_as_personal"
                  checked={formData.billing_same_as_personal}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, billing_same_as_personal: !!checked }))
                  }
                />
                <Label htmlFor="billing_same_as_personal">Billing address same as personal address</Label>
              </div>

              {!formData.billing_same_as_personal && (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="billing_address">Billing Address</Label>
                    <Input
                      id="billing_address"
                      value={formData.billing_address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, billing_address: e.target.value }))}
                      placeholder="456 Billing Street"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="billing_postal_code">Postal Code</Label>
                      <Input
                        id="billing_postal_code"
                        value={formData.billing_postal_code}
                        onChange={(e) => setFormData((prev) => ({ ...prev, billing_postal_code: e.target.value }))}
                        placeholder="75002"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="billing_city">City</Label>
                      <Input
                        id="billing_city"
                        value={formData.billing_city}
                        onChange={(e) => setFormData((prev) => ({ ...prev, billing_city: e.target.value }))}
                        placeholder="Paris"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="billing_country">Country</Label>
                      <Select
                        value={formData.billing_country}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, billing_country: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "France",
                            "USA",
                            "UK",
                            "Germany",
                            "Spain",
                            "Italy",
                            "Canada",
                            "Australia",
                            "Japan",
                            "Other",
                          ].map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubscriberDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubscriber}>Add Subscriber</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
