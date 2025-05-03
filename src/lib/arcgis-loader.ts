import { loadModules as esriLoader } from "esri-loader"

// Options for loading the ArcGIS API
const options = {
  // Don't load CSS through the loader, we'll handle it separately
  css: false,
  version: "4.28",
}

/**
 * Load ArcGIS modules using esri-loader
 * This function returns the modules as 'any' type since they're loaded dynamically
 * @param moduleNames Array of module names to load
 * @returns Promise that resolves to the loaded modules
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadModules(moduleNames: string[]): Promise<any[]> {
  return esriLoader(moduleNames, options)
}
