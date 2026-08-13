import { getBonusHunts } from "@/lib/supabase/queries"
import AdminBonushuntPage from "./bonushunt-admin-client"

export default async function BonushuntPage() {
  const sessions = await getBonusHunts()
  return <AdminBonushuntPage sessions={sessions} />
}
