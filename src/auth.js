import { MongoDBAdapter } from '@auth/mongodb-adapter'

import NextAuth from 'next-auth'

import CredentialsProvider from 'next-auth/providers/credentials'

import GoogleProvider from 'next-auth/providers/google'

import clientPromise from './libs/mongoClientPromise'
import { userModel } from './models/user-model'

import { connectToMongoDB } from './libs/mongo'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  sessions: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        if (credentials === null) return null

        console.log('credentials login, line 33 in auth.js', credentials)

        await connectToMongoDB()

        try {
          const user = await userModel.findOne({ email: credentials.email })

          if (user) {
            const isMatch = user?.password === credentials.password

            if (isMatch) {
              return { id: user.id, email: user.email }
            } else {
              throw new Error('Invalid credentials')
            }
          } else {
            throw new Error('Userrrr not found')
          }
        } catch (error) {
          console.log(error)
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    // Called when JWT is created, adds user info to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }

      return token
    },

    // Called whenever the session is fetched
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
      }

      return session
    }
  }
})
