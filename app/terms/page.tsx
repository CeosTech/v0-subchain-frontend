"use client"

import { motion } from "framer-motion"
import { Scale, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold">SubChain</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
              </div>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using SubChain's services, you accept and agree to be bound by the terms and provision
                of this agreement.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                SubChain provides a platform for businesses to accept recurring cryptocurrency payments through the
                Algorand blockchain. Our services include:
              </p>
              <ul>
                <li>Payment processing for subscriptions</li>
                <li>Dashboard and analytics tools</li>
                <li>API and integration tools</li>
                <li>Customer management features</li>
              </ul>

              <h2>3. User Accounts</h2>
              <p>
                To use our services, you must create an account and provide accurate, complete, and current information.
                You are responsible for:
              </p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>

              <h2>4. Fees and Payment</h2>
              <p>SubChain operates on a commission-based model:</p>
              <ul>
                <li>Commission rate: 2.4% + 0.30 ALGO per transaction</li>
                <li>Additional fees for USDC: +0.5%</li>
                <li>Additional fees for other ASAs: +0.3%</li>
                <li>No monthly or setup fees</li>
              </ul>
              <p>Fees are automatically deducted from each transaction processed through our platform.</p>

              <h2>5. Prohibited Uses</h2>
              <p>You may not use our service:</p>
              <ul>
                <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                <li>
                  To violate any international, federal, provincial, or state regulations, rules, laws, or local
                  ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights or the intellectual property rights of
                  others
                </li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To engage in money laundering or terrorist financing</li>
              </ul>

              <h2>6. Blockchain Transactions</h2>
              <p>You acknowledge that:</p>
              <ul>
                <li>Blockchain transactions are irreversible</li>
                <li>Transaction fees are determined by the Algorand network</li>
                <li>We cannot reverse or cancel completed transactions</li>
                <li>You are responsible for the accuracy of wallet addresses</li>
              </ul>

              <h2>7. Limitation of Liability</h2>
              <p>
                SubChain shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>

              <h2>8. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless SubChain and its licensee and licensors, and their
                employees, contractors, agents, officers and directors, from and against any and all claims, damages,
                obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's
                fees).
              </p>

              <h2>9. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason
                whatsoever, including without limitation if you breach the Terms.
              </p>

              <h2>10. Governing Law</h2>
              <p>
                These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its
                conflict of law provisions.
              </p>

              <h2>11. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                revision is material, we will try to provide at least 30 days notice prior to any new terms taking
                effect.
              </p>

              <h2>12. Contact Information</h2>
              <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
              <ul>
                <li>Email: legal@subchain.dev</li>
                <li>Address: [Your Business Address]</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
