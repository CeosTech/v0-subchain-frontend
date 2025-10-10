import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/django-api-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, walletAddress } = body
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    const resp = await apiClient.register(email, password, username, walletAddress)
    if (resp.error || !resp.data) {
      return NextResponse.json({ error: resp.error || 'Registration failed' }, { status: resp.status || 500 })
    }
    return NextResponse.json(resp.data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }
}
