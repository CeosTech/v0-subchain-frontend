import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface User {
  id: string
  email: string
  walletAddress?: string
  plan: 'starter' | 'pro' | 'enterprise'
  createdAt: Date
  lastLogin?: Date
}

export interface AuthToken {
  userId: string
  email: string
  plan: string
  iat: number
  exp: number
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      plan: user.plan
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken
  } catch {
    return null
  }
}

export function getAuthUser(request: NextRequest): AuthToken | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  return verifyToken(token)
}

// Simuler une base de données utilisateurs
const users: Map<string, User> = new Map()

export function createUser(email: string, walletAddress?: string): User {
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    walletAddress,
    plan: 'starter',
    createdAt: new Date()
  }
  users.set(user.id, user)
  return user
}

export function getUserById(id: string): User | null {
  return users.get(id) || null
}

export function getUserByEmail(email: string): User | null {
  for (const user of users.values()) {
    if (user.email === email) {
      return user
    }
  }
  return null
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const user = users.get(id)
  if (!user) return null
  
  const updatedUser = { ...user, ...updates }
  users.set(id, updatedUser)
  return updatedUser
}
