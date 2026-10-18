import type { MetadataRoute } from "next"

// AI-training scrapers and SEO-tool crawlers: no search traffic in return for
// the function invocations they cost. (Bytespider & co. often ignore this —
// they're blocked in the Vercel Firewall too.) AI search / user-fetch agents
// (OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User,
// Claude-SearchBot, Claude-User) stay allowed: they cite the site and send
// visitors.
const BLOCKED_BOTS = [
  "GPTBot",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
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
