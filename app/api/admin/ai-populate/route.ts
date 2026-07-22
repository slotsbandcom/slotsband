import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { NextRequest } from "next/server"

// Allow up to 60 s — scraping (8s) + Stage-1 Claude (~15s) + Stage-2 Claude (~15s)
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,fi;q=0.8",
  "Cache-Control": "no-cache",
}

function stripToText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

interface ScrapedSource {
  url: string
  text: string
  type: string
}

async function fetchSource(url: string): Promise<{ url: string; text: string } | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, { headers: FETCH_HEADERS, signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    const html = await res.text()
    const text = stripToText(html)
    if (text.length < 500) return null
    return { url, text: text.slice(0, 14000) }
  } catch {
    return null
  }
}

async function scrapeAllSources(
  slug: string,
  casinoName: string,
  customUrl?: string,
): Promise<ScrapedSource[]> {
  if (customUrl) {
    const r = await fetchSource(customUrl)
    return r ? [{ ...r, type: "custom" }] : []
  }

  const nameDash = casinoName.toLowerCase().replace(/\s+/g, "-")

  const groups: Array<{ type: string; urls: string[] }> = [
    {
      type: "askgamblers",
      urls: [
        `https://www.askgamblers.com/online-casinos/reviews/${slug}`,
        `https://www.askgamblers.com/online-casinos/reviews/${slug}-casino`,
        `https://www.askgamblers.com/online-casinos/reviews/${nameDash}`,
        `https://www.askgamblers.com/online-casinos/reviews/${nameDash}-casino`,
      ],
    },
    {
      type: "casinoguru",
      urls: [
        `https://casinoguru.com/${slug}-casino-review`,
        `https://casinoguru.com/${slug}-review`,
        `https://www.casinoguru.com/${slug}-casino-review`,
        `https://www.casinoguru.com/${slug}-review`,
      ],
    },
    {
      type: "bojoko",
      urls: [
        `https://bojoko.com/casino-reviews/${slug}`,
        `https://bojoko.com/casino-reviews/${nameDash}`,
        `https://bojoko.com/casino/${slug}`,
      ],
    },
    {
      type: "official",
      urls: [
        `https://www.${slug}.com`,
        `https://${slug}.com`,
        `https://www.${slug}.com/promotions`,
        `https://www.${slug}.com/en`,
      ],
    },
  ]

  const flat = groups.flatMap(g => g.urls.map(url => ({ url, type: g.type })))
  const settled = await Promise.allSettled(
    flat.map(async ({ url, type }) => {
      const r = await fetchSource(url)
      return r ? ({ ...r, type } as ScrapedSource) : null
    })
  )

  const seen = new Set<string>()
  const scraped: ScrapedSource[] = []
  for (const r of settled) {
    if (r.status === "fulfilled" && r.value && !seen.has(r.value.type)) {
      scraped.push(r.value)
      seen.add(r.value.type)
    }
  }
  return scraped
}

function extractJsonText(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
}

// ── Type normalization ──────────────────────────────────────────────────────────

const INT_FIELDS = new Set([
  "min_deposit", "max_withdrawal_per_day", "max_withdrawal_per_month",
  "withdrawal_time_min_hours", "withdrawal_time_max_hours",
  "total_games_count", "slots_count", "welcome_bonus_percent",
  "welcome_bonus_max_amount", "welcome_bonus_wagering", "welcome_bonus_min_deposit",
  "no_deposit_amount", "free_spins_amount", "cashback_percent",
  "established_year", "trust_score", "rank", "registration_steps",
])

const FLOAT_FIELDS = new Set(["rating"])

const BOOL_FIELDS = new Set([
  "live_casino", "sports_betting", "poker", "jackpot_games", "game_demo_available",
  "mobile_optimized", "mobile_app_ios", "mobile_app_android",
  "live_chat_support", "support_email", "support_phone",
  "kyc_required", "is_pikakasino", "is_new", "is_featured", "is_active",
  "no_deposit_bonus", "loyalty_program", "vip_program", "is_verified",
])

const ARRAY_FIELDS = new Set([
  "payment_methods", "game_providers", "currencies_accepted",
  "languages_supported", "available_in", "restricted_in", "support_languages",
  "pros_fi", "cons_fi", "pros_en", "cons_en", "pros_uk", "cons_uk",
  "screenshots", "data_sources",
])

const JSONB_FIELDS = new Set(["faq_fi", "faq_en", "faq_uk"])

function toInt(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = typeof v === "string" ? parseInt(v, 10) : Math.round(Number(v))
  return isNaN(n) ? null : n
}

function toFloat(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return isNaN(n) ? null : n
}

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v
  if (typeof v === "string") return v.toLowerCase() === "true" || v === "1"
  if (typeof v === "number") return v !== 0
  return false
}

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === "string" && v.trim()) {
    try {
      const p = JSON.parse(v)
      return Array.isArray(p) ? p.map(String) : [v]
    } catch {
      return v.split(",").map(s => s.trim()).filter(Boolean)
    }
  }
  return []
}

function toJsonb(v: unknown): unknown[] | null {
  if (Array.isArray(v)) return v
  if (typeof v === "string" && v.trim()) {
    try {
      const p = JSON.parse(v)
      return Array.isArray(p) ? p : null
    } catch { return null }
  }
  return null
}

function normalizeAiData(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return raw
  const obj = raw as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj)) {
    if (key === "_sources") { out[key] = val; continue }
    if (INT_FIELDS.has(key))        out[key] = toInt(val)
    else if (FLOAT_FIELDS.has(key)) out[key] = toFloat(val)
    else if (BOOL_FIELDS.has(key))  out[key] = toBool(val)
    else if (ARRAY_FIELDS.has(key)) out[key] = toArray(val)
    else if (JSONB_FIELDS.has(key)) out[key] = toJsonb(val)
    else out[key] = val
  }
  return out
}

// ── Schemas ─────────────────────────────────────────────────────────────────────

const FactualSchema = z.object({
  license_authority: z.string().nullish(),
  license_number: z.string().nullish(),
  license_url: z.string().nullish(),
  established_year: z.number().nullish(),
  trust_score: z.number().nullish(),
  min_deposit: z.number().nullish(),
  max_withdrawal_per_day: z.number().nullish(),
  max_withdrawal_per_month: z.number().nullish(),
  withdrawal_time_min_hours: z.number().nullish(),
  withdrawal_time_max_hours: z.number().nullish(),
  payment_methods: z.array(z.string()).optional(),
  currencies_accepted: z.array(z.string()).optional(),
  game_providers: z.array(z.string()).optional(),
  total_games_count: z.number().nullish(),
  slots_count: z.number().nullish(),
  live_casino: z.boolean().optional(),
  sports_betting: z.boolean().optional(),
  poker: z.boolean().optional(),
  jackpot_games: z.boolean().optional(),
  game_demo_available: z.boolean().optional(),
  welcome_bonus_text: z.string().nullish(),
  welcome_bonus_percent: z.number().nullish(),
  welcome_bonus_max_amount: z.number().nullish(),
  welcome_bonus_currency: z.string().nullish(),
  welcome_bonus_wagering: z.number().nullish(),
  welcome_bonus_min_deposit: z.number().nullish(),
  no_deposit_bonus: z.boolean().optional(),
  no_deposit_amount: z.number().nullish(),
  free_spins_amount: z.number().nullish(),
  free_spins_game: z.string().nullish(),
  cashback_percent: z.number().nullish(),
  loyalty_program: z.boolean().optional(),
  vip_program: z.boolean().optional(),
  mobile_optimized: z.boolean().optional(),
  mobile_app_ios: z.boolean().optional(),
  mobile_app_android: z.boolean().optional(),
  live_chat_support: z.boolean().optional(),
  support_email: z.boolean().optional(),
  support_phone: z.boolean().optional(),
  support_languages: z.array(z.string()).optional(),
  kyc_required: z.boolean().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  is_pikakasino: z.boolean().optional(),
  available_in: z.array(z.string()).optional(),
  restricted_in: z.array(z.string()).optional(),
  languages_supported: z.array(z.string()).optional(),
  meta_title_fi: z.string().nullish(),
  meta_description_fi: z.string().nullish(),
  meta_title_en: z.string().nullish(),
  meta_description_en: z.string().nullish(),
  pros_fi: z.array(z.string()).optional(),
  cons_fi: z.array(z.string()).optional(),
  pros_en: z.array(z.string()).optional(),
  cons_en: z.array(z.string()).optional(),
  faq_fi: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  faq_en: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  data_sources: z.array(z.string()).optional(),
  data_confidence: z.enum(["high", "medium", "low"]).optional(),
  summary: z.string().nullish(),
  _sources: z.record(z.string(), z.string()).optional(),
})

const ReviewSchema = z.object({
  review_fi: z.string().nullish(),
  review_en: z.string().nullish(),
})

type FactualData = z.infer<typeof FactualSchema>

// ── Prompt builders ──────────────────────────────────────────────────────────────

function buildFactualPrompt(casinoName: string, scraped: ScrapedSource[]): string {
  const sourceSection = scraped.length > 0
    ? scraped.map((s, i) =>
        `\n--- SOURCE ${i + 1} [TYPE: ${s.type.toUpperCase()}] ${s.url} ---\n${s.text}`
      ).join("\n")
    : ""

  const sourceTypes = [...new Set(scraped.map(s => s.type))]

  return `You are a casino data extraction expert. Extract ONLY facts that are EXPLICITLY STATED in the HTML sources below about "${casinoName}".

CRITICAL RULES:
- If a fact is NOT explicitly written in the HTML → return null, never guess
- Do NOT estimate or infer values not directly stated
- For license: look for text like "licensed by", "regulated by", "MGA license", "license number"
- For bonus: look for exact amounts, e.g. "100% up to €500" or "35x wagering"
- For deposit: look for exact payment method names in the deposit/payment section
- For boolean fields: only set to true if EXPLICITLY stated, otherwise omit
- data_confidence = "high" if sources ${sourceTypes.join("+")} provided clear data;
  "medium" if partial; "low" if no sources found and you are using general knowledge

SOURCE ATTRIBUTION — _sources field:
For each field you extract, record which source it came from.
Source type values (from the SOURCE TYPE labels above):
  "askgamblers" | "casinoguru" | "bojoko" | "official" | "custom"
  "ai_knowledge" → ONLY if you are drawing on general knowledge NOT from the HTML
Be HONEST: if you are not sure, mark as "ai_knowledge"
${scraped.length > 0
  ? `SOURCES:${sourceSection}`
  : `No HTML sources were fetched. Use general knowledge about "${casinoName}" where confident. Mark ALL fields as "ai_knowledge" in _sources. Set data_confidence to "low".`
}

PROS/CONS RULES — these must be SPECIFIC, not generic:
- Each item MAX 6 words, punchy and specific to ${casinoName}
- GOOD: "Pikakasino Trustly-tunnistautumisella", "MGA-lisenssi verovapaille voitoille", "200 ilmaiskierrosta uusille", "Evolution live yli 300 pöydällä"
- BAD (never write): "Laaja pelitarjonta", "Hyvä asiakaspalvelu", "Luotettava kasino", "Paljon pelejä"
- GOOD cons: "Ei suomenkielistä live-tukea", "KYC vaaditaan ennen nostoja", "Mobiilisovellus puuttuu"
- BAD cons: "Voisi olla parempi", "Ei ole paras"

Return ONLY valid JSON, no markdown:
{
  "license_authority": "Exact value from: MGA|UKGC|Gibraltar|Isle of Man|Spelinspektionen|Kahnawake|Curacao eGaming|Curaçao Gaming Control Board|Antillephone N.V.|PAGCOR|Anjouan Gaming Board|Government of Belize|Comoros Island Gaming Authority|Veikkaus|null. Hints: 'PAGCOR'/'Philippine'→'PAGCOR'; 'Anjouan'→'Anjouan Gaming Board'; 'Antillephone'→'Antillephone N.V.'; 'GCB'/'Gaming Control Board' (Curaçao)→'Curaçao Gaming Control Board'; 'Belize'→'Government of Belize'; 'Comoros'→'Comoros Island Gaming Authority'. ONLY set if explicitly in HTML",
  "license_number": "string|null",
  "license_url": "string|null",
  "established_year": number|null,
  "trust_score": number 0-100|null,
  "min_deposit": number|null,
  "max_withdrawal_per_day": number|null,
  "max_withdrawal_per_month": number|null,
  "withdrawal_time_min_hours": number|null,
  "withdrawal_time_max_hours": number|null,
  "payment_methods": ["Visa","Mastercard","Trustly",...],
  "currencies_accepted": ["EUR","USD",...],
  "game_providers": ["NetEnt","Evolution",...],
  "total_games_count": number|null,
  "slots_count": number|null,
  "live_casino": boolean,
  "sports_betting": boolean,
  "poker": boolean,
  "jackpot_games": boolean,
  "game_demo_available": boolean,
  "welcome_bonus_text": "exact bonus string|null",
  "welcome_bonus_percent": number|null,
  "welcome_bonus_max_amount": number|null,
  "welcome_bonus_currency": "EUR|GBP|USD|null",
  "welcome_bonus_wagering": number|null,
  "welcome_bonus_min_deposit": number|null,
  "no_deposit_bonus": boolean,
  "no_deposit_amount": number|null,
  "free_spins_amount": number|null,
  "free_spins_game": "string|null",
  "cashback_percent": number|null,
  "loyalty_program": boolean,
  "vip_program": boolean,
  "mobile_optimized": boolean,
  "mobile_app_ios": boolean,
  "mobile_app_android": boolean,
  "live_chat_support": boolean,
  "support_email": boolean,
  "support_phone": boolean,
  "support_languages": ["fi","en","uk","se","no","de","pl","es","pt"] — use ONLY these codes,
  "kyc_required": boolean,
  "is_active": true,
  "is_featured": false,
  "is_new": false (true only if established after July 2025),
  "is_pikakasino": boolean (true = Finnish no-registration casino using Trustly/Brite),
  "available_in": ["FI","SE","NO","DK","DE","NL","BE","AT","CH","CA","AU","NZ","IE","GB","US"] — 2-letter ISO only,
  "restricted_in": same ISO list, must NOT overlap with available_in,
  "languages_supported": ["fi","en","uk","se","no","de","pl","es","pt"] — use ONLY these codes,
  "meta_title_fi": "SEO title Finnish max 60 chars",
  "meta_description_fi": "SEO description Finnish max 155 chars",
  "meta_title_en": "SEO title English max 60 chars",
  "meta_description_en": "SEO description English max 155 chars",
  "pros_fi": ["max 5 items, max 6 words each, SPECIFIC — see PROS/CONS RULES"],
  "cons_fi": ["max 4 items, max 6 words each, honest real limitations"],
  "pros_en": ["same as pros_fi but English"],
  "cons_en": ["same as cons_fi but English"],
  "faq_fi": [{"q": "Kysymys", "a": "Vastaus"}, max 5],
  "faq_en": [{"q": "Question", "a": "Answer"}, max 5],
  "data_sources": ["URLs that had useful data"],
  "data_confidence": "high|medium|low",
  "summary": "One sentence: what sources were used and what was found",
  "_sources": {
    "license_authority": "askgamblers|casinoguru|bojoko|official|ai_knowledge",
    "min_deposit": "...",
    "payment_methods": "...",
    "game_providers": "...",
    "welcome_bonus_text": "...",
    "established_year": "...",
    "trust_score": "...",
    "is_pikakasino": "...",
    "withdrawal_time_max_hours": "...",
    "total_games_count": "..."
  }}`
}

function buildReviewPrompt(casinoName: string, data: FactualData): string {
  const providers = data.game_providers?.join(", ") || "not identified"
  const payments = data.payment_methods?.join(", ") || "not identified"
  const bonus = data.welcome_bonus_text || null
  const license = data.license_authority || null
  const year = data.established_year
  const isPika = data.is_pikakasino === true
  const hasSports = data.sports_betting === true
  const minDep = data.min_deposit
  const wager = data.welcome_bonus_wagering
  const maxBonus = data.welcome_bonus_max_amount
  const totalGames = data.total_games_count

  const facts = [
    license       && `License: ${license}`,
    year          && `Established: ${year}`,
    bonus         && `Welcome offer: ${bonus}`,
    wager != null && `Wagering requirement: ${wager}x`,
    minDep        && `Min deposit: €${minDep}`,
    maxBonus      && `Max bonus: €${maxBonus}`,
    totalGames    && `Total games: ~${totalGames.toLocaleString()}`,
    providers     && `Game providers: ${providers}`,
    payments      && `Payment methods: ${payments}`,
    isPika        && `Pikakasino: YES (Trustly/Brite, no registration required)`,
    hasSports     && `Sports betting: YES`,
  ].filter(Boolean).join("\n")

  return `Write two unique casino reviews for ${casinoName} based on these VERIFIED facts:

${facts}

STRICT RULES FOR BOTH REVIEWS:
1. Do NOT open with "${casinoName} on..." or "Kasino on..." or "The casino..."
2. Open with a SPECIFIC hook about what makes THIS casino stand out — use a concrete detail
3. Reference the EXACT bonus text, EXACT license, EXACT payment method names from the facts
4. Name at least 3 specific game providers from the list (not generic "leading providers")
5. ${isPika ? "PROMINENTLY feature pikakasino/no-registration as the #1 selling point" : "Do not claim it is a pikakasino"}
6. ${hasSports ? "Mention the sportsbook as a real differentiator" : "Do not mention sports betting"}
7. ${year ? `Say it has operated since ${year} to establish credibility` : "Do not speculate about founding year"}
8. Length: 250–350 words each
9. FORMAT — return HTML, not plain text:
   - Wrap EVERY paragraph in <p>...</p> tags
   - Write 3–4 separate <p> blocks, never one long block
   - CORRECT: "<p>First paragraph.</p><p>Second paragraph.</p><p>Third paragraph.</p>"
   - WRONG:   "First paragraph. Second paragraph. Third paragraph." (no tags)
   - Do NOT add headings or <br> tags — only <p> blocks
10. Tone: knowledgeable friend recommending — honest, personal, not a brochure

FORBIDDEN (never use these phrases):
- "laaja valikoima pelejä" / "wide selection of games"
- "tunnettu peliyhtiö" / "well-known game provider"
- "turvallinen ja luotettava" / "safe and reliable"
- "tervetuliaisbonus" (use the SPECIFIC offer text instead)
- "asiakaspalvelu on saatavilla"
- Sentences starting with just "Kasino" or "The casino"

END each review with: who specifically benefits most from this casino (e.g. "suomalaiset, jotka etsivät X")

Return ONLY valid JSON — both values must be HTML strings with <p> tags:
{
  "review_fi": "<p>Ensimmäinen kappale...</p><p>Toinen kappale...</p><p>Kolmas kappale...</p>",
  "review_en": "<p>First paragraph...</p><p>Second paragraph...</p><p>Third paragraph...</p>"
}`
}

// ── Route handler ─────────────────────────────────────────────────────────────────
// Returns a single JSON response. Progress steps are driven by timers on the client.
// maxDuration = 60 prevents the 10 s Vercel default from killing long Claude calls.

export async function POST(req: NextRequest) {
  const t0 = Date.now()

  let body: { casinoName?: string; casinoSlug?: string; sourceUrl?: string; regenerateReview?: boolean }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { casinoName, casinoSlug, sourceUrl, regenerateReview = false } = body

  if (!casinoName) {
    return Response.json({ error: "casinoName is required" }, { status: 400 })
  }

  const slug = casinoSlug || casinoName.toLowerCase().replace(/\s+/g, "-")

  try {
    // ── Stage 1: Scrape ──────────────────────────────────────────────────────────
    const sourceCount = sourceUrl ? 1 : 4
    const tScrape = Date.now()
    const scraped = await scrapeAllSources(slug, casinoName, sourceUrl || undefined)
    const scrapeMs = Date.now() - tScrape
    console.log(`[ai-populate] scrape: ${scrapeMs}ms — ${scraped.length}/${sourceCount} sources succeeded (${scraped.map(s => s.type).join(", ") || "none"})`)

    const sourcesUsed      = scraped.map(s => s.url)
    const sourcesAttempted = sourceUrl ? [sourceUrl] : [
      `https://www.askgamblers.com/online-casinos/reviews/${slug}`,
      `https://casinoguru.com/${slug}-casino-review`,
      `https://bojoko.com/casino-reviews/${slug}`,
      `https://www.${slug}.com`,
    ]
    const sourcesSummary = scraped.map(s => ({ type: s.type, url: s.url }))

    // ── Stage 2: Claude — factual extraction ────────────────────────────────────
    const tS1 = Date.now()
    const stage1 = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6144,
      messages: [{ role: "user", content: buildFactualPrompt(casinoName, scraped) }],
    })
    console.log(`[ai-populate] stage1 claude: ${Date.now() - tS1}ms, input_tokens=${stage1.usage.input_tokens}, output_tokens=${stage1.usage.output_tokens}`)

    const s1Block = stage1.content.find(b => b.type === "text")
    if (!s1Block || s1Block.type !== "text") throw new Error("No response from AI (stage 1)")

    let s1Parsed: unknown
    try {
      s1Parsed = JSON.parse(extractJsonText(s1Block.text))
    } catch {
      console.error("[ai-populate] Stage 1 JSON parse error:", s1Block.text.slice(0, 300))
      throw new Error("AI returned invalid JSON — try again")
    }

    const factual = FactualSchema.parse(normalizeAiData(s1Parsed))
    const dataConfidence = factual.data_confidence
      ?? (scraped.length >= 2 ? "high" : scraped.length === 1 ? "medium" : "low")

    // ── Stage 3 (optional): Claude — review writing ──────────────────────────────
    let reviews: { review_fi?: string | null; review_en?: string | null } = {}

    if (regenerateReview) {
      const tS2 = Date.now()
      const stage2 = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        messages: [{ role: "user", content: buildReviewPrompt(casinoName, factual) }],
      })
      console.log(`[ai-populate] stage2 claude: ${Date.now() - tS2}ms, input_tokens=${stage2.usage.input_tokens}, output_tokens=${stage2.usage.output_tokens}`)

      const s2Block = stage2.content.find(b => b.type === "text")
      if (s2Block && s2Block.type === "text") {
        try {
          const parsed = JSON.parse(extractJsonText(s2Block.text))
          reviews = ReviewSchema.parse(parsed)
        } catch {
          console.error("[ai-populate] Stage 2 JSON parse error — reviews skipped")
        }
      }
    }

    // ── Merge & clean ────────────────────────────────────────────────────────────
    const merged = { ...factual, ...reviews }
    const availableSet = new Set(merged.available_in ?? [])
    const finalData = { ...merged, restricted_in: (merged.restricted_in ?? []).filter(c => !availableSet.has(c)) }

    const totalMs = Date.now() - t0
    console.log(`[ai-populate] DONE in ${totalMs}ms — scrape ${scrapeMs}ms, sources: ${scraped.length}, confidence: ${dataConfidence}`)

    return Response.json({
      success: true,
      data: finalData,
      sourcesUsed,
      sourcesAttempted,
      sourcesSummary,
      dataConfidence,
      summary: factual.summary ?? null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI generation failed"
    console.error("[ai-populate] ERROR after", Date.now() - t0, "ms:", msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
