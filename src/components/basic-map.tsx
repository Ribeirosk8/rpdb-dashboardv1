"use client"

import { useEffect, useRef } from "react"
import { loadModules } from "@/lib/arcgis-loader"

interface BasicMapProps {
  mapType?: string
}

export function BasicMap({ mapType = "streets-vector" }: BasicMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Don't try to create a map if the ref isn't available
    if (!mapRef.current) return

    // Create a cleanup variable
    let cleanup: (() => void) | null = null

    // Load and initialize the map
    const initializeMap = async () => {
      try {
        // Load the required modules
        const [Map, MapView] = await loadModules(["esri/Map", "esri/views/MapView"])

        // Create the map
        const map = new Map({
          basemap: mapType,
        })

        // Create the view
        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-99.9018, 31.9686], // Center of Texas
          zoom: 6,
        })

        // Set up cleanup function
        cleanup = () => {
          if (view) {
            view.destroy()
          }
        }
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initializeMap()

    // Clean up when the component unmounts
    return () => {
      if (cleanup) cleanup()
    }
  }, [mapType])

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
}
