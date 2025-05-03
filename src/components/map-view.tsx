"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { BasicMap } from "@/components/basic-map"

export function MapView() {
  const [showReferenceMarkers, setShowReferenceMarkers] = useState(true)
  const [showPMISPoints, setShowPMISPoints] = useState(true)
  const [mapType, setMapType] = useState<string>("streets-vector")

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <CardTitle>Texas Highway Network</CardTitle>
            <CardDescription>Interactive map of rigid pavements in Texas</CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="reference-markers" checked={showReferenceMarkers} onCheckedChange={setShowReferenceMarkers} />
              <Label htmlFor="reference-markers">Reference Markers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="pmis-points" checked={showPMISPoints} onCheckedChange={setShowPMISPoints} />
              <Label htmlFor="pmis-points">PMIS Points</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-5rem)]">
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
      </CardContent>
    </Card>
  )
}
