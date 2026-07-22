/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Allow images from Supabase Storage and the old WordPress site.
    // `unoptimized` is NOT set globally — each CasinoLogo passes it per-image
    // so Next.js doesn't proxy Supabase CDN URLs through its optimizer.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "slotsband.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.slotsband.com",
        pathname: "/**",
      },
    ],
  },
  // Disable the React compiler to prevent Turbopack from generating extra
  // HMR module boundaries that race against router initialization.
  reactCompiler: false,
}

export default nextConfig
