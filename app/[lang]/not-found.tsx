import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { TRANSLATIONS } from "@/lib/data"
import { getRouteSlugsByLang } from "@/lib/supabase/route-slugs"
import { NotFoundContent, type NotFoundCopy } from "./not-found-content"

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
}

const VALID_LANGS: Lang[] = ["fi", "en", "uk"]

// not-found.tsx doesn't receive the [lang] param. Instead of reading a
// request header (which made every 404 — and every bot probe — a dynamic
// render), build the copy for all three languages here (cookie-free, cached)
// and let the client component pick one from the URL.
export default async function NotFound() {
  const entries = await Promise.all(
    VALID_LANGS.map(async (lang): Promise<[Lang, NotFoundCopy]> => {
      const navSlugs = await getRouteSlugsByLang(lang)
      const ns = (key: string) => navSlugs[key] || key
      return [lang, {
        t: TRANSLATIONS[lang].notFound,
        links: [
          { label: TRANSLATIONS[lang].nav.casinos, icon: "casino", href: `/${lang}/${ns("nettikasinot")}` },
          { label: TRANSLATIONS[lang].nav.bonuses, icon: "redeem", href: `/${lang}/${ns("kasinobonukset")}` },
          { label: TRANSLATIONS[lang].nav.games, icon: "sports_esports", href: `/${lang}/${ns("kasinopelit")}` },
          { label: TRANSLATIONS[lang].footer.blog, icon: "article", href: `/${lang}/${ns("blogi")}` },
        ],
      }]
    }),
  )
  return <NotFoundContent copy={Object.fromEntries(entries) as Record<Lang, NotFoundCopy>} />
}
