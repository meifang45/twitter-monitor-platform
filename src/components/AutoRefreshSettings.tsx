'use client'

import { useState } from 'react'
import { Settings, Play, Pause, RotateCcw } from 'lucide-react'

interface AutoRefreshSettingsProps {
  isEnabled: boolean
  interval: number
  isRefreshing: boolean
  onToggle: (enabled: boolean) => void
  onIntervalChange: (interval: number) => void
  onManualRefresh: () => void
}

// Preset refresh intervals in milliseconds
const REFRESH_INTERVALS = [
  { label: '15 seconds', value: 15000 },
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '2 minutes', value: 120000 },
  { label: '5 minutes', value: 300000 },
] as const

export default function AutoRefreshSettings({
  isEnabled,
  interval,
  isRefreshing,
  onToggle,
  onIntervalChange,
  onManualRefresh
}: AutoRefreshSettingsProps) {
  const [showSettings, setShowSettings] = useState(false)

  const formatInterval = (ms: number) => {
    if (ms < 60000) {
      return `${ms / 1000}s`
    }
    return `${ms / 60000}m`
  }

  const getNextRefreshTime = () => {
    if (!isEnabled || isRefreshing) return null
    
    const now = Date.now()
    const nextRefresh = new Date(now + interval)
    return nextRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="inline-flex items-center space-x-2 px-3 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors touch-manipulation"
        title="Auto-refresh settings"
      >
        <Settings className="h-4 w-4" />
        <span className="hidden md:inline">Auto-refresh</span>
        {isEnabled && (
          <span className="text-xs text-muted-foreground hidden lg:inline">
            ({formatInterval(interval)})
          </span>
        )}
      </button>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Auto-refresh</h3>
              <button
                onClick={() => onToggle(!isEnabled)}
                className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isEnabled
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isEnabled ? (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>On</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    <span>Off</span>
                  </>
                )}
              </button>
            </div>

            {isEnabled && (
              <>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">
                    Refresh interval
                  </label>
                  <div className="space-y-1">
                    {REFRESH_INTERVALS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => onIntervalChange(preset.value)}
                        className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                          interval === preset.value
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {isRefreshing ? (
                    <div className="flex items-center space-x-1">
                      <RotateCcw className="h-3 w-3 animate-spin" />
                      <span>Refreshing...</span>
                    </div>
                  ) : getNextRefreshTime() ? (
                    <span>Next refresh: {getNextRefreshTime()}</span>
                  ) : null}
                </div>
              </>
            )}

            <div className="pt-2 border-t border-border">
              <button
                onClick={() => {
                  onManualRefresh()
                  setShowSettings(false)
                }}
                disabled={isRefreshing}
                className="w-full inline-flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 text-foreground rounded transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}