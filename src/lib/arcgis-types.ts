// Type definitions for ArcGIS JavaScript API modules

// Point Geometry
export interface Point {
    type: "point"
    x: number
    y: number
    spatialReference: {
      wkid: number
    }
  }
  
  // Symbol
  export interface SimpleMarkerSymbol {
    type: "simple-marker"
    color: number[]
    size: number
    outline: {
      color: number[]
      width: number
    }
  }
  
  // Popup Template
  export interface PopupTemplate {
    title: string
    content: string
  }
  
  // Graphic
  export interface Graphic {
    geometry: Point
    symbol: SimpleMarkerSymbol
    attributes: Record<string, unknown>
    popupTemplate?: PopupTemplate
  }
  
  // Graphics Layer
  export interface GraphicsLayer {
    add: (graphic: Graphic) => void
    removeAll: () => void
  }
  
  // Map
  export interface Map {
    basemap: string
    add: (layer: GraphicsLayer) => void
  }
  
  // MapView
  export interface MapView {
    container: HTMLDivElement
    map: Map
    center?: [number, number]
    zoom?: number
    when: () => Promise<void>
    destroy: () => void
    on: (event: string, callback: (event: unknown) => void) => void
    off: (event: string, callback: (event: unknown) => void) => void
    hitTest: (event: unknown) => Promise<{
      results: Array<{
        graphic: Graphic
      }>
    }>
  }
  