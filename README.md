# Subchain design

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/laurentgoulenok-gmailcoms-projects/v0-subchain-front-end)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/8Xt3LiHb9Fj)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/laurentgoulenok-gmailcoms-projects/v0-subchain-front-end](https://vercel.com/laurentgoulenok-gmailcoms-projects/v0-subchain-front-end)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/8Xt3LiHb9Fj](https://v0.app/chat/projects/8Xt3LiHb9Fj)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Backend Integration

- Set `NEXT_PUBLIC_API_URL` (or `NEXT_PUBLIC_BACKEND_URL`) in your environment to point to the Django backend, e.g. `http://localhost:8000`.
- Registration requires an Algorand wallet address; the UI captures it and `apiClient.register(email, password, walletAddress, username?)` forwards it to `/api/auth/register/`.
- The shared API client (`lib/django-api-client.ts`) now targets the authenticated routes listed in `accounts/urls.py`, `subscriptions/urls.py`, etc., and automatically handles JWT refresh via `/api/auth/token/refresh/`.
- Tokens are stored under `subchain_access_token` / `subchain_refresh_token` in `localStorage`; `apiClient.logout()` clears them and calls `/api/auth/logout/`.
- Hooks in `hooks/use-django-api.ts` consume the new client and expose helpers for auth, subscriptions (including checkout + invoice flows), payments/transactions, notifications and analytics based on the backend contract.
- Plan authoring in the dashboard uses `POST/PATCH/DELETE /api/subscriptions/plans/`; authenticate with an admin/staff account. A smoke test is provided: `ADMIN_ACCESS_TOKEN=... BACKEND_URL=http://localhost:8000 pnpm test:plans`.

## x402 Micropayments

- New dashboard section: visit `/dashboard/micropayments` (linked in the sidebar) to manage every x402 product. Tabs include:
  1. **Pricing rules** — CRUD for `GET/POST/PATCH/DELETE /api/integrations/x402/pricing-rules/`.
  2. **Payment links** — CRUD for `/api/integrations/x402/links/`, real-time revenue totals, and copy-to-clipboard paywall URLs.
  3. **Embedded widgets** — CRUD for `/api/integrations/x402/widgets/`, embed-snippet generation referencing the public paywall endpoint, and revenue split summaries.
  4. **Credit plans** — CRUD for `/api/integrations/x402/credit-plans/`, including pay-to address + platform-fee defaults.
  5. **Payment receipts** — historical list via `/api/integrations/x402/receipts/` with status/path/method filters and totals.
  6. **Credit subscriptions & usage** — combines `/api/integrations/x402/credit-subscriptions/`, consumption (`POST .../consume/`), and `/api/integrations/x402/credit-usage/` with filters for plan, consumer, and usage type.
- Each form surfaces `pay_to_address`, `platform_fee_percent`, success/callback URLs, and optional metadata (JSON). Defaults pull from the tenant wallet where possible; update `hooks/use-django-api.ts` if the backend exposes a dedicated tenant payment profile.
- Revenue widgets compute gross vs merchant vs platform amounts using the `events[]` payloads returned by the backend.
- HTTP 402 responses are intercepted globally through `X402PaywallProvider` (`hooks/use-x402-paywall.tsx`). When a protected call returns `402 Payment Required`, the client:
  1. Reads the `X-402-*` headers from the response.
  2. Displays a payment modal and calls the placeholder `openX402PaymentModal(params)` hook (replace this with the Algorand wallet flow when wiring the real UX).
  3. Retries the original request with `X-402-Receipt: <token>` and, on success, dispatches a `x402:payment-completed` browser event so receipt lists stay up to date.
- Backend checklist:
  - Ensure the Django project exposes the endpoints above under `/api/integrations/x402/` plus the public paywall routes (`/paywall/tenant/{tenantId}/…`).
  - Configure the `X-402-*` headers in 402 responses (PayTo, Amount, Currency, Network, Nonce, optional Callback) to match the wallet integration.
  - Wire the x402 engine to emit revenue summaries: `events[]` on links/widgets and `credit-usage` entries should include `fee_amount` and `merchant_amount` to power the dashboard charts.
  - Populate receipt metadata (e.g. `metadata.expected_receiver`) so the dashboard can surface who should accept each payment.
