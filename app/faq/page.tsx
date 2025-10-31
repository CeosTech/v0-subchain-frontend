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
        question: "How do I activate my SubChain account?",
        answer:
          "Create a workspace, verify your email, and connect an Algorand wallet. Once connected, you can publish plans and start accepting subscriptions immediately.",
      },
      {
        question: "What wallets does SubChain support?",
        answer:
          "We support Pera, Defly, Exodus, hardware wallets via WalletConnect, and any Algorand wallet that provides a signer. More integrations are added regularly.",
      },
    ],
  },
  {
    category: "Billing & payouts",
    items: [
      {
        question: "When do I receive payouts?",
        answer:
          "Settlement is instant on Algorand. Funds land in your connected wallet as soon as the customer authorizes the transaction. There is no batched payout schedule.",
      },
      {
        question: "Can I charge in stablecoins?",
        answer:
          "Yes. SubChain supports ALGO, USDC, and any Algorand Standard Asset you enable. You can mix currencies across plans or convert payouts programmatically using our API.",
      },
    ],
  },
  {
    category: "Pricing",
    items: [
      {
        question: "Do you charge monthly fees?",
        answer:
          "No monthly fees or setup costs. SubChain charges 2.4% on successful subscription renewals plus the standard Algorand network fee (~$0.001).",
      },
      {
        question: "Is there a free trial?",
        answer:
          "Yes. You can explore the console, issue test API keys, and simulate subscriptions on TestNet before processing live transactions.",
      },
    ],
  },
  {
    category: "Security & compliance",
    items: [
      {
        question: "How does SubChain secure customer data?",
        answer:
          "All sensitive data is encrypted in transit and at rest. Wallet keys remain client-side, and we maintain a SOC 2-aligned control framework with quarterly audits.",
      },
      {
        question: "Do you support KYC or AML checks?",
        answer:
          "We integrate with Algorand ecosystem KYC providers. You can enforce KYC flows at checkout or on an API-basis depending on your jurisdictional requirements.",
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
