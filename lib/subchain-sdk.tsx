"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { apiClient, type Subscription as DjangoSubscription, type SubscriptionPlan } from "@/lib/django-api-client"
import { connectWallet } from "@/lib/pera"

// Types
export interface SubChainConfig {
  apiKey: string
  baseUrl?: string
  testMode?: boolean
}

export interface Plan {
  id: string
  name: string
  amount: number
  currency: "ALGO" | "USDC"
  interval: "monthly" | "yearly"
  description?: string
  features?: string[]
}

export interface Subscription {
  id: string
  planId: string
  status: "active" | "cancelled" | "paused" | "past_due" | "pending"
  walletAddress: string
  startDate: string
  nextPaymentDate?: string
  totalPaid: number
}

// Context
interface SubChainContextType {
  config: SubChainConfig | null
  isInitialized: boolean
  subscribe: (planId: string, walletAddress: string) => Promise<Subscription>
  getPlans: () => Promise<Plan[]>
  getSubscriptions: (walletAddress: string) => Promise<Subscription[]>
  cancelSubscription: (subscriptionId: string) => Promise<void>
}

const SubChainContext = createContext<SubChainContextType | null>(null)

// Provider Component
interface SubChainProviderProps {
  config: SubChainConfig
  children: ReactNode
}

export function SubChainProvider({ config, children }: SubChainProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize SDK
    setIsInitialized(true)
  }, [config])

  const mapPlan = (plan: SubscriptionPlan): Plan => {
    const primaryTier = plan.price_tiers?.[0]
    return {
      id: plan.id,
      name: plan.name,
      amount: primaryTier ? Number(primaryTier.unit_amount) : 0,
      currency: (primaryTier?.currency ?? plan.metadata?.currency ?? "ALGO") as Plan["currency"],
      interval: (plan.metadata?.interval as Plan["interval"]) || "monthly",
      description: plan.description ?? undefined,
      features: plan.features?.map((feature) => feature.name),
    }
  }

  const mapSubscription = (subscription: DjangoSubscription): Subscription => {
    const planId = typeof subscription.plan === "object" ? subscription.plan.id : subscription.plan
    return {
      id: subscription.id,
      planId,
      status: (subscription.status as Subscription["status"]) ?? "active",
      walletAddress: subscription.wallet_address,
      startDate: subscription.created_at ?? new Date().toISOString(),
      nextPaymentDate: subscription.next_billing_date ?? undefined,
      totalPaid: Number(subscription.metadata?.total_paid ?? 0),
    }
  }

  const subscribe = async (planId: string, walletAddress: string): Promise<Subscription> => {
    const response = await apiClient.subscribe(planId, { walletAddress })
    if (response.error || !response.data?.subscription) {
      throw new Error(response.error ?? "Unable to create subscription")
    }
    return mapSubscription(response.data.subscription)
  }

  const getPlans = async (): Promise<Plan[]> => {
    const response = await apiClient.getPlans()
    if (response.error || !response.data) {
      throw new Error(response.error ?? "Unable to load plans")
    }
    return response.data.map(mapPlan)
  }

  const getSubscriptions = async (walletAddress: string): Promise<Subscription[]> => {
    const response = await apiClient.listSubscriptions({ wallet_address: walletAddress })
    if (response.error || !response.data) {
      throw new Error(response.error ?? "Unable to load subscriptions")
    }
    return response.data.results.map(mapSubscription)
  }

  const cancelSubscription = async (subscriptionId: string): Promise<void> => {
    const response = await apiClient.cancelSubscription(subscriptionId, { atPeriodEnd: true })
    if (response.error) {
      throw new Error(response.error)
    }
  }

  const value: SubChainContextType = {
    config,
    isInitialized,
    subscribe,
    getPlans,
    getSubscriptions,
    cancelSubscription,
  }

  return (
    <SubChainContext.Provider value={value}>
      {children}
    </SubChainContext.Provider>
  )
}

// Hook
export function useSubChain() {
  const context = useContext(SubChainContext)
  if (!context) {
    throw new Error('useSubChain must be used within a SubChainProvider')
  }
  return context
}

// Components
interface SubscribeButtonProps {
  planId: string
  children?: ReactNode
  className?: string
  onSuccess?: (subscription: Subscription) => void
  onError?: (error: Error) => void
}

export function SubscribeButton({
  planId,
  children = "Subscribe",
  className = "",
  onSuccess,
  onError,
}: SubscribeButtonProps) {
  const { subscribe } = useSubChain()
  const [loading, setLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      let address = walletAddress
      if (!address) {
        address = await connectWallet()
        setWalletAddress(address)
      }

      const subscription = await subscribe(planId, address)
      onSuccess?.(subscription)
    } catch (error) {
      onError?.(error as Error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 ${className}`}
    >
      {loading ? "Processing…" : walletAddress ? children : "Connect Wallet"}
    </button>
  )
}

interface PlanCardProps {
  plan: Plan
  onSubscribe?: (planId: string) => void
  className?: string
}

export function PlanCard({ plan, onSubscribe, className = '' }: PlanCardProps) {
  return (
    <div className={`border rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
      {plan.description && (
        <p className="text-gray-600 mb-4">{plan.description}</p>
      )}
      <div className="text-3xl font-bold mb-4">
        {plan.amount} {plan.currency}
        <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
      </div>
      {plan.features && (
        <ul className="mb-6 space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      )}
      <SubscribeButton
        planId={plan.id}
        className="w-full"
        onSuccess={() => onSubscribe?.(plan.id)}
      >
        Subscribe to {plan.name}
      </SubscribeButton>
    </div>
  )
}

interface PlansGridProps {
  className?: string
  onSubscribe?: (planId: string) => void
}

export function PlansGrid({ className = '', onSubscribe }: PlansGridProps) {
  const { getPlans } = useSubChain()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await getPlans()
        setPlans(fetchedPlans)
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [getPlans])

  if (loading) {
    return <div className="text-center py-8">Loading plans...</div>
  }

  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onSubscribe={onSubscribe}
        />
      ))}
    </div>
  )
}

// Utility functions
export const SubChain = {
  init: (config: SubChainConfig) => config,
  
  // Static methods for direct API calls without React context
  createPlan: async (config: SubChainConfig, plan: Omit<Plan, 'id'>) => {
    const response = await fetch(`${config.baseUrl || 'https://api.subchain.dev'}/api/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plan),
    })
    return response.json()
  },

  getAnalytics: async (config: SubChainConfig, period = '30d') => {
    const response = await fetch(`${config.baseUrl || 'https://api.subchain.dev'}/api/analytics?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
    })
    return response.json()
  },
}
