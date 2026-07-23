import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function extractJsonText(text: string): string {
  const stripped = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim()
  if (stripped.startsWith("{")) return stripped
  const match = stripped.match(/\{[\s\S]*\}/)
  return match ? match[0] : stripped
}

const INT_FIELDS = new Set([
  "min_deposit", "max_withdrawal_per_day", "max_withdrawal_per_month",
  "withdrawal_time_min_hours", "withdrawal_time_max_hours",
  "total_games_count", "slots_count", "welcome_bonus_percent",
  "welcome_bonus_max_amount", "welcome_bonus_wagering", "welcome_bonus_min_deposit",
  "no_deposit_amount", "free_spins_amount", "cashback_percent",
  "established_year", "trust_score", "rank",
])

const FLOAT_FIELDS = new Set(["rating"])

const BOOL_FIELDS = new Set([
  "live_casino", "sports_betting", "poker", "jackpot_games", "game_demo_available",
  "mobile_optimized", "mobile_app_ios", "mobile_app_android",
  "live_chat_support", "support_email", "support_phone",
  "kyc_required", "is_pikakasino", "no_deposit_bonus", "loyalty_program", "vip_program",
])

const ARRAY_FIELDS = new Set([
  "payment_methods", "game_providers", "currencies_accepted",
  "languages_supported", "available_in", "restricted_in", "support_languages",
])

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

function normalizeData(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return raw
  const obj = raw as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj)) {
    if (INT_FIELDS.has(key))        out[key] = toInt(val)
    else if (FLOAT_FIELDS.has(key)) out[key] = toFloat(val)
    else if (BOOL_FIELDS.has(key))  out[key] = toBool(val)
    else if (ARRAY_FIELDS.has(key)) out[key] = toArray(val)
    else out[key] = val
  }
  return out
}

const ResearchSchema = z.object({
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
  is_pikakasino: z.boolean().optional(),
  available_in: z.array(z.string()).optional(),
  restricted_in: z.array(z.string()).optional(),
  languages_supported: z.array(z.string()).optional(),
})

function buildResearchPrompt(casinoName: string): string {
  return `Search the web for accurate, current information about "${casinoName}" casino.

Search for:
- "${casinoName} casino license authority regulator"
- "${casinoName} casino bonus deposit payment methods 2025"
- "${casinoName} casino games providers"
- "${casinoName} casino Finland pikakasino"

Use the search results to fill in the fields. Return null for anything not found.

RULES:
- Search FIRST, then fill from results
- Return null for fields not confirmed in results
- Do NOT invent numbers (deposit amounts, wagering, game counts)
- For boolean fields: only true if explicitly confirmed, otherwise omit
- license_authority must be verified from casino's own site or reputable review site

Return ONLY valid JSON, no markdown:
{
  "license_authority": "MGA|UKGC|Gibraltar|Isle of Man|Spelinspektionen|Curacao eGaming|Curaçao Gaming Control Board|Antillephone N.V.|Kahnawake|Anjouan Gaming Board|Government of Belize|null",
  "license_number": "string|null",
  "license_url": "string|null",
  "established_year": number|null,
  "trust_score": number 0-100|null,
  "min_deposit": number|null,
  "max_withdrawal_per_day": number|null,
  "max_withdrawal_per_month": number|null,
  "withdrawal_time_min_hours": number|null,
  "withdrawal_time_max_hours": number|null,
  "payment_methods": ["Visa","Mastercard","Trustly","Brite","Zimpler","PayPal","Skrill","Neteller",...],
  "currencies_accepted": ["EUR","USD",...],
  "game_providers": ["NetEnt","Evolution","Pragmatic Play","Play'n GO",...],
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
  "support_languages": ["fi","en","de","se","no","pl","es","pt"],
  "kyc_required": boolean,
  "is_pikakasino": boolean,
  "available_in": ["FI","SE","NO","DK","DE","NL","BE","AT","CH","CA","AU","NZ","IE","GB","US"],
  "restricted_in": [],
  "languages_supported": ["fi","en","de","se","no","pl","es","pt"]
}`
}

export async function POST(req: NextRequest) {
  let body: { casinoName?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { casinoName } = body
  if (!casinoName) return NextResponse.json({ error: "casinoName is required" }, { status: 400 })

  try {
    const t0 = Date.now()
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
      messages: [{ role: "user", content: buildResearchPrompt(casinoName) }],
    })
    console.log(`[ai-research] done in ${Date.now() - t0}ms, output_tokens=${response.usage.output_tokens}`)

    const text = response.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("\n")

    if (!text.trim()) throw new Error("No text response from AI")

    let parsed: unknown
    try {
      parsed = JSON.parse(extractJsonText(text))
    } catch {
      console.error("[ai-research] JSON parse error. Raw:", text.slice(0, 400))
      throw new Error("AI returned invalid JSON — try again")
    }

    const data = ResearchSchema.parse(normalizeData(parsed))

    const availableSet = new Set(data.available_in ?? [])
    const finalData = {
      ...data,
      restricted_in: (data.restricted_in ?? []).filter(c => !availableSet.has(c)),
    }

    return NextResponse.json({ success: true, data: finalData })
  } catch (err) {
    console.error("[ai-research]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Research failed" },
      { status: 500 }
    )
  }
}
