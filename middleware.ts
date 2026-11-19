import { NextRequest, NextResponse } from 'next/server'

// Seed is a development/admin tool, never a public route.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/seed') && !request.cookies.get('yt2_session')?.value) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/seed/:path*'],
}
