"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Lang = "fi" | "en" | "uk"

export interface TaxonomyTerm {
  id: string
  taxonomy: string
  slug: string
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

const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }

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

const ICONS = [
  "casino", "redeem", "sports_esports", "menu_book", "bolt", "new_releases",
  "star", "live_tv", "money_off", "shield", "category", "local_offer",
  "workspace_premium", "diamond", "emoji_events", "percent", "payments",
  "sports_score", "thumb_up", "verified",
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/å/g, "a")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── Term Form ────────────────────────────────────────────────────────────────
function TermForm({
  onClose,
  onSaved,
  editTerm,
  defaultTaxonomy,
}: {
  onClose: () => void
  onSaved: () => void
  editTerm?: TaxonomyTerm
  defaultTaxonomy: string
}) {
  const isEdit = !!editTerm

  const [activeLang, setActiveLang] = useState<Lang>("fi")
  const [taxonomy, setTaxonomy] = useState(editTerm?.taxonomy ?? defaultTaxonomy)
  const [nameFi, setNameFi] = useState(editTerm?.name_fi ?? "")
  const [nameEn, setNameEn] = useState(editTerm?.name_en ?? "")
  const [nameUk, setNameUk] = useState(editTerm?.name_uk ?? "")
  const [slug, setSlug] = useState(editTerm?.slug ?? "")
  const [slugManual, setSlugManual] = useState(isEdit)
  const [descFi, setDescFi] = useState(editTerm?.description_fi ?? "")
  const [descEn, setDescEn] = useState(editTerm?.description_en ?? "")
  const [descUk, setDescUk] = useState(editTerm?.description_uk ?? "")
  const [icon, setIcon] = useState(editTerm?.icon ?? "")
  const [imageUrl, setImageUrl] = useState(editTerm?.image_url ?? "")
  const [sortOrder, setSortOrder] = useState(String(editTerm?.sort_order ?? 0))
  const [isActive, setIsActive] = useState(editTerm?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const nameMap: Record<Lang, { val: string; set: (v: string) => void }> = {
    fi: { val: nameFi, set: (v) => { setNameFi(v); if (!slugManual) setSlug(slugify(v)) } },
    en: { val: nameEn, set: setNameEn },
    uk: { val: nameUk, set: setNameUk },
  }
  const descMap: Record<Lang, { val: string; set: (v: string) => void }> = {
    fi: { val: descFi, set: setDescFi },
    en: { val: descEn, set: setDescEn },
    uk: { val: descUk, set: setDescUk },
  }

  const handleSubmit = async () => {
    if (!nameFi.trim()) { setFormError("Name (FI) is required"); return }
    if (!slug.trim()) { setFormError("Slug is required"); return }
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        taxonomy,
        name_fi: nameFi.trim(),
        name_en: nameEn.trim() || null,
        name_uk: nameUk.trim() || null,
        slug: slug.trim(),
        description_fi: descFi.trim() || null,
        description_en: descEn.trim() || null,
        description_uk: descUk.trim() || null,
        icon: icon || null,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        sort_order: Number(sortOrder) || 0,
      }
      const res = await fetch(
        isEdit ? `/api/admin/taxonomy-terms/${editTerm!.id}` : "/api/admin/taxonomy-terms",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Save failed")
      onSaved()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8F0]">
          <h2 className="font-display font-bold text-lg text-[#1b1b1c]">
            {isEdit ? "Edit Term" : "Add Term"}
          </h2>
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
          {/* Taxonomy */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
              Taxonomy<span className="text-[#E74C3C] ml-0.5">*</span>
            </label>
            {isEdit ? (
              <div className="inline-flex items-center gap-1.5 bg-[#2D1783]/10 text-[#2D1783] text-xs font-bold px-3 py-1.5 rounded-lg">
                <span className="material-symbols-outlined text-[14px]">label</span>
                {TAXONOMY_LABELS[taxonomy] ?? taxonomy}
              </div>
            ) : (
              <select
                value={taxonomy}
                onChange={e => setTaxonomy(e.target.value)}
                className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
              >
                {TAXONOMIES.map(t => (
                  <option key={t} value={t}>{TAXONOMY_LABELS[t] ?? t}</option>
                ))}
              </select>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
              Name ({activeLang.toUpperCase()}){activeLang === "fi" && <span className="text-[#E74C3C] ml-0.5">*</span>}
            </label>
            <input
              type="text"
              value={nameMap[activeLang].val}
              onChange={e => nameMap[activeLang].set(e.target.value)}
              placeholder="Term name..."
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
              Slug<span className="text-[#E74C3C] ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="term-slug"
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none"
            />
            {!slugManual && nameFi && (
              <p className="text-[10px] text-[#787585] mt-1">Auto-generated from FI name</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
              Description ({activeLang.toUpperCase()})
            </label>
            <textarea
              rows={3}
              value={descMap[activeLang].val}
              onChange={e => descMap[activeLang].set(e.target.value)}
              placeholder="Term description..."
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-3 text-sm focus:border-[#2D1783] focus:outline-none resize-none"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setIcon(icon === ic ? "" : ic)} title={ic}
                  className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-colors ${icon === ic ? "border-[#2D1783] bg-[#2D1783]/10" : "border-[#E5E8F0] hover:border-[#2D1783]"}`}>
                  <span className="material-symbols-outlined text-[20px] text-[#2D1783]">{ic}</span>
                </button>
              ))}
            </div>
            {icon && <p className="text-[10px] text-[#787585] mt-1">Selected: <span className="font-mono">{icon}</span></p>}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
            />
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="w-32 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
            />
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setIsActive(v => !v)}
              className={`w-10 h-6 rounded-full transition-colors ${isActive ? "bg-[#2D1783]" : "bg-[#E5E8F0]"} relative flex-shrink-0`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? "left-5" : "left-1"}`} />
            </div>
            <span className="text-sm font-semibold text-[#1b1b1c]">Active</span>
          </label>

          {formError && (
            <p className="text-xs text-[#E74C3C] bg-[#E74C3C]/8 border border-[#E74C3C]/25 rounded-xl px-4 py-2.5">{formError}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E5E8F0] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl hover:border-[#2D1783] transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving..." : isEdit ? "Update Term" : "Save Term"}
          </button>
        </div>
      </aside>
    </div>
  )
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
export default function AdminTaxonomiesClient({ terms = [] }: { terms?: TaxonomyTerm[] }) {
  const router = useRouter()
  const [activeTaxonomy, setActiveTaxonomy] = useState(TAXONOMIES[0])
  const [showForm, setShowForm] = useState(false)
  const [editingTerm, setEditingTerm] = useState<TaxonomyTerm | null>(null)
  const [managingTerm, setManagingTerm] = useState<TaxonomyTerm | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditingTerm(null)
    router.refresh()
    showToast("Term saved successfully")
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
      {showForm && (
        <TermForm
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
          defaultTaxonomy={activeTaxonomy}
        />
      )}
      {editingTerm && (
        <TermForm
          editTerm={editingTerm}
          onClose={() => setEditingTerm(null)}
          onSaved={handleSaved}
          defaultTaxonomy={activeTaxonomy}
        />
      )}
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
          onClick={() => setShowForm(true)}
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
                      <span className="text-xs font-mono text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded">{term.slug}</span>
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
                          onClick={() => setEditingTerm(term)}
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
