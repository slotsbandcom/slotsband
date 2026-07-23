import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const maxDuration = 30

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function extractJsonText(text: string): string {
  const stripped = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim()
  if (stripped.startsWith("{")) return stripped
  const match = stripped.match(/\{[\s\S]*\}/)
  return match ? match[0] : stripped
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

const ARRAY_FIELDS = new Set(["pros_fi", "cons_fi", "pros_en", "cons_en", "pros_uk", "cons_uk"])
const JSONB_FIELDS = new Set(["faq_fi", "faq_en", "faq_uk"])

function normalizeContent(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return raw
  const obj = raw as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj)) {
    if (ARRAY_FIELDS.has(key))      out[key] = toArray(val)
    else if (JSONB_FIELDS.has(key)) out[key] = toJsonb(val)
    else out[key] = val
  }
  return out
}

// Schema for research flow (fi + en, no uk)
const ContentSchema = z.object({
  meta_title_fi: z.string().nullish(),
  meta_description_fi: z.string().nullish(),
  meta_title_en: z.string().nullish(),
  meta_description_en: z.string().nullish(),
  review_fi: z.string().nullish(),
  review_en: z.string().nullish(),
  pros_fi: z.array(z.string()).optional(),
  cons_fi: z.array(z.string()).optional(),
  pros_en: z.array(z.string()).optional(),
  cons_en: z.array(z.string()).optional(),
  faq_fi: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  faq_en: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
})

// Schema for DB mode (fi + en + uk)
const ContentSchemaFull = z.object({
  review_fi: z.string().nullish(),
  review_en: z.string().nullish(),
  review_uk: z.string().nullish(),
  pros_fi: z.array(z.string()).optional(),
  cons_fi: z.array(z.string()).optional(),
  pros_en: z.array(z.string()).optional(),
  cons_en: z.array(z.string()).optional(),
  pros_uk: z.array(z.string()).optional(),
  cons_uk: z.array(z.string()).optional(),
  faq_fi: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  faq_en: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  faq_uk: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  meta_title_fi: z.string().nullish(),
  meta_description_fi: z.string().nullish(),
  meta_title_en: z.string().nullish(),
  meta_description_en: z.string().nullish(),
  meta_title_uk: z.string().nullish(),
  meta_description_uk: z.string().nullish(),
})

// ── Prompt for research flow (takes facts from ai-research) ──────────────────

function buildContentPrompt(
  casinoName: string,
  facts: Record<string, unknown>,
  regenerateReview: boolean
): string {
  const isPika = facts.is_pikakasino === true
  const hasSports = facts.sports_betting === true
  const license = facts.license_authority as string | null
  const year = facts.established_year as number | null
  const bonus = facts.welcome_bonus_text as string | null
  const providers = Array.isArray(facts.game_providers) ? facts.game_providers.join(", ") : null
  const payments = Array.isArray(facts.payment_methods) ? facts.payment_methods.join(", ") : null
  const wager = facts.welcome_bonus_wagering as number | null
  const minDep = facts.min_deposit as number | null
  const maxBonus = facts.welcome_bonus_max_amount as number | null
  const totalGames = facts.total_games_count as number | null

  const reviewSection = regenerateReview ? `
  "review_fi": "<p>Ensimmäinen kappale...</p><p>Toinen kappale...</p><p>Kolmas kappale...</p>",
  "review_en": "<p>First paragraph...</p><p>Second paragraph...</p><p>Third paragraph...</p>",` : ""

  const reviewRules = regenerateReview ? `
REVIEW RULES:
- Do NOT open with "${casinoName} on..." or "Kasino on..." or "The casino..."
- Open with a SPECIFIC hook about what makes THIS casino stand out
- Reference the EXACT bonus, EXACT license, EXACT payment method names
- Name at least 3 specific game providers
- ${isPika ? "PROMINENTLY feature pikakasino/no-registration as the #1 selling point" : "Do not claim it is a pikakasino"}
- ${hasSports ? "Mention the sportsbook as a real differentiator" : "Do not mention sports betting"}
- ${year ? `Say it has operated since ${year}` : "Do not speculate about founding year"}
- Length: 200–250 words each; HTML <p> tags, 3-4 blocks, no headings or <br>
- FORBIDDEN: "laaja valikoima pelejä", "wide selection of games", "turvallinen ja luotettava"
` : ""

  return `Generate casino content for "${casinoName}" using these verified facts:

License: ${license ?? "unknown"}
Established: ${year ?? "unknown"}
Welcome bonus: ${bonus ?? "unknown"}
Wagering: ${wager != null ? `${wager}x` : "unknown"}
Min deposit: ${minDep != null ? `€${minDep}` : "unknown"}
Max bonus: ${maxBonus != null ? `€${maxBonus}` : "unknown"}
Total games: ${totalGames ?? "unknown"}
Game providers: ${providers ?? "unknown"}
Payment methods: ${payments ?? "unknown"}
Pikakasino: ${isPika ? "YES (Trustly/Brite, no registration)" : "NO"}
Sports betting: ${hasSports ? "YES" : "NO"}

PROS/CONS RULES — SPECIFIC, not generic (max 6 words each):
- GOOD Finnish pros: "Pikakasino Trustly-tunnistautumisella", "MGA-lisenssi verovapaille voitoille"
- BAD: "Laaja pelitarjonta", "Hyvä asiakaspalvelu", "Luotettava kasino"
${reviewRules}
Return ONLY valid JSON, no markdown:
{
  "meta_title_fi": "SEO title Finnish max 60 chars",
  "meta_description_fi": "SEO description Finnish max 155 chars",
  "meta_title_en": "SEO title English max 60 chars",
  "meta_description_en": "SEO description English max 155 chars",${reviewSection}
  "pros_fi": ["max 5 items, SPECIFIC"],
  "cons_fi": ["max 4 items, honest real limitations"],
  "pros_en": ["same as pros_fi in English"],
  "cons_en": ["same as cons_fi in English"],
  "faq_fi": [{"q": "Kysymys?", "a": "Vastaus."}, max 5],
  "faq_en": [{"q": "Question?", "a": "Answer."}, max 5]
}`
}

// ── Prompt for DB mode (reads from Supabase, generates all languages) ─────────

function buildDbContentPrompt(casino: Record<string, unknown>, languages: string[]): string {
  const name = casino.name as string
  const isPika = casino.is_pikakasino === true
  const hasSports = casino.sports_betting === true
  const providers = Array.isArray(casino.game_providers) ? casino.game_providers.join(", ") : String(casino.game_providers ?? "unknown")
  const payments = Array.isArray(casino.payment_methods) ? casino.payment_methods.join(", ") : String(casino.payment_methods ?? "unknown")
  const availableIn = Array.isArray(casino.available_in) ? casino.available_in.join(", ") : String(casino.available_in ?? "")
  const restrictedIn = Array.isArray(casino.restricted_in) ? casino.restricted_in.join(", ") : String(casino.restricted_in ?? "")

  const hasFi = languages.includes("fi")
  const hasEn = languages.includes("en")
  const hasUk = languages.includes("uk")

  const jsonFields: string[] = []
  if (hasFi) jsonFields.push(
    `  "review_fi": "300-400 words unique Finnish review, HTML <p> tags, 3-4 paragraphs, no headings"`,
    `  "pros_fi": ["5-6 specific pros in Finnish, max 6 words each, NO generic phrases"]`,
    `  "cons_fi": ["4-5 honest specific cons in Finnish, max 6 words each"]`,
    `  "faq_fi": [{"q": "Suomenkielinen kysymys?", "a": "Vastaus 1-2 lauseella."}, max 5]`,
    `  "meta_title_fi": "SEO title Finnish max 60 chars"`,
    `  "meta_description_fi": "SEO description Finnish max 155 chars"`,
  )
  if (hasEn) jsonFields.push(
    `  "review_en": "300-400 words unique English review, HTML <p> tags, 3-4 paragraphs, no headings"`,
    `  "pros_en": ["5-6 specific pros in English, max 6 words each, NO generic phrases"]`,
    `  "cons_en": ["4-5 honest specific cons in English, max 6 words each"]`,
    `  "faq_en": [{"q": "English question?", "a": "Answer in 1-2 sentences."}, max 5]`,
    `  "meta_title_en": "SEO title English max 60 chars"`,
    `  "meta_description_en": "SEO description English max 155 chars"`,
  )
  if (hasUk) jsonFields.push(
    `  "review_uk": "300-400 words unique UK English review, HTML <p> tags, 3-4 paragraphs, no headings"`,
    `  "pros_uk": ["5-6 specific pros in UK English, max 6 words each, NO generic phrases"]`,
    `  "cons_uk": ["4-5 honest specific cons in UK English, max 6 words each"]`,
    `  "faq_uk": [{"q": "UK English question?", "a": "Answer in 1-2 sentences."}, max 5]`,
    `  "meta_title_uk": "SEO title UK English max 60 chars"`,
    `  "meta_description_uk": "SEO description UK English max 155 chars"`,
  )

  return `Based on this casino data generate written content for ${name}:

Casino: ${name}
License: ${casino.license_authority ?? "unknown"}
Established: ${casino.established_year ?? "unknown"}
Min deposit: ${casino.min_deposit != null ? `€${casino.min_deposit}` : "unknown"}
Withdrawal: ${casino.withdrawal_time_min_hours != null ? `${casino.withdrawal_time_min_hours}-${casino.withdrawal_time_max_hours}h` : "unknown"}
Total games: ${casino.total_games_count ?? "unknown"}
Game providers: ${providers}
Bonus: ${casino.welcome_bonus_text ?? "unknown"}
Wagering: ${casino.welcome_bonus_wagering != null ? `${casino.welcome_bonus_wagering}x` : "unknown"}
Payment methods: ${payments}
Live casino: ${casino.live_casino}
Pikakasino: ${isPika ? "YES (no-registration, Trustly/Brite)" : "NO"}
Sports betting: ${hasSports ? "YES" : "NO"}
VIP program: ${casino.vip_program}
Available in: ${availableIn}
Restricted in: ${restrictedIn}

RULES:
- Reviews must be specific to THIS casino — mention specific providers, bonuses, features from above
- No generic phrases: "large selection", "safe and reliable", "well-known provider", "great customer support"
- ${isPika ? "PROMINENTLY feature pikakasino/no-registration as a key benefit in Finnish reviews" : "Do NOT claim it is a pikakasino"}
- pros/cons: specific and factual (max 6 words each)
  - GOOD Finnish pros: "Pikakasino Trustly-tunnistautumisella", "MGA-lisenssi verovapaille voitoille", "Evolution live yli 300 pöydällä"
  - BAD: "Laaja pelitarjonta", "Hyvä asiakaspalvelu", "Luotettava kasino"
- Review format: HTML <p> tags only, 3-4 paragraphs, no headings or <br> tags
- Finnish content in Finnish, English/UK content in English

Return ONLY valid JSON, no markdown:
{
${jsonFields.join(",\n")}
}`
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: {
    casinoName?: string
    casinoSlug?: string
    facts?: Record<string, unknown>
    languages?: string[]
    regenerateExisting?: boolean
    regenerateReview?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const {
    casinoName, casinoSlug, facts,
    languages, regenerateExisting = false, regenerateReview = false,
  } = body

  // ── Mode 2: DB mode — Generate Written Content button ────────────────────────
  if (casinoSlug && !facts) {
    try {
      const t0 = Date.now()

      const { data: casino, error: dbErr } = await adminDb()
        .from("casinos")
        .select("*")
        .eq("slug", casinoSlug)
        .single()

      if (dbErr || !casino) {
        return NextResponse.json({ error: "Casino not found in database" }, { status: 404 })
      }

      const requested = (languages ?? ["fi", "en", "uk"]) as string[]

      // Skip languages that already have content (when regenerateExisting=false)
      const toLang = requested.filter(lang => {
        if (regenerateExisting) return true
        return !(casino[`review_${lang}`] as string | undefined)?.trim()
      })

      if (toLang.length === 0) {
        return NextResponse.json({
          success: true,
          data: {},
          message: "Content already exists for all selected languages. Enable 'Regenerate if content already exists' to overwrite.",
        })
      }

      const maxTok = toLang.length >= 3 ? 4000 : toLang.length === 2 ? 2500 : 1500

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: maxTok,
        messages: [{ role: "user", content: buildDbContentPrompt(casino as Record<string, unknown>, toLang) }],
      })
      console.log(`[ai-content] db-mode in ${Date.now() - t0}ms, langs=[${toLang}], output_tokens=${response.usage.output_tokens}`)

      const block = response.content.find(b => b.type === "text")
      if (!block || block.type !== "text") throw new Error("No text response from AI")

      let parsed: unknown
      try {
        parsed = JSON.parse(extractJsonText(block.text))
      } catch {
        console.error("[ai-content] JSON parse error. Raw:", block.text.slice(0, 400))
        throw new Error("AI returned invalid JSON — try again")
      }

      const data = ContentSchemaFull.parse(normalizeContent(parsed))
      return NextResponse.json({ success: true, data })
    } catch (err) {
      console.error("[ai-content] db-mode", err)
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Content generation failed" },
        { status: 500 }
      )
    }
  }

  // ── Mode 1: Research flow — facts passed from ai-research ────────────────────
  if (!casinoName) return NextResponse.json({ error: "casinoName is required" }, { status: 400 })

  try {
    const t0 = Date.now()
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: buildContentPrompt(casinoName, facts ?? {}, regenerateReview) }],
    })
    console.log(`[ai-content] research-mode in ${Date.now() - t0}ms, output_tokens=${response.usage.output_tokens}`)

    const block = response.content.find(b => b.type === "text")
    if (!block || block.type !== "text") throw new Error("No text response from AI")

    let parsed: unknown
    try {
      parsed = JSON.parse(extractJsonText(block.text))
    } catch {
      console.error("[ai-content] JSON parse error. Raw:", block.text.slice(0, 400))
      throw new Error("AI returned invalid JSON — try again")
    }

    const data = ContentSchema.parse(normalizeContent(parsed))

    if (!regenerateReview) {
      delete (data as Record<string, unknown>).review_fi
      delete (data as Record<string, unknown>).review_en
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("[ai-content]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Content generation failed" },
      { status: 500 }
    )
  }
}
