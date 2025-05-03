"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw } from "lucide-react"
import { baseChartConfig, baseChartLayout, colorSchemes } from "@/lib/chart-utils"
import dynamic from "next/dynamic"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

// Sample data for PMIS charts
const sampleScoreData = {
  years: [2018, 2019, 2020, 2021, 2022],
  condition: [92, 90, 88, 86, 85],
  distress: [95, 93, 90, 88, 87],
  ride: [88, 86, 85, 83, 82],
}

const sampleDistressData = {
  crcp: {
    years: [2018, 2019, 2020, 2021, 2022],
    "ACP Patches": [0.5, 0.7, 0.8, 1.0, 1.2],
    "PCC Patches": [0.3, 0.4, 0.5, 0.6, 0.7],
    "Spalled Cracks": [1.2, 1.5, 1.8, 2.0, 2.2],
    Punchouts: [0.2, 0.3, 0.4, 0.5, 0.6],
  },
  jcp: {
    years: [2018, 2019, 2020, 2021, 2022],
    "Failed Joints": [0.8, 1.0, 1.2, 1.4, 1.6],
    Failures: [0.4, 0.5, 0.6, 0.7, 0.8],
    "Long. Cracks": [1.0, 1.2, 1.5, 1.7, 1.9],
    "Shattered Slabs": [0.3, 0.4, 0.5, 0.6, 0.7],
  },
}

// Highways for filtering
const highways = [
  { value: "ih35", label: "IH 35" },
  { value: "ih10", label: "IH 10" },
  { value: "ih45", label: "IH 45" },
  { value: "us59", label: "US 59" },
  { value: "us290", label: "US 290" },
  { value: "sh130", label: "SH 130" },
  { value: "sh71", label: "SH 71" },
]

export function PMISDataDashboard() {
  const [loading, setLoading] = useState(false)
  const [highway, setHighway] = useState("")
  const [beginRM, setBeginRM] = useState("")
  const [beginDisplacement, setBeginDisplacement] = useState("")
  const [endRM, setEndRM] = useState("")
  const [endDisplacement, setEndDisplacement] = useState("")
  const [distressType, setDistressType] = useState("crcp")
  const [scoreChartData, setScoreChartData] = useState<any[]>([])
  const [distressChartData, setDistressChartData] = useState<any[]>([])
  const scoreChartRef = useRef<any>(null)
  const distressChartRef = useRef<any>(null)

  // Initialize charts with sample data
  useEffect(() => {
    prepareScoreChartData()
    prepareDistressChartData(distressType)
  }, [distressType])

  // Prepare score chart data
  const prepareScoreChartData = () => {
    const traces = Object.entries(colorSchemes.scores).map(([score, color]) => ({
      x: sampleScoreData.years,
      y: sampleScoreData[score as keyof typeof sampleScoreData],
      type: "scatter",
      mode: "lines+markers",
      name: `${score.charAt(0).toUpperCase() + score.slice(1)} Score`,
      line: {
        color: color,
        width: 3,
      },
      marker: {
        color: color,
        size: 8,
      },
      hovertemplate: `%{y}<extra>${score.charAt(0).toUpperCase() + score.slice(1)} Score (%{x})</extra>`,
    }))

    setScoreChartData(traces)
  }

  // Prepare distress chart data
  const prepareDistressChartData = (type: string) => {
    const distressColors = colorSchemes.distress[type as keyof typeof colorSchemes.distress]
    const data = sampleDistressData[type as keyof typeof sampleDistressData]

    const traces = Object.entries(distressColors).map(([distress, color]) => ({
      x: data.years,
      y: data[distress as keyof typeof data],
      type: "bar",
      name: distress,
      marker: {
        color: color,
      },
      hovertemplate: `%{y} per lane mile<extra>${distress} (%{x})</extra>`,
    }))

    setDistressChartData(traces)
  }

  const handleApplyFilters = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would fetch data based on filters
      // For demo, we'll just randomize the existing data slightly

      // Randomize score data
      const randomizedScoreData = {
        years: sampleScoreData.years,
        condition: sampleScoreData.condition.map((v) =>
          Math.max(70, Math.min(100, v + Math.floor(Math.random() * 10) - 5)),
        ),
        distress: sampleScoreData.distress.map((v) =>
          Math.max(70, Math.min(100, v + Math.floor(Math.random() * 10) - 5)),
        ),
        ride: sampleScoreData.ride.map((v) => Math.max(70, Math.min(100, v + Math.floor(Math.random() * 10) - 5))),
      }

      // Update the sample data
      Object.assign(sampleScoreData, randomizedScoreData)

      // Randomize distress data
      const randomizeDistressValues = (data: any) => {
        const result: any = { years: data.years }
        Object.entries(data).forEach(([key, values]) => {
          if (key !== "years") {
            result[key] = (values as number[]).map((v) => Math.max(0.1, Math.min(3.0, v + Math.random() * 0.4 - 0.2)))
          }
        })
        return result
      }

      Object.assign(sampleDistressData.crcp, randomizeDistressValues(sampleDistressData.crcp))
      Object.assign(sampleDistressData.jcp, randomizeDistressValues(sampleDistressData.jcp))

      // Update charts
      prepareScoreChartData()
      prepareDistressChartData(distressType)

      setLoading(false)
    }, 1500)
  }

  const handleResetFilters = () => {
    setHighway("")
    setBeginRM("")
    setBeginDisplacement("")
    setEndRM("")
    setEndDisplacement("")
  }

  // Handle chart downloads
  const handleScoreChartDownload = () => {
    if (scoreChartRef.current) {
      const plotlyInstance = scoreChartRef.current.el
      if (plotlyInstance && plotlyInstance.toImage) {
        plotlyInstance
          .toImage({
            ...baseChartConfig.toImageButtonOptions,
            filename: "pmis_scores_chart",
          })
          .then((dataUrl: string) => {
            const link = document.createElement("a")
            link.download = "pmis_scores_chart.png"
            link.href = dataUrl
            link.click()
          })
      }
    }
  }

  const handleDistressChartDownload = () => {
    if (distressChartRef.current) {
      const plotlyInstance = distressChartRef.current.el
      if (plotlyInstance && plotlyInstance.toImage) {
        plotlyInstance
          .toImage({
            ...baseChartConfig.toImageButtonOptions,
            filename: "pmis_distress_chart",
          })
          .then((dataUrl: string) => {
            const link = document.createElement("a")
            link.download = "pmis_distress_chart.png"
            link.href = dataUrl
            link.click()
          })
      }
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>Select parameters to filter PMIS data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Highway</label>
              <Select value={highway} onValueChange={setHighway}>
                <SelectTrigger>
                  <SelectValue placeholder="Select highway" />
                </SelectTrigger>
                <SelectContent>
                  {highways.map((h) => (
                    <SelectItem key={h.value} value={h.value}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Begin Reference Marker</label>
              <Input placeholder="e.g. 512" value={beginRM} onChange={(e) => setBeginRM(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Begin Displacement</label>
              <Input
                placeholder="e.g. 0.5"
                value={beginDisplacement}
                onChange={(e) => setBeginDisplacement(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Reference Marker</label>
              <Input placeholder="e.g. 520" value={endRM} onChange={(e) => setEndRM(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Displacement</label>
              <Input
                placeholder="e.g. 0.2"
                value={endDisplacement}
                onChange={(e) => setEndDisplacement(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
            <Button onClick={handleApplyFilters} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Apply Filters"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="h-[400px]">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Condition Scores</CardTitle>
              <CardDescription>Historical trend of condition, distress, and ride scores</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={handleScoreChartDownload}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download chart</span>
            </Button>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Plot
                ref={scoreChartRef}
                data={scoreChartData}
                layout={{
                  ...baseChartLayout,
                  title: "",
                  xaxis: {
                    title: "Year",
                    gridcolor: "rgba(0,0,0,0.1)",
                  },
                  yaxis: {
                    title: "Score",
                    range: [60, 100],
                    gridcolor: "rgba(0,0,0,0.1)",
                  },
                  legend: {
                    orientation: "h",
                    y: -0.15,
                    x: 0.5,
                    xanchor: "center",
                  },
                  height: 300,
                }}
                config={baseChartConfig}
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </CardContent>
        </Card>

        <Card className="h-[400px]">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Distress Frequency</CardTitle>
              <CardDescription>Recorded pavement distresses by type</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs
                value={distressType}
                onValueChange={(value) => {
                  setDistressType(value)
                  prepareDistressChartData(value)
                }}
              >
                <TabsList>
                  <TabsTrigger value="crcp">CRCP</TabsTrigger>
                  <TabsTrigger value="jcp">JCP</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="icon" onClick={handleDistressChartDownload}>
                <Download className="h-4 w-4" />
                <span className="sr-only">Download chart</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Plot
                ref={distressChartRef}
                data={distressChartData}
                layout={{
                  ...baseChartLayout,
                  title: "",
                  xaxis: {
                    title: "Year",
                    gridcolor: "rgba(0,0,0,0.1)",
                  },
                  yaxis: {
                    title: "Distresses per Lane Mile",
                    gridcolor: "rgba(0,0,0,0.1)",
                  },
                  legend: {
                    orientation: "h",
                    y: -0.15,
                    x: 0.5,
                    xanchor: "center",
                  },
                  height: 300,
                }}
                config={baseChartConfig}
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
