// next.config.js
const checkEnvVariables = require("./check-env-variables")
checkEnvVariables()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: (() => {
      const patterns = [
        { protocol: "http",  hostname: "localhost" },
        // Demo S3
        {
          protocol: "https",
          hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
        },
        {
          protocol: "https",
          hostname: "medusa-server-testing.s3.amazonaws.com",
        },
        {
          protocol: "https",
          hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
        },
      ]

      // NEXT_PUBLIC_BASE_URL
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        const base = process.env.NEXT_PUBLIC_BASE_URL.replace(/^https?:\/\//, "")
        patterns.push({
          protocol: process.env.NEXT_PUBLIC_BASE_URL.startsWith("https") ? "https" : "http",
          hostname: base,
        })
      }

      // NEXT_PUBLIC_MEDUSA_BACKEND_URL
      if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
        const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/^https?:\/\//, "")
        patterns.push({
          protocol: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.startsWith("https") ? "https" : "http",
          hostname: backend,
        })
      }

      // MINIO
      if (process.env.NEXT_PUBLIC_MINIO_ENDPOINT) {
        patterns.push({
          protocol: "https",
          hostname: process.env.NEXT_PUBLIC_MINIO_ENDPOINT,
        })
      }

      return patterns
    })(),
  },
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
}

module.exports = nextConfig
