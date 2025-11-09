"use client"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Zap, Shield, Globe, DollarSign, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

const features = [
  {
    icon: Zap,
    title: "Instant Payments",
    description: "Process crypto subscriptions in seconds with Algorand's instant finality",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Built on Algorand's secure blockchain with automated smart contracts",
  },
  {
    icon: Globe,
    title: "Multi-Currency Support",
    description: "Accept payments in ALGO, USDC, and other Algorand Standard Assets",
  },
  {
    icon: DollarSign,
    title: "No Monthly Fees",
    description: "Pay only when you earn - no setup costs, no hidden fees",
  },
  {
    icon: Users,
    title: "Unlimited Subscribers",
    description: "No limits on the number of subscribers or transactions",
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Comprehensive dashboard with revenue tracking and insights",
  },
]

const includedFeatures = [
  "ALGO payments with instant finality",
  "USDC and stablecoin support",
  "Payment links and widgets",
  "Customizable payment pages",
  "Real-time analytics dashboard",
  "Webhook integrations",
  "Automated invoicing",
  "Subscriber management",
  "Promo codes and discounts",
  "Multi-currency conversion",
  "Email notifications",
  "Refund management",
]

const additionalFees = [
  {
    currency: "ALGO",
    fee: "2.4% + 0.30 ALGO",
    description: "Standard rate for ALGO payments",
  },
  {
    currency: "USDC",
    fee: "2.9% + 0.30 ALGO",
    description: "ALGO rate + 0.5% for stablecoin conversion",
  },
  {
    currency: "Other ASAs",
    fee: "2.7% + 0.30 ALGO",
    description: "ALGO rate + 0.3% for other Algorand assets",
  },
]

const comparison = [
  {
    feature: "Setup Fee",
    subchain: "€0",
    stripe: "€0",
    traditional: "€50-500",
  },
  {
    feature: "Monthly Fee",
    subchain: "€0",
    stripe: "€0",
    traditional: "€29-99",
  },
  {
    feature: "Transaction Fee",
    subchain: "2.4%",
    stripe: "2.9%",
    traditional: "3-5%",
  },
  {
    feature: "Fixed Fee",
    subchain: "0.30 ALGO",
    stripe: "€0.25",
    traditional: "€0.30",
  },
  {
    feature: "Chargeback",
    subchain: "No chargebacks",
    stripe: "€15 per case",
    traditional: "€15-25 per case",
  },
  {
    feature: "Settlement Time",
    subchain: "Instant",
    stripe: "2-7 days",
    traditional: "2-14 days",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/subchain-glyph.svg" alt="SubChain logo" width={32} height={32} />
            <span className="text-base font-semibold uppercase tracking-[0.2em] text-white/80">SubChain</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="/pricing" className="text-foreground font-medium">
              Pricing
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/onboarding">
              <Button>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="mb-4">
              💰 Simple & Transparent Pricing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Pay Only When
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                You Earn
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              No monthly fees, no setup costs, no hidden charges. Simple commission-based pricing that scales with your
              business.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Pricing Card */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-blue-600 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="mb-4">
                <Badge className="bg-blue-600 text-lg px-4 py-1">Growth Plan</Badge>
              </div>
              <CardTitle className="text-4xl mb-2">Commission-Based</CardTitle>
              <div className="text-5xl font-bold mb-4">
                2.4%
                <span className="text-2xl font-normal text-muted-foreground"> + 0.30 ALGO</span>
              </div>
              <CardDescription className="text-lg">
                per successful transaction on the Algorand blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center pb-4">
                <Link href="/onboarding">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-12">
                    Start Processing Payments
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-4">No credit card required • Start in minutes</p>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Everything Included:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {includedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Fees */}
      <section className="py-12 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Currency-Specific Rates</h2>
            <p className="text-muted-foreground">Different assets have different processing fees</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {additionalFees.map((fee, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{fee.currency}</CardTitle>
                  <div className="text-2xl font-bold text-blue-600">{fee.fee}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{fee.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              * Blockchain transaction fees (≈0.001 ALGO) are paid separately by the subscriber
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Compare</h2>
            <p className="text-xl text-muted-foreground">See how SubChain stacks up against the competition</p>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                          SubChain
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">Stripe</th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">Traditional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-4 font-medium">{row.feature}</td>
                        <td className="p-4 text-center font-semibold text-blue-600">{row.subchain}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.stripe}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.traditional}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose SubChain?</h2>
            <p className="text-xl text-muted-foreground">Built for modern crypto-native businesses</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-blue-600 mb-2" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Are there any hidden fees?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No hidden fees. You only pay 2.4% + 0.30 ALGO per successful transaction. Additional fees apply for
                  USDC (+0.5%) and other ASAs (+0.3%). That&apos;s it.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do I need to pay a monthly subscription?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No monthly fees. You only pay when you process transactions. If you don&apos;t make sales, you don&apos;t pay
                  anything.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens if a payment fails?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Failed payments don&apos;t incur any fees. You only pay our commission on successful transactions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I get volume discounts?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  For businesses processing over 100K ALGO per month, contact our sales team for custom enterprise
                  pricing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do refunds work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  When you refund a payment, we refund our commission as well. You don&apos;t pay fees on refunded
                  transactions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of businesses already using SubChain. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/onboarding">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Start Processing Payments
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 border-white text-white hover:bg-white/10 bg-transparent"
                  >
                    View Documentation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background/80 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <Image src="/assets/subchain-glyph.svg" alt="SubChain logo" width={32} height={32} />
              <span className="text-base font-semibold uppercase tracking-[0.2em] text-white/80">
                SubChain
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/pricing" className="hover:text-white">Pricing</Link>
              <Link href="/docs" className="hover:text-white">Docs</Link>
              <Link href="/faq" className="hover:text-white">FAQ</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SubChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
