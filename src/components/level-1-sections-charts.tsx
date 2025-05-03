"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { baseChartConfig, baseChartLayout } from "@/lib/chart-utils"
import dynamic from "next/dynamic"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

// Sample data for LTE and deflection charts
const sampleLTEData = {
  years: [2005, 2010, 2015, 2020, 2022],
  values: [95, 92, 88, 85, 83],
}

const sampleDeflectionData = {
  years: [2005, 2010, 2015, 2020, 2022],
  d0: [5.2, 5.5, 5.8, 6.2, 6.5], // Center deflection
  d1: [4.8, 5.0, 5.3, 5.6, 5.9], // 12" from center
  d2: [3.5, 3.7, 4.0, 4.3, 4.5], // 24" from center
  d3: [2.2, 2.4, 2.6, 2.8, 3.0], // 36" from center
}

export function LTEChart() {
  const chartRef = useRef<any>(null)

  const handleDownload = () => {
    if (chartRef.current) {
      const plotlyInstance = chartRef.current.el
      if (plotlyInstance && plotlyInstance.toImage) {
        plotlyInstance
          .toImage({
            ...baseChartConfig.toImageButtonOptions,
            filename: "lte_chart",
          })
          .then((dataUrl: string) => {
            const link = document.createElement("a")
            link.download = "lte_chart.png"
            link.href = dataUrl
            link.click()
          })
      }
    }
  }

  const data = [
    {
      x: sampleLTEData.years,
      y: sampleLTEData.values,
      type: "bar",
      marker: {
        color: "#3b82f6", // blue-500
      },
      hovertemplate: "%{y}%<extra>LTE (%{x})</extra>",
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Load Transfer Efficiency (LTE)</h3>
        <Button variant="outline" size="icon" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          <span className="sr-only">Download chart</span>
        </Button>
      </div>
      <div className="h-[200px]">
        <Plot
          ref={chartRef}
          data={data}
          layout={{
            ...baseChartLayout,
            title: "",
            xaxis: {
              title: "Year",
              gridcolor: "rgba(0,0,0,0.1)",
            },
            yaxis: {
              title: "LTE (%)",
              range: [70, 100],
              gridcolor: "rgba(0,0,0,0.1)",
            },
            height: 200,
          }}
          config={baseChartConfig}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  )
}

export function DeflectionChart() {
  const chartRef = useRef<any>(null)

  const handleDownload = () => {
    if (chartRef.current) {
      const plotlyInstance = chartRef.current.el
      if (plotlyInstance && plotlyInstance.toImage) {
        plotlyInstance
          .toImage({
            ...baseChartConfig.toImageButtonOptions,
            filename: "deflection_chart",
          })
          .then((dataUrl: string) => {
            const link = document.createElement("a")
            link.download = "deflection_chart.png"
            link.href = dataUrl
            link.click()
          })
      }
    }
  }

  const data = [
    {
      x: sampleDeflectionData.years,
      y: sampleDeflectionData.d0,
      type: "scatter",
      mode: "lines+markers",
      name: "D0 (Center)",
      line: {
        color: "#ef4444", // red-500
        width: 2,
      },
      marker: {
        color: "#ef4444",
        size: 6,
      },
      hovertemplate: "%{y} mils<extra>D0 (%{x})</extra>",
    },
    {
      x: sampleDeflectionData.years,
      y: sampleDeflectionData.d1,
      type: "scatter",
      mode: "lines+markers",
      name: 'D1 (12")',
      line: {
        color: "#f97316", // orange-500
        width: 2,
      },
      marker: {
        color: "#f97316",
        size: 6,
      },
      hovertemplate: "%{y} mils<extra>D1 (%{x})</extra>",
    },
    {
      x: sampleDeflectionData.years,
      y: sampleDeflectionData.d2,
      type: "scatter",
      mode: "lines+markers",
      name: 'D2 (24")',
      line: {
        color: "#10b981", // green-500
        width: 2,
      },
      marker: {
        color: "#10b981",
        size: 6,
      },
      hovertemplate: "%{y} mils<extra>D2 (%{x})</extra>",
    },
    {
      x: sampleDeflectionData.years,
      y: sampleDeflectionData.d3,
      type: "scatter",
      mode: "lines+markers",
      name: 'D3 (36")',
      line: {
        color: "#3b82f6", // blue-500
        width: 2,
      },
      marker: {
        color: "#3b82f6",
        size: 6,
      },
      hovertemplate: "%{y} mils<extra>D3 (%{x})</extra>",
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Deflection Measurements</h3>
        <Button variant="outline" size="icon" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          <span className="sr-only">Download chart</span>
        </Button>
      </div>
      <div className="h-[200px]">
        <Plot
          ref={chartRef}
          data={data}
          layout={{
            ...baseChartLayout,
            title: "",
            xaxis: {
              title: "Year",
              gridcolor: "rgba(0,0,0,0.1)",
            },
            yaxis: {
              title: "Deflection (mils)",
              gridcolor: "rgba(0,0,0,0.1)",
            },
            legend: {
              orientation: "h",
              y: -0.3,
              x: 0.5,
              xanchor: "center",
            },
            height: 200,
          }}
          config={baseChartConfig}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  )
}
