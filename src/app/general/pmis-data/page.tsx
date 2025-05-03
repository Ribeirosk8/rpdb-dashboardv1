import { PageHeader } from "@/components/page-header"
import { PMISDataDashboard } from "@/components/pmis-data-dashboard"

export default function PMISDataPage() {
  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="PMIS Data"
        description="Pavement condition, ride quality, and distress levels from Texas PMIS"
      />
      <div className="flex-1 p-4">
        <PMISDataDashboard />
      </div>
    </div>
  )
}
