"use client"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { LegendItem } from "@/components/map-legend"

interface MapLegendMobileProps {
  items?: LegendItem[]
  sections?: {
    title: string
    items: LegendItem[]
  }[]
  className?: string
}

export function MapLegendMobile({ items = [], sections = [], className }: MapLegendMobileProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="secondary" size="sm" className="shadow-md">
            <Info className="h-4 w-4 mr-2" />
            Map Legend
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Map Legend</SheetTitle>
            <SheetDescription>Understanding the map symbols</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Render items if provided */}
            {items.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold border-b pb-1">Legend</h4>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="rounded-full border flex-shrink-0"
                        style={{
                          backgroundColor: item.color,
                          width: 16,
                          height: 16,
                          borderColor: "white",
                          borderWidth: 1,
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">{item.label || item.name}</p>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Render sections if provided */}
            {sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h4 className="text-sm font-semibold border-b pb-1">{section.title}</h4>
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3">
                      <div
                        className="rounded-full border flex-shrink-0"
                        style={{
                          backgroundColor: item.color,
                          width: 16,
                          height: 16,
                          borderColor: "white",
                          borderWidth: 1,
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">{item.label || item.name}</p>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
