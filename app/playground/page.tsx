"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Code, Send, Copy, Check, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function PlaygroundPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState("plans")
  const [method, setMethod] = useState("GET")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState("sk_test_123...")
  const [copiedCode, setCopiedCode] = useState("")

  const endpoints = {
    plans: {
      GET: { path: "/api/plans/", description: "List all subscription plans" },
      POST: { path: "/api/plans/", description: "Create a new subscription plan" },
    },
    subscribers: {
      GET: { path: "/api/subscribers/", description: "List all subscribers" },
      POST: { path: "/api/subscribers/", description: "Create a new subscriber" },
    },
    payments: {
      GET: { path: "/api/payments/", description: "List all payments" },
      POST: { path: "/api/payments/", description: "Create a payment" },
    },
    analytics: {
      GET: { path: "/api/analytics/overview/", description: "Get analytics overview" },
    },
  }

  const sampleRequests = {
    "plans-POST": {
      name: "Pro Plan",
      description: "Professional subscription with advanced features",
      base_price_eur: 25.0,
      base_price_usd: 30.0,
      preferred_currency: "EUR",
      interval: "monthly",
      features: ["Advanced Analytics", "Priority Support", "API Access"],
    },
    "subscribers-POST": {
      plan: "plan_abc123",
      wallet_address: "ALGO7K9X4M2N8P5Q3R6S9V2W1Y4Z8A3B6C5F2G",
      email: "user@example.com",
    },
    "payments-POST": {
      subscriber: "sub_xyz789",
      preferred_currency: "EUR",
    },
  }

  const executeRequest = async () => {
    setLoading(true)

    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockResponse = {
      "plans-GET": {
        count: 3,
        results: [
          {
            id: "plan_abc123",
            name: "Starter Plan",
            base_price_eur: 9.99,
            current_price_algo: 45.23,
            subscriber_count: 156,
            status: "active",
          },
          {
            id: "plan_def456",
            name: "Pro Plan",
            base_price_eur: 25.0,
            current_price_algo: 113.64,
            subscriber_count: 89,
            status: "active",
          },
        ],
      },
      "plans-POST": {
        id: "plan_xyz789",
        name: "Pro Plan",
        base_price_eur: 25.0,
        current_price_algo: 113.64,
        status: "active",
        created_at: new Date().toISOString(),
      },
    }

    const key = `${selectedEndpoint}-${method}`
    setResponse(JSON.stringify(mockResponse[key as keyof typeof mockResponse] || { success: true }, null, 2))
    setLoading(false)
  }

  const copyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(type)
    setTimeout(() => setCopiedCode(""), 2000)
  }

  const generateCurlCommand = () => {
    const endpoint = endpoints[selectedEndpoint as keyof typeof endpoints]?.[method as keyof typeof endpoints]
    if (!endpoint) return ""

    const baseUrl = "https://api.subchain.dev"
    const headers = [`"Authorization: Bearer ${apiKey}"`, `"Content-Type: application/json"`].join(" \\\n  -H ")

    let command = `curl -X ${method} \\\n  -H ${headers} \\\n  "${baseUrl}${endpoint.path}"`

    if (method === "POST" && sampleRequests[`${selectedEndpoint}-${method}` as keyof typeof sampleRequests]) {
      const body = JSON.stringify(
        sampleRequests[`${selectedEndpoint}-${method}` as keyof typeof sampleRequests],
        null,
        2,
      )
      command += ` \\\n  -d '${body}'`
    }

    return command
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
              <Zap className="h-3 w-3 mr-1" />
              Live API
            </Badge>
            <Button variant="outline" asChild>
              <Link href="/docs">Docs</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Play className="h-12 w-12 text-green-600 mr-4" />
              <h1 className="text-4xl font-bold">API Playground</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Test SubChain API endpoints interactively with live requests and responses
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Request Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  API Request Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Key */}
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk_test_..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Get your API key from the dashboard</p>
                </div>

                {/* Endpoint Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Endpoint</Label>
                    <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plans">Plans</SelectItem>
                        <SelectItem value="subscribers">Subscribers</SelectItem>
                        <SelectItem value="payments">Payments</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Endpoint Info */}
                {endpoints[selectedEndpoint]?.[method] && (
                  <Alert>
                    <Code className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{method}</strong> {endpoints[selectedEndpoint][method].path}
                      <br />
                      <span className="text-muted-foreground">{endpoints[selectedEndpoint][method].description}</span>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Request Body */}
                {method === "POST" && sampleRequests[`${selectedEndpoint}-${method}`] && (
                  <div>
                    <Label htmlFor="request-body">Request Body (JSON)</Label>
                    <Textarea
                      id="request-body"
                      rows={8}
                      className="font-mono text-sm"
                      defaultValue={JSON.stringify(sampleRequests[`${selectedEndpoint}-${method}`], null, 2)}
                    />
                  </div>
                )}

                {/* Execute Button */}
                <Button onClick={executeRequest} disabled={loading} className="w-full">
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Sending Request..." : "Send Request"}
                </Button>
              </CardContent>
            </Card>

            {/* Response */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  API Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="response" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="response">Response</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>

                  <TabsContent value="response">
                    <div className="relative">
                      {response && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 z-10 bg-transparent"
                          onClick={() => copyCode(response, "response")}
                        >
                          {copiedCode === "response" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      )}
                      <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm min-h-[300px]">
                        <code>{response || "// Response will appear here after sending a request"}</code>
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="curl">
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 z-10 bg-transparent"
                        onClick={() => copyCode(generateCurlCommand(), "curl")}
                      >
                        {copiedCode === "curl" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm min-h-[300px]">
                        <code>{generateCurlCommand()}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Common Endpoints */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Popular API Endpoints</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(endpoints).map(([category, methods]) =>
                Object.entries(methods).map(([method, endpoint]) => (
                  <Card
                    key={`${category}-${method}`}
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => {
                      setSelectedEndpoint(category)
                      setMethod(method)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={method === "GET" ? "secondary" : method === "POST" ? "default" : "outline"}>
                          {method}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{category}</span>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground mb-2">{endpoint.path}</p>
                      <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                    </CardContent>
                  </Card>
                )),
              )}
            </div>
          </div>

          {/* API Status */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>API Status & Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold">API Status</h4>
                    <p className="text-sm text-green-600">All Systems Operational</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">Response Time</h4>
                    <p className="text-sm text-muted-foreground">~150ms average</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Code className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold">API Version</h4>
                    <p className="text-sm text-muted-foreground">v1.0.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
