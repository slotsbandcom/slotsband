import { getCasinos } from "@/lib/supabase/queries"
import AdminCasinosClient from "./casinos-client"

export default async function AdminCasinosPage() {
  const casinos = await getCasinos()
  return <AdminCasinosClient casinos={casinos} />
}
