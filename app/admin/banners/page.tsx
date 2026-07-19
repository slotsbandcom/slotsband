"use client"

import { useState, useRef } from "react"

type Position = "homepage_hero" | "sidebar" | "casino_listing" | "bonuses_page" | "games_page"
type BannerLang = "fi" | "en" | "uk" | "all"
type Target = "_blank" | "_self"

interface Banner {
  id: string
  title: string
  position: Position
  lang: BannerLang
  startDate: string
  endDate: string
  isActive: boolean
  link: string
  target: Target
}

const POSITION_LABELS: Record<Position, string> = {
  homepage_hero:  "Homepage Hero",
  sidebar:        "Sidebar",
  casino_listing: "Casino Listing Top",
  bonuses_page:   "Bonuses Page",
  games_page:     "Games Page",
}

const LANG_LABELS: Record<BannerLang, string> = {
  fi: "🇫🇮 FI", en: "🇬🇧 EN", uk: "🇺🇦 UK", all: "🌍 All",
}

const MOCK_BANNERS: Banner[] = [
  { id: "1", title: "Spinnair — Kevät Kampanja", position: "homepage_hero",  lang: "fi",  startDate: "2026-01-01", endDate: "2026-03-31", isActive: true,  link: "/fi/mene/spinnair",  target: "_blank" },
  { id: "2", title: "Lussurio 300% Bonus",       position: "casino_listing", lang: "all", startDate: "2026-01-10", endDate: "2026-02-28", isActive: true,  link: "/fi/mene/lussurio",  target: "_blank" },
  { id: "3", title: "Sidebar — MGA Badge",        position: "sidebar",        lang: "all", startDate: "2026-01-01", endDate: "2026-12-31", isActive: true,  link: "/fi/nettikasinot",   target: "_self" },
  { id: "4", title: "Games Page Promo",           position: "games_page",     lang: "en",  startDate: "2026-02-01", endDate: "2026-02-28", isActive: false, link: "/en/kasinopelit",    target: "_self" },
]

// ─── Form ─────────────────────────────────────────────────────────────────────
function BannerForm({ onClose }: { onClose: () => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [position, setPosition] = useState<Position>("homepage_hero")
  const [lang, setLang] = useState<BannerLang>("all")
  const [target, setTarget] = useState<Target>("_blank")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith("image/")) handleFile(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8F0]">
          <h2 className="font-display font-bold text-lg text-[#1b1b1c]">Add Banner</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Banner Image</label>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-colors overflow-hidden ${isDragging ? "border-[#2D1783] bg-[#2D1783]/5" : "border-[#E5E8F0] hover:border-[#2D1783]"}`}
            >
              {preview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Banner preview" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold">Click to replace</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10">
                  <span className="material-symbols-outlined text-[#E5E8F0] text-[40px]">image</span>
                  <p className="text-sm font-semibold text-[#787585]">Drag & drop or click to upload</p>
                  <p className="text-xs text-[#787585]">PNG, JPG, WebP up to 2MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Title</label>
            <input type="text" placeholder="Banner title..." className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Link URL</label>
            <input type="url" placeholder="https://..." className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Position</label>
              <select value={position} onChange={e => setPosition(e.target.value as Position)} className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none">
                {Object.entries(POSITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Language</label>
              <select value={lang} onChange={e => setLang(e.target.value as BannerLang)} className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none">
                {Object.entries(LANG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Start Date</label>
              <input type="date" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">End Date</label>
              <input type="date" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Target</label>
            <div className="flex gap-2">
              {(["_blank", "_self"] as Target[]).map(t => (
                <button key={t} onClick={() => setTarget(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${target === t ? "border-[#2D1783] bg-[#2D1783] text-white" : "border-[#E5E8F0] text-[#787585] hover:border-[#2D1783]"}`}>
                  {t === "_blank" ? "New tab (_blank)" : "Same tab (_self)"}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setIsActive(!isActive)} className={`w-10 h-6 rounded-full transition-colors ${isActive ? "bg-[#2D1783]" : "bg-[#E5E8F0]"} relative flex-shrink-0`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? "left-5" : "left-1"}`} />
            </div>
            <span className="text-sm font-semibold text-[#1b1b1c]">Active</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E8F0] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl hover:border-[#2D1783] transition-colors">Cancel</button>
          <button className="px-5 py-2 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] transition-colors">Save Banner</button>
        </div>
      </aside>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminBannersPage() {
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<"grid" | "table">("grid")

  return (
    <div className="space-y-5">
      {showForm && <BannerForm onClose={() => setShowForm(false)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Banners</h1>
          <p className="text-sm text-[#787585] mt-0.5">{MOCK_BANNERS.length} total banners</p>
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
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Banner
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_BANNERS.map(banner => (
            <div key={banner.id} className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden hover:border-[#2D1783] transition-colors group">
              {/* Thumbnail */}
              <div className="h-32 bg-gradient-to-br from-[#2D1783]/10 to-[#2D1783]/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#2D1783]/30 text-[48px]">image</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1b1b1c] leading-snug">{banner.title}</p>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${banner.isActive ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-[#2D1783]/10 text-[#2D1783] font-bold px-2 py-0.5 rounded-full">{POSITION_LABELS[banner.position]}</span>
                  <span className="text-[10px] bg-[#F8F9FD] text-[#787585] font-semibold px-2 py-0.5 rounded-full border border-[#E5E8F0]">{LANG_LABELS[banner.lang]}</span>
                </div>
                <p className="text-xs text-[#787585]">{banner.startDate} — {banner.endDate}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => setShowForm(true)} className="flex-1 py-1.5 text-xs font-semibold text-[#2D1783] bg-[#F8F9FD] border border-[#E5E8F0] rounded-lg hover:border-[#2D1783] transition-colors">Edit</button>
                  <button className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#E74C3C] transition-colors">
                    <span className="material-symbols-outlined text-[13px] text-[#787585]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {/* Add placeholder */}
          <button onClick={() => setShowForm(true)}
            className="h-full min-h-[240px] bg-white rounded-2xl border-2 border-dashed border-[#E5E8F0] flex flex-col items-center justify-center gap-2 text-[#787585] hover:border-[#2D1783] hover:text-[#2D1783] transition-colors">
            <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
            <span className="text-xs font-semibold">Add new banner</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E8F0] bg-[#F8F9FD]">
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Preview</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Language</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8F0]">
                {MOCK_BANNERS.map(banner => (
                  <tr key={banner.id} className="hover:bg-[#F8F9FD] transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-16 h-10 rounded-lg bg-gradient-to-br from-[#2D1783]/10 to-[#2D1783]/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#2D1783]/30 text-[18px]">image</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1b1b1c]">{banner.title}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#2D1783]/10 text-[#2D1783] font-bold px-2 py-0.5 rounded-full">{POSITION_LABELS[banner.position]}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#474554]">{LANG_LABELS[banner.lang]}</td>
                    <td className="px-4 py-3 text-xs text-[#787585] whitespace-nowrap">{banner.startDate} — {banner.endDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${banner.isActive ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setShowForm(true)} className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
                          <span className="material-symbols-outlined text-[13px] text-[#474554]">edit</span>
                        </button>
                        <button className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#E74C3C] transition-colors">
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
      )}
    </div>
  )
}
