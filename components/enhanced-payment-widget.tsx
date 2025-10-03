"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Wallet,
  Check,
  ExternalLink,
  AlertCircle,
  Loader2,
  CreditCard,
  Shield,
  Zap,
  User,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PaymentWidgetProps {
  isOpen: boolean
  onClose: () => void
  planId?: string
  planName?: string
  amount?: number
  currency?: "ALGO" | "USDC"
  interval?: "monthly" | "yearly"
  // Customization props
  companyName?: string
  companyLogo?: string
  primaryColor?: string
  backgroundColor?: string
}

type PaymentStep =
  | "customer_info"
  | "billing_info"
  | "select_wallet"
  | "connect"
  | "confirm"
  | "processing"
  | "success"
  | "error"

interface WalletOption {
  id: string
  name: string
  icon: string
  description: string
  available: boolean
}

interface CustomerInfo {
  customer_type: "individual" | "business"
  first_name: string
  last_name: string
  company_name: string
  email: string
  phone: string
  address: string
  postal_code: string
  city: string
  country: string
  vat_number: string
  billing_same_as_personal: boolean
  billing_address: string
  billing_postal_code: string
  billing_city: string
  billing_country: string
  accept_terms: boolean
  auto_convert: boolean
  stable_currency: "USDC" | "USDT" | "EUROC"
}

const walletOptions: WalletOption[] = [
  {
    id: "pera",
    name: "Pera Wallet",
    icon: "🟢",
    description: "Most popular Algorand wallet",
    available: true,
  },
  {
    id: "defly",
    name: "Defly Wallet",
    icon: "🦋",
    description: "DeFi-focused wallet with advanced features",
    available: true,
  },
  {
    id: "exodus",
    name: "Exodus",
    icon: "🚀",
    description: "Multi-chain wallet with beautiful UI",
    available: true,
  },
  {
    id: "myalgo",
    name: "MyAlgo Wallet",
    icon: "🔐",
    description: "Web-based wallet for Algorand",
    available: false,
  },
]

const countries = ["France", "USA", "UK", "Germany", "Spain", "Italy", "Canada", "Australia", "Japan", "Other"]

export function EnhancedPaymentWidget({
  isOpen,
  onClose,
  planId = "plan_123",
  planName = "Pro Plan",
  amount = 25,
  currency = "ALGO",
  interval = "monthly",
  companyName = "SubChain",
  companyLogo,
  primaryColor = "#3b82f6",
  backgroundColor = "#ffffff",
}: PaymentWidgetProps) {
  const [step, setStep] = useState<PaymentStep>("customer_info")
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customer_type: "individual",
    first_name: "",
    last_name: "",
    company_name: "",
    email: "",
    phone: "",
    address: "",
    postal_code: "",
    city: "",
    country: "France",
    vat_number: "",
    billing_same_as_personal: true,
    billing_address: "",
    billing_postal_code: "",
    billing_city: "",
    billing_country: "France",
    accept_terms: false,
    auto_convert: false,
    stable_currency: "USDC",
  })

  const networkFee = 0.001
  const totalAmount = amount + networkFee

  useEffect(() => {
    if (step === "processing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setStep("success")
            setTransactionHash(`TX${Math.random().toString(36).substr(2, 9).toUpperCase()}`)
            return 100
          }
          return prev + Math.random() * 15 + 5
        })
      }, 500)
      return () => clearInterval(interval)
    }
  }, [step])

  const validateCustomerInfo = () => {
    if (!customerInfo.first_name || !customerInfo.last_name || !customerInfo.email) {
      return "Please fill in all required personal information"
    }
    if (customerInfo.customer_type === "business" && !customerInfo.company_name) {
      return "Company name is required for business customers"
    }
    if (!customerInfo.address || !customerInfo.postal_code || !customerInfo.city) {
      return "Complete address is required"
    }
    if (!customerInfo.accept_terms) {
      return "You must accept the terms and conditions"
    }
    return null
  }

  const handleNextStep = () => {
    if (step === "customer_info") {
      const validation = validateCustomerInfo()
      if (validation) {
        setError(validation)
        return
      }
      setError(null)
      setStep("billing_info")
    } else if (step === "billing_info") {
      setStep("select_wallet")
    }
  }

  const handleWalletSelect = (walletId: string) => {
    const wallet = walletOptions.find((w) => w.id === walletId)
    if (!wallet?.available) return

    setSelectedWallet(walletId)
    setStep("connect")
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (Math.random() < 0.1) {
        throw new Error("Failed to connect to wallet. Please try again.")
      }

      setWalletAddress(`ALGO${Math.random().toString(36).substr(2, 8).toUpperCase()}`)
      setWalletBalance(Math.random() * 1000 + 100)
      setStep("confirm")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
      setStep("error")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleConfirm = async () => {
    setIsProcessing(true)
    setError(null)
    setProgress(0)
    setStep("processing")

    setTimeout(() => {
      if (Math.random() < 0.15) {
        setError("Insufficient balance or transaction failed")
        setStep("error")
        setIsProcessing(false)
      }
    }, 3000)
  }

  const handleRetry = () => {
    setError(null)
    setStep("confirm")
  }

  const handleClose = () => {
    setStep("customer_info")
    setSelectedWallet(null)
    setError(null)
    setProgress(0)
    setTransactionHash(null)
    setWalletAddress(null)
    setWalletBalance(null)
    setCustomerInfo({
      customer_type: "individual",
      first_name: "",
      last_name: "",
      company_name: "",
      email: "",
      phone: "",
      address: "",
      postal_code: "",
      city: "",
      country: "France",
      vat_number: "",
      billing_same_as_personal: true,
      billing_address: "",
      billing_postal_code: "",
      billing_city: "",
      billing_country: "France",
      accept_terms: false,
      auto_convert: false,
      stable_currency: "USDC",
    })
    onClose()
  }

  const getStepTitle = () => {
    switch (step) {
      case "customer_info":
        return "Customer Information"
      case "billing_info":
        return "Billing Information"
      case "select_wallet":
        return "Choose Your Wallet"
      case "connect":
        return "Connect Wallet"
      case "confirm":
        return "Confirm Subscription"
      case "processing":
        return "Processing Payment"
      case "success":
        return "Subscription Activated!"
      case "error":
        return "Payment Failed"
      default:
        return "Subscribe"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="border-0 shadow-2xl" style={{ backgroundColor }}>
              <CardHeader className="pb-4" style={{ borderBottomColor: primaryColor }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {companyLogo && (
                      <img src={companyLogo || "/placeholder.svg"} alt={companyName} className="h-8 w-8 rounded" />
                    )}
                    <div>
                      <CardTitle className="text-lg" style={{ color: primaryColor }}>
                        {companyName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{getStepTitle()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="text-2xl font-bold">{planName}</span>
                    <p className="text-sm text-muted-foreground">
                      {amount} {currency}/{interval}
                    </p>
                  </div>
                  <Badge variant="secondary" style={{ backgroundColor: primaryColor, color: "white" }}>
                    {currency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {step === "customer_info" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="personal">Personal Info</TabsTrigger>
                        <TabsTrigger value="address">Address</TabsTrigger>
                      </TabsList>

                      <TabsContent value="personal" className="space-y-4">
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Customer Type</Label>
                            <Select
                              value={customerInfo.customer_type}
                              onValueChange={(value: "individual" | "business") =>
                                setCustomerInfo((prev) => ({ ...prev, customer_type: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="individual">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    Individual
                                  </div>
                                </SelectItem>
                                <SelectItem value="business">
                                  <div className="flex items-center">
                                    <Building className="h-4 w-4 mr-2" />
                                    Business
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="first_name">First Name *</Label>
                              <Input
                                id="first_name"
                                value={customerInfo.first_name}
                                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, first_name: e.target.value }))}
                                placeholder="John"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="last_name">Last Name *</Label>
                              <Input
                                id="last_name"
                                value={customerInfo.last_name}
                                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, last_name: e.target.value }))}
                                placeholder="Doe"
                              />
                            </div>
                          </div>

                          {customerInfo.customer_type === "business" && (
                            <div className="grid gap-2">
                              <Label htmlFor="company_name">Company Name *</Label>
                              <Input
                                id="company_name"
                                value={customerInfo.company_name}
                                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, company_name: e.target.value }))}
                                placeholder="My Company Inc."
                              />
                            </div>
                          )}

                          <div className="grid gap-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                              placeholder="john@example.com"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={customerInfo.phone}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                              placeholder="+33123456789"
                            />
                          </div>

                          {customerInfo.customer_type === "business" && (
                            <div className="grid gap-2">
                              <Label htmlFor="vat_number">VAT Number</Label>
                              <Input
                                id="vat_number"
                                value={customerInfo.vat_number}
                                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, vat_number: e.target.value }))}
                                placeholder="FR12345678901"
                              />
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="address" className="space-y-4">
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                              id="address"
                              value={customerInfo.address}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                              placeholder="123 Main Street"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="postal_code">Postal Code *</Label>
                              <Input
                                id="postal_code"
                                value={customerInfo.postal_code}
                                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, postal_code: e.target.value }))}
                                placeholder="75001"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="city">City *</Label>
                              <Input
                                id="city"
                                value={customerInfo.city}
                                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, city: e.target.value }))}
                                placeholder="Paris"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="country">Country *</Label>
                              <Select
                                value={customerInfo.country}
                                onValueChange={(value) => setCustomerInfo((prev) => ({ ...prev, country: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {countries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                      {country}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="accept_terms"
                          checked={customerInfo.accept_terms}
                          onCheckedChange={(checked) =>
                            setCustomerInfo((prev) => ({ ...prev, accept_terms: checked as boolean }))
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="accept_terms" className="text-sm font-medium">
                            I accept the Terms and Conditions *
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            By checking this box, you agree to our{" "}
                            <Button variant="link" className="h-auto p-0 text-xs" style={{ color: primaryColor }}>
                              Terms and Conditions
                            </Button>{" "}
                            and{" "}
                            <Button variant="link" className="h-auto p-0 text-xs" style={{ color: primaryColor }}>
                              Privacy Policy
                            </Button>
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" onClick={handleNextStep} style={{ backgroundColor: primaryColor }}>
                      Continue to Billing
                    </Button>
                  </motion.div>
                )}

                {step === "billing_info" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="billing_same_as_personal"
                        checked={customerInfo.billing_same_as_personal}
                        onCheckedChange={(checked) =>
                          setCustomerInfo((prev) => ({ ...prev, billing_same_as_personal: checked as boolean }))
                        }
                      />
                      <Label htmlFor="billing_same_as_personal">Billing address same as personal address</Label>
                    </div>

                    {!customerInfo.billing_same_as_personal && (
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="billing_address">Billing Address</Label>
                          <Input
                            id="billing_address"
                            value={customerInfo.billing_address}
                            onChange={(e) => setCustomerInfo((prev) => ({ ...prev, billing_address: e.target.value }))}
                            placeholder="456 Billing Street"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="billing_postal_code">Postal Code</Label>
                            <Input
                              id="billing_postal_code"
                              value={customerInfo.billing_postal_code}
                              onChange={(e) =>
                                setCustomerInfo((prev) => ({ ...prev, billing_postal_code: e.target.value }))
                              }
                              placeholder="75002"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="billing_city">City</Label>
                            <Input
                              id="billing_city"
                              value={customerInfo.billing_city}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, billing_city: e.target.value }))}
                              placeholder="Paris"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="billing_country">Country</Label>
                            <Select
                              value={customerInfo.billing_country}
                              onValueChange={(value) =>
                                setCustomerInfo((prev) => ({ ...prev, billing_country: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Conversion Settings */}
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Auto-Convert to Stablecoin</Label>
                          <p className="text-sm text-muted-foreground">
                            Convert ALGO payments to stablecoins automatically
                          </p>
                        </div>
                        <Checkbox
                          checked={customerInfo.auto_convert}
                          onCheckedChange={(checked) =>
                            setCustomerInfo((prev) => ({ ...prev, auto_convert: checked as boolean }))
                          }
                        />
                      </div>

                      {customerInfo.auto_convert && (
                        <div className="grid gap-2 pt-4 border-t">
                          <Label htmlFor="stable_currency">Target Stablecoin</Label>
                          <Select
                            value={customerInfo.stable_currency}
                            onValueChange={(value: "USDC" | "USDT" | "EUROC") =>
                              setCustomerInfo((prev) => ({ ...prev, stable_currency: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                              <SelectItem value="USDT">USDT (Tether)</SelectItem>
                              <SelectItem value="EUROC">EUROC (Euro Coin)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setStep("customer_info")} className="flex-1">
                        Back
                      </Button>
                      <Button className="flex-1" onClick={handleNextStep} style={{ backgroundColor: primaryColor }}>
                        Continue to Payment
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === "select_wallet" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="space-y-3">
                      {walletOptions.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => handleWalletSelect(wallet.id)}
                          disabled={!wallet.available}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            wallet.available
                              ? "border-muted hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                              : "border-muted bg-muted/50 cursor-not-allowed opacity-50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{wallet.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{wallet.name}</h3>
                                {!wallet.available && (
                                  <Badge variant="outline" className="text-xs">
                                    Coming Soon
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{wallet.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your wallet connection is secured by WalletConnect. We never store your private keys.
                      </AlertDescription>
                    </Alert>

                    <Button variant="outline" onClick={() => setStep("billing_info")} className="w-full">
                      Back to Billing
                    </Button>
                  </motion.div>
                )}

                {step === "connect" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="text-center space-y-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {isConnecting ? (
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        ) : (
                          <Wallet className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {isConnecting
                            ? "Connecting..."
                            : `Connect ${walletOptions.find((w) => w.id === selectedWallet)?.name}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {isConnecting
                            ? "Please approve the connection in your wallet"
                            : "Click below to connect your wallet securely"}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleConnect}
                      disabled={isConnecting}
                      style={{ backgroundColor: primaryColor }}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                {step === "confirm" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Customer</span>
                        <span className="text-sm font-medium">
                          {customerInfo.first_name} {customerInfo.last_name}
                          {customerInfo.company_name && ` (${customerInfo.company_name})`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Connected Wallet</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {walletAddress}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Balance</span>
                        <span className="text-sm font-medium">
                          {walletBalance?.toFixed(2)} {currency}
                        </span>
                      </div>
                      {walletBalance && walletBalance < totalAmount && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Insufficient balance. You need {totalAmount.toFixed(3)} {currency}.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subscription Amount</span>
                        <span>
                          {amount} {currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network Fee</span>
                        <span>
                          {networkFee} {currency}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>
                            {totalAmount.toFixed(3)} {currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      <span>Lightning fast • 4.5s finality • Carbon negative</span>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleConfirm}
                      disabled={isProcessing || (walletBalance !== null && walletBalance < totalAmount)}
                      style={{ backgroundColor: primaryColor }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Confirm Subscription
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      You will be charged {amount} {currency} {interval} until cancelled
                    </p>
                  </motion.div>
                )}

                {step === "processing" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-center"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Processing Payment</h3>
                      <p className="text-sm text-muted-foreground">Please wait while we process your transaction...</p>
                    </div>
                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {progress < 30
                          ? "Validating transaction..."
                          : progress < 60
                            ? "Broadcasting to network..."
                            : progress < 90
                              ? "Confirming on blockchain..."
                              : "Finalizing subscription..."}
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Check className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                        Subscription Activated!
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Welcome to {planName}! Your subscription is now active.
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Transaction Hash</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          <span className="font-mono text-xs">{transactionHash}</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Next Payment</span>
                        <span>
                          {new Date(
                            Date.now() + (interval === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Amount Paid</span>
                        <span className="font-medium">
                          {amount} {currency}
                        </span>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleClose}>
                      Continue to Dashboard
                    </Button>
                  </motion.div>
                )}

                {step === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Payment Failed</h3>
                      <p className="text-sm text-muted-foreground mt-2">{error}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                        Cancel
                      </Button>
                      <Button onClick={handleRetry} className="flex-1">
                        Try Again
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
