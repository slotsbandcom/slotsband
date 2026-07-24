import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const { data, error } = await adminDb()
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name_fi", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name_fi, name_en, name_uk, slug, icon, description_fi, description_en, description_uk, is_active, sort_order } = body

  if (!name_fi?.trim()) return NextResponse.json({ error: "Category name (FI) is required" }, { status: 400 })
  if (!slug?.trim()) return NextResponse.json({ error: "Slug is required" }, { status: 400 })

  const { data, error } = await adminDb()
    .from("categories")
    .insert({
      name_fi: name_fi.trim(),
      name_en: name_en?.trim() || null,
      name_uk: name_uk?.trim() || null,
      slug: slug.trim(),
      icon: icon || null,
      description_fi: description_fi?.trim() || null,
      description_en: description_en?.trim() || null,
      description_uk: description_uk?.trim() || null,
      is_active: is_active ?? true,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
