import EnterpriseLayout from '@/components/EnterpriseLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Settings, User, Bell, Shield, Database, Globe } from 'lucide-react'

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          {/* Profile Settings */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input 
                    type="text" 
                    defaultValue="Admin User"
                    className="w-full p-2 border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    defaultValue="admin@twittermonitor.com"
                    className="w-full p-2 border border-border rounded-md bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { title: 'Email Notifications', description: 'Receive email alerts for important events' },
                { title: 'Real-time Updates', description: 'Get instant notifications for new tweets' },
                { title: 'Weekly Reports', description: 'Receive weekly summary reports' },
                { title: 'System Alerts', description: 'Get notified about system status changes' }
              ].map((setting) => (
                <div key={setting.title} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h3 className="font-medium">{setting.title}</h3>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Change Password</h3>
                <div className="space-y-3">
                  <input 
                    type="password" 
                    placeholder="Current password"
                    className="w-full p-2 border border-border rounded-md bg-background"
                  />
                  <input 
                    type="password" 
                    placeholder="New password"
                    className="w-full p-2 border border-border rounded-md bg-background"
                  />
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>API Configuration</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rate Limit (requests/hour)</label>
                <input 
                  type="number" 
                  defaultValue="900"
                  className="w-full p-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Auto-refresh Interval (seconds)</label>
                <select className="w-full p-2 border border-border rounded-md bg-background">
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="600">10 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* System Preferences */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Preferences</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select className="w-full p-2 border border-border rounded-md bg-background">
                    <option>System Default</option>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select className="w-full p-2 border border-border rounded-md bg-background">
                    <option>UTC</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                    <option>Asia/Tokyo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Save Settings
            </button>
          </div>
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  )
}