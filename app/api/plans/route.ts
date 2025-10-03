import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { plansDB, generateId, type SubscriptionPlan } from '@/lib/models'

export async function GET(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userPlans = Array.from(plansDB.values()).filter(plan => plan.userId === user.userId)
  
  return NextResponse.json({
    plans: userPlans,
    total: userPlans.length
  })
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, amount, currency, interval, features } = body

    // Validation
    if (!name || !amount || !currency || !interval) {
      return NextResponse.json(
        { error: 'Missing required fields: name, amount, currency, interval' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (!['ALGO', 'USDC'].includes(currency)) {
      return NextResponse.json(
        { error: 'Currency must be ALGO or USDC' },
        { status: 400 }
      )
    }

    if (!['monthly', 'yearly'].includes(interval)) {
      return NextResponse.json(
        { error: 'Interval must be monthly or yearly' },
        { status: 400 }
      )
    }

    const plan: SubscriptionPlan = {
      id: generateId('plan'),
      userId: user.userId,
      name,
      description: description || '',
      amount: parseFloat(amount),
      currency,
      interval,
      features: features || [],
      status: 'active',
      subscriberCount: 0,
      totalRevenue: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    plansDB.set(plan.id, plan)

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }
}
