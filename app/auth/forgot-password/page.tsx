"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Mail, ArrowLeft, ArrowRight } from "lucide-react"

import { apiClient } from "@/lib/django-api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      const response = await apiClient.requestPasswordReset(email)
      if (response.error) {
        throw new Error(response.error)
      }
      setMessage(
        response.data?.detail ??
          "If an account exists for that email address, we just sent password reset instructions.",
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset instructions. Please try again.")
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
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              Enter the email linked to your SubChain account and we’ll send instructions to create a new password.
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
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending instructions…" : "Send reset email"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Link href="/auth/signin" className="inline-flex items-center gap-2 hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
              <Link href="/auth/reset-password" className="hover:text-foreground">
                Already have a token?
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
