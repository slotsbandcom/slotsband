"use client"

import { useState, useEffect } from "react"
import { BONUS_HUNTS } from "@/lib/data"
import type { Lang } from "@/lib/types"
import type { BonusHuntSlot } from "@/lib/types"

// ─── Helpers ────────────────────────────────────────────────────────────────

function pulse() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
    </span>
  )
}

function MultiplierBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/30 text-sm">—</span>
  if (value >= 1000) return <span className="font-bold text-[#FFD700] text-sm">{value}x <span className="text-[9px] bg-[#FFD700] text-black px-1 py-0.5 rounded ml-0.5 font-extrabold tracking-wide">MEGA</span></span>
  if (value >= 500) return <span className="font-bold text-[#FFD700] text-sm">{value}x</span>
  if (value >= 100) return <span className="font-semibold text-emerald-400 text-sm">{value}x</span>
  return <span className="text-white/70 text-sm">{value}x</span>
}

function ProfitCell({ slot }: { slot: BonusHuntSlot }) {
  if (slot.multiplier === null) return <span className="text-white/30">—</span>
  const won = Math.round(slot.bet * slot.multiplier)
  const profit = won - slot.balance
  return (
    <span className={`font-semibold text-sm ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
      {profit >= 0 ? "+" : ""}{profit}€
    </span>
  )
}

// ─── Prediction modal ────────────────────────────────────────────────────────

interface Prediction {
  nickname: string
  amount: number
  multiplier: number
  game: string
  submittedAt: string
}

function scorePrediction(pred: Prediction, actual: { amount: number; multiplier: number }): number {
  let pts = 0
  const amtDiff = Math.abs(pred.amount - actual.amount) / actual.amount
  if (amtDiff === 0) pts += 100
  else if (amtDiff <= 0.1) pts += 50
  else if (amtDiff <= 0.25) pts += 25
  const multDiff = Math.abs(pred.multiplier - actual.multiplier) / actual.multiplier
  if (multDiff === 0) pts += 100
  else if (multDiff <= 0.1) pts += 50
  else if (multDiff <= 0.25) pts += 25
  return pts
}

function PredictionModal({ games, onClose, onSubmit }: {
  games: string[]
  onClose: () => void
  onSubmit: (p: Prediction) => void
}) {
  const [nickname, setNickname] = useState("")
  const [amount, setAmount] = useState("")
  const [multiplier, setMultiplier] = useState("")
  const [game, setGame] = useState(games[0] ?? "")
  const [done, setDone] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname || !amount || !multiplier || !game) return
    onSubmit({
      nickname,
      amount: Number(amount),
      multiplier: Number(multiplier),
      game,
      submittedAt: new Date().toLocaleTimeString("fi-FI"),
    })
    setDone(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#1a0e3a] border border-white/10 rounded-3xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-[48px] text-emerald-400 mb-3 block" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h3 className="font-display font-bold text-xl text-white mb-1">Ennuste lähetetty!</h3>
            <p className="text-white/50 text-sm">Onnea arvaukseen. Tulokset ilmoitetaan session päättyessä.</p>
            <button onClick={onClose} className="mt-5 w-full bg-[#FFD700] text-[#1a0e3a] font-bold py-3 rounded-2xl text-sm hover:bg-yellow-300 active:scale-95 transition-all">Sulje</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg text-white">Tee ennuste</h3>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors" aria-label="Sulje">
                <span className="material-symbols-outlined text-[22px]" aria-hidden="true">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Nimimerkki</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Twitch-nimesi..."
                  className="w-full bg-white/5 border border-white/10 focus:border-[#FFD700]/60 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Loppusumma (€)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="esim. 3200"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#FFD700]/60 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Paras kerroin</label>
                <input
                  type="number"
                  value={multiplier}
                  onChange={e => setMultiplier(e.target.value)}
                  placeholder="esim. 450"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#FFD700]/60 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Voittava peli</label>
                <select
                  value={game}
                  onChange={e => setGame(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#FFD700]/60 rounded-xl px-4 py-2.5 text-white outline-none transition-colors"
                  required
                >
                  {games.map(g => <option key={g} value={g} className="bg-[#1a0e3a]">{g}</option>)}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#FFD700] text-[#1a0e3a] font-bold py-3.5 rounded-2xl text-sm hover:bg-yellow-300 active:scale-95 transition-all mt-1"
              >
                Lähetä ennuste
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Stream Embed ─────────────────────────────────────────────────────────────

type StreamPlatform = "kick" | "twitch" | "youtube"

const PLATFORM_CONFIG: Record<StreamPlatform, { label: string; color: string }> = {
  kick:    { label: "Kick",     color: "#53FC18" },
  twitch:  { label: "Twitch",   color: "#9146FF" },
  youtube: { label: "YouTube",  color: "#FF0000" },
}

// Platform letter badges used instead of SVGs to avoid Turbopack path-parsing issues
const PLATFORM_BADGE: Record<StreamPlatform, string> = {
  kick: "K",
  twitch: "T",
  youtube: "YT",
}

const PLATFORM_ORDER: StreamPlatform[] = ["kick", "twitch", "youtube"]

function StreamEmbed({ isLive }: { isLive: boolean }) {
  const [platform, setPlatform] = useState<StreamPlatform>("kick")
  const [youtubeUrl, setYoutubeUrl] = useState("")

  function getYoutubeId(url: string): string | null {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
  }

  const ytId = getYoutubeId(youtubeUrl)

  return (
    <div className="bg-[#1a0e3a] border border-white/10 rounded-2xl overflow-hidden">
      {/* Platform tabs */}
      <div className="flex border-b border-white/10">
        {PLATFORM_ORDER.map(p => {
          const cfg = PLATFORM_CONFIG[p]
          const active = platform === p
          return (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                active ? "border-current" : "border-transparent text-white/40 hover:text-white/70"
              }`}
              style={active ? { color: cfg.color, borderColor: cfg.color } : {}}
              aria-pressed={active}
            >
              <span
                className="inline-flex items-center justify-center rounded text-[9px] font-black w-5 h-4 flex-shrink-0"
                style={{ backgroundColor: active ? cfg.color : "rgba(255,255,255,0.1)", color: active ? "#000" : "#fff" }}
                aria-hidden="true"
              >
                {PLATFORM_BADGE[p]}
              </span>
              {cfg.label}
            </button>
          )
        })}
        {isLive && (
          <div className="ml-auto flex items-center gap-1.5 pr-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      {/* Embed area — 16:9 */}
      <div className="relative w-full aspect-video bg-[#0d0820]">
        {platform === "twitch" && (
          <iframe
            src="https://player.twitch.tv/?channel=slotsband&parent=slotsband.com&autoplay=false"
            title="SlotsBand Twitch stream"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen"
          />
        )}

        {platform === "youtube" && (
          ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=0`}
              title="SlotsBand YouTube stream"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
              <span className="inline-flex items-center justify-center w-14 h-10 rounded-lg bg-[#FF0000] text-white text-sm font-black" aria-hidden="true">YT</span>
              <p className="text-white/50 text-sm text-center">
                {youtubeUrl && !ytId
                  ? "Virheellinen YouTube-linkki"
                  : "Anna YouTube-streamin URL avataksesi lähetyksen"}
              </p>
              <div className="flex w-full max-w-sm gap-2">
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 bg-white/5 border border-white/10 focus:border-[#FF0000]/60 rounded-xl px-3 py-2 text-white text-xs placeholder:text-white/30 outline-none transition-colors"
                />
              </div>
            </div>
          )
        )}

        {platform === "kick" && (
          <iframe
            src="https://player.kick.com/slotsband"
            title="SlotsBand Kick stream"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen"
          />
        )}
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function BonusHuntPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang as Lang) || "fi"
  const active = BONUS_HUNTS.find(b => b.is_active) ?? BONUS_HUNTS[0]
  const past = BONUS_HUNTS.filter(b => !b.is_active)

  const completedSlots = active.slots.filter(s => s.multiplier !== null)
  const progress = Math.round((completedSlots.length / active.slots.length) * 100)
  const totalWon = completedSlots.reduce((sum, s) => sum + Math.round(s.bet * (s.multiplier ?? 0)), 0)
  const bestMultiplier = completedSlots.length ? Math.max(...completedSlots.map(s => s.multiplier ?? 0)) : 0
  const avgMultiplier = completedSlots.length ? Math.round(completedSlots.reduce((sum, s) => sum + (s.multiplier ?? 0), 0) / completedSlots.length) : 0
  const roi = active.total_won > 0 ? Math.round(((active.total_won - active.total_invested) / active.total_invested) * 100) : 0

  // All-time stats from past sessions
  const allCompleted = past.flatMap(h => h.slots.filter(s => s.multiplier !== null))
  const allTimeBest = allCompleted.length ? Math.max(...allCompleted.map(s => s.multiplier ?? 0)) : 1240
  const allTimeROI = past.length ? Math.max(...past.map(h => Math.round(((h.total_won - h.total_invested) / h.total_invested) * 100))) : 140

  const [tab, setTab] = useState<"slots" | "predictions" | "archive">("slots")
  const [showModal, setShowModal] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([
    { nickname: "SlotKing99", amount: 3800, multiplier: 420, game: "Gates of Olympus", submittedAt: "14:23" },
    { nickname: "BonusBeast", amount: 2500, multiplier: 280, game: "Sweet Bonanza", submittedAt: "14:24" },
    { nickname: "FinlandHighRoller", amount: 4200, multiplier: 650, game: "Gates of Olympus", submittedAt: "14:25" },
    { nickname: "LuckyLauri", amount: 1900, multiplier: 150, game: "Big Bass Bonanza", submittedAt: "14:26" },
  ])

  const gameNames = active.slots.map(s => s.game)

  // Actual results for completed session scoring (use past[0] as example)
  const actualResult = { amount: past[0]?.total_won ?? 4320, multiplier: 1240 }

  return (
    <div className="min-h-screen bg-[#0d0820]">

      {/* ── LIVE HERO ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#1a0e3a] to-[#0d0820] pt-6 pb-0">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {active.is_active ? (
                <span className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 text-[11px] font-bold uppercase px-3 py-1.5 rounded-full">
                  {pulse()} LIVE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/50 text-[11px] font-bold uppercase px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[12px]" aria-hidden="true">history</span> Päättynyt
                </span>
              )}
              <span className="text-white/30 text-xs hidden sm:inline">{active.date}</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-[#FFD700] text-[#0d0820] font-bold text-xs px-4 py-2 rounded-full hover:bg-yellow-300 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">emoji_events</span>
              Tee ennuste
            </button>
          </div>

          {/* Title + streamer */}
          <div className="flex flex-col md:flex-row md:items-end gap-6 pb-6">
            <div className="flex-1">
              <h1 className="font-display font-bold text-2xl md:text-4xl text-white text-balance leading-tight">
                {active.title}
              </h1>
              <p className="text-white/40 text-sm mt-1">SlotsBand &bull; Twitch stream</p>
            </div>

            {/* Big stats */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: "Investoitu", value: `${active.total_invested}€`, color: "text-white" },
                { label: "Avattu", value: `${completedSlots.length}/${active.slots.length}`, color: "text-white" },
                ...(totalWon > 0 ? [{ label: "Voitettu", value: `${totalWon}€`, color: totalWon >= active.total_invested ? "text-emerald-400" : "text-red-400" }] : []),
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[90px]">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">{stat.label}</p>
                  <p className={`font-display font-bold text-xl mt-0.5 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {active.is_active && (
            <div className="pb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/40 text-[11px] font-semibold uppercase tracking-wide">Edistyminen</span>
                <span className="text-white/70 text-[11px] font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FFD700] to-[#ff9a00] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/10">
            {([
              { id: "slots", label: "Bonuslista" },
              { id: "predictions", label: `Ennusteet (${predictions.length})` },
              { id: "archive", label: "Arkisto" },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                  tab === t.id
                    ? "border-[#FFD700] text-[#FFD700]"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-6">
        <div className="flex flex-col xl:flex-row gap-6">

          {/* Main column */}
          <div className="flex-1 min-w-0">

            {/* ── TAB: SLOTS ── */}
            {tab === "slots" && (
              <div className="space-y-4">
                {/* Stream embed — always shown on slots tab */}
                <StreamEmbed isLive={active.is_active} />

                {/* Slots table */}
                <div className="bg-[#1a0e3a] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[580px]" aria-label="Bonushunt slotit">
                      <thead>
                        <tr className="border-b border-white/10">
                          {["#", "Peli", "Tarjoaja", "Saldo", "Panos", "Bonus arvo", "Kerroin", "Voitto"].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {active.slots.map((slot, i) => (
                          <tr
                            key={i}
                            className={`border-b border-white/5 last:border-0 transition-colors ${
                              slot.multiplier !== null && slot.multiplier >= 500
                                ? "bg-[#FFD700]/5"
                                : "hover:bg-white/3"
                            }`}
                          >
                            <td className="px-4 py-3 text-white/30 text-xs font-semibold">{i + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#2D1783]/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined text-[#FFD700] text-[15px]" aria-hidden="true">casino</span>
                                </div>
                                <span className="font-semibold text-white text-sm">{slot.game}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{slot.provider}</td>
                            <td className="px-4 py-3 text-white/70 text-xs font-semibold">{slot.balance}€</td>
                            <td className="px-4 py-3 text-white/50 text-xs">{slot.bet}€</td>
                            <td className="px-4 py-3 text-white/50 text-xs">{slot.bonus_value}x</td>
                            <td className="px-4 py-3"><MultiplierBadge value={slot.multiplier} /></td>
                            <td className="px-4 py-3"><ProfitCell slot={slot} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Running totals footer */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-white/5 border-t border-white/10">
                    {[
                      { label: "Investoitu", value: `${active.total_invested}€`, color: "text-white" },
                      { label: "Voitettu", value: totalWon > 0 ? `${totalWon}€` : "—", color: totalWon >= active.total_invested ? "text-emerald-400" : "text-red-400" },
                      { label: "Paras kerroin", value: bestMultiplier > 0 ? `${bestMultiplier}x` : "—", color: "text-[#FFD700]" },
                      { label: "Keskim. kerroin", value: avgMultiplier > 0 ? `${avgMultiplier}x` : "—", color: "text-white" },
                      { label: "ROI", value: roi !== 0 ? `${roi > 0 ? "+" : ""}${roi}%` : "—", color: roi >= 0 ? "text-emerald-400" : "text-red-400" },
                    ].map(stat => (
                      <div key={stat.label} className="bg-[#0d0820] px-4 py-3">
                        <p className="text-white/30 text-[10px] uppercase tracking-wide font-bold">{stat.label}</p>
                        <p className={`font-display font-bold text-base mt-0.5 ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: PREDICTIONS ── */}
            {tab === "predictions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-white">Katsojaennusteet</h2>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 bg-[#FFD700] text-[#0d0820] font-bold text-xs px-4 py-2 rounded-full hover:bg-yellow-300 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">add</span>
                    Tee ennuste
                  </button>
                </div>

                {/* Points key */}
                <div className="bg-[#1a0e3a] border border-white/10 rounded-2xl p-4">
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-wide mb-2">Pistejärjestelmä</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { pts: "100p", label: "Tarkka osuma" },
                      { pts: "50p", label: "±10% heitto" },
                      { pts: "25p", label: "±25% heitto" },
                    ].map(r => (
                      <div key={r.pts} className="flex items-center gap-1.5">
                        <span className="bg-[#FFD700]/20 text-[#FFD700] font-bold text-[11px] px-2 py-0.5 rounded">{r.pts}</span>
                        <span className="text-white/50 text-[11px]">{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-[#1a0e3a] border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm min-w-[460px]" aria-label="Ennusteet">
                    <thead>
                      <tr className="border-b border-white/10">
                        {["#", "Nimimerkki", "Loppusumma", "Paras kerroin", "Voittava peli", "Pisteet"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((pred, i) => {
                        const pts = active.is_active ? null : scorePrediction(pred, actualResult)
                        const isWinner = pts !== null && pts === Math.max(...predictions.map(p => scorePrediction(p, actualResult)))
                        return (
                          <tr
                            key={i}
                            className={`border-b border-white/5 last:border-0 transition-colors ${isWinner ? "bg-[#FFD700]/5 border-[#FFD700]/20" : "hover:bg-white/3"}`}
                          >
                            <td className="px-4 py-3 text-white/30 text-xs">
                              {isWinner ? <span className="material-symbols-outlined text-[#FFD700] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span> : i + 1}
                            </td>
                            <td className="px-4 py-3 font-semibold text-white text-sm">{pred.nickname}</td>
                            <td className="px-4 py-3 text-white/70 text-sm">{pred.amount}€</td>
                            <td className="px-4 py-3 text-white/70 text-sm">{pred.multiplier}x</td>
                            <td className="px-4 py-3 text-white/50 text-xs">{pred.game}</td>
                            <td className="px-4 py-3">
                              {pts !== null
                                ? <span className={`font-bold text-sm ${pts >= 100 ? "text-[#FFD700]" : pts >= 50 ? "text-emerald-400" : "text-white/50"}`}>{pts}p</span>
                                : <span className="text-white/20 text-xs">—</span>
                              }
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB: ARCHIVE ── */}
            {tab === "archive" && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-lg text-white">Aikaisemmat sessiot</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {past.map(hunt => {
                    const huntCompleted = hunt.slots.filter(s => s.multiplier !== null)
                    const huntBest = huntCompleted.length ? Math.max(...huntCompleted.map(s => s.multiplier ?? 0)) : 0
                    const huntBestGame = huntCompleted.find(s => s.multiplier === huntBest)?.game ?? "—"
                    const huntROI = Math.round(((hunt.total_won - hunt.total_invested) / hunt.total_invested) * 100)
                    const profit = hunt.total_won >= hunt.total_invested
                    return (
                      <div key={hunt.id} className="bg-[#1a0e3a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <div>
                            <p className="font-display font-bold text-sm text-white">{hunt.title}</p>
                            <p className="text-white/30 text-[11px] mt-0.5">{hunt.date} &bull; {hunt.slots.length} peliä</p>
                          </div>
                          <span className={`text-base font-bold ${profit ? "text-emerald-400" : "text-red-400"}`}>
                            {profit ? "+" : ""}{huntROI}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {[
                            { label: "Investoitu", value: `${hunt.total_invested}€`, color: "text-white" },
                            { label: "Voitettu", value: `${hunt.total_won}€`, color: profit ? "text-emerald-400" : "text-red-400" },
                            { label: "Paras kerroin", value: `${huntBest}x`, color: "text-[#FFD700]" },
                            { label: "Voittava peli", value: huntBestGame, color: "text-white/70" },
                          ].map(s => (
                            <div key={s.label} className="bg-white/5 rounded-xl px-3 py-2">
                              <p className="text-white/30 text-[10px] uppercase tracking-wide font-bold">{s.label}</p>
                              <p className={`font-bold text-xs mt-0.5 truncate ${s.color}`}>{s.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── SIDEBAR: ALL-TIME STATS ── */}
          <aside className="xl:w-64 flex-shrink-0">
            <div className="bg-[#1a0e3a] border border-white/10 rounded-2xl p-5 xl:sticky xl:top-20 space-y-4">
              <h3 className="font-display font-bold text-sm text-white/80 uppercase tracking-wide">Kaikkien aikojen tilastot</h3>
              {[
                { icon: "emoji_events", label: "Paras kerroin", value: `${allTimeBest}x`, gold: true },
                { icon: "trending_up", label: "Paras ROI sessio", value: `+${allTimeROI}%`, gold: false },
                { icon: "bar_chart", label: "Sessioita yhteensä", value: `${BONUS_HUNTS.length}`, gold: false },
                { icon: "casino", label: "Paras peli kautta", value: "Sugar Rush 1000", gold: false },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.gold ? "bg-[#FFD700]/15" : "bg-white/5"}`}>
                    <span className={`material-symbols-outlined text-[18px] ${s.gold ? "text-[#FFD700]" : "text-white/40"}`} aria-hidden="true">{s.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide leading-none">{s.label}</p>
                    <p className={`font-bold text-sm mt-0.5 truncate ${s.gold ? "text-[#FFD700]" : "text-white"}`}>{s.value}</p>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => { setTab("predictions"); setShowModal(true) }}
                  className="w-full bg-[#FFD700] text-[#0d0820] font-bold text-xs py-3 rounded-xl hover:bg-yellow-300 active:scale-95 transition-all"
                >
                  Tee ennuste
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <PredictionModal
          games={gameNames}
          onClose={() => setShowModal(false)}
          onSubmit={(p) => { setPredictions(prev => [p, ...prev]) }}
        />
      )}
    </div>
  )
}
