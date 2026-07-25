import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Lang } from "@/lib/types"

export type RouteSlugMap = Record<string, string>

export const getRouteSlugsByLang = cache(async (lang: Lang): Promise<RouteSlugMap> => {
  try {
    const supabase = await createClient()
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
})
