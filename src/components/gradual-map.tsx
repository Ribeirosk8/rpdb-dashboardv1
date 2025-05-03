"use client"

import { useEffect, useRef, useState } from "react"
import { loadModules } from "@/lib/arcgis-loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapLegend } from "@/components/map-legend"
import type { MapPoint } from "@/lib/arcgis-utils"
import { pavementSections, trafficPoints, pmisPoints, referenceMarkers } from "@/lib/arcgis-utils"

interface GradualMapProps {
  mapType?: string
}

// Define types for ArcGIS objects
interface ArcGISEvent {
  stopPropagation: () => void
  x: number
  y: number
}

interface ArcGISHitTestResult {
  results: Array<{
    graphic: {
      attributes: Record<string, unknown>
    }
  }>
}

interface ArcGISView {
  container: HTMLDivElement
  map: ArcGISMap
  when: () => Promise<void>
  destroy: () => void
  on: (event: string, callback: (event: ArcGISEvent) => void) => void
  off: (event: string, callback: (event: ArcGISEvent) => void) => void
  hitTest: (event: ArcGISEvent) => Promise<ArcGISHitTestResult>
  _clickHandler?: (event: ArcGISEvent) => void
}

interface ArcGISMap {
  basemap: string
  add: (layer: ArcGISGraphicsLayer) => void
}

interface ArcGISGraphicsLayer {
  add: (graphic: unknown) => void
  removeAll: () => void
}

export function GradualMap({ mapType = "streets-vector" }: GradualMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const viewRef = useRef<ArcGISView | null>(null)
  const graphicsLayerRef = useRef<ArcGISGraphicsLayer | null>(null)

  // Track which points have been added
  const [addedPoints, setAddedPoints] = useState<{
    pavement: boolean
    traffic: boolean
    pmis: boolean
    reference: boolean
  }>({
    pavement: false,
    traffic: false,
    pmis: false,
    reference: false,
  })

  // Track the current operation
  const [adding, setAdding] = useState<string | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    let view: ArcGISView | null = null
    let graphicsLayer: ArcGISGraphicsLayer | null = null

    const initializeMap = async () => {
      try {
        setError(null)

        // Load the required modules
        const [Map, MapView, GraphicsLayer] = await loadModules([
          "esri/Map",
          "esri/views/MapView",
          "esri/layers/GraphicsLayer",
        ])

        // Create the map
        const map = new Map({
          basemap: mapType,
        }) as ArcGISMap

        // Create a graphics layer
        graphicsLayer = new GraphicsLayer() as ArcGISGraphicsLayer
        map.add(graphicsLayer)
        graphicsLayerRef.current = graphicsLayer

        // Create the view
        view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-99.9018, 31.9686], // Center of Texas
          zoom: 6,
        }) as ArcGISView

        // Store the view reference
        viewRef.current = view

        // Wait for the view to be ready
        await view.when()
        setMapLoaded(true)
        console.log("Map initialized successfully")
      } catch (error) {
        console.error("Error initializing map:", error)
        setError("Failed to initialize map. Please check console for details.")
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

  // Function to add a single point to the map
  const addPointToMap = async (point: MapPoint) => {
    if (!mapLoaded || !graphicsLayerRef.current) {
      console.error("Map not loaded or graphics layer not available")
      return false
    }

    try {
      // Load required modules
      const [Point, Graphic, SimpleMarkerSymbol, PopupTemplate] = await loadModules([
        "esri/geometry/Point",
        "esri/Graphic",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/PopupTemplate",
      ])

      // Create point geometry
      const pointGeometry = new Point({
        longitude: point.longitude,
        latitude: point.latitude,
      })

      // Define symbol based on point type
      let color: number[] = [0, 0, 0]
      let size = 8
      let title = ""
      let content = ""

      switch (point.type) {
        case "pavement":
          color = point.attributes.pavementType === "CRCP" ? [16, 185, 129] : [59, 130, 246]
          size = 10
          title = `${point.attributes.highway} - ${point.id}`
          content = `
            <div>
              <p><strong>District:</strong> ${point.attributes.district}</p>
              <p><strong>County:</strong> ${point.attributes.county}</p>
              <p><strong>Pavement Type:</strong> ${point.attributes.pavementType}</p>
              <p><strong>Slab Thickness:</strong> ${point.attributes.slabThickness} inches</p>
              <p><strong>Construction Year:</strong> ${point.attributes.constructionYear}</p>
            </div>
          `
          break
        case "reference":
          color = [0, 0, 0]
          size = 6
          title = `Reference Marker ${point.attributes.markerNumber}`
          content = `
            <div>
              <p><strong>Highway:</strong> ${point.attributes.highway}</p>
              <p><strong>Marker Number:</strong> ${point.attributes.markerNumber}</p>
              <p><strong>Displacement:</strong> ${point.attributes.displacement}</p>
            </div>
          `
          break
        case "pmis":
          color = [249, 115, 22]
          size = 8
          title = `PMIS Data Point - ${point.attributes.highway}`
          content = `
            <div>
              <p><strong>Condition Score:</strong> ${point.attributes.conditionScore}</p>
              <p><strong>Distress Score:</strong> ${point.attributes.distressScore}</p>
              <p><strong>Ride Score:</strong> ${point.attributes.rideScore}</p>
              <p><strong>Year:</strong> ${point.attributes.year}</p>
            </div>
          `
          break
        case "traffic":
          color = [239, 68, 68]
          size = 10
          title = `Traffic Data - ${point.attributes.highway}`
          content = `
            <div>
              <p><strong>Location:</strong> ${point.attributes.location}</p>
              <p><strong>AADT:</strong> ${point.attributes.aadt.toLocaleString()}</p>
              <p><strong>Truck Percentage:</strong> ${point.attributes.truckPercentage}%</p>
              <p><strong>Growth Rate:</strong> ${point.attributes.growthRate}%</p>
            </div>
          `
          break
      }

      // Create symbol
      const symbol = new SimpleMarkerSymbol({
        color: color,
        size: size,
        outline: {
          color: [255, 255, 255],
          width: 1,
        },
      })

      // Create popup template
      const popupTemplate = new PopupTemplate({
        title: title,
        content: content,
      })

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
      console.log(`Added point ${point.id} to map`)
      return true
    } catch (error) {
      console.error("Error adding point to map:", error)
      setError(`Failed to add point ${point.id}. Please check console for details.`)
      return false
    }
  }

  // Function to add a batch of points
  const addPointsBatch = async (pointType: string) => {
    setAdding(pointType)
    setError(null)

    let points: MapPoint[] = []

    switch (pointType) {
      case "pavement":
        points = pavementSections
        break
      case "traffic":
        points = trafficPoints
        break
      case "pmis":
        points = pmisPoints
        break
      case "reference":
        points = referenceMarkers
        break
    }

    let success = true

    // Add points one by one with a small delay
    for (let i = 0; i < points.length; i++) {
      const result = await addPointToMap(points[i])
      if (!result) {
        success = false
        break
      }

      // Small delay to visualize the addition
      if (i < points.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    if (success) {
      setAddedPoints((prev) => ({
        ...prev,
        [pointType]: true,
      }))
    }

    setAdding(null)
  }

  // Function to clear all points
  const clearAllPoints = () => {
    if (graphicsLayerRef.current) {
      graphicsLayerRef.current.removeAll()
      setAddedPoints({
        pavement: false,
        traffic: false,
        pmis: false,
        reference: false,
      })
      console.log("Cleared all points from map")
    }
  }

  // Legend items
  const legendItems = [
    { color: "rgb(16, 185, 129)", label: "CRCP Pavement" },
    { color: "rgb(59, 130, 246)", label: "JCP Pavement" },
    { color: "rgb(239, 68, 68)", label: "Traffic Data" },
    { color: "rgb(249, 115, 22)", label: "PMIS Data" },
    { color: "rgb(0, 0, 0)", label: "Reference Marker" },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading map...</p>
            </div>
          </div>
        )}

        {/* Map Legend - Desktop */}
        {mapLoaded && (
          <div className="absolute top-4 right-4 w-64 hidden md:block">
            <MapLegend items={legendItems} collapsible={true} defaultCollapsed={false} />
          </div>
        )}
      </div>

      <Card className="mt-4">
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Map Legend - Mobile */}
          {mapLoaded && (
            <div className="mb-4 md:hidden">
              <MapLegend items={legendItems} collapsible={true} defaultCollapsed={true} />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={addedPoints.pavement ? "default" : "outline"} className="text-xs">
              {addedPoints.pavement ? <CheckCircle2 className="mr-1 h-3 w-3" /> : null}
              Pavement Sections ({pavementSections.length})
            </Badge>
            <Badge variant={addedPoints.traffic ? "default" : "outline"} className="text-xs">
              {addedPoints.traffic ? <CheckCircle2 className="mr-1 h-3 w-3" /> : null}
              Traffic Points ({trafficPoints.length})
            </Badge>
            <Badge variant={addedPoints.pmis ? "default" : "outline"} className="text-xs">
              {addedPoints.pmis ? <CheckCircle2 className="mr-1 h-3 w-3" /> : null}
              PMIS Points ({pmisPoints.length})
            </Badge>
            <Badge variant={addedPoints.reference ? "default" : "outline"} className="text-xs">
              {addedPoints.reference ? <CheckCircle2 className="mr-1 h-3 w-3" /> : null}
              Reference Markers ({referenceMarkers.length})
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={() => addPointsBatch("pavement")}
              disabled={adding !== null || addedPoints.pavement}
              variant={addedPoints.pavement ? "outline" : "default"}
              className="flex items-center"
            >
              {adding === "pavement" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Pavement Points
            </Button>

            <Button
              onClick={() => addPointsBatch("traffic")}
              disabled={adding !== null || addedPoints.traffic}
              variant={addedPoints.traffic ? "outline" : "default"}
              className="flex items-center"
            >
              {adding === "traffic" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Traffic Points
            </Button>

            <Button
              onClick={() => addPointsBatch("pmis")}
              disabled={adding !== null || addedPoints.pmis}
              variant={addedPoints.pmis ? "outline" : "default"}
              className="flex items-center"
            >
              {adding === "pmis" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add PMIS Points
            </Button>

            <Button
              onClick={() => addPointsBatch("reference")}
              disabled={adding !== null || addedPoints.reference}
              variant={addedPoints.reference ? "outline" : "default"}
              className="flex items-center"
            >
              {adding === "reference" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Reference Markers
            </Button>
          </div>

          <div className="mt-4">
            <Button
              onClick={clearAllPoints}
              disabled={
                adding !== null ||
                (!addedPoints.pavement && !addedPoints.traffic && !addedPoints.pmis && !addedPoints.reference)
              }
              variant="destructive"
              className="w-full"
            >
              Clear All Points
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
