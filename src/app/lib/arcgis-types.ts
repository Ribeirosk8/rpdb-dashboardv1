// Basic type definitions for ArcGIS JavaScript API

// Common interfaces
export interface SpatialReference {
    wkid: number
  }
  
  // Geometry interfaces
  export interface Point {
    type: "point"
    x: number
    y: number
    spatialReference: SpatialReference
  }
  
  // Symbol interfaces
  export interface SimpleMarkerSymbol {
    type: "simple-marker"
    color: number[]
    size: number
    outline: {
      color: number[]
      width: number
    }
  }
  
  // Popup interfaces
  export interface PopupTemplate {
    title: string
    content: string
  }
  
  // Graphic interface
  export interface Graphic {
    geometry: Point
    symbol: SimpleMarkerSymbol
    attributes: Record<string, unknown>
    popupTemplate?: PopupTemplate
  }
  
  // Layer interfaces
  export interface GraphicsLayer {
    add(graphic: Graphic): void
    removeAll(): void
  }
  
  // Map interface
  export interface Map {
    basemap: string
    add(layer: GraphicsLayer): void
  }
  
  // View interfaces
  export interface MapView {
    container: HTMLDivElement
    map: Map
    center?: number[]
    zoom?: number
    when(): Promise<void>
    destroy(): void
  }
  
  // Module constructors
  export interface ArcGISModules {
    Map: new (options: { basemap: string }) => Map
    MapView: new (options: {
      container: HTMLDivElement
      map: Map
      center?: number[]
      zoom?: number
    }) => MapView
    GraphicsLayer: new () => GraphicsLayer
    Point: new (options: {
      longitude: number
      latitude: number
    }) => Point
    Graphic: new (options: {
      geometry: Point
      symbol: SimpleMarkerSymbol
      attributes: Record<string, unknown>
      popupTemplate?: PopupTemplate
    }) => Graphic
    SimpleMarkerSymbol: new (options: {
      color: number[]
      size: number
      outline: {
        color: number[]
        width: number
      }
    }) => SimpleMarkerSymbol
    PopupTemplate: new (options: {
      title: string
      content: string
    }) => PopupTemplate
  }
  