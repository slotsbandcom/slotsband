"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RichTextEditor } from "@/components/admin/RichTextEditor"

type Lang = "fi" | "en" | "uk"
const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/å/g, "a")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

interface StaticPage {
  id: string
  slug_fi: string; slug_en: string; slug_uk: string
  title_fi: string; title_en: string | null; title_uk: string | null
  content_fi: string | null; content_en: string | null; content_uk: string | null
  meta_title_fi: string | null; meta_title_en: string | null; meta_title_uk: string | null
  meta_description_fi: string | null; meta_description_en: string | null; meta_description_uk: string | null
  is_active: boolean
}

const EMPTY: StaticPage = {
  id: "", slug_fi: "", slug_en: "", slug_uk: "",
  title_fi: "", title_en: null, title_uk: null,
  content_fi: null, content_en: null, content_uk: null,
  meta_title_fi: null, meta_title_en: null, meta_title_uk: null,
  meta_description_fi: null, meta_description_en: null, meta_description_uk: null,
  is_active: true,
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">{children}</label>
}

export function StaticPageForm({ pageId, createMode = false }: { pageId?: string; createMode?: boolean }) {
  const router = useRouter()
  const [form, setForm] = useState<StaticPage>(EMPTY)
  const [loading, setLoading] = useState(!createMode)
  const [activeLang, setActiveLang] = useState<Lang>("fi")
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "error">("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [slugFiManual, setSlugFiManual] = useState(!!pageId)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    if (createMode || !pageId) return
    fetch(`/api/admin/static-pages/${pageId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setForm(data) })
      .finally(() => setLoading(false))
  }, [pageId, createMode])

  const patch = useCallback((p: Partial<StaticPage>) => {
    setForm(prev => ({ ...prev, ...p }))
  }, [])

  const handleTitleFiChange = (title: string) => {
    const updates: Partial<StaticPage> = { title_fi: title }
    if (createMode && !slugFiManual) {
      const s = slugify(title)
      updates.slug_fi = s
      updates.slug_en = s
      updates.slug_uk = s
    }
    patch(updates)
  }

  const save = async () => {
    if (!form.title_fi.trim()) { setSaveError("Title (FI) is required"); return }
    if (!form.slug_fi.trim()) { setSaveError("Slug (FI) is required"); return }
    setSaved("saving"); setSaveError(null)
    try {
      const endpoint = createMode ? "/api/admin/static-pages" : `/api/admin/static-pages/${pageId}`
      const method = createMode ? "POST" : "PATCH"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title_en: form.title_en || null,
          title_uk: form.title_uk || null,
          slug_en: form.slug_en || form.slug_fi,
          slug_uk: form.slug_uk || form.slug_fi,
        }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error((e as { error?: string }).error || `HTTP ${res.status}`)
      }
      const updated = await res.json()
      if (createMode && updated?.id) {
        router.push(`/admin/pages/${updated.id}/edit`)
        return
      }
      if (updated?.id) setForm(updated)
      setSaved("ok")
    } catch (err) {
      setSaved("error")
      setSaveError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setTimeout(() => setSaved("idle"), 4000)
    }
  }

  const handleDelete = async () => {
    if (!pageId) return
    const res = await fetch(`/api/admin/static-pages/${pageId}`, { method: "DELETE" })
    if (res.ok) router.push("/admin/pages")
    else { const e = await res.json(); setSaveError(e.error || "Delete failed") }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-4 border-[#2D1783] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-16 z-30 bg-[#F8F9FD] border-b border-[#E5E8F0] -mx-6 px-6 py-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/pages"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-[#E5E8F0] hover:border-[#2D1783] transition-colors">
              <span className="material-symbols-outlined text-[16px] text-[#474554]">arrow_back</span>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-[#2D1783]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">article</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-[#1b1b1c]">
                {createMode ? "New Page" : (form.title_fi || "Edit Page")}
              </h1>
              <p className="text-xs text-[#787585] font-mono">{form.slug_fi || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!createMode && form.slug_fi && (
              <Link href={`/fi/${form.slug_fi}`} target="_blank"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#474554] bg-white border border-[#E5E8F0] hover:border-[#2D1783] px-3 py-2 rounded-xl transition-colors">
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                View
              </Link>
            )}
            <button type="button" onClick={save} disabled={saved === "saving"}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-70 ${
                saved === "ok" ? "bg-[#27AE60] text-white"
                : saved === "error" ? "bg-red-500 text-white"
                : "bg-[#2D1783] text-white hover:bg-[#3e2db2]"
              }`}>
              <span className="material-symbols-outlined text-[14px]">
                {saved === "ok" ? "check" : saved === "error" ? "error" : saved === "saving" ? "hourglass_empty" : "save"}
              </span>
              {saved === "ok" ? "Saved!" : saved === "error" ? "Error!" : saved === "saving" ? "Saving..."
                : createMode ? "Create Page" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {saveError && (
        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">error</span>
          <span>{saveError}</span>
          <button type="button" onClick={() => setSaveError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">translate</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Content</h3>
            </div>
            {/* Language tabs */}
            <div className="flex border-b border-[#E5E8F0] px-5">
              {(["fi", "en", "uk"] as Lang[]).map(l => (
                <button key={l} type="button" onClick={() => setActiveLang(l)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    activeLang === l ? "border-[#2D1783] text-[#2D1783]" : "border-transparent text-[#787585] hover:text-[#1b1b1c]"
                  }`}>
                  <span>{LANG_FLAGS[l]}</span> {l.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-5">
              {/* FI */}
              {activeLang === "fi" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Title (FI) <span className="text-[#E74C3C]">*</span></Label>
                      <input type="text" value={form.title_fi}
                        onChange={e => handleTitleFiChange(e.target.value)}
                        placeholder="Finnish title..."
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label>Slug (FI) <span className="text-[#E74C3C]">*</span></Label>
                        {createMode && <span className="text-[10px] text-[#787585]">{slugFiManual ? "manual" : "auto"}</span>}
                      </div>
                      <input type="text" value={form.slug_fi}
                        onChange={e => { setSlugFiManual(true); patch({ slug_fi: e.target.value }) }}
                        placeholder="page-slug"
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none" />
                      <p className="text-[10px] text-[#787585] mt-1">slotsband.com/fi/{form.slug_fi || "..."}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Content (FI)</Label>
                    <RichTextEditor value={form.content_fi || ""} onChange={v => patch({ content_fi: v || null })} placeholder="Write page content..." />
                  </div>
                  <div className="bg-[#F8F9FD] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#474554] uppercase tracking-wider">SEO (FI)</p>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label>Meta Title</Label>
                        <span className={`text-[10px] font-medium ${(form.meta_title_fi || "").length > 54 ? "text-orange-500" : "text-[#787585]"}`}>
                          {(form.meta_title_fi || "").length}/60
                        </span>
                      </div>
                      <input type="text" value={form.meta_title_fi || ""} maxLength={60}
                        onChange={e => patch({ meta_title_fi: e.target.value || null })}
                        className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label>Meta Description</Label>
                        <span className={`text-[10px] font-medium ${(form.meta_description_fi || "").length > 144 ? "text-orange-500" : "text-[#787585]"}`}>
                          {(form.meta_description_fi || "").length}/160
                        </span>
                      </div>
                      <textarea rows={2} value={form.meta_description_fi || ""} maxLength={160}
                        onChange={e => patch({ meta_description_fi: e.target.value || null })}
                        className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none resize-y" />
                    </div>
                  </div>
                </>
              )}

              {/* EN */}
              {activeLang === "en" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Title (EN)</Label>
                      <input type="text" value={form.title_en || ""}
                        onChange={e => patch({ title_en: e.target.value || null })}
                        placeholder="English title..."
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                    </div>
                    <div>
                      <Label>Slug (EN)</Label>
                      <input type="text" value={form.slug_en || ""}
                        onChange={e => patch({ slug_en: e.target.value })}
                        placeholder={form.slug_fi || "page-slug-en"}
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none" />
                      {!form.slug_en && <p className="text-[10px] text-[#787585]/60 mt-1">Defaults to FI slug if empty</p>}
                    </div>
                  </div>
                  <div>
                    <Label>Content (EN)</Label>
                    <RichTextEditor value={form.content_en || ""} onChange={v => patch({ content_en: v || null })} placeholder="Write English content..." />
                  </div>
                  <div className="bg-[#F8F9FD] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#474554] uppercase tracking-wider">SEO (EN)</p>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label>Meta Title</Label>
                        <span className={`text-[10px] font-medium ${(form.meta_title_en || "").length > 54 ? "text-orange-500" : "text-[#787585]"}`}>
                          {(form.meta_title_en || "").length}/60
                        </span>
                      </div>
                      <input type="text" value={form.meta_title_en || ""} maxLength={60}
                        onChange={e => patch({ meta_title_en: e.target.value || null })}
                        className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label>Meta Description</Label>
                        <span className={`text-[10px] font-medium ${(form.meta_description_en || "").length > 144 ? "text-orange-500" : "text-[#787585]"}`}>
                          {(form.meta_description_en || "").length}/160
                        </span>
                      </div>
                      <textarea rows={2} value={form.meta_description_en || ""} maxLength={160}
                        onChange={e => patch({ meta_description_en: e.target.value || null })}
                        className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none resize-y" />
                    </div>
                  </div>
                </>
              )}

              {/* UK */}
              {activeLang === "uk" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Title (UK)</Label>
                      <input type="text" value={form.title_uk || ""}
                        onChange={e => patch({ title_uk: e.target.value || null })}
                        placeholder="UK English title..."
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                    </div>
                    <div>
                      <Label>Slug (UK)</Label>
                      <input type="text" value={form.slug_uk || ""}
                        onChange={e => patch({ slug_uk: e.target.value })}
                        placeholder={form.slug_fi || "page-slug-uk"}
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none" />
                      {!form.slug_uk && <p className="text-[10px] text-[#787585]/60 mt-1">Defaults to FI slug if empty</p>}
                    </div>
                  </div>
                  <div>
                    <Label>Content (UK)</Label>
                    <RichTextEditor value={form.content_uk || ""} onChange={v => patch({ content_uk: v || null })} placeholder="Write UK English content..." />
                  </div>
                  <div className="bg-[#F8F9FD] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#474554] uppercase tracking-wider">SEO (UK)</p>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label>Meta Title</Label>
                        <span className={`text-[10px] font-medium ${(form.meta_title_uk || "").length > 54 ? "text-orange-500" : "text-[#787585]"}`}>
                          {(form.meta_title_uk || "").length}/60
                        </span>
                      </div>
                      <input type="text" value={form.meta_title_uk || ""} maxLength={60}
                        onChange={e => patch({ meta_title_uk: e.target.value || null })}
                        className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label>Meta Description</Label>
                        <span className={`text-[10px] font-medium ${(form.meta_description_uk || "").length > 144 ? "text-orange-500" : "text-[#787585]"}`}>
                          {(form.meta_description_uk || "").length}/160
                        </span>
                      </div>
                      <textarea rows={2} value={form.meta_description_uk || ""} maxLength={160}
                        onChange={e => patch({ meta_description_uk: e.target.value || null })}
                        className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none resize-y" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">toggle_on</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Status</h3>
            </div>
            <div className="p-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => patch({ is_active: !form.is_active })}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${form.is_active ? "bg-[#2D1783]" : "bg-[#E5E8F0]"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? "left-5" : "left-1"}`} />
                </div>
                <span className="text-sm font-semibold text-[#1b1b1c]">
                  {form.is_active ? "Active — visible on site" : "Draft — hidden from site"}
                </span>
              </label>
            </div>
          </div>

          {/* Slugs summary */}
          {!createMode && (
            <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
                <span className="material-symbols-outlined text-[#2D1783] text-[18px]">link</span>
                <h3 className="text-sm font-bold text-[#1b1b1c]">URLs</h3>
              </div>
              <div className="p-5 space-y-2">
                {(["fi", "en", "uk"] as Lang[]).map(l => {
                  const s = l === "fi" ? form.slug_fi : l === "en" ? (form.slug_en || form.slug_fi) : (form.slug_uk || form.slug_fi)
                  return (
                    <div key={l} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#787585] uppercase w-6">{l}</span>
                      <a href={`/${l}/${s}`} target="_blank"
                        className="text-xs font-mono text-[#2D1783] hover:underline bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded flex-1 truncate block">
                        /{l}/{s}
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Delete */}
          {!createMode && (
            <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-red-100 bg-red-50/50">
                <span className="material-symbols-outlined text-red-500 text-[18px]">delete_forever</span>
                <h3 className="text-sm font-bold text-red-700">Danger Zone</h3>
              </div>
              <div className="p-5">
                {deleteConfirm ? (
                  <div className="space-y-2">
                    <p className="text-xs text-red-700 font-medium">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleDelete}
                        className="flex-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 py-2 rounded-xl transition-colors">Delete</button>
                      <button type="button" onClick={() => setDeleteConfirm(false)}
                        className="flex-1 text-xs font-bold text-[#474554] bg-[#F8F9FD] border border-[#E5E8F0] py-2 rounded-xl">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setDeleteConfirm(true)}
                    className="w-full text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 py-2 rounded-xl transition-colors">
                    Delete Page
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
