"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, User, Building, Wallet, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { apiClient } from "@/lib/django-api-client"
import { connectWallet } from "@/lib/pera"

type AccountType = "individual" | "business"

interface SignupData {
  accountType: AccountType
  // Individual fields
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  // Business fields
  companyName: string
  vatNumber: string
  businessType: string
  // Address fields
  address: string
  postalCode: string
  city: string
  country: string
  // Wallet
  walletAddress: string
  // Legal
  acceptTerms: boolean
  acceptPrivacy: boolean
  acceptMarketing: boolean
}

const countries = ["France", "USA", "UK", "Germany", "Spain", "Italy", "Canada", "Australia", "Japan", "Other"]
const businessTypes = ["SaaS", "E-commerce", "Consulting", "Agency", "Freelancer", "Non-profit", "Other"]

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)

  const [formData, setFormData] = useState<SignupData>({
    accountType: "individual",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    companyName: "",
    vatNumber: "",
    businessType: "",
    address: "",
    postalCode: "",
    city: "",
    country: "France",
    walletAddress: "",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  })

  const updateFormData = (field: keyof SignupData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleWalletConnect = async () => {
    setIsLoading(true)
    try {
      const address = await connectWallet()
      setWalletConnected(true)
      updateFormData("walletAddress", address)
    } catch (e) {
      console.log("pera connect error", e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const resp = await apiClient.register(
        formData.email,
        formData.password,
        `${formData.firstName}${formData.lastName}`.toLowerCase() || undefined,
        formData.walletAddress || undefined,
      )
      if (resp.error || !resp.data) {
        console.log("register failed", resp.error)
        setIsLoading(false)
        return
      }
      window.location.href = "/dashboard"
    } catch (e) {
      console.log("register error", e)
      setIsLoading(false)
    }
  }

  const canProceedToStep2 = () => {
    if (formData.accountType === "individual") {
      return formData.firstName && formData.lastName && formData.email && formData.password
    } else {
      return (
        formData.firstName &&
        formData.lastName &&
        formData.email &&
        formData.password &&
        formData.companyName &&
        formData.businessType
      )
    }
  }

  const canProceedToStep3 = () => {
    return formData.address && formData.postalCode && formData.city && formData.country
  }

  const canSubmit = () => {
    return walletConnected && formData.acceptTerms && formData.acceptPrivacy
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Start accepting crypto subscriptions today</CardDescription>

            {/* Progress indicator */}
            <div className="flex items-center justify-center mt-6 space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step ? <Check className="h-4 w-4" /> : step}
                  </div>
                  {step < 4 && <div className={`w-8 h-0.5 ${currentStep > step ? "bg-blue-600" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Account</span>
              <span>Address</span>
              <span>Wallet</span>
              <span>Finish</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-4">
                  <Label>Account Type</Label>
                  <Tabs
                    value={formData.accountType}
                    onValueChange={(value: AccountType) => updateFormData("accountType", value)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="individual" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Individual
                      </TabsTrigger>
                      <TabsTrigger value="business" className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Business
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {formData.accountType === "business" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="My Company Inc."
                        value={formData.companyName}
                        onChange={(e) => updateFormData("companyName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type *</Label>
                        <Select
                          value={formData.businessType}
                          onValueChange={(value) => updateFormData("businessType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vatNumber">VAT Number</Label>
                        <Input
                          id="vatNumber"
                          placeholder="FR12345678901"
                          value={formData.vatNumber}
                          onChange={(e) => updateFormData("vatNumber", e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+33123456789"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={() => setCurrentStep(2)} disabled={!canProceedToStep2()}>
                  Continue to Address
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="75001"
                      value={formData.postalCode}
                      onChange={(e) => updateFormData("postalCode", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Paris"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => updateFormData("country", value)}>
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

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setCurrentStep(3)} disabled={!canProceedToStep3()}>
                    Continue to Wallet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Wallet className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Connect Your Pera Wallet</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your wallet to receive subscription payments directly
                    </p>
                  </div>
                </div>

                {walletConnected ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Wallet Connected</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1 font-mono">
                      {formData.walletAddress}
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleWalletConnect}
                    disabled={isLoading}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {isLoading ? "Connecting..." : "Connect Pera Wallet"}
                  </Button>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setCurrentStep(4)} disabled={!walletConnected}>
                    Continue to Finish
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => updateFormData("acceptTerms", checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="acceptTerms" className="text-sm font-medium">
                        I accept the Terms and Conditions *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        By checking this box, you agree to our{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Terms and Conditions
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={formData.acceptPrivacy}
                      onCheckedChange={(checked) => updateFormData("acceptPrivacy", checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="acceptPrivacy" className="text-sm font-medium">
                        I accept the Privacy Policy *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        By checking this box, you agree to our{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptMarketing"
                      checked={formData.acceptMarketing}
                      onCheckedChange={(checked) => updateFormData("acceptMarketing", checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="acceptMarketing" className="text-sm font-medium">
                        I want to receive marketing communications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get updates about new features and product announcements
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={!canSubmit() || isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/auth/signin" className="text-blue-600 hover:underline font-medium">
                    Sign in instead
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
