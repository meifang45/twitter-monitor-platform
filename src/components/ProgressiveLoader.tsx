'use client'

import { RefreshCw } from 'lucide-react'

interface ProgressiveLoaderProps {
  message?: string
  progress?: number
  className?: string
}

export default function ProgressiveLoader({ 
  message = "Loading...", 
  progress, 
  className = "" 
}: ProgressiveLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div className="relative mb-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      
      {progress !== undefined && (
        <div className="w-48 bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Pulsing dots loader for inline use
export function PulsingDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

// Shimmer effect for loading content areas
export function ShimmerBox({ 
  width = "100%", 
  height = "1rem", 
  className = "" 
}: { 
  width?: string | number; 
  height?: string | number; 
  className?: string 
}) {
  return (
    <div 
      className={`bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-pulse rounded ${className}`}
      style={{ width, height }}
    />
  )
}