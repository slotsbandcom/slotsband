import { unstable_cache } from "next/cache"
import { createBuildClient } from "@/lib/supabase/build-client"
import type { Casino } from "@/lib/types"

// See lib/supabase/queries.ts for why these public reads are cached — this
// is the taxonomy-terms half of the same egress-quota fix.
const PUBLIC_CACHE = { revalidate: 60 }

export interface FaqItem {
  q: string
  a: string
}

export interface TaxonomyTerm {
  id: string
  taxonomy: string
  slug_fi: string
  slug_en: string
  slug_uk: string
  name_fi: string
  name_en: string | null
  name_uk: string | null
  description_fi: string | null
  description_en: string | null
  description_uk: string | null
  faq_fi: FaqItem[] | null
  faq_en: FaqItem[] | null
  faq_uk: FaqItem[] | null
  icon: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
}

async function fetchTaxonomyTerms(taxonomy: string): Promise<TaxonomyTerm[]> {
  const supabase = createBuildClient()
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
export const getTaxonomyTerms = unstable_cache(fetchTaxonomyTerms, ["taxonomy-terms"], PUBLIC_CACHE)

async function fetchTaxonomyTerm(
  taxonomy: string,
  slug: string,
  lang = "fi"
): Promise<TaxonomyTerm | null> {
  const supabase = createBuildClient()
  const slugCol = lang === "fi" ? "slug_fi" : lang === "en" ? "slug_en" : "slug_uk"
  const { data, error } = await supabase
    .from("taxonomy_terms")
    .select("*")
    .eq("taxonomy", taxonomy)
    .eq(slugCol, slug)
    .single()
  if (error) return null
  return data as TaxonomyTerm
}
export const getTaxonomyTerm = unstable_cache(fetchTaxonomyTerm, ["taxonomy-term"], PUBLIC_CACHE)

async function fetchCasinosByTerm(termId: string): Promise<Casino[]> {
  const supabase = createBuildClient()

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
export const getCasinosByTerm = unstable_cache(fetchCasinosByTerm, ["casinos-by-term"], PUBLIC_CACHE)

async function fetchTaxonomyTermsWithCounts(
  taxonomy: string
): Promise<(TaxonomyTerm & { casino_count: number })[]> {
  const supabase = createBuildClient()
  const { data: terms, error } = await supabase
    .from("taxonomy_terms")
    .select("*")
    .eq("taxonomy", taxonomy)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name_fi", { ascending: true })

  if (error) {
    console.error(`[taxonomy-queries] getTaxonomyTermsWithCounts(${taxonomy}):`, error.message)
    return []
  }
  if (!terms?.length) return []

  // Filter to only this taxonomy's term IDs so we don't fetch the entire
  // casino_taxonomy_terms table (which can exceed Supabase's 1000-row default
  // limit and produce silently wrong counts).  Paginate in case even the
  // filtered set exceeds 1000 rows (e.g. deposit-method with many casinos).
  const termIds = terms.map((t) => t.id)
  const counts: Record<string, number> = {}
  let offset = 0
  const PAGE = 1000
  while (true) {
    const { data: rows } = await supabase
      .from("casino_taxonomy_terms")
      .select("term_id")
      .in("term_id", termIds)
      .range(offset, offset + PAGE - 1)
    for (const row of rows ?? []) {
      counts[row.term_id] = (counts[row.term_id] ?? 0) + 1
    }
    if (!rows || rows.length < PAGE) break
    offset += PAGE
  }

  return terms.map((t) => ({ ...t, casino_count: counts[t.id] ?? 0 })) as (TaxonomyTerm & {
    casino_count: number
  })[]
}
export const getTaxonomyTermsWithCounts = unstable_cache(fetchTaxonomyTermsWithCounts, ["taxonomy-terms-with-counts"], PUBLIC_CACHE)

export async function getTermSlugsByLang(
  taxonomy: string
): Promise<{ slug_fi: string; slug_en: string; slug_uk: string }[]> {
  const supabase = createBuildClient()
  const { data, error } = await supabase
    .from("taxonomy_terms")
    .select("slug_fi, slug_en, slug_uk")
    .eq("taxonomy", taxonomy)
    .eq("is_active", true)
  if (error) {
    console.error(`[taxonomy-queries] getTermSlugsByLang(${taxonomy}):`, error.message)
    return []
  }
  return (data ?? []) as { slug_fi: string; slug_en: string; slug_uk: string }[]
}

export function getTermName(term: TaxonomyTerm, lang: string): string {
  if (lang === "fi") return term.name_fi
  if (lang === "uk") return term.name_uk ?? term.name_en ?? term.name_fi
  return term.name_en ?? term.name_fi
}

export function getTermSlug(term: TaxonomyTerm, lang: string): string {
  if (lang === "fi") return term.slug_fi
  if (lang === "uk") return term.slug_uk
  return term.slug_en
}

export function getTermDescription(term: TaxonomyTerm, lang: string): string | null {
  if (lang === "fi") return term.description_fi
  if (lang === "uk") return term.description_uk
  return term.description_en
}
