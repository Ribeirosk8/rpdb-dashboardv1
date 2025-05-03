"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface LegendItem {
  color: string
  label: string
}

interface LocalMapLegendProps {
  title?: string
  items: LegendItem[]
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function LocalMapLegend({
  title = "Map Legend",
  items,
  className,
  collapsible = true,
  defaultCollapsed = false,
}: LocalMapLegendProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

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
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand legend" : "Collapse legend"}
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {!collapsed && (
          <div className="mt-2 space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
