import { getAdminCasinos } from "@/lib/supabase/queries"
import AdminCasinosClient from "./casinos-client"

export default async function AdminCasinosPage() {
  const casinos = await getAdminCasinos()
  return <AdminCasinosClient casinos={casinos} />
}
