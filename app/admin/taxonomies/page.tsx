import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import AdminTaxonomiesClient from "./taxonomies-client"
import type { TaxonomyTerm } from "./taxonomies-client"

async function getTerms(): Promise<TaxonomyTerm[]> {
  const db = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: terms, error }, { data: cttRows }] = await Promise.all([
    db
      .from("taxonomy_terms")
      .select("*")
      .order("taxonomy", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name_fi", { ascending: true }),
    db.from("casino_taxonomy_terms").select("term_id"),
  ])

  if (error) {
    console.error("[admin/taxonomies]", error.message)
    return []
  }

  const casinoCountByTermId: Record<string, number> = {}
  for (const row of cttRows ?? []) {
    casinoCountByTermId[row.term_id] = (casinoCountByTermId[row.term_id] ?? 0) + 1
  }

  return (terms ?? []).map((t) => ({
    ...t,
    casino_count: casinoCountByTermId[t.id] ?? 0,
  })) as TaxonomyTerm[]
}

export default async function AdminTaxonomiesPage() {
  const terms = await getTerms()
  return <AdminTaxonomiesClient terms={terms} />
}
