import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/django-api-client'
import { normalizeRegistrationBody, RegistrationValidationError } from '@/lib/register'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const normalized = normalizeRegistrationBody(body)
    const resp = await apiClient.register(
      normalized.email,
      normalized.password,
      normalized.wallet_address,
      normalized.username,
    )
    if (resp.error || !resp.data) {
      return NextResponse.json({ error: resp.error || 'Registration failed' }, { status: resp.status || 500 })
    }
    return NextResponse.json(resp.data, { status: 201 })
  } catch (error) {
    if (error instanceof RegistrationValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 })
  }
}
