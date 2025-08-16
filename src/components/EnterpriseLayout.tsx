'use client'

import Header from './Header'
import Sidebar from './Sidebar'

interface EnterpriseLayoutProps {
  children: React.ReactNode
}

export default function EnterpriseLayout({ children }: EnterpriseLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}