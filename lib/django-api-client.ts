export interface APIResponse<T> {
  data?: T
  error?: string
  status: number
}

export interface PaginatedResponse<T> {
  count: number
  next?: string | null
  previous?: string | null
  results: T[]
}

export interface AuthUser {
  id: string
  email: string
  username: string
  wallet_address: string
  is_verified: boolean
}

export interface UserProfile extends AuthUser {
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  is_individual?: boolean
  phone_number?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface UserSettings {
  language: string | null
  timezone: string | null
  receive_emails: boolean
}

export interface UserActivity {
  id: string
  action: string
  ip_address?: string | null
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface PlanFeature {
  id: string
  name: string
  description?: string | null
  sort_order: number
}

export interface PriceTier {
  id: string
  up_to: number | null
  unit_amount: string
  currency: string
}

export interface Coupon {
  id: string
  code: string
  duration: string
  percent_off?: string | null
  amount_off?: string | null
  currency?: string | null
  duration_in_months?: number | null
  max_redemptions?: number | null
  redeem_by?: string | null
  metadata?: Record<string, unknown>
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string | null
  metadata?: Record<string, unknown>
  features: PlanFeature[]
  price_tiers: PriceTier[]
  is_active?: boolean
  status?: string
  created_at: string
  updated_at: string
}

export interface PaymentIntent {
  id: string
  status: string
  client_secret?: string | null
  amount?: string | null
  currency?: string | null
  metadata?: Record<string, unknown>
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unit_amount: string
  total_amount: string
  plan?: SubscriptionPlan | null
  metadata?: Record<string, unknown>
}

export interface Invoice {
  id: string
  subscription: string | Subscription
  status: string
  currency: string
  subtotal_amount?: string | null
  total_amount: string
  due_date?: string | null
  paid_at?: string | null
  metadata?: Record<string, unknown>
  payment_intent?: PaymentIntent | null
  line_items: InvoiceLineItem[]
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  user: string
  wallet_address: string
  status: string
  quantity: number
  cancel_at_period_end: boolean
  current_period_start?: string | null
  current_period_end?: string | null
  trial_end?: string | null
  metadata?: Record<string, unknown>
  coupon?: Coupon | null
  created_at: string
  updated_at: string
}

export type SubscriptionStatus = Subscription

export interface SubscriptionCreateResponse {
  subscription: Subscription
  invoice: Invoice
  payment_intent?: PaymentIntent | null
  payment_error?: string | null
}

export interface Transaction {
  id: string
  user: string
  amount: string
  currency: "ALGO" | "USDC" | string
  type: string
  status: string
  platform_fee: string
  net_amount: string
  algo_tx_id?: string | null
  usdc_received?: string | null
  notes?: string | null
  swap_completed?: boolean
  created_at: string
  confirmed_at?: string | null
  metadata?: Record<string, unknown>
}

export interface PaymentQRCode {
  qr_code_base64: string
}

export interface Currency {
  code: string
  name: string
  symbol: string
  decimals?: number
  is_active?: boolean
  metadata?: Record<string, unknown>
}

export interface ExchangeRate {
  id: string
  base_currency: Currency
  target_currency: Currency
  rate: string
  created_at: string
  updated_at: string
}

export interface CurrencyConversion {
  from: string
  to: string
  rate: string
  amount: string
  converted_amount: string
}

export interface Notification {
  id: string
  title: string
  message: string
  channel: "email" | "webhook" | "sms" | "in_app" | string
  is_read: boolean
  created_at: string
  sent_at?: string | null
  metadata?: Record<string, unknown>
}

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  message: string
  notification_type: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsLog {
  id: string
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}

export interface Integration {
  id: string
  name: string
  type: string
  endpoint_url: string
  auth_token?: string | null
  config: Record<string, unknown>
  status: string
  last_success_at?: string | null
  failure_count?: number
  last_error_message?: string | null
  created_at: string
  updated_at: string
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean
}

class DjangoAPIClient {
  private baseURL: string
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000") {
    this.baseURL = baseURL

    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("subchain_access_token")
      this.refreshToken = localStorage.getItem("subchain_refresh_token")
    }
  }

  private buildURL(endpoint: string, params?: URLSearchParams | Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return `${this.baseURL}${endpoint}`
    }

    const searchParams =
      params instanceof URLSearchParams
        ? params
        : Object.entries(params).reduce((acc, [key, value]) => {
            if (value === undefined || value === null || value === "") {
              return acc
            }
            if (Array.isArray(value)) {
              value.forEach((item) => acc.append(key, String(item)))
            } else {
              acc.append(key, String(value))
            }
            return acc
          }, new URLSearchParams())

    return `${this.baseURL}${endpoint}${endpoint.includes("?") ? "&" : "?"}${searchParams.toString()}`
  }

  private buildQuery(params?: Record<string, unknown>): string {
    if (!params) {
      return ""
    }

    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return
      }
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ""
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    const { skipAuth, ...fetchOptions } = options
    const url = this.buildURL(endpoint)

    const headers: HeadersInit = {
      Accept: "application/json",
      ...(fetchOptions.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...fetchOptions.headers,
    }

    if (!skipAuth && this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      if (response.status === 401 && !skipAuth && this.refreshToken) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          headers.Authorization = `Bearer ${this.accessToken}`
          const retry = await fetch(url, {
            ...fetchOptions,
            headers,
          })
          return this.handleResponse<T>(retry)
        }
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
        status: 0,
      }
    }
  }

  private async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
    if (response.status === 204 || response.status === 205) {
      return {
        data: undefined,
        status: response.status,
      }
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      if (!response.ok) {
        return {
          error: "An error occurred",
          status: response.status,
        }
      }
      return {
        data: undefined,
        status: response.status,
      }
    }

    if (!response.ok) {
      const payload = data as { detail?: string; message?: string; error?: string }
      return {
        error: payload?.detail || payload?.message || payload?.error || "An error occurred",
        status: response.status,
      }
    }

    return {
      data: data as T,
      status: response.status,
    }
  }

  private persistTokens(access: string, refresh: string) {
    this.accessToken = access
    this.refreshToken = refresh

    if (typeof window !== "undefined") {
      localStorage.setItem("subchain_access_token", access)
      localStorage.setItem("subchain_refresh_token", refresh)
    }
  }

  setTokens(access: string, refresh: string) {
    this.persistTokens(access, refresh)
  }

  clearTokens() {
    this.accessToken = null
    this.refreshToken = null

    if (typeof window !== "undefined") {
      localStorage.removeItem("subchain_access_token")
      localStorage.removeItem("subchain_refresh_token")
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: this.refreshToken }),
      })

      if (!response.ok) {
        this.clearTokens()
        return false
      }

      const data = await response.json()
      if (!data?.access) {
        this.clearTokens()
        return false
      }

      this.persistTokens(data.access, this.refreshToken)
      return true
    } catch {
      this.clearTokens()
      return false
    }
  }

  // Auth ----------------------------------------------------------------------

  async login(email: string, password: string) {
    const response = await this.request<{
      access: string
      refresh: string
      user: AuthUser
    }>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })

    if (response.data?.access && response.data?.refresh) {
      this.persistTokens(response.data.access, response.data.refresh)
    }

    return response
  }

  async register(email: string, password: string, walletAddress: string, username?: string) {
    const payload: Record<string, unknown> = {
      email,
      password,
      wallet_address: walletAddress,
    }

    if (username) {
      payload.username = username
    }

    const response = await this.request<{
      access: string
      refresh: string
      user: AuthUser
    }>("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    })

    if (response.data?.access && response.data?.refresh) {
      this.persistTokens(response.data.access, response.data.refresh)
    }

    return response
  }

  async logout({ redirect = true }: { redirect?: boolean } = {}) {
    if (this.refreshToken) {
      await this.request("/api/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh: this.refreshToken }),
      })
    }

    this.clearTokens()

    if (redirect && typeof window !== "undefined") {
      window.location.href = "/auth/signin"
    }
  }

  async getMe() {
    return this.request<AuthUser>("/api/auth/me/")
  }

  async getProfile() {
    return this.request<UserProfile>("/api/auth/profile/")
  }

  async updateProfile(payload: Partial<UserProfile>) {
    return this.request<UserProfile>("/api/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  }

  async getSettings() {
    return this.request<UserSettings>("/api/auth/settings/")
  }

  async updateSettings(payload: Partial<UserSettings>) {
    return this.request<UserSettings>("/api/auth/settings/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  }

  async getActivity(params?: { page?: number; page_size?: number }) {
    const query = this.buildQuery(params)
    return this.request<PaginatedResponse<UserActivity>>(`/api/auth/activity/${query}`)
  }

  async verifyEmail(token: string) {
    return this.request<{ success: boolean; detail?: string }>("/api/auth/verify-email/", {
      method: "POST",
      body: JSON.stringify({ token }),
      skipAuth: true,
    })
  }

  async requestPasswordReset(email: string) {
    return this.request<{ detail: string }>("/api/auth/forgot-password/", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    })
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ detail: string }>("/api/auth/reset-password/", {
      method: "POST",
      body: JSON.stringify({
        token,
        new_password: newPassword,
      }),
      skipAuth: true,
    })
  }

  // Subscriptions --------------------------------------------------------------

  async getPlans() {
    return this.request<SubscriptionPlan[]>("/api/subscriptions/plans/")
  }

  async createPlan(payload: {
    name: string
    description?: string | null
    metadata?: Record<string, unknown>
    features?: Array<{ name: string; description?: string | null; sort_order?: number }>
    price_tiers: Array<{
      unit_amount: string | number
      currency: string
      up_to?: number | null
    }>
  }) {
    return this.request<SubscriptionPlan>("/api/subscriptions/plans/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async updatePlan(
    planId: string,
    payload: Partial<{
      name: string
      description: string | null
      metadata: Record<string, unknown>
      features: Array<{ id?: string; name: string; description?: string | null; sort_order?: number }>
      price_tiers: Array<{
        id?: string
        unit_amount: string | number
        currency: string
        up_to?: number | null
      }>
    }>,
  ) {
    return this.request<SubscriptionPlan>(`/api/subscriptions/plans/${planId}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  }

  async deletePlan(planId: string) {
    return this.request(`/api/subscriptions/plans/${planId}/`, {
      method: "DELETE",
    })
  }

  async listSubscriptions(params?: Record<string, unknown>) {
    const query = this.buildQuery(params)
    const response = await this.request<PaginatedResponse<Subscription> | Subscription[]>(
      `/api/subscriptions/subscriptions/${query}`,
    )

    if (Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        },
      } as APIResponse<PaginatedResponse<Subscription>>
    }

    return response as APIResponse<PaginatedResponse<Subscription>>
  }

  async getSubscription(subscriptionId: string) {
    return this.request<Subscription>(`/api/subscriptions/subscriptions/${subscriptionId}/`)
  }

  async createSubscription(payload: {
    plan_id: string
    wallet_address: string
    coupon_id?: string
    quantity?: number
    metadata?: Record<string, unknown>
  }) {
    return this.request<SubscriptionCreateResponse>("/api/subscriptions/subscriptions/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async updateSubscription(
    subscriptionId: string,
    payload: Partial<{
      wallet_address: string
      quantity: number
      metadata: Record<string, unknown>
      coupon_id: string | null
      cancel_at_period_end: boolean
    }>,
  ) {
    return this.request<Subscription>(`/api/subscriptions/subscriptions/${subscriptionId}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  }

  async cancelSubscription(subscriptionId: string, options: { atPeriodEnd?: boolean } = {}) {
    const body =
      options.atPeriodEnd === undefined
        ? undefined
        : JSON.stringify({ at_period_end: Boolean(options.atPeriodEnd) })

    return this.request<Subscription>(`/api/subscriptions/subscriptions/${subscriptionId}/cancel/`, {
      method: "POST",
      body,
    })
  }

  async resumeSubscription(subscriptionId: string) {
    return this.request<Subscription>(`/api/subscriptions/subscriptions/${subscriptionId}/resume/`, {
      method: "POST",
    })
  }

  async activateSubscription(subscriptionId: string) {
    return this.request<Subscription>(`/api/subscriptions/subscriptions/${subscriptionId}/activate/`, {
      method: "POST",
    })
  }

  async getLatestSubscription() {
    const response = await this.listSubscriptions({ ordering: "-created_at", page_size: 1 })
    if (response.data?.results?.length) {
      return {
        status: response.status,
        data: response.data.results[0],
      } as APIResponse<Subscription>
    }
    return {
      status: response.status,
      data: undefined,
      error: response.error,
    } as APIResponse<Subscription>
  }

  async subscribe(
    planId: string,
    payload: {
      walletAddress: string
      couponId?: string
      quantity?: number
      metadata?: Record<string, unknown>
    },
  ) {
    return this.createSubscription({
      plan_id: planId,
      wallet_address: payload.walletAddress,
      coupon_id: payload.couponId,
      quantity: payload.quantity,
      metadata: payload.metadata,
    })
  }

  async getSubscriptionStatus() {
    return this.getLatestSubscription()
  }

  async listCoupons(params?: Record<string, unknown>) {
    const query = this.buildQuery(params)
    const response = await this.request<PaginatedResponse<Coupon> | Coupon[]>(`/api/subscriptions/coupons/${query}`)

    if (Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        },
      } as APIResponse<PaginatedResponse<Coupon>>
    }

    return response as APIResponse<PaginatedResponse<Coupon>>
  }

  async listInvoices(params?: Record<string, unknown>) {
    const query = this.buildQuery(params)
    const response = await this.request<PaginatedResponse<Invoice> | Invoice[]>(`/api/subscriptions/invoices/${query}`)

    if (Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        },
      } as APIResponse<PaginatedResponse<Invoice>>
    }

    return response as APIResponse<PaginatedResponse<Invoice>>
  }

  async getInvoice(invoiceId: string) {
    return this.request<Invoice>(`/api/subscriptions/invoices/${invoiceId}/`)
  }

  async createInvoice(payload: {
    subscription_id: string
    currency?: string
    due_date?: string | null
    notes?: string | null
    metadata?: Record<string, unknown>
    line_items: Array<{
      plan_id?: string | null
      description: string
      quantity: number
      unit_amount: string | number
      total_amount?: string | number
      metadata?: Record<string, unknown>
    }>
  }) {
    return this.request<Invoice>("/api/subscriptions/invoices/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async updateInvoice(
    invoiceId: string,
    payload: Partial<{
      currency: string
      due_date: string | null
      notes: string | null
      metadata: Record<string, unknown>
      line_items: Array<{
        id?: string
        plan_id?: string | null
        description: string
        quantity: number
        unit_amount: string | number
        total_amount?: string | number
        metadata?: Record<string, unknown>
      }>
    }>,
  ) {
    return this.request<Invoice>(`/api/subscriptions/invoices/${invoiceId}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  }

  async deleteInvoice(invoiceId: string) {
    return this.request(`/api/subscriptions/invoices/${invoiceId}/`, {
      method: "DELETE",
    })
  }

  async payInvoice(invoiceId: string) {
    return this.request<Invoice | { invoice: Invoice; payment_intent?: PaymentIntent }>(
      `/api/subscriptions/invoices/${invoiceId}/pay/`,
      {
        method: "POST",
      },
    )
  }

  // Payments -------------------------------------------------------------------

  async listTransactions(params?: Record<string, unknown>) {
    const query = this.buildQuery(params)
    const response = await this.request<PaginatedResponse<Transaction> | Transaction[]>(`/api/payments/${query}`)

    if (Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        },
      } as APIResponse<PaginatedResponse<Transaction>>
    }

    return response as APIResponse<PaginatedResponse<Transaction>>
  }

  async createTransaction(payload: {
    amount: string | number
    currency: "ALGO" | "USDC" | string
    type: string
    notes?: string
  }) {
    return this.request<Transaction>("/api/payments/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async getTransaction(transactionId: string) {
    return this.request<Transaction>(`/api/payments/${transactionId}/`)
  }

  async confirmAlgoPayment(txId: string) {
    return this.request<{ detail?: string }>("/api/payments/webhook/algo-confirm/", {
      method: "POST",
      body: JSON.stringify({ tx_id: txId }),
    })
  }

  getPaymentQRCodeUrl(amount: number, currency?: string) {
    const params = new URLSearchParams({ amount: String(amount) })
    if (currency) {
      params.append("currency", currency)
    }
    return this.buildURL("/api/payments/qr/", params)
  }

  async getPaymentQRCode(amount: number, currency?: string) {
    const params = new URLSearchParams({ amount: String(amount) })
    if (currency) {
      params.append("currency", currency)
    }
    return this.request<PaymentQRCode>(`/api/payments/qr/?${params.toString()}`)
  }

  // Currency -------------------------------------------------------------------

  async getCurrencies() {
    return this.request<Currency[]>("/api/currency/currencies/")
  }

  async getExchangeRates() {
    return this.request<ExchangeRate[]>("/api/currency/exchange-rates/")
  }

  async convertCurrency(params: { from: string; to: string; amount: number | string }) {
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
      amount: String(params.amount),
    })
    return this.request<CurrencyConversion>(`/api/currency/convert/?${query.toString()}`)
  }

  // Notifications --------------------------------------------------------------

  async getNotifications(params?: Record<string, unknown>) {
    const query = this.buildQuery(params)
    const response = await this.request<PaginatedResponse<Notification> | Notification[]>(`/api/notifications/${query}`)

    if (Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        },
      } as APIResponse<PaginatedResponse<Notification>>
    }

    return response as APIResponse<PaginatedResponse<Notification>>
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<Notification>(`/api/notifications/${notificationId}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_read: true }),
    })
  }

  async markAllNotificationsAsRead() {
    return this.request<{ detail?: string }>("/api/notifications/mark-all-read/", {
      method: "POST",
    })
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/api/notifications/${notificationId}/`, {
      method: "DELETE",
    })
  }

  async getNotificationTemplates(params?: Record<string, unknown>) {
    const query = this.buildQuery(params)
    const response = await this.request<PaginatedResponse<NotificationTemplate> | NotificationTemplate[]>(
      `/api/notifications/templates/${query}`,
    )

    if (Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        },
      } as APIResponse<PaginatedResponse<NotificationTemplate>>
    }

    return response as APIResponse<PaginatedResponse<NotificationTemplate>>
  }

  async sendNotification(payload: { template: string; email: string; context?: Record<string, unknown> }) {
    return this.request<{ detail: string }>("/api/notifications/send-notification/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  // Analytics ------------------------------------------------------------------

  async trackEvent(eventType: string, payload: Record<string, unknown> = {}) {
    return this.request<AnalyticsLog>("/api/analytics/logs/", {
      method: "POST",
      body: JSON.stringify({
        event_type: eventType,
        payload,
      }),
    })
  }

  async listAnalyticsLogs(params?: Record<string, unknown>) {
    const query = this.buildQuery(params)
    const response = await this.request<PaginatedResponse<AnalyticsLog> | AnalyticsLog[]>(
      `/api/analytics/logs/${query}`,
    )

    if (Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        },
      } as APIResponse<PaginatedResponse<AnalyticsLog>>
    }

    return response as APIResponse<PaginatedResponse<AnalyticsLog>>
  }

  // Integrations ---------------------------------------------------------------

  async listIntegrations(params?: Record<string, unknown>) {
    const query = this.buildQuery(params)
    const response = await this.request<PaginatedResponse<Integration> | Integration[]>(
      `/api/integrations/${query}`,
    )

    if (Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        },
      } as APIResponse<PaginatedResponse<Integration>>
    }

    return response as APIResponse<PaginatedResponse<Integration>>
  }

  async createIntegration(payload: {
    name: string
    type: string
    endpoint_url: string
    auth_token?: string
    config?: Record<string, unknown>
  }) {
    return this.request<Integration>("/api/integrations/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async updateIntegration(integrationId: string, payload: Partial<Integration>) {
    return this.request<Integration>(`/api/integrations/${integrationId}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  }

  async deleteIntegration(integrationId: string) {
    return this.request(`/api/integrations/${integrationId}/`, {
      method: "DELETE",
    })
  }

  // Utility --------------------------------------------------------------------

  isAuthenticated(): boolean {
    return Boolean(this.accessToken)
  }

  getAccessToken(): string | null {
    return this.accessToken
  }
}

export const apiClient = new DjangoAPIClient()

export type { RequestOptions }
