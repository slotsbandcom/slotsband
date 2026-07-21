"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SlotsbandLogo } from "@/components/slotsband-logo"

const LANGS = [
  { code: "fi", flag: "🇫🇮", name: "SUOMI",         subtitle: "Parhaat nettikasinot suomalaisille" },
  { code: "uk", flag: "🇬🇧", name: "ENGLISH (UK)",  subtitle: "Best online casinos for UK players" },
  { code: "en", flag: "🌍",  name: "INTERNATIONAL", subtitle: "Best online casinos worldwide" },
]

const LS_KEY = "slotsband-lang"

export default function RootPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved && LANGS.some(l => l.code === saved)) {
        router.replace(`/${saved}`)
        return
      }
    } catch {}
    setReady(true)
  }, [router])

  function choose(code: string) {
    try {
      localStorage.setItem(LS_KEY, code)
      document.cookie = `slotsband-lang=${code};path=/;max-age=31536000;samesite=lax`
    } catch {}
    router.push(`/${code}`)
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#2D1783]/20 border-t-[#2D1783] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10">
        <SlotsbandLogo height={36} />
      </div>

      <h1 className="font-display font-bold text-2xl md:text-3xl text-[#1b1b1c] text-center leading-tight">
        Valitse kielesi
      </h1>
      <p className="text-[#787585] text-sm mt-1 mb-10 text-center">Choose your language</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {LANGS.map((lang) => (
          <button
            key={lang.code}
            onClick={() => choose(lang.code)}
            className="group bg-white rounded-2xl border-2 border-[#E5E8F0] hover:border-[#2D1783] p-6 text-center transition-all duration-200 active:scale-[0.97] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D1783]"
          >
            <span className="text-5xl block mb-4 select-none" role="img" aria-label={lang.name}>
              {lang.flag}
            </span>
            <p className="font-display font-bold text-sm tracking-widest text-[#1b1b1c] group-hover:text-[#2D1783] transition-colors">
              {lang.name}
            </p>
            <p className="text-xs text-[#787585] mt-1.5 leading-relaxed">
              {lang.subtitle}
            </p>
          </button>
        ))}
      </div>

      <p className="mt-10 text-xs text-[#787585] text-center max-w-sm leading-relaxed">
        🇫🇮 Suomi-versio on täydellisin —{" "}
        <span className="text-[#474554]">Finnish version is the most complete version currently</span>
      </p>
    </div>
  )
}
