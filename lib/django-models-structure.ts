// Structure complète des modèles Django pour SubChain

export const DJANGO_APPS = {
  // App 1: accounts - Gestion des utilisateurs
  ACCOUNTS: {
    name: 'accounts',
    models: [
      'User',
      'UserProfile', 
      'UserSettings',
      'UserActivity',
      'EmailVerification'
    ]
  },

  // App 2: subscriptions - Plans et abonnés
  SUBSCRIPTIONS: {
    name: 'subscriptions',
    models: [
      'SubscriptionPlan',
      'PlanFeature',
      'Subscriber',
      'SubscriptionHistory',
      'PlanTemplate'
    ]
  },

  // App 3: payments - Paiements et transactions
  PAYMENTS: {
    name: 'payments',
    models: [
      'Payment',
      'Transaction',
      'PaymentMethod',
      'Invoice',
      'Refund',
      'PaymentIntent'
    ]
  },

  // App 4: currency - Gestion des devises
  CURRENCY: {
    name: 'currency',
    models: [
      'CurrencyRate',
      'CurrencyHistory',
      'RateAlert',
      'PriceCalculation',
      'CurrencyPair'
    ]
  },

  // App 5: webhooks - Système de webhooks
  WEBHOOKS: {
    name: 'webhooks',
    models: [
      'Webhook',
      'WebhookEvent',
      'WebhookLog',
      'WebhookAttempt',
      'EventType'
    ]
  },

  // App 6: analytics - Métriques et analytics
  ANALYTICS: {
    name: 'analytics',
    models: [
      'MetricSnapshot',
      'RevenueMetric',
      'SubscriberMetric',
      'ChurnAnalysis',
      'CohortAnalysis',
      'CustomMetric'
    ]
  },

  // App 7: notifications - Notifications
  NOTIFICATIONS: {
    name: 'notifications',
    models: [
      'Notification',
      'NotificationTemplate',
      'NotificationSettings',
      'EmailLog',
      'NotificationPreference'
    ]
  },

  // App 8: api_management - Gestion API
  API_MANAGEMENT: {
    name: 'api_management',
    models: [
      'APIKey',
      'APIUsage',
      'APIPermission',
      'APILog',
      'RateLimit'
    ]
  }
}

// Modèles détaillés avec champs
export const DETAILED_MODELS = {
  // User Model (accounts/models.py)
  User: {
    fields: {
      id: 'UUIDField(primary_key=True, default=uuid.uuid4)',
      email: 'EmailField(unique=True)',
      first_name: 'CharField(max_length=30, blank=True)',
      last_name: 'CharField(max_length=30, blank=True)',
      wallet_address: 'CharField(max_length=58, blank=True, null=True)',
      plan_tier: 'CharField(max_length=20, choices=PLAN_TIERS, default="starter")',
      is_active: 'BooleanField(default=True)',
      is_verified: 'BooleanField(default=False)',
      timezone: 'CharField(max_length=50, default="UTC")',
      language: 'CharField(max_length=10, default="en")',
      avatar: 'ImageField(upload_to="avatars/", blank=True, null=True)',
      phone: 'CharField(max_length=20, blank=True)',
      company: 'CharField(max_length=100, blank=True)',
      website: 'URLField(blank=True)',
      bio: 'TextField(max_length=500, blank=True)',
      date_joined: 'DateTimeField(auto_now_add=True)',
      last_login: 'DateTimeField(blank=True, null=True)',
      created_at: 'DateTimeField(auto_now_add=True)',
      updated_at: 'DateTimeField(auto_now=True)'
    },
    meta: {
      ordering: '["-created_at"]',
      verbose_name: 'User',
      verbose_name_plural: 'Users'
    }
  },

  // SubscriptionPlan Model (subscriptions/models.py)
  SubscriptionPlan: {
    fields: {
      id: 'UUIDField(primary_key=True, default=uuid.uuid4)',
      user: 'ForeignKey(User, on_delete=models.CASCADE, related_name="plans")',
      name: 'CharField(max_length=100)',
      description: 'TextField(blank=True)',
      base_price_eur: 'DecimalField(max_digits=10, decimal_places=2)',
      base_price_usd: 'DecimalField(max_digits=10, decimal_places=2)',
      current_price_algo: 'DecimalField(max_digits=15, decimal_places=6)',
      preferred_currency: 'CharField(max_length=3, choices=[("EUR", "Euro"), ("USD", "Dollar")], default="EUR")',
      interval: 'CharField(max_length=10, choices=[("monthly", "Monthly"), ("yearly", "Yearly")])',
      trial_days: 'PositiveIntegerField(default=0)',
      features: 'JSONField(default=list)',
      max_subscribers: 'PositiveIntegerField(blank=True, null=True)',
      status: 'CharField(max_length=10, choices=PLAN_STATUS_CHOICES, default="draft")',
      is_featured: 'BooleanField(default=False)',
      sort_order: 'PositiveIntegerField(default=0)',
      subscriber_count: 'PositiveIntegerField(default=0)',
      total_revenue_algo: 'DecimalField(max_digits=20, decimal_places=6, default=0)',
      total_revenue_fiat: 'DecimalField(max_digits=15, decimal_places=2, default=0)',
      last_price_update: 'DateTimeField(auto_now=True)',
      auto_update_pricing: 'BooleanField(default=True)',
      price_update_threshold: 'DecimalField(max_digits=5, decimal_places=2, default=5.0)',
      created_at: 'DateTimeField(auto_now_add=True)',
      updated_at: 'DateTimeField(auto_now=True)'
    },
    meta: {
      ordering: '["sort_order", "-created_at"]',
      verbose_name: 'Subscription Plan',
      verbose_name_plural: 'Subscription Plans'
    }
  },

  // Subscriber Model (subscriptions/models.py)
  Subscriber: {
    fields: {
      id: 'UUIDField(primary_key=True, default=uuid.uuid4)',
      plan: 'ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name="subscribers")',
      wallet_address: 'CharField(max_length=58)',
      email: 'EmailField(blank=True, null=True)',
      first_name: 'CharField(max_length=50, blank=True)',
      last_name: 'CharField(max_length=50, blank=True)',
      status: 'CharField(max_length=15, choices=SUBSCRIBER_STATUS_CHOICES, default="active")',
      subscription_price_algo: 'DecimalField(max_digits=15, decimal_places=6)',
      subscription_price_fiat: 'DecimalField(max_digits=10, decimal_places=2)',
      subscription_currency: 'CharField(max_length=3)',
      start_date: 'DateTimeField(auto_now_add=True)',
      trial_end_date: 'DateTimeField(blank=True, null=True)',
      current_period_start: 'DateTimeField(auto_now_add=True)',
      current_period_end: 'DateTimeField()',
      next_payment_date: 'DateTimeField(blank=True, null=True)',
      last_payment_date: 'DateTimeField(blank=True, null=True)',
      cancelled_at: 'DateTimeField(blank=True, null=True)',
      paused_at: 'DateTimeField(blank=True, null=True)',
      total_paid_algo: 'DecimalField(max_digits=20, decimal_places=6, default=0)',
      total_paid_fiat: 'DecimalField(max_digits=15, decimal_places=2, default=0)',
      payment_failures: 'PositiveIntegerField(default=0)',
      last_payment_attempt: 'DateTimeField(blank=True, null=True)',
      payment_method: 'CharField(max_length=50, default="algorand_wallet")',
      notes: 'TextField(blank=True)',
      metadata: 'JSONField(default=dict)',
      created_at: 'DateTimeField(auto_now_add=True)',
      updated_at: 'DateTimeField(auto_now=True)'
    },
    meta: {
      ordering: '["-created_at"]',
      unique_together: '["plan", "wallet_address"]',
      verbose_name: 'Subscriber',
      verbose_name_plural: 'Subscribers'
    }
  },

  // CurrencyRate Model (currency/models.py)
  CurrencyRate: {
    fields: {
      id: 'UUIDField(primary_key=True, default=uuid.uuid4)',
      from_currency: 'CharField(max_length=10)',
      to_currency: 'CharField(max_length=10)',
      rate: 'DecimalField(max_digits=20, decimal_places=10)',
      source: 'CharField(max_length=50, default="coingecko")',
      is_active: 'BooleanField(default=True)',
      last_updated: 'DateTimeField(auto_now=True)',
      created_at: 'DateTimeField(auto_now_add=True)'
    },
    meta: {
      ordering: '["-last_updated"]',
      unique_together: '["from_currency", "to_currency", "source"]',
      verbose_name: 'Currency Rate',
      verbose_name_plural: 'Currency Rates'
    }
  },

  // Payment Model (payments/models.py)
  Payment: {
    fields: {
      id: 'UUIDField(primary_key=True, default=uuid.uuid4)',
      subscriber: 'ForeignKey(Subscriber, on_delete=models.CASCADE, related_name="payments")',
      plan: 'ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name="payments")',
      amount_algo: 'DecimalField(max_digits=15, decimal_places=6)',
      amount_fiat: 'DecimalField(max_digits=10, decimal_places=2)',
      currency_fiat: 'CharField(max_length=3)',
      exchange_rate: 'DecimalField(max_digits=20, decimal_places=10)',
      status: 'CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default="pending")',
      payment_type: 'CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default="subscription")',
      transaction_hash: 'CharField(max_length=64, blank=True, null=True)',
      algorand_txn_id: 'CharField(max_length=64, blank=True, null=True)',
      block_number: 'PositiveIntegerField(blank=True, null=True)',
      payment_date: 'DateTimeField(auto_now_add=True)',
      due_date: 'DateTimeField()',
      confirmed_at: 'DateTimeField(blank=True, null=True)',
      failed_at: 'DateTimeField(blank=True, null=True)',
      refunded_at: 'DateTimeField(blank=True, null=True)',
      failure_reason: 'TextField(blank=True)',
      retry_count: 'PositiveIntegerField(default=0)',
      next_retry_at: 'DateTimeField(blank=True, null=True)',
      invoice_number: 'CharField(max_length=50, unique=True, blank=True, null=True)',
      receipt_url: 'URLField(blank=True)',
      metadata: 'JSONField(default=dict)',
      created_at: 'DateTimeField(auto_now_add=True)',
      updated_at: 'DateTimeField(auto_now=True)'
    },
    meta: {
      ordering: '["-created_at"]',
      verbose_name: 'Payment',
      verbose_name_plural: 'Payments'
    }
  },

  // Webhook Model (webhooks/models.py)
  Webhook: {
    fields: {
      id: 'UUIDField(primary_key=True, default=uuid.uuid4)',
      user: 'ForeignKey(User, on_delete=models.CASCADE, related_name="webhooks")',
      name: 'CharField(max_length=100)',
      url: 'URLField()',
      events: 'JSONField(default=list)',
      secret: 'CharField(max_length=64, default=generate_webhook_secret)',
      is_active: 'BooleanField(default=True)',
      timeout_seconds: 'PositiveIntegerField(default=30)',
      max_retries: 'PositiveIntegerField(default=3)',
      retry_delay_seconds: 'PositiveIntegerField(default=60)',
      last_triggered: 'DateTimeField(blank=True, null=True)',
      last_success: 'DateTimeField(blank=True, null=True)',
      last_failure: 'DateTimeField(blank=True, null=True)',
      success_count: 'PositiveIntegerField(default=0)',
      failure_count: 'PositiveIntegerField(default=0)',
      created_at: 'DateTimeField(auto_now_add=True)',
      updated_at: 'DateTimeField(auto_now=True)'
    },
    meta: {
      ordering: '["-created_at"]',
      verbose_name: 'Webhook',
      verbose_name_plural: 'Webhooks'
    }
  },

  // APIKey Model (api_management/models.py)
  APIKey: {
    fields: {
      id: 'UUIDField(primary_key=True, default=uuid.uuid4)',
      user: 'ForeignKey(User, on_delete=models.CASCADE, related_name="api_keys")',
      name: 'CharField(max_length=100)',
      key: 'CharField(max_length=64, unique=True, default=generate_api_key)',
      prefix: 'CharField(max_length=10, default="sk_live")',
      is_active: 'BooleanField(default=True)',
      permissions: 'JSONField(default=list)',
      rate_limit_per_minute: 'PositiveIntegerField(default=100)',
      rate_limit_per_hour: 'PositiveIntegerField(default=1000)',
      rate_limit_per_day: 'PositiveIntegerField(default=10000)',
      last_used: 'DateTimeField(blank=True, null=True)',
      usage_count: 'PositiveIntegerField(default=0)',
      expires_at: 'DateTimeField(blank=True, null=True)',
      created_at: 'DateTimeField(auto_now_add=True)',
      updated_at: 'DateTimeField(auto_now=True)'
    },
    meta: {
      ordering: '["-created_at"]',
      verbose_name: 'API Key',
      verbose_name_plural: 'API Keys'
    }
  }
}

// Choix pour les champs
export const MODEL_CHOICES = {
  PLAN_TIERS: [
    ('starter', 'Starter'),
    ('pro', 'Pro'), 
    ('enterprise', 'Enterprise')
  ],
  
  PLAN_STATUS_CHOICES: [
    ('draft', 'Draft'),
    ('active', 'Active'),
    ('inactive', 'Inactive'),
    ('archived', 'Archived')
  ],
  
  SUBSCRIBER_STATUS_CHOICES: [
    ('active', 'Active'),
    ('trialing', 'Trialing'),
    ('past_due', 'Past Due'),
    ('cancelled', 'Cancelled'),
    ('paused', 'Paused'),
    ('incomplete', 'Incomplete')
  ],
  
  PAYMENT_STATUS_CHOICES: [
    ('pending', 'Pending'),
    ('processing', 'Processing'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ('cancelled', 'Cancelled'),
    ('refunded', 'Refunded'),
    ('partially_refunded', 'Partially Refunded')
  ],
  
  PAYMENT_TYPE_CHOICES: [
    ('subscription', 'Subscription'),
    ('setup_fee', 'Setup Fee'),
    ('upgrade', 'Upgrade'),
    ('downgrade', 'Downgrade'),
    ('refund', 'Refund')
  ],
  
  CURRENCY_CHOICES: [
    ('EUR', 'Euro'),
    ('USD', 'US Dollar'),
    ('ALGO', 'Algorand')
  ]
}
