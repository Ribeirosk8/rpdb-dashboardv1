"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LTEChart, DeflectionChart } from "@/components/level-1-sections-charts"
import { BasicMap } from "@/components/basic-map"
import { pavementSections } from "@/lib/arcgis-utils"

interface Section {
  id: string
  highway: string
  district: string
  county: string
  pavementType: string
  slabThickness: number
  constructionYear: number
}

export function Level1Sections() {
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [activeTab, setActiveTab] = useState("map")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTab, setDialogTab] = useState("section-data")
  const [mapType, setMapType] = useState("streets-vector")

  // Sample data for demonstration - using the data from arcgis-utils.ts
  const sections: Section[] = pavementSections.map((point) => ({
    id: point.id,
    highway: point.attributes.highway,
    district: point.attributes.district,
    county: point.attributes.county,
    pavementType: point.attributes.pavementType,
    slabThickness: point.attributes.slabThickness,
    constructionYear: point.attributes.constructionYear,
  }))

  const handleRowClick = (section: Section) => {
    setSelectedSection(section)
    setDialogOpen(true)
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Level 1 Sections</CardTitle>
          <CardDescription>Pavement sections with FWD testing and performance monitoring</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-5rem)]">
            <div className="px-4">
              <TabsList>
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="map" className="h-full m-0">
              <div className="w-full h-full">
                <Tabs defaultValue="streets-vector" value={mapType} onValueChange={setMapType} className="h-full">
                  <div className="px-4 pt-2">
                    <TabsList>
                      <TabsTrigger value="streets-vector">Streets</TabsTrigger>
                      <TabsTrigger value="satellite">Satellite</TabsTrigger>
                      <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
                      <TabsTrigger value="topo-vector">Topographic</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value={mapType} className="h-[calc(100%-3rem)] m-0">
                    <BasicMap mapType={mapType} />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
            <TabsContent value="table" className="h-full m-0 p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Highway</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>County</TableHead>
                    <TableHead>Pavement Type</TableHead>
                    <TableHead>Slab Thickness (in)</TableHead>
                    <TableHead>Construction Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow
                      key={section.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleRowClick(section)}
                    >
                      <TableCell>{section.id}</TableCell>
                      <TableCell>{section.highway}</TableCell>
                      <TableCell>{section.district}</TableCell>
                      <TableCell>{section.county}</TableCell>
                      <TableCell>{section.pavementType}</TableCell>
                      <TableCell>{section.slabThickness}</TableCell>
                      <TableCell>{section.constructionYear}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedSection?.highway} - {selectedSection?.id}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={dialogTab} onValueChange={setDialogTab} className="h-[calc(100%-3rem)]">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="section-data">Section Data</TabsTrigger>
              <TabsTrigger value="survey-data">Survey Data</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="section-data" className="h-[calc(100%-3rem)] overflow-auto">
              {selectedSection && (
                <div className="space-y-6 p-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Location Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">District</p>
                        <p className="font-medium">{selectedSection.district}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">County</p>
                        <p className="font-medium">{selectedSection.county}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">GPS Coordinates</p>
                        <p className="font-medium">
                          {pavementSections.find((p) => p.id === selectedSection.id)?.latitude.toFixed(4)}° N,{" "}
                          {pavementSections.find((p) => p.id === selectedSection.id)?.longitude.toFixed(4)}° W
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Pavement Structure</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Pavement Type</p>
                        <p className="font-medium">{selectedSection.pavementType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Slab Thickness</p>
                        <p className="font-medium">{selectedSection.slabThickness} inches</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Subbase Thickness</p>
                        <p className="font-medium">6 inches</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Subgrade Thickness</p>
                        <p className="font-medium">12 inches</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Construction Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">CSJ</p>
                        <p className="font-medium">0015-13-077</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Construction Year</p>
                        <p className="font-medium">{selectedSection.constructionYear}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">As-Built Plans</p>
                        <p className="font-medium text-blue-600 underline cursor-pointer">View Plans</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="survey-data" className="h-[calc(100%-3rem)] overflow-auto">
              <div className="space-y-6 p-4">
                <LTEChart />
                <DeflectionChart />

                <div>
                  <h3 className="text-lg font-semibold mb-2">Visual Survey Photos</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">2018 Survey</p>
                    </div>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">2020 Survey</p>
                    </div>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">2022 Survey</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reports" className="h-[calc(100%-3rem)] overflow-auto">
              <div className="space-y-4 p-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-semibold">Initial Evaluation Report (2005)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Baseline performance assessment conducted as part of Project 0-5445.
                  </p>
                  <button className="mt-2 text-sm text-blue-600">Download PDF</button>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-semibold">Five-Year Performance Report (2010)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive evaluation of pavement condition after 5 years of service.
                  </p>
                  <button className="mt-2 text-sm text-blue-600">Download PDF</button>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-semibold">Project 0-6274 Evaluation (2014)</h3>
                  <p className="text-sm text-muted-foreground mt-1">Follow-up assessment as part of Project 0-6274.</p>
                  <button className="mt-2 text-sm text-blue-600">Download PDF</button>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-semibold">Recent Performance Analysis (2022)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Latest evaluation of pavement condition and performance trends.
                  </p>
                  <button className="mt-2 text-sm text-blue-600">Download PDF</button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
