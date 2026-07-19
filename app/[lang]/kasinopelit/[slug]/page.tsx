import Link from "next/link"
import { notFound } from "next/navigation"
import { GAMES, CASINOS } from "@/lib/data"
import type { Lang } from "@/lib/types"

const VOLATILITY_FI: Record<string, string> = { low: "Matala", medium: "Keskisuuri", high: "Korkea" }
const TYPE_FI: Record<string, string> = { slot: "Kolikkopeli", live: "Live kasino", table: "Pöytäpeli", jackpot: "Jackpot" }

export function generateStaticParams() {
  const langs = ["fi", "en", "uk"]
  return langs.flatMap((lang) => GAMES.map((g) => ({ lang, slug: g.slug })))
}

export default function GamePage({ params }: { params: { lang: string; slug: string } }) {
  const lang = (params.lang as Lang) || "fi"
  const game = GAMES.find((g) => g.slug === params.slug)
  if (!game) notFound()

  const similar = GAMES.filter((g) => g.type === game.type && g.id !== game.id).slice(0, 4)
  const casinos = CASINOS.filter((c) => c.game_providers.some((p) => p === game.provider)).slice(0, 4)

  const stats = [
    { label: "RTP", value: game.rtp ? `${game.rtp}%` : "N/A", icon: "percent" },
    { label: "Volatiliteetti", value: VOLATILITY_FI[game.volatility ?? "medium"], icon: "bar_chart" },
    { label: "Pelityyppi", value: TYPE_FI[game.type ?? "slot"], icon: "casino" },
    { label: "Tarjoaja", value: game.provider, icon: "business" },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E5E8F0] py-3">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 flex items-center gap-1.5 text-xs text-[#787585]">
          <Link href={`/${lang}`} className="hover:text-[#2D1783]">Koti</Link>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <Link href={`/${lang}/kasinopelit`} className="hover:text-[#2D1783]">Kasinopelit</Link>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-[#1b1b1c] font-semibold">{game.name}</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Game demo iframe */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden shadow-sm">
              <div className={`h-64 md:h-96 flex flex-col items-center justify-center relative ${
                game.type === "live" ? "bg-gradient-to-br from-[#0D2E24] to-[#1a5c40]" :
                game.type === "jackpot" ? "bg-gradient-to-br from-[#2D1783] to-[#6b21a8]" :
                "bg-gradient-to-br from-[#2D1783] to-[#3e2db2]"
              }`}>
                <span className="material-symbols-outlined text-white/20 text-8xl" aria-hidden="true">
                  {game.type === "live" ? "live_tv" : game.type === "table" ? "table_restaurant" : "casino"}
</span>
                <p className="text-white/50 text-sm mt-3">{game.name} — Demo</p>
                <button className="mt-4 bg-[#FFD700] text-[#1b1b1c] font-bold text-sm px-8 py-3 rounded-full hover:bg-[#FFE866] active:scale-95 transition-all">
                  Käynnistä demo
                </button>
              </div>
            </div>

            {/* Game info stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-[#E5E8F0] p-4 text-center">
                  <span className="material-symbols-outlined text-[#2D1783] text-2xl block mb-1" aria-hidden="true">{s.icon}</span>
                  <p className="font-display font-bold text-sm text-[#1b1b1c]">{s.value}</p>
                  <p className="text-[10px] text-[#787585] uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* About the game */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
              <h2 className="font-display font-bold text-lg text-[#1b1b1c] mb-3">{game.name} — Tietoa pelistä</h2>
              <p className="text-sm text-[#474554] leading-relaxed">
                {game.name} on {game.provider}:n kehittämä {TYPE_FI[game.type ?? "slot"].toLowerCase()}.
                Pelin RTP on {game.rtp}%, mikä tarkoittaa, että teoriassa peli palauttaa {game.rtp}% kaikista panostuksista pelaajille pitkällä aikavälillä.
                Volatiliteetti on {VOLATILITY_FI[game.volatility ?? "medium"].toLowerCase()}, joten voittojen tiheys ja koko vaihtelevat sen mukaisesti.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: "Min. panos", value: "0.20€" },
                  { label: "Maks. panos", value: "100€" },
                  { label: "Paylines", value: game.type === "slot" ? "20–1024" : "—" },
                  { label: "Maks. voitto", value: game.type === "jackpot" ? "Progressiivinen" : "5 000x" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#F8F9FD] rounded-xl p-3">
                    <p className="text-[10px] text-[#787585] uppercase tracking-wide">{item.label}</p>
                    <p className="font-bold text-sm text-[#1b1b1c] mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar games */}
            {similar.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-lg text-[#1b1b1c] mb-3">Samankaltaiset pelit</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {similar.map((g) => (
                    <Link
                      key={g.id}
                      href={`/${lang}/kasinopelit/${g.slug}`}
                      className="bg-white rounded-2xl border border-[#E5E8F0] p-3 hover:border-[#2D1783]/40 hover:shadow-md transition-all"
                    >
                      <div className={`h-20 rounded-xl mb-2 flex items-center justify-center ${
                        g.type === "live" ? "bg-gradient-to-br from-[#0D2E24] to-[#1a5c40]" : "bg-gradient-to-br from-[#2D1783] to-[#3e2db2]"
                      }`}>
                        <span className="material-symbols-outlined text-white/30 text-3xl" aria-hidden="true">casino</span>
                      </div>
                      <p className="font-bold text-xs text-[#1b1b1c] leading-snug">{g.name}</p>
                      <p className="text-[10px] text-[#787585]">{g.provider}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — where to play */}
          <aside className="lg:w-72 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 sticky top-[120px]">
              <h2 className="font-display font-bold text-sm text-[#1b1b1c] mb-3">Missä pelata {game.name}?</h2>
              <div className="space-y-3">
                {casinos.length === 0
                  ? CASINOS.slice(0, 3).map((c) => (
                      <CasinoRow key={c.id} casino={c} lang={lang} />
                    ))
                  : casinos.map((c) => (
                      <CasinoRow key={c.id} casino={c} lang={lang} />
                    ))
                }
              </div>
              <Link
                href={`/${lang}/nettikasinot`}
                className="mt-4 w-full block text-center text-xs font-bold text-[#2D1783] border border-[#2D1783]/30 py-2.5 rounded-xl hover:bg-[#2D1783]/5 transition-colors"
              >
                Näytä kaikki kasinot
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function CasinoRow({ casino, lang }: { casino: (typeof CASINOS)[0]; lang: Lang }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#F8F9FD] rounded-xl">
      <div className="w-9 h-9 bg-white rounded-lg border border-[#E5E8F0] flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-[#2D1783] text-[18px]" aria-hidden="true">casino</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-xs text-[#1b1b1c] truncate">{casino.name}</p>
        {casino.welcome_bonus_text && (
          <p className="text-[9px] text-[#787585] truncate">{casino.welcome_bonus_text.slice(0, 40)}...</p>
        )}
      </div>
      <a
        href={`/${lang}/mene/${casino.mene_slug}`}
        rel="nofollow sponsored noopener noreferrer"
        target="_blank"
        className="flex-shrink-0 bg-[#2D1783] text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-[#3e2db2] transition-colors"
      >
        Pelaa
      </a>
    </div>
  )
}
