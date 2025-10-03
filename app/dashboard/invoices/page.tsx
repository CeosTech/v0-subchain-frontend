"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FileText,
  Download,
  Send,
  Plus,
  Upload,
  Eye,
  Settings,
  Building,
  Palette,
  Trash2,
  Calendar,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const mockInvoices = [
  {
    id: "INV-001",
    subscriber: "john@example.com",
    amount: 29.99,
    currency: "EUR",
    status: "paid",
    dueDate: "2024-01-15",
    createdDate: "2024-01-01",
  },
  {
    id: "INV-002",
    subscriber: "sarah@company.com",
    amount: 49.99,
    currency: "USD",
    status: "pending",
    dueDate: "2024-01-20",
    createdDate: "2024-01-05",
  },
  {
    id: "INV-003",
    subscriber: "mike@startup.io",
    amount: 19.99,
    currency: "EUR",
    status: "overdue",
    dueDate: "2024-01-10",
    createdDate: "2023-12-25",
  },
]

const mockSubscribers = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Sarah Smith", email: "sarah@company.com" },
  { id: 3, name: "Mike Wilson", email: "mike@startup.io" },
]

const mockPlans = [
  { id: 1, name: "Basic Plan", price: 19.99 },
  { id: 2, name: "Pro Plan", price: 29.99 },
  { id: 3, name: "Enterprise Plan", price: 49.99 },
]

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export default function InvoicesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [configDialog, setConfigDialog] = useState(false)

  const [companyInfo, setCompanyInfo] = useState({
    name: "SubChain SAS",
    address: "123 Blockchain Street",
    city: "Paris",
    postalCode: "75001",
    country: "France",
    email: "billing@subchain.com",
    phone: "+33 1 23 45 67 89",
    taxId: "FR12345678901",
    logo: "",
  })

  const [invoiceSettings, setInvoiceSettings] = useState({
    autoSend: true,
    paymentTerms: 30,
    sendReminders: true,
    reminderDays: 7,
    currency: "EUR",
    taxRate: 20,
  })

  const [templateSettings, setTemplateSettings] = useState({
    footerText: "Thank you for your business!",
    primaryColor: "#3b82f6",
    showLogo: true,
  })

  const [newInvoice, setNewInvoice] = useState({
    subscriber: "",
    plan: "",
    customAmount: "",
    currency: "EUR",
    dueDate: "",
    notes: "",
    taxRate: 20,
  })

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ])

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setInvoiceItems([...invoiceItems, newItem])
  }

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.id !== id))
    }
  }

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const handleSubscriberChange = (subscriberId: string) => {
    setNewInvoice({ ...newInvoice, subscriber: subscriberId })
  }

  const handlePlanChange = (planId: string) => {
    const selectedPlan = mockPlans.find((p) => p.id.toString() === planId)
    if (selectedPlan) {
      setInvoiceItems([
        {
          id: "1",
          description: selectedPlan.name,
          quantity: 1,
          unitPrice: selectedPlan.price,
          total: selectedPlan.price,
        },
      ])
    }
    setNewInvoice({ ...newInvoice, plan: planId })
  }

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * newInvoice.taxRate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleCreateInvoice = () => {
    if (!newInvoice.subscriber || invoiceItems.length === 0 || !newInvoice.dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    console.log("Creating invoice:", {
      ...newInvoice,
      items: invoiceItems,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
    })

    toast({
      title: "Invoice Created",
      description: `Invoice has been created successfully.`,
    })

    // Reset form
    setNewInvoice({
      subscriber: "",
      plan: "",
      customAmount: "",
      currency: "EUR",
      dueDate: "",
      notes: "",
      taxRate: 20,
    })
    setInvoiceItems([
      {
        id: "1",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ])
    setCreateDialogOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleSaveCompanyInfo = () => {
    toast({
      title: "Company Information Saved",
      description: "Your company information has been updated successfully.",
    })
  }

  const handleSaveSettings = () => {
    toast({
      title: "Invoice Settings Saved",
      description: "Your invoice settings have been updated successfully.",
    })
  }

  const handleSaveTemplate = () => {
    toast({
      title: "Template Settings Saved",
      description: "Your invoice template has been updated successfully.",
    })
  }

  const totalPaid = mockInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
  const totalPending = mockInvoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0)
  const totalOverdue = mockInvoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {mockInvoices.filter((inv) => inv.status === "paid").length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalOverdue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground text-red-600">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockInvoices.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>Manage and track all your invoices</CardDescription>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">{invoice.id}</TableCell>
                      <TableCell>{invoice.subscriber}</TableCell>
                      <TableCell>
                        {invoice.amount} {invoice.currency}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{invoice.createdDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <Send className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>Configure your company details for invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tax-id">Tax ID / VAT Number</Label>
                  <Input
                    id="tax-id"
                    value={companyInfo.taxId}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={companyInfo.city}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="postal-code">Postal Code *</Label>
                  <Input
                    id="postal-code"
                    value={companyInfo.postalCode}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, postalCode: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={companyInfo.country}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="logo" type="file" accept="image/*" />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveCompanyInfo}>Save Company Information</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Invoice Settings
              </CardTitle>
              <CardDescription>Configure how invoices are generated and sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-send">Auto-send invoices</Label>
                  <p className="text-sm text-muted-foreground">Automatically send invoices when created</p>
                </div>
                <Switch
                  id="auto-send"
                  checked={invoiceSettings.autoSend}
                  onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, autoSend: checked })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment-terms">Payment Terms (days)</Label>
                  <Select
                    value={invoiceSettings.paymentTerms.toString()}
                    onValueChange={(value) =>
                      setInvoiceSettings({ ...invoiceSettings, paymentTerms: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="45">45 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={invoiceSettings.currency}
                    onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="ALGO">ALGO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="send-reminders">Send payment reminders</Label>
                  <p className="text-sm text-muted-foreground">Send automatic reminders for overdue invoices</p>
                </div>
                <Switch
                  id="send-reminders"
                  checked={invoiceSettings.sendReminders}
                  onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, sendReminders: checked })}
                />
              </div>

              {invoiceSettings.sendReminders && (
                <div>
                  <Label htmlFor="reminder-days">Send reminder after (days)</Label>
                  <Input
                    id="reminder-days"
                    type="number"
                    value={invoiceSettings.reminderDays}
                    onChange={(e) =>
                      setInvoiceSettings({ ...invoiceSettings, reminderDays: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              )}

              <div>
                <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  value={invoiceSettings.taxRate}
                  onChange={(e) =>
                    setInvoiceSettings({ ...invoiceSettings, taxRate: Number.parseFloat(e.target.value) })
                  }
                />
              </div>

              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Template Customization
                </CardTitle>
                <CardDescription>Customize the look and feel of your invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primary-color"
                      type="color"
                      value={templateSettings.primaryColor}
                      onChange={(e) => setTemplateSettings({ ...templateSettings, primaryColor: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={templateSettings.primaryColor}
                      onChange={(e) => setTemplateSettings({ ...templateSettings, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-logo">Show Company Logo</Label>
                    <p className="text-sm text-muted-foreground">Display your logo on invoices</p>
                  </div>
                  <Switch
                    id="show-logo"
                    checked={templateSettings.showLogo}
                    onCheckedChange={(checked) => setTemplateSettings({ ...templateSettings, showLogo: checked })}
                  />
                </div>

                <div>
                  <Label htmlFor="footer-text">Footer Text</Label>
                  <Textarea
                    id="footer-text"
                    value={templateSettings.footerText}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, footerText: e.target.value })}
                    placeholder="Add a custom message to your invoice footer..."
                  />
                </div>

                <Button onClick={handleSaveTemplate}>Save Template</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Preview</CardTitle>
                <CardDescription>Preview how your invoice will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-white" style={{ color: templateSettings.primaryColor }}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      {templateSettings.showLogo && (
                        <div className="w-16 h-16 bg-gray-200 rounded mb-2 flex items-center justify-center">
                          <span className="text-xs">LOGO</span>
                        </div>
                      )}
                      <h2 className="text-xl font-bold">{companyInfo.name}</h2>
                      <p className="text-sm text-gray-600">{companyInfo.address}</p>
                      <p className="text-sm text-gray-600">
                        {companyInfo.city}, {companyInfo.postalCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <h1 className="text-2xl font-bold" style={{ color: templateSettings.primaryColor }}>
                        INVOICE
                      </h1>
                      <p className="text-sm">INV-001</p>
                      <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="border-t border-b py-4 mb-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Description</strong>
                      </div>
                      <div>
                        <strong>Quantity</strong>
                      </div>
                      <div>
                        <strong>Amount</strong>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-2">
                      <div>Pro Plan Subscription</div>
                      <div>1</div>
                      <div>€29.99</div>
                    </div>
                  </div>

                  <div className="text-right mb-6">
                    <div className="text-lg font-bold">Total: €29.99</div>
                  </div>

                  <div className="text-center text-sm text-gray-600 border-t pt-4">{templateSettings.footerText}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Invoice Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Fill in the details to create a new invoice for your subscriber</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Subscriber Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subscriber">Subscriber *</Label>
                <Select value={newInvoice.subscriber} onValueChange={handleSubscriberChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subscriber" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSubscribers.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name} ({sub.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="plan">Plan (Optional)</Label>
                <Select value={newInvoice.plan} onValueChange={handlePlanChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name} - €{plan.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Invoice Items *</Label>
                <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {invoiceItems.map((item, index) => (
                  <div key={item.id} className="flex gap-2 items-start border p-3 rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div className="col-span-2">
                        <Label htmlFor={`description-${item.id}`} className="text-xs">
                          Description
                        </Label>
                        <Input
                          id={`description-${item.id}`}
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(item.id, "description", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`quantity-${item.id}`} className="text-xs">
                          Quantity
                        </Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(item.id, "quantity", Number.parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`unitPrice-${item.id}`} className="text-xs">
                          Unit Price (€)
                        </Label>
                        <Input
                          id={`unitPrice-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateInvoiceItem(item.id, "unitPrice", Number.parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="w-24 pt-6">
                      <div className="text-sm font-medium">€{item.total.toFixed(2)}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-6"
                      onClick={() => removeInvoiceItem(item.id)}
                      disabled={invoiceItems.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculation Summary */}
            <div className="border rounded-lg p-4 bg-muted">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">€{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-2">
                    <span>Tax Rate:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newInvoice.taxRate}
                      onChange={(e) => setNewInvoice({ ...newInvoice, taxRate: Number.parseFloat(e.target.value) })}
                      className="w-20 h-7 text-xs"
                    />
                    <span>%</span>
                  </div>
                  <span className="font-medium">€{calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={newInvoice.currency}
                  onValueChange={(value) => setNewInvoice({ ...newInvoice, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="ALGO">ALGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due-date">Due Date *</Label>
                <div className="relative">
                  <Input
                    id="due-date"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or payment instructions..."
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
