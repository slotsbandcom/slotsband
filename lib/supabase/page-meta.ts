import { createClient } from "@/lib/supabase/server"
import type { Lang } from "@/lib/types"

export async function getPageMeta(slug: string, lang: Lang) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("pages")
      .select("meta_title, meta_description")
      .eq("slug", slug)
      .eq("lang", lang)
      .single()
    return {
      meta_title: (data?.meta_title as string | null) ?? null,
      meta_description: (data?.meta_description as string | null) ?? null,
    }
  } catch {
    return { meta_title: null, meta_description: null }
  }
}
