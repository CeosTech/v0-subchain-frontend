"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, TrendingUp, Zap, Clock, CheckCircle } from "lucide-react"

interface PaymentWidgetProps {
  planName: string
  amount: number
  currency: string
  interval: "monthly" | "yearly"
  features: string[]
  autoConvertToStable?: boolean
  stableCurrency?: string
  conversionThreshold?: number
  trialDays?: number
  setupFee?: number
}

export default function PaymentWidget({
  planName,
  amount,
  currency = "ALGO",
  interval,
  features,
  autoConvertToStable = false,
  stableCurrency = "USDC",
  conversionThreshold = 100,
  trialDays = 0,
  setupFee = 0,
}: PaymentWidgetProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const handleConnectWallet = async () => {
    setIsConnecting(true)

    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setWalletConnected(true)
    setWalletAddress("ALGO7X8K9L2M3N4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8N9")
    setIsConnecting(false)
  }

  const handleSubscribe = async () => {
    // Simulate subscription process
    await new Promise((resolve) => setTimeout(resolve, 1500))
    alert("Subscription successful! Welcome to " + planName)
  }

  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{planName}</CardTitle>
        <CardDescription>
          <div className="text-3xl font-bold text-foreground mt-2">
            {amount} {currency}
            <span className="text-base font-normal text-muted-foreground">/{interval}</span>
          </div>
          {setupFee > 0 && (
            <div className="text-sm text-muted-foreground mt-1">
              + {setupFee} {currency} setup fee
            </div>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Method Info */}
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Method</span>
            {autoConvertToStable ? (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Auto → {stableCurrency}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                ALGO Native
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {autoConvertToStable ? (
              <>
                Payments automatically converted to {stableCurrency} when reaching {conversionThreshold} ALGO threshold
                for volatility protection.
              </>
            ) : (
              <>Receive payments in native ALGO. Benefit from potential price appreciation but bear volatility risk.</>
            )}
          </div>
        </div>

        {/* Trial Period */}
        {trialDays > 0 && (
          <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <Clock className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">{trialDays} days free trial</span>
          </div>
        )}

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">What's included:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Wallet Connection */}
        {!walletConnected ? (
          <Button onClick={handleConnectWallet} disabled={isConnecting} className="w-full" size="lg">
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting Wallet...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Connect Algorand Wallet
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm font-medium">Wallet Connected</div>
                <div className="text-xs text-muted-foreground">{formatAddress(walletAddress)}</div>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>

            <Button onClick={handleSubscribe} className="w-full" size="lg">
              {trialDays > 0 ? `Start ${trialDays}-Day Free Trial` : `Subscribe for ${amount} ${currency}`}
            </Button>
          </div>
        )}

        {/* Payment Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div>Powered by Algorand blockchain</div>
          <div>
            {autoConvertToStable
              ? `Payments converted to ${stableCurrency} automatically`
              : "Payments received in ALGO"}
          </div>
          {trialDays > 0 && <div>Cancel anytime during trial period</div>}
        </div>
      </CardContent>
    </Card>
  )
}
