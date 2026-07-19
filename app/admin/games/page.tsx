"use client"

import { useState } from "react"
import { CASINOS } from "@/lib/data"

type GameType = "slot" | "live" | "table" | "jackpot" | "scratch"
type Volatility = "low" | "medium" | "high"
type Lang = "fi" | "en" | "uk"

interface AdminGame {
  id: string
  name: string
  provider: string
  type: GameType
  rtp: number
  volatility: Volatility
  minBet: number
  maxBet: number
  paylines?: number
  demoUrl?: string
  isActive: boolean
}

const TYPE_LABELS: Record<GameType, string> = {
  slot: "Slot", live: "Live Casino", table: "Table", jackpot: "Jackpot", scratch: "Scratch",
}
const TYPE_STYLES: Record<GameType, string> = {
  slot:    "bg-[#2D1783]/10 text-[#2D1783]",
  live:    "bg-[#27AE60]/10 text-[#27AE60]",
  table:   "bg-[#FFD700]/20 text-[#775900]",
  jackpot: "bg-[#E74C3C]/10 text-[#E74C3C]",
  scratch: "bg-[#E5E8F0] text-[#787585]",
}
const VOL_STYLES: Record<Volatility, string> = {
  low:    "bg-[#27AE60]/10 text-[#27AE60]",
  medium: "bg-[#FFD700]/20 text-[#775900]",
  high:   "bg-[#E74C3C]/10 text-[#E74C3C]",
}
const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }

const PROVIDERS = ["NetEnt", "Play'n GO", "Pragmatic Play", "Evolution", "Microgaming", "Hacksaw Gaming", "Nolimit City", "Push Gaming", "Relax Gaming", "Big Time Gaming"]

const MOCK_GAMES: AdminGame[] = [
  { id: "1", name: "Gates of Olympus",     provider: "Pragmatic Play", type: "slot",    rtp: 96.5, volatility: "high",   minBet: 0.20, maxBet: 125,   paylines: 20,  isActive: true },
  { id: "2", name: "Book of Dead",         provider: "Play'n GO",      type: "slot",    rtp: 96.2, volatility: "high",   minBet: 0.10, maxBet: 100,   paylines: 10,  isActive: true },
  { id: "3", name: "Sweet Bonanza",        provider: "Pragmatic Play", type: "slot",    rtp: 96.5, volatility: "high",   minBet: 0.20, maxBet: 125,   paylines: 0,   isActive: true },
  { id: "4", name: "Lightning Roulette",   provider: "Evolution",      type: "live",    rtp: 97.3, volatility: "medium", minBet: 0.20, maxBet: 2500,  isActive: true },
  { id: "5", name: "Crazy Time",           provider: "Evolution",      type: "live",    rtp: 96.1, volatility: "high",   minBet: 0.10, maxBet: 5000,  isActive: true },
  { id: "6", name: "Mega Moolah",          provider: "Microgaming",    type: "jackpot", rtp: 88.1, volatility: "medium", minBet: 0.25, maxBet: 6.25,  paylines: 25,  isActive: true },
  { id: "7", name: "Reactoonz",            provider: "Play'n GO",      type: "slot",    rtp: 96.5, volatility: "high",   minBet: 0.20, maxBet: 100,   isActive: false },
  { id: "8", name: "Gonzo's Quest",        provider: "NetEnt",         type: "slot",    rtp: 95.97, volatility: "medium",minBet: 0.20, maxBet: 50,    paylines: 20,  isActive: true },
]

// ─── Form ─────────────────────────────────────────────────────────────────────
function GameForm({ onClose }: { onClose: () => void }) {
  const [activeLang, setActiveLang] = useState<Lang>("fi")
  const [gameType, setGameType] = useState<GameType>("slot")
  const [volatility, setVolatility] = useState<Volatility>("medium")
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8F0]">
          <h2 className="font-display font-bold text-lg text-[#1b1b1c]">Add Game</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Lang tabs */}
        <div className="flex border-b border-[#E5E8F0] px-6">
          {(["fi", "en", "uk"] as Lang[]).map(l => (
            <button key={l} onClick={() => setActiveLang(l)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeLang === l ? "border-[#2D1783] text-[#2D1783]" : "border-transparent text-[#787585] hover:text-[#1b1b1c]"}`}>
              <span>{LANG_FLAGS[l]}</span> {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Game Name</label>
              <input type="text" placeholder="e.g. Gates of Olympus" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Provider</label>
              <select className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none">
                {PROVIDERS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">RTP %</label>
              <input type="number" step="0.01" placeholder="96.50" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Game Type</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABELS) as GameType[]).map(t => (
                <button key={t} onClick={() => setGameType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-colors ${gameType === t ? "border-[#2D1783] bg-[#2D1783] text-white" : "border-[#E5E8F0] text-[#787585] hover:border-[#2D1783]"}`}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Volatility</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as Volatility[]).map(v => (
                <button key={v} onClick={() => setVolatility(v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${volatility === v ? "border-[#2D1783] bg-[#2D1783] text-white" : "border-[#E5E8F0] text-[#787585] hover:border-[#2D1783]"}`}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Min Bet (€)</label>
              <input type="number" step="0.01" placeholder="0.20" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Max Bet (€)</label>
              <input type="number" placeholder="100" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
            {gameType === "slot" && (
              <div>
                <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Paylines</label>
                <input type="number" placeholder="20" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Demo URL</label>
              <input type="url" placeholder="https://..." className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
          </div>

          {/* Thumbnail upload */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Thumbnail</label>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false) }}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${isDragging ? "border-[#2D1783] bg-[#2D1783]/5" : "border-[#E5E8F0] hover:border-[#2D1783]"}`}>
              <span className="material-symbols-outlined text-[#E5E8F0] text-[32px]">image</span>
              <p className="text-xs text-[#787585] font-semibold">Drag & drop or click to upload</p>
            </div>
          </div>

          {/* Available at casinos */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Available at Casinos</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl p-3">
              {CASINOS.map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded accent-[#2D1783]" />
                  <span className="text-xs font-medium text-[#474554] truncate">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Description ({activeLang.toUpperCase()})</label>
            <textarea rows={3} className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-3 text-sm focus:border-[#2D1783] focus:outline-none resize-none" placeholder="Game description..." />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E8F0] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl hover:border-[#2D1783] transition-colors">Cancel</button>
          <button className="px-5 py-2 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] transition-colors">Save Game</button>
        </div>
      </aside>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminGamesPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<GameType | "all">("all")
  const [providerFilter, setProviderFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)

  const filtered = MOCK_GAMES.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.provider.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || g.type === typeFilter
    const matchProv = providerFilter === "all" || g.provider === providerFilter
    return matchSearch && matchType && matchProv
  })

  const activeProviders = [...new Set(MOCK_GAMES.map(g => g.provider))].sort()

  return (
    <div className="space-y-5">
      {showForm && <GameForm onClose={() => setShowForm(false)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Games</h1>
          <p className="text-sm text-[#787585] mt-0.5">{MOCK_GAMES.length} total games</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Game
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] text-[18px]">search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search games..."
            className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl pl-9 pr-4 py-2 text-sm focus:border-[#2D1783] focus:outline-none transition-colors" />
        </div>
        <select value={providerFilter} onChange={e => setProviderFilter(e.target.value)}
          className="bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2 text-sm focus:border-[#2D1783] focus:outline-none">
          <option value="all">All Providers</option>
          {activeProviders.map(p => <option key={p}>{p}</option>)}
        </select>
        <div className="flex flex-wrap gap-1">
          {(["all", ...Object.keys(TYPE_LABELS)] as (GameType | "all")[]).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${typeFilter === t ? "bg-[#2D1783] text-white" : "bg-[#F8F9FD] text-[#787585] hover:text-[#1b1b1c]"}`}>
              {t === "all" ? "All" : TYPE_LABELS[t as GameType]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E8F0] bg-[#F8F9FD]">
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Thumbnail</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">RTP</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Volatility</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8F0]">
              {filtered.map(game => (
                <tr key={game.id} className="hover:bg-[#F8F9FD] transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-[#2D1783]/10 to-[#2D1783]/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#2D1783]/30 text-[16px]">sports_esports</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#1b1b1c] whitespace-nowrap">{game.name}</td>
                  <td className="px-4 py-3 text-sm text-[#474554]">{game.provider}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_STYLES[game.type]}`}>{TYPE_LABELS[game.type]}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#1b1b1c]">{game.rtp}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${VOL_STYLES[game.volatility]}`}>
                      {game.volatility.charAt(0).toUpperCase() + game.volatility.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${game.isActive ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                      {game.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setShowForm(true)} className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[13px] text-[#474554]">edit</span>
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#E74C3C] transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[13px] text-[#787585]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
