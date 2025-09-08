import { NextResponse } from 'next/server'

import { auth } from '@/auth'


export async function authMiddleware(req) {
  const session = await auth()

  console.log(session)

  // If there is no session, redirect to the login page
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If session exists, allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard']
}
