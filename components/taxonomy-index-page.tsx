import Link from "next/link"
import type { Lang } from "@/lib/types"
import type { TaxonomyTerm } from "@/lib/supabase/taxonomy-queries"
import { getTermName } from "@/lib/supabase/taxonomy-queries"
import { TAXONOMY_CONFIG_BY_TAXONOMY } from "@/lib/taxonomy-config"

interface Props {
  taxonomy: string
  lang: Lang
  terms: (TaxonomyTerm & { casino_count: number })[]
}

const SITE_URL = "https://slotsband.com"

export function TaxonomyIndexPage({ taxonomy, lang, terms }: Props) {
  const config = TAXONOMY_CONFIG_BY_TAXONOMY[taxonomy]
  if (!config) return null
  const labels = config.labels[lang]
  const homeLabel = lang === "fi" ? "Etusivu" : "Home"

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Hero */}
      <div className="bg-white border-b border-[#E5E8F0] py-6 md:py-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#787585] mb-3">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">
              {homeLabel}
            </Link>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">chevron_right</span>
            <span className="text-[#2D1783] font-semibold">{labels.crumb}</span>
          </nav>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#2D1783]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#2D1783] text-[22px]">{config.icon}</span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-4xl text-[#1b1b1c] text-balance">
              {labels.title} 2026
            </h1>
          </div>
          <p className="text-sm md:text-base text-[#787585] leading-relaxed">{labels.subtitle}</p>
        </div>
      </div>

      {/* Term grid */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-6 md:py-10">
        {terms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E8F0] p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-[#E5E8F0] block mb-3" aria-hidden="true">
              {config.icon}
            </span>
            <p className="text-[#787585] font-semibold">
              {lang === "fi" ? "Ei kategorioita saatavilla." : "No items available yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {terms.map((term) => {
              const name = getTermName(term, lang)
              return (
                <Link
                  key={term.id}
                  href={`/${lang}/${config.path}/${term.slug}`}
                  className="group bg-white rounded-2xl border border-[#E5E8F0] p-5 flex flex-col gap-3 hover:border-[#2D1783] hover:shadow-md transition-all"
                >
                  {/* Icon / image */}
                  <div className="w-10 h-10 rounded-xl bg-[#2D1783]/10 flex items-center justify-center flex-shrink-0">
                    {term.icon ? (
                      <span className="material-symbols-outlined text-[#2D1783] text-[22px]">{term.icon}</span>
                    ) : (
                      <span className="material-symbols-outlined text-[#2D1783] text-[22px]">{config.icon}</span>
                    )}
                  </div>

                  {/* Name */}
                  <h2 className="font-display font-bold text-[#1b1b1c] text-base group-hover:text-[#2D1783] transition-colors leading-snug">
                    {name}
                  </h2>

                  {/* Casino count */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#E5E8F0]">
                    <span className="text-xs text-[#787585]">
                      <span className="font-bold text-[#1b1b1c]">{term.casino_count}</span>{" "}
                      {labels.countUnit}{term.casino_count !== 1 ? (lang === "fi" ? "a" : "s") : ""}
                    </span>
                    <span className="material-symbols-outlined text-[#2D1783] text-[18px] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
