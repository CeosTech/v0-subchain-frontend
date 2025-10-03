"use client"

import { motion } from "framer-motion"
import { TrendingUp, Zap, Shield, Globe, CreditCard, Percent } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const revenueStreams = [
  {
    title: "Transaction Fees",
    description: "Commission on every subscription payment processed",
    rates: [
      { volume: "0-10K ALGO/month", rate: "2.9% + 0.30 ALGO", description: "Standard rate for new businesses" },
      { volume: "10K-100K ALGO/month", rate: "2.4% + 0.30 ALGO", description: "Reduced rate for growing businesses" },
      { volume: "100K+ ALGO/month", rate: "1.9% + 0.30 ALGO", description: "Enterprise rate for high volume" },
    ],
    icon: Percent,
    color: "text-green-600",
  },
  {
    title: "Currency Processing",
    description: "Additional fees for stablecoin processing",
    rates: [
      { volume: "ALGO payments", rate: "Standard rates", description: "Native Algorand processing" },
      { volume: "USDC payments", rate: "+0.5% fee", description: "Stablecoin conversion fee" },
      { volume: "Other ASAs", rate: "+0.3% fee", description: "Algorand Standard Assets" },
    ],
    icon: CreditCard,
    color: "text-blue-600",
  },
  {
    title: "Premium Services",
    description: "Optional add-on services for enhanced functionality",
    rates: [
      { volume: "White-label solution", rate: "Custom pricing", description: "Remove SubChain branding" },
      { volume: "Priority support", rate: "Contact sales", description: "Dedicated support channel" },
      { volume: "Custom integrations", rate: "Project-based", description: "Tailored API integrations" },
    ],
    icon: Zap,
    color: "text-purple-600",
  },
]

const projectedRevenue = [
  { metric: "Active merchants", current: "1,247", projected: "10,000", timeframe: "12 months" },
  { metric: "Monthly volume", current: "71K ALGO", projected: "500K ALGO", timeframe: "12 months" },
  { metric: "Monthly revenue", current: "2.1K ALGO", projected: "15K ALGO", timeframe: "12 months" },
  { metric: "Annual revenue", current: "25K ALGO", projected: "180K ALGO", timeframe: "12 months" },
]

export function RevenueModelInfo() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          Revenue Model{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SubChain</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A sustainable business model based on transaction success - you only pay when you earn
        </p>
      </div>

      {/* Revenue Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {revenueStreams.map((stream, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <stream.icon className={`h-5 w-5 mr-2 ${stream.color}`} />
                  {stream.title}
                </CardTitle>
                <CardDescription>{stream.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stream.rates.map((rate, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {rate.volume}
                        </Badge>
                        <span className="font-medium text-sm">{rate.rate}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rate.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Projections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Revenue Projections
            </CardTitle>
            <CardDescription>Expected growth based on Algorand adoption and DeFi market expansion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projectedRevenue.map((item, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{item.metric}</h4>
                  <div className="space-y-1">
                    <div className="text-lg font-bold">{item.current}</div>
                    <div className="text-xs text-muted-foreground">Current</div>
                  </div>
                  <div className="my-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-green-600">{item.projected}</div>
                    <div className="text-xs text-muted-foreground">Target {item.timeframe}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Value Proposition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Competitive Advantages
            </CardTitle>
            <CardDescription>Why SubChain generates sustainable revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <Globe className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Algorand Ecosystem</h4>
                <p className="text-sm text-muted-foreground">
                  Ultra-low fees (0.001 ALGO) enable profitable micro-subscriptions
                </p>
              </div>
              <div className="text-center p-4">
                <Zap className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Instant Finality</h4>
                <p className="text-sm text-muted-foreground">
                  4.5-second transaction confirmation, superior UX to other blockchains
                </p>
              </div>
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Secure Smart Contracts</h4>
                <p className="text-sm text-muted-foreground">
                  Automated subscription management without manual intervention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Business Model Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-center">Business Model Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">Revenue Sources</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Transaction fees:</strong> 1.9% - 2.9% per payment
                  </li>
                  <li>
                    • <strong>Currency processing:</strong> +0.3% - 0.5% for stablecoins
                  </li>
                  <li>
                    • <strong>Premium services:</strong> Custom pricing
                  </li>
                  <li>
                    • <strong>No monthly fees:</strong> Pay only when you earn
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-purple-600">Key Benefits</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Scalability:</strong> Grows with Algorand ecosystem
                  </li>
                  <li>
                    • <strong>Alignment:</strong> Success-based pricing model
                  </li>
                  <li>
                    • <strong>Differentiation:</strong> First mover on Algorand
                  </li>
                  <li>
                    • <strong>Expansion:</strong> Growing DeFi market
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
