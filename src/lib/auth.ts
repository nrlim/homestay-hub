import 'server-only'
import { getSession } from './session'
import prisma from './prisma'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })
    return user
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') {
    redirect('/')
  }
  return session
}
