"use client"

import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from 'next-auth/react'

export default function Header() {
  const { user, isAuthenticated, loading } = useAuth()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <div className="h-6 w-6 rounded bg-primary"></div>
            <span className="hidden font-bold sm:inline-block">
              Twitter Monitor
            </span>
          </Link>
        </div>
        
        {/* Mobile branding */}
        <div className="mr-4 flex md:hidden">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <div className="h-6 w-6 rounded bg-primary"></div>
            <span className="font-bold">TM</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Future search/navigation can go here */}
          </div>
          
          <nav className="flex items-center space-x-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
            ) : isAuthenticated ? (
              <>
                {/* User info */}
                <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                
                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </button>
              </>
            ) : (
              /* Login button for unauthenticated users */
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}