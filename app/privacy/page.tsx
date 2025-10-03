"use client"

import { motion } from "framer-motion"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function PrivacyPage() {
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
                <Shield className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              </div>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <h2>1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, make a payment,
                or contact us for support.
              </p>

              <h3>Personal Information</h3>
              <ul>
                <li>Name and contact information</li>
                <li>Email address and phone number</li>
                <li>Billing and payment information</li>
                <li>Algorand wallet addresses</li>
                <li>Business information (for business accounts)</li>
              </ul>

              <h3>Usage Information</h3>
              <ul>
                <li>Transaction history and payment data</li>
                <li>API usage and integration data</li>
                <li>Device and browser information</li>
                <li>Log data and analytics</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Process payments and transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties except as
                described in this policy:
              </p>
              <ul>
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist us in operating our platform</li>
              </ul>

              <h2>4. Blockchain Data</h2>
              <p>
                Please note that transactions on the Algorand blockchain are public and immutable. While we don't
                publish your personal information on the blockchain, transaction amounts and wallet addresses are
                publicly visible.
              </p>

              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2>6. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and comply with
                legal obligations. You may request deletion of your account and associated data at any time.
              </p>

              <h2>7. Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your personal information</li>
                <li>Object to processing of your information</li>
                <li>Data portability</li>
              </ul>

              <h2>8. International Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure
                appropriate safeguards are in place for such transfers.
              </p>

              <h2>9. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any material changes by
                posting the new policy on this page and updating the "last updated" date.
              </p>

              <h2>10. Contact Us</h2>
              <p>If you have any questions about this privacy policy, please contact us at:</p>
              <ul>
                <li>Email: privacy@subchain.dev</li>
                <li>Address: [Your Business Address]</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
