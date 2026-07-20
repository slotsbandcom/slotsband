"use client"

import { useState, use } from "react"
import Link from "next/link"
import type { Lang } from "@/lib/types"
import { TRANSLATIONS, FILTER_OPTIONS } from "@/lib/data"
import type { Casino } from "@/lib/types"
import { CasinoCard } from "@/components/casino-card"

const VALID_LANGS: Lang[] = ["fi", "uk", "en"]

const PAGE_LABELS: Record<Lang, { title: string; subtitle: string; filterTitle: string; allCasinos: string; results: string; sortBy: string; clearFilters: string; noResults: string }> = {
  fi: {
    title: "Kaikki Nettikasinot 2026",
    subtitle: "Vertaile kasinoita, bonuksia ja ominaisuuksia. Löydä sinulle sopivin kasino.",
    filterTitle: "Suodattimet",
    allCasinos: "Kaikki kasinot",
    results: "kasinoa löytyi",
    sortBy: "Järjestä:",
    clearFilters: "Tyhjennä suodattimet",
    noResults: "Ei kasinoita valituilla suodattimilla.",
  },
  en: {
    title: "All Online Casinos 2026",
    subtitle: "Compare casinos, bonuses and features. Find the right casino for you.",
    filterTitle: "Filters",
    allCasinos: "All casinos",
    results: "casinos found",
    sortBy: "Sort by:",
    clearFilters: "Clear filters",
    noResults: "No casinos match your filters.",
  },
  uk: {
    title: "All UK Online Casinos 2026",
    subtitle: "Compare casinos, bonuses and features. Find the best UK casino for you.",
    filterTitle: "Filters",
    allCasinos: "All casinos",
    results: "casinos found",
    sortBy: "Sort by:",
    clearFilters: "Clear filters",
    noResults: "No casinos match your filters.",
  },
}

type SortKey = "rank" | "rating" | "min_deposit" | "withdrawal"

interface ListingPageProps {
  params: Promise<{ lang: string }>
}

export default function NettikasinotPage({ params, casinos = [] }: ListingPageProps & { casinos?: Casino[] }) {
  const { lang: rawLang } = use(params)
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "fi") as Lang
  const labels = PAGE_LABELS[lang]

  const [sortBy, setSortBy] = useState<SortKey>("rank")
  const [filterLicense, setFilterLicense] = useState<string[]>([])
  const [filterPayment, setFilterPayment] = useState<string[]>([])
  const [filterPika, setFilterPika] = useState(false)
  const [filterNew, setFilterNew] = useState(false)
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const toggleFilter = (arr: string[], setArr: (a: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
  }

  let filtered = casinos.filter((c) => c.is_active)
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

  const activeFilterCount =
    filterLicense.length + filterPayment.length + (filterPika ? 1 : 0) + (filterNew ? 1 : 0) + (filterFeatured ? 1 : 0)
  const hasFilters = activeFilterCount > 0

  const clearAllFilters = () => {
    setFilterLicense([])
    setFilterPayment([])
    setFilterPika(false)
    setFilterNew(false)
    setFilterFeatured(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Page hero — compact on mobile */}
      <div className="bg-white border-b border-[#E5E8F0] py-6 md:py-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#787585] mb-3">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">
              {lang === "fi" ? "Etusivu" : "Home"}
            </Link>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">chevron_right</span>
            <span className="text-[#2D1783] font-semibold">{lang === "fi" ? "Nettikasinot" : "Casinos"}</span>
          </nav>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-[#1b1b1c] mb-1.5 text-balance">{labels.title}</h1>
          <p className="text-sm md:text-base text-[#787585] leading-relaxed">{labels.subtitle}</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-5 md:py-8">

        {/* ── Mobile toolbar: filter toggle + sort in one row ── */}
        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
              hasFilters
                ? "bg-[#2D1783] text-white border-[#2D1783]"
                : "bg-white text-[#474554] border-[#E5E8F0] hover:border-[#2D1783]"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">tune</span>
            {labels.filterTitle}
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-white text-[#2D1783] text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort — fills remaining space */}
          <div className="flex-1 flex items-center gap-2 bg-white border border-[#E5E8F0] rounded-xl px-3 py-2">
            <span className="material-symbols-outlined text-[#787585] text-[16px]" aria-hidden="true">sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="flex-1 bg-transparent text-sm text-[#474554] outline-none"
              aria-label={labels.sortBy}
            >
              <option value="rank">{lang === "fi" ? "Suosituimmat" : "Most Popular"}</option>
              <option value="rating">{lang === "fi" ? "Paras arvosana" : "Best Rating"}</option>
              <option value="min_deposit">{lang === "fi" ? "Pienin talletus" : "Min Deposit"}</option>
              <option value="withdrawal">{lang === "fi" ? "Nopein kotiutus" : "Fastest Withdrawal"}</option>
            </select>
          </div>

          {/* Result count */}
          <span className="text-xs text-[#787585] whitespace-nowrap">
            <strong className="text-[#1b1b1c]">{sorted.length}</strong> {lang === "fi" ? "kpl" : "found"}
          </span>
        </div>

        {/* ── Mobile filter drawer ── */}
        {showFilters && (
          <div id="filter-panel" className="lg:hidden mb-4 bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="p-4 space-y-5">
              {/* Quick toggles */}
              <div className="space-y-3">
                {[
                  { label: lang === "fi" ? "Pikakasinot" : "Quick Casinos", value: filterPika, setter: setFilterPika },
                  { label: lang === "fi" ? "Uudet kasinot" : "New Casinos", value: filterNew, setter: setFilterNew },
                  { label: lang === "fi" ? "Suositeltu" : "Featured", value: filterFeatured, setter: setFilterFeatured },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => item.setter(!item.value)}
                  >
                    <span className="text-sm text-[#474554] font-medium">{item.label}</span>
                    <button
                      role="switch"
                      aria-checked={item.value}
                      onClick={(e) => { e.stopPropagation(); item.setter(!item.value) }}
                      className={`w-10 h-6 rounded-full relative transition-colors ${item.value ? "bg-[#2D1783]" : "bg-[#E5E8F0]"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.value ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* License + Payment in 2-col grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-[#1b1b1c] uppercase tracking-wider mb-2">
                    {lang === "fi" ? "Lisenssi" : "License"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_OPTIONS.licenses.map((lic) => (
                      <button
                        key={lic}
                        onClick={() => toggleFilter(filterLicense, setFilterLicense, lic)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          filterLicense.includes(lic)
                            ? "bg-[#2D1783] text-white border-[#2D1783]"
                            : "bg-[#F8F9FD] text-[#474554] border-[#E5E8F0] hover:border-[#2D1783]"
                        }`}
                      >
                        {lic}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#1b1b1c] uppercase tracking-wider mb-2">
                    {lang === "fi" ? "Maksutapa" : "Payment"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_OPTIONS.payment_methods.map((pm) => (
                      <button
                        key={pm}
                        onClick={() => toggleFilter(filterPayment, setFilterPayment, pm)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          filterPayment.includes(pm)
                            ? "bg-[#2D1783] text-white border-[#2D1783]"
                            : "bg-[#F8F9FD] text-[#474554] border-[#E5E8F0] hover:border-[#2D1783]"
                        }`}
                      >
                        {pm}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full text-sm text-[#787585] border border-[#E5E8F0] rounded-xl py-2.5 hover:text-[#2D1783] hover:border-[#2D1783] transition-colors"
                >
                  {labels.clearFilters}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Desktop sidebar filters ── */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden sticky top-20">
              <div className="flex items-center gap-2 p-5 border-b border-[#E5E8F0] font-display font-bold text-[#1b1b1c]">
                <span className="material-symbols-outlined text-[#2D1783] text-[20px]" aria-hidden="true">tune</span>
                {labels.filterTitle}
                {hasFilters && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#2D1783] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="p-5 space-y-6">
                <div className="space-y-2.5">
                  {[
                    { label: lang === "fi" ? "Pikakasinot" : "Quick Casinos", value: filterPika, setter: setFilterPika },
                    { label: lang === "fi" ? "Uudet kasinot" : "New Casinos", value: filterNew, setter: setFilterNew },
                    { label: lang === "fi" ? "Suositeltu" : "Featured", value: filterFeatured, setter: setFilterFeatured },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => item.setter(!item.value)}
                    >
                      <button
                        role="switch"
                        aria-checked={item.value}
                        onClick={(e) => { e.stopPropagation(); item.setter(!item.value) }}
                        className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${item.value ? "bg-[#2D1783]" : "bg-[#E5E8F0]"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.value ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                      <span className="text-sm text-[#474554] font-medium group-hover:text-[#2D1783] transition-colors">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
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
                {hasFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full text-sm text-[#787585] border border-[#E5E8F0] rounded-xl py-2.5 hover:text-[#2D1783] hover:border-[#2D1783] transition-colors"
                  >
                    {labels.clearFilters}
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main listing ── */}
          <div className="flex-1 min-w-0">
            {/* Desktop toolbar */}
            <div className="hidden lg:flex items-center justify-between gap-3 mb-6">
              <p className="text-sm text-[#787585]">
                <span className="font-bold text-[#1b1b1c]">{sorted.length}</span> {labels.results}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#787585] whitespace-nowrap" htmlFor="desktop-sort">
                  {labels.sortBy}
                </label>
                <select
                  id="desktop-sort"
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

            {sorted.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E8F0] p-12 text-center">
                <span className="material-symbols-outlined text-[#E5E8F0] text-6xl block mb-3" aria-hidden="true">search_off</span>
                <p className="text-[#787585] font-semibold">{labels.noResults}</p>
                <button onClick={clearAllFilters} className="mt-4 text-sm text-[#2D1783] font-semibold underline">
                  {labels.clearFilters}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {sorted.map((casino) => (
                  <CasinoCard key={casino.id} casino={casino} lang={lang} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
