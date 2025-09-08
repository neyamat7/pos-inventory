import { NextResponse } from 'next/server'

import { auth } from '../auth'

export const config = {
  runtime: 'nodejs',
  matcher: ['/dashboard', '/']
}

export async function middleware(req) {
  console.log('Middleware:', req.nextUrl.pathname)

  const session = await auth()

  console.log('Session:', session)

  // If no session, redirect to login page
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If session exists, allow the request to continue
  return NextResponse.next()
}
