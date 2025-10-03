"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  Copy,
  Check,
  TrendingUp,
  Shield,
  Upload,
  Palette,
  Percent,
  Gift,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

// Mock data for plans
const mockPlans = [
  {
    id: "plan_1",
    name: "Starter Plan",
    description: "Perfect for getting started with crypto subscriptions",
    amount: 0,
    currency: "ALGO",
    interval: "monthly",
    status: "active",
    subscriber_count: 45,
    total_revenue: 0,
    created_at: "2024-01-01",
    features: ["Up to 100 subscribers", "Email support", "Basic analytics"],
    trial_days: 0,
    setup_fee: 0,
    auto_convert_to_stable: false,
    stable_currency: "USDC",
    conversion_threshold: 100,
    custom_branding: {
      logo_url: "",
      company_name: "",
      primary_color: "#3b82f6",
      background_color: "#ffffff",
      custom_css: "",
    },
    promo_codes: [],
  },
  {
    id: "plan_2",
    name: "Pro Plan",
    description: "For growing businesses",
    amount: 50,
    currency: "ALGO",
    interval: "monthly",
    status: "active",
    subscriber_count: 67,
    total_revenue: 3350,
    created_at: "2024-01-01",
    features: ["Up to 10,000 subscribers", "Priority support", "Advanced analytics", "Custom branding"],
    trial_days: 14,
    setup_fee: 0,
    auto_convert_to_stable: true,
    stable_currency: "USDC",
    conversion_threshold: 50,
    custom_branding: {
      logo_url: "/placeholder.svg?height=60&width=200&text=Company+Logo",
      company_name: "Acme Corp",
      primary_color: "#8b5cf6",
      background_color: "#f8fafc",
      custom_css: ".payment-widget { border-radius: 12px; }",
    },
    promo_codes: [
      { code: "WELCOME20", discount: 20, type: "percentage", expires_at: "2024-12-31", uses: 45, max_uses: 100 },
      { code: "SAVE10", discount: 10, type: "fixed", expires_at: "2024-06-30", uses: 12, max_uses: 50 },
    ],
  },
]

// Mock promo codes
const mockPromoCodes = [
  {
    id: "promo_1",
    code: "WELCOME20",
    discount: 20,
    type: "percentage",
    expires_at: "2024-12-31",
    uses: 45,
    max_uses: 100,
    status: "active",
    created_at: "2024-01-01",
  },
  {
    id: "promo_2",
    code: "SAVE10",
    discount: 10,
    type: "fixed",
    expires_at: "2024-06-30",
    uses: 12,
    max_uses: 50,
    status: "active",
    created_at: "2024-01-15",
  },
  {
    id: "promo_3",
    code: "EXPIRED50",
    discount: 50,
    type: "percentage",
    expires_at: "2024-01-01",
    uses: 100,
    max_uses: 100,
    status: "expired",
    created_at: "2023-12-01",
  },
]

export default function PlansPage() {
  const [plans] = useState(mockPlans)
  const [promoCodes] = useState(mockPromoCodes)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [planIdCopied, setPlanIdCopied] = useState("")
  const [activeTab, setActiveTab] = useState("plans")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    currency: "ALGO" as const,
    interval: "monthly" as "monthly" | "yearly",
    features: [] as string[],
    trial_days: "0",
    setup_fee: "0",
    status: "active" as "active" | "inactive" | "draft",
    auto_convert_to_stable: false,
    stable_currency: "USDC" as "USDC" | "USDT" | "EUROC",
    conversion_threshold: "100",
    custom_branding: {
      logo_url: "",
      company_name: "",
      primary_color: "#3b82f6",
      background_color: "#ffffff",
      custom_css: "",
    },
  })

  const [promoFormData, setPromoFormData] = useState({
    code: "",
    discount: "",
    type: "percentage" as "percentage" | "fixed",
    expires_at: "",
    max_uses: "",
    description: "",
  })

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredPromoCodes = promoCodes.filter((promo) => {
    const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || promo.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreatePlan = async () => {
    if (!formData.name || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Plan created successfully",
    })
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleCreatePromoCode = async () => {
    if (!promoFormData.code || !promoFormData.discount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Promo code created successfully",
    })
    setIsPromoDialogOpen(false)
    resetPromoForm()
  }

  const handleEditPlan = async () => {
    if (!selectedPlan || !formData.name || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Plan updated successfully",
    })
    setIsEditDialogOpen(false)
    setSelectedPlan(null)
    resetForm()
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) {
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    toast({
      title: "Success",
      description: "Plan deleted successfully",
    })
  }

  const handleCopyPlanId = (planId: string) => {
    navigator.clipboard.writeText(planId)
    setPlanIdCopied(planId)
    setTimeout(() => setPlanIdCopied(""), 2000)
    toast({
      title: "ID Copied",
      description: "Plan ID has been copied to clipboard",
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      amount: "",
      currency: "ALGO",
      interval: "monthly",
      features: [],
      trial_days: "0",
      setup_fee: "0",
      status: "active",
      auto_convert_to_stable: false,
      stable_currency: "USDC",
      conversion_threshold: "100",
      custom_branding: {
        logo_url: "",
        company_name: "",
        primary_color: "#3b82f6",
        background_color: "#ffffff",
        custom_css: "",
      },
    })
  }

  const resetPromoForm = () => {
    setPromoFormData({
      code: "",
      discount: "",
      type: "percentage",
      expires_at: "",
      max_uses: "",
      description: "",
    })
  }

  const openEditDialog = (plan: any) => {
    setSelectedPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || "",
      amount: plan.amount.toString(),
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features || [],
      trial_days: plan.trial_days?.toString() || "0",
      setup_fee: plan.setup_fee?.toString() || "0",
      status: plan.status,
      auto_convert_to_stable: plan.auto_convert_to_stable || false,
      stable_currency: plan.stable_currency || "USDC",
      conversion_threshold: plan.conversion_threshold?.toString() || "100",
      custom_branding: plan.custom_branding || {
        logo_url: "",
        company_name: "",
        primary_color: "#3b82f6",
        background_color: "#ffffff",
        custom_css: "",
      },
    })
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      draft: "outline",
      expired: "destructive",
    } as const

    const labels = {
      active: "Active",
      inactive: "Inactive",
      draft: "Draft",
      expired: "Expired",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const addFeature = () => {
    const newFeature = prompt("Add a feature:")
    if (newFeature && newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
    }
  }

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const getConversionBadge = (plan: any) => {
    if (plan.auto_convert_to_stable) {
      return (
        <Badge variant="secondary" className="ml-2">
          <Shield className="h-3 w-3 mr-1" />
          Auto → {plan.stable_currency}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="ml-2">
        <TrendingUp className="h-3 w-3 mr-1" />
        ALGO Native
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plans & Promotions</h1>
          <p className="text-muted-foreground">Manage your subscription plans and promotional codes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetPromoForm}>
                <Gift className="h-4 w-4 mr-2" />
                New Promo Code
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plans.length}</div>
              <p className="text-xs text-muted-foreground">
                {plans.filter((p) => p.status === "active").length} active
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plans.reduce((sum, plan) => sum + plan.subscriber_count, 0)}</div>
              <p className="text-xs text-muted-foreground">Across all plans</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Promo Codes</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promoCodes.filter((p) => p.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">
                {promoCodes.reduce((sum, promo) => sum + promo.uses, 0)} total uses
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plans.reduce((sum, plan) => sum + plan.total_revenue, 0).toFixed(2)} ALGO
              </div>
              <p className="text-xs text-muted-foreground">Cumulative revenue</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="promos">Promo Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Filters and Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search plans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Plans Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Plan List</CardTitle>
                <CardDescription>
                  {filteredPlans.length} plan{filteredPlans.length > 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            {plan.description && (
                              <div className="text-sm text-muted-foreground">{plan.description}</div>
                            )}
                            <div className="flex items-center mt-1">
                              <code className="text-xs bg-muted px-1 rounded mr-2">{plan.id}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => handleCopyPlanId(plan.id)}
                              >
                                {planIdCopied === plan.id ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{plan.amount} ALGO</div>
                          {plan.setup_fee > 0 && (
                            <div className="text-xs text-muted-foreground">+ {plan.setup_fee} ALGO setup</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getConversionBadge(plan)}
                          {plan.auto_convert_to_stable && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Min: {plan.conversion_threshold} ALGO
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{plan.interval === "monthly" ? "Monthly" : "Yearly"}</Badge>
                          {plan.trial_days > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">{plan.trial_days}d trial</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                            {plan.subscriber_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{plan.total_revenue.toFixed(2)} ALGO</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(plan.status)}</TableCell>
                        <TableCell>{new Date(plan.created_at).toLocaleDateString("en-US")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyPlanId(plan.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePlan(plan.id)}
                                className="text-red-600"
                                disabled={plan.subscriber_count > 0}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredPlans.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No plans found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="promos" className="space-y-4">
          {/* Promo Codes Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Promotional Codes</CardTitle>
                <CardDescription>
                  {filteredPromoCodes.length} promo code{filteredPromoCodes.length > 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromoCodes.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{promo.code}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-2"
                              onClick={() => {
                                navigator.clipboard.writeText(promo.code)
                                toast({ title: "Code copied!", description: "Promo code copied to clipboard" })
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {promo.type === "percentage" ? `${promo.discount}%` : `${promo.discount} ALGO`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {promo.type === "percentage" ? (
                              <>
                                <Percent className="h-3 w-3 mr-1" />
                                Percentage
                              </>
                            ) : (
                              <>
                                <DollarSign className="h-3 w-3 mr-1" />
                                Fixed Amount
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {promo.uses} / {promo.max_uses || "∞"}
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{
                                width: promo.max_uses ? `${(promo.uses / promo.max_uses) * 100}%` : "0%",
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{new Date(promo.expires_at).toLocaleDateString("en-US")}</TableCell>
                        <TableCell>{getStatusBadge(promo.status)}</TableCell>
                        <TableCell>{new Date(promo.created_at).toLocaleDateString("en-US")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Code
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredPromoCodes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No promo codes found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>
              Create a new subscription plan with custom branding and payment options
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="payment">Payment Settings</TabsTrigger>
              <TabsTrigger value="branding">Custom Branding</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Pro Plan"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Plan description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Price (ALGO) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="25.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="interval">Frequency</Label>
                    <Select
                      value={formData.interval}
                      onValueChange={(value: "monthly" | "yearly") =>
                        setFormData((prev) => ({ ...prev, interval: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="trial_days">Trial Period (days)</Label>
                    <Input
                      id="trial_days"
                      type="number"
                      value={formData.trial_days}
                      onChange={(e) => setFormData((prev) => ({ ...prev, trial_days: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="setup_fee">Setup Fee (ALGO)</Label>
                    <Input
                      id="setup_fee"
                      type="number"
                      step="0.01"
                      value={formData.setup_fee}
                      onChange={(e) => setFormData((prev) => ({ ...prev, setup_fee: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive" | "draft") =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Features</Label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{feature}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-4">
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Convert to Stablecoin</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically convert ALGO payments to stablecoins to avoid volatility
                    </p>
                  </div>
                  <Switch
                    checked={formData.auto_convert_to_stable}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, auto_convert_to_stable: checked }))}
                  />
                </div>

                {formData.auto_convert_to_stable && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="grid gap-2">
                      <Label htmlFor="stable_currency">Target Stablecoin</Label>
                      <Select
                        value={formData.stable_currency}
                        onValueChange={(value: "USDC" | "USDT" | "EUROC") =>
                          setFormData((prev) => ({ ...prev, stable_currency: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                          <SelectItem value="USDT">USDT (Tether)</SelectItem>
                          <SelectItem value="EUROC">EUROC (Euro Coin)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="conversion_threshold">Min. Conversion Amount (ALGO)</Label>
                      <Input
                        id="conversion_threshold"
                        type="number"
                        step="1"
                        value={formData.conversion_threshold}
                        onChange={(e) => setFormData((prev) => ({ ...prev, conversion_threshold: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {formData.auto_convert_to_stable ? (
                    <>
                      <Shield className="h-3 w-3 inline mr-1" />
                      Payments will be automatically converted to {formData.stable_currency} when accumulated ALGO
                      reaches {formData.conversion_threshold} ALGO threshold.
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      Payments will be received in native ALGO. You'll benefit from potential price appreciation but
                      also bear volatility risk.
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.custom_branding.company_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        custom_branding: { ...prev.custom_branding, company_name: e.target.value },
                      }))
                    }
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo_url"
                      value={formData.custom_branding.logo_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          custom_branding: { ...prev.custom_branding, logo_url: e.target.value },
                        }))
                      }
                      placeholder="https://example.com/logo.png"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload your logo or provide a URL. Recommended size: 200x60px
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.custom_branding.primary_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            custom_branding: { ...prev.custom_branding, primary_color: e.target.value },
                          }))
                        }
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={formData.custom_branding.primary_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            custom_branding: { ...prev.custom_branding, primary_color: e.target.value },
                          }))
                        }
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="background_color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background_color"
                        type="color"
                        value={formData.custom_branding.background_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            custom_branding: { ...prev.custom_branding, background_color: e.target.value },
                          }))
                        }
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={formData.custom_branding.background_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            custom_branding: { ...prev.custom_branding, background_color: e.target.value },
                          }))
                        }
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="custom_css">Custom CSS</Label>
                  <Textarea
                    id="custom_css"
                    value={formData.custom_branding.custom_css}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        custom_branding: { ...prev.custom_branding, custom_css: e.target.value },
                      }))
                    }
                    placeholder=".payment-widget { border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }"
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add custom CSS to style your payment widget. Use class names like .payment-widget, .plan-card, etc.
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Preview
                  </h4>
                  <div
                    className="bg-white rounded-lg p-4 border"
                    style={{ backgroundColor: formData.custom_branding.background_color }}
                  >
                    {formData.custom_branding.logo_url && (
                      <img
                        src={formData.custom_branding.logo_url || "/placeholder.svg"}
                        alt="Logo"
                        className="h-8 mb-3"
                      />
                    )}
                    <div className="text-lg font-semibold" style={{ color: formData.custom_branding.primary_color }}>
                      {formData.custom_branding.company_name || "Your Company"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Payment Widget Preview</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan}>Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Promo Code Dialog */}
      <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
            <DialogDescription>Create a new promotional code to offer discounts to your customers</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="promo_code">Promo Code *</Label>
              <Input
                id="promo_code"
                value={promoFormData.code}
                onChange={(e) => setPromoFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="WELCOME20"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Use uppercase letters and numbers only</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount Value *</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={promoFormData.discount}
                  onChange={(e) => setPromoFormData((prev) => ({ ...prev, discount: e.target.value }))}
                  placeholder="20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select
                  value={promoFormData.type}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setPromoFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (ALGO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expires_at">Expiration Date</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={promoFormData.expires_at}
                  onChange={(e) => setPromoFormData((prev) => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_uses">Max Uses</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={promoFormData.max_uses}
                  onChange={(e) => setPromoFormData((prev) => ({ ...prev, max_uses: e.target.value }))}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">Leave empty for unlimited uses</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="promo_description">Description (Optional)</Label>
              <Textarea
                id="promo_description"
                value={promoFormData.description}
                onChange={(e) => setPromoFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Welcome discount for new customers"
                rows={2}
              />
            </div>
            <div className="border rounded-lg p-3 bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="text-sm">
                Code: <code className="bg-background px-1 rounded">{promoFormData.code || "PROMO_CODE"}</code>
              </div>
              <div className="text-sm mt-1">
                Discount: {promoFormData.discount || "0"}
                {promoFormData.type === "percentage" ? "%" : " ALGO"}
              </div>
              {promoFormData.expires_at && (
                <div className="text-sm mt-1">Expires: {new Date(promoFormData.expires_at).toLocaleDateString()}</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePromoCode}>Create Promo Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>Edit your subscription plan details, payment options, and branding</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="payment">Payment Settings</TabsTrigger>
              <TabsTrigger value="branding">Custom Branding</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Plan Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Pro Plan"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Plan description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-amount">Price (ALGO) *</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="25.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-interval">Frequency</Label>
                    <Select
                      value={formData.interval}
                      onValueChange={(value: "monthly" | "yearly") =>
                        setFormData((prev) => ({ ...prev, interval: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-trial_days">Trial Period (days)</Label>
                    <Input
                      id="edit-trial_days"
                      type="number"
                      value={formData.trial_days}
                      onChange={(e) => setFormData((prev) => ({ ...prev, trial_days: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-setup_fee">Setup Fee (ALGO)</Label>
                    <Input
                      id="edit-setup_fee"
                      type="number"
                      step="0.01"
                      value={formData.setup_fee}
                      onChange={(e) => setFormData((prev) => ({ ...prev, setup_fee: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive" | "draft") =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Features</Label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{feature}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-4">
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Convert to Stablecoin</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically convert ALGO payments to stablecoins to avoid volatility
                    </p>
                  </div>
                  <Switch
                    checked={formData.auto_convert_to_stable}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, auto_convert_to_stable: checked }))}
                  />
                </div>

                {formData.auto_convert_to_stable && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-stable_currency">Target Stablecoin</Label>
                      <Select
                        value={formData.stable_currency}
                        onValueChange={(value: "USDC" | "USDT" | "EUROC") =>
                          setFormData((prev) => ({ ...prev, stable_currency: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                          <SelectItem value="USDT">USDT (Tether)</SelectItem>
                          <SelectItem value="EUROC">EUROC (Euro Coin)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-conversion_threshold">Min. Conversion Amount (ALGO)</Label>
                      <Input
                        id="edit-conversion_threshold"
                        type="number"
                        step="1"
                        value={formData.conversion_threshold}
                        onChange={(e) => setFormData((prev) => ({ ...prev, conversion_threshold: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {formData.auto_convert_to_stable ? (
                    <>
                      <Shield className="h-3 w-3 inline mr-1" />
                      Payments will be automatically converted to {formData.stable_currency} when accumulated ALGO
                      reaches {formData.conversion_threshold} ALGO threshold.
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      Payments will be received in native ALGO. You'll benefit from potential price appreciation but
                      also bear volatility risk.
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-company_name">Company Name</Label>
                  <Input
                    id="edit-company_name"
                    value={formData.custom_branding.company_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        custom_branding: { ...prev.custom_branding, company_name: e.target.value },
                      }))
                    }
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-logo_url">Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-logo_url"
                      value={formData.custom_branding.logo_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          custom_branding: { ...prev.custom_branding, logo_url: e.target.value },
                        }))
                      }
                      placeholder="https://example.com/logo.png"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload your logo or provide a URL. Recommended size: 200x60px
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-primary_color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-primary_color"
                        type="color"
                        value={formData.custom_branding.primary_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            custom_branding: { ...prev.custom_branding, primary_color: e.target.value },
                          }))
                        }
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={formData.custom_branding.primary_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            custom_branding: { ...prev.custom_branding, primary_color: e.target.value },
                          }))
                        }
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-background_color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-background_color"
                        type="color"
                        value={formData.custom_branding.background_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            custom_branding: { ...prev.custom_branding, background_color: e.target.value },
                          }))
                        }
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={formData.custom_branding.background_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            custom_branding: { ...prev.custom_branding, background_color: e.target.value },
                          }))
                        }
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-custom_css">Custom CSS</Label>
                  <Textarea
                    id="edit-custom_css"
                    value={formData.custom_branding.custom_css}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        custom_branding: { ...prev.custom_branding, custom_css: e.target.value },
                      }))
                    }
                    placeholder=".payment-widget { border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }"
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add custom CSS to style your payment widget. Use class names like .payment-widget, .plan-card, etc.
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Preview
                  </h4>
                  <div
                    className="bg-white rounded-lg p-4 border"
                    style={{ backgroundColor: formData.custom_branding.background_color }}
                  >
                    {formData.custom_branding.logo_url && (
                      <img
                        src={formData.custom_branding.logo_url || "/placeholder.svg"}
                        alt="Logo"
                        className="h-8 mb-3"
                      />
                    )}
                    <div className="text-lg font-semibold" style={{ color: formData.custom_branding.primary_color }}>
                      {formData.custom_branding.company_name || "Your Company"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Payment Widget Preview</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPlan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
