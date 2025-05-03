import { MapView } from "@/components/map-view"
import { PageHeader } from "@/components/page-header"

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="Rigid Pavement Database (RPDB)"
        description="Project Level Performance Database for Rigid Pavements in Texas"
      />
      <div className="flex-1 p-4">
        <MapView />
      </div>
    </div>
  )
}
