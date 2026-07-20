/**
 * A cookie-free Supabase client safe to use at build time (generateStaticParams).
 * Never use this for authenticated or session-aware requests.
 */
import { createClient } from "@supabase/supabase-js"

export function createBuildClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

/** Fetch only the slugs needed to generate static paths for casino pages. */
export async function getCasinoSlugs(): Promise<string[]> {
  const supabase = createBuildClient()
  const { data, error } = await supabase
    .from("casinos")
    .select("slug")
    .eq("is_active", true)
  if (error) {
    console.error("[v0] getCasinoSlugs error:", error.message)
    return []
  }
  return (data ?? []).map((r) => r.slug as string)
}

/** Fetch only the slugs needed to generate static paths for game pages. */
export async function getGameSlugs(): Promise<string[]> {
  const supabase = createBuildClient()
  const { data, error } = await supabase
    .from("games")
    .select("slug")
    .eq("is_active", true)
  if (error) {
    console.error("[v0] getGameSlugs error:", error.message)
    return []
  }
  return (data ?? []).map((r) => r.slug as string)
}
