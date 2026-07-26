import { getCasinosWithTermIds } from "@/lib/supabase/queries"
import { getTaxonomyTermsWithCounts } from "@/lib/supabase/taxonomy-queries"
import NettikasinotPage from "@/app/[lang]/nettikasinot/listing-client"
import type { Lang } from "@/lib/types"

export async function NettikasinotHub({ lang, initialFilter }: { lang: Lang; initialFilter?: string | null }) {
  const [casinos, licenceTermsRaw, depositTermsRaw] = await Promise.all([
    getCasinosWithTermIds(),
    getTaxonomyTermsWithCounts("licence"),
    getTaxonomyTermsWithCounts("deposit-method"),
  ])

  // Sort by casino count descending so top picks appear first
  const licenceTerms = licenceTermsRaw
    .filter((t) => t.casino_count > 0)
    .sort((a, b) => b.casino_count - a.casino_count)

  const depositTerms = depositTermsRaw
    .filter((t) => t.casino_count > 0)
    .sort((a, b) => b.casino_count - a.casino_count)

  return (
    <NettikasinotPage
      params={Promise.resolve({ lang })}
      casinos={casinos}
      licenceTerms={licenceTerms}
      depositTerms={depositTerms}
      initialFilter={initialFilter}
    />
  )
}
