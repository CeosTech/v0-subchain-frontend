"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Webhook, ExternalLink, Copy, Check, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

const integrations = [
  {
    name: "Payment Links",
    description: "Create shareable payment links for subscriptions",
    status: "active",
    icon: "🔗",
    category: "payment",
  },
  {
    name: "Payment Widget",
    description: "Embeddable payment widget for your website",
    status: "active",
    icon: "💳",
    category: "payment",
  },
]

const webhookEvents = [
  { name: "subscription.created", description: "New subscription started", enabled: true },
  { name: "subscription.updated", description: "Subscription plan changed", enabled: true },
  { name: "subscription.cancelled", description: "Subscription cancelled", enabled: true },
  { name: "payment.succeeded", description: "Payment processed successfully", enabled: true },
  { name: "payment.failed", description: "Payment failed", enabled: true },
  { name: "customer.created", description: "New customer registered", enabled: false },
  { name: "invoice.created", description: "New invoice generated", enabled: false },
]

export default function IntegrationsPage() {
  const [copiedCode, setCopiedCode] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("https://your-app.com/webhooks/subchain")
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [showWidgetForm, setShowWidgetForm] = useState(false)
  const [linkPreview, setLinkPreview] = useState("")
  const [widgetCode, setWidgetCode] = useState("")

  const copyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(type)
    setTimeout(() => setCopiedCode(""), 2000)
  }

  const webhookCode = `// Express.js webhook handler
app.post('/webhooks/subchain', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['subchain-signature']
  const payload = req.body
  
  try {
    const event = SubChain.webhooks.constructEvent(payload, sig, process.env.WEBHOOK_SECRET)
    
    switch (event.type) {
      case 'subscription.created':
        console.log('New subscription:', event.data)
        // Handle new subscription
        break
      case 'payment.succeeded':
        console.log('Payment succeeded:', event.data)
        // Handle successful payment
        break
      default:
        console.log('Unhandled event type:', event.type)
    }
    
    res.json({received: true})
  } catch (err) {
    console.log('Webhook signature verification failed:', err.message)
    res.status(400).send('Webhook Error')
  }
})`

  const handleCreatePaymentLink = () => {
    // Logic to create payment link
    const newLink = "https://example.com/payment-link"
    setLinkPreview(newLink)
    setShowLinkForm(false)
  }

  const handleGenerateWidgetCode = () => {
    // Logic to generate widget code
    const newCode = `<script src="https://example.com/widget.js"></script>`
    setWidgetCode(newCode)
    setShowWidgetForm(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Connect SubChain with your favorite tools and platforms</p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {/* Payment Links & Widgets Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Payment Links & Widgets
                </CardTitle>
                <CardDescription>Easy ways to collect payments without coding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">🔗 Payment Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {showLinkForm ? (
                        <div className="space-y-4">
                          <Label htmlFor="link-name">Link Name</Label>
                          <Input id="link-name" placeholder="Enter link name" />
                          <Label htmlFor="link-description">Description</Label>
                          <Input id="link-description" placeholder="Enter description" />
                          <Button className="w-full" onClick={handleCreatePaymentLink}>
                            Create Payment Link
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Create shareable links that customers can use to subscribe to your plans
                          </p>
                          <Button className="w-full" onClick={() => setShowLinkForm(true)}>
                            Create Payment Link
                          </Button>
                          {linkPreview && (
                            <div className="mt-4">
                              <p className="text-sm font-medium">Preview:</p>
                              <p className="text-sm text-muted-foreground">{linkPreview}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">💳 Payment Widget</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {showWidgetForm ? (
                        <div className="space-y-4">
                          <Label htmlFor="widget-name">Widget Name</Label>
                          <Input id="widget-name" placeholder="Enter widget name" />
                          <Label htmlFor="widget-description">Description</Label>
                          <Input id="widget-description" placeholder="Enter description" />
                          <Button className="w-full" onClick={handleGenerateWidgetCode}>
                            Generate Widget Code
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Embed a customizable payment widget directly on your website
                          </p>
                          <Button className="w-full" onClick={() => setShowWidgetForm(true)}>
                            Generate Widget Code
                          </Button>
                          {widgetCode && (
                            <div className="mt-4">
                              <p className="text-sm font-medium">Preview:</p>
                              <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                                <code>{widgetCode}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Integration Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge
                            variant={
                              integration.status === "active"
                                ? "default"
                                : integration.status === "beta"
                                  ? "secondary"
                                  : integration.status === "coming_soon"
                                    ? "outline"
                                    : "default"
                            }
                            className="text-xs mt-1"
                          >
                            {integration.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                    <Button
                      className="w-full"
                      variant={integration.status === "active" ? "secondary" : "default"}
                      disabled={integration.status === "coming_soon"}
                    >
                      {integration.status === "active"
                        ? "Configured"
                        : integration.status === "coming_soon"
                          ? "Coming Soon"
                          : integration.status === "beta"
                            ? "Try Beta"
                            : "Install"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Webhook Configuration */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Webhook className="h-5 w-5 mr-2" />
                    Webhook Configuration
                  </CardTitle>
                  <CardDescription>Configure your webhook endpoint to receive real-time events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-app.com/webhooks/subchain"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="webhook-secret"
                        type="password"
                        value="whsec_1234567890abcdef..."
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyCode("whsec_1234567890abcdef...", "secret")}
                      >
                        {copiedCode === "secret" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1">Save Configuration</Button>
                    <Button variant="outline">Test Webhook</Button>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security</AlertTitle>
                    <AlertDescription>
                      Always verify webhook signatures using your secret key to ensure requests are from SubChain.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>

            {/* Webhook Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Events</CardTitle>
                  <CardDescription>Choose which events to send to your webhook endpoint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {webhookEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{event.name}</div>
                          <div className="text-xs text-muted-foreground">{event.description}</div>
                        </div>
                        <Switch defaultChecked={event.enabled} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Webhook Code Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Webhook Handler Example</CardTitle>
                <CardDescription>Example code for handling SubChain webhooks in your application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4 z-10 bg-transparent"
                    onClick={() => copyCode(webhookCode, "webhook")}
                  >
                    {copiedCode === "webhook" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{webhookCode}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
