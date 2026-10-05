import { unstable_cache } from "next/cache"
import { createBuildClient } from "@/lib/supabase/build-client"
import { publicCache } from "@/lib/supabase/public-cache"
import type { Lang } from "@/lib/types"

export type RouteSlugMap = Record<string, string>

// Read by the [lang] layout on every page, so it must stay cookie-free —
// a cookies() call here made the entire public site render dynamically.
async function fetchRouteSlugsByLang(lang: Lang): Promise<RouteSlugMap> {
  try {
    const supabase = createBuildClient()
    const { data, error } = await supabase
      .from("pages")
      .select("route_key, slug")
      .eq("lang", lang)
      .eq("is_code_route", true)
      .not("route_key", "is", null)
    const map: RouteSlugMap = {}
    if (error) {
      // route_key column not yet in DB — use slug as both key and value
      const { data: fb } = await supabase
        .from("pages")
        .select("slug")
        .eq("lang", lang)
        .eq("is_code_route", true)
      for (const row of fb ?? []) {
        map[row.slug as string] = row.slug as string
      }
      return map
    }
    for (const row of data ?? []) {
      if (row.route_key) map[row.route_key as string] = row.slug as string
    }
    return map
  } catch {
    return {}
  }
}

export const getRouteSlugsByLang = unstable_cache(fetchRouteSlugsByLang, ["route-slugs-by-lang"], publicCache("pages"))
