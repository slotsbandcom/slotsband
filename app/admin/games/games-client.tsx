"use client"

import { useState } from "react"
import type { Casino, Game } from "@/lib/types"

type GameType = "slot" | "live" | "table" | "jackpot" | "other"

const TYPE_LABELS: Record<GameType, string> = {
  slot: "Slot",
  live: "Live",
  table: "Table",
  jackpot: "Jackpot",
  other: "Other",
}

const TYPE_STYLES: Record<GameType, string> = {
  slot:    "bg-[#2D1783]/10 text-[#2D1783]",
  live:    "bg-[#27AE60]/10 text-[#27AE60]",
  table:   "bg-[#FFD700]/20 text-[#775900]",
  jackpot: "bg-orange-100 text-orange-700",
  other:   "bg-[#E5E8F0] text-[#787585]",
}

const VOL_STYLES: Record<string, string> = {
  low:    "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high:   "bg-red-100 text-red-700",
}

// ─── Game Form Slide-Over ─────────────────────────────────────────────────────
function GameForm({ onClose, casinos }: { onClose: () => void; casinos: Casino[] }) {
  const [gameType, setGameType] = useState<GameType>("slot")

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8F0]">
          <h2 className="font-display font-bold text-lg text-[#1b1b1c]">Add Game</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Game name + slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Game Name</label>
              <input className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" placeholder="e.g. Sweet Bonanza" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Slug</label>
              <input className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" placeholder="sweet-bonanza" />
            </div>
          </div>

          {/* Provider */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Provider</label>
            <input className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" placeholder="e.g. Pragmatic Play" />
          </div>

          {/* Game type */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-2">Game Type</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABELS) as GameType[]).map(t => (
                <button key={t} type="button" onClick={() => setGameType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${gameType === t ? "bg-[#2D1783] text-white border-[#2D1783]" : "bg-white text-[#474554] border-[#E5E8F0] hover:border-[#2D1783]"}`}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* RTP + Volatility */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">RTP (%)</label>
              <input type="number" step="0.01" min="0" max="100" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" placeholder="96.50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Volatility</label>
              <select className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none">
                <option value="">Select...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Thumbnail URL</label>
            <input className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" placeholder="https://..." />
          </div>

          {/* Demo URL */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Demo URL (optional)</label>
            <input className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" placeholder="https://..." />
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Active", key: "is_active" },
              { label: "Featured", key: "is_featured" },
            ].map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={f.key === "is_active"} className="w-4 h-4 accent-[#2D1783]" />
                <span className="text-sm text-[#474554] font-medium">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E8F0] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[#E5E8F0] text-sm font-semibold text-[#474554] hover:border-[#2D1783] transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-[#2D1783] text-white text-sm font-bold hover:bg-[#3e2db2] transition-colors">
            Save Game
          </button>
        </div>
      </aside>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminGamesPage({
  games = [],
  casinos = [],
}: {
  games?: Game[]
  casinos?: Casino[]
}) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<GameType | "all">("all")
  const [providerFilter, setProviderFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)

  const filtered = games.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.provider.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || g.type === typeFilter
    const matchProv = providerFilter === "all" || g.provider === providerFilter
    return matchSearch && matchType && matchProv
  })

  const activeProviders = [...new Set(games.map(g => g.provider))].sort()

  return (
    <div className="space-y-5">
      {showForm && <GameForm onClose={() => setShowForm(false)} casinos={casinos} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Games</h1>
          <p className="text-sm text-[#787585] mt-0.5">{games.length} total games</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2D1783] text-white text-sm font-bold rounded-xl hover:bg-[#3e2db2] transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Game
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-[#787585]">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search games or providers..."
            className="w-full pl-9 pr-3 py-2 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl text-sm focus:border-[#2D1783] focus:outline-none"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as GameType | "all")}
          className="bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2 text-sm focus:border-[#2D1783] focus:outline-none"
        >
          <option value="all">All Types</option>
          {(Object.entries(TYPE_LABELS) as [GameType, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={providerFilter}
          onChange={e => setProviderFilter(e.target.value)}
          className="bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2 text-sm focus:border-[#2D1783] focus:outline-none"
        >
          <option value="all">All Providers</option>
          {activeProviders.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#787585]">
            <span className="material-symbols-outlined text-4xl mb-2 block">casino</span>
            <p className="font-semibold">No games found</p>
            <p className="text-sm mt-1">Add your first game to get started</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FD] border-b border-[#E5E8F0]">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-[#474554]">Game</th>
                <th className="text-left px-4 py-3 font-bold text-[#474554]">Provider</th>
                <th className="text-left px-4 py-3 font-bold text-[#474554]">Type</th>
                <th className="text-left px-4 py-3 font-bold text-[#474554]">RTP</th>
                <th className="text-left px-4 py-3 font-bold text-[#474554]">Volatility</th>
                <th className="text-left px-4 py-3 font-bold text-[#474554]">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F5]">
              {filtered.map(game => (
                <tr key={game.id} className="hover:bg-[#FAFBFF] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {game.thumbnail ? (
                        <img src={game.thumbnail} alt={game.name} className="w-9 h-9 rounded-lg object-cover bg-[#F0F1F5]" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-[#F0F1F5] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px] text-[#787585]">casino</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#1b1b1c]">{game.name}</p>
                        <p className="text-xs text-[#787585]">{game.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#474554]">{game.provider}</td>
                  <td className="px-4 py-3">
                    {game.type && (
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold ${TYPE_STYLES[game.type as GameType] ?? "bg-[#E5E8F0] text-[#787585]"}`}>
                        {TYPE_LABELS[game.type as GameType] ?? game.type}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#474554] font-medium">
                    {game.rtp != null ? `${Number(game.rtp).toFixed(2)}%` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {game.volatility ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold capitalize ${VOL_STYLES[game.volatility] ?? "bg-[#E5E8F0] text-[#787585]"}`}>
                        {game.volatility}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${game.is_active ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${game.is_active ? "bg-[#27AE60]" : "bg-[#B0B4C0]"}`} />
                      {game.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {game.is_featured && (
                        <span title="Featured" className="w-7 h-7 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-[#775900]">star</span>
                        </span>
                      )}
                      <button className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
                        <span className="material-symbols-outlined text-[14px] text-[#474554]">edit</span>
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[14px] text-[#474554]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      <p className="text-xs text-[#787585] text-right">
        Showing {filtered.length} of {games.length} games
      </p>
    </div>
  )
}
