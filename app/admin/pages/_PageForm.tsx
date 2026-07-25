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

interface LangData {
  title: string
  content: string
  meta_title: string
  meta_description: string
  is_published: boolean
  url_slug: string // per-lang URL slug (used only for code routes)
}

interface FormState {
  slug: string       // shared slug for regular pages; unused display for code routes
  routeKey: string   // internal key for code routes (read-only)
  fi: LangData
  en: LangData
  uk: LangData
}

const EMPTY_LANG: LangData = { title: "", content: "", meta_title: "", meta_description: "", is_published: false, url_slug: "" }

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">{children}</label>
}

function LangCard({ lang, data, onChange, seoOnly = false }: {
  lang: Lang; data: LangData; onChange: (d: Partial<LangData>) => void; seoOnly?: boolean
}) {
  return (
    <div className="space-y-5">
      {seoOnly && (
        <div>
          <Label>URL Slug ({lang.toUpperCase()})</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#787585] font-mono whitespace-nowrap">slotsband.com/{lang}/</span>
            <input
              type="text"
              value={data.url_slug}
              onChange={e => onChange({ url_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
              placeholder="page-slug"
              className="flex-1 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none"
            />
          </div>
        </div>
      )}
      {!seoOnly && (
        <div>
          <Label>Title ({lang.toUpperCase()}) {lang === "fi" && <span className="text-[#E74C3C]">*</span>}</Label>
          <input type="text" value={data.title}
            onChange={e => onChange({ title: e.target.value })}
            placeholder={lang === "fi" ? "Finnish title..." : lang === "en" ? "English title..." : "UK English title..."}
            className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
        </div>
      )}
      {!seoOnly && (
        <div>
          <Label>Content ({lang.toUpperCase()})</Label>
          <RichTextEditor
            value={data.content}
            onChange={v => onChange({ content: v })}
            placeholder={`Write ${lang === "fi" ? "Finnish" : lang === "en" ? "English" : "UK English"} content...`}
          />
        </div>
      )}
      <div className="bg-[#F8F9FD] rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold text-[#474554] uppercase tracking-wider">SEO ({lang.toUpperCase()})</p>
        <div>
          <div className="flex justify-between mb-1">
            <Label>Meta Title</Label>
            <span className={`text-[10px] font-medium ${data.meta_title.length > 54 ? "text-orange-500" : "text-[#787585]"}`}>
              {data.meta_title.length}/60
            </span>
          </div>
          <input type="text" value={data.meta_title} maxLength={60}
            onChange={e => onChange({ meta_title: e.target.value })}
            className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <Label>Meta Description</Label>
            <span className={`text-[10px] font-medium ${data.meta_description.length > 144 ? "text-orange-500" : "text-[#787585]"}`}>
              {data.meta_description.length}/160
            </span>
          </div>
          <textarea rows={2} value={data.meta_description} maxLength={160}
            onChange={e => onChange({ meta_description: e.target.value })}
            className="w-full bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none resize-y" />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => onChange({ is_published: !data.is_published })}
            className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${data.is_published ? "bg-[#2D1783]" : "bg-[#E5E8F0]"}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${data.is_published ? "left-5" : "left-1"}`} />
          </div>
          <span className="text-sm font-semibold text-[#1b1b1c]">
            {data.is_published ? `${lang.toUpperCase()} — published` : `${lang.toUpperCase()} — draft`}
          </span>
        </label>
      </div>
    </div>
  )
}

export function PageForm({ pageSlug, createMode = false }: { pageSlug?: string; createMode?: boolean }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    slug: "", routeKey: "",
    fi: { ...EMPTY_LANG }, en: { ...EMPTY_LANG }, uk: { ...EMPTY_LANG },
  })
  const [isCodeRoute, setIsCodeRoute] = useState(false)
  const [loading, setLoading] = useState(!createMode)
  const [activeLang, setActiveLang] = useState<Lang>("fi")
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "error">("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [slugManual, setSlugManual] = useState(!!pageSlug)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    if (createMode || !pageSlug) return
    fetch(`/api/admin/pages/${encodeURIComponent(pageSlug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        const anyCodeRoute = data.is_code_route || [data.fi, data.en, data.uk].some((r: Record<string, unknown> | undefined) => r?.is_code_route)
        setIsCodeRoute(!!anyCodeRoute)

        const toLangData = (row: Record<string, unknown> | undefined): LangData => ({
          title: (row?.title as string) || "",
          content: (row?.content as string) || "",
          meta_title: (row?.meta_title as string) || "",
          meta_description: (row?.meta_description as string) || "",
          is_published: (row?.is_published as boolean) ?? false,
          url_slug: (row?.slug as string) || "",
        })

        setForm({
          slug: data.slug || pageSlug,
          routeKey: data.route_key || "",
          fi: toLangData(data.fi),
          en: toLangData(data.en),
          uk: toLangData(data.uk),
        })
      })
      .finally(() => setLoading(false))
  }, [pageSlug, createMode])

  const patchLang = useCallback((lang: Lang, p: Partial<LangData>) => {
    setForm(prev => ({ ...prev, [lang]: { ...prev[lang], ...p } }))
  }, [])

  const handleTitleFiChange = (title: string) => {
    patchLang("fi", { title })
    if (createMode && !slugManual) {
      setForm(prev => ({ ...prev, fi: { ...prev.fi, title }, slug: slugify(title) }))
    }
  }

  const save = async () => {
    if (!isCodeRoute && !form.fi.title.trim()) { setSaveError("Finnish title is required"); return }
    if (!isCodeRoute && !form.slug.trim()) { setSaveError("Slug is required"); return }
    setSaved("saving"); setSaveError(null)
    try {
      const endpoint = createMode ? "/api/admin/pages" : `/api/admin/pages/${encodeURIComponent(pageSlug!)}`
      const method = createMode ? "POST" : "PATCH"
      const body: Record<string, unknown> = { is_code_route: isCodeRoute }

      if (isCodeRoute) {
        body.route_key = form.routeKey
        for (const lang of ["fi", "en", "uk"] as Lang[]) {
          const d = form[lang]
          body[lang] = {
            slug: d.url_slug.trim() || form.routeKey,
            meta_title: d.meta_title.trim() || null,
            meta_description: d.meta_description.trim() || null,
            is_published: d.is_published,
          }
        }
      } else {
        body.slug = form.slug.trim()
        for (const lang of ["fi", "en", "uk"] as Lang[]) {
          const d = form[lang]
          if (lang !== "fi" && !d.title.trim()) continue
          body[lang] = {
            title: d.title.trim(),
            content: d.content || null,
            meta_title: d.meta_title.trim() || null,
            meta_description: d.meta_description.trim() || null,
            is_published: d.is_published,
          }
        }
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error((e as { error?: string }).error || `HTTP ${res.status}`)
      }
      if (createMode) {
        router.push(`/admin/pages/${encodeURIComponent(form.slug.trim())}/edit`)
        return
      }
      setSaved("ok")
    } catch (err) {
      setSaved("error")
      setSaveError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setTimeout(() => setSaved("idle"), 4000)
    }
  }

  const handleDelete = async () => {
    if (!pageSlug) return
    const res = await fetch(`/api/admin/pages/${encodeURIComponent(pageSlug)}`, { method: "DELETE" })
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
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">{isCodeRoute ? "code" : "description"}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg text-[#1b1b1c]">
                  {createMode ? "New Page" : (form.fi.title || form.routeKey || "Edit Page")}
                </h1>
                {isCodeRoute && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#2D1783] bg-[#2D1783]/10 px-1.5 py-0.5 rounded-md">Route</span>
                )}
              </div>
              <p className="text-xs text-[#787585] font-mono">
                {isCodeRoute ? `route_key: ${form.routeKey}` : `/${form.slug || "..."}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!createMode && (isCodeRoute ? form.fi.url_slug : form.slug) && (
              <Link href={`/fi/${isCodeRoute ? form.fi.url_slug : form.slug}`} target="_blank"
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

      {/* Code route notice */}
      {isCodeRoute && (
        <div className="mb-5 flex items-start gap-3 bg-[#2D1783]/5 border border-[#2D1783]/20 rounded-xl px-4 py-3.5">
          <span className="material-symbols-outlined text-[#2D1783] text-[18px] flex-shrink-0 mt-0.5">info</span>
          <div>
            <p className="text-sm font-bold text-[#2D1783]">Built-in code route</p>
            <p className="text-xs text-[#474554] mt-0.5">URL slug and SEO can be edited per language below. Page content and layout are controlled by the code.</p>
          </div>
        </div>
      )}

      {/* Slug (shared across all langs — only for regular pages) */}
      {!isCodeRoute && (
        <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <Label>Slug <span className="text-[#E74C3C]">*</span></Label>
                {createMode && <span className="text-[10px] text-[#787585]">{slugManual ? "manual" : "auto from FI title"}</span>}
              </div>
              <input type="text" value={form.slug}
                onChange={e => { setSlugManual(true); setForm(prev => ({ ...prev, slug: e.target.value })) }}
                placeholder="page-slug"
                className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none" />
            </div>
            <div className="text-xs text-[#787585] space-y-0.5 flex-shrink-0 pt-6">
              <p>slotsband.com/fi/{form.slug || "..."}</p>
              <p>slotsband.com/en/{form.slug || "..."}</p>
              <p>slotsband.com/uk/{form.slug || "..."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Language tabs */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
          <span className="material-symbols-outlined text-[#2D1783] text-[18px]">translate</span>
          <h3 className="text-sm font-bold text-[#1b1b1c]">
            {isCodeRoute ? "Slug & SEO per Language" : "Content per Language"}
          </h3>
        </div>
        <div className="flex border-b border-[#E5E8F0] px-5">
          {(["fi", "en", "uk"] as Lang[]).map(l => (
            <button key={l} type="button" onClick={() => setActiveLang(l)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeLang === l ? "border-[#2D1783] text-[#2D1783]" : "border-transparent text-[#787585] hover:text-[#1b1b1c]"
              }`}>
              <span>{LANG_FLAGS[l]}</span>
              {l.toUpperCase()}
              {form[l].is_published && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] ml-0.5" title="Published" />
              )}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeLang === "fi" && (
            <LangCard lang="fi" data={form.fi} seoOnly={isCodeRoute}
              onChange={p => {
                if (!isCodeRoute && "title" in p && typeof p.title === "string") handleTitleFiChange(p.title)
                else patchLang("fi", p)
              }} />
          )}
          {activeLang === "en" && <LangCard lang="en" data={form.en} seoOnly={isCodeRoute} onChange={p => patchLang("en", p)} />}
          {activeLang === "uk" && <LangCard lang="uk" data={form.uk} seoOnly={isCodeRoute} onChange={p => patchLang("uk", p)} />}
        </div>
      </div>

      {/* Delete */}
      {!createMode && !isCodeRoute && (
        <div className="mt-5 bg-white rounded-2xl border border-red-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-red-100 bg-red-50/50">
            <span className="material-symbols-outlined text-red-500 text-[18px]">delete_forever</span>
            <h3 className="text-sm font-bold text-red-700">Danger Zone</h3>
          </div>
          <div className="p-5">
            {deleteConfirm ? (
              <div className="flex items-center gap-3">
                <p className="text-xs text-red-700 font-medium flex-1">Delete all language versions of this page?</p>
                <button type="button" onClick={handleDelete}
                  className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-colors">Delete</button>
                <button type="button" onClick={() => setDeleteConfirm(false)}
                  className="text-xs font-bold text-[#474554] bg-[#F8F9FD] border border-[#E5E8F0] px-4 py-2 rounded-xl">Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => setDeleteConfirm(true)}
                className="text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
                Delete Page (all languages)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
