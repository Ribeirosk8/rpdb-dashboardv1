/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["esri-loader"],
    webpack: (config) => {
      // Handle CSS imports from ArcGIS
      config.module.rules.push({
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      })
  
      return config
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      unoptimized: true,
    },
  }
  
  module.exports = nextConfig
  