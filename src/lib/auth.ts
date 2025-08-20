// src/lib/auth.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from '@/lib/db'

// Define the providers array
const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
]

// In development, add a credentials provider for easy login
if (process.env.APP_ENV === 'development') {
  providers.push(
    CredentialsProvider({
      name: 'Development Login',
      credentials: {},
      async authorize(credentials) {
        // This is where you create or find a mock user.
        // You can customize this user's details for testing.
        const testUser = {
          id: 'test-user-123',
          name: 'Test User',
          email: 'test@aischool.com',
          image: 'https://placehold.co/100x100/EBF5FF/7F9CF5?text=Test',
        }
        console.log('✅ Logged in as Test User in development mode.')
        return testUser
      },
    })
  )
}

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: providers, // Use the dynamically created providers array
  session: {
    strategy: 'jwt',
  },
  pages: {
    // If in development, point to our new dev sign-in page
    signIn: process.env.APP_ENV === 'development' ? '/auth/dev-signin' : '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
