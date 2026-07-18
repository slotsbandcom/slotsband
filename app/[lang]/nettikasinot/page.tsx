"use client"

import { useState, use } from "react"
import Link from "next/link"
import type { Lang } from "@/lib/types"
import { CASINOS, TRANSLATIONS, FILTER_OPTIONS } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CasinoCard } from "@/components/casino-card"

const VALID_LANGS: Lang[] = ["fi", "uk", "en"]

const PAGE_LABELS: Record<Lang, { title: string; subtitle: string; filterTitle: string; allCasinos: string; results: string }> = {
  fi: {
    title: "Kaikki Nettikasinot 2026",
    subtitle: "Vertaile kasinoita, bonuksia ja ominaisuuksia. Löydä sinulle sopivin kasino.",
    filterTitle: "Suodattimet",
    allCasinos: "Kaikki kasinot",
    results: "kasinoa löytyi",
  },
  en: {
    title: "All Online Casinos 2026",
    subtitle: "Compare casinos, bonuses and features. Find the right casino for you.",
    filterTitle: "Filters",
    allCasinos: "All casinos",
    results: "casinos found",
  },
  uk: {
    title: "All UK Online Casinos 2026",
    subtitle: "Compare casinos, bonuses and features. Find the best UK casino for you.",
    filterTitle: "Filters",
    allCasinos: "All casinos",
    results: "casinos found",
  },
}

type SortKey = "rank" | "rating" | "min_deposit" | "withdrawal"

interface ListingPageProps {
  params: Promise<{ lang: string }>
}

export default function NettikasinotPage({ params }: ListingPageProps) {
  const { lang: rawLang } = use(params)
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "fi") as Lang
  const t = TRANSLATIONS[lang]
  const labels = PAGE_LABELS[lang]

  const [sortBy, setSortBy] = useState<SortKey>("rank")
  const [filterLicense, setFilterLicense] = useState<string[]>([])
  const [filterPayment, setFilterPayment] = useState<string[]>([])
  const [filterPika, setFilterPika] = useState(false)
  const [filterNew, setFilterNew] = useState(false)
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [compare, setCompare] = useState<string[]>([])

  const toggleFilter = (arr: string[], setArr: (a: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
  }

  const toggleCompare = (id: string) => {
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  let filtered = CASINOS.filter((c) => c.is_active)
  if (filterLicense.length > 0) filtered = filtered.filter((c) => filterLicense.includes(c.license_authority ?? ""))
  if (filterPayment.length > 0) filtered = filtered.filter((c) => filterPayment.some((p) => c.payment_methods.includes(p)))
  if (filterPika) filtered = filtered.filter((c) => c.is_pikakasino)
  if (filterNew) filtered = filtered.filter((c) => c.is_new)
  if (filterFeatured) filtered = filtered.filter((c) => c.is_featured)

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rank") return a.rank - b.rank
    if (sortBy === "rating") return b.rating - a.rating
    if (sortBy === "min_deposit") return (a.min_deposit ?? 99) - (b.min_deposit ?? 99)
    if (sortBy === "withdrawal") return (a.withdrawal_time_max_hours ?? 99) - (b.withdrawal_time_max_hours ?? 99)
    return 0
  })

  const hasFilters = filterLicense.length > 0 || filterPayment.length > 0 || filterPika || filterNew || filterFeatured

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <SiteHeader lang={lang} currentPath={`/${lang}/nettikasinot`} />

      {/* Page hero */}
      <div className="bg-white border-b border-[#E5E8F0] py-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <nav className="flex items-center gap-2 text-xs text-[#787585] mb-4">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">
              {lang === "fi" ? "Etusivu" : "Home"}
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#2D1783] font-semibold">{lang === "fi" ? "Nettikasinot" : "Casinos"}</span>
          </nav>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-[#1b1b1c] mb-2">{labels.title}</h1>
          <p className="text-[#787585]">{labels.subtitle}</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
              <div
                className="flex items-center justify-between p-5 border-b border-[#E5E8F0] cursor-pointer lg:cursor-default"
                onClick={() => setShowFilters(!showFilters)}
              >
                <div className="flex items-center gap-2 font-display font-bold text-[#1b1b1c]">
                  <span className="material-symbols-outlined text-[#2D1783] text-[20px]">tune</span>
                  {labels.filterTitle}
                  {hasFilters && (
                    <span className="w-5 h-5 rounded-full bg-[#2D1783] text-white text-[10px] font-bold flex items-center justify-center">
                      {filterLicense.length + filterPayment.length + (filterPika ? 1 : 0) + (filterNew ? 1 : 0) + (filterFeatured ? 1 : 0)}
                    </span>
                  )}
                </div>
                <span className={`material-symbols-outlined lg:hidden text-[#787585] transition-transform ${showFilters ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </div>

              <div className={`${showFilters ? "block" : "hidden lg:block"} p-5 space-y-6`}>
                {/* Quick toggles */}
                <div className="space-y-2.5">
                  {[
                    { label: lang === "fi" ? "Pikakasinot" : "Quick Casinos", value: filterPika, setter: setFilterPika },
                    { label: lang === "fi" ? "Uudet kasinot" : "New Casinos", value: filterNew, setter: setFilterNew },
                    { label: lang === "fi" ? "Suositeltu" : "Featured", value: filterFeatured, setter: setFilterFeatured },
                  ].map((item) => (
                    <label key={item.label} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-9 h-5 rounded-full relative transition-colors ${item.value ? "bg-[#2D1783]" : "bg-[#E5E8F0]"}`}
                        onClick={() => item.setter(!item.value)}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.value ? "translate-x-4" : "translate-x-0.5"}`}
                        />
                      </div>
                      <span className="text-sm text-[#474554] font-medium group-hover:text-[#2D1783] transition-colors">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* License filter */}
                <div>
                  <p className="text-xs font-bold text-[#1b1b1c] uppercase tracking-wider mb-3">
                    {lang === "fi" ? "Lisenssi" : "License"}
                  </p>
                  <div className="space-y-2">
                    {FILTER_OPTIONS.licenses.map((lic) => (
                      <label key={lic} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filterLicense.includes(lic)}
                          onChange={() => toggleFilter(filterLicense, setFilterLicense, lic)}
                          className="w-4 h-4 rounded border-[#E5E8F0] accent-[#2D1783]"
                        />
                        <span className="text-sm text-[#474554] group-hover:text-[#2D1783] transition-colors">{lic}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment filter */}
                <div>
                  <p className="text-xs font-bold text-[#1b1b1c] uppercase tracking-wider mb-3">
                    {lang === "fi" ? "Maksutapa" : "Payment Method"}
                  </p>
                  <div className="space-y-2">
                    {FILTER_OPTIONS.payment_methods.map((pm) => (
                      <label key={pm} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filterPayment.includes(pm)}
                          onChange={() => toggleFilter(filterPayment, setFilterPayment, pm)}
                          className="w-4 h-4 rounded border-[#E5E8F0] accent-[#2D1783]"
                        />
                        <span className="text-sm text-[#474554] group-hover:text-[#2D1783] transition-colors">{pm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear filters */}
                {hasFilters && (
                  <button
                    onClick={() => {
                      setFilterLicense([])
                      setFilterPayment([])
                      setFilterPika(false)
                      setFilterNew(false)
                      setFilterFeatured(false)
                    }}
                    className="w-full text-sm text-[#787585] border border-[#E5E8F0] rounded-xl py-2.5 hover:text-[#2D1783] hover:border-[#2D1783] transition-colors"
                  >
                    {lang === "fi" ? "Tyhjennä suodattimet" : "Clear filters"}
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main listing */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-sm text-[#787585]">
                <span className="font-bold text-[#1b1b1c]">{sorted.length}</span> {labels.results}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#787585] whitespace-nowrap">
                  {lang === "fi" ? "Järjestä:" : "Sort by:"}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="bg-white border border-[#E5E8F0] rounded-xl text-sm px-3 py-2 text-[#474554] focus:border-[#2D1783] outline-none"
                >
                  <option value="rank">{lang === "fi" ? "Suosituimmat" : "Most Popular"}</option>
                  <option value="rating">{lang === "fi" ? "Paras arvosana" : "Best Rating"}</option>
                  <option value="min_deposit">{lang === "fi" ? "Pienin talletus" : "Min Deposit"}</option>
                  <option value="withdrawal">{lang === "fi" ? "Nopein kotiutus" : "Fastest Withdrawal"}</option>
                </select>
              </div>
            </div>

            {/* Compare bar */}
            {compare.length > 0 && (
              <div className="mb-4 bg-[#2D1783] text-white rounded-2xl px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="material-symbols-outlined text-[#FFD700] text-[18px]">compare_arrows</span>
                  {lang === "fi" ? `Vertailussa ${compare.length}/3 kasinoa` : `Comparing ${compare.length}/3 casinos`}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCompare([])}
                    className="text-xs text-white/70 hover:text-white transition-colors"
                  >
                    {lang === "fi" ? "Tyhjennä" : "Clear"}
                  </button>
                  {compare.length >= 2 && (
                    <button className="bg-[#FFD700] text-[#1b1b1c] text-xs font-bold px-3 py-1 rounded-lg hover:bg-[#FFE866] transition-colors">
                      {lang === "fi" ? "Vertaile" : "Compare"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {sorted.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E8F0] p-12 text-center">
                <span className="material-symbols-outlined text-[#E5E8F0] text-6xl block mb-3">search_off</span>
                <p className="text-[#787585] font-semibold">
                  {lang === "fi" ? "Ei kasinoita valituilla suodattimilla." : "No casinos match your filters."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {sorted.map((casino, idx) => (
                  <div key={casino.id} className="relative">
                    {/* Compare checkbox */}
                    <button
                      onClick={() => toggleCompare(casino.id)}
                      className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                        compare.includes(casino.id)
                          ? "bg-[#2D1783] text-white border-[#2D1783]"
                          : "bg-white text-[#787585] border-[#E5E8F0] hover:border-[#2D1783] hover:text-[#2D1783]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
                      {lang === "fi" ? "Vertaile" : "Compare"}
                    </button>
                    <CasinoCard casino={casino} lang={lang} rank={idx + 1} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteFooter lang={lang} />
    </div>
  )
}
