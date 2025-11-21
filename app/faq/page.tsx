"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    category: "Getting started",
    items: [
      {
        question: "How do I launch my SubChain workspace?",
        answer:
          "Sign up, confirm your email, and connect an Algorand wallet (Pera, Defly, or WalletConnect). You can immediately create plans, configure payouts, and generate hosted checkout links.",
      },
      {
        question: "Which blockchains and wallets are supported?",
        answer:
          "SubChain is built for Algorand. We support Pera, Defly, Exodus, hardware wallets through WalletConnect, and any signer compatible with the Algorand SDK. Shared plans inherit your payout wallet unless you specify another address.",
      },
    ],
  },
  {
    category: "Plans & sharing",
    items: [
      {
        question: "How do hosted /pay links work?",
        answer:
          "Every plan exposes a public link (e.g. /pay?plan=starter-plan). Visitors who are not authenticated are redirected to /auth/signin with the redirect query preserved, so they return to the same checkout once they log in.",
      },
      {
        question: "Can I embed checkout widgets or QR codes?",
        answer:
          "Yes. The Share action generates a link and QR code for each plan. You can drop these into demos, slides, documentation, or even print them for live events.",
      },
    ],
  },
  {
    category: "Micropayments & x402",
    items: [
      {
        question: "What is the x402 protocol?",
        answer:
          "x402 is an open HTTP 402 flow for micropayments. SubChain implements it on Algorand: when the API returns 402, we show the payment challenge, collect the wallet signature, then replay the original request with a signed receipt.",
      },
      {
        question: "Do you support prepaid credits or API rate limiting?",
        answer:
          "Yes. The Micropayments tab lets you sell credit packs, throttle API calls, and monitor balances live. Receipts are signed, auditable, and exportable for finance or compliance teams.",
      },
    ],
  },
  {
    category: "Billing & payouts",
    items: [
      {
        question: "When do I receive funds?",
        answer:
          "Settlement is instant on Algorand. Funds land in the payout wallet configured on each plan as soon as the customer confirms the transaction. There is no batched payout schedule.",
      },
      {
        question: "Which currencies can I charge?",
        answer:
          "SubChain supports ALGO, USDC, and any Algorand Standard Asset you enable. You can mix currencies across plans or programmatically convert payouts using our API and webhooks.",
      },
    ],
  },
  {
    category: "Pricing & accounts",
    items: [
      {
        question: "Do you charge platform fees?",
        answer:
          "You only pay when you earn: 2.4% on successful subscription renewals plus the standard Algorand network fee (≈ $0.001). No setup or subscription fees.",
      },
      {
        question: "Can I test the product before going live?",
        answer:
          "Absolutely. Use the TestNet workspace to simulate plans, micropayments, and webhook flows without touching real funds. Switch to MainNet when you’re ready.",
      },
    ],
  },
  {
    category: "Security & compliance",
    items: [
      {
        question: "How do you secure customer data and wallets?",
        answer:
          "Wallet keys stay client-side. All API traffic is JWT-authenticated, encrypted in transit and at rest, and every Algorand transaction is signed explicitly by the merchant’s wallet.",
      },
      {
        question: "Do you offer KYC/AML options?",
        answer:
          "We integrate with Algorand ecosystem KYC providers. You can enforce a KYC step directly in the checkout flow or conditionally via webhooks depending on jurisdiction.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/subchain-glyph.svg" alt="SubChain logo" width={32} height={32} />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              SubChain
            </span>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">
              Launch console
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
            Help center
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Everything you need to know about getting started, accepting payments, and scaling subscriptions with SubChain.
          </p>
        </motion.div>

        <div className="mt-12 space-y-10">
          {faqs.map((section) => (
            <motion.section
              key={section.category}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true, amount: 0.25 }}
              className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8"
            >
              <h2 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/70">
                {section.category}
              </h2>
              <Accordion type="single" collapsible className="mt-6 space-y-4">
                {section.items.map((item) => (
                  <AccordionItem
                    key={item.question}
                    value={item.question}
                    className="rounded-xl border border-white/5 bg-white/2.5 px-4"
                  >
                    <AccordionTrigger className="text-left text-base font-medium text-white">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm text-white/65">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-10 text-center"
        >
          <h2 className="text-2xl font-semibold text-white md:text-3xl">Still need help?</h2>
          <p className="mt-3 text-sm text-white/60">
            Reach out to our support team—we respond within one business day.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <Link href="mailto:hello@subchain.xyz" className="underline-offset-4 hover:underline">
              hello@subchain.xyz
            </Link>
            <span className="hidden text-white/40 sm:inline">•</span>
            <Link href="/docs#api-reference" className="underline-offset-4 hover:underline">
              API reference
            </Link>
            <span className="hidden text-white/40 sm:inline">•</span>
            <Link href="/pricing" className="underline-offset-4 hover:underline">
              View pricing
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
