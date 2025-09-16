import NextAuth from 'next-auth'

export const { auth: authEdge } = NextAuth({
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET
})
