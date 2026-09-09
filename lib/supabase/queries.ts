/**
 * Shared Supabase query helpers used by both admin and public pages.
 * Always call createClient() from the server client inside each function.
 */
import { unstable_cache } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { createBuildClient } from "@/lib/supabase/build-client"
import type { Casino, Bonus, Game, Raffle, BonusHunt } from "@/lib/types"

// Service-role client for admin-only reads (newsletter subscribers, dashboard
// stats) that must bypass RLS — these tables have no anon/authenticated
// SELECT policy once RLS is enabled.
function adminDb() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// The public-facing reads below (casinos/bonuses/banners/games/taxonomy) are
// unauthenticated and read the same publicly-readable rows for every visitor,
// but were being re-run uncached on every request AND every Next.js
// background link-prefetch — several times per real pageview, plus every bot
// crawl. That's what blew through Supabase's egress quota. Caching them for
// 60s (via a cookie-free client, since unstable_cache can't depend on
// request-scoped cookies) collapses that burst into one shared DB read;
// admin edits still show up within a minute.
const PUBLIC_CACHE = { revalidate: 60 }

// ─── Casinos ──────────────────────────────────────────────────────────────────

async function fetchCasinos(options?: {
  activeOnly?: boolean
  featuredOnly?: boolean
  lang?: string
  sort?: "rank" | "rating"
}): Promise<Casino[]> {
  const supabase = createBuildClient()

  const sortByRating = options?.sort === "rating"
  let query = supabase
    .from("casinos")
    .select("*")
    .order(sortByRating ? "rating" : "rank", {
      ascending: !sortByRating,
      nullsFirst: false,
    })

  if (options?.activeOnly) query = query.eq("is_active", true)
  if (options?.featuredOnly) query = query.eq("is_featured", true)

  const { data, error } = await query
  if (error) {
    console.error("[v0] getCasinos error:", error.message)
    return []
  }
  return (data ?? []) as Casino[]
}
export const getCasinos = unstable_cache(fetchCasinos, ["casinos"], PUBLIC_CACHE)

async function fetchCasinosWithTermIds(): Promise<Casino[]> {
  const supabase = createBuildClient()
  const { data, error } = await supabase
    .from("casinos")
    .select("*, casino_taxonomy_terms(term_id)")
    .eq("is_active", true)
    .order("rank", { ascending: true, nullsFirst: false })
  if (error) {
    console.error("[v0] getCasinosWithTermIds error:", error.message)
    return []
  }
  return (data ?? []).map((c: any) => ({
    ...c,
    term_ids: (c.casino_taxonomy_terms ?? []).map((r: any) => r.term_id as string),
    casino_taxonomy_terms: undefined,
  })) as Casino[]
}
export const getCasinosWithTermIds = unstable_cache(fetchCasinosWithTermIds, ["casinos-with-term-ids"], PUBLIC_CACHE)

export async function getAdminCasinos(): Promise<Casino[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("casinos")
    .select("*")
    .order("is_active", { ascending: false })
    .order("rank", { ascending: true, nullsFirst: false })
  if (error) {
    console.error("[admin] getAdminCasinos error:", error.message)
    return []
  }
  return (data ?? []) as Casino[]
}

async function fetchCasinoBySlug(slug: string): Promise<Casino | null> {
  const supabase = createBuildClient()
  const { data, error } = await supabase
    .from("casinos")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    console.error("[v0] getCasinoBySlug error:", error.message)
    return null
  }
  return data as Casino
}
export const getCasinoBySlug = unstable_cache(fetchCasinoBySlug, ["casino-by-slug"], PUBLIC_CACHE)

export async function upsertCasino(casino: Partial<Casino> & { slug: string }): Promise<Casino | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("casinos")
    .upsert(casino, { onConflict: "slug" })
    .select()
    .single()

  if (error) {
    console.error("[v0] upsertCasino error:", error.message)
    return null
  }
  return data as Casino
}

export async function deleteCasino(id: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from("casinos").delete().eq("id", id)
  if (error) {
    console.error("[v0] deleteCasino error:", error.message)
    return false
  }
  return true
}

// ─── Bonuses ──────────────────────────────────────────────────────────────────

async function fetchBonuses(options?: { lang?: string; activeOnly?: boolean }): Promise<Bonus[]> {
  const supabase = createBuildClient()
  let query = supabase
    .from("bonuses")
    .select("*, casinos(name, logo_url, slug)")
    .order("created_at", { ascending: false })

  if (options?.activeOnly) query = query.eq("is_active", true)

  const { data, error } = await query
  if (error) {
    console.error("[v0] getBonuses error:", error.message)
    return []
  }

  const lang = options?.lang ?? "fi"
  return (data ?? []).map((row: any) => {
    let description = row.description ?? ""
    if (description.startsWith("{")) {
      try {
        const parsed = JSON.parse(description)
        description = parsed[lang] ?? parsed.fi ?? description
      } catch {}
    }
    return {
      ...row,
      description,
      casino_name: row.casinos?.name,
      casino_logo: row.casinos?.logo_url,
      casino_slug: row.casinos?.slug,
    }
  }) as Bonus[]
}
export const getBonuses = unstable_cache(fetchBonuses, ["bonuses"], PUBLIC_CACHE)

async function fetchBonusesByCasino(casinoId: string, lang = "fi"): Promise<Bonus[]> {
  const supabase = createBuildClient()
  const today = new Date().toISOString().split("T")[0]
  const { data, error } = await supabase
    .from("bonuses")
    .select("*, casinos(name, logo_url, slug)")
    .eq("casino_id", casinoId)
    .eq("is_active", true)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getBonusesByCasino]", error.message)
    return []
  }

  return (data ?? []).map((row: any) => {
    let description = row.description ?? ""
    if (description.startsWith("{")) {
      try {
        const parsed = JSON.parse(description)
        description = parsed[lang] ?? parsed.fi ?? description
      } catch {}
    }
    return {
      ...row,
      description,
      casino_name: row.casinos?.name,
      casino_logo: row.casinos?.logo_url,
      casino_slug: row.casinos?.slug,
    }
  }) as Bonus[]
}
export const getBonusesByCasino = unstable_cache(fetchBonusesByCasino, ["bonuses-by-casino"], PUBLIC_CACHE)

// ─── Banners ──────────────────────────────────────────────────────────────────

async function fetchBanners(lang: string) {
  const supabase = createBuildClient()
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .eq("lang", lang)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[v0] getBanners error:", error.message)
    return []
  }
  return data ?? []
}
export const getBanners = unstable_cache(fetchBanners, ["banners"], PUBLIC_CACHE)

// ─── Games ────────────────────────────────────────────────────────────────────

async function fetchGames(options?: { activeOnly?: boolean; featuredOnly?: boolean }): Promise<Game[]> {
  const supabase = createBuildClient()
  let query = supabase.from("games").select("*").order("name", { ascending: true })

  if (options?.activeOnly) query = query.eq("is_active", true)
  if (options?.featuredOnly) query = query.eq("is_featured", true)

  const { data, error } = await query
  if (error) {
    console.error("[v0] getGames error:", error.message)
    return []
  }
  return (data ?? []) as Game[]
}
export const getGames = unstable_cache(fetchGames, ["games"], PUBLIC_CACHE)

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function getNewsletterSubscribers() {
  const supabase = adminDb()
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })

  if (error) {
    console.error("[v0] getNewsletterSubscribers error:", error.message)
    return []
  }
  return data ?? []
}

export async function subscribeNewsletter(email: string, lang = "fi", source?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email, lang, source, is_active: true }, { onConflict: "email" })

  return !error
}

// ─── Affiliate clicks ─────────────────────────────────────────────────────────

export async function trackAffiliateClick(casinoSlug: string, casinoId?: string, lang?: string) {
  const supabase = await createClient()
  await supabase.from("affiliate_clicks").insert({
    casino_slug: casinoSlug,
    casino_id: casinoId ?? null,
    lang: lang ?? null,
  })
}

// ─── Stream status ────────────────────────────────────────────────────────────

export async function getStreamOverride() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("stream_status")
    .select("*")
    .eq("platform", "kick")
    .single()

  return data ?? null
}

export async function setStreamOverride(opts: {
  mode: "auto" | "manual"
  isLive: boolean
  title?: string
  viewers?: number
  autoResetHours?: number
}) {
  const supabase = await createClient()
  const expiresAt = opts.mode === "manual" && opts.isLive && opts.autoResetHours
    ? new Date(Date.now() + opts.autoResetHours * 3600 * 1000).toISOString()
    : null

  const row = {
    platform: "kick",
    override_mode: opts.mode,
    is_live: opts.isLive,
    title: opts.title ?? "",
    viewers: opts.viewers ?? 0,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("stream_status")
    .upsert(row, { onConflict: "platform" })
    .select()
    .single()

  if (error) console.error("[v0] setStreamOverride error:", error.message)
  return data
}

// ─── Raffles ─────────────────────────────────────────────────────────────────

export async function getRaffles(): Promise<Raffle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("raffle_sessions")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] getRaffles error:", error.message)
    return []
  }

  // Parse description JSON for enriched fields (casino_name, casino_slug, how_to, past_winners)
  // until proper schema columns are added via migration.
  const rows = (data ?? []).map((row: any) => {
    let extra: Record<string, any> = {}
    try {
      if (typeof row.description === "string" && row.description.trim().startsWith("{")) {
        extra = JSON.parse(row.description)
      }
    } catch {}
    return {
      ...row,
      casino_name: row.casino_partner ?? extra.casino_name ?? undefined,
      casino_slug: row.casino_slug ?? extra.casino_slug ?? undefined,
      how_to:      row.entry_requirements ?? extra.how_to ?? [],
      past_winners: extra.past_winners ?? [],
      prize:       row.prize_name ?? row.prize ?? undefined,
    } as Raffle
  })

  // Attach upcoming rows onto the active raffle so the client can render them
  const active   = rows.find((r) => r.status === "active")
  const upcoming = rows.filter((r) => r.status === "upcoming")
  if (active && upcoming.length > 0) active.upcoming = upcoming

  return rows
}

// ─── Bonus Hunts ──────────────────────────────────────────────────────────────

export async function getBonusHunts(): Promise<BonusHunt[]> {
  const supabase = await createClient()
  const { data: sessions, error } = await supabase
    .from("bonushunt_sessions")
    .select("*, bonushunt_slots(*), bonushunt_predictions!session_id(*)")
    .order("date", { ascending: false })
    .order("sort_order", { foreignTable: "bonushunt_slots", ascending: true })

  if (error) {
    console.error("[v0] getBonusHunts error:", error.message)
    return []
  }

  return (sessions ?? []).map((s: any) => ({
    ...s,
    is_active: s.status === "active",
    total_invested: s.total_buyin ?? 0,
    slots: (s.bonushunt_slots ?? []).map((slot: any) => ({
      id: slot.id,
      game: slot.game,
      provider: slot.provider,
      balance: slot.balance,
      bet: slot.bet,
      bonus_value: slot.bonus_value,
      multiplier: slot.multiplier ?? null,
    })),
    predictions: (s.bonushunt_predictions ?? [])
      .map((p: any) => ({
        id: p.id,
        session_id: p.session_id,
        nickname: p.username,
        amount: p.predicted_total,
        game: p.predicted_game ?? null,
        submitted_at: p.submitted_at,
      }))
      .sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()),
  })) as BonusHunt[]
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const supabase = adminDb()

  const [casinos, bonuses, games, subscribers, clicks] = await Promise.all([
    supabase.from("casinos").select("id, is_active, is_featured", { count: "exact" }),
    supabase.from("bonuses").select("id", { count: "exact" }),
    supabase.from("games").select("id", { count: "exact" }),
    supabase.from("newsletter_subscribers").select("id", { count: "exact" }).eq("is_active", true),
    supabase.from("affiliate_clicks").select("id", { count: "exact" }),
  ])

  return {
    totalCasinos: casinos.count ?? 0,
    activeCasinos: (casinos.data ?? []).filter((c) => c.is_active).length,
    featuredCasinos: (casinos.data ?? []).filter((c) => c.is_featured).length,
    totalBonuses: bonuses.count ?? 0,
    totalGames: games.count ?? 0,
    totalSubscribers: subscribers.count ?? 0,
    totalClicks: clicks.count ?? 0,
  }
}
