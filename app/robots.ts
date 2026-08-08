import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/wp-admin/", "/wp-content/"],
    },
    sitemap: "https://www.slotsband.com/sitemap.xml",
  }
}
