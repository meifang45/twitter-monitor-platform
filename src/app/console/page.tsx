import EnterpriseLayout from '@/components/EnterpriseLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Monitor, Activity, Server, Wifi, AlertCircle, CheckCircle } from 'lucide-react'

export default function ConsolePage() {
  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="p-6 space-y-6">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-green-500" />
                  <span className="font-medium">API Status</span>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">Online</p>
              <p className="text-xs text-muted-foreground">Last checked: 2 mins ago</p>
            </div>
            
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Rate Limit</span>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">847/900</p>
              <p className="text-xs text-muted-foreground">Requests remaining</p>
            </div>
            
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Network</span>
                </div>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-600 mt-2">89ms</p>
              <p className="text-xs text-muted-foreground">Average latency</p>
            </div>
          </div>

          {/* Console Interface */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Twitter Console</span>
              </h2>
            </div>
            
            <div className="p-4">
              <div className="text-center text-muted-foreground py-12">
                <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Advanced Console</h3>
                <p className="text-sm max-w-md mx-auto">
                  Real-time monitoring, system logs, and advanced debugging tools will be available here.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium">Recent Activity</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2 text-sm">
                {[
                  { time: '14:32', event: 'API rate limit reset', status: 'success' },
                  { time: '14:31', event: 'User @elonmusk tweets fetched', status: 'success' },
                  { time: '14:30', event: 'Auto-refresh triggered', status: 'info' },
                  { time: '14:28', event: 'New user added: @sundarpichai', status: 'success' },
                  { time: '14:25', event: 'Network latency spike detected', status: 'warning' }
                ].map((log, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                    <span className="text-xs text-muted-foreground font-mono">{log.time}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-green-500' :
                      log.status === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="flex-1">{log.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  )
}