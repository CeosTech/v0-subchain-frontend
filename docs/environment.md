# Environment Variable Retrieval Guide

Use this guide to gather every value referenced in `.env.example` and configure your local `.env.local` or the Vercel project settings.

## 1. Backend URLs (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_PAYWALL_URL`)
1. Sign in to your Render dashboard and open the Subchain backend service.
2. Copy the live domain shown under “Public URL” (e.g. `https://subchain-backend.onrender.com`).
3. Set the variables as follows:
   - `NEXT_PUBLIC_API_URL` → `<public-url>/api` (append `/api`).
   - `NEXT_PUBLIC_BACKEND_URL` → `<public-url>` (no trailing slash).
   - `NEXT_PUBLIC_PAYWALL_URL` → `<public-url>` (this is used to generate `/paywall/tenant/...` routes).
4. Paste these values both in `.env.local` (for local dev) and in Vercel → Project Settings → Environment Variables.

## 2. Authentication Secrets (`JWT_SECRET`, `WEBHOOK_SECRET`)
1. Stay inside the Render backend service and open the “Environment” tab.
2. Locate the variables used by Django:
   - `JWT_SECRET` (or whichever key you set in Render for JWT signing).
   - `WEBHOOK_SECRET` (the shared secret used to verify webhook signatures).
3. Copy each value verbatim into your `.env.local` and into the Vercel dashboard (mark them as “Encrypted / Internal” so they never leak to the browser).
4. If these variables are not present in Render yet, add them there first; Django must read the same secrets the frontend uses.

## 3. Test Utilities (`BACKEND_URL`, `ADMIN_ACCESS_TOKEN`)
These are optional and only used by `scripts/test-plans.mjs`.
1. `BACKEND_URL` → use your local Django instance (default `http://localhost:8000`). Update it if your backend runs on another host/port.
2. `ADMIN_ACCESS_TOKEN` → generate an admin JWT or token via the backend (`/api/auth/token/`) and paste it here so the script can authenticate when running plan smoke tests.
3. Keep these variables in `.env.local`; do not add them to Vercel unless you intend to run the test script in the hosted environment.

## 4. Applying Changes
1. Copy `.env.example` to `.env.local` if you have not already:
   ```sh
   cp .env.example .env.local
   ```
2. Fill in each placeholder with the values collected above.
3. Restart the Next.js dev server (`pnpm dev`) so it reloads the environment.
4. For Vercel, add/edit the same variables in the dashboard and trigger a redeploy so the new configuration is applied online.
