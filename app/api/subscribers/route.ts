import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { subscribersDB, plansDB, generateId, type Subscriber } from '@/lib/models'

export async function GET(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Récupérer les plans de l'utilisateur
  const userPlans = Array.from(plansDB.values()).filter(plan => plan.userId === user.userId)
  const userPlanIds = new Set(userPlans.map(plan => plan.id))

  // Récupérer les abonnés pour ces plans
  const userSubscribers = Array.from(subscribersDB.values()).filter(
    subscriber => userPlanIds.has(subscriber.planId)
  )

  // Ajouter les informations du plan à chaque abonné
  const subscribersWithPlans = userSubscribers.map(subscriber => {
    const plan = plansDB.get(subscriber.planId)
    return {
      ...subscriber,
      plan: plan ? {
        id: plan.id,
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        interval: plan.interval
      } : null
    }
  })

  return NextResponse.json({
    subscribers: subscribersWithPlans,
    total: subscribersWithPlans.length,
    stats: {
      active: subscribersWithPlans.filter(s => s.status === 'active').length,
      cancelled: subscribersWithPlans.filter(s => s.status === 'cancelled').length,
      paused: subscribersWithPlans.filter(s => s.status === 'paused').length,
      past_due: subscribersWithPlans.filter(s => s.status === 'past_due').length
    }
  })
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { planId, walletAddress, email } = body

    if (!planId || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, walletAddress' },
        { status: 400 }
      )
    }

    // Vérifier que le plan appartient à l'utilisateur
    const plan = plansDB.get(planId)
    if (!plan || plan.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Vérifier si l'abonné existe déjà pour ce plan
    const existingSubscriber = Array.from(subscribersDB.values()).find(
      sub => sub.planId === planId && sub.walletAddress === walletAddress
    )

    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Subscriber already exists for this plan' },
        { status: 409 }
      )
    }

    const now = new Date()
    const nextPaymentDate = new Date(now)
    if (plan.interval === 'monthly') {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
    } else {
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1)
    }

    const subscriber: Subscriber = {
      id: generateId('sub'),
      planId,
      walletAddress,
      email,
      status: 'active',
      startDate: now,
      nextPaymentDate,
      lastPaymentDate: now,
      totalPaid: plan.amount,
      paymentMethod: 'algorand_wallet',
      createdAt: now,
      updatedAt: now
    }

    subscribersDB.set(subscriber.id, subscriber)

    // Mettre à jour les statistiques du plan
    plan.subscriberCount += 1
    plan.totalRevenue += plan.amount
    plan.updatedAt = now
    plansDB.set(planId, plan)

    return NextResponse.json({ subscriber }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }
}
