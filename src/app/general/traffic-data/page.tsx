import { PageHeader } from "@/components/page-header"
import { TrafficDataMap } from "@/components/traffic-data-map"

export default function TrafficDataPage() {
  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="Traffic Data"
        description="Annual Average Daily Traffic (AADT) information across the Texas highway network"
      />
      <div className="flex-1 p-4">
        <TrafficDataMap />
      </div>
    </div>
  )
}
