"use client"

import { useEffect, useRef, useState } from "react"
import { loadModules } from "@/lib/arcgis-loader"
import type { MapPoint } from "@/lib/arcgis-utils"

interface AdvancedMapProps {
  mapType?: string
  mapPoints?: MapPoint[]
  showReferenceMarkers?: boolean
  showPMISPoints?: boolean
  onPointClick?: (point: MapPoint) => void
}

export function AdvancedMap({
  mapType = "streets-vector",
  mapPoints = [],
  showReferenceMarkers = false,
  showPMISPoints = false,
  onPointClick,
}: AdvancedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const viewRef = useRef<any>(null)
  const graphicsLayerRef = useRef<any>(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    let view: any = null
    let graphicsLayer: any = null

    const initializeMap = async () => {
      try {
        // Load the required modules
        const [Map, MapView, GraphicsLayer] = await loadModules([
          "esri/Map",
          "esri/views/MapView",
          "esri/layers/GraphicsLayer",
        ])

        // Create the map
        const map = new Map({
          basemap: mapType,
        })

        // Create a graphics layer
        graphicsLayer = new GraphicsLayer()
        map.add(graphicsLayer)
        graphicsLayerRef.current = graphicsLayer

        // Create the view
        view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-99.9018, 31.9686], // Center of Texas
          zoom: 6,
        })

        // Store the view reference
        viewRef.current = view

        // Wait for the view to be ready
        await view.when()
        setMapLoaded(true)
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initializeMap()

    // Clean up
    return () => {
      if (view) {
        view.destroy()
        viewRef.current = null
        graphicsLayerRef.current = null
      }
    }
  }, [mapType])

  // Update points when they change
  useEffect(() => {
    if (!mapLoaded || !graphicsLayerRef.current) return

    const addPointsToMap = async () => {
      try {
        // Load required modules
        const [Point, Graphic, SimpleMarkerSymbol, PopupTemplate] = await loadModules([
          "esri/geometry/Point",
          "esri/Graphic",
          "esri/symbols/SimpleMarkerSymbol",
          "esri/PopupTemplate",
        ])

        // Clear existing graphics
        graphicsLayerRef.current.removeAll()

        // Add points to the map
        mapPoints.forEach((point) => {
          // Skip reference markers and PMIS points if not enabled
          if (point.type === "reference" && !showReferenceMarkers) return
          if (point.type === "pmis" && !showPMISPoints) return

          // Create point geometry
          const pointGeometry = new Point({
            longitude: point.longitude,
            latitude: point.latitude,
          })

          // Define symbol based on point type
          let symbol
          let popupTemplate

          switch (point.type) {
            case "pavement":
              symbol = new SimpleMarkerSymbol({
                color: point.attributes.pavementType === "CRCP" ? [16, 185, 129] : [59, 130, 246],
                size: 10,
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              })
              popupTemplate = new PopupTemplate({
                title: `${point.attributes.highway} - ${point.id}`,
                content: `
                  <div>
                    <p><strong>District:</strong> ${point.attributes.district}</p>
                    <p><strong>County:</strong> ${point.attributes.county}</p>
                    <p><strong>Pavement Type:</strong> ${point.attributes.pavementType}</p>
                    <p><strong>Slab Thickness:</strong> ${point.attributes.slabThickness} inches</p>
                    <p><strong>Construction Year:</strong> ${point.attributes.constructionYear}</p>
                  </div>
                `,
              })
              break
            case "reference":
              symbol = new SimpleMarkerSymbol({
                color: [0, 0, 0],
                size: 6,
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              })
              popupTemplate = new PopupTemplate({
                title: `Reference Marker ${point.attributes.markerNumber}`,
                content: `
                  <div>
                    <p><strong>Highway:</strong> ${point.attributes.highway}</p>
                    <p><strong>Marker Number:</strong> ${point.attributes.markerNumber}</p>
                    <p><strong>Displacement:</strong> ${point.attributes.displacement}</p>
                  </div>
                `,
              })
              break
            case "pmis":
              symbol = new SimpleMarkerSymbol({
                color: [249, 115, 22],
                size: 8,
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              })
              popupTemplate = new PopupTemplate({
                title: `PMIS Data Point - ${point.attributes.highway}`,
                content: `
                  <div>
                    <p><strong>Condition Score:</strong> ${point.attributes.conditionScore}</p>
                    <p><strong>Distress Score:</strong> ${point.attributes.distressScore}</p>
                    <p><strong>Ride Score:</strong> ${point.attributes.rideScore}</p>
                    <p><strong>Year:</strong> ${point.attributes.year}</p>
                  </div>
                `,
              })
              break
            case "traffic":
              symbol = new SimpleMarkerSymbol({
                color: [239, 68, 68],
                size: 10,
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              })
              popupTemplate = new PopupTemplate({
                title: `Traffic Data - ${point.attributes.highway}`,
                content: `
                  <div>
                    <p><strong>Location:</strong> ${point.attributes.location}</p>
                    <p><strong>AADT:</strong> ${point.attributes.aadt.toLocaleString()}</p>
                    <p><strong>Truck Percentage:</strong> ${point.attributes.truckPercentage}%</p>
                    <p><strong>Growth Rate:</strong> ${point.attributes.growthRate}%</p>
                  </div>
                `,
              })
              break
          }

          // Create graphic
          const graphic = new Graphic({
            geometry: pointGeometry,
            symbol: symbol,
            attributes: {
              id: point.id,
              type: point.type,
              ...point.attributes,
            },
            popupTemplate: popupTemplate,
          })

          // Add graphic to layer
          graphicsLayerRef.current.add(graphic)
        })

        // Set up click handler if needed
        if (onPointClick && viewRef.current) {
          // Remove any existing click handlers
          if (viewRef.current._clickHandler) {
            viewRef.current.off("click", viewRef.current._clickHandler)
          }

          // Create new click handler
          const clickHandler = async (event: any) => {
            const response = await viewRef.current.hitTest(event)
            if (response.results.length) {
              const graphic = response.results[0].graphic
              if (graphic && graphic.attributes) {
                const clickedPoint = mapPoints.find((p) => p.id === graphic.attributes.id)
                if (clickedPoint) {
                  onPointClick(clickedPoint)
                }
              }
            }
          }

          // Store and add the click handler
          viewRef.current._clickHandler = clickHandler
          viewRef.current.on("click", clickHandler)
        }
      } catch (error) {
        console.error("Error adding points to map:", error)
      }
    }

    addPointsToMap()
  }, [mapPoints, showReferenceMarkers, showPMISPoints, mapLoaded, onPointClick])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
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
