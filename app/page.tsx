"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SlotsbandLogo } from "@/components/slotsband-logo"

const LANGS = [
  { code: "fi", flag: "🇫🇮", name: "SUOMI",          subtitle: "Parhaat nettikasinot suomalaisille" },
  { code: "uk", flag: "🇬🇧", name: "ENGLISH (UK)",   subtitle: "Best online casinos for UK players" },
  { code: "en", flag: "🌍", name: "INTERNATIONAL",   subtitle: "Best online casinos worldwide" },
]

const LS_LAST   = "slotsband-lang"        // last visited language (for badge only)
const LS_REMEMBER = "slotsband-remember"  // "1" if user opted into auto-redirect

export default function RootPage() {
  const router = useRouter()
  const [lastLang, setLastLang]     = useState<string | null>(null)
  const [remember, setRemember]     = useState(false)

  // On mount: read stored prefs. Auto-redirect ONLY if user previously
  // checked "Remember my choice" AND saved a language.
  useEffect(() => {
    try {
      const saved    = localStorage.getItem(LS_LAST)
      const doRemember = localStorage.getItem(LS_REMEMBER) === "1"
      if (saved) setLastLang(saved)
      if (doRemember && saved && LANGS.some((l) => l.code === saved)) {
        router.replace(`/${saved}`)
      }
    } catch {}
  }, [router])

  function choose(code: string) {
    try {
      localStorage.setItem(LS_LAST, code)
      localStorage.setItem(LS_REMEMBER, remember ? "1" : "0")
    } catch {}
    router.push(`/${code}`)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="mb-10">
        <SlotsbandLogo height={36} />
      </div>

      {/* Headline */}
      <h1 className="font-display font-bold text-2xl md:text-3xl text-[#1b1b1c] text-center leading-tight">
        Valitse kielesi
      </h1>
      <p className="text-[#787585] text-sm mt-1 mb-10 text-center">Choose your language</p>

      {/* Language cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {LANGS.map((lang) => {
          const isLast = lastLang === lang.code
          return (
            <button
              key={lang.code}
              onClick={() => choose(lang.code)}
              className={`group relative bg-white rounded-2xl border-2 p-6 text-center transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D1783] hover:shadow-xl ${
                isLast
                  ? "border-[#2D1783] shadow-md"
                  : "border-[#E5E8F0] hover:border-[#2D1783]"
              }`}
            >
              {/* "Last chosen" badge */}
              {isLast && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#2D1783] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  ✓ Viimeksi valittu
                </span>
              )}

              <span className="text-5xl block mb-4 select-none" role="img" aria-label={lang.name}>
                {lang.flag}
              </span>
              <p className={`font-display font-bold text-sm tracking-widest transition-colors ${isLast ? "text-[#2D1783]" : "text-[#1b1b1c] group-hover:text-[#2D1783]"}`}>
                {lang.name}
              </p>
              <p className="text-xs text-[#787585] mt-1.5 leading-relaxed">
                {lang.subtitle}
              </p>
            </button>
          )
        })}
      </div>

      {/* Remember my choice checkbox */}
      <div
        className="flex items-center gap-2.5 mt-7 cursor-pointer select-none"
        onClick={() => setRemember((r) => !r)}
      >
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          remember ? "bg-[#2D1783] border-[#2D1783]" : "border-[#C5C0D4]"
        }`}>
          {remember && (
            <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-white" aria-hidden="true">
              <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className="text-xs text-[#474554]">
          Muista valintani — Remember my choice
        </span>
      </div>

      {/* Fi completeness note */}
      <p className="mt-7 text-xs text-[#787585] text-center max-w-sm leading-relaxed">
        🇫🇮 Suomi-versio on täydellisin —{" "}
        <span className="text-[#474554]">Finnish version is the most complete version currently</span>
      </p>

      {/* Skip link */}
      <Link
        href="/fi"
        className="mt-4 text-xs text-[#787585] hover:text-[#2D1783] transition-colors underline underline-offset-4"
      >
        Jatka ilman valintaa / Continue without selecting →
      </Link>
    </div>
  )
}
