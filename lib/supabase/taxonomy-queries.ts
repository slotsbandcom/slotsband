import { createClient } from "@/lib/supabase/server"
import { createBuildClient } from "@/lib/supabase/build-client"
import type { Casino } from "@/lib/types"

export interface TaxonomyTerm {
  id: string
  taxonomy: string
  slug: string
  name_fi: string
  name_en: string | null
  name_uk: string | null
  description_fi: string | null
  description_en: string | null
  description_uk: string | null
  icon: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
}

export async function getTaxonomyTerms(taxonomy: string): Promise<TaxonomyTerm[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("taxonomy_terms")
    .select("*")
    .eq("taxonomy", taxonomy)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name_fi", { ascending: true })
  if (error) {
    console.error(`[taxonomy-queries] getTaxonomyTerms(${taxonomy}):`, error.message)
    return []
  }
  return (data ?? []) as TaxonomyTerm[]
}

export async function getTaxonomyTerm(taxonomy: string, slug: string): Promise<TaxonomyTerm | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("taxonomy_terms")
    .select("*")
    .eq("taxonomy", taxonomy)
    .eq("slug", slug)
    .single()
  if (error) return null
  return data as TaxonomyTerm
}

export async function getCasinosByTerm(termId: string): Promise<Casino[]> {
  const supabase = await createClient()

  const { data: cttRows, error: cttError } = await supabase
    .from("casino_taxonomy_terms")
    .select("casino_id")
    .eq("term_id", termId)
  if (cttError) {
    console.error("[taxonomy-queries] getCasinosByTerm ctt:", cttError.message)
    return []
  }

  const ids = (cttRows ?? []).map((r) => r.casino_id)
  if (ids.length === 0) return []

  const { data: casinos, error: ce } = await supabase
    .from("casinos")
    .select("*")
    .in("id", ids)
    .eq("is_active", true)
    .order("rank", { ascending: true, nullsFirst: false })
  if (ce) {
    console.error("[taxonomy-queries] getCasinosByTerm casinos:", ce.message)
    return []
  }
  return (casinos ?? []) as Casino[]
}

export async function getTaxonomyTermsWithCounts(
  taxonomy: string
): Promise<(TaxonomyTerm & { casino_count: number })[]> {
  const supabase = await createClient()
  const [{ data: terms, error }, { data: cttRows }] = await Promise.all([
    supabase
      .from("taxonomy_terms")
      .select("*")
      .eq("taxonomy", taxonomy)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name_fi", { ascending: true }),
    supabase.from("casino_taxonomy_terms").select("term_id"),
  ])
  if (error) {
    console.error(`[taxonomy-queries] getTaxonomyTermsWithCounts(${taxonomy}):`, error.message)
    return []
  }
  const counts: Record<string, number> = {}
  for (const row of cttRows ?? []) {
    counts[row.term_id] = (counts[row.term_id] ?? 0) + 1
  }
  return (terms ?? []).map((t) => ({ ...t, casino_count: counts[t.id] ?? 0 })) as (TaxonomyTerm & {
    casino_count: number
  })[]
}

export async function getTermSlugs(taxonomy: string): Promise<string[]> {
  const supabase = createBuildClient()
  const { data, error } = await supabase
    .from("taxonomy_terms")
    .select("slug")
    .eq("taxonomy", taxonomy)
    .eq("is_active", true)
  if (error) {
    console.error(`[taxonomy-queries] getTermSlugs(${taxonomy}):`, error.message)
    return []
  }
  return (data ?? []).map((r: { slug: string }) => r.slug)
}

export function getTermName(term: TaxonomyTerm, lang: string): string {
  if (lang === "fi") return term.name_fi
  if (lang === "uk") return term.name_uk ?? term.name_en ?? term.name_fi
  return term.name_en ?? term.name_fi
}

export function getTermDescription(term: TaxonomyTerm, lang: string): string | null {
  if (lang === "fi") return term.description_fi
  if (lang === "uk") return term.description_uk ?? term.description_en ?? term.description_fi
  return term.description_en ?? term.description_fi
}
