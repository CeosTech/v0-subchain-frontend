"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Check, Building2, Wallet, Zap, CreditCard } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    id: 1,
    title: "Business Information",
    description: "Tell us about your business",
    icon: Building2,
  },
  {
    id: 2,
    title: "Connect Wallet",
    description: "Connect your Algorand wallet",
    icon: Wallet,
  },
  {
    id: 3,
    title: "Create First Plan",
    description: "Set up your first subscription plan",
    icon: CreditCard,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    description: "",
    walletAddress: "",
    planName: "",
    planPrice: "",
    billingCycle: "monthly",
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Navigation */}
      <nav className="bg-brand-light border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
                <span className="text-brand-dark font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-brand-dark">SubChain</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep >= step.id
                        ? "bg-brand-yellow border-brand-yellow text-brand-dark"
                        : "bg-card border-gray-700 text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${currentStep >= step.id ? "text-brand-light" : "text-gray-500"}`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-700 mx-4">
                    <div
                      className="h-full bg-brand-yellow transition-all duration-500"
                      style={{ width: currentStep > step.id ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-brand-light">{steps[currentStep - 1].title}</CardTitle>
                    <CardDescription className="text-gray-400">{steps[currentStep - 1].description}</CardDescription>
                  </div>
                  <Badge className="bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30">
                    Step {currentStep} of {steps.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="businessName" className="text-brand-light">
                        Business Name
                      </Label>
                      <Input
                        id="businessName"
                        placeholder="Enter your business name"
                        value={formData.businessName}
                        onChange={(e) => updateFormData("businessName", e.target.value)}
                        className="bg-background border-gray-700 text-brand-light placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessType" className="text-brand-light">
                        Business Type
                      </Label>
                      <Input
                        id="businessType"
                        placeholder="e.g., SaaS, Content, Education"
                        value={formData.businessType}
                        onChange={(e) => updateFormData("businessType", e.target.value)}
                        className="bg-background border-gray-700 text-brand-light placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-brand-light">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what you offer..."
                        value={formData.description}
                        onChange={(e) => updateFormData("description", e.target.value)}
                        className="bg-background border-gray-700 text-brand-light placeholder:text-gray-500"
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-background border border-gray-700 rounded-lg p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-brand-yellow/20 rounded-lg flex items-center justify-center">
                          <Wallet className="h-6 w-6 text-brand-yellow" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-brand-light">Connect Algorand Wallet</h3>
                          <p className="text-sm text-gray-400">Use Pera Wallet, MyAlgo, or other supported wallets</p>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 font-semibold shadow-lg">
                        Connect Wallet
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor="walletAddress" className="text-brand-light">
                        Or enter wallet address manually
                      </Label>
                      <Input
                        id="walletAddress"
                        placeholder="Enter your Algorand wallet address"
                        value={formData.walletAddress}
                        onChange={(e) => updateFormData("walletAddress", e.target.value)}
                        className="bg-background border-gray-700 text-brand-light placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="planName" className="text-brand-light">
                        Plan Name
                      </Label>
                      <Input
                        id="planName"
                        placeholder="e.g., Premium, Pro, Basic"
                        value={formData.planName}
                        onChange={(e) => updateFormData("planName", e.target.value)}
                        className="bg-background border-gray-700 text-brand-light placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="planPrice" className="text-brand-light">
                        Price (ALGO)
                      </Label>
                      <Input
                        id="planPrice"
                        type="number"
                        placeholder="10"
                        value={formData.planPrice}
                        onChange={(e) => updateFormData("planPrice", e.target.value)}
                        className="bg-background border-gray-700 text-brand-light placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <Label className="text-brand-light">Billing Cycle</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {["monthly", "quarterly", "yearly"].map((cycle) => (
                          <Button
                            key={cycle}
                            variant={formData.billingCycle === cycle ? "default" : "outline"}
                            className={
                              formData.billingCycle === cycle
                                ? "bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 font-semibold shadow-lg"
                                : "border-gray-700 text-gray-400 hover:text-brand-light hover:border-brand-yellow/50 bg-transparent"
                            }
                            onClick={() => updateFormData("billingCycle", cycle)}
                          >
                            {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-background border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Zap className="h-5 w-5 text-brand-yellow mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-brand-light">Quick Setup</p>
                          <p className="text-sm text-gray-400">
                            You can always edit or add more plans later from your dashboard
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="border-gray-700 text-gray-400 hover:text-brand-light hover:border-brand-yellow/50 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSkip}
                      className="border-gray-700 text-gray-400 hover:text-brand-light hover:border-brand-yellow/50 bg-transparent"
                    >
                      Skip for now
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 font-semibold shadow-lg"
                    >
                      {currentStep === steps.length ? "Complete Setup" : "Continue"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
