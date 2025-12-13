import { MongoDBAdapter } from '@auth/mongodb-adapter'

import NextAuth from 'next-auth'

import CredentialsProvider from 'next-auth/providers/credentials'

import GoogleProvider from 'next-auth/providers/google'

import jwt from 'jsonwebtoken'

import bcrypt from 'bcryptjs'

import clientPromise from './libs/mongoClientPromise'
import { userModel } from './models/user-model'

import { connectToMongoDB } from './libs/mongo'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DATABASE_NAME
  }),
  session: {
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

        await connectToMongoDB()

        try {
          const user = await userModel.findOne({ email: credentials.email })

          if (user) {
            const isMatch = await bcrypt.compare(credentials.password, user.password)

            if (isMatch) {
              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                image: user.image,
                role: user.role
              }
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
        token.name = user.name
        token.image = user.image
        token.role = user.role
      }

      return token
    },

    // Called whenever the session is fetched
    async session({ session, token }) {
      // console.log('token in session', token);

      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          image: token.image,
          role: token.role
        }
        session.accessToken = jwt.sign({ id: token.id, email: token.email }, process.env.AUTH_SECRET, {
          expiresIn: '7d'
        })
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`
    }
  },
  secret: process.env.AUTH_SECRET
})
