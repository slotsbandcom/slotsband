"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Lang } from "@/lib/types"

export interface NotFoundCopy {
  t: { eyebrow: string; title: string; subtitle: string; homeCta: string; popularTitle: string }
  links: { label: string; icon: string; href: string }[]
}

export function NotFoundContent({ copy }: { copy: Record<Lang, NotFoundCopy> }) {
  const pathname = usePathname() ?? ""
  const match = pathname.match(/^\/(fi|en|uk)(?:\/|$)/)
  const lang: Lang = (match ? match[1] : "fi") as Lang
  const { t, links } = copy[lang]

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
