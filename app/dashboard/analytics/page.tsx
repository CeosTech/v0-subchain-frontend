"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

// Mock data
const revenueData = [
  { date: "2024-01-01", revenue: 125.5, volume: 4250, transactions: 45 },
  { date: "2024-01-02", revenue: 138.2, volume: 4680, transactions: 52 },
  { date: "2024-01-03", revenue: 142.8, volume: 4920, transactions: 48 },
  { date: "2024-01-04", revenue: 165.4, volume: 5650, transactions: 58 },
  { date: "2024-01-05", revenue: 158.9, volume: 5380, transactions: 55 },
  { date: "2024-01-06", revenue: 172.3, volume: 5920, transactions: 62 },
  { date: "2024-01-07", revenue: 189.6, volume: 6480, transactions: 68 },
  { date: "2024-01-08", revenue: 210.4, volume: 7100, transactions: 75 },
  { date: "2024-01-09", revenue: 225.8, volume: 7650, transactions: 82 },
  { date: "2024-01-10", revenue: 218.9, volume: 7380, transactions: 78 },
  { date: "2024-01-11", revenue: 235.6, volume: 7950, transactions: 85 },
  { date: "2024-01-12", revenue: 248.7, volume: 8420, transactions: 92 },
  { date: "2024-01-13", revenue: 265.3, volume: 8980, transactions: 98 },
  { date: "2024-01-14", revenue: 272.8, volume: 9250, transactions: 105 },
  { date: "2024-01-15", revenue: 289.5, volume: 9800, transactions: 112 },
]

const merchantData = [
  { date: "2024-01-01", new_merchants: 5, active_merchants: 142 },
  { date: "2024-01-02", new_merchants: 8, active_merchants: 148 },
  { date: "2024-01-03", new_merchants: 6, active_merchants: 152 },
  { date: "2024-01-04", new_merchants: 12, active_merchants: 158 },
  { date: "2024-01-05", new_merchants: 4, active_merchants: 155 },
  { date: "2024-01-06", new_merchants: 15, active_merchants: 162 },
  { date: "2024-01-07", new_merchants: 18, active_merchants: 168 },
  { date: "2024-01-08", new_merchants: 22, active_merchants: 175 },
  { date: "2024-01-09", new_merchants: 16, active_merchants: 182 },
  { date: "2024-01-10", new_merchants: 8, active_merchants: 178 },
  { date: "2024-01-11", new_merchants: 25, active_merchants: 185 },
  { date: "2024-01-12", new_merchants: 20, active_merchants: 192 },
  { date: "2024-01-13", new_merchants: 18, active_merchants: 198 },
  { date: "2024-01-14", new_merchants: 24, active_merchants: 205 },
  { date: "2024-01-15", new_merchants: 28, active_merchants: 212 },
]

const currencyDistribution = [
  { name: "ALGO", value: 75, color: "#0088FE" },
  { name: "USDC", value: 22, color: "#00C49F" },
  { name: "Other ASAs", value: 3, color: "#FFBB28" },
]

const overview = {
  total_revenue: 2890.5,
  monthly_revenue: 1245.8,
  total_transactions: 2847,
  monthly_transactions: 1156,
  active_merchants: 212,
  total_volume: 125680.75,
  avg_transaction_size: 44.15,
  success_rate: 99.2,
  avg_fee_rate: 2.3,
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Mock growth calculations
  const revenueGrowth = 15.2
  const transactionGrowth = 8.7
  const merchantGrowth = 12.3
  const volumeGrowth = 18.5

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Analyze your payment processing performance</p>
        </div>
        <Select value={period} onValueChange={(value: "7d" | "30d" | "90d" | "1y") => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
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
              <div className="text-2xl font-bold">{formatCurrency(overview.monthly_revenue)} ALGO</div>
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
              <CardTitle className="text-sm font-medium">Transactions Processed</CardTitle>
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
              <div className="text-2xl font-bold">{formatCurrency(overview.total_volume)} ALGO</div>
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

        {/* Merchant Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Merchant Growth</CardTitle>
              <CardDescription>New merchants vs active merchants</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  new_merchants: {
                    label: "New",
                    color: "hsl(var(--chart-2))",
                  },
                  active_merchants: {
                    label: "Active",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={merchantData}>
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
                              <p className="text-sm text-green-600">New: {payload[0].value}</p>
                              <p className="text-sm text-blue-600">Active: {payload[1].value}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="new_merchants" fill="var(--color-new_merchants)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="active_merchants" fill="var(--color-active_merchants)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Currency Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Currency Distribution</CardTitle>
              <CardDescription>Transaction volume by currency</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currencyDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {currencyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background border rounded-lg p-2 shadow-md">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-muted-foreground">{data.value}% of volume</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex justify-center space-x-4 mt-4">
                {currencyDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>Performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-medium text-green-600">{formatPercentage(overview.success_rate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Transaction</span>
                <span className="font-medium">{formatCurrency(overview.avg_transaction_size)} ALGO</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Fee Rate</span>
                <span className="font-medium">{formatPercentage(overview.avg_fee_rate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Volume</span>
                <span className="font-medium">{formatCurrency(overview.total_volume)} ALGO</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-medium text-blue-600">{formatCurrency(overview.total_revenue)} ALGO</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Transactions</span>
                <span className="font-medium">{overview.total_transactions.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Growth Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Growth Insights</CardTitle>
              <CardDescription>Performance analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {overview.success_rate > 99 && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Excellent reliability</p>
                  <p className="text-xs text-green-600 dark:text-green-300">Success rate above 99%</p>
                </div>
              )}

              {overview.avg_transaction_size > 40 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">High transaction value</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">Above average transaction size</p>
                </div>
              )}

              {revenueGrowth > 10 && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Strong revenue growth</p>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    Revenue growing {formatPercentage(revenueGrowth)} this month!
                  </p>
                </div>
              )}

              {currencyDistribution[1].value > 20 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">USDC adoption</p>
                  <p className="text-xs text-purple-600 dark:text-purple-300">
                    {currencyDistribution[1].value}% of transactions use USDC
                  </p>
                </div>
              )}

              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Opportunity</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-300">
                  Consider promoting USDC for stable pricing
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
