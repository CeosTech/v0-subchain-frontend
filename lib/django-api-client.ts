// Client API Django avec système de conversion de devises intégré

import { CurrencyService, type PriceCalculation } from './currency-conversion-system'

interface APIResponse<T> {
  data?: T
  error?: string
  status: number
}

interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

interface PlanWithPricing extends DjangoModels['SubscriptionPlan'] {
  pricing_calculation?: PriceCalculation
  should_update_pricing?: boolean
}

class DjangoAPIClient {
  private baseURL: string
  private token: string | null = null
  private currencyService: CurrencyService

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.baseURL = baseURL
    this.token = typeof window !== 'undefined' ? localStorage.getItem('subchain_token') : null
    this.currencyService = CurrencyService.getInstance()
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.detail || data.message || 'An error occurred',
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  // Currency & Pricing Methods
  async getCurrencyRates() {
    return this.request<{
      rates: Array<{
        from_currency: string
        to_currency: string
        rate: number
        last_updated: string
        source: string
      }>
    }>('/api/currency/rates/')
  }

  async calculatePlanPricing(data: {
    base_price_eur: number
    base_price_usd: number
    preferred_currency: 'EUR' | 'USD'
  }) {
    return this.request<PriceCalculation>('/api/currency/calculate-price/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePlanPricing(planId: string, data: {
    auto_update_pricing?: boolean
    price_update_threshold?: number
    preferred_currency?: 'EUR' | 'USD'
  }) {
    return this.request<PlanWithPricing>(`/api/plans/${planId}/update-pricing/`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPricingPreview(data: {
    base_price_eur: number
    base_price_usd: number
    preferred_currency: 'EUR' | 'USD'
    interval: 'monthly' | 'yearly'
  }) {
    return this.request<{
      current_algo_price: number
      pricing_calculation: PriceCalculation
      estimated_monthly_revenue: number
      estimated_yearly_revenue: number
    }>('/api/plans/pricing-preview/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getRateHistory(params: {
    from_currency: string
    to_currency: string
    days?: number
  }) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    
    return this.request<{
      history: Array<{
        date: string
        rate: number
      }>
    }>(`/api/currency/history/?${searchParams.toString()}`)
  }

  async createRateAlert(data: {
    from_currency: string
    to_currency: string
    target_rate: number
    condition: 'above' | 'below'
    notification_method: 'email' | 'webhook'
  }) {
    return this.request<{
      id: string
      alert_id: string
      is_active: boolean
    }>('/api/currency/rate-alerts/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Enhanced Plans Methods with Currency Integration
  async createPlanWithPricing(data: {
    name: string
    description?: string
    base_price_eur: number
    base_price_usd: number
    preferred_currency: 'EUR' | 'USD'
    interval: 'monthly' | 'yearly'
    features?: string[]
    trial_days?: number
    auto_update_pricing?: boolean
    price_update_threshold?: number
  }) {
    // Calculer le prix ALGO avant de créer le plan
    const pricingResponse = await this.calculatePlanPricing({
      base_price_eur: data.base_price_eur,
      base_price_usd: data.base_price_usd,
      preferred_currency: data.preferred_currency,
    })

    if (!pricingResponse.data) {
      return {
        error: 'Failed to calculate pricing',
        status: 400,
      }
    }

    const planData = {
      ...data,
      current_price_algo: pricingResponse.data.finalAlgoPrice,
      last_price_update: new Date().toISOString(),
    }

    return this.request<PlanWithPricing>('/api/plans/', {
      method: 'POST',
      body: JSON.stringify(planData),
    })
  }

  async getPlansWithPricing(params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
    include_pricing?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    const response = await this.request<PaginatedResponse<PlanWithPricing>>(
      `/api/plans/${query ? `?${query}` : ''}`
    )

    // Si include_pricing est true, calculer les prix actuels
    if (params?.include_pricing && response.data) {
      const plansWithPricing = await Promise.all(
        response.data.results.map(async (plan) => {
          try {
            const pricingCalc = this.currencyService.calculateAlgoPrice(
              plan.base_price_eur,
              plan.base_price_usd,
              plan.preferred_currency
            )
            
            const shouldUpdate = this.currencyService.shouldUpdatePricing(
              new Date(plan.last_price_update),
              plan.current_price_algo,
              pricingCalc.finalAlgoPrice,
              plan.price_update_threshold
            )

            return {
              ...plan,
              pricing_calculation: pricingCalc,
              should_update_pricing: shouldUpdate,
            }
          } catch (error) {
            return plan
          }
        })
      )

      response.data.results = plansWithPricing
    }

    return response
  }

  // Subscriber Methods with Currency Support
  async createSubscriberWithPricing(data: {
    plan: string
    wallet_address: string
    email?: string
    preferred_payment_currency?: 'EUR' | 'USD'
  }) {
    // Récupérer les détails du plan pour calculer le prix
    const planResponse = await this.getPlan(data.plan)
    if (!planResponse.data) {
      return {
        error: 'Plan not found',
        status: 404,
      }
    }

    const plan = planResponse.data
    const paymentCurrency = data.preferred_payment_currency || plan.preferred_currency

    // Calculer le prix actuel
    const pricingCalc = this.currencyService.calculateAlgoPrice(
      plan.base_price_eur,
      plan.base_price_usd,
      paymentCurrency
    )

    const subscriberData = {
      ...data,
      subscription_price_algo: pricingCalc.finalAlgoPrice,
      subscription_price_fiat: paymentCurrency === 'EUR' ? plan.base_price_eur : plan.base_price_usd,
      subscription_currency: paymentCurrency,
    }

    return this.request<DjangoModels['Subscriber']>('/api/subscribers/', {
      method: 'POST',
      body: JSON.stringify(subscriberData),
    })
  }

  // Payment Methods with Multi-Currency Support
  async createPaymentWithConversion(data: {
    subscriber: string
    payment_type?: 'subscription' | 'setup_fee' | 'upgrade'
    preferred_currency?: 'EUR' | 'USD'
  }) {
    // Récupérer les détails de l'abonné et du plan
    const subscriberResponse = await this.getSubscriber(data.subscriber)
    if (!subscriberResponse.data) {
      return {
        error: 'Subscriber not found',
        status: 404,
      }
    }

    const subscriber = subscriberResponse.data
    const planResponse = await this.getPlan(subscriber.plan)
    if (!planResponse.data) {
      return {
        error: 'Plan not found',
        status: 404,
      }
    }

    const plan = planResponse.data
    const paymentCurrency = data.preferred_currency || subscriber.subscription_currency

    // Calculer le prix actuel avec les taux de change
    const pricingCalc = this.currencyService.calculateAlgoPrice(
      plan.base_price_eur,
      plan.base_price_usd,
      paymentCurrency
    )

    const paymentData = {
      subscriber: data.subscriber,
      plan: subscriber.plan,
      amount_algo: pricingCalc.finalAlgoPrice,
      amount_fiat: paymentCurrency === 'EUR' ? plan.base_price_eur : plan.base_price_usd,
      currency_fiat: paymentCurrency,
      exchange_rate: paymentCurrency === 'EUR' 
        ? pricingCalc.exchangeRates.ALGO_EUR 
        : pricingCalc.exchangeRates.ALGO_USD,
      payment_type: data.payment_type || 'subscription',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
    }

    return this.request<DjangoModels['Payment']>('/api/payments/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  // Real-time Currency Updates
  async startCurrencyUpdates() {
    // Démarrer les mises à jour automatiques des taux
    this.currencyService.startRealTimeUpdates(5) // Toutes les 5 minutes
    
    // Synchroniser avec le backend
    return this.request('/api/currency/update-rates/', {
      method: 'POST',
    })
  }

  async stopCurrencyUpdates() {
    this.currencyService.stopRealTimeUpdates()
  }

  // Bulk Operations with Currency Conversion
  async bulkUpdatePlanPricing(planIds: string[]) {
    return this.request<{
      updated_plans: PlanWithPricing[]
      failed_updates: Array<{
        plan_id: string
        error: string
      }>
    }>('/api/plans/bulk-update/', {
      method: 'POST',
      body: JSON.stringify({
        plan_ids: planIds,
        action: 'update_pricing',
      }),
    })
  }

  // Analytics with Currency Breakdown
  async getRevenueAnalyticsWithCurrency(params?: {
    period?: '7d' | '30d' | '90d' | '1y'
    date_from?: string
    date_to?: string
    currency?: 'ALGO' | 'EUR' | 'USD' | 'all'
    granularity?: 'day' | 'week' | 'month'
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request<{
      chart_data: Array<{
        date: string
        revenue_algo: number
        revenue_eur: number
        revenue_usd: number
        subscribers: number
        new_subscribers: number
        churned_subscribers: number
        exchange_rates: {
          algo_eur: number
          algo_usd: number
          eur_usd: number
        }
      }>
      total_revenue: {
        algo: number
        eur: number
        usd: number
      }
      revenue_growth: {
        algo: number
        eur: number
        usd: number
      }
      currency_breakdown: {
        eur_subscribers: number
        usd_subscribers: number
        eur_percentage: number
        usd_percentage: number
      }
    }>(`/api/analytics/revenue/${query ? `?${query}` : ''}`)
  }

  // Existing methods (unchanged)
  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('subchain_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('subchain_token')
    }
  }

  // Authentication endpoints (unchanged from previous implementation)
  async register(data: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    wallet_address?: string
  }) {
    return this.request<{
      user: DjangoModels['User']
      access: string
      refresh: string
    }>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request<{
      user: DjangoModels['User']
      access: string
      refresh: string
    }>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (response.data) {
      this.setToken(response.data.access)
    }

    return response
  }

  async logout() {
    const response = await this.request('/api/auth/logout/', {
      method: 'POST',
    })
    this.clearToken()
    return response
  }

  async getProfile() {
    return this.request<DjangoModels['User']>('/api/auth/profile/')
  }

  // Standard CRUD methods (updated to use new types)
  async getPlans(params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
  }) {
    return this.getPlansWithPricing({ ...params, include_pricing: true })
  }

  async createPlan(data: {
    name: string
    description?: string
    base_price_eur: number
    base_price_usd: number
    preferred_currency: 'EUR' | 'USD'
    interval: 'monthly' | 'yearly'
    features?: string[]
  }) {
    return this.createPlanWithPricing(data)
  }

  async getPlan(id: string) {
    return this.request<PlanWithPricing>(`/api/plans/${id}/`)
  }

  async updatePlan(id: string, data: Partial<PlanWithPricing>) {
    return this.request<PlanWithPricing>(`/api/plans/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePlan(id: string) {
    return this.request(`/api/plans/${id}/`, {
      method: 'DELETE',
    })
  }

  // Subscriber methods
  async getSubscribers(params?: {
    page?: number
    page_size?: number
    status?: string
    plan?: string
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request<PaginatedResponse<DjangoModels['Subscriber']>>(
      `/api/subscribers/${query ? `?${query}` : ''}`
    )
  }

  async createSubscriber(data: {
    plan: string
    wallet_address: string
    email?: string
  }) {
    return this.createSubscriberWithPricing(data)
  }

  async getSubscriber(id: string) {
    return this.request<DjangoModels['Subscriber']>(`/api/subscribers/${id}/`)
  }

  async updateSubscriber(id: string, data: Partial<DjangoModels['Subscriber']>) {
    return this.request<DjangoModels['Subscriber']>(`/api/subscribers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async cancelSubscriber(id: string) {
    return this.request<DjangoModels['Subscriber']>(`/api/subscribers/${id}/cancel/`, {
      method: 'POST',
    })
  }

  // Payment methods
  async getPayments(params?: {
    page?: number
    page_size?: number
    status?: string
    subscriber?: string
    plan?: string
    date_from?: string
    date_to?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request<PaginatedResponse<DjangoModels['Payment']>>(
      `/api/payments/${query ? `?${query}` : ''}`
    )
  }

  async createPayment(data: {
    subscriber: string
    preferred_currency?: 'EUR' | 'USD'
  }) {
    return this.createPaymentWithConversion(data)
  }

  async verifyPayment(id: string, data: {
    transaction_hash: string
    algorand_txn_id?: string
  }) {
    return this.request<DjangoModels['Payment']>(`/api/payments/${id}/verify/`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Analytics methods
  async getAnalyticsOverview(params?: {
    period?: '7d' | '30d' | '90d' | '1y'
    date_from?: string
    date_to?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request<{
      total_subscribers: number
      active_subscribers: number
      cancelled_subscribers: number
      paused_subscribers: number
      mrr: { algo: number; eur: number; usd: number }
      arr: { algo: number; eur: number; usd: number }
      churn_rate: number
      total_revenue: { algo: number; eur: number; usd: number }
      average_revenue_per_user: { algo: number; eur: number; usd: number }
      growth_rate: number
      currency_distribution: {
        eur_percentage: number
        usd_percentage: number
      }
    }>(`/api/analytics/overview/${query ? `?${query}` : ''}`)
  }

  async getRevenueAnalytics(params?: {
    period?: '7d' | '30d' | '90d' | '1y'
    date_from?: string
    date_to?: string
    granularity?: 'day' | 'week' | 'month'
  }) {
    return this.getRevenueAnalyticsWithCurrency(params)
  }

  // Webhook methods (unchanged)
  async getWebhooks() {
    return this.request<PaginatedResponse<DjangoModels['Webhook']>>('/api/webhooks/')
  }

  async createWebhook(data: {
    url: string
    events: string[]
    secret?: string
  }) {
    return this.request<DjangoModels['Webhook']>('/api/webhooks/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateWebhook(id: string, data: Partial<DjangoModels['Webhook']>) {
    return this.request<DjangoModels['Webhook']>(`/api/webhooks/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteWebhook(id: string) {
    return this.request(`/api/webhooks/${id}/`, {
      method: 'DELETE',
    })
  }

  // API Key methods (unchanged)
  async getAPIKeys() {
    return this.request<PaginatedResponse<DjangoModels['APIKey']>>('/api/api-keys/')
  }

  async createAPIKey(data: {
    name: string
    expires_at?: string
  }) {
    return this.request<DjangoModels['APIKey']>('/api/api-keys/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteAPIKey(id: string) {
    return this.request(`/api/api-keys/${id}/`, {
      method: 'DELETE',
    })
  }
}

// Singleton instance
export const apiClient = new DjangoAPIClient()

// Types export
export type { DjangoModels, APIResponse, PaginatedResponse, PriceCalculation, PlanWithPricing }
