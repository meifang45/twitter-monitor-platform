import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Dashboard />
      </div>
    </ProtectedRoute>
  )
}
