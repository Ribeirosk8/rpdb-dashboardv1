"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface SimpleArcGISMapProps {
  mapType?: "streets" | "satellite" | "hybrid" | "topo"
  className?: string
}

export function SimpleArcGISMap({ mapType = "streets", className }: SimpleArcGISMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current) return

    let view: any = null

    const initializeMap = async () => {
      try {
        // Import ArcGIS modules
        const esriMap = (await import("@arcgis/core/Map")).default
        const esriMapView = (await import("@arcgis/core/views/MapView")).default

        // Create a new map instance
        const map = new esriMap({
          basemap: mapType,
        })

        // Create the map view
        view = new esriMapView({
          container: mapRef.current,
          map: map,
          center: [-99.9018, 31.9686], // Center of Texas
          zoom: 6,
          ui: {
            components: ["zoom", "compass", "attribution"],
          },
        })

        // Wait for the view to be ready
        await view.when()
        setMapLoaded(true)
      } catch (error) {
        console.error("Error initializing ArcGIS map:", error)
      }
    }

    initializeMap()

    // Clean up
    return () => {
      if (view) {
        view.destroy()
      }
    }
  }, [mapType])

  return (
    <div className={cn("relative w-full h-full", className)}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
