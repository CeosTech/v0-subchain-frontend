"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Eye, EyeOff, User, Building, Wallet, ArrowRight, Check, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { apiClient } from "@/lib/django-api-client"
import { connectWallet } from "@/lib/pera"

type AccountType = "individual" | "business"

interface SignupData {
  accountType: AccountType | ""
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
  const [signupDetail, setSignupDetail] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<{ message: string; error?: boolean } | null>(null)
  const [resendLoading, setResendLoading] = useState(false)

  const [formData, setFormData] = useState<SignupData>({
    accountType: "",
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
      const address = await connectWallet({ forceNewConnection: true })
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
    setResendStatus(null)
    if (!formData.walletAddress) {
      setIsLoading(false)
      return
    }

    try {
      const resp = await apiClient.register(
        formData.email,
        formData.password,
        formData.walletAddress,
        formData.email.split("@")[0] || undefined,
      )
      if (resp.error || !resp.data) {
        console.log("register failed", resp.error)
        setIsLoading(false)
        return
      }
      setSignupDetail(resp.data.detail || "Compte créé. Vérifiez votre boîte mail avant de vous connecter.")
      setIsLoading(false)
    } catch (e) {
      console.log("register error", e)
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!formData.email) return
    setResendLoading(true)
    setResendStatus(null)
    try {
      const resp = await apiClient.resendVerificationEmail(formData.email)
      if (resp.error) {
        setResendStatus({ message: resp.error, error: true })
      } else {
        setResendStatus({
          message: resp.data?.detail || "Verification email resent. Please check your inbox.",
        })
      }
    } catch (error) {
      setResendStatus({
        message: error instanceof Error ? error.message : "Unable to resend verification email.",
        error: true,
      })
    } finally {
      setResendLoading(false)
    }
  }

  const hasAccountDetails = () => {
    if (formData.accountType === "individual") {
      return Boolean(formData.firstName && formData.lastName && formData.email && formData.password)
    }
    if (formData.accountType === "business") {
      return Boolean(
        formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.password &&
          formData.companyName &&
          formData.businessType,
      )
    }
    return false
  }

  const hasAddressDetails = () => {
    return Boolean(formData.address && formData.postalCode && formData.city && formData.country)
  }

  const canSubmit = () => {
    return walletConnected && formData.acceptTerms && formData.acceptPrivacy
  }

  if (signupDetail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="mb-2 flex items-center justify-center">
                <Image src="/assets/subchain-glyph.svg" alt="SubChain logo" width={44} height={44} priority />
              </div>
              <CardTitle className="text-2xl">Check your inbox</CardTitle>
              <CardDescription>
                {`We've sent a verification link. Confirm your email to activate your SubChain console.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                <MailCheck className="h-8 w-8" />
              </div>
              <div className="space-y-2 text-white/80">
                <p className="text-base">{signupDetail}</p>
                <p className="text-sm text-white/60">
                  Nous avons envoyé un email à <span className="font-semibold text-white">{formData.email}</span>. Une
                  fois validé, revenez vous connecter depuis la page de login.
                </p>
              </div>
              {resendStatus && (
                <div
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    resendStatus.error ? "border-red-500/60 text-red-200" : "border-emerald-500/60 text-emerald-100",
                  )}
                >
                  {resendStatus.message}
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button className="w-full sm:w-auto" onClick={handleResendVerification} disabled={resendLoading}>
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </Button>
                <Link href="/auth/signin" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
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
            <div className="mb-4 flex items-center justify-center">
              <Image src="/assets/subchain-glyph.svg" alt="SubChain logo" width={44} height={44} priority />
            </div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Start accepting crypto subscriptions today</CardDescription>

            {/* Progress indicator */}
            <div className="mt-6 flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step ? <Check className="h-4 w-4" /> : step}
                  </div>
                  {step < 5 && <div className={`w-8 h-0.5 ${currentStep > step ? "bg-blue-600" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              {["Account type", "Details", "Address", "Wallet", "Finalize"].map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">Choose your account type</Label>
                  <p className="text-sm text-muted-foreground">
                    We’ll tailor the onboarding steps depending on whether you act as an individual or a business.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      {
                        value: "individual" as AccountType,
                        title: "Individual creator",
                        description: "For solo builders, consultants, and indie products.",
                        icon: User,
                        bullets: ["Personal dashboard", "Instant settlement", "No paperwork"],
                      },
                      {
                        value: "business" as AccountType,
                        title: "Business / DAO",
                        description: "For teams handling multiple operators or higher volume.",
                        icon: Building,
                        bullets: ["Team governance", "Advanced analytics", "Programmatic invoicing"],
                      },
                    ].map((option) => {
                      const selected = formData.accountType === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateFormData("accountType", option.value)}
                          className={cn(
                            "group flex h-full flex-col rounded-2xl border px-6 py-6 text-left transition-all duration-200",
                            selected
                              ? "border-white/50 bg-white/10 shadow-[0_20px_50px_-30px_rgba(99,102,241,0.75)]"
                              : "border-white/10 bg-white/2 hover:border-white/30 hover:bg-white/5",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all",
                                selected ? "bg-white text-background" : "bg-white/10 text-white/80 group-hover:bg-white/20",
                              )}
                            >
                              <option.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-white">{option.title}</p>
                              <p className="text-xs text-white/60">{option.description}</p>
                            </div>
                          </div>
                          <ul className="mt-4 space-y-1 text-xs text-white/60">
                            {option.bullets.map((bullet) => (
                              <li key={bullet} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Button className="w-full" onClick={() => setCurrentStep(2)} disabled={!formData.accountType}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
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

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setCurrentStep(3)} disabled={!hasAccountDetails()}>
                    Continue to Address
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
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
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setCurrentStep(4)} disabled={!hasAddressDetails()}>
                    Continue to Wallet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                    <Wallet className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Connect your Pera wallet</h3>
                    <p className="text-sm text-muted-foreground">
                      We’ll deposit subscription revenue directly to this wallet.
                    </p>
                  </div>
                </div>
                {walletConnected ? (
                  <div className="rounded-lg border border-green-300/40 bg-green-100/40 p-4 text-left dark:border-green-700/60 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-300">Wallet connected</span>
                    </div>
                    <p className="mt-1 font-mono text-sm text-green-700 dark:text-green-300">
                      {formData.walletAddress}
                    </p>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full bg-transparent" onClick={handleWalletConnect} disabled={isLoading}>
                    <Wallet className="mr-2 h-4 w-4" />
                    {isLoading ? "Connecting..." : "Connect Pera Wallet"}
                  </Button>
                )}
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setCurrentStep(5)} disabled={!walletConnected}>
                    Continue to Finish
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
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
                  <Button variant="outline" onClick={() => setCurrentStep(4)} className="flex-1">
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
