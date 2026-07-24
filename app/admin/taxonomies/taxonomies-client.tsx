"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface TaxonomyTerm {
  id: string
  taxonomy: string
  slug_fi: string
  slug_en: string
  slug_uk: string
  name_fi: string
  name_en: string | null
  name_uk: string | null
  description_fi: string | null
  description_en: string | null
  description_uk: string | null
  icon: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  wp_term_id: number | null
  created_at: string
  casino_count: number
}

interface Casino {
  id: string
  name: string
  slug: string
  is_active: boolean
  assigned: boolean
}

const TAXONOMIES = [
  "casino-category",
  "bonus-category",
  "deposit-method",
  "withdrawal-method",
  "software",
  "vendor",
  "licence",
  "game-category",
]

const TAXONOMY_LABELS: Record<string, string> = {
  "casino-category": "Casino Categories",
  "bonus-category": "Bonus Categories",
  "deposit-method": "Deposit Methods",
  "withdrawal-method": "Withdrawal Methods",
  "software": "Software",
  "vendor": "Vendors",
  "licence": "Licences",
  "game-category": "Game Categories",
}

// ─── Manage Casinos Panel ─────────────────────────────────────────────────────
function ManageCasinosPanel({
  term,
  onClose,
  onSaved,
}: {
  term: TaxonomyTerm
  onClose: () => void
  onSaved: () => void
}) {
  const [casinos, setCasinos] = useState<Casino[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/taxonomy-terms/${term.id}/casinos`)
      .then(r => r.json())
      .then((data: Casino[]) => {
        setCasinos(data)
        setSelected(new Set(data.filter(c => c.assigned).map(c => c.id)))
        setLoading(false)
      })
      .catch(() => { setError("Failed to load casinos"); setLoading(false) })
  }, [term.id])

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/taxonomy-terms/${term.id}/casinos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ casino_ids: Array.from(selected) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Save failed")
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
      setSaving(false)
    }
  }

  const filtered = casinos.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase())
  )

  const allFilteredSelected = filtered.length > 0 && filtered.every(c => selected.has(c.id))

  const toggleAllFiltered = () => {
    setSelected(prev => {
      const next = new Set(prev)
      if (allFilteredSelected) filtered.forEach(c => next.delete(c.id))
      else filtered.forEach(c => next.add(c.id))
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8F0]">
          <div>
            <h2 className="font-display font-bold text-lg text-[#1b1b1c]">Manage Casinos</h2>
            <p className="text-xs text-[#787585] mt-0.5">{term.name_fi} · {selected.size} selected</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-[#E5E8F0]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] text-[16px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search casinos..."
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
            />
          </div>
        </div>

        {/* Toggle all */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-2 border-b border-[#E5E8F0] flex items-center justify-between">
            <span className="text-xs text-[#787585]">{filtered.length} casino{filtered.length !== 1 ? "s" : ""}</span>
            <button onClick={toggleAllFiltered} className="text-xs font-semibold text-[#2D1783] hover:underline">
              {allFilteredSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <span className="w-6 h-6 border-2 border-[#2D1783]/30 border-t-[#2D1783] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[#787585] text-sm">No casinos found</div>
          ) : (
            <ul className="divide-y divide-[#E5E8F0]">
              {filtered.map(casino => (
                <li key={casino.id}>
                  <label className="flex items-center gap-3 px-6 py-3 hover:bg-[#F8F9FD] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selected.has(casino.id)}
                      onChange={() => toggle(casino.id)}
                      className="w-4 h-4 accent-[#2D1783] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1b1b1c] truncate">{casino.name}</p>
                      <p className="text-xs text-[#787585] font-mono truncate">{casino.slug}</p>
                    </div>
                    {!casino.is_active && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#E5E8F0] text-[#787585] rounded">inactive</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="px-6 py-2">
            <p className="text-xs text-[#E74C3C] bg-[#E74C3C]/8 border border-[#E74C3C]/25 rounded-xl px-4 py-2.5">{error}</p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-[#E5E8F0] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl hover:border-[#2D1783] transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving..." : `Save (${selected.size} casinos)`}
          </button>
        </div>
      </aside>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminTaxonomiesClient({
  terms = [],
  initialTab,
}: {
  terms?: TaxonomyTerm[]
  initialTab?: string
}) {
  const router = useRouter()
  const [activeTaxonomy, setActiveTaxonomy] = useState(
    initialTab && TAXONOMIES.includes(initialTab) ? initialTab : TAXONOMIES[0]
  )
  const [managingTerm, setManagingTerm] = useState<TaxonomyTerm | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleCasinosSaved = () => {
    setManagingTerm(null)
    router.refresh()
    showToast("Casino assignments saved")
  }

  const handleDelete = async (term: TaxonomyTerm) => {
    if (!confirm(`Delete "${term.name_fi}"? This will also remove all casino associations.`)) return
    const res = await fetch(`/api/admin/taxonomy-terms/${term.id}`, { method: "DELETE" })
    if (res.ok) {
      router.refresh()
      showToast("Term deleted")
    } else {
      const json = await res.json()
      alert(json.error ?? "Delete failed")
    }
  }

  const visibleTerms = terms.filter(t => t.taxonomy === activeTaxonomy)

  return (
    <div className="space-y-5">
      {managingTerm && (
        <ManageCasinosPanel
          term={managingTerm}
          onClose={() => setManagingTerm(null)}
          onSaved={handleCasinosSaved}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#27AE60] text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Taxonomies</h1>
          <p className="text-sm text-[#787585] mt-0.5">{terms.length} terms across {TAXONOMIES.length} taxonomies</p>
        </div>
        <button
          onClick={() => router.push(`/admin/taxonomies/new?taxonomy=${activeTaxonomy}`)}
          className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Term
        </button>
      </div>

      {/* Taxonomy tabs */}
      <div className="flex flex-wrap gap-1 bg-white border border-[#E5E8F0] rounded-2xl p-1.5">
        {TAXONOMIES.map(tax => {
          const count = terms.filter(t => t.taxonomy === tax).length
          const isActive = activeTaxonomy === tax
          return (
            <button
              key={tax}
              onClick={() => setActiveTaxonomy(tax)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-[#2D1783] text-white"
                  : "text-[#787585] hover:bg-[#F8F9FD] hover:text-[#1b1b1c]"
              }`}
            >
              {TAXONOMY_LABELS[tax]}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-[#E5E8F0] text-[#787585]"}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
        {visibleTerms.length === 0 ? (
          <div className="text-center py-16 text-[#787585]">
            <span className="material-symbols-outlined text-[48px] block mb-3 opacity-30">label</span>
            <p className="font-semibold">No terms in {TAXONOMY_LABELS[activeTaxonomy]}</p>
            <p className="text-sm mt-1">Click "Add Term" to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E8F0] bg-[#F8F9FD]">
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Term</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Langs</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Casinos</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8F0]">
                {visibleTerms.map(term => (
                  <tr key={term.id} className="hover:bg-[#F8F9FD] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {term.icon ? (
                          <div className="w-8 h-8 rounded-lg bg-[#2D1783]/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[#2D1783] text-[15px]">{term.icon}</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#E5E8F0] flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[#787585] text-[15px]">label</span>
                          </div>
                        )}
                        <span className="text-sm font-semibold text-[#1b1b1c]">{term.name_fi}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-mono text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded">{term.slug_fi}</span>
                        {term.slug_en !== term.slug_fi && (
                          <span className="text-[10px] font-mono text-[#787585]/60">{term.slug_en}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span title="Finnish" className={term.name_fi ? "opacity-100" : "opacity-25"}>🇫🇮</span>
                        <span title="English" className={term.name_en ? "opacity-100" : "opacity-25"}>🇬🇧</span>
                        <span title="Ukrainian" className={term.name_uk ? "opacity-100" : "opacity-25"}>🇺🇦</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        term.casino_count > 0
                          ? "bg-[#2D1783]/10 text-[#2D1783]"
                          : "bg-[#E5E8F0] text-[#787585]"
                      }`}>
                        <span className="material-symbols-outlined text-[11px]">casino</span>
                        {term.casino_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#787585]">{term.sort_order}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${term.is_active ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                        {term.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setManagingTerm(term)}
                          className="h-7 px-2 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center gap-1 hover:border-[#2D1783] transition-colors text-[11px] font-semibold text-[#474554] whitespace-nowrap"
                          title="Manage casinos"
                        >
                          <span className="material-symbols-outlined text-[12px]">casino</span>
                          Casinos
                        </button>
                        <button
                          onClick={() => router.push(`/admin/taxonomies/${term.id}/edit`)}
                          className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#474554]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(term)}
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
    </div>
  )
}
