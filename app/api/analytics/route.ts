import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { plansDB, subscribersDB, paymentsDB, calculateMRR, calculateChurnRate } from '@/lib/models'

export async function GET(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '30d'

  // Récupérer les plans de l'utilisateur
  const userPlans = Array.from(plansDB.values()).filter(plan => plan.userId === user.userId)
  const userPlanIds = new Set(userPlans.map(plan => plan.id))

  // Récupérer les abonnés pour ces plans
  const userSubscribers = Array.from(subscribersDB.values()).filter(
    subscriber => userPlanIds.has(subscriber.planId)
  )

  // Récupérer les paiements
  const userPayments = Array.from(paymentsDB.values()).filter(
    payment => userPlanIds.has(payment.planId)
  )

  // Calculer les métriques
  const totalSubscribers = userSubscribers.length
  const activeSubscribers = userSubscribers.filter(s => s.status === 'active').length
  const cancelledSubscribers = userSubscribers.filter(s => s.status === 'cancelled').length
  const pausedSubscribers = userSubscribers.filter(s => s.status === 'paused').length

  const mrr = calculateMRR(userSubscribers, userPlans)
  const arr = mrr * 12
  const churnRate = calculateChurnRate(userSubscribers, 'monthly')

  const totalRevenue = userPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const averageRevenuePerUser = activeSubscribers > 0 ? totalRevenue / activeSubscribers : 0

  // Données pour les graphiques (simulées)
  const chartData = generateChartData(period, userSubscribers, userPayments)

  return NextResponse.json({
    overview: {
      totalSubscribers,
      activeSubscribers,
      cancelledSubscribers,
      pausedSubscribers,
      mrr,
      arr,
      churnRate,
      totalRevenue,
      averageRevenuePerUser
    },
    charts: chartData,
    plans: userPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      subscriberCount: plan.subscriberCount,
      revenue: plan.totalRevenue,
      amount: plan.amount,
      currency: plan.currency
    }))
  })
}

function generateChartData(period: string, subscribers: any[], payments: any[]) {
  const now = new Date()
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  
  const chartData = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const dateStr = date.toISOString().split('T')[0]
    
    // Simuler des données réalistes
    const baseSubscribers = Math.max(0, subscribers.length - (days - i) * 2)
    const dailyRevenue = Math.random() * 1000 + 500
    const newSubscribers = Math.floor(Math.random() * 10) + 1
    
    chartData.push({
      date: dateStr,
      subscribers: baseSubscribers + Math.floor(Math.random() * 50),
      revenue: dailyRevenue,
      newSubscribers,
      churn: Math.random() * 5
    })
  }
  
  return chartData
}
