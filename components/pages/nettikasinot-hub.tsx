import { getCasinosWithTermIds } from "@/lib/supabase/queries"
import { getTaxonomyTerms } from "@/lib/supabase/taxonomy-queries"
import NettikasinotPage from "@/app/[lang]/nettikasinot/listing-client"
import type { Lang } from "@/lib/types"
import type { TaxonomyTerm } from "@/lib/supabase/taxonomy-queries"

export async function NettikasinotHub({ lang, initialFilter }: { lang: Lang; initialFilter?: string | null }) {
  const [casinos, licenceTermsRaw, depositTermsRaw] = await Promise.all([
    getCasinosWithTermIds(),
    getTaxonomyTerms("licence"),
    getTaxonomyTerms("deposit-method"),
  ])

  // Derive term → casino count directly from the casino data already fetched.
  // This avoids the Supabase 1000-row default limit that makes a separate
  // casino_taxonomy_terms aggregate query return silently wrong counts when
  // the table has more than 1000 rows total (87 casinos × many terms → >1000).
  const termCountMap: Record<string, number> = {}
  for (const casino of casinos) {
    for (const termId of casino.term_ids ?? []) {
      termCountMap[termId] = (termCountMap[termId] ?? 0) + 1
    }
  }

  const withCounts = (terms: TaxonomyTerm[]) =>
    terms
      .map((t) => ({ ...t, casino_count: termCountMap[t.id] ?? 0 }))
      .filter((t) => t.casino_count > 0)
      .sort((a, b) => b.casino_count - a.casino_count)

  return (
    <NettikasinotPage
      params={Promise.resolve({ lang })}
      casinos={casinos}
      licenceTerms={withCounts(licenceTermsRaw)}
      depositTerms={withCounts(depositTermsRaw)}
      initialFilter={initialFilter}
    />
  )
}
