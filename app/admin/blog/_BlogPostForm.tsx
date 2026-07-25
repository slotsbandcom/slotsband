"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RichTextEditor } from "@/components/admin/RichTextEditor"

type Lang = "fi" | "en" | "uk"
const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }
const LANG_LABEL: Record<Lang, string> = { fi: "FI", en: "EN", uk: "UK" }

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/å/g, "a")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

interface BlogPost {
  id: string
  slug_fi: string; slug_en: string; slug_uk: string
  title_fi: string; title_en: string | null; title_uk: string | null
  content_fi: string | null; content_en: string | null; content_uk: string | null
  excerpt_fi: string | null; excerpt_en: string | null; excerpt_uk: string | null
  featured_image_url: string | null
  meta_title_fi: string | null; meta_title_en: string | null; meta_title_uk: string | null
  meta_description_fi: string | null; meta_description_en: string | null; meta_description_uk: string | null
  published_at: string | null
  is_active: boolean
}

const EMPTY: BlogPost = {
  id: "", slug_fi: "", slug_en: "", slug_uk: "",
  title_fi: "", title_en: null, title_uk: null,
  content_fi: null, content_en: null, content_uk: null,
  excerpt_fi: null, excerpt_en: null, excerpt_uk: null,
  featured_image_url: null,
  meta_title_fi: null, meta_title_en: null, meta_title_uk: null,
  meta_description_fi: null, meta_description_en: null, meta_description_uk: null,
  published_at: null, is_active: true,
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">{children}</label>
}
function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input {...props}
        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-[#1b1b1c] placeholder:text-[#b0adb8] transition-colors" />
    </div>
  )
}
function Textarea({ label, value, onChange, placeholder, rows = 3, maxLength }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; maxLength?: number
}) {
  return (
    <div>
      {label && (
        <div className="flex justify-between mb-1.5">
          <Label>{label}</Label>
          {maxLength && <span className={`text-[10px] font-medium ${value.length > maxLength * 0.9 ? "text-red-500" : "text-[#787585]"}`}>{value.length}/{maxLength}</span>}
        </div>
      )}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} maxLength={maxLength}
        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-[#1b1b1c] placeholder:text-[#b0adb8] transition-colors resize-y" />
    </div>
  )
}

export function BlogPostForm({ postId, createMode = false }: { postId?: string; createMode?: boolean }) {
  const router = useRouter()
  const [form, setForm] = useState<BlogPost>(EMPTY)
  const [loading, setLoading] = useState(!createMode)
  const [activeLang, setActiveLang] = useState<Lang>("fi")
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "error">("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [slugFiManual, setSlugFiManual] = useState(!!postId)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    if (createMode || !postId) return
    fetch(`/api/admin/blog-posts/${postId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setForm(data) })
      .finally(() => setLoading(false))
  }, [postId, createMode])

  const patch = useCallback((p: Partial<BlogPost>) => {
    setForm(prev => ({ ...prev, ...p }))
  }, [])

  const handleTitleFiChange = (title: string) => {
    const updates: Partial<BlogPost> = { title_fi: title }
    if (createMode && !slugFiManual) {
      updates.slug_fi = slugify(title)
      updates.slug_en = updates.slug_fi
      updates.slug_uk = updates.slug_fi
    }
    patch(updates)
  }

  const save = async () => {
    if (!form.title_fi.trim()) { setSaveError("Title (FI) is required"); return }
    if (!form.slug_fi.trim()) { setSaveError("Slug (FI) is required"); return }
    setSaved("saving"); setSaveError(null)
    try {
      const endpoint = createMode ? "/api/admin/blog-posts" : `/api/admin/blog-posts/${postId}`
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
        router.push(`/admin/blog/${updated.id}/edit`)
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
    if (!postId) return
    const res = await fetch(`/api/admin/blog-posts/${postId}`, { method: "DELETE" })
    if (res.ok) router.push("/admin/blog")
    else { const e = await res.json(); setSaveError(e.error || "Delete failed") }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#2D1783] border-t-transparent animate-spin" />
          <p className="text-sm text-[#787585] font-medium">Loading post...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-16 z-30 bg-[#F8F9FD] border-b border-[#E5E8F0] -mx-6 px-6 py-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/blog"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-[#E5E8F0] hover:border-[#2D1783] transition-colors">
              <span className="material-symbols-outlined text-[16px] text-[#474554]">arrow_back</span>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-[#2D1783]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">article</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-[#1b1b1c]">
                {createMode ? "New Article" : (form.title_fi || "Edit Article")}
              </h1>
              <p className="text-xs text-[#787585] font-mono">{form.slug_fi || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!createMode && (
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
                : createMode ? "Create Article" : "Save Changes"}
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
          {/* Language tabs */}
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">translate</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Content</h3>
            </div>
            <div className="flex border-b border-[#E5E8F0] px-5">
              {(["fi", "en", "uk"] as Lang[]).map(l => (
                <button key={l} type="button" onClick={() => setActiveLang(l)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    activeLang === l ? "border-[#2D1783] text-[#2D1783]" : "border-transparent text-[#787585] hover:text-[#1b1b1c]"
                  }`}>
                  <span>{LANG_FLAGS[l]}</span> {LANG_LABEL[l]}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-5">
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
                        placeholder="post-slug-fi"
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none" />
                      <p className="text-[10px] text-[#787585] mt-1">slotsband.com/fi/{form.slug_fi || "..."}</p>
                    </div>
                  </div>
                  <Textarea label="Excerpt (FI)" value={form.excerpt_fi || ""}
                    onChange={v => patch({ excerpt_fi: v || null })} placeholder="Short excerpt..." rows={2} />
                  <div>
                    <Label>Content (FI)</Label>
                    <RichTextEditor value={form.content_fi || ""} onChange={v => patch({ content_fi: v || null })} placeholder="Write article content..." />
                  </div>
                  <div className="bg-[#F8F9FD] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#474554] uppercase tracking-wider">SEO (FI)</p>
                    <div>
                      <div className="flex justify-between mb-1"><Label>Meta Title</Label>
                        <span className={`text-[10px] font-medium ${(form.meta_title_fi || "").length > 54 ? "text-orange-500" : "text-[#787585]"}`}>{(form.meta_title_fi || "").length}/60</span>
                      </div>
                      <input type="text" value={form.meta_title_fi || ""} onChange={e => patch({ meta_title_fi: e.target.value || null })} maxLength={60}
                        className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                    </div>
                    <Textarea label="Meta Description" value={form.meta_description_fi || ""}
                      onChange={v => patch({ meta_description_fi: v || null })} placeholder="Meta description..." rows={2} maxLength={160} />
                  </div>
                </>
              )}

              {activeLang === "en" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Title (EN)" value={form.title_en || ""}
                      onChange={e => patch({ title_en: e.target.value || null })} placeholder="English title..." />
                    <div>
                      <Label>Slug (EN)</Label>
                      <input type="text" value={form.slug_en || ""}
                        onChange={e => patch({ slug_en: e.target.value })}
                        placeholder={form.slug_fi || "post-slug-en"}
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none" />
                      {!form.slug_en && <p className="text-[10px] text-[#787585]/60 mt-1">Defaults to FI slug if empty</p>}
                    </div>
                  </div>
                  <Textarea label="Excerpt (EN)" value={form.excerpt_en || ""}
                    onChange={v => patch({ excerpt_en: v || null })} placeholder="Short excerpt..." rows={2} />
                  <div>
                    <Label>Content (EN)</Label>
                    <RichTextEditor value={form.content_en || ""} onChange={v => patch({ content_en: v || null })} placeholder="Write English content..." />
                  </div>
                  <div className="bg-[#F8F9FD] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#474554] uppercase tracking-wider">SEO (EN)</p>
                    <div>
                      <div className="flex justify-between mb-1"><Label>Meta Title</Label>
                        <span className={`text-[10px] font-medium ${(form.meta_title_en || "").length > 54 ? "text-orange-500" : "text-[#787585]"}`}>{(form.meta_title_en || "").length}/60</span>
                      </div>
                      <input type="text" value={form.meta_title_en || ""} onChange={e => patch({ meta_title_en: e.target.value || null })} maxLength={60}
                        className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                    </div>
                    <Textarea label="Meta Description" value={form.meta_description_en || ""}
                      onChange={v => patch({ meta_description_en: v || null })} placeholder="Meta description..." rows={2} maxLength={160} />
                  </div>
                </>
              )}

              {activeLang === "uk" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Title (UK)" value={form.title_uk || ""}
                      onChange={e => patch({ title_uk: e.target.value || null })} placeholder="UK English title..." />
                    <div>
                      <Label>Slug (UK)</Label>
                      <input type="text" value={form.slug_uk || ""}
                        onChange={e => patch({ slug_uk: e.target.value })}
                        placeholder={form.slug_fi || "post-slug-uk"}
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none" />
                      {!form.slug_uk && <p className="text-[10px] text-[#787585]/60 mt-1">Defaults to FI slug if empty</p>}
                    </div>
                  </div>
                  <Textarea label="Excerpt (UK)" value={form.excerpt_uk || ""}
                    onChange={v => patch({ excerpt_uk: v || null })} placeholder="Short excerpt..." rows={2} />
                  <div>
                    <Label>Content (UK)</Label>
                    <RichTextEditor value={form.content_uk || ""} onChange={v => patch({ content_uk: v || null })} placeholder="Write UK English content..." />
                  </div>
                  <div className="bg-[#F8F9FD] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#474554] uppercase tracking-wider">SEO (UK)</p>
                    <div>
                      <div className="flex justify-between mb-1"><Label>Meta Title</Label>
                        <span className={`text-[10px] font-medium ${(form.meta_title_uk || "").length > 54 ? "text-orange-500" : "text-[#787585]"}`}>{(form.meta_title_uk || "").length}/60</span>
                      </div>
                      <input type="text" value={form.meta_title_uk || ""} onChange={e => patch({ meta_title_uk: e.target.value || null })} maxLength={60}
                        className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
                    </div>
                    <Textarea label="Meta Description" value={form.meta_description_uk || ""}
                      onChange={v => patch({ meta_description_uk: v || null })} placeholder="Meta description..." rows={2} maxLength={160} />
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

          {/* Publish date */}
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">calendar_today</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Published Date</h3>
            </div>
            <div className="p-5">
              <input type="datetime-local"
                value={form.published_at ? new Date(form.published_at).toISOString().slice(0, 16) : ""}
                onChange={e => patch({ published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
          </div>

          {/* Featured image */}
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">image</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Featured Image</h3>
            </div>
            <div className="p-5 space-y-3">
              {form.featured_image_url && (
                <div className="relative">
                  <img src={form.featured_image_url} alt="" className="w-full aspect-video object-cover rounded-xl border border-[#E5E8F0]" />
                  <button type="button" onClick={() => patch({ featured_image_url: null })}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[13px]">close</span>
                  </button>
                </div>
              )}
              <input type="text" value={form.featured_image_url || ""}
                onChange={e => patch({ featured_image_url: e.target.value || null })}
                placeholder="https://..."
                className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
            </div>
          </div>

          {/* Slugs summary */}
          {!createMode && (form.slug_en !== form.slug_fi || form.slug_uk !== form.slug_fi) && (
            <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
                <span className="material-symbols-outlined text-[#2D1783] text-[18px]">link</span>
                <h3 className="text-sm font-bold text-[#1b1b1c]">Slugs</h3>
              </div>
              <div className="p-5 space-y-1.5">
                {(["fi", "en", "uk"] as Lang[]).map(l => (
                  <div key={l} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#787585] uppercase w-6">{l}</span>
                    <span className="text-xs font-mono text-[#474554] bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded flex-1 truncate">
                      {l === "fi" ? form.slug_fi : l === "en" ? (form.slug_en || form.slug_fi) : (form.slug_uk || form.slug_fi)}
                    </span>
                  </div>
                ))}
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
                    Delete Article
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
