"use client"

import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { baseChartConfig, baseChartLayout } from "@/lib/chart-utils"
import { BasicMap } from "@/components/basic-map"
import { trafficPoints } from "@/lib/arcgis-utils"
import dynamic from "next/dynamic"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface TrafficPoint {
  id: string
  highway: string
  location: string
  aadt: number
  truckPercentage: number
  growthRate: number
  historicalData: {
    year: number
    aadt: number
    truckPercentage: number
  }[]
}

export function TrafficDataMap() {
  const [selectedPoint, setSelectedPoint] = useState<TrafficPoint | null>(null)
  const [mapType, setMapType] = useState("streets-vector")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trafficChartRef = useRef<any>(null)

  // For demo purposes, let's select the first traffic point
  const handleSelectFirstPoint = () => {
    if (trafficPoints.length > 0) {
      const point = trafficPoints[0]
      // Cast attributes to the expected shape
      const attrs = point.attributes as {
        highway: string
        location: string
        aadt: number
        truckPercentage: number
        growthRate: number
        historicalData: {
          year: number
          aadt: number
          truckPercentage: number
        }[]
      }
      setSelectedPoint({
        id: point.id,
        highway: attrs.highway,
        location: attrs.location,
        aadt: attrs.aadt,
        truckPercentage: attrs.truckPercentage,
        growthRate: attrs.growthRate,
        historicalData: attrs.historicalData,
      })
    }
  }

  // Handle chart download
  const handleChartDownload = () => {
    if (trafficChartRef.current) {
      const plotlyInstance = trafficChartRef.current.el
      if (plotlyInstance && plotlyInstance.toImage) {
        plotlyInstance
          .toImage({
            ...baseChartConfig.toImageButtonOptions,
            filename: "traffic_data_chart",
          })
          .then((dataUrl: string) => {
            const link = document.createElement("a")
            link.download = "traffic_data_chart.png"
            link.href = dataUrl
            link.click()
          })
      }
    }
  }

  // Prepare traffic chart data
  const prepareTrafficChartData = () => {
    if (!selectedPoint) return []

    const years = selectedPoint.historicalData.map((d) => d.year)
    const aadt = selectedPoint.historicalData.map((d) => d.aadt)
    const truckPercentage = selectedPoint.historicalData.map((d) => d.truckPercentage)

    return [
      {
        x: years,
        y: aadt,
        type: "bar",
        name: "AADT",
        marker: {
          color: "rgba(59, 130, 246, 0.7)", // blue-500 with transparency
        },
        hovertemplate: "%{y:,} vehicles<extra>AADT (%{x})</extra>",
      },
      {
        x: years,
        y: truckPercentage,
        type: "scatter",
        mode: "lines+markers",
        name: "Truck %",
        yaxis: "y2",
        line: {
          color: "#10b981", // green-500
          width: 3,
        },
        marker: {
          color: "#10b981",
          size: 8,
        },
        hovertemplate: "%{y:.1f}%<extra>Truck Percentage (%{x})</extra>",
      },
    ]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <Card className="lg:col-span-2 h-full">
        <CardContent className="p-0 h-full">
          <Tabs defaultValue="streets-vector" value={mapType} onValueChange={setMapType} className="h-full">
            <div className="px-4 pt-4">
              <TabsList>
                <TabsTrigger value="streets-vector">Streets</TabsTrigger>
                <TabsTrigger value="satellite">Satellite</TabsTrigger>
                <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
                <TabsTrigger value="topo-vector">Topographic</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={mapType} className="h-[calc(100%-3rem)] m-0">
              <div className="relative w-full h-full">
                <BasicMap mapType={mapType} />
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm p-3 rounded-md shadow-md">
                  <Button onClick={handleSelectFirstPoint}>Select Sample Traffic Point</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          {selectedPoint ? (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedPoint.highway}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPoint.location}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-2xl font-bold">{selectedPoint.aadt.toLocaleString()}</span>
                    <span className="ml-2 text-sm text-muted-foreground">AADT</span>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleChartDownload}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download chart</span>
                </Button>
              </div>

              <div className="flex-1 min-h-[250px]">
                <Plot
                  ref={trafficChartRef}
                  data={prepareTrafficChartData()}
                  layout={{
                    ...baseChartLayout,
                    title: "",
                    xaxis: {
                      title: "Year",
                      gridcolor: "rgba(0,0,0,0.1)",
                    },
                    yaxis: {
                      title: "AADT",
                      gridcolor: "rgba(0,0,0,0.1)",
                      tickformat: ",",
                    },
                    yaxis2: {
                      title: "Truck Percentage (%)",
                      titlefont: { color: "#10b981" },
                      tickfont: { color: "#10b981" },
                      overlaying: "y",
                      side: "right",
                      range: [0, 20],
                    },
                    legend: {
                      orientation: "h",
                      y: -0.2,
                      x: 0.5,
                      xanchor: "center",
                    },
                    height: 250,
                  }}
                  config={baseChartConfig}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              <div className="mt-4">
                <p className="text-sm text-green-600">Annual Growth Rate: {selectedPoint.growthRate}%</p>
                <div className="mt-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Year</th>
                        <th className="text-right py-2">AADT</th>
                        <th className="text-right py-2">Truck %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPoint.historicalData.map((data, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{data.year}</td>
                          <td className="text-right py-2">{data.aadt.toLocaleString()}</td>
                          <td className="text-right py-2">{data.truckPercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">Select a traffic data point on the map to view details</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
