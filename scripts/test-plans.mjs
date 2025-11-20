#!/usr/bin/env node

/**
 * Smoke test for plan management endpoints.
 *
 * Usage:
 *   ADMIN_ACCESS_TOKEN="…" BACKEND_URL="http://localhost:8000" node scripts/test-plans.mjs
 */

const baseUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000"

const adminToken = process.env.ADMIN_ACCESS_TOKEN

if (!adminToken) {
  console.error("ERROR: ADMIN_ACCESS_TOKEN environment variable is required.")
  process.exit(1)
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${adminToken}`,
}

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options)
  let body = null
  try {
    body = await response.json()
  } catch {
    // ignore body parse errors
  }
  if (!response.ok) {
    const message =
      body?.detail || body?.error || response.statusText || `HTTP ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.body = body
    throw error
  }
  return body
}

const main = async () => {
  const uniqueSuffix = Date.now()
  const planPayload = {
    code: `cli-test-${uniqueSuffix}`,
    name: `CLI Test Plan ${uniqueSuffix}`,
    description: "Temporary plan created by scripts/test-plans.mjs",
    amount: "42.000000",
    currency: "ALGO",
    interval: "month",
    trial_days: 0,
    is_active: true,
    metadata: {
      created_by: "cli-test",
    },
  }

  console.log("Creating plan…")
  const createdPlan = await fetchJson(`${baseUrl}/api/subscriptions/plans/`, {
    method: "POST",
    headers,
    body: JSON.stringify(planPayload),
  })
  console.log(`✓ Created plan ${createdPlan.id}`)

  const updatePayload = {
    description: "Updated description via CLI test",
    amount: "43.000000",
    trial_days: 5,
  }

  console.log("Updating plan…")
  await fetchJson(`${baseUrl}/api/subscriptions/plans/${createdPlan.id}/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(updatePayload),
  })
  console.log("✓ Plan updated")

  console.log("Deleting plan…")
  await fetchJson(`${baseUrl}/api/subscriptions/plans/${createdPlan.id}/`, {
    method: "DELETE",
    headers,
  })
  console.log("✓ Plan deleted")

  console.log("All plan endpoint checks completed successfully.")
}

main().catch((error) => {
  console.error("Plan endpoint test failed:", error.message)
  if (error.body) {
    console.error(JSON.stringify(error.body, null, 2))
  }
  process.exit(error.status || 1)
})
