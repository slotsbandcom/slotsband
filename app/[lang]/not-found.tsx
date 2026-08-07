import Link from "next/link"
import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { TRANSLATIONS } from "@/lib/data"
import { getRouteSlugsByLang } from "@/lib/supabase/route-slugs"

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  // not-found.tsx does not receive the [lang] route param, so we fall back
  // to the default locale — the header/footer inside the [lang] layout that
  // wraps this page already renders in the correct language regardless.
  const lang: Lang = "fi"
  const t = TRANSLATIONS[lang].notFound
  const navSlugs = await getRouteSlugsByLang(lang)
  const ns = (key: string) => navSlugs[key] || key

  const links = [
    { label: TRANSLATIONS[lang].nav.casinos, icon: "casino", href: `/${lang}/${ns("nettikasinot")}` },
    { label: TRANSLATIONS[lang].nav.bonuses, icon: "redeem", href: `/${lang}/${ns("kasinobonukset")}` },
    { label: TRANSLATIONS[lang].nav.games, icon: "sports_esports", href: `/${lang}/${ns("kasinopelit")}` },
    { label: TRANSLATIONS[lang].footer.blog, icon: "article", href: `/${lang}/${ns("blogi")}` },
  ]

  return (
    <div className="min-h-[70vh] bg-[#F8F9FD] flex items-center justify-center px-4 py-16">
      <div className="max-w-[560px] w-full text-center">
        <p className="text-xs font-bold tracking-wide uppercase text-[#2D1783]/70 mb-3">{t.eyebrow}</p>
        <div
          className="font-display font-bold text-[96px] leading-none mb-2 bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #2D1783, #6b21a8)" }}
        >
          404
        </div>
        <h1 className="font-display font-bold text-2xl text-[#1b1b1c] mb-3">{t.title}</h1>
        <p className="text-sm text-[#6B6879] mb-8 leading-relaxed">{t.subtitle}</p>

        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 bg-[#FFD700] text-[#2D1783] font-bold text-sm px-6 py-3 rounded-full hover:bg-[#ffe033] active:scale-95 transition-all mb-10"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">home</span>
          {t.homeCta}
        </Link>

        <p className="text-xs font-bold uppercase tracking-wide text-[#6B6879] mb-3">{t.popularTitle}</p>
        <div className="grid grid-cols-2 gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2.5 bg-white rounded-2xl border border-[#E5E8F0] px-4 py-3.5 text-left hover:border-[#2D1783]/40 hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-[#2D1783] text-[20px]" aria-hidden="true">{l.icon}</span>
              <span className="font-semibold text-sm text-[#1b1b1c]">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
