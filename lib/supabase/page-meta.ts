import { unstable_cache } from "next/cache"
import { createBuildClient } from "@/lib/supabase/build-client"
import { publicCache } from "@/lib/supabase/public-cache"
import type { Lang } from "@/lib/types"

async function fetchPageMeta(slug: string, lang: Lang) {
  try {
    const supabase = createBuildClient()
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

export const getPageMeta = unstable_cache(fetchPageMeta, ["page-meta"], publicCache("pages"))
