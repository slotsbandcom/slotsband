/**
 * Shared Supabase query helpers used by both admin and public pages.
 * Always call createClient() from the server client inside each function.
 */
import { createClient } from "@/lib/supabase/server"
import type { Casino, Bonus, Game, Raffle, BonusHunt } from "@/lib/types"

// ─── Casinos ──────────────────────────────────────────────────────────────────

export async function getCasinos(options?: {
  activeOnly?: boolean
  featuredOnly?: boolean
  lang?: string
  sort?: "rank" | "rating"
}): Promise<Casino[]> {
  const supabase = await createClient()

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

export async function getAdminCasinos(): Promise<Casino[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("casinos")
    .select("*")
    .order("is_active", { ascending: false })
    .order("rating",    { ascending: false })
  if (error) {
    console.error("[admin] getAdminCasinos error:", error.message)
    return []
  }
  return (data ?? []) as Casino[]
}

export async function getCasinoBySlug(slug: string): Promise<Casino | null> {
  const supabase = await createClient()
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

export async function getBonuses(options?: { lang?: string; activeOnly?: boolean }): Promise<Bonus[]> {
  const supabase = await createClient()
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

export async function getBonusesByCasino(casinoId: string, lang = "fi"): Promise<Bonus[]> {
  const supabase = await createClient()
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

// ─── Games ────────────────────────────────────────────────────────────────────

export async function getGames(options?: { activeOnly?: boolean; featuredOnly?: boolean }): Promise<Game[]> {
  const supabase = await createClient()
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

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function getNewsletterSubscribers() {
  const supabase = await createClient()
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
    .select("*, bonushunt_slots(*)")
    .order("date", { ascending: false })

  if (error) {
    console.error("[v0] getBonusHunts error:", error.message)
    return []
  }

  return (sessions ?? []).map((s: any) => ({
    ...s,
    is_active: s.status === "active",
    total_invested: s.total_buyin ?? 0,
    slots: (s.bonushunt_slots ?? []).map((slot: any) => ({
      game: slot.game,
      provider: slot.provider,
      balance: slot.balance,
      bet: slot.bet,
      bonus_value: slot.bonus_value,
      multiplier: slot.multiplier ?? null,
    })),
  })) as BonusHunt[]
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const supabase = await createClient()

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
