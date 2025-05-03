"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { baseChartConfig, baseChartLayout, colorSchemes } from "@/lib/chart-utils"
import dynamic from "next/dynamic"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

// Sample data for lane miles by year and pavement type
const sampleData = {
  years: Array.from({ length: 63 }, (_, i) => 1960 + i),
  CRCP: [
    // Starting values for 1960s
    1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600, 3900,
    // 1970s
    4200, 4500, 4800, 5100, 5400, 5700, 6000, 6300, 6600, 6900,
    // 1980s
    7200, 7500, 7800, 8100, 8400, 8700, 9000, 9300, 9600, 9900,
    // 1990s
    10200, 10500, 10800, 11100, 11400, 11700, 12000, 12300, 12600, 12900,
    // 2000s
    13200, 13500, 13800, 14100, 14400, 14700, 15000, 15300, 15600, 15900,
    // 2010s
    16200, 16500, 16800, 17100, 17400, 17700, 18000, 18300, 18600, 18900,
    // 2020s
    19200, 19500, 19800,
  ],
  JPCP: [
    // Starting values for 1960s
    2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900,
    // 1970s
    3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900,
    // 1980s
    4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900,
    // 1990s
    5000, 5100, 5200, 5300, 5400, 5500, 5600, 5700, 5800, 5900,
    // 2000s
    6000, 6100, 6200, 6300, 6400, 6500, 6600, 6700, 6800, 6900,
    // 2010s
    7000, 7100, 7200, 7300, 7400, 7500, 7600, 7700, 7800, 7900,
    // 2020s
    8000, 8100, 8200,
  ],
  JRCP: [
    // Starting values for 1960s
    1800, 1850, 1900, 1950, 2000, 2050, 2100, 2150, 2200, 2250,
    // 1970s
    2300, 2350, 2400, 2450, 2500, 2550, 2600, 2650, 2700, 2750,
    // 1980s
    2800, 2850, 2900, 2950, 3000, 3050, 3100, 3150, 3200, 3250,
    // 1990s
    3300, 3350, 3400, 3450, 3500, 3550, 3600, 3650, 3700, 3750,
    // 2000s
    3800, 3850, 3900, 3950, 4000, 4050, 4100, 4150, 4200, 4250,
    // 2010s
    4300, 4350, 4400, 4450, 4500, 4550, 4600, 4650, 4700, 4750,
    // 2020s
    4800, 4850, 4900,
  ],
}

// Districts and counties for filtering
const districts = [
  { value: "all", label: "All Districts" },
  { value: "austin", label: "Austin" },
  { value: "dallas", label: "Dallas" },
  { value: "houston", label: "Houston" },
  { value: "san-antonio", label: "San Antonio" },
  { value: "fort-worth", label: "Fort Worth" },
  { value: "el-paso", label: "El Paso" },
  { value: "corpus-christi", label: "Corpus Christi" },
]

const counties = {
  all: [{ value: "all", label: "All Counties" }],
  austin: [
    { value: "all", label: "All Counties" },
    { value: "travis", label: "Travis" },
    { value: "williamson", label: "Williamson" },
    { value: "hays", label: "Hays" },
  ],
  dallas: [
    { value: "all", label: "All Counties" },
    { value: "dallas", label: "Dallas" },
    { value: "collin", label: "Collin" },
    { value: "denton", label: "Denton" },
  ],
  houston: [
    { value: "all", label: "All Counties" },
    { value: "harris", label: "Harris" },
    { value: "fort-bend", label: "Fort Bend" },
    { value: "montgomery", label: "Montgomery" },
  ],
  "san-antonio": [
    { value: "all", label: "All Counties" },
    { value: "bexar", label: "Bexar" },
    { value: "comal", label: "Comal" },
    { value: "guadalupe", label: "Guadalupe" },
  ],
  "fort-worth": [
    { value: "all", label: "All Counties" },
    { value: "tarrant", label: "Tarrant" },
    { value: "parker", label: "Parker" },
    { value: "johnson", label: "Johnson" },
  ],
  "el-paso": [
    { value: "all", label: "All Counties" },
    { value: "el-paso", label: "El Paso" },
    { value: "hudspeth", label: "Hudspeth" },
  ],
  "corpus-christi": [
    { value: "all", label: "All Counties" },
    { value: "nueces", label: "Nueces" },
    { value: "san-patricio", label: "San Patricio" },
    { value: "kleberg", label: "Kleberg" },
  ],
}

export function LaneMilesChart() {
  const [loading, setLoading] = useState(true)
  const [district, setDistrict] = useState("all")
  const [county, setCounty] = useState("all")
  const [availableCounties, setAvailableCounties] = useState(counties.all)
  const [chartData, setChartData] = useState<any[]>([])
  const plotRef = useRef<any>(null)

  // Update available counties when district changes
  useEffect(() => {
    setAvailableCounties(counties[district as keyof typeof counties] || counties.all)
    setCounty("all")
  }, [district])

  // Simulate data loading and prepare chart data
  useEffect(() => {
    setLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Prepare data for stacked bar chart
      const traces = Object.entries(colorSchemes.pavementTypes).map(([type, color]) => {
        // Apply filtering logic (in a real app, this would filter actual data)
        const multiplier = district === "all" ? 1 : 0.7
        const countyMultiplier = county === "all" ? 1 : 0.5

        return {
          x: sampleData.years,
          y: sampleData[type as keyof typeof sampleData].map((value) =>
            Math.round(value * multiplier * countyMultiplier),
          ),
          type: "bar",
          name: type,
          marker: {
            color: color,
          },
          hovertemplate: `%{y} lane miles<extra>${type} (%{x})</extra>`,
        }
      })

      setChartData(traces)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [district, county])

  // Handle chart download
  const handleDownload = () => {
    if (plotRef.current) {
      // Access the Plotly instance and trigger download
      const plotlyInstance = plotRef.current.el
      if (plotlyInstance && plotlyInstance.toImage) {
        plotlyInstance.toImage(baseChartConfig.toImageButtonOptions).then((dataUrl: string) => {
          const link = document.createElement("a")
          link.download = "lane_miles_chart.png"
          link.href = dataUrl
          link.click()
        })
      }
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Lane Miles Distribution</CardTitle>
          <CardDescription>Distribution by pavement type (CRCP, JPCP, JRCP)</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          <span className="sr-only">Download chart</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">District</label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">County</label>
            <Select value={county} onValueChange={setCounty}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent>
                {availableCounties.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Plot
              ref={plotRef}
              data={chartData}
              layout={{
                ...baseChartLayout,
                barmode: "stack",
                title: "",
                xaxis: {
                  title: "Year",
                  tickmode: "array",
                  tickvals: [1960, 1970, 1980, 1990, 2000, 2010, 2020],
                  gridcolor: "rgba(0,0,0,0.1)",
                },
                yaxis: {
                  title: "Lane Miles",
                  gridcolor: "rgba(0,0,0,0.1)",
                },
                legend: {
                  orientation: "h",
                  y: -0.15,
                  x: 0.5,
                  xanchor: "center",
                },
                height: 400,
              }}
              config={baseChartConfig}
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
