import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  const payload = sessionCookie ? await decrypt(sessionCookie) : null

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')

  if (isAuthPage && payload) {
    return NextResponse.redirect(new URL(payload.role === 'ADMIN' ? '/admin' : '/', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/bookings')) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/bookings/:path*', '/login', '/register'],
}
