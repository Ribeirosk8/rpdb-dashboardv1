"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

export interface LegendItem {
  color: string
  name?: string
  label?: string
  description?: string
  count?: number
  size?: number
  borderColor?: string
}

export interface MapLegendProps {
  title?: string
  items?: LegendItem[]
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  sections?: {
    title: string
    items: LegendItem[]
  }[]
}

export function MapLegend({
  title = "Map Legend",
  items = [],
  sections = [],
  className,
  collapsible = true,
  defaultCollapsed = false,
}: MapLegendProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  return (
    <Card className={cn("w-full shadow-md", className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand legend" : "Collapse legend"}
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {!collapsed && (
          <div className="mt-2 space-y-2">
            {/* Render items if provided */}
            {items.length > 0 &&
              items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-xs">{item.label || item.name}</span>
                  {item.count !== undefined && (
                    <span className="ml-auto text-xs text-muted-foreground">{item.count}</span>
                  )}
                </div>
              ))}

            {/* Render sections if provided */}
            {sections.length > 0 &&
              sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground border-b pb-1">{section.title}</h4>
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-xs">{item.label || item.name}</span>
                        {item.count !== undefined && (
                          <span className="ml-auto text-xs text-muted-foreground">{item.count}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
