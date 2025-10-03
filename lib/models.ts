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

// Utility functions for working with Django models
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Mock data stores (replace with actual API calls)
export const plansDB = new Map<string, DjangoModels['SubscriptionPlan']>()
export const subscribersDB = new Map<string, DjangoModels['Subscriber']>()
export const paymentsDB = new Map<string, DjangoModels['Payment']>()

// Helper functions for calculations
export function calculateMRR(subscribers: DjangoModels['Subscriber'][], plans: DjangoModels['SubscriptionPlan'][]): number {
  let mrr = 0
  
  subscribers.filter(s => s.status === 'active').forEach(subscriber => {
    const plan = plans.find(p => p.id === subscriber.plan)
    if (plan) {
      if (plan.interval === 'monthly') {
        mrr += plan.amount
      } else if (plan.interval === 'yearly') {
        mrr += plan.amount / 12
      }
    }
  })
  
  return mrr
}

export function calculateChurnRate(subscribers: DjangoModels['Subscriber'][], period: 'monthly' | 'yearly'): number {
  const totalSubscribers = subscribers.length
  if (totalSubscribers === 0) return 0
  
  const cancelledSubscribers = subscribers.filter(s => s.status === 'cancelled').length
  return (cancelledSubscribers / totalSubscribers) * 100
}
