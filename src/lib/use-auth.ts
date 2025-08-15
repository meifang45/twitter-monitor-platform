"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("Invalid credentials")
      }

      if (result?.ok) {
        // Force session update
        await update()
        router.push("/")
        router.refresh()
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Login failed" 
      }
    }
  }

  const logout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut({ redirect: false })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === "loading" || isLoggingOut,
    login,
    logout,
    update,
  }
}