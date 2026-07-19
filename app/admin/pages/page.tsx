"use client"

import { useState } from "react"
import Link from "next/link"

type Lang = "fi" | "en" | "uk"
type Template = "default" | "fullwidth" | "landing" | "review"
type Status = "published" | "draft" | "scheduled"

interface Page {
  id: string
  title: Record<Lang, string>
  slug: string
  template: Template
  status: Status
  lastModified: string
  lang: Lang
}

const MOCK_PAGES: Page[] = [
  { id: "1", title: { fi: "Etusivu", en: "Homepage", uk: "Головна" }, slug: "/", template: "default", status: "published", lastModified: "2026-01-15", lang: "fi" },
  { id: "2", title: { fi: "Nettikasinot", en: "Online Casinos", uk: "Онлайн казино" }, slug: "/nettikasinot", template: "default", status: "published", lastModified: "2026-01-14", lang: "fi" },
  { id: "3", title: { fi: "Kasinobonukset", en: "Casino Bonuses", uk: "Бонуси казино" }, slug: "/kasinobonukset", template: "default", status: "published", lastModified: "2026-01-13", lang: "fi" },
  { id: "4", title: { fi: "Bonushunt", en: "Bonus Hunt", uk: "Полювання за бонусами" }, slug: "/bonushunt", template: "fullwidth", status: "published", lastModified: "2026-01-12", lang: "fi" },
  { id: "5", title: { fi: "Vastuullinen pelaaminen", en: "Responsible Gambling", uk: "Відповідальна гра" }, slug: "/responsible-gambling", template: "default", status: "published", lastModified: "2026-01-10", lang: "fi" },
  { id: "6", title: { fi: "Kevätarvonta 2026", en: "Spring Raffle 2026", uk: "Весняний розіграш 2026" }, slug: "/kevat-kampanja", template: "landing", status: "draft", lastModified: "2026-01-09", lang: "fi" },
]

const TEMPLATE_LABELS: Record<Template, string> = {
  default: "Default",
  fullwidth: "Full Width",
  landing: "Landing Page",
  review: "Casino Review",
}

const STATUS_STYLES: Record<Status, string> = {
  published: "bg-[#27AE60]/10 text-[#27AE60]",
  draft: "bg-[#E5E8F0] text-[#787585]",
  scheduled: "bg-[#FFD700]/20 text-[#775900]",
}

const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }

// ─── Slide-over form ─────────────────────────────────────────────────────────
function PageForm({ onClose }: { onClose: () => void }) {
  const [activeLang, setActiveLang] = useState<Lang>("fi")
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content")
  const [titles, setTitles] = useState<Record<Lang, string>>({ fi: "", en: "", uk: "" })
  const [slugs, setSlugs] = useState<Record<Lang, string>>({ fi: "", en: "", uk: "" })
  const [status, setStatus] = useState<Status>("draft")
  const [template, setTemplate] = useState<Template>("default")

  const genSlug = (title: string) =>
    "/" + title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")

  const handleTitleChange = (val: string) => {
    setTitles(t => ({ ...t, [activeLang]: val }))
    if (!slugs[activeLang]) setSlugs(s => ({ ...s, [activeLang]: genSlug(val) }))
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8F0]">
          <h2 className="font-display font-bold text-lg text-[#1b1b1c]">Add Page</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Lang tabs */}
        <div className="flex border-b border-[#E5E8F0] px-6">
          {(["fi", "en", "uk"] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setActiveLang(l)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeLang === l ? "border-[#2D1783] text-[#2D1783]" : "border-transparent text-[#787585] hover:text-[#1b1b1c]"}`}
            >
              <span>{LANG_FLAGS[l]}</span> {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content/SEO tabs */}
        <div className="flex gap-4 px-6 pt-4">
          {(["content", "seo"] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === t ? "border-[#2D1783] text-[#2D1783]" : "border-transparent text-[#787585]"}`}
            >
              {t === "content" ? "Content" : "SEO"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === "content" && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Title ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  value={titles[activeLang]}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
                  placeholder="Page title..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Slug ({activeLang.toUpperCase()})</label>
                <input
                  type="text"
                  value={slugs[activeLang]}
                  onChange={e => setSlugs(s => ({ ...s, [activeLang]: e.target.value }))}
                  className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none"
                  placeholder="/page-slug"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Template</label>
                <select
                  value={template}
                  onChange={e => setTemplate(e.target.value as Template)}
                  className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
                >
                  {Object.entries(TEMPLATE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Content ({activeLang.toUpperCase()})</label>
                <textarea
                  rows={10}
                  className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-3 text-sm font-mono focus:border-[#2D1783] focus:outline-none resize-none"
                  placeholder="Page content (rich text)..."
                />
              </div>
            </>
          )}
          {activeTab === "seo" && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Meta Title ({activeLang.toUpperCase()})</label>
                <input type="text" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" placeholder="Meta title..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Meta Description ({activeLang.toUpperCase()})</label>
                <textarea rows={3} className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-3 text-sm focus:border-[#2D1783] focus:outline-none resize-none" placeholder="Meta description..." />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E8F0] flex items-center justify-between gap-3">
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Status)}
            className="bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2 text-sm focus:border-[#2D1783] focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl hover:border-[#2D1783] transition-colors">Cancel</button>
            <button className="px-5 py-2 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] transition-colors">Save Page</button>
          </div>
        </div>
      </aside>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminPagesPage() {
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")

  const filtered = MOCK_PAGES.filter(p => {
    const matchSearch = p.title.fi.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-5">
      {showForm && <PageForm onClose={() => setShowForm(false)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Pages</h1>
          <p className="text-sm text-[#787585] mt-0.5">{MOCK_PAGES.length} total pages</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Page
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl pl-9 pr-4 py-2 text-sm focus:border-[#2D1783] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "published", "draft", "scheduled"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s ? "bg-[#2D1783] text-white" : "bg-[#F8F9FD] text-[#787585] hover:text-[#1b1b1c]"}`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
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
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Languages</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Template</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Modified</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8F0]">
              {filtered.map(page => (
                <tr key={page.id} className="hover:bg-[#F8F9FD] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#2D1783]/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#2D1783] text-[15px]">article</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1b1b1c]">{page.title.fi}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {(["fi", "en", "uk"] as Lang[]).map(l => (
                        <span key={l} className="text-base" title={l.toUpperCase()}>{LANG_FLAGS[l]}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-[#787585] bg-[#F8F9FD] px-2 py-0.5 rounded">{page.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#474554] bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded-lg">{TEMPLATE_LABELS[page.template]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[page.status]}`}>
                      {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#787585]">{page.lastModified}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setShowForm(true)} className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[13px] text-[#474554]">edit</span>
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#27AE60] transition-colors" title="Preview">
                        <span className="material-symbols-outlined text-[13px] text-[#474554]">open_in_new</span>
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
