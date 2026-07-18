"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import type { Lang } from "@/lib/types"
import { TRANSLATIONS } from "@/lib/data"
import { SlotsbandLogo } from "@/components/slotsband-logo"

const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", uk: "🇬🇧", en: "🌐" }
const LANG_LABELS: Record<Lang, string> = { fi: "FI", uk: "UK", en: "EN" }

interface SiteHeaderProps {
  lang: Lang
  currentPath?: string
}

export function SiteHeader({ lang, currentPath }: SiteHeaderProps) {
  const t = TRANSLATIONS[lang]
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  const basePath = `/${lang}`

  const navLinks = [
    { label: t.nav.casinos, href: `${basePath}/nettikasinot` },
    { label: t.nav.bonuses, href: `${basePath}/kasinobonukset` },
    { label: t.nav.games, href: `${basePath}/kasinopelit` },
    { label: t.nav.raffles, href: `${basePath}/rafflet` },
  ]

  const getLangPath = (targetLang: Lang) => {
    if (!currentPath) return `/${targetLang}`
    return currentPath.replace(/^\/(fi|uk|en)/, `/${targetLang}`)
  }

  // Close lang dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-[#2D1783] shadow-lg">
      {/* ── Row 1: Logo / Nav / Lang / Hamburger ── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 h-14 flex items-center justify-between gap-3">
        {/* Logo — yellow on dark, no wrapper needed */}
        <Link href={`/${lang}`} className="flex-shrink-0 flex items-center" aria-label="SlotsBand – etusivu">
          <SlotsbandLogo variant="light" height={28} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex gap-5 items-center flex-1 ml-4" aria-label="Päänavigaatio">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search */}
        <div className="relative hidden lg:block group">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors text-[20px]"
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="search"
            placeholder={t.search}
            aria-label={t.search}
            className="bg-white/10 border border-white/20 focus:border-white/60 focus:bg-white/15 rounded-xl pl-9 pr-4 py-2 w-[200px] focus:w-[260px] transition-all duration-300 text-sm text-white placeholder:text-white/50 outline-none"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Vaihda kieli"
              className="flex items-center gap-1 bg-white/10 border border-white/20 hover:bg-white/20 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
            >
              <span aria-hidden="true">{LANG_FLAGS[lang]}</span>
              <span>{LANG_LABELS[lang]}</span>
              <span className="material-symbols-outlined text-[14px] text-white/70" aria-hidden="true">expand_more</span>
            </button>
            {langOpen && (
              <ul
                role="listbox"
                aria-label="Valitse kieli"
                className="absolute right-0 top-full mt-1 bg-white border border-[#E5E8F0] rounded-xl shadow-xl py-1 min-w-[100px] z-50"
              >
                {(["fi", "uk", "en"] as Lang[]).map((l) => (
                  <li key={l} role="option" aria-selected={l === lang}>
                    <Link
                      href={getLangPath(l)}
                      onClick={() => setLangOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#F8F9FD] transition-colors ${l === lang ? "text-[#2D1783] font-bold" : "text-[#474554]"}`}
                    >
                      <span aria-hidden="true">{LANG_FLAGS[l]}</span>
                      <span>{LANG_LABELS[l]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Desktop CTA — yellow on purple for max contrast */}
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

      {/* ── Row 2: Always-visible search bar on mobile ── */}
      <div className="lg:hidden border-t border-white/15 px-4 py-2.5">
        <div className="relative">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-[20px]"
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="search"
            placeholder={t.search}
            aria-label={t.search}
            className="w-full bg-white/10 border border-white/20 focus:border-white/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/50 outline-none"
          />
        </div>
      </div>

      {/* ── Mobile drawer menu ── */}
      {mobileOpen && (
        <nav
          className="lg:hidden border-t border-white/15"
          aria-label="Mobiilinavigaatio"
        >
          <ul className="px-4 py-3 space-y-0.5">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-3 text-sm font-semibold text-white/80 hover:text-white transition-colors border-b border-white/10 last:border-0"
                >
                  {item.label}
                  <span className="material-symbols-outlined text-[18px] text-white/30" aria-hidden="true">chevron_right</span>
                </Link>
              </li>
            ))}
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
