"use client"

import { useState } from "react"
import { CASINOS, BONUSES } from "@/lib/data"

type BonusType = "welcome" | "no_deposit" | "free_spins" | "cashback" | "reload"
type Lang = "fi" | "en" | "uk"

const TYPE_LABELS: Record<BonusType, string> = {
  welcome: "Welcome",
  no_deposit: "No Deposit",
  free_spins: "Free Spins",
  cashback: "Cashback",
  reload: "Reload",
}

const TYPE_STYLES: Record<BonusType, string> = {
  welcome:    "bg-[#2D1783]/10 text-[#2D1783]",
  no_deposit: "bg-[#27AE60]/10 text-[#27AE60]",
  free_spins: "bg-[#FFD700]/20 text-[#775900]",
  cashback:   "bg-[#3e2db2]/10 text-[#3e2db2]",
  reload:     "bg-[#E5E8F0] text-[#787585]",
}

const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }

// ─── Form ─────────────────────────────────────────────────────────────────────
function BonusForm({ onClose }: { onClose: () => void }) {
  const [activeLang, setActiveLang] = useState<Lang>("fi")
  const [bonusType, setBonusType] = useState<BonusType>("welcome")
  const [casinoSearch, setCasinoSearch] = useState("")
  const [selectedCasino, setSelectedCasino] = useState("")
  const [showCasinoDrop, setShowCasinoDrop] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)

  const casinoMatches = CASINOS.filter(c =>
    c.name.toLowerCase().includes(casinoSearch.toLowerCase())
  ).slice(0, 6)

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8F0]">
          <h2 className="font-display font-bold text-lg text-[#1b1b1c]">Add Bonus</h2>
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
          {/* Casino picker */}
          <div className="relative">
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Casino</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] text-[18px]">search</span>
              <input
                type="text"
                value={selectedCasino || casinoSearch}
                onChange={e => { setCasinoSearch(e.target.value); setSelectedCasino(""); setShowCasinoDrop(true) }}
                onFocus={() => setShowCasinoDrop(true)}
                placeholder="Search casino..."
                className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
              />
            </div>
            {showCasinoDrop && casinoMatches.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E5E8F0] rounded-xl shadow-lg overflow-hidden">
                {casinoMatches.map(c => (
                  <button key={c.id} onMouseDown={() => { setSelectedCasino(c.name); setCasinoSearch(""); setShowCasinoDrop(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F8F9FD] flex items-center gap-2 transition-colors">
                    <span className="material-symbols-outlined text-[#2D1783] text-[16px]">casino</span>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bonus type */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Bonus Type</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABELS) as BonusType[]).map(t => (
                <button key={t} onClick={() => setBonusType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-colors ${bonusType === t ? "border-[#2D1783] bg-[#2D1783] text-white" : "border-[#E5E8F0] text-[#787585] hover:border-[#2D1783]"}`}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Amount</label>
              <input type="text" placeholder="e.g. 100% / 500€" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Wagering (xB)</label>
              <input type="number" placeholder="e.g. 35" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Min Deposit (€)</label>
              <input type="number" placeholder="e.g. 20" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Max Bonus (€)</label>
              <input type="number" placeholder="e.g. 500" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
            {(bonusType === "free_spins" || bonusType === "welcome") && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Free Spins Count</label>
                  <input type="number" placeholder="e.g. 100" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Free Spins Game</label>
                  <input type="text" placeholder="e.g. Book of Dead" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Valid From</label>
              <input type="date" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Valid Until</label>
              <input type="date" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Description ({activeLang.toUpperCase()})</label>
            <textarea rows={4} className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-3 text-sm focus:border-[#2D1783] focus:outline-none resize-none" placeholder="Bonus description..." />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Terms</label>
            <textarea rows={3} className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-3 text-sm focus:border-[#2D1783] focus:outline-none resize-none" placeholder="T&Cs apply..." />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsFeatured(!isFeatured)}
              className={`w-10 h-6 rounded-full transition-colors ${isFeatured ? "bg-[#2D1783]" : "bg-[#E5E8F0]"} relative flex-shrink-0`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isFeatured ? "left-5" : "left-1"}`} />
            </div>
            <span className="text-sm font-semibold text-[#1b1b1c]">Featured bonus</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E8F0] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl hover:border-[#2D1783] transition-colors">Cancel</button>
          <button className="px-5 py-2 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] transition-colors">Save Bonus</button>
        </div>
      </aside>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminBonusesPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<BonusType | "all">("all")
  const [showForm, setShowForm] = useState(false)

  const filtered = BONUSES.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.casino_name ?? "").toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || b.bonus_type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="space-y-5">
      {showForm && <BonusForm onClose={() => setShowForm(false)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Bonuses</h1>
          <p className="text-sm text-[#787585] mt-0.5">{BONUSES.length} total bonuses</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Bonus
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] text-[18px]">search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bonuses..."
            className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl pl-9 pr-4 py-2 text-sm focus:border-[#2D1783] focus:outline-none transition-colors" />
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", ...Object.keys(TYPE_LABELS)] as (BonusType | "all")[]).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${typeFilter === t ? "bg-[#2D1783] text-white" : "bg-[#F8F9FD] text-[#787585] hover:text-[#1b1b1c]"}`}>
              {t === "all" ? "All" : TYPE_LABELS[t as BonusType]}
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
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Casino</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Bonus</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Wagering</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Min Dep</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Featured</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8F0]">
              {filtered.map(bonus => (
                <tr key={bonus.id} className="hover:bg-[#F8F9FD] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#F0EDEE] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#2D1783] text-[15px]">casino</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1b1b1c] whitespace-nowrap">{bonus.casino_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-sm text-[#474554] truncate">{bonus.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_STYLES[bonus.bonus_type]}`}>
                      {TYPE_LABELS[bonus.bonus_type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#1b1b1c]">{bonus.amount ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-[#474554]">{bonus.wagering != null ? `${bonus.wagering}x` : "—"}</td>
                  <td className="px-4 py-3 text-sm text-[#474554]">{bonus.min_deposit != null ? `€${bonus.min_deposit}` : "—"}</td>
                  <td className="px-4 py-3">
                    {bonus.is_featured
                      ? <span className="material-symbols-outlined text-[#FFD700] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      : <span className="material-symbols-outlined text-[#E5E8F0] text-[18px]">star</span>}
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
