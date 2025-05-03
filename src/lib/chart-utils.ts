export const baseChartLayout = {
  font: {
    family: "Inter, system-ui, sans-serif",
  },
  margin: {
    l: 50,
    r: 30,
    t: 30,
    b: 50,
  },
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  autosize: true,
  hovermode: "closest",
}

// Common chart config options
export const baseChartConfig = {
  responsive: true,
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ["lasso2d", "select2d", "toggleSpikelines", "hoverClosestCartesian", "hoverCompareCartesian"],
  toImageButtonOptions: {
    format: "png",
    filename: "rpdb_chart",
    height: 800,
    width: 1200,
    scale: 2,
  },
}

// Generate random data for demo purposes
export function generateRandomData(years: number[], min: number, max: number) {
  return years.map((year) => ({
    year,
    value: Math.floor(Math.random() * (max - min + 1)) + min,
  }))
}

// Color schemes
export const colorSchemes = {
  pavementTypes: {
    CRCP: "#10b981", // green-500
    JPCP: "#3b82f6", // blue-500
    JRCP: "#8b5cf6", // purple-500
  },
  scores: {
    condition: "#10b981", // green-500
    distress: "#3b82f6", // blue-500
    ride: "#f59e0b", // amber-500
  },
  distress: {
    crcp: {
      "ACP Patches": "#ef4444", // red-500
      "PCC Patches": "#f97316", // orange-500
      "Spalled Cracks": "#8b5cf6", // purple-500
      Punchouts: "#ec4899", // pink-500
    },
    jcp: {
      "Failed Joints": "#3b82f6", // blue-500
      Failures: "#f43f5e", // rose-500
      "Long. Cracks": "#10b981", // green-500
      "Shattered Slabs": "#6366f1", // indigo-500
    },
  },
}
