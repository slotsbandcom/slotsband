"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Lang, Raffle } from "@/lib/types"
import { useStreamStatus } from "@/hooks/use-stream-status"
import { StreamStatusBadge } from "@/components/stream-status-badge"

function useCountdown(target: string) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const calc = () => {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 })
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [target])
  return timeLeft
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/10 rounded-xl px-3 py-2 min-w-[52px]">
      <span className="font-display font-bold text-2xl text-white leading-none">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] text-white/60 uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  )
}

export default function RafflesPage({
  params,
  raffles = [],
}: {
  params: { lang: string }
  raffles?: Raffle[]
}) {
  const lang = (params.lang as Lang) || "fi"
  const active = raffles.find(r => r.status === "active") ?? raffles[0]
  const countdown = useCountdown(active.ends_at)
  const { anyLive } = useStreamStatus()

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Active raffle hero */}
      <header className="bg-gradient-to-br from-[#2D1783] to-[#1e0f5c] text-white pt-10 pb-12 md:pt-14 md:pb-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#FFD700]/10 rounded-full" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#FFD700]/5 rounded-full" aria-hidden="true" />
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-[#FFD700] text-[#2D1783] text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[12px]" aria-hidden="true">fiber_manual_record</span>
                  Aktiivinen raffle
                </span>
                {anyLive && (
                  <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full">
                    <StreamStatusBadge platform="any" size="sm" showViewers />
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-white text-balance leading-snug">
                {active.title}
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <span className="material-symbols-outlined text-[#FFD700] text-[20px]" aria-hidden="true">emoji_events</span>
                <p className="text-[#FFD700] font-bold text-lg">{active.prize}</p>
              </div>
              <p className="text-white/60 text-sm mt-1">Yhteistyössä: <strong className="text-white">{active.casino_name}</strong></p>
            </div>
            {/* Countdown */}
            <div className="flex flex-col items-start md:items-end gap-3">
              <p className="text-white/70 text-xs uppercase tracking-widest font-bold">Arvonta paattyy</p>
              <div className="flex gap-2">
                <CountdownUnit value={countdown.d} label="pv" />
                <CountdownUnit value={countdown.h} label="t" />
                <CountdownUnit value={countdown.m} label="min" />
                <CountdownUnit value={countdown.s} label="s" />
              </div>
              <a
                href={`/${lang}/mene/${active.casino_slug}`}
                rel="nofollow sponsored noopener noreferrer"
                target="_blank"
                className="mt-1 bg-[#FFD700] text-[#2D1783] font-bold text-sm px-6 py-3 rounded-full hover:bg-[#FFE866] active:scale-95 transition-all"
              >
                Osallistu nyt
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8 space-y-8">
        {/* How to participate */}
        <section>
          <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-4">Miten osallistua?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(active.how_to ?? []).map((step, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E8F0] p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-[#2D1783] rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-white text-sm">
                  {i + 1}
                </div>
                <p className="text-sm text-[#474554] leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Past winners */}
        <section>
          <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-4">Aikaisemmat voittajat</h2>
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <table className="w-full text-sm" aria-label="Voittajat">
              <thead>
                <tr className="bg-[#F8F9FD] border-b border-[#E5E8F0]">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-[#787585] uppercase tracking-wide">Voittaja</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-[#787585] uppercase tracking-wide">Palkinto</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-[#787585] uppercase tracking-wide hidden sm:table-cell">Kasino</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-[#787585] uppercase tracking-wide hidden sm:table-cell">Päivämäärä</th>
                </tr>
              </thead>
              <tbody>
                {(active.past_winners ?? []).map((w, i) => (
                  <tr key={i} className="border-b border-[#F8F9FD] last:border-0 hover:bg-[#F8F9FD] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#2D1783]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[#2D1783] text-[14px]" aria-hidden="true">person</span>
                        </div>
                        <span className="font-semibold text-[#1b1b1c]">{w.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[#27AE60] font-bold text-xs">
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">emoji_events</span>
                        {w.prize}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#787585]">{w.casino ?? ""}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#787585]">{w.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Upcoming raffles */}
        <section>
          <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-4">Tulevat rafflet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(active.upcoming ?? []).map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-[#E5E8F0] p-5 flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block bg-[#F8F9FD] border border-[#E5E8F0] text-[10px] font-bold text-[#787585] uppercase px-2 py-0.5 rounded-full mb-2">Tulossa pian</span>
                  <h3 className="font-display font-bold text-base text-[#1b1b1c]">{r.title}</h3>
                  <p className="text-xs text-[#787585] mt-1">{r.casino_name}</p>
                  <p className="text-xs text-[#787585] mt-0.5">Alkaa: {r.starts_at}</p>
                </div>
                <div className="flex-shrink-0 text-center">
                  <p className="font-display font-bold text-[#2D1783] text-lg">{r.prize}</p>
                  <p className="text-[10px] text-[#787585]">Palkinto</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="pb-12" />
    </div>
  )
}
