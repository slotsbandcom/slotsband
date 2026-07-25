import { getCasinos } from "@/lib/supabase/queries"
import NettikasinotPage from "@/app/[lang]/nettikasinot/listing-client"
import type { Lang } from "@/lib/types"

export async function NettikasinotHub({ lang }: { lang: Lang }) {
  const casinos = await getCasinos({ activeOnly: true })
  return <NettikasinotPage params={Promise.resolve({ lang })} casinos={casinos} />
}
