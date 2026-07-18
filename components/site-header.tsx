"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import type { Lang } from "@/lib/types"
import { TRANSLATIONS } from "@/lib/data"

const LANG_FLAGS: Record<Lang, string> = {
  fi: "🇫🇮",
  uk: "🇬🇧",
  en: "🌐",
}

const LANG_LABELS: Record<Lang, string> = {
  fi: "FI",
  uk: "UK",
  en: "EN",
}

interface SiteHeaderProps {
  lang: Lang
  currentPath?: string
}

export function SiteHeader({ lang, currentPath }: SiteHeaderProps) {
  const t = TRANSLATIONS[lang]
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

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

  return (
    <nav className="h-[72px] w-full sticky top-0 z-50 bg-white border-b border-[#E5E8F0] shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 flex justify-between items-center h-full">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href={`/${lang}`} className="flex items-center flex-shrink-0">
            <Image
              src="/slotsband-logo.png"
              alt="SlotsBand"
              width={160}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <div className="hidden lg:flex gap-6 items-center">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-[#474554] hover:text-[#2D1783] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] group-focus-within:text-[#2D1783] transition-colors text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder={t.search}
              className="bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:ring-2 focus:ring-[#2D1783]/20 rounded-xl pl-9 pr-4 py-2 w-[220px] focus:w-[280px] transition-all duration-300 text-sm outline-none"
            />
          </div>

          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 bg-[#F8F9FD] border border-[#E5E8F0] px-3 py-2 rounded-xl text-sm font-semibold hover:border-[#2D1783] transition-colors"
            >
              <span>{LANG_FLAGS[lang]}</span>
              <span className="text-[#2D1783]">{LANG_LABELS[lang]}</span>
              <span className="material-symbols-outlined text-[16px] text-[#787585]">expand_more</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E8F0] rounded-xl shadow-lg py-1 min-w-[120px] z-50">
                {(["fi", "uk", "en"] as Lang[]).map((l) => (
                  <Link
                    key={l}
                    href={getLangPath(l)}
                    onClick={() => setLangOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#F8F9FD] transition-colors ${l === lang ? "text-[#2D1783] font-bold" : "text-[#474554]"}`}
                  >
                    <span>{LANG_FLAGS[l]}</span>
                    <span>{LANG_LABELS[l]}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <Link
            href={`/${lang}/nettikasinot`}
            className="hidden sm:inline-flex items-center bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#3e2db2] active:scale-95 transition-all"
          >
            {t.hero.cta}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#2D1783]"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5E8F0] px-4 py-4 space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-sm font-semibold text-[#474554] hover:text-[#2D1783] transition-colors border-b border-[#E5E8F0]"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2">
            <input
              type="text"
              placeholder={t.search}
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2 text-sm outline-none"
            />
          </div>
        </div>
      )}
    </nav>
  )
}
