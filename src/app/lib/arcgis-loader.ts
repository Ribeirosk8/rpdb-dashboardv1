import { loadModules as esriLoader } from "esri-loader"

// Options for loading the ArcGIS API
const options = {
  css: true,
  version: "4.28",
}

/**
 * Load ArcGIS modules using esri-loader
 * @param modules Array of module names to load
 * @returns Promise that resolves to the loaded modules
 */
export function loadModules(modules: string[]): Promise<unknown[]> {
  return esriLoader(modules, options)
}
