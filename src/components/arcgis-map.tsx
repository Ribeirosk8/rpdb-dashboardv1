"use client"

import { useEffect, useRef, useState } from "react"
import type { MapPoint } from "@/lib/arcgis-utils"
import { cn } from "@/lib/utils"

interface ArcGISMapProps {
  mapPoints?: MapPoint[]
  showReferenceMarkers?: boolean
  showPMISPoints?: boolean
  mapType?: "streets" | "satellite" | "hybrid" | "topo"
  onPointClick?: (point: MapPoint) => void
  className?: string
}

export function ArcGISMap({
  mapPoints = [],
  showReferenceMarkers = false,
  showPMISPoints = false,
  mapType = "streets",
  onPointClick,
  className,
}: ArcGISMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapViewRef = useRef<any>(null)
  const graphicsLayerRef = useRef<any>(null)

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current) return

    let view: any = null

    const initializeMap = async () => {
      try {
        // Import ArcGIS modules
        const esriMap = (await import("@arcgis/core/Map")).default
        const esriMapView = (await import("@arcgis/core/views/MapView")).default
        const esriGraphicsLayer = (await import("@arcgis/core/layers/GraphicsLayer")).default

        // Create a new map instance
        const map = new esriMap({
          basemap: mapType,
        })

        // Create a graphics layer for points
        const graphicsLayer = new esriGraphicsLayer()
        map.add(graphicsLayer)
        graphicsLayerRef.current = graphicsLayer

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

        // Store the view reference
        mapViewRef.current = view

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
        mapViewRef.current = null
        graphicsLayerRef.current = null
      }
    }
  }, [mapType]) // Re-initialize when mapType changes

  // Add points to the map
  useEffect(() => {
    if (!mapViewRef.current || !graphicsLayerRef.current || !mapLoaded) return

    const addPointsToMap = async () => {
      try {
        // Import required modules
        const esriPoint = (await import("@arcgis/core/geometry/Point")).default
        const esriGraphic = (await import("@arcgis/core/Graphic")).default
        const esriSimpleMarkerSymbol = (await import("@arcgis/core/symbols/SimpleMarkerSymbol")).default
        const esriPopupTemplate = (await import("@arcgis/core/PopupTemplate")).default

        // Clear existing graphics
        graphicsLayerRef.current.removeAll()

        // Add map points
        mapPoints.forEach((point) => {
          // Skip reference markers and PMIS points if not enabled
          if (point.type === "reference" && !showReferenceMarkers) return
          if (point.type === "pmis" && !showPMISPoints) return

          // Create a point geometry
          const pointGeometry = new esriPoint({
            longitude: point.longitude,
            latitude: point.latitude,
          })

          // Define symbol based on point type
          let symbol
          let popupTemplate

          switch (point.type) {
            case "pavement":
              symbol = new esriSimpleMarkerSymbol({
                color: point.attributes.pavementType === "CRCP" ? [16, 185, 129] : [59, 130, 246], // green-500 or blue-500
                size: 10,
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              })
              popupTemplate = new esriPopupTemplate({
                title: `${point.attributes.highway} - ${point.id}`,
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      { fieldName: "district", label: "District" },
                      { fieldName: "county", label: "County" },
                      { fieldName: "pavementType", label: "Pavement Type" },
                      { fieldName: "slabThickness", label: "Slab Thickness (in)" },
                      { fieldName: "constructionYear", label: "Construction Year" },
                    ],
                  },
                ],
              })
              break
            case "reference":
              symbol = new esriSimpleMarkerSymbol({
                color: [0, 0, 0], // black
                size: 6,
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              })
              popupTemplate = new esriPopupTemplate({
                title: `Reference Marker ${point.attributes.markerNumber}`,
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      { fieldName: "highway", label: "Highway" },
                      { fieldName: "markerNumber", label: "Marker Number" },
                      { fieldName: "displacement", label: "Displacement" },
                    ],
                  },
                ],
              })
              break
            case "pmis":
              symbol = new esriSimpleMarkerSymbol({
                color: [249, 115, 22], // orange-500
                size: 8,
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              })
              popupTemplate = new esriPopupTemplate({
                title: `PMIS Data Point - ${point.attributes.highway}`,
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      { fieldName: "conditionScore", label: "Condition Score" },
                      { fieldName: "distressScore", label: "Distress Score" },
                      { fieldName: "rideScore", label: "Ride Score" },
                      { fieldName: "year", label: "Year" },
                    ],
                  },
                ],
              })
              break
            case "traffic":
              symbol = new esriSimpleMarkerSymbol({
                color: [239, 68, 68], // red-500
                size: 10,
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              })
              popupTemplate = new esriPopupTemplate({
                title: `Traffic Data - ${point.attributes.highway}`,
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      { fieldName: "location", label: "Location" },
                      { fieldName: "aadt", label: "AADT" },
                      { fieldName: "truckPercentage", label: "Truck Percentage" },
                      { fieldName: "growthRate", label: "Growth Rate (%)" },
                    ],
                  },
                ],
              })
              break
          }

          // Create a graphic
          const graphic = new esriGraphic({
            geometry: pointGeometry,
            symbol: symbol,
            attributes: {
              id: point.id,
              ...point.attributes,
            },
            popupTemplate: popupTemplate,
          })

          // Add the graphic to the layer
          graphicsLayerRef.current.add(graphic)
        })

        // Set up click event handler
        if (onPointClick && mapViewRef.current) {
          // Remove any existing click handlers
          if (mapViewRef.current._clickHandler) {
            mapViewRef.current.off("click", mapViewRef.current._clickHandler)
          }

          // Create a new click handler
          const clickHandler = async (event: any) => {
            // Get the graphic at the clicked location
            const response = await mapViewRef.current.hitTest(event)
            if (response.results.length) {
              const graphic = response.results[0].graphic
              if (graphic && graphic.attributes) {
                // Find the original point data
                const clickedPoint = mapPoints.find((p) => p.id === graphic.attributes.id)
                if (clickedPoint) {
                  onPointClick(clickedPoint)
                }
              }
            }
          }

          // Store the click handler reference
          mapViewRef.current._clickHandler = clickHandler

          // Add the click handler
          mapViewRef.current.on("click", clickHandler)
        }
      } catch (error) {
        console.error("Error adding points to map:", error)
      }
    }

    addPointsToMap()
  }, [mapPoints, showReferenceMarkers, showPMISPoints, mapLoaded, onPointClick])

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
