"use client"

import { useState } from "react"

type SubLang = "fi" | "en" | "uk"
type SubStatus = "active" | "unsubscribed"

interface Subscriber {
  id: string
  email: string
  lang: SubLang
  date: string
  status: SubStatus
}

const LANG_FLAGS: Record<SubLang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }

const LANG_STATS_META: { lang: SubLang; label: string; color: string; bg: string }[] = [
  { lang: "fi", label: "Finnish",   color: "#2D1783", bg: "#2D1783" },
  { lang: "en", label: "English",   color: "#27AE60", bg: "#27AE60" },
  { lang: "uk", label: "Ukrainian", color: "#FFD700", bg: "#FFD700" },
]

export default function AdminNewsletterPage({ subscribers = [] }: { subscribers?: Subscriber[] }) {
  const [search, setSearch] = useState("")
  const [langFilter, setLangFilter] = useState<SubLang | "all">("all")
  const [statusFilter, setStatusFilter] = useState<SubStatus | "all">("all")
  const [selected, setSelected] = useState<string[]>([])

  const filtered = subscribers.filter(s => {
    const matchSearch = s.email.toLowerCase().includes(search.toLowerCase())
    const matchLang = langFilter === "all" || s.lang === langFilter
    const matchStatus = statusFilter === "all" || s.status === statusFilter
    return matchSearch && matchLang && matchStatus
  })

  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(s => s.id))
  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const currentMonth = new Date().toISOString().slice(0, 7)
  const total = subscribers.length
  const activeCount = subscribers.filter(s => s.status === "active").length
  const thisMonth = subscribers.filter(s => s.date.startsWith(currentMonth)).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Newsletter</h1>
          <p className="text-sm text-[#787585] mt-0.5">{total} total subscribers</p>
        </div>
        <button
          onClick={() => {
            const csv = ["email,language,date,status", ...subscribers.map(s => `${s.email},${s.lang},${s.date},${s.status}`)].join("\n")
            const blob = new Blob([csv], { type: "text/csv" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click()
            URL.revokeObjectURL(url)
          }}
          className="flex items-center gap-2 bg-white border border-[#E5E8F0] text-[#2D1783] font-semibold text-sm px-5 py-2.5 rounded-xl hover:border-[#2D1783] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
          <div className="w-10 h-10 rounded-xl bg-[#2D1783]/10 text-[#2D1783] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[20px]">group</span>
          </div>
          <p className="font-display font-bold text-2xl text-[#1b1b1c]">{total}</p>
          <p className="text-xs text-[#787585] mt-1">Total subscribers</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
          <div className="w-10 h-10 rounded-xl bg-[#27AE60]/10 text-[#27AE60] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <p className="font-display font-bold text-2xl text-[#1b1b1c]">{activeCount}</p>
          <p className="text-xs text-[#787585] mt-1">Active subscribers</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
          <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 text-[#775900] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          </div>
          <p className="font-display font-bold text-2xl text-[#1b1b1c]">{thisMonth}</p>
          <p className="text-xs text-[#787585] mt-1">This month</p>
        </div>

        {/* Language distribution mini-chart */}
        <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
          <p className="text-xs font-bold text-[#787585] uppercase tracking-wider mb-3">By Language</p>
          <div className="space-y-2">
            {LANG_STATS_META.map(ls => {
              const count = subscribers.filter(s => s.lang === ls.lang).length
              return (
                <div key={ls.lang} className="flex items-center gap-2">
                  <span className="text-sm">{LANG_FLAGS[ls.lang]}</span>
                  <div className="flex-1 h-1.5 bg-[#E5E8F0] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%", backgroundColor: ls.color }} />
                  </div>
                  <span className="text-xs font-bold text-[#474554] w-4 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] text-[18px]">search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email..."
            className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl pl-9 pr-4 py-2 text-sm focus:border-[#2D1783] focus:outline-none transition-colors" />
        </div>
        <div className="flex gap-1">
          {(["all", "fi", "en", "uk"] as (SubLang | "all")[]).map(l => (
            <button key={l} onClick={() => setLangFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${langFilter === l ? "bg-[#2D1783] text-white" : "bg-[#F8F9FD] text-[#787585] hover:text-[#1b1b1c]"}`}>
              {l === "all" ? "All" : LANG_FLAGS[l as SubLang]}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "active", "unsubscribed"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s ? "bg-[#2D1783] text-white" : "bg-[#F8F9FD] text-[#787585] hover:text-[#1b1b1c]"}`}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-[#787585]">{selected.length} selected</span>
            <button className="text-xs bg-[#E74C3C]/10 text-[#E74C3C] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#E74C3C]/20 transition-colors">Delete selected</button>
            <button className="text-xs bg-[#F8F9FD] text-[#2D1783] border border-[#E5E8F0] font-semibold px-3 py-1.5 rounded-lg hover:border-[#2D1783] transition-colors">Export selected</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E8F0] bg-[#F8F9FD]">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-4 h-4 rounded accent-[#2D1783]" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Language</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Subscribed</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8F0]">
              {filtered.map(sub => (
                <tr key={sub.id} className="hover:bg-[#F8F9FD] transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(sub.id)} onChange={() => toggle(sub.id)} className="w-4 h-4 rounded accent-[#2D1783]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#2D1783]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#2D1783] text-xs font-bold">{sub.email[0].toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-[#1b1b1c]">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-lg">{LANG_FLAGS[sub.lang]}</td>
                  <td className="px-4 py-3 text-xs text-[#787585]">{sub.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sub.status === "active" ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                      {sub.status === "active" ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#E74C3C] transition-colors" title="Unsubscribe">
                        <span className="material-symbols-outlined text-[13px] text-[#787585]">unsubscribe</span>
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
        <div className="px-5 py-3 border-t border-[#E5E8F0] flex items-center justify-between">
          <p className="text-xs text-[#787585]">Showing {filtered.length} of {subscribers.length} subscribers</p>
        </div>
      </div>
    </div>
  )
}
