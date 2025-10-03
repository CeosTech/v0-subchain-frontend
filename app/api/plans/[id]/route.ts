import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { plansDB } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = plansDB.get(params.id)
  if (!plan || plan.userId !== user.userId) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  return NextResponse.json({ plan })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = plansDB.get(params.id)
  if (!plan || plan.userId !== user.userId) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { name, description, amount, currency, interval, features, status } = body

    // Validation
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (currency && !['ALGO', 'USDC'].includes(currency)) {
      return NextResponse.json(
        { error: 'Currency must be ALGO or USDC' },
        { status: 400 }
      )
    }

    if (interval && !['monthly', 'yearly'].includes(interval)) {
      return NextResponse.json(
        { error: 'Interval must be monthly or yearly' },
        { status: 400 }
      )
    }

    if (status && !['active', 'inactive', 'draft'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be active, inactive, or draft' },
        { status: 400 }
      )
    }

    const updatedPlan = {
      ...plan,
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(currency !== undefined && { currency }),
      ...(interval !== undefined && { interval }),
      ...(features !== undefined && { features }),
      ...(status !== undefined && { status }),
      updatedAt: new Date()
    }

    plansDB.set(params.id, updatedPlan)

    return NextResponse.json({ plan: updatedPlan })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = plansDB.get(params.id)
  if (!plan || plan.userId !== user.userId) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  // Vérifier s'il y a des abonnés actifs
  if (plan.subscriberCount > 0) {
    return NextResponse.json(
      { error: 'Cannot delete plan with active subscribers' },
      { status: 400 }
    )
  }

  plansDB.delete(params.id)

  return NextResponse.json({ message: 'Plan deleted successfully' })
}
