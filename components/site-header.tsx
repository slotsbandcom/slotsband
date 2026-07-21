"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import type { Lang } from "@/lib/types"
import { TRANSLATIONS } from "@/lib/data"
import { SlotsbandLogo } from "@/components/slotsband-logo"
import { StreamDot } from "@/components/stream-status-badge"

const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", uk: "🇬🇧", en: "🌐" }
const LANG_LABELS: Record<Lang, string> = { fi: "FI", uk: "UK", en: "EN" }

interface Suggestion {
  name: string
  slug: string
  rating: number
  logo_url?: string | null
}

interface SiteHeaderProps {
  lang: Lang
  currentPath?: string
}

function SuggestionsDropdown({ sugs, query, lang, onSelect, onViewAll }: {
  sugs: Suggestion[]
  query: string
  lang: Lang
  onSelect: (slug: string) => void
  onViewAll: () => void
}) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-[#E5E8F0] overflow-hidden z-[200]">
      {sugs.map(s => (
        <button
          key={s.slug}
          onMouseDown={e => { e.preventDefault(); onSelect(s.slug) }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#F8F9FD] text-left transition-colors border-b border-[#F0EDEE] last:border-0"
        >
          <div className="w-8 h-8 bg-[#F0EDEE] rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
            {s.logo_url
              ? <Image src={s.logo_url} alt="" width={32} height={32} className="w-full h-full object-contain" />
              : <span className="text-xs font-bold text-[#2D1783]">{s.name[0]}</span>}
          </div>
          <span className="flex-1 text-sm font-semibold text-[#1b1b1c] truncate">{s.name}</span>
          <span className="text-xs font-bold text-[#2D1783] flex-shrink-0">{s.rating.toFixed(1)}</span>
        </button>
      ))}
      <button
        onMouseDown={e => { e.preventDefault(); onViewAll() }}
        className="w-full px-3 py-2.5 text-xs font-semibold text-[#2D1783] hover:bg-[#F8F9FD] text-left border-t border-[#E5E8F0] transition-colors flex items-center justify-between"
      >
        <span>{lang === "fi" ? `Kaikki tulokset: "${query}"` : `All results: "${query}"`}</span>
        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">arrow_forward</span>
      </button>
    </div>
  )
}

export function SiteHeader({ lang, currentPath }: SiteHeaderProps) {
  const t = TRANSLATIONS[lang]
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const langRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  // Search
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSugs, setShowSugs] = useState(false)
  const [activeFocus, setActiveFocus] = useState<"desktop" | "mobile" | null>(null)
  const sugTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const searchSlug = lang === "fi" ? "haku" : "search"

  useEffect(() => { setMounted(true) }, [])

  const handleSearch = useCallback((q = query) => {
    const term = q.trim()
    if (!term) return
    setShowSugs(false)
    setActiveFocus(null)
    router.push(`/${lang}/${searchSlug}?q=${encodeURIComponent(term)}`)
  }, [query, lang, searchSlug, router])

  useEffect(() => {
    clearTimeout(sugTimer.current)
    if (query.trim().length < 3) { setSuggestions([]); setShowSugs(false); return }
    sugTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`)
        const json = await res.json() as { results?: Suggestion[] }
        const results = json.results ?? []
        setSuggestions(results)
        setShowSugs(results.length > 0)
      } catch { /* ignore network errors */ }
    }, 300)
    return () => clearTimeout(sugTimer.current)
  }, [query])

  const basePath = `/${lang}`
  const navLinks = [
    { label: t.nav.casinos, href: `${basePath}/nettikasinot` },
    { label: t.nav.bonuses, href: `${basePath}/kasinobonukset` },
    { label: t.nav.games, href: `${basePath}/kasinopelit` },
    { label: t.nav.raffles, href: `${basePath}/rafflet` },
    { label: t.nav.bonushunt, href: `${basePath}/bonushunt` },
  ]

  const getLangPath = (targetLang: Lang) => {
    if (!currentPath) return `/${targetLang}`
    return currentPath.replace(/^\/(fi|uk|en)/, `/${targetLang}`)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const sharedInputProps = {
    type: "search" as const,
    value: query,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") { e.preventDefault(); handleSearch() }
      if (e.key === "Escape") { setShowSugs(false); setActiveFocus(null) }
    },
    onBlur: () => { setTimeout(() => { setShowSugs(false); setActiveFocus(null) }, 150) },
    placeholder: t.search,
    "aria-label": t.search,
    autoComplete: "off",
  }

  return (
    <header className="sticky top-0 z-50 bg-[#2D1783] shadow-lg">
      {/* ── Row 1: Logo / Nav / Search / Lang / Hamburger ── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 h-14 flex items-center justify-between gap-3">
        <Link href={`/${lang}`} className="flex-shrink-0 flex items-center" aria-label="SlotsBand – etusivu">
          <SlotsbandLogo variant="light" height={28} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex gap-5 items-center flex-1 ml-4" aria-label="Päänavigaatio">
          {navLinks.map((item) => {
            const isBonushunt = item.href.endsWith("/bonushunt")
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors whitespace-nowrap"
              >
                {item.label}
                {isBonushunt && <StreamDot />}
              </Link>
            )
          })}
        </nav>

        {/* Desktop search */}
        <div className="relative hidden lg:block group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors text-[20px]" aria-hidden="true">
            search
          </span>
          <input
            {...sharedInputProps}
            onFocus={() => { setActiveFocus("desktop"); if (suggestions.length > 0) setShowSugs(true) }}
            className="bg-white/10 border border-white/20 focus:border-white/60 focus:bg-white/15 rounded-xl pl-9 pr-4 py-2 w-[200px] focus:w-[260px] transition-all duration-300 text-sm text-white placeholder:text-white/50 outline-none"
          />
          {showSugs && activeFocus === "desktop" && suggestions.length > 0 && (
            <SuggestionsDropdown
              sugs={suggestions}
              query={query}
              lang={lang}
              onSelect={slug => { router.push(`/${lang}/nettikasinot/${slug}`); setQuery(""); setShowSugs(false) }}
              onViewAll={() => handleSearch()}
            />
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => {
                if (!langOpen && langRef.current) {
                  const rect = langRef.current.getBoundingClientRect()
                  setDropdownPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
                }
                setLangOpen(!langOpen)
              }}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Vaihda kieli"
              className="flex items-center gap-1 bg-white/10 border border-white/20 hover:bg-white/20 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
            >
              <span aria-hidden="true">{LANG_FLAGS[lang]}</span>
              <span>{LANG_LABELS[lang]}</span>
              <span className="material-symbols-outlined text-[14px] text-white/70" aria-hidden="true">expand_more</span>
            </button>
            {langOpen && mounted && createPortal(
              <ul
                role="listbox"
                aria-label="Valitse kieli"
                style={{ top: dropdownPos.top, right: dropdownPos.right }}
                className="fixed bg-white border border-[#E5E8F0] rounded-xl shadow-2xl py-1 min-w-[110px] z-[9999]"
              >
                {(["fi", "uk", "en"] as Lang[]).map((l) => (
                  <li key={l} role="option" aria-selected={l === lang}>
                    <Link
                      href={getLangPath(l)}
                      onClick={() => setLangOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-[#F8F9FD] transition-colors ${l === lang ? "text-[#2D1783] font-bold" : "text-[#474554]"}`}
                    >
                      <span aria-hidden="true">{LANG_FLAGS[l]}</span>
                      <span>{LANG_LABELS[l]}</span>
                    </Link>
                  </li>
                ))}
              </ul>,
              document.body
            )}
          </div>

          <Link
            href={`/${lang}/nettikasinot`}
            className="hidden sm:inline-flex items-center bg-[#FFD700] text-[#2D1783] font-bold text-xs px-4 py-2 rounded-full hover:bg-[#ffe033] active:scale-95 transition-all whitespace-nowrap"
          >
            {t.hero.cta}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 text-white -mr-1"
            aria-label={mobileOpen ? "Sulje valikko" : "Avaa valikko"}
            aria-expanded={mobileOpen}
          >
            <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Row 2: Mobile search bar ── */}
      <div className="lg:hidden border-t border-white/15 px-4 py-2.5">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-[20px]" aria-hidden="true">
            search
          </span>
          <input
            {...sharedInputProps}
            onFocus={() => { setActiveFocus("mobile"); if (suggestions.length > 0) setShowSugs(true) }}
            className="w-full bg-white/10 border border-white/20 focus:border-white/60 rounded-xl pl-9 pr-12 py-2.5 text-sm text-white placeholder:text-white/50 outline-none"
          />
          {/* Submit button for mobile keyboard */}
          <button
            type="button"
            onClick={() => handleSearch()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-white transition-colors"
            aria-label={lang === "fi" ? "Hae" : "Search"}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
          </button>
          {showSugs && activeFocus === "mobile" && suggestions.length > 0 && (
            <SuggestionsDropdown
              sugs={suggestions}
              query={query}
              lang={lang}
              onSelect={slug => { router.push(`/${lang}/nettikasinot/${slug}`); setQuery(""); setShowSugs(false) }}
              onViewAll={() => handleSearch()}
            />
          )}
        </div>
      </div>

      {/* ── Mobile drawer menu ── */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-white/15" aria-label="Mobiilinavigaatio">
          <ul className="px-4 py-3 space-y-0.5">
            {navLinks.map((item) => {
              const isBonushunt = item.href.endsWith("/bonushunt")
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-3 text-sm font-semibold text-white/80 hover:text-white transition-colors border-b border-white/10 last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      {item.label}
                      {isBonushunt && <StreamDot />}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-white/30" aria-hidden="true">chevron_right</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="px-4 pb-4 pt-1">
            <Link
              href={`/${lang}/nettikasinot`}
              onClick={() => setMobileOpen(false)}
              className="block w-full bg-[#FFD700] text-[#2D1783] font-bold text-sm py-3.5 rounded-xl text-center hover:bg-[#ffe033] active:scale-95 transition-all"
            >
              {t.hero.cta}
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
