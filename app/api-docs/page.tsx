"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Book,
  Code,
  Zap,
  Shield,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Play,
  Key,
  Database,
  Webhook,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState("")
  const [selectedEndpoint, setSelectedEndpoint] = useState("")
  const [apiKey, setApiKey] = useState("sk_test_...")
  const [environment, setEnvironment] = useState("sandbox")

  const copyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(type)
    setTimeout(() => setCopiedCode(""), 2000)
  }

  const endpoints = [
    {
      category: "Authentication",
      items: [
        {
          method: "POST",
          path: "/auth/login",
          title: "Login",
          description: "Authenticate and get access token",
        },
        {
          method: "POST",
          path: "/auth/register",
          title: "Register",
          description: "Create new account",
        },
      ],
    },
    {
      category: "Plans",
      items: [
        {
          method: "GET",
          path: "/plans",
          title: "List Plans",
          description: "Retrieve all subscription plans",
        },
        {
          method: "POST",
          path: "/plans",
          title: "Create Plan",
          description: "Create a new subscription plan",
        },
        {
          method: "GET",
          path: "/plans/{id}",
          title: "Get Plan",
          description: "Retrieve a specific plan",
        },
        {
          method: "PUT",
          path: "/plans/{id}",
          title: "Update Plan",
          description: "Update an existing plan",
        },
        {
          method: "DELETE",
          path: "/plans/{id}",
          title: "Delete Plan",
          description: "Delete a subscription plan",
        },
      ],
    },
    {
      category: "Subscriptions",
      items: [
        {
          method: "GET",
          path: "/subscriptions",
          title: "List Subscriptions",
          description: "Retrieve all subscriptions",
        },
        {
          method: "POST",
          path: "/subscriptions",
          title: "Create Subscription",
          description: "Create a new subscription",
        },
        {
          method: "GET",
          path: "/subscriptions/{id}",
          title: "Get Subscription",
          description: "Retrieve a specific subscription",
        },
        {
          method: "PUT",
          path: "/subscriptions/{id}",
          title: "Update Subscription",
          description: "Update subscription details",
        },
        {
          method: "POST",
          path: "/subscriptions/{id}/cancel",
          title: "Cancel Subscription",
          description: "Cancel an active subscription",
        },
        {
          method: "POST",
          path: "/subscriptions/{id}/pause",
          title: "Pause Subscription",
          description: "Pause an active subscription",
        },
        {
          method: "POST",
          path: "/subscriptions/{id}/resume",
          title: "Resume Subscription",
          description: "Resume a paused subscription",
        },
      ],
    },
    {
      category: "Payments",
      items: [
        {
          method: "GET",
          path: "/payments",
          title: "List Payments",
          description: "Retrieve payment history",
        },
        {
          method: "GET",
          path: "/payments/{id}",
          title: "Get Payment",
          description: "Retrieve a specific payment",
        },
        {
          method: "POST",
          path: "/payments/{id}/refund",
          title: "Refund Payment",
          description: "Process a payment refund",
        },
      ],
    },
    {
      category: "Customers",
      items: [
        {
          method: "GET",
          path: "/customers",
          title: "List Customers",
          description: "Retrieve all customers",
        },
        {
          method: "POST",
          path: "/customers",
          title: "Create Customer",
          description: "Create a new customer",
        },
        {
          method: "GET",
          path: "/customers/{id}",
          title: "Get Customer",
          description: "Retrieve a specific customer",
        },
        {
          method: "PUT",
          path: "/customers/{id}",
          title: "Update Customer",
          description: "Update customer information",
        },
      ],
    },
    {
      category: "Analytics",
      items: [
        {
          method: "GET",
          path: "/analytics/revenue",
          title: "Revenue Analytics",
          description: "Get revenue metrics and trends",
        },
        {
          method: "GET",
          path: "/analytics/subscriptions",
          title: "Subscription Analytics",
          description: "Get subscription metrics",
        },
        {
          method: "GET",
          path: "/analytics/churn",
          title: "Churn Analytics",
          description: "Get churn rate and analysis",
        },
      ],
    },
    {
      category: "Webhooks",
      items: [
        {
          method: "GET",
          path: "/webhooks",
          title: "List Webhooks",
          description: "Retrieve webhook endpoints",
        },
        {
          method: "POST",
          path: "/webhooks",
          title: "Create Webhook",
          description: "Create a new webhook endpoint",
        },
        {
          method: "PUT",
          path: "/webhooks/{id}",
          title: "Update Webhook",
          description: "Update webhook configuration",
        },
        {
          method: "DELETE",
          path: "/webhooks/{id}",
          title: "Delete Webhook",
          description: "Delete a webhook endpoint",
        },
      ],
    },
  ]

  const codeExamples = {
    createPlan: `curl -X POST https://api.subchain.dev/v1/plans \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "starter-plan",
    "name": "Starter Plan",
    "description": "Accès de base",
    "amount": "15.000000",
    "currency": "ALGO",
    "interval": "month",
    "trial_days": 0,
    "is_active": true,
    "metadata": {}
  }'`,

    createSubscription: `curl -X POST https://api.subchain.dev/v1/subscriptions \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_id": "cust_abc123",
    "plan_id": "plan_xyz789",
    "wallet_address": "ALGO7K9X4M2NQWERTYUIOPASDFGHJKLZXCVBNM",
    "payment_method": "algorand_wallet",
    "metadata": {
      "source": "website",
      "campaign": "summer2024"
    }
  }'`,

    webhook: `{
  "id": "evt_1234567890",
  "type": "subscription.created",
  "created": 1640995200,
  "data": {
    "object": {
      "id": "sub_abc123",
      "customer": "cust_xyz789",
      "plan": "plan_pro_monthly",
      "status": "active",
      "current_period_start": 1640995200,
      "current_period_end": 1643673600,
      "amount": 2500,
      "currency": "ALGO",
      "wallet_address": "ALGO7K9X4M2NQWERTYUIOPASDFGHJKLZXCVBNM"
    }
  }
}`,

    javascript: `import { SubChain } from '@subchain/sdk'

const subchain = new SubChain({
  apiKey: '${apiKey}',
  environment: '${environment}'
})

// Create a subscription plan
const plan = await subchain.plans.create({
  name: 'Pro Plan',
  amount: 2500,
  currency: 'ALGO',
  interval: 'monthly'
})

// Create a subscription
const subscription = await subchain.subscriptions.create({
  customerId: 'cust_abc123',
  planId: plan.id,
  walletAddress: 'ALGO7K9X4M2NQWERTYUIOPASDFGHJKLZXCVBNM'
})

console.log('Subscription created:', subscription.id)`,

    python: `import subchain

subchain.api_key = "${apiKey}"
subchain.environment = "${environment}"

# Create a subscription plan
plan = subchain.Plan.create(
    name="Pro Plan",
    amount=2500,
    currency="ALGO",
    interval="monthly"
)

# Create a subscription
subscription = subchain.Subscription.create(
    customer_id="cust_abc123",
    plan_id=plan.id,
    wallet_address="ALGO7K9X4M2NQWERTYUIOPASDFGHJKLZXCVBNM"
)

print(f"Subscription created: {subscription.id}")`,

    php: `<?php
require_once('vendor/autoload.php');

\\SubChain\\SubChain::setApiKey('${apiKey}');
\\SubChain\\SubChain::setEnvironment('${environment}');

// Create a subscription plan
$plan = \\SubChain\\Plan::create([
    'name' => 'Pro Plan',
    'amount' => 2500,
    'currency' => 'ALGO',
    'interval' => 'monthly'
]);

// Create a subscription
$subscription = \\SubChain\\Subscription::create([
    'customer_id' => 'cust_abc123',
    'plan_id' => $plan->id,
    'wallet_address' => 'ALGO7K9X4M2NQWERTYUIOPASDFGHJKLZXCVBNM'
]);

echo "Subscription created: " . $subscription->id;
?>`,
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500"
      case "POST":
        return "bg-blue-500"
      case "PUT":
        return "bg-yellow-500"
      case "DELETE":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SubChain
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/docs#api-reference">API Reference</Link>
            </Button>
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
              <h1 className="text-4xl font-bold">API Documentation</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete REST API reference for integrating crypto subscriptions into your application
            </p>
          </motion.div>

          {/* API Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select value={environment} onValueChange={setEnvironment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Base URL:</strong>{" "}
                    {environment === "sandbox" ? "https://api-sandbox.subchain.dev" : "https://api.subchain.dev"}/v1
                  </p>
                </div>
              </CardContent>
            </Card>
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
                      { title: "Authentication", icon: Shield },
                      { title: "Getting Started", icon: Zap },
                      { title: "API Reference", icon: Code },
                      { title: "Webhooks", icon: Webhook },
                      { title: "SDKs", icon: Database },
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

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {endpoints.map((category, categoryIndex) => (
                      <Collapsible key={categoryIndex}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-muted rounded">
                          <span className="font-medium text-sm">{category.category}</span>
                          <ChevronRight className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 space-y-1">
                          {category.items.map((endpoint, endpointIndex) => (
                            <Button
                              key={endpointIndex}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => setSelectedEndpoint(`${category.category}-${endpointIndex}`)}
                            >
                              <span
                                className={`inline-block w-12 text-center text-white text-xs rounded px-1 mr-2 ${getMethodColor(endpoint.method)}`}
                              >
                                {endpoint.method}
                              </span>
                              {endpoint.title}
                            </Button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Authentication */}
              <section id="authentication">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      SubChain API uses API keys to authenticate requests. You can view and manage your API keys in the
                      Dashboard.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">API Key Types</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Test Keys</Badge>
                            <span className="text-sm">
                              Start with <code>sk_test_</code> - Use for testing
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="default">Live Keys</Badge>
                            <span className="text-sm">
                              Start with <code>sk_live_</code> - Use for production
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Authentication Header</h4>
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-4 right-4 z-10 bg-transparent"
                            onClick={() => copyCode(`Authorization: Bearer ${apiKey}`, "auth-header")}
                          >
                            {copiedCode === "auth-header" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto">
                            <code>Authorization: Bearer {apiKey}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Getting Started */}
              <section id="getting-started">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Getting Started
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="curl" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="php">PHP</TabsTrigger>
                      </TabsList>

                      <TabsContent value="curl">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Create a Subscription Plan</h4>
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-4 right-4 z-10 bg-transparent"
                              onClick={() => copyCode(codeExamples.createPlan, "curl-plan")}
                            >
                              {copiedCode === "curl-plan" ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{codeExamples.createPlan}</code>
                            </pre>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="javascript">
                        <div className="space-y-4">
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-4 right-4 z-10 bg-transparent"
                              onClick={() => copyCode(codeExamples.javascript, "js")}
                            >
                              {copiedCode === "js" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{codeExamples.javascript}</code>
                            </pre>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="python">
                        <div className="space-y-4">
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-4 right-4 z-10 bg-transparent"
                              onClick={() => copyCode(codeExamples.python, "python")}
                            >
                              {copiedCode === "python" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{codeExamples.python}</code>
                            </pre>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="php">
                        <div className="space-y-4">
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-4 right-4 z-10 bg-transparent"
                              onClick={() => copyCode(codeExamples.php, "php")}
                            >
                              {copiedCode === "php" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{codeExamples.php}</code>
                            </pre>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </section>

              {/* API Reference */}
              <section id="api-reference">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="h-5 w-5 mr-2" />
                      API Reference
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {endpoints.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                          <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
                          <div className="space-y-4">
                            {category.items.map((endpoint, endpointIndex) => (
                              <Card key={endpointIndex} className="border-l-4 border-l-blue-500">
                                <CardContent className="pt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                      <span
                                        className={`inline-block px-2 py-1 text-white text-xs rounded font-medium ${getMethodColor(endpoint.method)}`}
                                      >
                                        {endpoint.method}
                                      </span>
                                      <code className="text-sm font-mono">{endpoint.path}</code>
                                    </div>
                                    <Button size="sm" variant="outline">
                                      <Play className="h-3 w-3 mr-1" />
                                      Try it
                                    </Button>
                                  </div>
                                  <h4 className="font-semibold">{endpoint.title}</h4>
                                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
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
                      account.
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
                            "plan.created",
                            "plan.updated",
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
                            onClick={() => copyCode(codeExamples.webhook, "webhook")}
                          >
                            {copiedCode === "webhook" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{codeExamples.webhook}</code>
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Security</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Always verify webhook signatures using the SubChain-Signature header</li>
                          <li>• Use HTTPS endpoints only</li>
                          <li>• Implement idempotency to handle duplicate events</li>
                          <li>• Return a 200 status code to acknowledge receipt</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* SDKs */}
              <section id="sdks">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Official SDKs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          name: "JavaScript/TypeScript",
                          install: "npm install @subchain/sdk",
                          docs: "/docs/sdk/javascript",
                        },
                        {
                          name: "Python",
                          install: "pip install subchain",
                          docs: "/docs/sdk/python",
                        },
                        {
                          name: "PHP",
                          install: "composer require subchain/subchain-php",
                          docs: "/docs/sdk/php",
                        },
                        {
                          name: "React",
                          install: "npm install @subchain/react",
                          docs: "/docs/sdk/react",
                        },
                      ].map((sdk, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-lg">{sdk.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium">Installation</Label>
                              <div className="relative mt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="absolute top-2 right-2 z-10 bg-transparent"
                                  onClick={() => copyCode(sdk.install, `install-${index}`)}
                                >
                                  {copiedCode === `install-${index}` ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                                <pre className="bg-slate-900 text-slate-300 p-3 rounded text-sm">
                                  <code>{sdk.install}</code>
                                </pre>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              <ExternalLink className="h-3 w-3 mr-2" />
                              View Documentation
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Rate Limits */}
              <Card>
                <CardHeader>
                  <CardTitle>Rate Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      The SubChain API has rate limits to ensure fair usage and system stability.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Standard Limits</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• 1000 requests per hour</li>
                          <li>• 100 requests per minute</li>
                          <li>• 10 requests per second</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Response Headers</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>
                            • <code>X-RateLimit-Limit</code>
                          </li>
                          <li>
                            • <code>X-RateLimit-Remaining</code>
                          </li>
                          <li>
                            • <code>X-RateLimit-Reset</code>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Codes */}
              <Card>
                <CardHeader>
                  <CardTitle>Error Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      SubChain uses conventional HTTP response codes to indicate the success or failure of an API
                      request.
                    </p>
                    <div className="space-y-3">
                      {[
                        { code: "200", title: "OK", description: "Everything worked as expected" },
                        { code: "400", title: "Bad Request", description: "The request was unacceptable" },
                        { code: "401", title: "Unauthorized", description: "No valid API key provided" },
                        {
                          code: "402",
                          title: "Request Failed",
                          description: "The parameters were valid but the request failed",
                        },
                        { code: "403", title: "Forbidden", description: "The API key doesn't have permissions" },
                        { code: "404", title: "Not Found", description: "The requested resource doesn't exist" },
                        {
                          code: "429",
                          title: "Too Many Requests",
                          description: "Too many requests hit the API too quickly",
                        },
                        { code: "500", title: "Server Error", description: "Something went wrong on SubChain's end" },
                      ].map((error, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                          <Badge
                            variant={
                              error.code.startsWith("2")
                                ? "default"
                                : error.code.startsWith("4")
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {error.code}
                          </Badge>
                          <div>
                            <h5 className="font-semibold">{error.title}</h5>
                            <p className="text-sm text-muted-foreground">{error.description}</p>
                          </div>
                        </div>
                      ))}
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
