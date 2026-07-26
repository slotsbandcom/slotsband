"use client"

import { useState, useMemo, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Casino } from "@/lib/types"
import { CasinoLogo } from "@/components/casino-logo"
import type { ClickStats } from "./page"

type SortCol = "name" | "rank" | "rating" | "status" | "clicks"
type SortDir = "asc" | "desc"
type Filter  = "all" | "active" | "inactive" | "featured"

const FILTER_LABELS: Record<Filter, string> = {
  all:      "All",
  active:   "Active",
  inactive: "Inactive",
  featured: "Featured",
}

const DEFAULT_SORT_DIR: Record<SortCol, SortDir> = {
  name:   "asc",
  rank:   "asc",
  rating: "desc",
  status: "desc",
  clicks: "desc",
}

type QuickEdit = {
  id: string; slug: string; name: string
  affiliateUrl: string; rank: string
  saving: boolean; error: string | null
}

function isValidUrl(url: string) {
  try {
    const u = new URL(url)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch { return false }
}

export default function AdminCasinosClient({ casinos, clickStats }: { casinos: Casino[]; clickStats: ClickStats }) {
  const router = useRouter()
  const [search,    setSearch]    = useState("")
  const [filter,    setFilter]    = useState<Filter>("all")
  const [sortCol,   setSortCol]   = useState<SortCol | null>(null)
  const [sortDir,   setSortDir]   = useState<SortDir>("desc")
  const [selected,  setSelected]  = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [overrides, setOverrides] = useState<Record<string, { affiliate_url?: string; rank?: number }>>({})
  const [quickEdit, setQuickEdit] = useState<QuickEdit | null>(null)

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortCol(col)
      setSortDir(DEFAULT_SORT_DIR[col])
    }
  }

  const filterCounts = useMemo(() => ({
    all:      casinos.length,
    active:   casinos.filter(c => c.is_active).length,
    inactive: casinos.filter(c => !c.is_active).length,
    featured: casinos.filter(c => c.is_featured).length,
  }), [casinos])

  const displayed = useMemo(() => {
    let list = casinos.filter(c => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.slug.toLowerCase().includes(q) &&
          !(c.license_authority?.toLowerCase().includes(q))
        ) return false
      }
      if (filter === "active")   return c.is_active
      if (filter === "inactive") return !c.is_active
      if (filter === "featured") return c.is_featured
      return true
    })

    if (sortCol) {
      list = [...list].sort((a, b) => {
        let cmp = 0
        if (sortCol === "name")   cmp = a.name.localeCompare(b.name)
        if (sortCol === "rank")   cmp = (a.rank ?? 999) - (b.rank ?? 999)
        if (sortCol === "rating") cmp = (a.rating ?? 0) - (b.rating ?? 0)
        if (sortCol === "status") cmp = Number(a.is_active) - Number(b.is_active)
        if (sortCol === "clicks") cmp = (clickStats[a.slug]?.total ?? 0) - (clickStats[b.slug]?.total ?? 0)
        return sortDir === "asc" ? cmp : -cmp
      })
    }

    return list
  }, [casinos, search, filter, sortCol, sortDir])

  const toggleAll = () => {
    setSelected(selected.length === displayed.length ? [] : displayed.map(c => c.id))
  }

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this casino?")) return
    await fetch(`/api/admin/casinos/${id}`, { method: "DELETE" })
    startTransition(() => router.refresh())
  }

  function openQuickEdit(casino: Casino) {
    setQuickEdit({
      id: casino.id,
      slug: casino.slug,
      name: casino.name,
      affiliateUrl: overrides[casino.id]?.affiliate_url ?? casino.affiliate_url ?? "",
      rank: String(overrides[casino.id]?.rank ?? casino.rank ?? ""),
      saving: false,
      error: null,
    })
  }

  async function handleQuickSave() {
    if (!quickEdit) return
    if (!isValidUrl(quickEdit.affiliateUrl)) {
      setQuickEdit(qe => qe ? { ...qe, error: "URL must start with http:// or https://" } : null)
      return
    }
    setQuickEdit(qe => qe ? { ...qe, saving: true, error: null } : null)
    const rankVal = parseInt(quickEdit.rank)
    const body: Record<string, unknown> = { affiliate_url: quickEdit.affiliateUrl }
    if (!isNaN(rankVal) && rankVal > 0) body.rank = rankVal
    const res = await fetch(`/api/admin/casinos/${quickEdit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setQuickEdit(qe => qe ? { ...qe, saving: false, error: (json as { error?: string }).error ?? "Save failed" } : null)
      return
    }
    setOverrides(prev => ({
      ...prev,
      [quickEdit.id]: {
        ...prev[quickEdit.id],
        affiliate_url: quickEdit.affiliateUrl,
        ...((!isNaN(rankVal) && rankVal > 0) ? { rank: rankVal } : {}),
      },
    }))
    setQuickEdit(null)
    startTransition(() => router.refresh())
  }

  function sortTh(col: SortCol, label: string) {
    const active = sortCol === col
    return (
      <th
        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-colors hover:text-[#2D1783]"
        style={{ color: active ? "#2D1783" : "#787585" }}
        onClick={() => handleSort(col)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <span className={`text-[11px] ${active ? "text-[#2D1783]" : "text-[#C5C3CE]"}`}>
            {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
          </span>
        </span>
      </th>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Casinos</h1>
          <p className="text-sm text-[#787585] mt-0.5">
            {displayed.length === casinos.length
              ? `${casinos.length} total casinos`
              : `${displayed.length} of ${casinos.length} casinos`}
          </p>
        </div>
        <Link
          href="/admin/casinos/new"
          className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Casino
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] text-[18px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search casinos..."
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl pl-9 pr-4 py-2 text-sm focus:border-[#2D1783] focus:outline-none transition-colors"
            />
          </div>
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#787585]">{selected.length} selected</span>
              <button className="text-xs bg-[#27AE60]/10 text-[#27AE60] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#27AE60]/20 transition-colors">
                Activate
              </button>
              <button className="text-xs bg-[#E74C3C]/10 text-[#E74C3C] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#E74C3C]/20 transition-colors">
                Deactivate
              </button>
            </div>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "active", "inactive", "featured"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-[#2D1783] text-white shadow-sm"
                  : "bg-[#F8F9FD] border border-[#E5E8F0] text-[#787585] hover:text-[#1b1b1c] hover:border-[#2D1783]"
              }`}
            >
              {FILTER_LABELS[f]}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === f ? "bg-white/25 text-white" : "bg-[#E5E8F0] text-[#787585]"
              }`}>
                {filterCounts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
        {casinos.length === 0 ? (
          <div className="text-center py-16 text-[#787585]">
            <span className="material-symbols-outlined text-[48px] block mb-3 opacity-30">casino</span>
            <p className="font-semibold">No casinos yet</p>
            <p className="text-sm mt-1">Add your first casino to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E8F0] bg-[#F8F9FD]">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selected.length === displayed.length && displayed.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded accent-[#2D1783]"
                    />
                  </th>
                  {sortTh("name",   "Casino")}
                  {sortTh("rank",   "Rank")}
                  {sortTh("rating", "Rating")}
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">License</th>
                  {sortTh("status", "Status")}
                  {sortTh("clicks", "Clicks")}
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Flags</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8F0]">
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-[#787585]">
                      No casinos match your filter.
                    </td>
                  </tr>
                ) : displayed.map(casino => (
                  <tr
                    key={casino.id}
                    className={`hover:bg-[#F8F9FD] transition-colors ${isPending ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(casino.id)}
                        onChange={() => toggle(casino.id)}
                        className="w-4 h-4 rounded accent-[#2D1783]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <CasinoLogo
                          src={casino.logo_url}
                          name={casino.name}
                          size={32}
                          className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB]"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#1b1b1c]">{casino.name}</p>
                          <p className="text-xs text-[#787585]">{casino.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {(() => { const r = overrides[casino.id]?.rank ?? casino.rank; return r && r < 999 ? (
                        <span className="w-6 h-6 rounded-full bg-[#2D1783] text-white text-[10px] font-bold flex items-center justify-center">
                          {r}
                        </span>
                      ) : (
                        <span className="text-[#C5C3CE] text-sm">—</span>
                      ); })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#FFD700] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-sm font-bold text-[#1b1b1c]">{Number(casino.rating).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#474554]">{casino.license_authority ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        casino.is_active
                          ? "bg-[#27AE60]/10 text-[#27AE60]"
                          : "bg-[#E5E8F0] text-[#787585]"
                      }`}>
                        {casino.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const cs = clickStats[casino.slug]
                        const total = cs?.total ?? 0
                        const month = cs?.this_month ?? 0
                        return (
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-sm font-bold ${total > 0 ? "text-[#1b1b1c]" : "text-[#C5C3CE]"}`}>
                              {total.toLocaleString()}
                            </span>
                            {month > 0 && (
                              <span className="text-[10px] text-[#27AE60] font-semibold leading-none">
                                +{month.toLocaleString()} mo
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {casino.is_featured && (
                          <span className="material-symbols-outlined text-[#FFD700] text-[16px]" title="Featured" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        )}
                        {casino.is_new && (
                          <span className="material-symbols-outlined text-[#27AE60] text-[16px]" title="New" style={{ fontVariationSettings: "'FILL' 1" }}>new_releases</span>
                        )}
                        {casino.is_pikakasino && (
                          <span className="material-symbols-outlined text-[#2D1783] text-[16px]" title="Quick Casino" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/fi/nettikasinot/${casino.slug}`}
                          target="_blank"
                          className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors"
                          title="View"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#474554]">open_in_new</span>
                        </Link>
                        <button
                          onClick={() => openQuickEdit(casino)}
                          className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#F59E0B] transition-colors"
                          title="Quick Edit"
                        >
                          <span className="material-symbols-outlined text-[13px]" style={{ color: "#F59E0B" }}>bolt</span>
                        </button>
                        <Link
                          href={`/admin/casinos/${casino.slug}/edit`}
                          className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#474554]">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(casino.id)}
                          className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#E74C3C] transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#787585]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Edit Modal */}
      {quickEdit && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget && !quickEdit.saving) setQuickEdit(null) }}
        >
          <div className="bg-white rounded-2xl border border-[#E5E8F0] shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]" style={{ color: "#F59E0B" }}>bolt</span>
                  <h2 className="font-bold text-[#1b1b1c] text-base">Quick Edit</h2>
                </div>
                <p className="text-xs text-[#787585] mt-0.5 ml-6">{quickEdit.name}</p>
              </div>
              <button
                onClick={() => !quickEdit.saving && setQuickEdit(null)}
                className="w-7 h-7 rounded-lg hover:bg-[#F8F9FD] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-[#787585]">close</span>
              </button>
            </div>

            {quickEdit.error && (
              <p className="text-xs text-[#E74C3C] bg-[#E74C3C]/10 rounded-lg px-3 py-2">{quickEdit.error}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#787585] uppercase tracking-wider mb-1.5">
                  Raw Affiliate URL
                </label>
                <input
                  type="url"
                  value={quickEdit.affiliateUrl}
                  onChange={e => setQuickEdit(qe => qe ? { ...qe, affiliateUrl: e.target.value, error: null } : null)}
                  className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2 text-sm focus:border-[#2D1783] focus:outline-none transition-colors font-mono"
                  placeholder="https://..."
                  disabled={quickEdit.saving}
                  autoFocus
                />
                <p className="text-[10px] text-[#787585] mt-1">Generated URL (with UTMs) updates automatically on the edit page.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#787585] uppercase tracking-wider mb-1.5">
                  Rank
                </label>
                <input
                  type="number"
                  value={quickEdit.rank}
                  onChange={e => setQuickEdit(qe => qe ? { ...qe, rank: e.target.value } : null)}
                  className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2 text-sm focus:border-[#2D1783] focus:outline-none transition-colors"
                  placeholder="e.g. 1"
                  min={1}
                  disabled={quickEdit.saving}
                  onKeyDown={e => { if (e.key === "Enter") handleQuickSave() }}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => !quickEdit.saving && setQuickEdit(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] hover:border-[#787585] transition-colors disabled:opacity-50"
                disabled={quickEdit.saving}
              >
                Cancel
              </button>
              <button
                onClick={handleQuickSave}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2D1783] hover:bg-[#3e2db2] transition-colors disabled:opacity-60"
                disabled={quickEdit.saving}
              >
                {quickEdit.saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
