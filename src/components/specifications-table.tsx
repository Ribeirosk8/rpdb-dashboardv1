"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, FileText, Search } from "lucide-react"

interface SpecificationsTableProps {
  type: "standard" | "manual" | "roadway"
  title: string
  description: string
}

interface Specification {
  id: string
  title: string
  year: number
  category: string
  fileSize: string
}

export function SpecificationsTable({ type, title, description }: SpecificationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Sample data for demonstration
  const specifications: Record<string, Specification[]> = {
    standard: [
      {
        id: "SS-2014",
        title: "Standard Specifications for Construction and Maintenance of Highways, Streets, and Bridges",
        year: 2014,
        category: "Construction",
        fileSize: "12.5 MB",
      },
      {
        id: "SS-2004",
        title: "Standard Specifications for Construction and Maintenance of Highways, Streets, and Bridges",
        year: 2004,
        category: "Construction",
        fileSize: "10.2 MB",
      },
      {
        id: "SS-1993",
        title: "Standard Specifications for Construction and Maintenance of Highways, Streets, and Bridges",
        year: 1993,
        category: "Construction",
        fileSize: "8.7 MB",
      },
    ],
    manual: [
      {
        id: "PDM-2023",
        title: "Pavement Design Manual",
        year: 2023,
        category: "Design",
        fileSize: "8.3 MB",
      },
      {
        id: "HDM-2022",
        title: "Hydraulic Design Manual",
        year: 2022,
        category: "Design",
        fileSize: "15.1 MB",
      },
      {
        id: "GDM-2021",
        title: "Geotechnical Manual",
        year: 2021,
        category: "Design",
        fileSize: "9.8 MB",
      },
    ],
    roadway: [
      {
        id: "RS-2022-01",
        title: "Concrete Pavement Details",
        year: 2022,
        category: "Pavement",
        fileSize: "5.2 MB",
      },
      {
        id: "RS-2022-02",
        title: "Rigid Pavement Contraction Design",
        year: 2022,
        category: "Pavement",
        fileSize: "3.7 MB",
      },
      {
        id: "RS-2021-05",
        title: "Concrete Pavement Joints",
        year: 2021,
        category: "Pavement",
        fileSize: "4.1 MB",
      },
    ],
  }

  const filteredSpecs = specifications[type].filter(
    (spec) =>
      spec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search specifications..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSpecs.length > 0 ? (
              filteredSpecs.map((spec) => (
                <TableRow key={spec.id}>
                  <TableCell className="font-medium">{spec.id}</TableCell>
                  <TableCell>{spec.title}</TableCell>
                  <TableCell>{spec.year}</TableCell>
                  <TableCell>{spec.category}</TableCell>
                  <TableCell>{spec.fileSize}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No specifications found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
