// Client API Django pour SubChain - Structure complète mise à jour

interface APIResponse<T> {
  data?: T
  error?: string
  status: number
}

interface PaginatedResponse<T> {
  count: number
  next?: string | null
  previous?: string | null
  results: T[]
}

// Types pour l'API SubChain
export interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  wallet_address?: string
  plan_tier?: string
  is_active: boolean
  date_joined: string
  last_login?: string
}

export interface SubscriptionPlan {
  id: number
  name: string
  description?: string
  price_algo: number
  price_usdc: number
  interval: "monthly" | "yearly"
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionStatus {
  id: number
  user: number
  plan: SubscriptionPlan
  status: "active" | "cancelled" | "paused" | "expired"
  start_date: string
  end_date?: string
  next_billing_date?: string
  auto_renew: boolean
  payment_method: "ALGO" | "USDC"
}

export interface PaymentHistory {
  id: number
  user: number
  plan: number
  amount: number
  currency: "ALGO" | "USDC"
  transaction_id?: string
  algorand_txn_id?: string
  status: "pending" | "completed" | "failed" | "swapped"
  swap_triggered: boolean
  swap_status?: string
  created_at: string
  completed_at?: string
}

export interface Notification {
  id: number
  user: number
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  created_at: string
}

export interface AnalyticsEvent {
  event_type: string
  payload: Record<string, any>
  timestamp?: string
}

export interface WebhookPayment {
  transaction_id: string
  amount: number
  wallet: string
  currency?: "ALGO" | "USDC"
}

class DjangoAPIClient {
  private baseURL: string
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") {
    this.baseURL = baseURL

    // Charger les tokens depuis localStorage si disponible
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("subchain_access_token")
      this.refreshToken = localStorage.getItem("subchain_refresh_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // Ajouter le token d'authentification si disponible
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Si 401, essayer de rafraîchir le token
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          // Réessayer la requête avec le nouveau token
          headers.Authorization = `Bearer ${this.accessToken}`
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          })
          return this.handleResponse<T>(retryResponse)
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
    try {
      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.detail || data.message || data.error || "An error occurred",
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch {
      if (!response.ok) {
        return {
          error: "An error occurred",
          status: response.status,
        }
      }
      return {
        data: {} as T,
        status: response.status,
      }
    }
  }

  // Token Management
  setTokens(access: string, refresh: string) {
    this.accessToken = access
    this.refreshToken = refresh

    if (typeof window !== "undefined") {
      localStorage.setItem("subchain_access_token", access)
      localStorage.setItem("subchain_refresh_token", refresh)
    }
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
    if (!this.refreshToken) return false

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: this.refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        this.accessToken = data.access
        if (typeof window !== "undefined") {
          localStorage.setItem("subchain_access_token", data.access)
        }
        return true
      }

      this.clearTokens()
      return false
    } catch {
      this.clearTokens()
      return false
    }
  }

  // 🔐 AUTHENTIFICATION

  /**
   * Connexion utilisateur
   * POST /api/auth/login/
   */
  async login(email: string, password: string) {
    const response = await this.request<{
      access: string
      refresh: string
      user: User
    }>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (response.data) {
      this.setTokens(response.data.access, response.data.refresh)
    }

    return response
  }

  /**
   * Récupérer le profil utilisateur
   * GET /api/auth/profile/
   */
  async getProfile() {
    return this.request<User>("/api/auth/profile/")
  }

  /**
   * Déconnexion (côté client)
   */
  logout() {
    this.clearTokens()
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin"
    }
  }

  // 🧾 PLANS & ABONNEMENTS

  /**
   * Liste des plans disponibles
   * GET /api/subscriptions/plans/
   */
  async getPlans() {
    return this.request<SubscriptionPlan[]>("/api/subscriptions/plans/")
  }

  /**
   * Souscrire à un plan
   * POST /api/subscriptions/subscribe/
   */
  async subscribe(planId: number) {
    return this.request<{
      subscription: SubscriptionStatus
      payment_required: boolean
      payment_amount?: number
      payment_currency?: string
    }>("/api/subscriptions/subscribe/", {
      method: "POST",
      body: JSON.stringify({ plan_id: planId }),
    })
  }

  /**
   * Récupérer le statut de l'abonnement
   * GET /api/subscriptions/status/
   */
  async getSubscriptionStatus() {
    return this.request<SubscriptionStatus>("/api/subscriptions/status/")
  }

  /**
   * Annuler un abonnement
   * POST /api/subscriptions/cancel/
   */
  async cancelSubscription() {
    return this.request<{ message: string }>("/api/subscriptions/cancel/", {
      method: "POST",
    })
  }

  /**
   * Réactiver un abonnement
   * POST /api/subscriptions/reactivate/
   */
  async reactivateSubscription() {
    return this.request<{ message: string }>("/api/subscriptions/reactivate/", {
      method: "POST",
    })
  }

  // 💸 PAIEMENTS & SWAP ALGORAND

  /**
   * Historique des paiements
   * GET /api/payments/history/
   */
  async getPaymentHistory(params?: {
    page?: number
    page_size?: number
    status?: string
    currency?: string
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
    return this.request<PaginatedResponse<PaymentHistory>>(`/api/payments/history/${query ? `?${query}` : ""}`)
  }

  /**
   * Déclencher un swap ALGO → USDC
   * POST /api/payments/trigger-swap/
   */
  async triggerSwap(paymentId: number) {
    return this.request<{
      swap_initiated: boolean
      swap_transaction_id?: string
      message: string
    }>("/api/payments/trigger-swap/", {
      method: "POST",
      body: JSON.stringify({ payment_id: paymentId }),
    })
  }

  /**
   * Générer un QR code pour paiement ALGO
   * GET /api/payments/qrcode/<amount>/
   */
  getPaymentQRCodeUrl(amount: number): string {
    return `${this.baseURL}/api/payments/qrcode/${amount}/`
  }

  /**
   * Obtenir les détails d'un QR code
   * GET /api/payments/qrcode/<amount>/
   */
  async getPaymentQRCode(amount: number) {
    return this.request<{
      qr_code: string
      payment_address: string
      amount: number
      currency: string
    }>(`/api/payments/qrcode/${amount}/`)
  }

  /**
   * Créer un nouveau paiement
   * POST /api/payments/create/
   */
  async createPayment(data: {
    plan_id: number
    amount: number
    currency: "ALGO" | "USDC"
    wallet_address?: string
  }) {
    return this.request<PaymentHistory>("/api/payments/create/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  /**
   * Vérifier un paiement
   * POST /api/payments/verify/
   */
  async verifyPayment(transactionId: string) {
    return this.request<{
      verified: boolean
      payment: PaymentHistory
    }>("/api/payments/verify/", {
      method: "POST",
      body: JSON.stringify({ transaction_id: transactionId }),
    })
  }

  // 🔔 NOTIFICATIONS

  /**
   * Liste des notifications
   * GET /api/notifications/
   */
  async getNotifications(params?: {
    page?: number
    page_size?: number
    is_read?: boolean
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
    return this.request<PaginatedResponse<Notification>>(`/api/notifications/${query ? `?${query}` : ""}`)
  }

  /**
   * Marquer une notification comme lue
   * PATCH /api/notifications/<id>/
   */
  async markNotificationAsRead(notificationId: number) {
    return this.request<Notification>(`/api/notifications/${notificationId}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_read: true }),
    })
  }

  /**
   * Marquer toutes les notifications comme lues
   * POST /api/notifications/mark-all-read/
   */
  async markAllNotificationsAsRead() {
    return this.request<{ message: string }>("/api/notifications/mark-all-read/", {
      method: "POST",
    })
  }

  /**
   * Supprimer une notification
   * DELETE /api/notifications/<id>/
   */
  async deleteNotification(notificationId: number) {
    return this.request(`/api/notifications/${notificationId}/`, {
      method: "DELETE",
    })
  }

  // 📈 ANALYTICS

  /**
   * Tracker un événement analytics
   * POST /api/analytics/track/
   */
  async trackEvent(eventType: string, payload: Record<string, any> = {}) {
    return this.request<{
      tracked: boolean
      event_id: string
    }>("/api/analytics/track/", {
      method: "POST",
      body: JSON.stringify({
        event_type: eventType,
        payload,
      }),
    })
  }

  /**
   * Obtenir les statistiques utilisateur
   * GET /api/analytics/stats/
   */
  async getUserStats() {
    return this.request<{
      total_payments: number
      total_spent: number
      active_subscription: boolean
      signup_date: string
      last_payment_date?: string
    }>("/api/analytics/stats/")
  }

  // ⚙️ WEBHOOKS (côté admin/intégrations)

  /**
   * Notifier un paiement reçu (généralement appelé par un service externe)
   * POST /api/webhooks/payment-received/
   */
  async notifyPaymentReceived(data: WebhookPayment) {
    return this.request<{
      received: boolean
      payment_id: number
      message: string
    }>("/api/webhooks/payment-received/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // UTILITAIRES

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  /**
   * Obtenir le token d'accès actuel
   */
  getAccessToken(): string | null {
    return this.accessToken
  }
}

// Singleton instance
export const apiClient = new DjangoAPIClient()

// Export des types
export type {
  APIResponse,
  PaginatedResponse,
  SubscriptionPlan,
  SubscriptionStatus,
  PaymentHistory,
  Notification,
  AnalyticsEvent,
  WebhookPayment,
}
