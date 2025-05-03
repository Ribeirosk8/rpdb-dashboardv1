// Types for ArcGIS map points
export interface MapPoint {
    id: string
    type: "pavement" | "reference" | "pmis" | "traffic"
    latitude: number
    longitude: number
    attributes: Record<string, unknown>
  }
  
  // Sample data for pavement sections
  export const pavementSections: MapPoint[] = [
    {
      id: "CRCP-001",
      type: "pavement",
      latitude: 30.2672,
      longitude: -97.7431,
      attributes: {
        highway: "IH-35",
        district: "Austin",
        county: "Travis",
        pavementType: "CRCP",
        slabThickness: 13,
        constructionYear: 2015,
      },
    },
    {
      id: "JCP-001",
      type: "pavement",
      latitude: 29.7604,
      longitude: -95.3698,
      attributes: {
        highway: "IH-10",
        district: "Houston",
        county: "Harris",
        pavementType: "JCP",
        slabThickness: 12,
        constructionYear: 2010,
      },
    },
    // Add more pavement sections as needed
  ]
  
  // Sample data for traffic points
  export const trafficPoints: MapPoint[] = [
    {
      id: "TRAFFIC-001",
      type: "traffic",
      latitude: 30.2672,
      longitude: -97.7431,
      attributes: {
        highway: "IH-35",
        location: "Austin Downtown",
        aadt: 150000,
        truckPercentage: 12,
        growthRate: 2.5,
      },
    },
    {
      id: "TRAFFIC-002",
      type: "traffic",
      latitude: 29.7604,
      longitude: -95.3698,
      attributes: {
        highway: "IH-10",
        location: "Houston Downtown",
        aadt: 200000,
        truckPercentage: 15,
        growthRate: 3.0,
      },
    },
    // Add more traffic points as needed
  ]
  
  // Sample data for PMIS points
  export const pmisPoints: MapPoint[] = [
    {
      id: "PMIS-001",
      type: "pmis",
      latitude: 30.2672,
      longitude: -97.7431,
      attributes: {
        highway: "IH-35",
        conditionScore: 95,
        distressScore: 92,
        rideScore: 98,
        year: 2023,
      },
    },
    {
      id: "PMIS-002",
      type: "pmis",
      latitude: 29.7604,
      longitude: -95.3698,
      attributes: {
        highway: "IH-10",
        conditionScore: 88,
        distressScore: 85,
        rideScore: 90,
        year: 2023,
      },
    },
    // Add more PMIS points as needed
  ]
  
  // Sample data for reference markers
  export const referenceMarkers: MapPoint[] = [
    {
      id: "REF-001",
      type: "reference",
      latitude: 30.2672,
      longitude: -97.7431,
      attributes: {
        highway: "IH-35",
        markerNumber: 235,
        displacement: 0.5,
      },
    },
    {
      id: "REF-002",
      type: "reference",
      latitude: 29.7604,
      longitude: -95.3698,
      attributes: {
        highway: "IH-10",
        markerNumber: 768,
        displacement: 0.2,
      },
    },
    // Add more reference markers as needed
  ]
  