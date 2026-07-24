"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Lang = "fi" | "en" | "uk"

export interface Category {
  id: string
  slug: string
  name_fi: string
  name_en: string | null
  name_uk: string | null
  description_fi: string | null
  description_en: string | null
  description_uk: string | null
  icon: string | null
  is_active: boolean
  sort_order: number
  created_at?: string
}

const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }

const ICONS = [
  "casino", "redeem", "sports_esports", "menu_book", "bolt", "new_releases",
  "star", "live_tv", "money_off", "shield", "category", "local_offer",
  "workspace_premium", "diamond", "emoji_events", "percent", "payments",
  "sports_score", "thumb_up", "verified",
]

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function CategoryForm({
  onClose,
  onSaved,
  editCategory,
}: {
  onClose: () => void
  onSaved: () => void
  editCategory?: Category
}) {
  const isEdit = !!editCategory

  const [activeLang, setActiveLang] = useState<Lang>("fi")
  const [nameFi, setNameFi] = useState(editCategory?.name_fi ?? "")
  const [nameEn, setNameEn] = useState(editCategory?.name_en ?? "")
  const [nameUk, setNameUk] = useState(editCategory?.name_uk ?? "")
  const [slug, setSlug] = useState(editCategory?.slug ?? "")
  const [slugManual, setSlugManual] = useState(isEdit)
  const [icon, setIcon] = useState(editCategory?.icon ?? "category")
  const [descFi, setDescFi] = useState(editCategory?.description_fi ?? "")
  const [descEn, setDescEn] = useState(editCategory?.description_en ?? "")
  const [descUk, setDescUk] = useState(editCategory?.description_uk ?? "")
  const [sortOrder, setSortOrder] = useState(String(editCategory?.sort_order ?? 0))
  const [isActive, setIsActive] = useState(editCategory?.is_active ?? true)
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
    if (!nameFi.trim()) { setFormError("Category name (FI) is required"); return }
    if (!slug.trim()) { setFormError("Slug is required"); return }
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        name_fi: nameFi.trim(),
        name_en: nameEn.trim() || null,
        name_uk: nameUk.trim() || null,
        slug: slug.trim(),
        icon,
        description_fi: descFi.trim() || null,
        description_en: descEn.trim() || null,
        description_uk: descUk.trim() || null,
        is_active: isActive,
        sort_order: Number(sortOrder) || 0,
      }

      const res = await fetch(
        isEdit ? `/api/admin/categories/${editCategory!.id}` : "/api/admin/categories",
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
            {isEdit ? "Edit Category" : "Add Category"}
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
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
              Name ({activeLang.toUpperCase()}){activeLang === "fi" && <span className="text-[#E74C3C] ml-0.5">*</span>}
            </label>
            <input
              type="text"
              value={nameMap[activeLang].val}
              onChange={e => nameMap[activeLang].set(e.target.value)}
              placeholder="Category name..."
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Slug<span className="text-[#E74C3C] ml-0.5">*</span></label>
            <input
              type="text"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="category-slug"
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none"
            />
            {!slugManual && nameFi && (
              <p className="text-[10px] text-[#787585] mt-1">Auto-generated from FI name</p>
            )}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setIcon(ic)} title={ic}
                  className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-colors ${icon === ic ? "border-[#2D1783] bg-[#2D1783]/10" : "border-[#E5E8F0] hover:border-[#2D1783]"}`}>
                  <span className="material-symbols-outlined text-[20px] text-[#2D1783]">{ic}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#787585] mt-1">Selected: <span className="font-mono">{icon}</span></p>
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
              placeholder="Category description..."
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-3 text-sm focus:border-[#2D1783] focus:outline-none resize-none"
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
            {saving ? "Saving..." : isEdit ? "Update Category" : "Save Category"}
          </button>
        </div>
      </aside>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminCategoriesClient({
  categories = [],
}: {
  categories?: Category[]
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditingCategory(null)
    router.refresh()
    showToast("Category saved successfully")
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name_fi}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" })
    if (res.ok) {
      router.refresh()
      showToast("Category deleted")
    } else {
      const json = await res.json()
      alert(json.error ?? "Delete failed")
    }
  }

  return (
    <div className="space-y-5">
      {showForm && (
        <CategoryForm onClose={() => setShowForm(false)} onSaved={handleSaved} />
      )}
      {editingCategory && (
        <CategoryForm
          editCategory={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSaved={handleSaved}
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
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Categories</h1>
          <p className="text-sm text-[#787585] mt-0.5">{categories.length} categories</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-[#787585]">
            <span className="material-symbols-outlined text-[48px] block mb-3 opacity-30">category</span>
            <p className="font-semibold">No categories yet</p>
            <p className="text-sm mt-1">Click "Add Category" to create the first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E8F0] bg-[#F8F9FD]">
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Languages</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8F0]">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-[#F8F9FD] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#2D1783]/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[#2D1783] text-[15px]">{cat.icon ?? "category"}</span>
                        </div>
                        <span className="text-sm font-semibold text-[#1b1b1c]">{cat.name_fi}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span title="Finnish" className={cat.name_fi ? "opacity-100" : "opacity-25"}>🇫🇮</span>
                        <span title="English" className={cat.name_en ? "opacity-100" : "opacity-25"}>🇬🇧</span>
                        <span title="Ukrainian" className={cat.name_uk ? "opacity-100" : "opacity-25"}>🇺🇦</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded">{cat.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#787585]">{cat.sort_order}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.is_active ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#474554]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
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
