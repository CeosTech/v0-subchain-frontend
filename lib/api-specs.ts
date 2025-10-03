// Spécifications complètes de l'API SubChain pour Django REST Framework

export interface APIEndpoints {
  // Authentication
  auth: {
    register: 'POST /api/auth/register/'
    login: 'POST /api/auth/login/'
    logout: 'POST /api/auth/logout/'
    refresh: 'POST /api/auth/refresh/'
    profile: 'GET /api/auth/profile/'
    updateProfile: 'PUT /api/auth/profile/'
  }
  
  // Plans
  plans: {
    list: 'GET /api/plans/'
    create: 'POST /api/plans/'
    retrieve: 'GET /api/plans/{id}/'
    update: 'PUT /api/plans/{id}/'
    partialUpdate: 'PATCH /api/plans/{id}/'
    delete: 'DELETE /api/plans/{id}/'
    activate: 'POST /api/plans/{id}/activate/'
    deactivate: 'POST /api/plans/{id}/deactivate/'
  }
  
  // Subscribers
  subscribers: {
    list: 'GET /api/subscribers/'
    create: 'POST /api/subscribers/'
    retrieve: 'GET /api/subscribers/{id}/'
    update: 'PUT /api/subscribers/{id}/'
    delete: 'DELETE /api/subscribers/{id}/'
    cancel: 'POST /api/subscribers/{id}/cancel/'
    pause: 'POST /api/subscribers/{id}/pause/'
    resume: 'POST /api/subscribers/{id}/resume/'
  }
  
  // Payments
  payments: {
    list: 'GET /api/payments/'
    create: 'POST /api/payments/'
    retrieve: 'GET /api/payments/{id}/'
    verify: 'POST /api/payments/{id}/verify/'
    refund: 'POST /api/payments/{id}/refund/'
  }
  
  // Analytics
  analytics: {
    overview: 'GET /api/analytics/overview/'
    revenue: 'GET /api/analytics/revenue/'
    subscribers: 'GET /api/analytics/subscribers/'
    churn: 'GET /api/analytics/churn/'
    plans: 'GET /api/analytics/plans/'
  }
  
  // Webhooks
  webhooks: {
    list: 'GET /api/webhooks/'
    create: 'POST /api/webhooks/'
    retrieve: 'GET /api/webhooks/{id}/'
    update: 'PUT /api/webhooks/{id}/'
    delete: 'DELETE /api/webhooks/{id}/'
    test: 'POST /api/webhooks/{id}/test/'
  }
  
  // API Keys
  apiKeys: {
    list: 'GET /api/api-keys/'
    create: 'POST /api/api-keys/'
    retrieve: 'GET /api/api-keys/{id}/'
    delete: 'DELETE /api/api-keys/{id}/'
    regenerate: 'POST /api/api-keys/{id}/regenerate/'
  }
}

// Modèles de données pour Django
export interface DjangoModels {
  User: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    wallet_address?: string
    plan_tier: 'starter' | 'pro' | 'enterprise'
    is_active: boolean
    date_joined: string
    last_login?: string
  }
  
  SubscriptionPlan: {
    id: string
    user: string // Foreign Key to User
    name: string
    description?: string
    amount: number
    currency: 'ALGO' | 'USDC'
    interval: 'monthly' | 'yearly'
    features: string[] // JSONField
    status: 'active' | 'inactive' | 'draft'
    subscriber_count: number
    total_revenue: number
    created_at: string
    updated_at: string
  }
  
  Subscriber: {
    id: string
    plan: string // Foreign Key to SubscriptionPlan
    wallet_address: string
    email?: string
    status: 'active' | 'cancelled' | 'paused' | 'past_due'
    start_date: string
    next_payment_date?: string
    last_payment_date?: string
    total_paid: number
    payment_method: 'algorand_wallet'
    metadata?: Record<string, any> // JSONField
    created_at: string
    updated_at: string
  }
  
  Payment: {
    id: string
    subscriber: string // Foreign Key to Subscriber
    plan: string // Foreign Key to SubscriptionPlan
    amount: number
    currency: 'ALGO' | 'USDC'
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    transaction_hash?: string
    algorand_txn_id?: string
    payment_date: string
    due_date?: string
    failure_reason?: string
    metadata?: Record<string, any> // JSONField
    created_at: string
    updated_at: string
  }
  
  Webhook: {
    id: string
    user: string // Foreign Key to User
    url: string
    events: string[] // JSONField
    secret: string
    is_active: boolean
    last_triggered?: string
    failure_count: number
    created_at: string
    updated_at: string
  }
  
  APIKey: {
    id: string
    user: string // Foreign Key to User
    name: string
    key: string
    is_active: boolean
    last_used?: string
    created_at: string
    expires_at?: string
  }
  
  WebhookEvent: {
    id: string
    webhook: string // Foreign Key to Webhook
    event_type: string
    payload: Record<string, any> // JSONField
    status: 'pending' | 'delivered' | 'failed'
    attempts: number
    response_status?: number
    response_body?: string
    created_at: string
    delivered_at?: string
  }
}
