'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Search, 
  Monitor, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Twitter,
  TrendingUp,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and metrics'
  },
  {
    title: 'User Monitoring',
    href: '/users',
    icon: Users,
    description: 'Monitor specific accounts'
  },
  {
    title: 'Keyword Monitoring',
    href: '/keywords', 
    icon: Search,
    description: 'Track keywords and hashtags'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Data analysis and insights'
  },
  {
    title: 'AI Tools',
    href: '/ai-tools',
    icon: Zap,
    description: 'AI-powered content tools'
  },
  {
    title: 'Twitter Console',
    href: '/console',
    icon: Monitor,
    description: 'Advanced monitoring tools'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Platform configuration'
  }
]

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn(
      "relative bg-card border-r border-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={cn(
          "flex items-center space-x-2 transition-opacity duration-200",
          isCollapsed && "opacity-0"
        )}>
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <Twitter className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Twitter Monitor</span>
            <span className="text-xs text-muted-foreground">Enterprise Platform</span>
          </div>
        </div>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className={cn(
                "h-4 w-4 flex-shrink-0",
                isActive ? "text-primary-foreground" : "text-current"
              )} />
              
              <div className={cn(
                "flex flex-col min-w-0 transition-opacity duration-200",
                isCollapsed && "opacity-0 absolute left-full ml-2 invisible"
              )}>
                <span className="truncate">{item.title}</span>
                {item.description && !isCollapsed && (
                  <span className="text-xs text-muted-foreground/70 truncate">
                    {item.description}
                  </span>
                )}
              </div>

              {item.badge && !isCollapsed && (
                <span className="ml-auto bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.title}
                  {item.description && (
                    <>
                      <br />
                      <span className="text-muted-foreground">{item.description}</span>
                    </>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          "flex items-center space-x-2 text-xs text-muted-foreground transition-opacity duration-200",
          isCollapsed && "opacity-0"
        )}>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>System Online</span>
        </div>
      </div>
    </div>
  )
}