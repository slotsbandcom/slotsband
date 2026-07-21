"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { useRouter, usePathname } from "next/navigation"
import type { Lang } from "@/lib/types"
import { TRANSLATIONS } from "@/lib/data"
import { SlotsbandLogo } from "@/components/slotsband-logo"
import { StreamDot } from "@/components/stream-status-badge"

const LANG_INFO: Record<Lang, { flag: string; code: string; name: string }> = {
  fi: { flag: "🇫🇮", code: "FI",  name: "Suomi" },
  uk: { flag: "🇬🇧", code: "UK",  name: "English UK" },
  en: { flag: "🌍",  code: "EN",  name: "International" },
}

function saveLangPref(lang: Lang) {
  try {
    localStorage.setItem("slotsband-lang", lang)
    document.cookie = `slotsband-lang=${lang};path=/;max-age=31536000;samesite=lax`
  } catch {}
}

interface Suggestion {
  name: string
  slug: string
  rating: number
  logo_url?: string | null
}

interface SiteHeaderProps {
  lang: Lang
}

// Rendered via portal into document.body so z-index is never clipped by a parent stacking context.
function SuggestionsDropdown({ sugs, query, lang, activeIdx, onSelect, onViewAll }: {
  sugs: Suggestion[]
  query: string
  lang: Lang
  activeIdx: number
  onSelect: (slug: string) => void
  onViewAll: () => void
}) {
  return (
    <div
      className="bg-white rounded-xl border border-[#E5E8F0] overflow-hidden"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}
    >
      <div className="max-h-[320px] overflow-y-auto">
        {sugs.map((s, i) => {
          const isActive = i === activeIdx
          return (
            <button
              key={s.slug}
              onMouseDown={e => { e.preventDefault(); onSelect(s.slug) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors border-b border-[#F0EDEE] last:border-0"
              style={{
                background: isActive ? "#2D1783" : undefined,
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#F3F0FA" }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "" }}
            >
              <div className="w-8 h-8 bg-[#F0EDEE] rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                {s.logo_url
                  ? <Image src={s.logo_url} alt="" width={32} height={32} className="w-full h-full object-contain" />
                  : <span className={`text-xs font-bold ${isActive ? "text-white" : "text-[#2D1783]"}`}>{s.name[0]}</span>}
              </div>
              <span className={`flex-1 text-sm font-semibold truncate ${isActive ? "text-white" : "text-[#1b1b1c]"}`}>
                {s.name}
              </span>
              <span className={`text-xs font-bold flex-shrink-0 ${isActive ? "text-white/80" : "text-[#2D1783]"}`}>
                ⭐ {s.rating.toFixed(1)}
              </span>
            </button>
          )
        })}
      </div>
      <button
        onMouseDown={e => { e.preventDefault(); onViewAll() }}
        className="w-full px-3 py-2.5 text-xs font-semibold text-[#2D1783] text-left border-t border-[#E5E8F0] flex items-center justify-between hover:bg-[#F3F0FA] transition-colors"
      >
        <span>{lang === "fi" ? `Kaikki tulokset: "${query}"` : `All results: "${query}"`}</span>
        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">arrow_forward</span>
      </button>
    </div>
  )
}

export function SiteHeader({ lang }: SiteHeaderProps) {
  const t = TRANSLATIONS[lang]
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [langPos, setLangPos] = useState({ top: 0, right: 0 })
  const langRef = useRef<HTMLDivElement>(null)
  const langDropdownRef = useRef<HTMLUListElement>(null)
  const [mounted, setMounted] = useState(false)

  // Search state
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSugs, setShowSugs] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [activeFocus, setActiveFocus] = useState<"desktop" | "mobile" | null>(null)
  const [sugPos, setSugPos] = useState({ top: 0, left: 0, width: 0 })

  // Refs to anchor the portal dropdown
  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const sugTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const searchSlug = lang === "fi" ? "haku" : "search"

  useEffect(() => { setMounted(true) }, [])

  // Reposition portal whenever dropdown shows or window scrolls/resizes
  useEffect(() => {
    if (!showSugs || !activeFocus) return
    const ref = activeFocus === "desktop" ? desktopSearchRef : mobileSearchRef

    const reposition = () => {
      if (!ref.current) return
      const r = ref.current.getBoundingClientRect()
      setSugPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }

    reposition()
    window.addEventListener("scroll", reposition, { passive: true })
    window.addEventListener("resize", reposition, { passive: true })
    return () => {
      window.removeEventListener("scroll", reposition)
      window.removeEventListener("resize", reposition)
    }
  }, [showSugs, activeFocus])

  // Reset keyboard selection when suggestions change
  useEffect(() => { setActiveIdx(-1) }, [suggestions])

  const closeSugs = useCallback(() => {
    setShowSugs(false)
    setActiveFocus(null)
    setActiveIdx(-1)
  }, [])

  const handleSearch = useCallback((q = query) => {
    const term = q.trim()
    if (!term) return
    closeSugs()
    router.push(`/${lang}/${searchSlug}?q=${encodeURIComponent(term)}`)
  }, [query, lang, searchSlug, router, closeSugs])

  // Debounced suggestion fetching
  useEffect(() => {
    clearTimeout(sugTimer.current)
    if (query.trim().length < 3) { setSuggestions([]); setShowSugs(false); return }
    sugTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`)
        const json = await res.json() as { results?: Suggestion[] }
        const results = json.results ?? []
        setSuggestions(results)
        if (results.length > 0 && activeFocus) setShowSugs(true)
      } catch { /* ignore */ }
    }, 300)
    return () => clearTimeout(sugTimer.current)
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  const basePath = `/${lang}`
  const navLinks = [
    { label: t.nav.casinos, href: `${basePath}/nettikasinot` },
    { label: t.nav.bonuses, href: `${basePath}/kasinobonukset` },
    { label: t.nav.games, href: `${basePath}/kasinopelit` },
    { label: t.nav.raffles, href: `${basePath}/rafflet` },
    { label: t.nav.bonushunt, href: `${basePath}/bonushunt` },
  ]

  // Replace the /[lang] prefix in the current URL to switch languages.
  const getLangPath = (targetLang: Lang) => {
    if (!pathname || !/^\/(fi|uk|en)/.test(pathname)) return `/${targetLang}`
    return pathname.replace(/^\/(fi|uk|en)/, `/${targetLang}`)
  }

  // Use "click" (not "mousedown") so portal items aren't unmounted before their click fires.
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        langRef.current && !langRef.current.contains(target) &&
        langDropdownRef.current && !langDropdownRef.current.contains(target)
      ) {
        setLangOpen(false)
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setLangOpen(false)
    }
    document.addEventListener("click", onOutside)
    document.addEventListener("keydown", onEscape)
    return () => {
      document.removeEventListener("click", onOutside)
      document.removeEventListener("keydown", onEscape)
    }
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIdx >= 0 && activeIdx < suggestions.length) {
        const s = suggestions[activeIdx]
        router.push(`/${lang}/nettikasinot/${s.slug}`)
        setQuery(""); closeSugs()
      } else {
        handleSearch()
      }
    } else if (e.key === "Escape") {
      closeSugs()
    }
  }

  const sharedInputProps = {
    type: "search" as const,
    value: query,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    onKeyDown,
    // blur with delay lets onMouseDown in the portal fire first
    onBlur: () => setTimeout(closeSugs, 150),
    placeholder: t.search,
    "aria-label": t.search,
    autoComplete: "off",
    role: "combobox" as const,
    "aria-expanded": showSugs,
    "aria-autocomplete": "list" as const,
  }

  const handleSelectSuggestion = (slug: string) => {
    router.push(`/${lang}/nettikasinot/${slug}`)
    setQuery("")
    closeSugs()
  }

  return (
    <header className="sticky top-0 bg-[#2D1783] shadow-lg" style={{ zIndex: 1000 }}>
      {/* ── Row 1 ── */}
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

        {/* Desktop search — ref'd so portal knows where to anchor */}
        <div ref={desktopSearchRef} className="relative hidden lg:block group" style={{ zIndex: 1001 }}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors text-[20px]" aria-hidden="true">
            search
          </span>
          <input
            {...sharedInputProps}
            onFocus={() => {
              setActiveFocus("desktop")
              if (suggestions.length > 0) setShowSugs(true)
            }}
            className="bg-white/10 border border-white/20 focus:border-white/60 focus:bg-white/15 rounded-xl pl-9 pr-4 py-2 w-[200px] focus:w-[260px] transition-all duration-300 text-sm text-white placeholder:text-white/50 outline-none"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => {
                if (!langOpen && langRef.current) {
                  const r = langRef.current.getBoundingClientRect()
                  setLangPos({ top: r.bottom + 6, right: window.innerWidth - r.right })
                }
                setLangOpen(v => !v)
              }}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Vaihda kieli"
              className="flex items-center gap-1.5 bg-white/10 border border-white/30 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
            >
              <span aria-hidden="true">{LANG_INFO[lang].flag}</span>
              <span>{LANG_INFO[lang].code}</span>
              <span
                className="material-symbols-outlined text-[14px] text-white/70 transition-transform duration-200"
                style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                aria-hidden="true"
              >
                expand_more
              </span>
            </button>
            {langOpen && mounted && createPortal(
              <>
                <style>{`
                  @keyframes lang-in {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0);    }
                  }
                  .lang-dropdown { animation: lang-in 0.15s ease both; }
                `}</style>
                <ul
                  ref={langDropdownRef}
                  role="listbox"
                  aria-label="Valitse kieli"
                  className="lang-dropdown bg-white rounded-xl border border-[#E5E7EB] p-1.5 min-w-[180px]"
                  style={{
                    position: "fixed",
                    top: langPos.top,
                    right: langPos.right,
                    zIndex: 9999,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  {(["fi", "uk", "en"] as Lang[]).map((l) => {
                    const info = LANG_INFO[l]
                    const isActive = l === lang
                    return (
                      <li key={l} role="option" aria-selected={isActive}>
                        <Link
                          href={getLangPath(l)}
                          onClick={() => { saveLangPref(l); setTimeout(() => setLangOpen(false), 200) }}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-[#2D1783] text-white font-bold"
                              : "text-[#222222] hover:bg-[#F3F0FA]"
                          }`}
                        >
                          <span className="text-[20px] leading-none" aria-hidden="true">{info.flag}</span>
                          <span className="flex-1">{info.name}</span>
                          <span className={`text-xs ${isActive ? "text-white/70 font-bold" : "text-[#6B7280]"}`}>
                            {info.code}
                          </span>
                          {isActive && <span className="text-white text-xs ml-1" aria-hidden="true">✓</span>}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </>,
              document.body
            )}
          </div>

          <Link
            href={`/${lang}/nettikasinot`}
            className="hidden sm:inline-flex items-center bg-[#FFD700] text-[#2D1783] font-bold text-xs px-4 py-2 rounded-full hover:bg-[#ffe033] active:scale-95 transition-all whitespace-nowrap"
          >
            {t.hero.cta}
          </Link>

          <button
            onClick={() => setMobileOpen(v => !v)}
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

      {/* ── Row 2: Mobile search ── */}
      <div className="lg:hidden border-t border-white/15 px-4 py-2.5">
        <div ref={mobileSearchRef} className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-[20px]" aria-hidden="true">
            search
          </span>
          <input
            {...sharedInputProps}
            onFocus={() => {
              setActiveFocus("mobile")
              if (suggestions.length > 0) setShowSugs(true)
            }}
            className="w-full bg-white/10 border border-white/20 focus:border-white/60 rounded-xl pl-9 pr-12 py-2.5 text-sm text-white placeholder:text-white/50 outline-none"
          />
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleSearch() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-white transition-colors"
            aria-label={lang === "fi" ? "Hae" : "Search"}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
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

      {/* ── Suggestions portal — rendered in document.body, always above everything ── */}
      {showSugs && mounted && suggestions.length > 0 && createPortal(
        <div
          style={{
            position: "fixed",
            top: sugPos.top,
            left: sugPos.left,
            width: sugPos.width,
            zIndex: 9999,
          }}
        >
          <SuggestionsDropdown
            sugs={suggestions}
            query={query}
            lang={lang}
            activeIdx={activeIdx}
            onSelect={handleSelectSuggestion}
            onViewAll={() => handleSearch()}
          />
        </div>,
        document.body
      )}
    </header>
  )
}
