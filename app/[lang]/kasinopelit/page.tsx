"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { GAMES } from "@/lib/data"
import type { Lang } from "@/lib/types"

const GAME_TYPES = [
  { id: "all",     label: "Kaikki pelit",   icon: "grid_view" },
  { id: "slot",    label: "Kolikkopelit",   icon: "casino" },
  { id: "live",    label: "Live kasino",    icon: "live_tv" },
  { id: "table",   label: "Pöytäpelit",    icon: "table_restaurant" },
  { id: "jackpot", label: "Jackpot",        icon: "emoji_events" },
]

const PROVIDERS = ["Kaikki", "Pragmatic Play", "Play'n GO", "NetEnt", "Evolution", "Microgaming", "Hacksaw Gaming"]
const VOLATILITIES = ["Kaikki", "low", "medium", "high"]
const VOLATILITY_FI: Record<string, string> = { low: "Matala", medium: "Keskisuuri", high: "Korkea" }

function VolatilityBadge({ v }: { v?: string }) {
  const colors: Record<string, string> = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    high: "bg-red-50 text-red-700 border-red-200",
  }
  return (
    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${colors[v ?? "medium"] ?? colors.medium}`}>
      {VOLATILITY_FI[v ?? "medium"]}
    </span>
  )
}

function GameTypeBadge({ type }: { type?: string }) {
  const labels: Record<string, string> = { slot: "Kolikko", live: "Live", table: "Pöytä", jackpot: "Jackpot" }
  return <span className="text-[9px] font-bold text-[#787585] uppercase">{labels[type ?? "slot"]}</span>
}

function GameCard({ game, lang }: { game: (typeof GAMES)[0]; lang: Lang }) {
  return (
    <Link href={`/${lang}/kasinopelit/${game.slug}`} className="group block bg-white rounded-2xl border border-[#E5E8F0] hover:border-[#2D1783]/40 hover:shadow-lg transition-all overflow-hidden">
      {/* Thumbnail placeholder with gradient by type */}
      <div className={`h-32 flex items-center justify-center relative ${
        game.type === "live" ? "bg-gradient-to-br from-[#0D2E24] to-[#1a5c40]" :
        game.type === "jackpot" ? "bg-gradient-to-br from-[#2D1783] to-[#6b21a8]" :
        game.type === "table" ? "bg-gradient-to-br from-[#1b1b1c] to-[#374151]" :
        "bg-gradient-to-br from-[#2D1783] to-[#3e2db2]"
      }`}>
        <span className="material-symbols-outlined text-white/30 text-5xl" aria-hidden="true">
          {game.type === "live" ? "live_tv" : game.type === "table" ? "table_restaurant" : game.type === "jackpot" ? "emoji_events" : "casino"}
        </span>
        <div className="absolute top-2 right-2">
          <VolatilityBadge v={game.volatility} />
        </div>
        {game.type === "jackpot" && (
          <div className="absolute top-2 left-2 bg-[#FFD700] text-[#2D1783] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
            Jackpot
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="font-display font-bold text-sm text-[#1b1b1c] leading-tight group-hover:text-[#2D1783] transition-colors">{game.name}</p>
        <p className="text-[10px] text-[#787585] mt-0.5">{game.provider}</p>
        <div className="flex items-center justify-between mt-2">
          <GameTypeBadge type={game.type} />
          {game.rtp && (
            <span className="text-[10px] font-bold text-[#2D1783]">RTP {game.rtp}%</span>
          )}
        </div>
        <button className="mt-2 w-full bg-[#F8F9FD] border border-[#E5E8F0] text-[#2D1783] font-bold text-[10px] py-2 rounded-xl hover:bg-[#2D1783] hover:text-white hover:border-[#2D1783] transition-all">
          Pelaa ilmaiseksi
        </button>
      </div>
    </Link>
  )
}

export default function GamesPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang as Lang) || "fi"
  const [activeType, setActiveType] = useState("all")
  const [provider, setProvider] = useState("Kaikki")
  const [volatility, setVolatility] = useState("Kaikki")
  const [minRtp, setMinRtp] = useState(85)
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => GAMES.filter((g) => {
    if (activeType !== "all" && g.type !== activeType) return false
    if (provider !== "Kaikki" && g.provider !== provider) return false
    if (volatility !== "Kaikki" && g.volatility !== volatility) return false
    if ((g.rtp ?? 0) < minRtp) return false
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [activeType, provider, volatility, minRtp, search])

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Header */}
      <header className="bg-[#2D1783] text-white pt-8 pb-10 md:pt-12 md:pb-14">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-2">Kasinopelit</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white text-balance">
            {lang === "fi" ? "Pelaa ilmaiseksi — Kaikki kasinopelit" : "Play for Free — All Casino Games"}
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-2xl">
            {lang === "fi"
              ? "Kokeile pelejä ilmaiseksi ennen oikeaa pelaamista. Löydä parhaat kolikkopelit, live-kasinopelit ja pöytäpelit."
              : "Try games for free before playing for real. Find the best slots, live casino games and table games."}
          </p>
          {/* Search */}
          <div className="relative mt-5 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-[18px]" aria-hidden="true">search</span>
            <input
              type="search"
              placeholder="Etsi peliä..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 focus:border-white/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/50 outline-none"
            />
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 mt-6">
        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
          {GAME_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeType === t.id
                  ? "bg-[#2D1783] text-white shadow-md"
                  : "bg-white border border-[#E5E8F0] text-[#474554] hover:border-[#2D1783]"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter sidebar */}
          <aside className="lg:w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 space-y-5 sticky top-[120px]">
              <p className="font-display font-bold text-sm text-[#1b1b1c]">Suodattimet</p>
              <div>
                <label className="text-[10px] font-bold text-[#787585] uppercase tracking-wide block mb-2">Pelintarjoaja</label>
                <div className="space-y-1">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setProvider(p)}
                      className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        provider === p ? "bg-[#2D1783]/10 text-[#2D1783] font-bold" : "text-[#474554] hover:bg-[#F8F9FD]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#787585] uppercase tracking-wide block mb-2">Volatiliteetti</label>
                <div className="flex gap-1.5 flex-wrap">
                  {VOLATILITIES.map((v) => (
                    <button
                      key={v}
                      onClick={() => setVolatility(v)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                        volatility === v ? "bg-[#2D1783] text-white border-[#2D1783]" : "border-[#E5E8F0] text-[#474554] hover:border-[#2D1783]"
                      }`}
                    >
                      {v === "Kaikki" ? "Kaikki" : VOLATILITY_FI[v]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#787585] uppercase tracking-wide block mb-2">
                  Min. RTP: {minRtp}%
                </label>
                <input
                  type="range" min={80} max={99} step={1} value={minRtp}
                  onChange={(e) => setMinRtp(Number(e.target.value))}
                  className="w-full accent-[#2D1783]"
                />
                <div className="flex justify-between text-[9px] text-[#787585] mt-0.5">
                  <span>80%</span><span>99%</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            <p className="text-xs text-[#787585] font-medium mb-4">{filtered.length} peliä löydetty</p>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E8F0] p-12 text-center">
                <span className="material-symbols-outlined text-[#E5E8F0] text-5xl block mb-3">search_off</span>
                <p className="text-[#787585] font-medium">Ei pelejä suodatusehdoilla</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map((game) => <GameCard key={game.id} game={game} lang={lang} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pb-16" />
    </div>
  )
}
