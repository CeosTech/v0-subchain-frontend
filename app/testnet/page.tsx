"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Zap, Copy, RefreshCw, ExternalLink, Wallet, Coins, TestTube, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function TestnetPage() {
  const [testWallet, setTestWallet] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [testBalance, setTestBalance] = useState<number>(0)

  const generateTestWallet = async () => {
    setIsGenerating(true)
    // Simulate wallet generation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockWallet = `TESTNET${Math.random().toString(36).substr(2, 9).toUpperCase()}ALGO${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    setTestWallet(mockWallet)
    setTestBalance(1000 + Math.random() * 9000) // Random balance between 1000-10000
    setIsGenerating(false)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fundWallet = async () => {
    if (!testWallet) return

    // Simulate funding
    const additionalFunds = 1000 + Math.random() * 2000
    setTestBalance((prev) => prev + additionalFunds)
  }

  const testScenarios = [
    {
      title: "Basic Subscription",
      description: "Test a simple monthly subscription flow",
      steps: ["Generate test wallet", "Fund with test ALGO", "Create subscription plan", "Process payment"],
      difficulty: "Easy",
      estimatedTime: "5 minutes",
    },
    {
      title: "Multi-Currency Support",
      description: "Test ALGO and USDC payment options",
      steps: ["Set up dual currency plan", "Test ALGO payment", "Test USDC payment", "Verify conversions"],
      difficulty: "Medium",
      estimatedTime: "10 minutes",
    },
    {
      title: "Webhook Integration",
      description: "Test real-time payment notifications",
      steps: ["Configure webhook endpoint", "Trigger test payment", "Verify webhook delivery", "Handle failures"],
      difficulty: "Advanced",
      estimatedTime: "15 minutes",
    },
  ]

  const testnetResources = [
    {
      name: "Algorand TestNet Faucet",
      description: "Get free test ALGO tokens",
      url: "https://testnet.algoexplorer.io/dispenser",
      type: "Faucet",
    },
    {
      name: "TestNet Explorer",
      description: "View transactions and accounts",
      url: "https://testnet.algoexplorer.io",
      type: "Explorer",
    },
    {
      name: "Pera Wallet TestNet",
      description: "Mobile wallet for testing",
      url: "https://perawallet.app",
      type: "Wallet",
    },
    {
      name: "AlgoSDK Documentation",
      description: "Developer tools and guides",
      url: "https://developer.algorand.org",
      type: "Docs",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SubChain
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <TestTube className="h-3 w-3 mr-1" />
                TestNet
              </Badge>
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold">TestNet Environment</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test SubChain's subscription features safely with Algorand TestNet. No real money required!
          </p>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>TestNet Notice</AlertTitle>
            <AlertDescription>
              This is a testing environment using Algorand TestNet. All transactions use test tokens with no real value.
              Data may be reset periodically.
            </AlertDescription>
          </Alert>
        </motion.div>

        <Tabs defaultValue="wallet" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wallet">Test Wallet</TabsTrigger>
            <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="api">API Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Test Wallet Generator
                  </CardTitle>
                  <CardDescription>Generate a test wallet with TestNet ALGO for testing subscriptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <Button
                      onClick={generateTestWallet}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Test Wallet
                        </>
                      )}
                    </Button>
                    {testWallet && (
                      <Button onClick={fundWallet} variant="outline">
                        <Coins className="h-4 w-4 mr-2" />
                        Add Test Funds
                      </Button>
                    )}
                  </div>

                  {testWallet && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Wallet Address</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(testWallet)}>
                            {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div className="font-mono text-sm bg-background rounded p-2 break-all">{testWallet}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Balance</span>
                          <span className="font-medium">{testBalance.toFixed(2)} Test ALGO</span>
                        </div>
                      </div>

                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Wallet Ready!</AlertTitle>
                        <AlertDescription>
                          Your test wallet is funded and ready to use. You can now test subscription payments and other
                          features safely.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              {testScenarios.map((scenario, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{scenario.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              scenario.difficulty === "Easy"
                                ? "default"
                                : scenario.difficulty === "Medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {scenario.difficulty}
                          </Badge>
                          <Badge variant="outline">{scenario.estimatedTime}</Badge>
                        </div>
                      </div>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-medium">Test Steps:</h4>
                        <ol className="list-decimal list-inside space-y-1">
                          {scenario.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-muted-foreground">
                              {step}
                            </li>
                          ))}
                        </ol>
                        <Button className="w-full mt-4" asChild>
                          <Link href="/dashboard">Start Test Scenario</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {testnetResources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{resource.name}</CardTitle>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Resource
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>API Testing Environment</CardTitle>
                  <CardDescription>Test SubChain's API endpoints with your test wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">TestNet API Base URL</h4>
                    <div className="font-mono text-sm bg-background rounded p-2">
                      https://testnet-api.subchain.dev/v1
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Available Endpoints:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <code className="text-sm">POST /plans</code>
                        <Badge variant="outline">Create Plan</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <code className="text-sm">POST /subscriptions</code>
                        <Badge variant="outline">Subscribe</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <code className="text-sm">GET /analytics</code>
                        <Badge variant="outline">Get Analytics</Badge>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link href="/playground">
                      <TestTube className="h-4 w-4 mr-2" />
                      Open API Playground
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card>
            <CardHeader>
              <CardTitle>Ready to Start Testing?</CardTitle>
              <CardDescription>Follow our quick start guide to begin testing SubChain features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center space-x-4">
                <Button asChild variant="outline">
                  <Link href="/docs">View Documentation</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
