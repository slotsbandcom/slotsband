import Link from "next/link"
import type { Lang } from "@/lib/types"
import { TRANSLATIONS } from "@/lib/data"

const VALID_LANGS: Lang[] = ["fi", "en", "uk"]

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "fi") as Lang
  const t = TRANSLATIONS[lang].about

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Header */}
      <header className="bg-[#2D1783] text-white pt-10 pb-14 md:pt-14 md:pb-18">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-2">{t.eyebrow}</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white text-balance max-w-xl leading-snug">
            {t.title}
          </h1>
          <p className="text-white/70 text-sm mt-3 max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {t.trust.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display font-bold text-2xl text-[#FFD700]">{s.value}</p>
                <p className="text-white/60 text-[10px] uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10 space-y-12">
        {/* Methodology */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-[#1b1b1c]">{t.methodologyTitle}</h2>
              <p className="text-sm text-[#6B6879] mt-1">{t.methodologySubtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.methodology.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-[#2D1783]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#2D1783] text-[20px]" aria-hidden="true">{item.icon}</span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#1b1b1c]">{item.title}</h3>
                </div>
                <p className="text-sm text-[#6B6879] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust signals / editorial standards */}
        <section className="bg-white rounded-2xl border border-[#E5E8F0] p-6 md:p-8">
          <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-4">{t.standardsTitle}</h2>
          <div className="space-y-3">
            {t.standards.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-[#27AE60]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[#27AE60] text-[13px]" aria-hidden="true">check</span>
                </div>
                <p className="text-sm text-[#474554] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA to contact */}
        <div className="text-center bg-[#2D1783] rounded-2xl p-8 md:p-10">
          <h3 className="font-display font-bold text-xl text-white mb-2">{t.ctaTitle}</h3>
          <p className="text-white/70 text-sm mb-5">{t.ctaSubtitle}</p>
          <Link
            href={`/${lang}/contact`}
            className="inline-flex items-center gap-2 bg-[#FFD700] text-[#2D1783] font-bold text-sm px-6 py-3 rounded-full hover:bg-[#FFE866] active:scale-95 transition-all"
          >
            {t.ctaButton}
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>
      </div>
      <div className="pb-12" />
    </div>
  )
}
