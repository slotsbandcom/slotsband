"use client"

import { useState, useEffect, useRef } from "react"

interface Banner {
  id: string
  title: string
  bonus_text: string | null
  subtext: string | null
  bg_color: string
  text_color: string
  btn_class: string
  image_url: string | null
  link_url: string | null
  casino_id: string | null
  is_active: boolean
  sort_order: number
  lang: string
  created_at: string
  updated_at: string
}

const LANG_LABELS: Record<string, string> = {
  fi: "🇫🇮 FI", en: "🇬🇧 EN", uk: "🇺🇦 UK", all: "🌍 All",
}

// ─── Mini CSS preview (matches the hero-slider visual exactly) ────────────────
function BannerPreview({ banner, className = "" }: { banner: Banner; className?: string }) {
  if (banner.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={banner.image_url} alt={banner.title} className={`w-full h-full object-cover ${className}`} />
    )
  }
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center px-3 text-center gap-0.5 ${className}`}
      style={{ backgroundColor: banner.bg_color }}
    >
      <p
        className="font-bold uppercase tracking-widest text-[8px] leading-tight truncate w-full"
        style={{ color: banner.text_color, opacity: 0.75 }}
      >
        {banner.title}
      </p>
      {banner.bonus_text && (
        <p
          className="font-bold text-[9px] leading-tight line-clamp-2 w-full"
          style={{ color: banner.text_color }}
        >
          {banner.bonus_text}
        </p>
      )}
      {banner.subtext && (
        <p
          className="text-[7px] font-semibold uppercase tracking-wide truncate w-full mt-0.5"
          style={{ color: banner.text_color, opacity: 0.6 }}
        >
          {banner.subtext}
        </p>
      )}
      <div
        className="mt-1.5 px-2.5 py-0.5 rounded-full text-[7px] font-bold whitespace-nowrap"
        style={{ backgroundColor: banner.text_color, color: banner.bg_color }}
      >
        Pelaa Nyt
      </div>
    </div>
  )
}

// ─── Form (slide-over panel) ───────────────────────────────────────────────────
function BannerForm({ banner, onClose, onSaved }: {
  banner?: Banner | null
  onClose: () => void
  onSaved: (b: Banner) => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: banner?.title ?? "",
    bonus_text: banner?.bonus_text ?? "",
    subtext: banner?.subtext ?? "",
    bg_color: banner?.bg_color ?? "#2D1783",
    text_color: banner?.text_color ?? "#FFFFFF",
    btn_class: banner?.btn_class ?? "bg-[#FFD700] text-black",
    link_url: banner?.link_url ?? "",
    lang: banner?.lang ?? "fi",
    is_active: banner?.is_active ?? true,
    sort_order: banner?.sort_order ?? 0,
  })

  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.title.trim()) { setError("Title is required"); return }
    setSaving(true); setError(null)
    try {
      const url = banner ? `/api/admin/banners/${banner.id}` : "/api/admin/banners"
      const method = banner ? "PATCH" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed") }
      const saved = await res.json()
      onSaved(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally { setSaving(false) }
  }

  // Live preview
  const preview: Banner = {
    id: banner?.id ?? "",
    image_url: null,
    casino_id: null,
    created_at: "",
    updated_at: "",
    ...form,
    sort_order: Number(form.sort_order),
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8F0]">
          <h2 className="font-display font-bold text-lg text-[#1b1b1c]">{banner ? "Edit Banner" : "Add Banner"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Live preview */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Preview</label>
            <div className="h-28 rounded-xl overflow-hidden border border-[#E5E8F0]">
              <BannerPreview banner={preview} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} type="text" placeholder="Banner title..." className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Bonus Text</label>
            <input value={form.bonus_text} onChange={e => set("bonus_text", e.target.value)} type="text" placeholder="100% BONUS 500€ ASTI + 100FS" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Subtext</label>
            <input value={form.subtext} onChange={e => set("subtext", e.target.value)} type="text" placeholder="Additional context text..." className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Link URL</label>
            <input value={form.link_url} onChange={e => set("link_url", e.target.value)} type="text" placeholder="/fi/mene/casino-slug" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Background Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.bg_color} onChange={e => set("bg_color", e.target.value)} className="w-10 h-10 rounded-lg border border-[#E5E8F0] cursor-pointer p-0.5 bg-white" />
                <input value={form.bg_color} onChange={e => set("bg_color", e.target.value)} type="text" className="flex-1 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2 text-sm focus:border-[#2D1783] focus:outline-none font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Text Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.text_color} onChange={e => set("text_color", e.target.value)} className="w-10 h-10 rounded-lg border border-[#E5E8F0] cursor-pointer p-0.5 bg-white" />
                <input value={form.text_color} onChange={e => set("text_color", e.target.value)} type="text" className="flex-1 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2 text-sm focus:border-[#2D1783] focus:outline-none font-mono" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Language</label>
              <select value={form.lang} onChange={e => set("lang", e.target.value)} className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none">
                {Object.entries(LANG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 0)} className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set("is_active", !form.is_active)} className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? "bg-[#2D1783]" : "bg-[#E5E8F0]"} relative flex-shrink-0 cursor-pointer`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? "left-5" : "left-1"}`} />
            </div>
            <span className="text-sm font-semibold text-[#1b1b1c]">Active</span>
          </label>

          {error && <p className="text-xs text-[#E74C3C] bg-[#E74C3C]/10 rounded-xl px-4 py-2">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-[#E5E8F0] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl hover:border-[#2D1783] transition-colors">Cancel</button>
          <button onClick={save} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] transition-colors disabled:opacity-50">
            {saving ? "Saving…" : "Save Banner"}
          </button>
        </div>
      </aside>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editBanner, setEditBanner] = useState<Banner | null | undefined>(undefined) // undefined=closed, null=new
  const [view, setView] = useState<"grid" | "table">("grid")
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/banners")
      if (res.ok) setBanners(await res.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSaved = (saved: Banner) => {
    setBanners(prev => {
      const idx = prev.findIndex(b => b.id === saved.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [...prev, saved].sort((a, b) => a.sort_order - b.sort_order)
    })
    setEditBanner(undefined)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return
    setDeleting(id)
    try {
      await fetch(`/api/admin/banners/${id}`, { method: "DELETE" })
      setBanners(prev => prev.filter(b => b.id !== id))
    } finally { setDeleting(null) }
  }

  const toggleActive = async (banner: Banner) => {
    const updated = { ...banner, is_active: !banner.is_active }
    setBanners(prev => prev.map(b => b.id === banner.id ? updated : b))
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: updated.is_active }),
    })
  }

  return (
    <div className="space-y-5">
      {editBanner !== undefined && (
        <BannerForm
          banner={editBanner}
          onClose={() => setEditBanner(undefined)}
          onSaved={handleSaved}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Banners</h1>
          <p className="text-sm text-[#787585] mt-0.5">{banners.length} total banners</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl p-0.5">
            {(["grid", "table"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${view === v ? "bg-white shadow-sm text-[#2D1783]" : "text-[#787585]"}`}>
                <span className="material-symbols-outlined text-[16px] align-middle">{v === "grid" ? "grid_view" : "table_rows"}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setEditBanner(null)}
            className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Banner
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#2D1783]/20 border-t-[#2D1783] rounded-full animate-spin" />
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map(banner => (
            <div key={banner.id} className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden hover:border-[#2D1783] transition-colors group">
              {/* Mini preview — exact same visual as hero-slider */}
              <div className="h-32 overflow-hidden">
                <BannerPreview banner={banner} />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1b1b1c] leading-snug">{banner.title}</p>
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${banner.is_active ? "bg-[#27AE60]/10 text-[#27AE60] hover:bg-[#27AE60]/20" : "bg-[#E5E8F0] text-[#787585] hover:bg-[#ddd]"}`}>
                    {banner.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-[#2D1783]/10 text-[#2D1783] font-bold px-2 py-0.5 rounded-full">{LANG_LABELS[banner.lang] ?? banner.lang}</span>
                  <span className="text-[10px] bg-[#F8F9FD] text-[#787585] font-semibold px-2 py-0.5 rounded-full border border-[#E5E8F0]">#{banner.sort_order}</span>
                </div>
                {banner.bonus_text && (
                  <p className="text-xs text-[#787585] truncate">{banner.bonus_text}</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => setEditBanner(banner)} className="flex-1 py-1.5 text-xs font-semibold text-[#2D1783] bg-[#F8F9FD] border border-[#E5E8F0] rounded-lg hover:border-[#2D1783] transition-colors">Edit</button>
                  <button onClick={() => handleDelete(banner.id)} disabled={deleting === banner.id} className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#E74C3C] transition-colors disabled:opacity-40">
                    <span className="material-symbols-outlined text-[13px] text-[#787585]">{deleting === banner.id ? "hourglass_empty" : "delete"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && (
            <button onClick={() => setEditBanner(null)}
              className="h-full min-h-[240px] bg-white rounded-2xl border-2 border-dashed border-[#E5E8F0] flex flex-col items-center justify-center gap-2 text-[#787585] hover:border-[#2D1783] hover:text-[#2D1783] transition-colors">
              <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
              <span className="text-xs font-semibold">Add new banner</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E8F0] bg-[#F8F9FD]">
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Preview</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Bonus Text</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Lang</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8F0]">
                {banners.map(banner => (
                  <tr key={banner.id} className="hover:bg-[#F8F9FD] transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-20 h-12 rounded-lg overflow-hidden border border-[#E5E8F0] flex-shrink-0">
                        <BannerPreview banner={banner} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1b1b1c] max-w-[160px]">
                      <p className="truncate">{banner.title}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#787585] max-w-[200px]">
                      <p className="truncate">{banner.bonus_text ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#474554]">{LANG_LABELS[banner.lang] ?? banner.lang}</td>
                    <td className="px-4 py-3 text-sm text-[#787585]">#{banner.sort_order}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(banner)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${banner.is_active ? "bg-[#27AE60]/10 text-[#27AE60] hover:bg-[#27AE60]/20" : "bg-[#E5E8F0] text-[#787585] hover:bg-[#ddd]"}`}>
                        {banner.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditBanner(banner)} className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
                          <span className="material-symbols-outlined text-[13px] text-[#474554]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(banner.id)} disabled={deleting === banner.id} className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#E74C3C] transition-colors disabled:opacity-40">
                          <span className="material-symbols-outlined text-[13px] text-[#787585]">{deleting === banner.id ? "hourglass_empty" : "delete"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
