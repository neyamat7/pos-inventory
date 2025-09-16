import { NextResponse } from 'next/server'

import { authEdge } from './auth-edge'

// This runs on the Edge runtime
export default authEdge(req => {
  // req.auth exists if a valid NextAuth JWT was found & verified
  if (!req.auth) {
    const url = new URL('/login', req.nextUrl)

    url.searchParams.set('redirect', req.nextUrl.pathname)

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/', '/dashboard']
}
