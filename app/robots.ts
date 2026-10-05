import type { MetadataRoute } from "next"

// AI-training scrapers and SEO-tool crawlers: no search traffic in return for
// the function invocations they cost. (Bytespider & co. often ignore this —
// they're blocked in the Vercel Firewall too.)
const BLOCKED_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "PerplexityBot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "PetalBot",
  "BLEXBot",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/*/mene/", // affiliate redirects
          "/*/haku", // search results (noindex)
          "/*/search",
          "/*?filter=",
          "/*?q=",
          "/wp-admin/",
          "/wp-content/",
        ],
      },
      { userAgent: BLOCKED_BOTS, disallow: "/" },
    ],
    sitemap: "https://www.slotsband.com/sitemap.xml",
  }
}
