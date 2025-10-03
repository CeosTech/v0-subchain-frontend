// Liste complète des endpoints API pour Django REST Framework

export const API_ENDPOINTS = {
  // Authentication Endpoints (10 endpoints)
  AUTH: {
    REGISTER: 'POST /api/auth/register/',
    LOGIN: 'POST /api/auth/login/',
    LOGOUT: 'POST /api/auth/logout/',
    REFRESH_TOKEN: 'POST /api/auth/refresh/',
    PROFILE: 'GET /api/auth/profile/',
    UPDATE_PROFILE: 'PUT /api/auth/profile/',
    CHANGE_PASSWORD: 'POST /api/auth/change-password/',
    FORGOT_PASSWORD: 'POST /api/auth/forgot-password/',
    RESET_PASSWORD: 'POST /api/auth/reset-password/',
    VERIFY_EMAIL: 'POST /api/auth/verify-email/',
  },

  // Plans Endpoints (15 endpoints)
  PLANS: {
    LIST_CREATE: 'GET|POST /api/plans/',
    DETAIL: 'GET|PUT|DELETE /api/plans/{id}/',
    ACTIVATE: 'POST /api/plans/{id}/activate/',
    DEACTIVATE: 'POST /api/plans/{id}/deactivate/',
    DUPLICATE: 'POST /api/plans/{id}/duplicate/',
    ANALYTICS: 'GET /api/plans/{id}/analytics/',
    SUBSCRIBERS: 'GET /api/plans/{id}/subscribers/',
    PRICING_PREVIEW: 'POST /api/plans/pricing-preview/',
    CURRENCY_RATES: 'GET /api/plans/currency-rates/',
    UPDATE_PRICING: 'POST /api/plans/{id}/update-pricing/',
    BULK_UPDATE: 'POST /api/plans/bulk-update/',
    EXPORT: 'GET /api/plans/export/',
    IMPORT: 'POST /api/plans/import/',
    TEMPLATES: 'GET /api/plans/templates/',
    VALIDATE: 'POST /api/plans/validate/',
  },

  // Subscribers Endpoints (18 endpoints)
  SUBSCRIBERS: {
    LIST_CREATE: 'GET|POST /api/subscribers/',
    DETAIL: 'GET|PUT|DELETE /api/subscribers/{id}/',
    CANCEL: 'POST /api/subscribers/{id}/cancel/',
    PAUSE: 'POST /api/subscribers/{id}/pause/',
    RESUME: 'POST /api/subscribers/{id}/resume/',
    CHANGE_PLAN: 'POST /api/subscribers/{id}/change-plan/',
    PAYMENT_HISTORY: 'GET /api/subscribers/{id}/payments/',
    SEND_NOTIFICATION: 'POST /api/subscribers/{id}/notify/',
    BULK_ACTIONS: 'POST /api/subscribers/bulk-actions/',
    EXPORT: 'GET /api/subscribers/export/',
    IMPORT: 'POST /api/subscribers/import/',
    STATS: 'GET /api/subscribers/stats/',
    ACTIVITY: 'GET /api/subscribers/{id}/activity/',
    INVOICES: 'GET /api/subscribers/{id}/invoices/',
    REFUND: 'POST /api/subscribers/{id}/refund/',
    UPDATE_PAYMENT_METHOD: 'POST /api/subscribers/{id}/payment-method/',
    TRIAL_EXTEND: 'POST /api/subscribers/{id}/extend-trial/',
    NOTES: 'GET|POST /api/subscribers/{id}/notes/',
  },

  // Payments Endpoints (16 endpoints)
  PAYMENTS: {
    LIST_CREATE: 'GET|POST /api/payments/',
    DETAIL: 'GET|PUT /api/payments/{id}/',
    VERIFY: 'POST /api/payments/{id}/verify/',
    REFUND: 'POST /api/payments/{id}/refund/',
    MARK_PAID: 'POST /api/payments/{id}/mark-paid/',
    RETRY: 'POST /api/payments/{id}/retry/',
    CANCEL: 'POST /api/payments/{id}/cancel/',
    BULK_ACTIONS: 'POST /api/payments/bulk-actions/',
    EXPORT: 'GET /api/payments/export/',
    STATS: 'GET /api/payments/stats/',
    FAILED: 'GET /api/payments/failed/',
    PENDING: 'GET /api/payments/pending/',
    TRANSACTIONS: 'GET /api/payments/{id}/transactions/',
    RECEIPT: 'GET /api/payments/{id}/receipt/',
    DISPUTE: 'POST /api/payments/{id}/dispute/',
    WEBHOOK_VERIFY: 'POST /api/payments/webhook-verify/',
  },

  // Analytics Endpoints (12 endpoints)
  ANALYTICS: {
    OVERVIEW: 'GET /api/analytics/overview/',
    REVENUE: 'GET /api/analytics/revenue/',
    SUBSCRIBERS: 'GET /api/analytics/subscribers/',
    CHURN: 'GET /api/analytics/churn/',
    COHORTS: 'GET /api/analytics/cohorts/',
    GEOGRAPHIC: 'GET /api/analytics/geographic/',
    LTV: 'GET /api/analytics/ltv/',
    FORECASTING: 'GET /api/analytics/forecasting/',
    EXPORT: 'GET /api/analytics/export/',
    DASHBOARD: 'GET /api/analytics/dashboard/',
    REAL_TIME: 'GET /api/analytics/real-time/',
    CUSTOM_METRICS: 'GET /api/analytics/custom-metrics/',
  },

  // Webhooks Endpoints (12 endpoints)
  WEBHOOKS: {
    LIST_CREATE: 'GET|POST /api/webhooks/',
    DETAIL: 'GET|PUT|DELETE /api/webhooks/{id}/',
    TEST: 'POST /api/webhooks/{id}/test/',
    RETRY: 'POST /api/webhooks/{id}/retry/',
    EVENTS: 'GET /api/webhooks/{id}/events/',
    LOGS: 'GET /api/webhooks/{id}/logs/',
    ACTIVATE: 'POST /api/webhooks/{id}/activate/',
    DEACTIVATE: 'POST /api/webhooks/{id}/deactivate/',
    VALIDATE_URL: 'POST /api/webhooks/validate-url/',
    EVENT_TYPES: 'GET /api/webhooks/event-types/',
    BULK_RETRY: 'POST /api/webhooks/bulk-retry/',
    STATS: 'GET /api/webhooks/stats/',
  },

  // API Keys Endpoints (10 endpoints)
  API_KEYS: {
    LIST_CREATE: 'GET|POST /api/api-keys/',
    DETAIL: 'GET|PUT|DELETE /api/api-keys/{id}/',
    REGENERATE: 'POST /api/api-keys/{id}/regenerate/',
    ACTIVATE: 'POST /api/api-keys/{id}/activate/',
    DEACTIVATE: 'POST /api/api-keys/{id}/deactivate/',
    USAGE: 'GET /api/api-keys/{id}/usage/',
    PERMISSIONS: 'GET|PUT /api/api-keys/{id}/permissions/',
    LOGS: 'GET /api/api-keys/{id}/logs/',
    ROTATE: 'POST /api/api-keys/{id}/rotate/',
    VALIDATE: 'POST /api/api-keys/validate/',
  },

  // Currency & Pricing Endpoints (8 endpoints)
  CURRENCY: {
    RATES: 'GET /api/currency/rates/',
    CONVERT: 'POST /api/currency/convert/',
    HISTORY: 'GET /api/currency/history/',
    UPDATE_RATES: 'POST /api/currency/update-rates/',
    SUPPORTED: 'GET /api/currency/supported/',
    PRICE_CALCULATOR: 'POST /api/currency/calculate-price/',
    REAL_TIME_RATES: 'GET /api/currency/real-time-rates/',
    RATE_ALERTS: 'GET|POST /api/currency/rate-alerts/',
  },

  // Notifications Endpoints (8 endpoints)
  NOTIFICATIONS: {
    LIST: 'GET /api/notifications/',
    MARK_READ: 'POST /api/notifications/{id}/mark-read/',
    MARK_ALL_READ: 'POST /api/notifications/mark-all-read/',
    SETTINGS: 'GET|PUT /api/notifications/settings/',
    TEMPLATES: 'GET /api/notifications/templates/',
    SEND_BULK: 'POST /api/notifications/send-bulk/',
    HISTORY: 'GET /api/notifications/history/',
    PREFERENCES: 'GET|PUT /api/notifications/preferences/',
  },
}

// Total: 109 endpoints
export const TOTAL_ENDPOINTS = Object.values(API_ENDPOINTS).reduce(
  (total, category) => total + Object.keys(category).length, 
  0
)

// Endpoint categories summary
export const ENDPOINT_SUMMARY = {
  'Authentication': Object.keys(API_ENDPOINTS.AUTH).length,
  'Plans': Object.keys(API_ENDPOINTS.PLANS).length,
  'Subscribers': Object.keys(API_ENDPOINTS.SUBSCRIBERS).length,
  'Payments': Object.keys(API_ENDPOINTS.PAYMENTS).length,
  'Analytics': Object.keys(API_ENDPOINTS.ANALYTICS).length,
  'Webhooks': Object.keys(API_ENDPOINTS.WEBHOOKS).length,
  'API Keys': Object.keys(API_ENDPOINTS.API_KEYS).length,
  'Currency': Object.keys(API_ENDPOINTS.CURRENCY).length,
  'Notifications': Object.keys(API_ENDPOINTS.NOTIFICATIONS).length,
}
