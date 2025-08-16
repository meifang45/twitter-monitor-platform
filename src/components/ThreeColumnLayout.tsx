'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface ColumnProps {
  title?: string
  children: React.ReactNode
  className?: string
  headerActions?: React.ReactNode
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
}

interface ThreeColumnLayoutProps {
  leftColumn: ColumnProps
  centerColumn: ColumnProps  
  rightColumn: ColumnProps
  className?: string
  resizable?: boolean
}

const ResizableColumn = ({ 
  children, 
  title, 
  headerActions, 
  width, 
  minWidth = 250, 
  maxWidth = 600,
  onResize,
  resizable = true,
  className
}: ColumnProps & {
  width: number
  onResize?: (width: number) => void
  resizable?: boolean
}) => {
  const resizeRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!resizable || !onResize) return
    
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = width

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))
      onResize(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [width, minWidth, maxWidth, onResize, resizable])

  return (
    <div 
      className={cn(
        "relative bg-card border border-border rounded-lg shadow-sm flex flex-col",
        className
      )}
      style={{ width: `${width}px`, minWidth: `${minWidth}px`, maxWidth: `${maxWidth}px` }}
    >
      {/* Column Header */}
      {(title || headerActions) && (
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-sm font-semibold text-foreground truncate">
                {title}
              </h3>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      {/* Column Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Resize Handle */}
      {resizable && onResize && (
        <div
          ref={resizeRef}
          className={cn(
            "absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize group",
            "hover:bg-primary/20 transition-colors",
            isResizing && "bg-primary/30"
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-border group-hover:bg-primary/50 rounded transition-colors">
            <GripVertical className="w-3 h-3 text-muted-foreground group-hover:text-primary absolute -left-1 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}
    </div>
  )
}

export default function ThreeColumnLayout({
  leftColumn,
  centerColumn,
  rightColumn,
  className,
  resizable = true
}: ThreeColumnLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(leftColumn.defaultWidth || 350)
  const [rightWidth, setRightWidth] = useState(rightColumn.defaultWidth || 350)

  return (
    <div className={cn(
      "h-full flex gap-4 p-4 overflow-hidden",
      className
    )}>
      {/* Left Column */}
      <ResizableColumn
        {...leftColumn}
        width={leftWidth}
        onResize={resizable ? setLeftWidth : undefined}
        resizable={resizable}
        minWidth={leftColumn.minWidth || 250}
        maxWidth={leftColumn.maxWidth || 500}
      />

      {/* Center Column (flexible) */}
      <div className="flex-1 min-w-0 bg-card border border-border rounded-lg shadow-sm flex flex-col">
        {(centerColumn.title || centerColumn.headerActions) && (
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="min-w-0 flex-1">
              {centerColumn.title && (
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {centerColumn.title}
                </h3>
              )}
            </div>
            {centerColumn.headerActions && (
              <div className="flex items-center space-x-2 flex-shrink-0">
                {centerColumn.headerActions}
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {centerColumn.children}
        </div>
      </div>

      {/* Right Column */}
      <ResizableColumn
        {...rightColumn}
        width={rightWidth}
        onResize={resizable ? setRightWidth : undefined}
        resizable={resizable}
        minWidth={rightColumn.minWidth || 250}
        maxWidth={rightColumn.maxWidth || 500}
      />
    </div>
  )
}