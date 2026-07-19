/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable the React compiler to prevent Turbopack from generating extra
  // HMR module boundaries that race against router initialization.
  reactCompiler: false,
}

export default nextConfig
