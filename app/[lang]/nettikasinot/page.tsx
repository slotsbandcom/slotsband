import { getCasinos } from "@/lib/supabase/queries"
import NettikasinotPage from "./listing-client"

interface Props {
  params: Promise<{ lang: string }>
}

export default async function NettikasinotRSC({ params }: Props) {
  const casinos = await getCasinos({ activeOnly: true })
  return <NettikasinotPage params={params} casinos={casinos} />
}
