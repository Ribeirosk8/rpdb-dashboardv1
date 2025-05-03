import { PageHeader } from "@/components/page-header"
import { UploadDataForm } from "@/components/upload-data-form"

export default function UploadPage() {
  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Upload Data" description="Add new data files to the RPDB system" />
      <div className="flex-1 p-4">
        <UploadDataForm />
      </div>
    </div>
  )
}
