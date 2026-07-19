import { generateObject, gateway } from "ai"
import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"

const GeneralSchema = z.object({
  established_year: z.number().optional(),
  trust_score: z.number().min(0).max(100).optional(),
  languages_supported: z.array(z.string()).optional(),
  available_in: z.array(z.string()).optional(),
  restricted_in: z.array(z.string()).optional(),
})

const LicensingSchema = z.object({
  license_authority: z.string().optional(),
  license_number: z.string().optional(),
  license_url: z.string().optional(),
  is_verified: z.boolean().optional(),
})

const BonusesSchema = z.object({
  welcome_bonus_text: z.string().optional(),
  welcome_bonus_percent: z.number().optional(),
  welcome_bonus_max_amount: z.number().optional(),
  welcome_bonus_currency: z.string().optional(),
  welcome_bonus_wagering: z.number().optional(),
  welcome_bonus_min_deposit: z.number().optional(),
  no_deposit_bonus: z.boolean().optional(),
  no_deposit_amount: z.number().optional(),
  free_spins_amount: z.number().optional(),
  free_spins_game: z.string().optional(),
  cashback_percent: z.number().optional(),
  loyalty_program: z.boolean().optional(),
  vip_program: z.boolean().optional(),
})

const PaymentsSchema = z.object({
  min_deposit: z.number().optional(),
  max_withdrawal_per_day: z.number().optional(),
  max_withdrawal_per_month: z.number().optional(),
  withdrawal_time_min_hours: z.number().optional(),
  withdrawal_time_max_hours: z.number().optional(),
  payment_methods: z.array(z.string()).optional(),
  currencies_accepted: z.array(z.string()).optional(),
})

const GamesSchema = z.object({
  game_providers: z.array(z.string()).optional(),
  total_games_count: z.number().optional(),
  slots_count: z.number().optional(),
  live_casino: z.boolean().optional(),
  sports_betting: z.boolean().optional(),
  poker: z.boolean().optional(),
  jackpot_games: z.boolean().optional(),
  game_demo_available: z.boolean().optional(),
})

const UXSchema = z.object({
  mobile_optimized: z.boolean().optional(),
  mobile_app_ios: z.boolean().optional(),
  mobile_app_android: z.boolean().optional(),
  live_chat_support: z.boolean().optional(),
  support_email: z.boolean().optional(),
  support_phone: z.boolean().optional(),
  kyc_required: z.boolean().optional(),
  registration_steps: z.number().min(1).max(5).optional(),
})

const ContentSchema = z.object({
  meta_title: z.string().optional(),
  meta_description: z.string().max(160).optional(),
  review: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  short_description: z.string().max(160).optional(),
})

const FullSchema = z.object({
  general: GeneralSchema.optional(),
  licensing: LicensingSchema.optional(),
  bonuses: BonusesSchema.optional(),
  payments: PaymentsSchema.optional(),
  games: GamesSchema.optional(),
  ux: UXSchema.optional(),
  content_fi: ContentSchema.optional(),
  content_en: ContentSchema.optional(),
  summary: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { casinoName, fields } = body as { casinoName: string; fields: string[] }

    if (!casinoName) {
      return NextResponse.json({ error: "casinoName is required" }, { status: 400 })
    }

    const fieldList = (fields ?? []).join(", ") || "all fields"

    const prompt = `You are a casino industry expert. Research and provide accurate, factual information about the online casino "${casinoName}".

Populate the following fields: ${fieldList}.

Return structured data based on your knowledge of this casino. If you don't have reliable information for a field, omit it rather than guessing.

For content fields (content_fi, content_en), write professional casino review copy:
- meta_title: SEO-optimized title (60 chars max)
- meta_description: Compelling description (max 160 chars)  
- review: 2-3 paragraph review in the appropriate language
- pros: 4-6 genuine advantages
- cons: 2-4 honest disadvantages
- faq: 3-5 common questions with detailed answers
- short_description: One sentence summary (max 160 chars)

For content_fi, write everything in Finnish. For content_en, write in English.
Include a brief "summary" field describing what you found about this casino.`

    const { object } = await generateObject({
      model: gateway("openai/gpt-4o"),
      schema: FullSchema,
      prompt,
    })

    return NextResponse.json({ data: object })
  } catch (err) {
    console.error("[ai-populate]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    )
  }
}
