"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Book, LinkIcon, Code, Zap, Shield, Copy, Check, ExternalLink, Webhook, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState("")

  const copyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(type)
    setTimeout(() => setCopiedCode(""), 2000)
  }

  const paymentLinkExample = `https://pay.subchain.dev/link/pl_abc123?
  plan=pro_monthly&
  amount=25&
  currency=ALGO&
  customer_email=john@example.com`

  const widgetExample = `<iframe 
  src="https://pay.subchain.dev/widget/wg_xyz789" 
  width="400" 
  height="600"
  frameborder="0">
</iframe>`

  const webhookExample = `{
  "id": "evt_1234567890",
  "type": "subscription.created",
  "created": 1640995200,
  "data": {
    "object": {
      "id": "sub_abc123",
      "customer": "cust_xyz789",
      "plan": "plan_pro_monthly",
      "status": "active",
      "amount": 2500,
      "currency": "ALGO"
    }
  }
}`

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/subchain-glyph.svg" alt="SubChain logo" width={32} height={32} />
            <span className="text-base font-semibold uppercase tracking-[0.2em] text-white/80">SubChain</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              <Book className="h-12 w-12 text-blue-600 mr-4" />
              <h1 className="text-4xl font-bold">Documentation</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn how to integrate crypto subscriptions into your business with payment links and widgets
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { title: "Getting Started", icon: Zap },
                      { title: "Payment Links", icon: LinkIcon },
                      { title: "Payment Widgets", icon: Code },
                      { title: "Webhooks", icon: Webhook },
                      { title: "Security", icon: Shield },
                    ].map((item, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() =>
                          document
                            .getElementById(item.title.toLowerCase().replace(" ", "-"))
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Getting Started */}
              <section id="getting-started">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Getting Started
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      SubChain makes it easy to accept crypto subscriptions without any coding required. Choose between
                      payment links for simple sharing or embeddable widgets for your website.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <LinkIcon className="h-5 w-5 mr-2" />
                            Payment Links
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create shareable links that customers can use to subscribe to your plans
                          </p>
                          <ul className="text-sm space-y-1">
                            <li>• No coding required</li>
                            <li>• Share via email, social media, or SMS</li>
                            <li>• Customizable branding</li>
                            <li>• Real-time analytics</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Code className="h-5 w-5 mr-2" />
                            Payment Widgets
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Embed payment forms directly on your website with a simple iframe
                          </p>
                          <ul className="text-sm space-y-1">
                            <li>• Easy iframe integration</li>
                            <li>• Responsive design</li>
                            <li>• Custom styling options</li>
                            <li>• Secure payment processing</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Pricing Model</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        SubChain uses a simple commission-based model: <strong>2.4% + 0.30 ALGO</strong> per
                        transaction. No monthly fees, no setup costs - you only pay when you earn.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Payment Links */}
              <section id="payment-links">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LinkIcon className="h-5 w-5 mr-2" />
                      Payment Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Payment links are the easiest way to start accepting crypto subscriptions. Create a link in your
                      dashboard and share it with your customers.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Creating a Payment Link</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                          <li>Go to your SubChain dashboard</li>
                          <li>Navigate to Integrations → Payment Links</li>
                          <li>Click &quot;Create Payment Link&quot;</li>
                          <li>Configure your plan, pricing, and branding</li>
                          <li>Copy and share your link</li>
                        </ol>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Example Payment Link</h4>
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-4 right-4 z-10 bg-transparent"
                            onClick={() => copyCode(paymentLinkExample, "payment-link")}
                          >
                            {copiedCode === "payment-link" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{paymentLinkExample}</code>
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Customization Options</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Custom branding with your logo and colors</li>
                          <li>• Pre-filled customer information</li>
                          <li>• Multiple currency options (ALGO, USDC)</li>
                          <li>• Auto-conversion to stablecoins</li>
                          <li>• Custom success and cancel URLs</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Payment Widgets */}
              <section id="payment-widgets">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="h-5 w-5 mr-2" />
                      Payment Widgets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Embed payment forms directly on your website using our secure iframe widgets. No backend
                      integration required.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Basic Integration</h4>
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-4 right-4 z-10 bg-transparent"
                            onClick={() => copyCode(widgetExample, "widget")}
                          >
                            {copiedCode === "widget" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{widgetExample}</code>
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Widget Features</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Responsive design that works on all devices</li>
                          <li>• Secure payment processing</li>
                          <li>• Real-time validation and error handling</li>
                          <li>• Support for multiple cryptocurrencies</li>
                          <li>• Customizable styling and branding</li>
                          <li>• Built-in customer information collection</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Customization</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Customize your widget appearance in the dashboard:
                        </p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Upload your company logo</li>
                          <li>• Set custom colors and fonts</li>
                          <li>• Configure payment options</li>
                          <li>• Add custom CSS for advanced styling</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Webhooks */}
              <section id="webhooks">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Webhook className="h-5 w-5 mr-2" />
                      Webhooks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Webhooks allow your application to receive real-time notifications about events in your SubChain
                      account, such as successful payments or subscription changes.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Available Events</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "subscription.created",
                            "subscription.updated",
                            "subscription.cancelled",
                            "payment.succeeded",
                            "payment.failed",
                            "customer.created",
                          ].map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Webhook Payload Example</h4>
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-4 right-4 z-10 bg-transparent"
                            onClick={() => copyCode(webhookExample, "webhook")}
                          >
                            {copiedCode === "webhook" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{webhookExample}</code>
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Setting Up Webhooks</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                          <li>Go to Dashboard → Integrations → Webhooks</li>
                          <li>Add your webhook endpoint URL</li>
                          <li>Select the events you want to receive</li>
                          <li>Save your webhook secret for signature verification</li>
                          <li>Test your webhook endpoint</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Security */}
              <section id="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      SubChain is built with security as a top priority. All transactions are processed securely on the
                      Algorand blockchain.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Data Protection</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• End-to-end encryption</li>
                          <li>• PCI DSS compliance</li>
                          <li>• GDPR compliant</li>
                          <li>• Regular security audits</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Blockchain Security</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Algorand&apos;s secure consensus</li>
                          <li>• Instant transaction finality</li>
                          <li>• Smart contract audits</li>
                          <li>• Multi-signature wallets</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Best Practices</h4>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Always verify webhook signatures</li>
                        <li>• Use HTTPS for all webhook endpoints</li>
                        <li>• Store API keys securely</li>
                        <li>• Monitor your account regularly</li>
                        <li>• Keep your wallet software updated</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Support Channels</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Support Portal
                          </Button>
                        </li>
                        <li>
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Community Discord
                          </Button>
                        </li>
                        <li>
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Email Support
                          </Button>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Resources</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Video Tutorials
                          </Button>
                        </li>
                        <li>
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            FAQ
                          </Button>
                        </li>
                        <li>
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Status Page
                          </Button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
