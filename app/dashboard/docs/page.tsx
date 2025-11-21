import Link from "next/link"
import { ArrowRight, Wallet, Share2, Layers, Shield, Boxes, Plug, CreditCard, Users, Coins, BarChart3 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const featureGuides = [
  {
    icon: CreditCard,
    title: "Plans & Checkout",
    steps: [
      "Create a plan from the Plans tab: define the code, amount, interval, trial days, and payout wallet.",
      "Use the Share action to generate a hosted /pay link and QR code.",
      "Embed the link in your site, deck, or email to onboard customers without touching the API.",
    ],
    docsLink: "/dashboard/plans",
  },
  {
    icon: Users,
    title: "Subscribers",
    steps: [
      "Monitor each customer profile, billing info, and active quantity.",
      "Manually resend verification emails, adjust coupons, or cancel access from the console.",
      "Export the list for support or finance when reconciling wallets.",
    ],
    docsLink: "/dashboard/subscribers",
  },
  {
    icon: Wallet,
    title: "Wallet & Identity",
    steps: [
      "Operators connect a Pera wallet at signup; SubChain stores the payout address you set on each plan.",
      "Disconnect or rotate wallets at any time from the Settings tab.",
      "SubChain signs transactions with your connected wallet and mirrors the JWT session for API access.",
    ],
    docsLink: "/dashboard/settings",
  },
]

const micropaymentGuides = [
  {
    icon: Shield,
    title: "x402 Paywalls",
    copy: "HTTP 402 pauses the request, shows the Algorand payment context, then replays the call with a signed receipt once approved.",
  },
  {
    icon: Plug,
    title: "Links & Widgets",
    copy: "Links, embeds, and credits all use the same facilitator so pricing logic stays in one place.",
  },
  {
    icon: Boxes,
    title: "Credit Packs",
    copy: "Sell prepaid credits, monitor balances live, and consume via `/credits/{plan}` POST requests.",
  },
]

const resourceLinks = [
  { label: "Product docs", href: "/docs" },
  { label: "HTTP x402 repo", href: "https://github.com/coinbase/x402" },
  { label: "Algorand overview", href: "https://algorand.co" },
]

export default function DashboardDocsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge className="border border-white/10 bg-white/5 text-white/80">User guide</Badge>
        <h1 className="text-3xl font-semibold text-white">SubChain dashboard documentation</h1>
        <p className="text-white/70">
          A quick tour of every module so you know where to create plans, review subscribers, or manage micropayments
          without leaving the console.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {featureGuides.map((guide) => (
          <Card key={guide.title} className="h-full border-white/10 bg-white/5 text-white/80">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2">
                <guide.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">{guide.title}</CardTitle>
                <CardDescription className="text-white/60">Console-first workflow</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed">
              <ul className="list-disc space-y-2 pl-5 text-white/70">
                {guide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              <Link
                href={guide.docsLink}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-200 hover:text-white"
              >
                Go to {guide.title}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-white/10 bg-white/5 text-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Coins className="h-5 w-5" /> Micropayments & x402
            </CardTitle>
            <CardDescription className="text-white/60">
              Understand what happens when a 402 challenge is triggered and how to operate the Micropayments tab.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Every request from the Micropayments tab goes through the <code className="rounded bg-black/40 px-1">X402PaywallProvider</code>.
              If the backend answers with <code>402 Payment Required</code>, the provider opens the payment modal, signs the Algorand
              payment, and retries the original call with the receipt header attached.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {micropaymentGuides.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-white/70">{item.copy}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="font-semibold text-white">Checklist</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Keep a small ALGO reserve on the payout wallet for network minimums.</li>
                <li>Configure webhook endpoints (Integrations tab) to acknowledge verified receipts.</li>
                <li>Use the Receipts table to export signed proofs for finance and support.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Layers className="h-5 w-5" /> Resources
            </CardTitle>
            <CardDescription className="text-white/60">Bookmark these references.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white/70">
            {resourceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white hover:border-white/20"
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
              Need hands-on help? Use the Support widget in the footer or email support@subchain.app.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-white/10 bg-white/5 text-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Share2 className="h-5 w-5" /> Sharing flows
            </CardTitle>
            <CardDescription className="text-white/60">
              What happens when you distribute a hosted link or QR code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <p>
              Links look like <code>/pay?plan=starter-plan</code>. If someone isn&apos;t authenticated, we redirect them to
              /auth/signin and preserve the redirect parameter so they return to the same checkout.
            </p>
            <p>
              After the wallet handshake, SubChain creates the subscription via <code>/api/subscriptions/subscriptions/</code>
              using the internal plan ID mapped from the code and the connected Algorand account.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <BarChart3 className="h-5 w-5" /> Analytics & exports
            </CardTitle>
            <CardDescription className="text-white/60">Where to pull numbers for finance and product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <p>
              The Analytics tab aggregates MRR, churn, and net volume from subscriptions and x402 receipts.
            </p>
            <p>
              Need CSVs? Use the export buttons in Invoices or Micropayments. Each export bundles the signed receipt so
              finance teams can reconcile with their ledgers.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
