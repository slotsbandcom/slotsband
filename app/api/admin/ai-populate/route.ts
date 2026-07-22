import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"

// Allow up to 60 s — Stage-1 Claude (~15s) + Stage-2 Claude (~15s)
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
})

const ReviewSchema = z.object({
  review_fi: z.string().nullish(),
  review_en: z.string().nullish(),
})

type FactualData = z.infer<typeof FactualSchema>

// ── Prompt builders ──────────────────────────────────────────────────────────────

function buildFactualPrompt(casinoName: string): string {
  return `You are a casino data expert. Use your knowledge about "${casinoName}" to fill in the following fields.

RULES:
- Only fill values you are CONFIDENT about — if unsure, return null
- Do not invent specific numbers you don't know (deposit amounts, wagering requirements)
- For boolean fields: only true if certain, otherwise omit
- Prioritize accuracy over completeness

PROS/CONS RULES — must be SPECIFIC, not generic:
- Each item MAX 6 words, punchy and specific to ${casinoName}
- GOOD: "Pikakasino Trustly-tunnistautumisella", "MGA-lisenssi verovapaille voitoille", "200 ilmaiskierrosta uusille", "Evolution live yli 300 pöydällä"
- BAD (never write): "Laaja pelitarjonta", "Hyvä asiakaspalvelu", "Luotettava kasino", "Paljon pelejä"
- GOOD cons: "Ei suomenkielistä live-tukea", "KYC vaaditaan ennen nostoja", "Mobiilisovellus puuttuu"
- BAD cons: "Voisi olla parempi", "Ei ole paras"

Return ONLY valid JSON, no markdown:
{
  "license_authority": "MGA|UKGC|Gibraltar|Isle of Man|Spelinspektionen|Kahnawake|Curacao eGaming|Curaçao Gaming Control Board|Antillephone N.V.|PAGCOR|Anjouan Gaming Board|Government of Belize|Comoros Island Gaming Authority|Veikkaus|null",
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
  "support_languages": ["fi","en","uk","se","no","de","pl","es","pt"],
  "kyc_required": boolean,
  "is_active": true,
  "is_featured": false,
  "is_new": false,
  "is_pikakasino": boolean,
  "available_in": ["FI","SE","NO","DK","DE","NL","BE","AT","CH","CA","AU","NZ","IE","GB","US"],
  "restricted_in": [],
  "languages_supported": ["fi","en","uk","se","no","de","pl","es","pt"],
  "meta_title_fi": "SEO title Finnish max 60 chars",
  "meta_description_fi": "SEO description Finnish max 155 chars",
  "meta_title_en": "SEO title English max 60 chars",
  "meta_description_en": "SEO description English max 155 chars",
  "pros_fi": ["max 5 items, max 6 words each, SPECIFIC"],
  "cons_fi": ["max 4 items, max 6 words each, honest real limitations"],
  "pros_en": ["same as pros_fi but English"],
  "cons_en": ["same as cons_fi but English"],
  "faq_fi": [{"q": "Kysymys", "a": "Vastaus"}, max 5],
  "faq_en": [{"q": "Question", "a": "Answer"}, max 5]
}`
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

  return `Write two unique casino reviews for ${casinoName} based on these facts:

${facts}

STRICT RULES FOR BOTH REVIEWS:
1. Do NOT open with "${casinoName} on..." or "Kasino on..." or "The casino..."
2. Open with a SPECIFIC hook about what makes THIS casino stand out
3. Reference the EXACT bonus text, EXACT license, EXACT payment method names
4. Name at least 3 specific game providers from the list
5. ${isPika ? "PROMINENTLY feature pikakasino/no-registration as the #1 selling point" : "Do not claim it is a pikakasino"}
6. ${hasSports ? "Mention the sportsbook as a real differentiator" : "Do not mention sports betting"}
7. ${year ? `Say it has operated since ${year} to establish credibility` : "Do not speculate about founding year"}
8. Length: 250–350 words each
9. FORMAT — return HTML, not plain text:
   - Wrap EVERY paragraph in <p>...</p> tags
   - Write 3–4 separate <p> blocks, never one long block
   - Do NOT add headings or <br> tags — only <p> blocks
10. Tone: knowledgeable friend recommending — honest, personal, not a brochure

FORBIDDEN phrases:
- "laaja valikoima pelejä" / "wide selection of games"
- "tunnettu peliyhtiö" / "well-known game provider"
- "turvallinen ja luotettava" / "safe and reliable"
- "tervetuliaisbonus"
- Sentences starting with just "Kasino" or "The casino"

End each review with who specifically benefits most from this casino.

Return ONLY valid JSON — both values must be HTML strings with <p> tags:
{
  "review_fi": "<p>Ensimmäinen kappale...</p><p>Toinen kappale...</p><p>Kolmas kappale...</p>",
  "review_en": "<p>First paragraph...</p><p>Second paragraph...</p><p>Third paragraph...</p>"
}`
}

// ── Route handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const t0 = Date.now()

  let body: { casinoName?: string; casinoSlug?: string; regenerateReview?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { casinoName, regenerateReview = false } = body

  if (!casinoName) {
    return NextResponse.json({ error: "casinoName is required" }, { status: 400 })
  }

  try {
    // ── Stage 1: Claude — factual extraction ────────────────────────────────────
    const tS1 = Date.now()
    const stage1 = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6144,
      messages: [{ role: "user", content: buildFactualPrompt(casinoName) }],
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

    // ── Stage 2 (optional): Claude — review writing ──────────────────────────────
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

    console.log(`[ai-populate] DONE in ${Date.now() - t0}ms`)

    return NextResponse.json({ success: true, data: finalData })
  } catch (err) {
    console.error("[ai-populate]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    )
  }
}
