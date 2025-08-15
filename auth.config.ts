import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// This is a simple in-memory user store for demo purposes
// In a real application, this would be replaced with a database
const users = [
  {
    id: "1",
    email: "admin@twittermonitor.com",
    password: "admin123", // Plain text for demo - use bcrypt in real apps
    name: "Admin User"
  }
]

export default {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = users.find(user => user.email === credentials.email)
        
        if (!user) {
          return null
        }

        const isPasswordValid = credentials.password === user.password

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
} satisfies NextAuthConfig