"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Zap,
  Check,
  Shield,
  TrendingUp,
  Globe,
  CreditCard,
  Users,
  BarChart3,
  Coins,
} from "lucide-react"

import { HeroBackground } from "@/components/hero-background"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "Zero-Trust Security",
    description: "Algorand smart contracts, hardware wallet support, and realtime audit trails keep funds safe.",
  },
  {
    icon: TrendingUp,
    title: "Growth Analytics",
    description: "Monitor MRR, churn, and retention with dashboards purpose-built for subscription revenue.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Accept ALGO, USDC, and Algorand Standard Assets with automatic FX conversion when you need it.",
  },
  {
    icon: CreditCard,
    title: "Ready-to-Use Payments",
    description: "Hosted checkout, embeddable widgets, and API keys that mirror the Stripe flows your team knows.",
  },
  {
    icon: Users,
    title: "Lifecycle Automation",
    description: "Trials, upgrades, downgrades, and retention nudges are orchestrated for you with notifications.",
  },
  {
    icon: BarChart3,
    title: "Compliance-Ready Exports",
    description: "Generate CSV and ledger-ready exports in a click for finance, treasury, and tax obligations.",
  },
]

const setupSteps = [
  {
    step: "1",
    title: "Create your workspace",
    description: "Sign up, verify your email, and connect an Algorand wallet or Pera account in under a minute.",
  },
  {
    step: "2",
    title: "Publish subscription plans",
    description: "Define pricing, billing cadence, free trials, and coupons—tailored to every customer segment.",
  },
  {
    step: "3",
    title: "Start collecting revenue",
    description: "Share payment links, drop embeddable widgets in your product, or go full API with hosted flows.",
  },
]

const pricingCards = [
  {
    title: "Commission Fee",
    label: "Per successful transaction",
    metric: "2.4%",
    icon: CreditCard,
    caption: "Only on successful recurring charges—setup and inactivity are always free.",
  },
  {
    title: "Algorand Network Fee",
    label: "Average cost per on-chain settlement",
    metric: "~$0.001",
    icon: Coins,
    caption: "Ultra-low fees keep micro-subscriptions profitable from day one.",
  },
]

const heroMetrics = [
  { label: "Settlement time", value: "< 4 seconds" },
  { label: "Merchants live", value: "150+" },
  { label: "Cross-border ready", value: "54 countries" },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_65%),hsl(var(--background))]">
      <div className="absolute inset-0">
        <HeroBackground />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_90%,rgba(99,102,241,0.28),transparent_70%)] opacity-80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      </div>

      <header className="relative z-30">
        <nav className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-panel flex items-center justify-between rounded-2xl px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/assets/subchain-glyph.svg" alt="SubChain mark" width={36} height={36} priority />
              <span className="text-base font-semibold tracking-wide text-white/90">
                Sub<span className="animate-gradient">Chain</span>
              </span>
            </Link>
            <div className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
              <Link href="/pricing" className="hover:text-white">Pricing</Link>
              <Link href="/docs" className="hover:text-white">Docs</Link>
              <Link href="/security" className="hover:text-white">Security</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-white/70 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">
                  Launch Console
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="relative z-20">
        <section className="mx-auto flex max-w-6xl flex-col items-start gap-12 px-4 pt-28 sm:px-6 lg:px-8 lg:pt-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full text-center"
          >
            <Badge className="mx-auto mb-6 border-white/20 bg-white/10 text-white">
              <Zap className="mr-1 h-3.5 w-3.5" />
              Built on Algorand • Instant settlement
            </Badge>
            <h1 className="mx-auto max-w-4xl bg-clip-text text-4xl font-semibold text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="animate-gradient">
                Crypto subscriptions, reimagined with on-chain clarity
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/70 md:text-xl">
              SubChain gives you the Stripe-like toolkit for recurring crypto revenue: publish plans, automate billing,
              and reconcile settlements without touching smart contracts.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button size="lg" className="px-10 py-6 text-base">
                  Start free trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-6 text-base"
                >
                  Explore the docs
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="glass-panel mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-3xl px-8 py-6 md:flex-row md:items-center md:justify-between"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="flex flex-1 flex-col items-center gap-1 text-center">
                <span className="text-sm uppercase tracking-[0.2em] text-white/50">{metric.label}</span>
                <span className="text-xl font-semibold text-white md:text-2xl">{metric.value}</span>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="relative py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Badge className="mx-auto mb-6 border-white/20 bg-white/10 text-white/80">
                Simple economics
              </Badge>
              <h2 className="text-4xl font-semibold text-white md:text-5xl">Only earn when you do</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
                Transparent fees that align with your revenue. No monthly retainers, no surprise invoices.
              </p>
            </motion.div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {pricingCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass-panel h-full border border-white/10">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-white">{card.title}</CardTitle>
                        <CardDescription className="text-white/60">{card.label}</CardDescription>
                      </div>
                      <div className="rounded-full bg-white/10 p-3">
                        <card.icon className="h-5 w-5 text-white/80" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-semibold text-white md:text-5xl">{card.metric}</div>
                      <p className="mt-3 text-sm text-white/60">{card.caption}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-white/80" /> No setup fees
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-white/80" /> Cancel anytime
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-white/80" /> Dedicated support
              </span>
            </div>
          </div>
        </section>

        <section className="relative py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Badge className="mx-auto mb-6 border-white/20 bg-white/10 text-white/80">Everything you need</Badge>
              <h2 className="text-4xl font-semibold text-white md:text-5xl">Enterprise-grade features, startup speed</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
                SubChain packages the algorand ecosystem into a streamlined console for billing teams and developers.
              </p>
            </motion.div>
            <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <Card className="glass-panel h-full border border-white/10">
                    <CardHeader>
                      <div className="mb-5 inline-flex rounded-full bg-white/10 p-3">
                        <feature.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-white/65">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Badge className="mx-auto mb-6 border-white/20 bg-white/10 text-white/80">
                Launch without friction
              </Badge>
              <h2 className="text-4xl font-semibold text-white md:text-5xl">Three steps to live payments</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
                Bring your product, we provide the payment rails, automations, and compliance scaffolding.
              </p>
            </motion.div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {setupSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.15 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass-panel h-full border border-white/10">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                        {item.step}
                      </div>
                      <CardTitle className="text-white">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/65">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-panel rounded-3xl border border-white/10 px-10 py-14"
            >
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                Ready to make crypto subscriptions feel effortless?
              </h2>
              <p className="mt-4 text-white/65">
                Join the teams powering recurring revenue on Algorand—backed by instant settlement, predictable fees,
                and a console your operators will love.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="px-10 py-6 text-base">
                    Get started
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="px-10 py-6 text-base">
                    View pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/40">
                No credit card • Instant Algorand wallet payouts
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="relative z-20 border-t border-white/10 bg-[radial-gradient(circle_at_0%_0%,rgba(124,58,237,0.15),transparent_55%),hsl(var(--brand-surface))] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/assets/subchain-glyph.svg" alt="SubChain mark" width={32} height={32} />
                <span className="text-base font-semibold text-white/80">SubChain</span>
              </Link>
              <p className="text-sm text-white/50">
                Subscription infrastructure for Algorand-native products—fast, transparent, and obsessively user-first.
              </p>
            </div>
            <div className="space-y-3 text-sm text-white/55">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Product</h3>
              <Link href="/pricing" className="block hover:text-white">
                Pricing
              </Link>
              <Link href="/docs" className="block hover:text-white">
                Documentation
              </Link>
              <Link href="/playground" className="block hover:text-white">
                API Playground
              </Link>
            </div>
            <div className="space-y-3 text-sm text-white/55">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Company</h3>
              <Link href="/security" className="block hover:text-white">
                Security
              </Link>
              <Link href="/privacy" className="block hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="block hover:text-white">
                Terms
              </Link>
            </div>
            <div className="space-y-3 text-sm text-white/55">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Support</h3>
              <Link href="mailto:hello@subchain.xyz" className="block hover:text-white">
                hello@subchain.xyz
              </Link>
              <Link href="/docs#faq" className="block hover:text-white">
                FAQs
              </Link>
              <Link href="/testnet" className="block hover:text-white">
                Testnet Console
              </Link>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs uppercase tracking-[0.3em] text-white/40">
            &copy; {new Date().getFullYear()} SubChain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
