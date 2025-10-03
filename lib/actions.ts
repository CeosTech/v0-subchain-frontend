"use server"

import { revalidatePath } from "next/cache"

export async function createPlan(formData: FormData) {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const planData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      currency: formData.get("currency") as string,
      interval: formData.get("interval") as string,
    }

    // Validate required fields
    if (!planData.name || !planData.amount) {
      return { success: false, error: "Name and amount are required" }
    }

    if (planData.amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" }
    }

    // Simulate random failure for demo
    if (Math.random() < 0.1) {
      return { success: false, error: "Network error occurred" }
    }

    // In a real app, this would make an API call to your backend
    console.log("Creating plan:", planData)

    revalidatePath("/dashboard/plans")
    return { success: true, data: { id: `plan_${Date.now()}`, ...planData } }
  } catch (error) {
    return { success: false, error: "Failed to create plan" }
  }
}

export async function updatePlan(planId: string, formData: FormData) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const planData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      currency: formData.get("currency") as string,
      interval: formData.get("interval") as string,
    }

    if (!planData.name || !planData.amount) {
      return { success: false, error: "Name and amount are required" }
    }

    console.log("Updating plan:", planId, planData)

    revalidatePath("/dashboard/plans")
    return { success: true, data: { id: planId, ...planData } }
  } catch (error) {
    return { success: false, error: "Failed to update plan" }
  }
}

export async function deletePlan(planId: string) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simulate random failure
    if (Math.random() < 0.05) {
      return { success: false, error: "Cannot delete plan with active subscribers" }
    }

    console.log("Deleting plan:", planId)

    revalidatePath("/dashboard/plans")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete plan" }
  }
}

export async function updateSettings(formData: FormData) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const settings = {
      companyName: formData.get("companyName") as string,
      email: formData.get("email") as string,
      website: formData.get("website") as string,
      walletAddress: formData.get("walletAddress") as string,
      notifications: {
        email: formData.get("emailNotifications") === "on",
        webhook: formData.get("webhookNotifications") === "on",
      },
    }

    if (!settings.companyName || !settings.email) {
      return { success: false, error: "Company name and email are required" }
    }

    console.log("Updating settings:", settings)

    revalidatePath("/dashboard/settings")
    return { success: true, data: settings }
  } catch (error) {
    return { success: false, error: "Failed to update settings" }
  }
}

export async function generateApiKey() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const apiKey = `sk_test_${Math.random().toString(36).substr(2, 32)}`

    console.log("Generated API key:", apiKey)

    revalidatePath("/dashboard/settings")
    return { success: true, data: { apiKey } }
  } catch (error) {
    return { success: false, error: "Failed to generate API key" }
  }
}

export async function revokeApiKey(keyId: string) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log("Revoking API key:", keyId)

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to revoke API key" }
  }
}

export async function testWebhook(url: string) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate webhook test
    const testPayload = {
      event: "subscription.created",
      data: {
        id: "sub_test_123",
        plan: "plan_test_456",
        amount: 25.0,
        currency: "ALGO",
      },
    }

    console.log("Testing webhook:", url, testPayload)

    // Simulate random failure
    if (Math.random() < 0.2) {
      return { success: false, error: "Webhook endpoint returned 404" }
    }

    return { success: true, data: { status: 200, response: "OK" } }
  } catch (error) {
    return { success: false, error: "Failed to test webhook" }
  }
}
