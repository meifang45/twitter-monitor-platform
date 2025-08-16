import Dashboard from '@/components/Dashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import EnterpriseLayout from '@/components/EnterpriseLayout'

export default function Home() {
  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <Dashboard />
      </EnterpriseLayout>
    </ProtectedRoute>
  )
}
