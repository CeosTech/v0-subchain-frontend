"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { KeyRound, Lock, ArrowLeft, ArrowRight } from "lucide-react"

import { apiClient } from "@/lib/django-api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      const response = await apiClient.resetPassword(token, password)
      if (response.error) {
        throw new Error(response.error)
      }
      setMessage(response.data?.detail ?? "Password updated successfully. You can now sign in with your new password.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <Image src="/assets/subchain-glyph.svg" alt="SubChain logo" width={40} height={40} priority />
            </div>
            <CardTitle className="text-2xl">Create a new password</CardTitle>
            <CardDescription>
              Paste the reset token you received by email and choose a secure password to complete the process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <div className="rounded-lg border border-emerald-400/40 bg-emerald-50/40 px-4 py-3 text-sm text-emerald-900">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-400/30 bg-red-50/40 px-4 py-3 text-sm text-red-900">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 text-left">
                <Label htmlFor="token">Reset token</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="token"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="token_xxx..."
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating password…" : "Reset password"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Link href="/auth/forgot-password" className="inline-flex items-center gap-2 hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Resend instructions
              </Link>
              <Link href="/auth/signin" className="hover:text-foreground">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
