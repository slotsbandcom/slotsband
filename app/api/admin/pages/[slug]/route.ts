import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Params = { params: Promise<{ slug: string }> }

// GET — return all lang rows for this slug (or route_key) as { fi, en, uk }
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const db = adminDb()

  // Try route_key first (admin pages use route_key as URL param for code routes)
  const { data: byRouteKey } = await db
    .from("pages")
    .select("*")
    .eq("route_key", slug)
  if (byRouteKey && byRouteKey.length > 0) {
    const result: Record<string, unknown> = { route_key: slug, is_code_route: true }
    for (const row of byRouteKey) result[row.lang as string] = row
    return NextResponse.json(result)
  }

  // Fall back to slug lookup
  const { data, error } = await db
    .from("pages")
    .select("*")
    .eq("slug", slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const result: Record<string, unknown> = { slug }
  for (const row of data) result[row.lang as string] = row
  return NextResponse.json(result)
}

// PATCH — update rows for provided langs
// For code routes: updates by (route_key, lang) to allow per-lang slug changes
// For regular pages: upserts by (slug, lang)
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params
  const body = await req.json()
  const db = adminDb()
  const isCodeRoute = body.is_code_route ?? false

  if (isCodeRoute) {
    // Code route: update each lang row by (route_key, lang)
    // URL param `slug` is the route_key
    const routeKey = slug
    const updated: unknown[] = []

    for (const lang of ["fi", "en", "uk"] as const) {
      const d = body[lang]
      if (!d) continue
      const newSlug = (d.slug as string | undefined)?.trim() || routeKey

      const { data, error } = await db
        .from("pages")
        .update({
          slug: newSlug,
          meta_title: (d.meta_title as string | undefined)?.trim() || null,
          meta_description: (d.meta_description as string | undefined)?.trim() || null,
          is_published: (d.is_published as boolean | undefined) ?? false,
        })
        .eq("route_key", routeKey)
        .eq("lang", lang)
        .select()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      if (data) updated.push(...data)
    }

    const result: Record<string, unknown> = { route_key: routeKey, is_code_route: true }
    for (const row of updated as Array<Record<string, unknown>>) {
      result[row.lang as string] = row
    }
    return NextResponse.json(result)
  }

  // Regular page: upsert by (slug, lang)
  const rows = []
  for (const lang of ["fi", "en", "uk"] as const) {
    const d = body[lang]
    if (!d) continue
    if (d.title !== undefined && !d.title?.trim()) continue
    rows.push({
      slug,
      lang,
      title: d.title?.trim() ?? "",
      content: d.content ?? null,
      meta_title: (d.meta_title as string | undefined)?.trim() || null,
      meta_description: (d.meta_description as string | undefined)?.trim() || null,
      is_published: (d.is_published as boolean | undefined) ?? false,
      is_code_route: false,
    })
  }

  if (rows.length === 0) return NextResponse.json({ error: "No valid lang data" }, { status: 400 })

  const { data, error } = await db
    .from("pages")
    .upsert(rows, { onConflict: "slug,lang" })
    .select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result: Record<string, unknown> = { slug }
  for (const row of data) result[row.lang as string] = row
  return NextResponse.json(result)
}

// DELETE — remove all lang rows for this slug (blocked for code routes)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params
  const db = adminDb()

  // Check by slug or route_key
  const { data: bySlug } = await db.from("pages").select("is_code_route").eq("slug", slug).limit(1).maybeSingle()
  const { data: byRK } = await db.from("pages").select("is_code_route").eq("route_key", slug).limit(1).maybeSingle()
  if (bySlug?.is_code_route || byRK?.is_code_route) {
    return NextResponse.json({ error: "Cannot delete a built-in code route" }, { status: 403 })
  }

  const { error } = await db.from("pages").delete().eq("slug", slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
