import { PageHeader } from "@/components/page-header"
import { Level1Sections } from "@/components/level-1-sections"

export default function Level1Page() {
  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="Level 1 Sections"
        description="Pavement sections initially selected for evaluation in TxDOT Research Project 0-5445"
      />
      <div className="flex-1 p-4">
        <Level1Sections />
      </div>
    </div>
  )
}
