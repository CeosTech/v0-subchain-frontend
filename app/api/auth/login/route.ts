import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, generateToken, updateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, walletAddress } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    let user = getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Mettre à jour l'adresse wallet si fournie
    if (walletAddress && walletAddress !== user.walletAddress) {
      user = updateUser(user.id, { 
        walletAddress, 
        lastLogin: new Date() 
      })!
    } else {
      user = updateUser(user.id, { lastLogin: new Date() })!
    }

    const token = generateToken(user)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        plan: user.plan,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      token
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }
}
