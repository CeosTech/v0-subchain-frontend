"use client"

import { useState, useEffect, useCallback } from "react"
import {
  apiClient,
  type User,
  type SubscriptionPlan,
  type SubscriptionStatus,
  type PaymentHistory,
  type Notification,
} from "@/lib/django-api-client"

// Hook pour l'authentification
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
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

  const logout = useCallback(() => {
    apiClient.logout()
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

  const subscribe = useCallback(async (planId: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.subscribe(planId)
      if (response.data) {
        setSubscription(response.data.subscription)
        return {
          success: true,
          subscription: response.data.subscription,
          paymentRequired: response.data.payment_required,
          paymentAmount: response.data.payment_amount,
          paymentCurrency: response.data.payment_currency,
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
  }, [])

  const cancel = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.cancelSubscription()
      if (response.data) {
        await fetchSubscription()
        return { success: true, message: response.data.message }
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
  }, [fetchSubscription])

  const reactivate = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.reactivateSubscription()
      if (response.data) {
        await fetchSubscription()
        return { success: true, message: response.data.message }
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
  }, [fetchSubscription])

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

// Hook pour l'historique des paiements
export function usePaymentHistory() {
  const [payments, setPayments] = useState<PaymentHistory[]>([])
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
        const response = await apiClient.getPaymentHistory(params)
        if (response.data) {
          setPayments(response.data.results)
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

  const triggerSwap = useCallback(
    async (paymentId: number) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.triggerSwap(paymentId)
        if (response.data) {
          await fetchPayments()
          return {
            success: true,
            swapInitiated: response.data.swap_initiated,
            transactionId: response.data.swap_transaction_id,
            message: response.data.message,
          }
        } else {
          setError(response.error || "Failed to trigger swap")
          return { success: false, error: response.error }
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : "Failed to trigger swap"
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
    payments,
    loading,
    error,
    pagination,
    fetchPayments,
    triggerSwap,
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

  const markAsRead = useCallback(async (notificationId: number) => {
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
      if (response.data) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to mark all as read" }
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: number) => {
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
      return response.data?.tracked || false
    } catch {
      return false
    }
  }, [])

  return { trackEvent }
}
