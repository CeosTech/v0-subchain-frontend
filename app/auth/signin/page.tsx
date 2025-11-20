"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Eye, EyeOff, Wallet, ArrowRight, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { apiClient } from "@/lib/django-api-client"
import { connectWallet, disconnectWallet, pera } from "@/lib/pera"
import { cn } from "@/lib/utils"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationPrompt, setVerificationPrompt] = useState<string | null>(null)
  const [resendNotice, setResendNotice] = useState<{ message: string; error?: boolean } | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isDisconnectingWallet, setIsDisconnectingWallet] = useState(false)

  useEffect(() => {
    let active = true
    if (!pera) return
    pera
      .reconnectSession()
      .then((accounts) => {
        if (!active || !accounts?.length) return
        setWalletAddress(accounts[0])
      })
      .catch((error) => {
        console.error("pera reconnect error", error)
      })
    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setVerificationPrompt(null)
    setResendNotice(null)
    try {
      const resp = await apiClient.login(email, password)
      if (resp.error || !resp.data) {
        console.log("login failed", resp.error)
        if (resp.status === 403 && resp.error?.toLowerCase().includes("not verified")) {
          setVerificationPrompt(resp.error)
          setPendingEmail(email)
          setIsLoading(false)
          return
        }
        setError(resp.error || "Invalid credentials")
        setIsLoading(false)
        return
      }
      setVerificationPrompt(null)
      window.location.href = "/dashboard"
    } catch (e) {
      console.log("login error", e)
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    setIsLoading(true)
    try {
      if (pera?.session?.accounts?.length) {
        const address = pera.session.accounts[0]
        setWalletAddress(address)
        window.location.href = "/dashboard"
        return
      }
      const address = await connectWallet()
      setWalletAddress(address)
      console.log("wallet connected", address)
      window.location.href = "/dashboard"
    } catch (e) {
      console.log("pera connect error", e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletDisconnect = async () => {
    setIsDisconnectingWallet(true)
    try {
      await disconnectWallet()
      setWalletAddress(null)
    } catch (e) {
      console.log("pera disconnect error", e)
    } finally {
      setIsDisconnectingWallet(false)
    }
  }

  const handleResendVerification = async () => {
    const targetEmail = pendingEmail || email
    if (!targetEmail) return
    setResendLoading(true)
    setResendNotice(null)
    try {
      const resp = await apiClient.resendVerificationEmail(targetEmail)
      if (resp.error) {
        setResendNotice({ message: resp.error, error: true })
      } else {
        setResendNotice({
          message: resp.data?.detail || "Verification email resent. Please check your inbox.",
        })
      }
    } catch (error) {
      setResendNotice({
        message: error instanceof Error ? error.message : "Unable to resend verification email.",
        error: true,
      })
    } finally {
      setResendLoading(false)
    }
  }

  if (verificationPrompt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="mb-2 flex items-center justify-center">
                <Image src="/assets/subchain-glyph.svg" alt="SubChain logo" width={40} height={40} priority />
              </div>
              <CardTitle className="text-2xl">Verify your email to continue</CardTitle>
              <CardDescription>{verificationPrompt}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                <MailCheck className="h-8 w-8" />
              </div>
              <p className="text-sm text-white/65">
                Nous avons besoin d&apos;une adresse confirmée pour activer votre compte {pendingEmail || email}. Vérifiez
                vos emails puis revenez vous connecter. Vous pouvez aussi renvoyer un email de confirmation.
              </p>
              {resendNotice && (
                <div
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    resendNotice.error ? "border-red-500/60 text-red-200" : "border-emerald-500/60 text-emerald-100",
                  )}
                >
                  {resendNotice.message}
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Button onClick={handleResendVerification} disabled={resendLoading}>
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setVerificationPrompt(null)
                    setResendNotice(null)
                  }}
                >
                  Back to login form
                </Button>
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
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <Image src="/assets/subchain-glyph.svg" alt="SubChain logo" width={40} height={40} priority />
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your SubChain account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setError(null)}
                  className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setError(null)}
                    className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
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

              <div className="flex items-center justify-between">
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent" onClick={handleWalletConnect} disabled={isLoading}>
              <Wallet className="mr-2 h-4 w-4" />
              {walletAddress ? `Continue as ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect with Pera Wallet"}
            </Button>
            {walletAddress && (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleWalletDisconnect}
                disabled={isDisconnectingWallet}
              >
                {isDisconnectingWallet ? "Disconnecting..." : "Use another wallet"}
              </Button>
            )}

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
