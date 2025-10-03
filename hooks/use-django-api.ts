"use client"

import { useState, useEffect, useCallback } from 'react'
import { apiClient, type DjangoModels, type APIResponse, type PaginatedResponse } from '@/lib/django-api-client'

// Hook pour l'authentification
export function useAuth() {
  const [user, setUser] = useState<DjangoModels['User'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.getProfile()
        if (response.data) {
          setUser(response.data)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
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
      const response = await apiClient.login({ email, password })
      if (response.data) {
        setUser(response.data.user)
        return { success: true, user: response.data.user }
      } else {
        setError(response.error || 'Login failed')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Login failed'
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    wallet_address?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.register(data)
      if (response.data) {
        setUser(response.data.user)
        return { success: true, user: response.data.user }
      } else {
        setError(response.error || 'Registration failed')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Registration failed'
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

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}

// Hook pour les plans
export function usePlans() {
  const [plans, setPlans] = useState<DjangoModels['SubscriptionPlan'][]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  })

  const fetchPlans = useCallback(async (params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getPlans(params)
      if (response.data) {
        setPlans(response.data.results)
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        })
      } else {
        setError(response.error || 'Failed to fetch plans')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plans')
    } finally {
      setLoading(false)
    }
  }, [])

  const createPlan = useCallback(async (data: {
    name: string
    description?: string
    amount: number
    currency: 'ALGO' | 'USDC'
    interval: 'monthly' | 'yearly'
    features?: string[]
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.createPlan(data)
      if (response.data) {
        setPlans(prev => [response.data!, ...prev])
        return { success: true, plan: response.data }
      } else {
        setError(response.error || 'Failed to create plan')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create plan'
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePlan = useCallback(async (id: string, data: Partial<DjangoModels['SubscriptionPlan']>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.updatePlan(id, data)
      if (response.data) {
        setPlans(prev => prev.map(plan => plan.id === id ? response.data! : plan))
        return { success: true, plan: response.data }
      } else {
        setError(response.error || 'Failed to update plan')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update plan'
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePlan = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.deletePlan(id)
      if (response.status === 204) {
        setPlans(prev => prev.filter(plan => plan.id !== id))
        return { success: true }
      } else {
        setError(response.error || 'Failed to delete plan')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete plan'
      setError(error)
      return { success: false, error }
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
    pagination,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
  }
}

// Hook pour les abonnés
export function useSubscribers() {
  const [subscribers, setSubscribers] = useState<DjangoModels['Subscriber'][]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  })

  const fetchSubscribers = useCallback(async (params?: {
    page?: number
    page_size?: number
    status?: string
    plan?: string
    search?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getSubscribers(params)
      if (response.data) {
        setSubscribers(response.data.results)
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        })
      } else {
        setError(response.error || 'Failed to fetch subscribers')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscribers')
    } finally {
      setLoading(false)
    }
  }, [])

  const createSubscriber = useCallback(async (data: {
    plan: string
    wallet_address: string
    email?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.createSubscriber(data)
      if (response.data) {
        setSubscribers(prev => [response.data!, ...prev])
        return { success: true, subscriber: response.data }
      } else {
        setError(response.error || 'Failed to create subscriber')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create subscriber'
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelSubscriber = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.cancelSubscriber(id)
      if (response.data) {
        setSubscribers(prev => prev.map(sub => sub.id === id ? response.data! : sub))
        return { success: true, subscriber: response.data }
      } else {
        setError(response.error || 'Failed to cancel subscriber')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to cancel subscriber'
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  return {
    subscribers,
    loading,
    error,
    pagination,
    fetchSubscribers,
    createSubscriber,
    cancelSubscriber,
  }
}

// Hook pour les analytics
export function useAnalytics() {
  const [overview, setOverview] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>(null)
  const [subscriberData, setSubscriberData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = useCallback(async (params?: {
    period?: '7d' | '30d' | '90d' | '1y'
    date_from?: string
    date_to?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getAnalyticsOverview(params)
      if (response.data) {
        setOverview(response.data)
      } else {
        setError(response.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRevenueAnalytics = useCallback(async (params?: {
    period?: '7d' | '30d' | '90d' | '1y'
    date_from?: string
    date_to?: string
    granularity?: 'day' | 'week' | 'month'
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getRevenueAnalytics(params)
      if (response.data) {
        setRevenueData(response.data)
      } else {
        setError(response.error || 'Failed to fetch revenue analytics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSubscriberAnalytics = useCallback(async (params?: {
    period?: '7d' | '30d' | '90d' | '1y'
    date_from?: string
    date_to?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getSubscriberAnalytics(params)
      if (response.data) {
        setSubscriberData(response.data)
      } else {
        setError(response.error || 'Failed to fetch subscriber analytics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriber analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    overview,
    revenueData,
    subscriberData,
    loading,
    error,
    fetchOverview,
    fetchRevenueAnalytics,
    fetchSubscriberAnalytics,
  }
}

// Hook pour les webhooks
export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<DjangoModels['Webhook'][]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWebhooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getWebhooks()
      if (response.data) {
        setWebhooks(response.data.results)
      } else {
        setError(response.error || 'Failed to fetch webhooks')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch webhooks')
    } finally {
      setLoading(false)
    }
  }, [])

  const createWebhook = useCallback(async (data: {
    url: string
    events: string[]
    secret?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.createWebhook(data)
      if (response.data) {
        setWebhooks(prev => [response.data!, ...prev])
        return { success: true, webhook: response.data }
      } else {
        setError(response.error || 'Failed to create webhook')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create webhook'
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteWebhook = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.deleteWebhook(id)
      if (response.status === 204) {
        setWebhooks(prev => prev.filter(webhook => webhook.id !== id))
        return { success: true }
      } else {
        setError(response.error || 'Failed to delete webhook')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete webhook'
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebhooks()
  }, [fetchWebhooks])

  return {
    webhooks,
    loading,
    error,
    fetchWebhooks,
    createWebhook,
    deleteWebhook,
  }
}
