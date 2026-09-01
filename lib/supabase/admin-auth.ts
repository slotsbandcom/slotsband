import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

export type AdminRole = "admin" | "editor"

export function roleOf(user: User): AdminRole {
  return user.app_metadata?.role === "editor" ? "editor" : "admin"
}

export async function getAdminSession(): Promise<{ user: User; role: AdminRole } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return { user, role: roleOf(user) }
}
