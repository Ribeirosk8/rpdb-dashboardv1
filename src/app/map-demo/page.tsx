import { PageHeader } from "@/components/page-header"
import { GradualMap } from "@/components/gradual-map"

export default function MapDemoPage() {
  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Map Points Demo" description="Demonstration of gradually adding points to the ArcGIS map" />
      <div className="flex-1 p-4">
        <GradualMap />
      </div>
    </div>
  )
}
