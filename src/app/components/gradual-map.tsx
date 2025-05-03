"use client"

import { useEffect, useRef, useState } from "react"
import { loadModules } from "@/lib/arcgis-loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { MapPoint } from "@/lib/arcgis-utils"
import { pavementSections, trafficPoints, pmisPoints, referenceMarkers } from "@/lib/arcgis-utils"
import { cn } from "@/lib/utils"
import type { MapView, GraphicsLayer, Point, Graphic, SimpleMarkerSymbol, PopupTemplate } from "@/lib/arcgis-types"


interface EsriPointProperties {
  longitude: number;
  latitude: number;
}

interface EsriSymbolProperties {
  color: number[];
  size: number;
  outline: {
    color: number[];
    width: number;
  };
}

interface EsriPopupProperties {
  title: string;
  content: string;
}

interface EsriGraphicProperties {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geometry: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  symbol: any;
  attributes: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  popupTemplate: any;
}

interface GradualMapProps {
  mapType?: string
}

// Simple Legend component defined locally to avoid import issues
interface LegendItem {
  color: string
  label: string
}

interface SimpleLegendProps {
  title?: string
  items: LegendItem[]
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

function SimpleLegend({
  title = "Map Legend",
  items,
  className,
  collapsible = true,
  defaultCollapsed = false,
}: SimpleLegendProps) {
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

export function GradualMap({ mapType = "streets-vector" }: GradualMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const viewRef = useRef<MapView | null>(null)
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null)

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

    let view: MapView | null = null

    const initializeMap = async () => {
      try {
        setError(null)

        // Load the required modules with proper typings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [EsriMap, EsriMapView, EsriGraphicsLayer] = await loadModules<[any, any, any]>([
          "esri/Map",
          "esri/views/MapView",
          "esri/layers/GraphicsLayer"
        ]);

        // Create the map
        const map = new EsriMap({
          basemap: mapType,
        })

        // Create a graphics layer
        const graphicsLayer = new EsriGraphicsLayer()
        map.add(graphicsLayer)
        graphicsLayerRef.current = graphicsLayer as unknown as GraphicsLayer

        // Create the view
        view = new EsriMapView({
          container: mapRef.current,
          map: map,
          center: [-99.9018, 31.9686], // Center of Texas
          zoom: 6,
        }) as unknown as MapView

        // Store the view reference
        viewRef.current = view

        // Wait for the view to be ready
        if (view) {
          await view.when()
          setMapLoaded(true)
          console.log("Map initialized successfully")
        }
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
      // Load required modules with proper typings
      const [EsriPoint, EsriGraphic, EsriSimpleMarkerSymbol, EsriPopupTemplate] = await loadModules<
        [
          new (props: EsriPointProperties) => Point,
          new (props: EsriGraphicProperties) => Graphic,
          new (props: EsriSymbolProperties) => SimpleMarkerSymbol,
          new (props: EsriPopupProperties) => PopupTemplate
        ]
      >([
        "esri/geometry/Point",
        "esri/Graphic",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/PopupTemplate"
      ]);

      // Create point geometry
      const pointGeometry = new EsriPoint({
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
              <p><strong>AADT:</strong> ${String(point.attributes.aadt)}</p>
              <p><strong>Truck Percentage:</strong> ${point.attributes.truckPercentage}%</p>
              <p><strong>Growth Rate:</strong> ${point.attributes.growthRate}%</p>
            </div>
          `
          break
      }

      // Create symbol
      const symbol = new EsriSimpleMarkerSymbol({
        color: color,
        size: size,
        outline: {
          color: [255, 255, 255],
          width: 1,
        },
      })

      // Create popup template
      const popupTemplate = new EsriPopupTemplate({
        title: title,
        content: content,
      })

      // Create graphic
      const graphic = new EsriGraphic({
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
            <SimpleLegend items={legendItems} collapsible={true} defaultCollapsed={false} />
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
              <SimpleLegend items={legendItems} collapsible={true} defaultCollapsed={true} />
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
