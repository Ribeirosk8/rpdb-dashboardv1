import { PageHeader } from "@/components/page-header"
import { LaneMilesChart } from "@/components/lane-miles-chart"

export default function LaneMilesPage() {
  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Lane Miles" description="Distribution of rigid pavement lengths in Texas (1960-2022)" />
      <div className="flex-1 p-4">
        <LaneMilesChart />
      </div>
    </div>
  )
}
