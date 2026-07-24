import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import AdminCategoriesClient from "./categories-client"
import type { Category } from "./categories-client"

async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name_fi", { ascending: true })

  if (error) {
    console.error("[admin/categories]", error.message)
    return []
  }
  return (data ?? []) as Category[]
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()
  return <AdminCategoriesClient categories={categories} />
}
