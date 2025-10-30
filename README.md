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
