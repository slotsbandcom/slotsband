import Link from "next/link"
import type { Lang, Casino } from "@/lib/types"
import type { TaxonomyTerm, FaqItem } from "@/lib/supabase/taxonomy-queries"
import { getTermName, getTermDescription } from "@/lib/supabase/taxonomy-queries"
import { TAXONOMY_CONFIG_BY_TAXONOMY } from "@/lib/taxonomy-config"
import { CasinoCard } from "@/components/casino-card"

interface Props {
  taxonomy: string
  lang: Lang
  term: TaxonomyTerm
  casinos: Casino[]
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function getTermFaq(term: TaxonomyTerm, lang: string): FaqItem[] | null {
  if (lang === "uk") return term.faq_uk ?? term.faq_en ?? term.faq_fi
  if (lang === "en") return term.faq_en ?? term.faq_fi
  return term.faq_fi
}

export function TaxonomyTermPage({ taxonomy, lang, term, casinos }: Props) {
  const config = TAXONOMY_CONFIG_BY_TAXONOMY[taxonomy]
  if (!config) return null
  const labels = config.labels[lang]
  const name = getTermName(term, lang)
  const descHtml = getTermDescription(term, lang)
  const faqItems = getTermFaq(term, lang)
  const homeLabel = lang === "fi" ? "Etusivu" : "Home"
  const faqHeading = lang === "fi" ? "Usein kysytyt kysymykset" : "Frequently Asked Questions"

  const countLabel =
    lang === "fi"
      ? `${casinos.length} ${labels.countUnit}${casinos.length !== 1 ? "a" : ""}`
      : `${casinos.length} ${labels.countUnit}${casinos.length !== 1 ? "s" : ""}`

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Hero */}
      <div className="bg-white border-b border-[#E5E8F0] py-6 md:py-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B6879] mb-3 flex-wrap">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">
              {homeLabel}
            </Link>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">chevron_right</span>
            <Link href={`/${lang}/${config.path}`} className="hover:text-[#2D1783] transition-colors">
              {labels.crumb}
            </Link>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">chevron_right</span>
            <span className="text-[#2D1783] font-semibold">{name}</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2D1783]/10 flex items-center justify-center flex-shrink-0 mt-1">
              {term.icon ? (
                <span className="material-symbols-outlined text-[#2D1783] text-[24px]">{term.icon}</span>
              ) : (
                <span className="material-symbols-outlined text-[#2D1783] text-[24px]">{config.icon}</span>
              )}
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl md:text-4xl text-[#1b1b1c] text-balance">{name}</h1>
              <p className="text-sm text-[#6B6879] mt-1">{countLabel}</p>
            </div>
          </div>

          {/* Description */}
          {descHtml && (
            <div
              className="mt-4 casino-review"
              dangerouslySetInnerHTML={{ __html: descHtml }}
            />
          )}

          {/* FAQ accordion */}
          {faqItems && faqItems.length > 0 && (
            <section className="mt-6 bg-white rounded-2xl border border-[#E5E8F0] p-6">
              <h2 className="font-display font-bold text-lg text-[#111827] mb-4">
                {faqHeading}
              </h2>
              <div className="divide-y divide-[#E5E8F0]">
                {faqItems.map((faq, i) => (
                  <details key={i} className="group">
                    <summary className="flex items-center justify-between py-4 cursor-pointer text-sm font-semibold text-[#111827] list-none hover:text-[#2D1783] hover:bg-[#F5F3FF] rounded-lg px-3 -mx-3 transition-colors gap-3 select-none">
                      <span className="flex-1">{faq.q}</span>
                      <span className="material-symbols-outlined text-[#2D1783] group-open:rotate-180 transition-transform duration-200 text-[20px] flex-shrink-0">expand_more</span>
                    </summary>
                    <div
                      className="faq-answer pb-4 pt-3 text-sm text-[#6B7280] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: faq.a }}
                    />
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Casino list */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-6 md:py-10">
        {casinos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E8F0] p-12 text-center">
            <span className="material-symbols-outlined text-[64px] text-[#E5E8F0] block mb-4" aria-hidden="true">
              casino
            </span>
            <h2 className="font-display font-bold text-lg text-[#1b1b1c] mb-2">
              {lang === "fi" ? "Tulossa pian" : "Coming Soon"}
            </h2>
            <p className="text-[#6B6879] text-sm max-w-sm mx-auto">{labels.noCasinos}</p>
            <Link
              href={`/${lang}/${config.path}`}
              className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-[#2D1783] hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
              {labels.crumb}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {casinos.map((casino) => (
              <CasinoCard key={casino.id} casino={casino} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
