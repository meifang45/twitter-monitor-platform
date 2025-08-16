"use client"

import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from 'next-auth/react'

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Dashboard'
    case '/users':
      return 'User Monitoring'
    case '/keywords':
      return 'Keyword Monitoring'
    case '/analytics':
      return 'Analytics'
    case '/ai-tools':
      return 'AI Tools'
    case '/console':
      return 'Twitter Console'
    case '/settings':
      return 'Settings'
    default:
      return 'Dashboard'
  }
}

export default function Header() {
  const { user, isAuthenticated, loading } = useAuth()
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Page Title - dynamic based on current route */}
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold text-foreground">
            {getPageTitle(pathname)}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </header>
  )
}