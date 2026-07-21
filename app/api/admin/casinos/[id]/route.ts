import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

// Columns that actually exist in the casinos table.
// Fields in the Casino TypeScript type that are NOT here (bonus_text, bonus_terms,
// rating_trust, etc.) are WP-import-only and not yet in the DB schema — sending
// them to PostgREST causes a 400/500 "column does not exist" error.
const DB_COLUMNS = new Set([
  "id", "slug", "name", "logo_url", "banner_url", "established_year",
  "rating", "trust_score", "is_active", "is_featured", "is_new", "rank",
  "affiliate_url", "mene_slug", "languages_supported", "available_in",
  "restricted_in", "license_authority", "license_number", "license_url",
  "is_verified", "welcome_bonus_text", "welcome_bonus_percent",
  "welcome_bonus_max_amount", "welcome_bonus_currency", "welcome_bonus_wagering",
  "welcome_bonus_min_deposit", "no_deposit_bonus", "no_deposit_amount",
  "free_spins_amount", "free_spins_game", "cashback_percent", "loyalty_program",
  "vip_program", "min_deposit", "max_withdrawal_per_day", "max_withdrawal_per_month",
  "withdrawal_time_min_hours", "withdrawal_time_max_hours", "payment_methods",
  "currencies_accepted", "game_providers", "total_games_count", "slots_count",
  "live_casino", "sports_betting", "poker", "jackpot_games", "game_demo_available",
  "mobile_app_ios", "mobile_app_android", "mobile_optimized", "live_chat_support",
  "support_email", "support_phone", "support_languages", "kyc_required",
  "registration_steps", "is_pikakasino", "review_fi", "review_en", "review_uk",
  "pros_fi", "pros_en", "pros_uk", "cons_fi", "cons_en", "cons_uk",
  "faq_fi", "faq_en", "faq_uk", "meta_title_fi", "meta_title_en", "meta_title_uk",
  "meta_description_fi", "meta_description_en", "meta_description_uk",
  "screenshots", "video_review_url", "badge", "badge_variant",
])

// Service-role client bypasses RLS — used only after auth check with anon client.
function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Support lookup by slug (non-UUID) or by id (UUID)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)
  const query = adminDb().from("casinos").select("*")
  const { data, error } = await (isUuid ? query.eq("id", id) : query.eq("slug", id)).maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await adminDb().from("casinos").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Auth check with anon client (reads session from cookies)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  // Strip fields not in the DB schema and auto-managed timestamps
  const safeBody = Object.fromEntries(
    Object.entries(body as Record<string, unknown>).filter(
      ([key]) => DB_COLUMNS.has(key) && key !== "id" && key !== "created_at" && key !== "updated_at"
    )
  )

  // Use service-role client for the actual write (bypasses RLS)
  const { data, error } = await adminDb()
    .from("casinos")
    .update(safeBody)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[admin/casinos PATCH]", error.message, "body keys:", Object.keys(safeBody))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Invalidate the front-facing casino pages so changes show immediately
  const slug = (data as { slug: string }).slug
  for (const lang of ["fi", "en", "uk"]) {
    revalidatePath(`/${lang}/nettikasinot/${slug}`)
  }

  return NextResponse.json(data)
}
