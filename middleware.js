// src/middleware.js
import { NextResponse } from 'next/server'

import { auth } from './src/auth' // Adjust this path if necessary

// Ensure the middleware is using Node.js runtime
export const config = {
  runtime: 'nodejs', // Force Node.js runtime instead of Edge runtime
  matcher: ['/dashboard', '/'] // Protect these routes
}

export async function middleware(req) {
  const session = await auth()

  console.log('Session:', session)

  // If no session, redirect to login page
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If session exists, allow the request to continue
  return NextResponse.next()
}
