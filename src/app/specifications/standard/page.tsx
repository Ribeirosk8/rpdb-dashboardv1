import { PageHeader } from "@/components/page-header"
import { SpecificationsTable } from "@/components/specifications-table"

export default function StandardSpecificationsPage() {
  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="Standard Specifications"
        description="Official guidelines and requirements for construction and maintenance"
      />
      <div className="flex-1 p-4">
        <SpecificationsTable
          type="standard"
          title="Standard Specifications"
          description="Guidelines and requirements for the construction and maintenance of highways, streets, and bridges in Texas"
        />
      </div>
    </div>
  )
}
