import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE = 'fabic_auth'
const AUTH_TOKEN = 'fabic2021_ok'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE)?.value
  const isAuthenticated = token === AUTH_TOKEN

  if (pathname === '/login') {
    if (isAuthenticated) return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|api/auth).*)'],
}
