import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

const ARRAY_CONTENT_FIELDS = new Set(["pros_fi", "cons_fi", "pros_en", "cons_en"])
const JSONB_CONTENT_FIELDS = new Set(["faq_fi", "faq_en"])

function normalizeContent(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return raw
  const obj = raw as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj)) {
    if (ARRAY_CONTENT_FIELDS.has(key))      out[key] = toArray(val)
    else if (JSONB_CONTENT_FIELDS.has(key)) out[key] = toJsonb(val)
    else out[key] = val
  }
  return out
}

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
REVIEW RULES (review_fi and review_en):
- Do NOT open with "${casinoName} on..." or "Kasino on..." or "The casino..."
- Open with a SPECIFIC hook about what makes THIS casino stand out
- Reference the EXACT bonus text, EXACT license, EXACT payment method names
- Name at least 3 specific game providers
- ${isPika ? "PROMINENTLY feature pikakasino/no-registration as the #1 selling point" : "Do not claim it is a pikakasino"}
- ${hasSports ? "Mention the sportsbook as a real differentiator" : "Do not mention sports betting"}
- ${year ? `Say it has operated since ${year} to establish credibility` : "Do not speculate about founding year"}
- Length: 200–250 words each (concise)
- FORMAT: HTML only — wrap every paragraph in <p>...</p>, 3–4 blocks, no headings or <br>
- Tone: knowledgeable friend recommending — honest, personal, not a brochure
- FORBIDDEN: "laaja valikoima pelejä", "wide selection of games", "turvallinen ja luotettava", "safe and reliable"
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
- GOOD Finnish pros: "Pikakasino Trustly-tunnistautumisella", "MGA-lisenssi verovapaille voitoille", "Evolution live yli 300 pöydällä"
- BAD (never write): "Laaja pelitarjonta", "Hyvä asiakaspalvelu", "Luotettava kasino"
- GOOD cons: "Ei suomenkielistä live-tukea", "KYC vaaditaan ennen nostoja"
- BAD cons: "Voisi olla parempi", "Ei ole paras"
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

export async function POST(req: NextRequest) {
  let body: { casinoName?: string; facts?: Record<string, unknown>; regenerateReview?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { casinoName, facts = {}, regenerateReview = false } = body
  if (!casinoName) return NextResponse.json({ error: "casinoName is required" }, { status: 400 })

  try {
    const t0 = Date.now()
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: buildContentPrompt(casinoName, facts, regenerateReview) }],
    })
    console.log(`[ai-content] done in ${Date.now() - t0}ms, output_tokens=${response.usage.output_tokens}`)

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
