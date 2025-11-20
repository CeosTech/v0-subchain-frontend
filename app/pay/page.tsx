"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Wallet, ArrowRight, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient, type SubscriptionPlan } from "@/lib/django-api-client"
import { connectWallet, disconnectWallet, pera } from "@/lib/pera"

interface SubscriptionStatus {
  success: boolean
  message: string
}

function PayPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planCodeParam = searchParams.get("plan")
  const planCode = planCodeParam?.toLowerCase().trim() || ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [disconnectingWallet, setDisconnectingWallet] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [subscribing, setSubscribing] = useState(false)
  const [planId, setPlanId] = useState<string | null>(null)
  const [resolvingPlanId, setResolvingPlanId] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated())

  useEffect(() => {
    setIsAuthenticated(apiClient.isAuthenticated())
  }, [])

  useEffect(() => {
    if (!planCode) {
      setError("Aucun plan n'a été fourni.")
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setError(null)
    apiClient
      .getPublicPlan(planCode)
      .then((response) => {
        if (!active) return
        if (response.error || !response.data?.plan) {
          setError(response.error || "Plan introuvable.")
          return
        }
        setPlan(response.data.plan)
        setShareUrl(response.data.share_url)
        if (response.data.plan.id) {
          setPlanId(response.data.plan.id)
        }
      })
      .catch(() => {
        if (active) {
          setError("Impossible de charger le plan demandé.")
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [planCode])

  useEffect(() => {
    let active = true
    if (!pera) return
    pera
      .reconnectSession()
      .then((accounts) => {
        if (!active || !accounts?.length) return
        setWalletAddress(accounts[0])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const fetchPrivatePlanId = useCallback(async () => {
    if (!planCode || planId || !apiClient.isAuthenticated()) {
      return planId
    }
    setResolvingPlanId(true)
    try {
      const response = await apiClient.findPlanByCode(planCode)
      const found = response.data?.[0]?.id ?? null
      if (found) {
        setPlanId(found)
      }
      return found
    } catch {
      return null
    } finally {
      setResolvingPlanId(false)
    }
  }, [planCode, planId])

  useEffect(() => {
    if (!planId && isAuthenticated) {
      fetchPrivatePlanId()
    }
  }, [planId, isAuthenticated, fetchPrivatePlanId])

  const handleWalletConnect = async () => {
    setConnectingWallet(true)
    try {
      if (pera?.session?.accounts?.length) {
        setWalletAddress(pera.session.accounts[0])
        return
      }
      const address = await connectWallet()
      setWalletAddress(address)
    } catch (err) {
      setSubscriptionStatus({
        success: false,
        message: err instanceof Error ? err.message : "Impossible de connecter le wallet.",
      })
    } finally {
      setConnectingWallet(false)
    }
  }

  const handleWalletDisconnect = async () => {
    setDisconnectingWallet(true)
    try {
      await disconnectWallet()
      setWalletAddress(null)
    } catch (err) {
      setSubscriptionStatus({
        success: false,
        message: err instanceof Error ? err.message : "Impossible de déconnecter le wallet.",
      })
    } finally {
      setDisconnectingWallet(false)
    }
  }

  const handleSubscribe = async () => {
    setSubscriptionStatus(null)

    if (!planCode) {
      setSubscriptionStatus({ success: false, message: "Lien de plan invalide." })
      return
    }

    if (!apiClient.isAuthenticated()) {
      setSubscriptionStatus({
        success: false,
        message: "Connectez-vous à votre compte SubChain avant de continuer.",
      })
      return
    }

    if (!walletAddress) {
      setSubscriptionStatus({
        success: false,
        message: "Connectez votre wallet Pera pour finaliser l'abonnement.",
      })
      return
    }

    const ensuredPlanId = planId || (await fetchPrivatePlanId())
    if (!ensuredPlanId) {
      setSubscriptionStatus({
        success: false,
        message: "Impossible de récupérer l'identifiant interne du plan.",
      })
      return
    }

    setSubscribing(true)
    try {
      const response = await apiClient.createSubscription({
        plan_id: ensuredPlanId,
        wallet_address: walletAddress,
      })
      if (response.error || !response.data?.subscription) {
        throw new Error(response.error || "La création de l'abonnement a échoué.")
      }
      setSubscriptionStatus({
        success: true,
        message: "Abonnement confirmé ! Vous allez être redirigé vers votre console.",
      })
      router.push("/dashboard")
    } catch (err) {
      setSubscriptionStatus({
        success: false,
        message: err instanceof Error ? err.message : "Impossible de créer l'abonnement.",
      })
    } finally {
      setSubscribing(false)
    }
  }

  const displayPrice = useMemo(() => {
    if (!plan) return null
    const sourceAmount = plan.amount ?? plan.price_tiers?.[0]?.unit_amount ?? null
    const currency = plan.currency ?? plan.price_tiers?.[0]?.currency ?? "ALGO"
    if (!sourceAmount) return null
    const value = Number(sourceAmount)
    if (Number.isNaN(value)) {
      return `${sourceAmount} ${currency}`
    }
    const formatter = new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
    return `${formatter.format(value)} ${currency}`
  }, [plan])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement du plan…
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Impossible de charger l'offre</CardTitle>
            <CardDescription>{error || "Plan introuvable."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description || "Accès immédiat via SubChain"}</CardDescription>
              </div>
              <Badge variant="outline">{plan.interval === "year" ? "Annuel" : "Mensuel"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayPrice && (
              <p className="text-3xl font-semibold">
                {displayPrice} <span className="text-base font-normal text-muted-foreground">par période</span>
              </p>
            )}
            {shareUrl && (
              <p className="text-sm text-muted-foreground">
                Lien partagé :{" "}
                <a href={shareUrl} className="text-blue-500 underline" target="_blank" rel="noreferrer">
                  {shareUrl}
                </a>
              </p>
            )}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>Code : {plan.code}</span>
              {plan.trial_days ? <span>Période d'essai : {plan.trial_days} jours</span> : null}
            </div>
          </CardContent>
        </Card>

        {!isAuthenticated && (
          <Alert>
            <AlertDescription>
              Vous devez être connecté pour finaliser l'abonnement.{" "}
              <Link href="/auth/signin" className="underline">
                Connectez-vous
              </Link>{" "}
              ou{" "}
              <Link href="/auth/signup" className="underline">
                créez un compte
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Abonnement</CardTitle>
            <CardDescription>Connectez votre wallet Pera puis validez l'abonnement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {walletAddress ? (
                <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
                  <p className="font-medium text-emerald-400 flex items-center gap-2">
                    <Check className="h-4 w-4" /> Wallet connecté
                  </p>
                  <p className="font-mono text-xs text-emerald-200 mt-1">{walletAddress}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun wallet connecté pour le moment.</p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleWalletConnect} disabled={connectingWallet} className="flex-1">
                  {connectingWallet ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion en cours…
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" /> Connecter Pera Wallet
                    </>
                  )}
                </Button>
                {walletAddress && (
                  <Button variant="ghost" onClick={handleWalletDisconnect} disabled={disconnectingWallet} className="flex-1">
                    {disconnectingWallet ? "Déconnexion…" : "Utiliser un autre wallet"}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleSubscribe}
                disabled={
                  subscribing ||
                  connectingWallet ||
                  disconnectingWallet ||
                  !walletAddress ||
                  !isAuthenticated ||
                  resolvingPlanId
                }
              >
                {subscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Abonnement en cours…
                  </>
                ) : (
                  <>
                    S’abonner <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              {resolvingPlanId && (
                <p className="text-xs text-muted-foreground">Recherche de l'identifiant du plan…</p>
              )}
            </div>

            {subscriptionStatus && (
              <Alert className={subscriptionStatus.success ? "border-emerald-500/40" : "border-destructive/50"}>
                <AlertDescription>{subscriptionStatus.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement de la page…
          </div>
        </div>
      }
    >
      <PayPageContent />
    </Suspense>
  )
}
