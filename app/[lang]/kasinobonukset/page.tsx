"use client"

import { useState } from "react"
import Link from "next/link"
import { BONUSES, CASINOS, TRANSLATIONS } from "@/lib/data"
import type { Lang } from "@/lib/types"

const BONUS_TABS = [
  { id: "all",         label_fi: "Kaikki bonukset",     icon: "redeem" },
  { id: "welcome",     label_fi: "Tervetuliaisbonus",   icon: "celebration" },
  { id: "no_deposit",  label_fi: "Ei talletusta",        icon: "wallet" },
  { id: "free_spins",  label_fi: "Ilmaiskierrokset",     icon: "casino" },
  { id: "cashback",    label_fi: "Cashback",             icon: "currency_exchange" },
]

function WageringBadge({ wagering }: { wagering?: number }) {
  if (wagering === 0) return (
    <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
      <span className="material-symbols-outlined text-[11px]">check_circle</span>
      Kierrätysvapaa
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 bg-[#F8F9FD] border border-[#E5E8F0] text-[#474554] text-[10px] font-bold px-2 py-0.5 rounded-full">
      {wagering}x kierrätys
    </span>
  )
}

export default function BonusesPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang as Lang) || "fi"
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.fi
  const [activeTab, setActiveTab] = useState("all")
  const [maxWagering, setMaxWagering] = useState(50)
  const [maxMinDeposit, setMaxMinDeposit] = useState(50)

  const filtered = BONUSES.filter((b) => {
    if (activeTab !== "all" && b.bonus_type !== activeTab) return false
    if ((b.wagering ?? 0) > maxWagering) return false
    if ((b.min_deposit ?? 0) > maxMinDeposit) return false
    return true
  })

  const featured = BONUSES.filter((b) => b.is_featured).slice(0, 3)

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Page hero */}
      <header className="bg-[#2D1783] text-white pt-8 pb-10 md:pt-12 md:pb-14">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-2">Bonukset</p>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-white text-balance">
                {lang === "fi" ? "Parhaat Kasinobonukset 2026" : "Best Casino Bonuses 2026"}
              </h1>
              <p className="text-white/70 text-sm mt-2 max-w-xl leading-relaxed">
                {lang === "fi"
                  ? "Olemme koonneet parhaat eksklusiiviset bonukset suomalaisille pelaajille. Kaikki bonukset tarkistettu ja vertailtu."
                  : "We've collected the best exclusive bonuses for players. All bonuses verified and compared."}
              </p>
            </div>
            {/* Stats row */}
            <div className="flex gap-4 flex-shrink-0">
              {[
                { label: "Bonusta", value: String(BONUSES.length) },
                { label: "Eksklusiivista", value: String(BONUSES.filter(b => b.is_featured).length) },
                { label: "Kierrätysvapaata", value: String(BONUSES.filter(b => b.wagering === 0).length) },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display font-bold text-2xl text-[#FFD700]">{s.value}</p>
                  <p className="text-white/60 text-[10px] uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Featured banners */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-12 -mt-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {featured.map((b) => {
            const casino = CASINOS.find(c => c.id === b.casino_id)
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-[#E5E8F0] p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 bg-[#F0EDEE] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#2D1783] text-[20px]" aria-hidden="true">casino</span>
                  </div>
                  <span className="bg-[#FFF4B0] text-[#775900] text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide">Eksklusiivinen</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[#787585] uppercase tracking-wide">{b.casino_name}</p>
                  <p className="font-display font-bold text-[#2D1783] text-sm leading-tight mt-0.5">{b.amount}</p>
                </div>
                <WageringBadge wagering={b.wagering} />
                <a
                  href={`/${lang}/mene/${casino?.mene_slug ?? b.casino_slug}`}
                  rel="nofollow sponsored noopener noreferrer"
                  target="_blank"
                  className="mt-auto w-full bg-[#2D1783] text-white font-bold text-xs py-2.5 rounded-xl text-center hover:bg-[#3e2db2] active:scale-95 transition-all"
                >
                  Lunasta bonus
                </a>
              </div>
            )
          })}
        </div>
      </section>

      {/* Tabs + Filters */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-12 mt-8">
        {/* Tabs — horizontally scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
          {BONUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[#2D1783] text-white shadow-md"
                  : "bg-white border border-[#E5E8F0] text-[#474554] hover:border-[#2D1783]"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{tab.icon}</span>
              {tab.label_fi}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 space-y-5 sticky top-[120px]">
              <p className="font-display font-bold text-sm text-[#1b1b1c]">Suodattimet</p>
              <div>
                <label className="text-[10px] font-bold text-[#787585] uppercase tracking-wide block mb-2">
                  Maks. kierrätys: {maxWagering === 50 ? "Kaikki" : `${maxWagering}x`}
                </label>
                <input
                  type="range" min={0} max={50} step={5} value={maxWagering}
                  onChange={(e) => setMaxWagering(Number(e.target.value))}
                  className="w-full accent-[#2D1783]"
                />
                <div className="flex justify-between text-[9px] text-[#787585] mt-0.5">
                  <span>Kierrätysvapaa</span><span>50x</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#787585] uppercase tracking-wide block mb-2">
                  Maks. minimitalletus: {maxMinDeposit}€
                </label>
                <input
                  type="range" min={0} max={50} step={5} value={maxMinDeposit}
                  onChange={(e) => setMaxMinDeposit(Number(e.target.value))}
                  className="w-full accent-[#2D1783]"
                />
                <div className="flex justify-between text-[9px] text-[#787585] mt-0.5">
                  <span>0€</span><span>50€</span>
                </div>
              </div>
              <button
                onClick={() => { setMaxWagering(50); setMaxMinDeposit(50); setActiveTab("all") }}
                className="w-full text-[#2D1783] border border-[#2D1783]/30 text-xs font-semibold py-2 rounded-xl hover:bg-[#2D1783]/5 transition-colors"
              >
                Tyhjennä suodattimet
              </button>
            </div>
          </aside>

          {/* Bonus cards */}
          <div className="flex-1 space-y-3">
            <p className="text-xs text-[#787585] font-medium">{filtered.length} bonusta löydetty</p>
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E8F0] p-10 text-center">
                <span className="material-symbols-outlined text-[#E5E8F0] text-5xl block mb-3">search_off</span>
                <p className="text-[#787585] font-medium">Ei bonuksia suodatusehdoilla</p>
              </div>
            )}
            {filtered.map((bonus) => {
              const casino = CASINOS.find(c => c.id === bonus.casino_id)
              return (
                <article
                  key={bonus.id}
                  className="bg-white rounded-2xl border border-[#E5E8F0] hover:border-[#2D1783]/30 hover:shadow-md transition-all overflow-hidden"
                  aria-label={bonus.title}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Left: casino identity */}
                    <div className="flex items-center gap-3 p-4 sm:w-48 sm:flex-shrink-0 sm:border-r sm:border-[#E5E8F0]">
                      <div className="w-12 h-12 bg-[#F0EDEE] rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#2D1783] text-2xl" aria-hidden="true">casino</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#1b1b1c]">{bonus.casino_name}</p>
                        <Link
                          href={`/${lang}/nettikasinot/${bonus.casino_slug}`}
                          className="text-[10px] text-[#2D1783] hover:underline"
                        >
                          Lue arvostelu
                        </Link>
                      </div>
                    </div>

                    {/* Middle: bonus info */}
                    <div className="flex-1 p-4">
                      <p className="font-display font-bold text-[#2D1783] text-base leading-snug">{bonus.amount}</p>
                      <p className="text-sm text-[#1b1b1c] font-semibold mt-0.5">{bonus.title}</p>
                      <p className="text-xs text-[#787585] mt-1 leading-relaxed">{bonus.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <WageringBadge wagering={bonus.wagering} />
                        {(bonus.min_deposit ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 bg-[#F8F9FD] border border-[#E5E8F0] text-[#474554] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[11px]" aria-hidden="true">payments</span>
                            Min. {bonus.min_deposit}€
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: CTA */}
                    <div className="flex flex-col justify-center items-center gap-2 p-4 sm:w-36 sm:flex-shrink-0 bg-[#F8F9FD] sm:bg-transparent">
                      <a
                        href={`/${lang}/mene/${casino?.mene_slug ?? bonus.casino_slug}`}
                        rel="nofollow sponsored noopener noreferrer"
                        target="_blank"
                        className="w-full bg-[#2D1783] text-white font-bold text-xs py-3 rounded-xl text-center hover:bg-[#3e2db2] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        Lunasta bonus
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">arrow_forward</span>
                      </a>
                      <p className="text-[9px] text-[#787585] text-center">18+ | Pelaa vastuullisesti</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <div className="pb-16" />
    </div>
  )
}
