"use client"

import { useState, useEffect, useCallback } from "react"
import {
  apiClient,
  type AuthUser,
  type SubscriptionPlan,
  type SubscriptionStatus,
  type Notification,
  type Transaction,
  type Invoice,
} from "@/lib/django-api-client"

// Hook pour l'authentification
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      if (!apiClient.isAuthenticated()) {
        setLoading(false)
        return
      }

      try {
        const response = await apiClient.getProfile()
        if (response.data) {
          setUser(response.data)
        } else {
          apiClient.clearTokens()
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        apiClient.clearTokens()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.login(email, password)
      if (response.data) {
        setUser(response.data.user)
        return { success: true, user: response.data.user }
      } else {
        setError(response.error || "Login failed")
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Login failed"
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await apiClient.logout()
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiClient.getProfile()
      if (response.data) {
        setUser(response.data)
      }
    } catch (err) {
      console.error("Profile refresh failed:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    login,
    logout,
    refreshProfile,
    isAuthenticated: !!user,
  }
}

// Hook pour les plans d'abonnement
export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.getPlans()
      if (response.data) {
        setPlans(response.data)
      } else {
        setError(response.error || "Failed to fetch plans")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch plans")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  }
}

// Hook pour l'abonnement utilisateur
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.getSubscriptionStatus()
      if (response.data) {
        setSubscription(response.data)
      } else if (!response.error && (response.status === 200 || response.status === 204)) {
        setSubscription(null)
      } else if (response.status === 404) {
        setSubscription(null)
      } else {
        setError(response.error || "Failed to fetch subscription")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subscription")
    } finally {
      setLoading(false)
    }
  }, [])

  const subscribe = useCallback(
    async (
      planId: string | number,
      options: {
        walletAddress: string
        couponId?: string
        quantity?: number
        metadata?: Record<string, unknown>
      },
    ) => {
    setLoading(true)
    setError(null)

    try {
        if (!options?.walletAddress) {
          const message = "Wallet address required to create subscription"
          setError(message)
          return { success: false, error: message }
        }

        const response = await apiClient.subscribe(String(planId), {
          walletAddress: options.walletAddress,
          couponId: options.couponId,
          quantity: options.quantity,
          metadata: options.metadata,
        })
        if (response.data) {
          const subscriptionData = response.data.subscription
          setSubscription(subscriptionData)
        return {
          success: true,
            subscription: subscriptionData,
            invoice: response.data.invoice,
            paymentIntent: response.data.payment_intent,
            paymentError: response.data.payment_error,
        }
      } else {
        setError(response.error || "Failed to subscribe")
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to subscribe"
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
    },
    [],
  )

  const cancel = useCallback(async (options: { atPeriodEnd?: boolean } = {}) => {
    setLoading(true)
    setError(null)

    try {
      if (!subscription) {
        setError("No subscription to cancel")
        return { success: false, error: "No subscription to cancel" }
      }

      const response = await apiClient.cancelSubscription(subscription.id, { atPeriodEnd: options.atPeriodEnd })
      if (response.data || response.status === 204) {
        await fetchSubscription()
        return { success: true, message: "Subscription cancelled" }
      } else {
        setError(response.error || "Failed to cancel subscription")
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to cancel subscription"
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [fetchSubscription, subscription])

  const reactivate = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!subscription) {
        setError("No subscription to resume")
        return { success: false, error: "No subscription to resume" }
      }

      const response = await apiClient.resumeSubscription(subscription.id)
      if (response.data || response.status === 204) {
        await fetchSubscription()
        return { success: true, message: "Subscription reactivated" }
      } else {
        setError(response.error || "Failed to reactivate subscription")
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to reactivate subscription"
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [fetchSubscription, subscription])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchSubscription()
    }
  }, [fetchSubscription])

  return {
    subscription,
    loading,
    error,
    subscribe,
    cancel,
    reactivate,
    refetch: fetchSubscription,
  }
}

// Hook pour les transactions
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  })

  const fetchPayments = useCallback(
    async (params?: {
      page?: number
      page_size?: number
      status?: string
      currency?: string
    }) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.listTransactions(params)
        if (response.data) {
          setTransactions(response.data.results)
          setPagination({
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous,
          })
        } else {
          setError(response.error || "Failed to fetch payments")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch payments")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const payInvoice = useCallback(
    async (invoiceId: string | number) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.payInvoice(String(invoiceId))
        if (response.data) {
          const payload = response.data as Invoice | { invoice: Invoice; payment_intent?: unknown; detail?: string }
          await fetchPayments()
          return {
            success: true,
            invoice: "invoice" in payload ? payload.invoice : payload,
            paymentIntent: "payment_intent" in payload ? payload.payment_intent : undefined,
            message: "detail" in payload ? payload.detail : undefined,
          }
        } else {
          setError(response.error || "Failed to pay invoice")
          return { success: false, error: response.error }
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : "Failed to pay invoice"
        setError(error)
        return { success: false, error }
      } finally {
        setLoading(false)
      }
    },
    [fetchPayments],
  )

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchPayments()
    }
  }, [fetchPayments])

  return {
    transactions,
    loading,
    error,
    pagination,
    fetchPayments,
    payInvoice,
    triggerSwap: payInvoice,
  }
}

export const usePaymentHistory = useTransactions

// Hook pour la liste des abonnements (admin)
export function useSubscriptionsList(initialParams?: Record<string, unknown>) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  })

  const fetchSubscriptions = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.listSubscriptions(params ?? initialParams)
        if (response.data) {
          setSubscriptions(response.data.results)
          setPagination({
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous,
          })
        } else {
          setError(response.error || "Failed to fetch subscriptions")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch subscriptions")
      } finally {
        setLoading(false)
      }
    },
    [initialParams],
  )

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchSubscriptions(initialParams)
    }
  }, [fetchSubscriptions, initialParams])

  return {
    subscriptions,
    loading,
    error,
    pagination,
    refetch: fetchSubscriptions,
  }
}

// Hook pour les factures
export function useInvoices(initialParams?: Record<string, unknown>) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  })

  const fetchInvoices = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.listInvoices(params ?? initialParams)
        if (response.data) {
          setInvoices(response.data.results)
          setPagination({
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous,
          })
        } else {
          setError(response.error || "Failed to fetch invoices")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch invoices")
      } finally {
        setLoading(false)
      }
    },
    [initialParams],
  )

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchInvoices(initialParams)
    }
  }, [fetchInvoices, initialParams])

  return {
    invoices,
    loading,
    error,
    pagination,
    refetch: fetchInvoices,
  }
}

// Hook pour les coupons
export function useCoupons(initialParams?: Record<string, unknown>) {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCoupons = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.listCoupons(params ?? initialParams)
        if (response.data) {
          setCoupons(response.data.results)
        } else {
          setError(response.error || "Failed to fetch coupons")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch coupons")
      } finally {
        setLoading(false)
      }
    },
    [initialParams],
  )

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchCoupons(initialParams)
    }
  }, [fetchCoupons, initialParams])

  return {
    coupons,
    loading,
    error,
    refetch: fetchCoupons,
  }
}

// Hook pour les notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(
    async (params?: {
      page?: number
      page_size?: number
      is_read?: boolean
    }) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.getNotifications(params)
        if (response.data) {
          setNotifications(response.data.results)
          setUnreadCount(response.data.results.filter((n) => !n.is_read).length)
        } else {
          setError(response.error || "Failed to fetch notifications")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch notifications")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await apiClient.markNotificationAsRead(notificationId)
      if (response.data) {
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to mark as read" }
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiClient.markAllNotificationsAsRead()
      if (response.data && !response.error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
        return { success: true }
      }
      if (response.status === 404) {
        const ids = notifications.filter((n) => !n.is_read).map((n) => n.id)
        await Promise.all(ids.map((id) => apiClient.markNotificationAsRead(id)))
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to mark all as read" }
    }
  }, [notifications])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await apiClient.deleteNotification(notificationId)
      if (response.status === 204) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete notification" }
    }
  }, [])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchNotifications()
    }
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}

// Hook pour l'analytics
export function useAnalytics() {
  const trackEvent = useCallback(async (eventType: string, payload: Record<string, any> = {}) => {
    try {
      const response = await apiClient.trackEvent(eventType, payload)
      return Boolean(response.data)
    } catch {
      return false
    }
  }, [])

  return { trackEvent }
}
