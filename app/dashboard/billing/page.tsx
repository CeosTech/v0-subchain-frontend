"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Download,
  Eye,
  FileText,
  Percent,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  Shield,
  Zap,
  Globe,
  Headphones,
  Palette,
  Webhook,
  Code,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

// Mock data for billing
const mockBillingData = {
  currentPlan: "Growth",
  activeSubscribers: 2847,
  subscriberLimit: null, // Unlimited
  algoProcessed: 6062.5,
  commissionRate: 2.4,
  fixedFee: 0.3,
  totalRevenue: 6062.5,
  totalCommissions: 145.5,
  netEarnings: 5917.0,
  nextBilling: "2024-02-15",
  estimatedNextCommission: 165.0,
  growthVsLastMonth: 12.5,
}

const mockBillingHistory = [
  {
    id: "bill_1",
    date: "2024-01-15",
    description: "Commission fees - January 2024",
    revenue: 6062.5,
    commission: 145.5,
    rate: 2.4,
    status: "paid",
  },
  {
    id: "bill_2",
    date: "2023-12-15",
    description: "Commission fees - December 2023",
    revenue: 5347.8,
    commission: 128.3,
    rate: 2.4,
    status: "paid",
  },
  {
    id: "bill_3",
    date: "2023-11-15",
    description: "Commission fees - November 2023",
    revenue: 4114.6,
    commission: 98.75,
    rate: 2.4,
    status: "paid",
  },
  {
    id: "bill_4",
    date: "2023-10-15",
    description: "Commission fees - October 2023",
    revenue: 3892.1,
    commission: 93.41,
    rate: 2.4,
    status: "paid",
  },
]

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview")

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ALGO`
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      pending: "secondary",
      failed: "destructive",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Revenue</h1>
          <p className="text-muted-foreground">Manage your SubChain revenue and view commission fees</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Invoices
        </Button>
      </div>

      {/* Current Plan Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  Current Plan: Growth
                  <Badge className="ml-2">Active</Badge>
                </CardTitle>
                <CardDescription>Pay-as-you-earn commission model with all features included</CardDescription>
              </div>
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm font-medium">Active Subscribers</span>
                </div>
                <div className="text-2xl font-bold">{mockBillingData.activeSubscribers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Unlimited subscribers</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm font-medium">Revenue This Month</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(mockBillingData.totalRevenue)}</div>
                <p className="text-xs text-green-600">+{mockBillingData.growthVsLastMonth}% vs last month</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Percent className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm font-medium">Commission Rate</span>
                </div>
                <div className="text-2xl font-bold">{mockBillingData.commissionRate}%</div>
                <p className="text-xs text-muted-foreground">+ {mockBillingData.fixedFee} ALGO per transaction</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm font-medium">Your Net Earnings</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(mockBillingData.netEarnings)}</div>
                <p className="text-xs text-muted-foreground">Revenue - Commissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Plan Benefits Active</CardTitle>
            <CardDescription>
              You&apos;re enjoying the complete SubChain experience with our Growth plan at just 2.4% commission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Unlimited subscribers</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Advanced analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Priority support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Custom branding</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">ALGO to stablecoin conversion</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Webhook integrations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">API access</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">White-label solution</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* This Month's Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>This Month&apos;s Revenue Breakdown</CardTitle>
            <CardDescription>Commission fees breakdown for January 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">{formatCurrency(mockBillingData.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Commission Fees ({mockBillingData.commissionRate}%)
                  </span>
                  <span className="font-medium text-red-600">-{formatCurrency(mockBillingData.totalCommissions)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Your Net Earnings</span>
                  <span className="font-bold text-green-600">{formatCurrency(mockBillingData.netEarnings)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Next Commission Date</span>
                  <span className="font-medium">{mockBillingData.nextBilling}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Commission</span>
                  <span className="font-medium">{formatCurrency(mockBillingData.estimatedNextCommission)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Growth vs Last Month</span>
                  <span className="font-medium text-green-600">+{mockBillingData.growthVsLastMonth}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Effective Commission Rate</span>
                  <span className="font-medium">{mockBillingData.commissionRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SubChain Growth Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>SubChain Growth Plan</CardTitle>
            <CardDescription>The complete solution for crypto subscription businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Growth</h3>
                  <p className="text-muted-foreground">Pay as you earn</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">2.4%</div>
                  <p className="text-sm text-muted-foreground">commission only</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Unlimited subscribers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Percent className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">2.4% commission on successful payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Advanced analytics & insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Headphones className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Custom branding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">ALGO to stablecoin conversion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Webhook className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Webhook integrations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Full API access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">White-label solution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Custom payment pages</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <strong>No monthly fees</strong> • Pay only when you earn • Cancel anytime
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Current Plan
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Billing History Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                onClick={() => setActiveTab("overview")}
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming Charges
              </Button>
              <Button
                variant={activeTab === "history" ? "default" : "ghost"}
                onClick={() => setActiveTab("history")}
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Billing History
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Next Commission Payment</h3>
                  <p className="text-muted-foreground mb-4">
                    Your next commission payment will be processed on {mockBillingData.nextBilling}
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 max-w-sm mx-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estimated Commission</span>
                      <span className="font-medium">{formatCurrency(mockBillingData.estimatedNextCommission)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Commission Payment History</h3>
                  <p className="text-sm text-muted-foreground">Your past commission fees and revenue</p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBillingHistory.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>{new Date(bill.date).toLocaleDateString("en-US")}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{bill.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">{formatCurrency(bill.revenue)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(bill.commission)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{bill.rate}%</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
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
      </motion.div>
    </div>
  )
}
