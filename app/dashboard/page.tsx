"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DollarSign, Users, CreditCard, ArrowUpRight, ArrowDownRight, Activity, Wallet, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"
import Link from "next/link"

// Mock data
const revenueData = [
  { date: "2024-01-01", revenue: 125.5, transactions: 45, volume: 4250 },
  { date: "2024-01-02", revenue: 138.2, transactions: 52, volume: 4680 },
  { date: "2024-01-03", revenue: 142.8, transactions: 48, volume: 4920 },
  { date: "2024-01-04", revenue: 165.4, transactions: 58, volume: 5650 },
  { date: "2024-01-05", revenue: 158.9, transactions: 55, volume: 5380 },
  { date: "2024-01-06", revenue: 172.3, transactions: 62, volume: 5920 },
  { date: "2024-01-07", revenue: 189.6, transactions: 68, volume: 6480 },
]

const transactionData = [
  { date: "2024-01-01", algo: 35, usdc: 10, other: 0 },
  { date: "2024-01-02", algo: 42, usdc: 8, other: 2 },
  { date: "2024-01-03", algo: 38, usdc: 8, other: 2 },
  { date: "2024-01-04", algo: 45, usdc: 11, other: 2 },
  { date: "2024-01-05", algo: 40, usdc: 13, other: 2 },
  { date: "2024-01-06", algo: 48, usdc: 12, other: 2 },
  { date: "2024-01-07", algo: 52, usdc: 14, other: 2 },
]

const recentTransactions = [
  {
    id: "txn_1",
    merchant: "CryptoNews Pro",
    amount: 25.0,
    currency: "ALGO",
    fee: 0.73,
    status: "completed",
    time: "2 minutes ago",
  },
  {
    id: "txn_2",
    merchant: "DeFi Analytics",
    amount: 50.0,
    currency: "USDC",
    fee: 1.7,
    status: "completed",
    time: "5 minutes ago",
  },
  {
    id: "txn_3",
    merchant: "Algo Tracker",
    amount: 15.0,
    currency: "ALGO",
    fee: 0.44,
    status: "completed",
    time: "12 minutes ago",
  },
  {
    id: "txn_4",
    merchant: "Web3 Tools",
    amount: 100.0,
    currency: "USDC",
    fee: 3.4,
    status: "pending",
    time: "18 minutes ago",
  },
]

const overview = {
  total_revenue: 1892.5,
  monthly_revenue: 1245.8,
  total_transactions: 2847,
  monthly_transactions: 387,
  active_merchants: 156,
  total_volume: 67850.25,
  avg_transaction_size: 23.85,
  success_rate: 99.2,
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d")

  const formatCurrency = (value: number, currency = "ALGO") => {
    return `${value.toFixed(2)} ${currency}`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Mock growth calculations
  const revenueGrowth = 15.2
  const transactionGrowth = 8.7
  const merchantGrowth = 12.3
  const volumeGrowth = 18.5

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your payment processing performance</p>
        </div>
        <Select value={period} onValueChange={(value: "7d" | "30d" | "90d") => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview.monthly_revenue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {revenueGrowth > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={revenueGrowth > 0 ? "text-green-500" : "text-red-500"}>
                  {formatPercentage(Math.abs(revenueGrowth))}
                </span>
                <span className="ml-1">vs last month</span>
              </div>
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
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.monthly_transactions.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {transactionGrowth > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={transactionGrowth > 0 ? "text-green-500" : "text-red-500"}>
                  {formatPercentage(Math.abs(transactionGrowth))}
                </span>
                <span className="ml-1">vs last month</span>
              </div>
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
              <CardTitle className="text-sm font-medium">Active Merchants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.active_merchants}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {merchantGrowth > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={merchantGrowth > 0 ? "text-green-500" : "text-red-500"}>
                  {formatPercentage(Math.abs(merchantGrowth))}
                </span>
                <span className="ml-1">vs last month</span>
              </div>
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
              <CardTitle className="text-sm font-medium">Processing Volume</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview.total_volume)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {volumeGrowth > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={volumeGrowth > 0 ? "text-green-500" : "text-red-500"}>
                  {formatPercentage(Math.abs(volumeGrowth))}
                </span>
                <span className="ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Evolution</CardTitle>
              <CardDescription>Commission fees earned from processed transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis tickFormatter={(value) => `${value} ALGO`} />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-md">
                              <p className="font-medium">{new Date(label).toLocaleDateString("en-US")}</p>
                              <p className="text-sm text-blue-600">Revenue: {payload[0].value} ALGO</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction Types Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Transaction Types</CardTitle>
              <CardDescription>Breakdown by currency type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  algo: {
                    label: "ALGO",
                    color: "hsl(var(--chart-1))",
                  },
                  usdc: {
                    label: "USDC",
                    color: "hsl(var(--chart-2))",
                  },
                  other: {
                    label: "Other",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-md">
                              <p className="font-medium">{new Date(label).toLocaleDateString("en-US")}</p>
                              <p className="text-sm text-blue-600">ALGO: {payload[0].value}</p>
                              <p className="text-sm text-green-600">USDC: {payload[1].value}</p>
                              <p className="text-sm text-purple-600">Other: {payload[2].value}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="algo" fill="var(--color-algo)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="usdc" fill="var(--color-usdc)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="other" fill="var(--color-other)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment processing activity</CardDescription>
              </div>
              <Link href="/dashboard/transactions">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.merchant}</p>
                        <p className="text-xs text-muted-foreground">{transaction.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">Fee: {formatCurrency(transaction.fee)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Key performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-medium text-green-600">{formatPercentage(overview.success_rate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Transaction</span>
                <span className="font-medium">{formatCurrency(overview.avg_transaction_size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Volume</span>
                <span className="font-medium">{formatCurrency(overview.total_volume)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-medium text-blue-600">{formatCurrency(overview.total_revenue)}</span>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Currency Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ALGO</span>
                    <span>75%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">USDC</span>
                    <span>22%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Other</span>
                    <span>3%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Activity className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <CreditCard className="h-4 w-4 mr-2" />
                  API Settings
                </Button>
              </Link>
              <Link href="/api-docs">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Globe className="h-4 w-4 mr-2" />
                  API Docs
                </Button>
              </Link>
              <Link href="/playground">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Test Integration
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
