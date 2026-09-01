"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RichTextEditor } from "@/components/admin/RichTextEditor"

type Lang = "fi" | "en" | "uk"
const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }
const LANG_LABEL: Record<Lang, string> = { fi: "FI", en: "EN", uk: "UK" }

const DIFF_FIELD_LABELS: Record<string, string> = {
  slug_fi: "Slug (FI)", slug_en: "Slug (EN)", slug_uk: "Slug (UK)",
  title_fi: "Title (FI)", title_en: "Title (EN)", title_uk: "Title (UK)",
  excerpt_fi: "Excerpt (FI)", excerpt_en: "Excerpt (EN)", excerpt_uk: "Excerpt (UK)",
  content_fi: "Content (FI)", content_en: "Content (EN)", content_uk: "Content (UK)",
  featured_image_url: "Featured Image",
  meta_title_fi: "Meta Title (FI)", meta_title_en: "Meta Title (EN)", meta_title_uk: "Meta Title (UK)",
  meta_description_fi: "Meta Description (FI)", meta_description_en: "Meta Description (EN)", meta_description_uk: "Meta Description (UK)",
}
const DIFF_HTML_FIELDS = new Set(["content_fi", "content_en", "content_uk"])

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html
  const div = document.createElement("div")
  div.innerHTML = html
  return div.textContent || ""
}

// Word-level LCS diff — cheap enough for article-length text, with a size
// guard so pathologically long fields fall back to a plain before/after.
function wordDiff(oldText: string, newText: string): { type: "same" | "add" | "del"; text: string }[] | null {
  const oldWords = oldText.split(/(\s+)/).filter(Boolean)
  const newWords = newText.split(/(\s+)/).filter(Boolean)
  const m = oldWords.length, n = newWords.length
  if (m * n > 3_000_000) return null

  const dp: Uint32Array[] = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = oldWords[i] === newWords[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const result: { type: "same" | "add" | "del"; text: string }[] = []
  let i = 0, j = 0
  while (i < m && j < n) {
    if (oldWords[i] === newWords[j]) { result.push({ type: "same", text: oldWords[i] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { result.push({ type: "del", text: oldWords[i] }); i++ }
    else { result.push({ type: "add", text: newWords[j] }); j++ }
  }
  while (i < m) { result.push({ type: "del", text: oldWords[i] }); i++ }
  while (j < n) { result.push({ type: "add", text: newWords[j] }); j++ }
  return result
}

type DiffTok = { type: "same" | "add" | "del"; text: string }

// Collapses long unchanged stretches down to a short "N words unchanged"
// marker, keeping a few words of context on each side of every change —
// so reviewing a one-word edit doesn't mean scrolling a whole article.
function collapseUnchanged(diff: DiffTok[], context = 10, minCollapse = 24): (DiffTok | { collapsed: DiffTok[] })[] {
  const runs: { type: DiffTok["type"]; tokens: DiffTok[] }[] = []
  for (const t of diff) {
    const last = runs[runs.length - 1]
    if (last && last.type === t.type) last.tokens.push(t)
    else runs.push({ type: t.type, tokens: [t] })
  }

  const out: (DiffTok | { collapsed: DiffTok[] })[] = []
  runs.forEach((run, idx) => {
    if (run.type !== "same" || run.tokens.length <= minCollapse) {
      out.push(...run.tokens)
      return
    }
    const head = idx === 0 ? [] : run.tokens.slice(0, context)
    const tail = idx === runs.length - 1 ? [] : run.tokens.slice(-context)
    const hiddenTokens = run.tokens.slice(head.length, run.tokens.length - tail.length)
    out.push(...head)
    if (hiddenTokens.length > 0) out.push({ collapsed: hiddenTokens })
    out.push(...tail)
  })
  return out
}

// Click-to-expand "N words unchanged" marker — an inline accordion so a
// reviewer can peek at hidden context without permanently un-collapsing it.
function CollapsedSegment({ tokens }: { tokens: DiffTok[] }) {
  const [open, setOpen] = useState(false)
  if (open) {
    return (
      <span>
        <button type="button" onClick={() => setOpen(false)}
          className="inline-flex items-center align-middle text-[11px] text-[#787585] hover:text-[#2D1783] mx-1">
          <span className="material-symbols-outlined text-[14px]">expand_less</span>
        </button>
        {tokens.map((t, i) => <span key={i}>{t.text}</span>)}
      </span>
    )
  }
  return (
    <button type="button" onClick={() => setOpen(true)}
      className="inline-flex items-center gap-0.5 align-middle text-[11px] text-[#B0ADB8] hover:text-[#2D1783] italic mx-1">
      ⋯ {tokens.length} words unchanged
      <span className="material-symbols-outlined text-[14px]">expand_more</span>
    </button>
  )
}

function DiffText({ oldText, newText }: { oldText: string; newText: string }) {
  const diff = wordDiff(oldText, newText)
  if (!diff) {
    return (
      <div className="space-y-1.5 text-sm max-h-64 overflow-y-auto">
        <p className="text-red-600 line-through decoration-red-400">{oldText}</p>
        <p className="text-green-700">{newText}</p>
      </div>
    )
  }
  const collapsed = collapseUnchanged(diff)
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
      {collapsed.map((part, idx) => {
        if ("collapsed" in part) {
          return <CollapsedSegment key={idx} tokens={part.collapsed} />
        }
        if (part.type === "same") return <span key={idx}>{part.text}</span>
        if (part.type === "del") return <span key={idx} className="bg-red-100 text-red-700 line-through decoration-red-400">{part.text}</span>
        return <span key={idx} className="bg-green-100 text-green-800">{part.text}</span>
      })}
    </p>
  )
}

function prettifyField(field: string): string {
  return DIFF_FIELD_LABELS[field] ?? field.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

function formatHistoryValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—"
  if (typeof v === "boolean") return v ? "Yes" : "No"
  if (Array.isArray(v)) return v.length > 0 ? v.join(", ") : "—"
  if (typeof v === "object") return JSON.stringify(v).slice(0, 60)
  return String(v).slice(0, 100)
}

function formatHistoryDate(iso: string | undefined): string {
  if (!iso) return "—"
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

const AUDIT_ACTION_STYLE: Record<string, string> = {
  create: "bg-[#27AE60]/10 text-[#27AE60]",
  approve: "bg-[#27AE60]/10 text-[#27AE60]",
  submit: "bg-amber-500/10 text-amber-700",
  reject: "bg-red-500/10 text-red-600",
  delete: "bg-red-500/10 text-red-600",
  update: "bg-[#2D1783]/10 text-[#2D1783]",
}

interface AuditEntry {
  id: string
  action: "create" | "submit" | "update" | "approve" | "reject" | "delete"
  actor_email: string | null
  changes: { field: string; old: unknown; new: unknown }[] | null
  note: string | null
  created_at: string
}

function ChangeHistory({ history, loading }: { history: AuditEntry[]; loading: boolean }) {
  if (loading) return <p className="text-xs text-[#787585]">Loading history...</p>
  if (history.length === 0) return <p className="text-xs text-[#787585]">No changes recorded yet.</p>
  return (
    <ul className="divide-y divide-[#F0EDEE]">
      {history.map(entry => (
        <li key={entry.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${AUDIT_ACTION_STYLE[entry.action] ?? "bg-[#F0F1F5] text-[#787585]"}`}>
                {entry.action}
              </span>
              <span className="text-xs font-semibold text-[#1b1b1c]">{entry.actor_email ?? "Unknown"}</span>
            </div>
            <span className="text-[10px] text-[#787585] whitespace-nowrap">{formatHistoryDate(entry.created_at)}</span>
          </div>
          {entry.note && <p className="mt-1.5 text-[11px] text-[#474554] italic">"{entry.note}"</p>}
          {entry.changes && entry.changes.length > 0 && (
            <ul className="mt-2 space-y-1 pl-1">
              {entry.changes.map((c, i) => (
                <li key={i} className="text-[11px] text-[#474554]">
                  <span className="font-semibold">{prettifyField(c.field)}:</span>{" "}
                  <span className="text-[#787585]">{formatHistoryValue(c.old)}</span>
                  {" → "}
                  <span className="text-[#1b1b1c] font-medium">{formatHistoryValue(c.new)}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}

function extractImageSrcs(html: string): string[] {
  if (typeof document === "undefined" || !html) return []
  const div = document.createElement("div")
  div.innerHTML = html
  return Array.from(div.querySelectorAll("img")).map(img => img.getAttribute("src") || "").filter(Boolean)
}

function ImageThumb({ src, label }: { src: string | null; label: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wider mb-1">{label}</p>
      {src ? (
        <img src={src} alt="" className="w-full aspect-video object-cover rounded-lg border border-[#E5E8F0]" />
      ) : (
        <div className="w-full aspect-video rounded-lg border border-dashed border-[#E5E8F0] flex items-center justify-center text-[#B0ADB8] text-xs">
          None
        </div>
      )}
    </div>
  )
}

function ImageListDiff({ oldHtml, newHtml }: { oldHtml: string; newHtml: string }) {
  const oldSrcs = new Set(extractImageSrcs(oldHtml))
  const newSrcs = extractImageSrcs(newHtml)
  const added = newSrcs.filter(s => !oldSrcs.has(s))
  const removed = Array.from(oldSrcs).filter(s => !new Set(newSrcs).has(s))
  if (added.length === 0 && removed.length === 0) return null
  return (
    <div className="mt-3 space-y-2">
      {added.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1.5">Images added ({added.length})</p>
          <div className="flex flex-wrap gap-2">
            {added.map((src, i) => (
              <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-green-300" />
            ))}
          </div>
        </div>
      )}
      {removed.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1.5">Images removed ({removed.length})</p>
          <div className="flex flex-wrap gap-2">
            {removed.map((src, i) => (
              <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-red-300 opacity-60" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// One collapsible row per changed field — keeps the panel scannable when
// several fields (or a full article body) changed at once.
function CollapsibleField({ label, defaultOpen, children }: { label: string; defaultOpen: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-[#E5E8F0] rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white hover:bg-[#F8F9FD] transition-colors">
        <span className="text-xs font-bold text-[#474554] uppercase tracking-wider">{label}</span>
        <span className="material-symbols-outlined text-[18px] text-[#787585]">{open ? "expand_less" : "expand_more"}</span>
      </button>
      {open && <div className="px-4 pb-4 pt-1 bg-[#F8F9FD]">{children}</div>}
    </div>
  )
}

function ProposedChanges({ live, pending }: { live: Record<string, unknown>; pending: Record<string, unknown> }) {
  const changedFields = Object.keys(DIFF_FIELD_LABELS).filter(key => {
    if (!(key in pending)) return false
    return String(live[key] ?? "") !== String(pending[key] ?? "")
  })

  if (changedFields.length === 0) {
    return <p className="text-sm text-[#787585]">No content changes — the submission matches what's already live.</p>
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#787585] mb-1">{changedFields.length} field{changedFields.length === 1 ? "" : "s"} changed — click to expand.</p>
      {changedFields.map((key, idx) => {
        const oldVal = String(live[key] ?? "")
        const newVal = String(pending[key] ?? "")
        const isHtml = DIFF_HTML_FIELDS.has(key)

        if (key === "featured_image_url") {
          return (
            <CollapsibleField key={key} label={DIFF_FIELD_LABELS[key]} defaultOpen={idx === 0}>
              <div className="grid grid-cols-2 gap-3">
                <ImageThumb src={oldVal || null} label="Current" />
                <ImageThumb src={newVal || null} label="Proposed" />
              </div>
            </CollapsibleField>
          )
        }

        return (
          <CollapsibleField key={key} label={DIFF_FIELD_LABELS[key]} defaultOpen={idx === 0}>
            <DiffText oldText={isHtml ? stripHtml(oldVal) : oldVal} newText={isHtml ? stripHtml(newVal) : newVal} />
            {isHtml && <ImageListDiff oldHtml={oldVal} newHtml={newVal} />}
          </CollapsibleField>
        )
      })}
    </div>
  )
}

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
  review_status?: "approved" | "pending" | "rejected"
  review_note?: string | null
  pending_data?: Record<string, unknown> | null
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
  review_status: "approved", review_note: null,
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
  const [role, setRole] = useState<"admin" | "editor">("admin")
  const isEditor = role === "editor"
  const [history, setHistory] = useState<AuditEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const uploadFolder = form.slug_fi || postId || "new"
  const [uploadingFeatured, setUploadingFeatured] = useState(false)
  const [featuredUploadError, setFeaturedUploadError] = useState<string | null>(null)

  async function handleFeaturedFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setFeaturedUploadError(null)
    setUploadingFeatured(true)
    try {
      const body = new FormData()
      body.set("file", file)
      body.set("slug", uploadFolder)
      body.set("bucket", "blog-images")
      body.set("field", "featured")
      const res = await fetch("/api/admin/upload", { method: "POST", body })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error((errBody as { error?: string }).error || `HTTP ${res.status}`)
      }
      const { url } = await res.json()
      patch({ featured_image_url: url })
    } catch (err) {
      setFeaturedUploadError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploadingFeatured(false)
    }
  }

  useEffect(() => {
    if (createMode || !postId) return
    fetch(`/api/admin/blog-posts/${postId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setForm(data) })
      .finally(() => setLoading(false))
  }, [postId, createMode])

  const loadHistory = useCallback(() => {
    if (createMode || !postId) return
    setHistoryLoading(true)
    fetch(`/api/admin/blog-posts/${postId}/history`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setHistory(data) })
      .finally(() => setHistoryLoading(false))
  }, [postId, createMode])

  useEffect(() => { loadHistory() }, [loadHistory])

  useEffect(() => {
    fetch("/api/admin/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => setRole(data?.role === "editor" ? "editor" : "admin"))
      .catch(() => {})
  }, [])

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
      loadHistory()
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

  const approve = async () => {
    if (!postId) return
    const res = await fetch(`/api/admin/blog-posts/${postId}/approve`, { method: "POST" })
    if (res.ok) { setForm(await res.json()); loadHistory() }
  }

  const reject = async () => {
    if (!postId) return
    const note = window.prompt("Reason for rejecting this article (optional):") || ""
    const res = await fetch(`/api/admin/blog-posts/${postId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    })
    if (res.ok) { setForm(await res.json()); loadHistory() }
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
      {/* Header — not sticky: nested sticky positioning here visually
          corrupted the content below it (its reserved flow space didn't
          match its stuck render position, causing a ~40px overlap). */}
      <div className="bg-[#F8F9FD] border-b border-[#E5E8F0] -mx-6 px-6 py-3 mb-6">
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
            {!createMode && form.is_active && (
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
                : isEditor
                  ? (createMode ? "Submit for Review" : "Submit Changes for Review")
                  : (createMode ? "Create Article" : "Save Changes")}
            </button>
          </div>
        </div>
      </div>

      {!createMode && form.review_status === "pending" && (
        <div className="mb-5 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">pending_actions</span>
          <span>{form.is_active ? "This edit is awaiting admin approval — the live article is unaffected until then." : "Awaiting admin approval before this article goes live."}</span>
        </div>
      )}
      {!createMode && form.review_status === "rejected" && (
        <div className={`mb-5 flex items-start gap-2 border text-sm rounded-xl px-4 py-3 ${
          form.is_active ? "bg-orange-50 border-orange-200 text-orange-800" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">error</span>
          <span>
            {form.is_active
              ? "This article is still live — only your proposed edit was rejected by admin"
              : "Rejected by admin"}
            {form.review_note ? `: "${form.review_note}"` : "."} Revise and submit again.
          </span>
        </div>
      )}

      {!isEditor && form.pending_data && (form.review_status === "pending" || form.review_status === "rejected") && (
        <div className="mb-5 bg-white rounded-2xl border border-amber-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-amber-200 bg-amber-50">
            <span className="material-symbols-outlined text-amber-700 text-[18px]">difference</span>
            <h3 className="text-sm font-bold text-amber-900">Proposed Changes</h3>
          </div>
          <div className="p-5">
            <ProposedChanges live={form as unknown as Record<string, unknown>} pending={form.pending_data} />
          </div>
        </div>
      )}

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
                    <RichTextEditor value={form.content_fi || ""} onChange={v => patch({ content_fi: v || null })} placeholder="Write article content..." uploadFolder={uploadFolder} />
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
                    <RichTextEditor value={form.content_en || ""} onChange={v => patch({ content_en: v || null })} placeholder="Write English content..." uploadFolder={uploadFolder} />
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
                    <RichTextEditor value={form.content_uk || ""} onChange={v => patch({ content_uk: v || null })} placeholder="Write UK English content..." uploadFolder={uploadFolder} />
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
            <div className="p-5 space-y-3">
              {!isEditor && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => patch({ is_active: !form.is_active })}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${form.is_active ? "bg-[#2D1783]" : "bg-[#E5E8F0]"}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? "left-5" : "left-1"}`} />
                  </div>
                  <span className="text-sm font-semibold text-[#1b1b1c]">
                    {form.is_active ? "Active — visible on site" : "Draft — hidden from site"}
                  </span>
                </label>
              )}
              {isEditor && (
                <p className="text-sm text-[#787585]">
                  {form.review_status === "pending" ? "Awaiting admin approval."
                    : form.review_status === "rejected" ? (form.is_active ? "Live — your edit was rejected." : "Rejected — not published.")
                    : form.is_active ? "Live on site." : "Not yet published."}
                </p>
              )}
              {!isEditor && !createMode && form.review_status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={approve}
                    className="flex-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 py-2 rounded-xl transition-colors">Approve</button>
                  <button type="button" onClick={reject}
                    className="flex-1 text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 py-2 rounded-xl transition-colors">Reject</button>
                </div>
              )}
            </div>
          </div>

          {/* Publish date */}
          {!isEditor && (
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
          )}

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
              <label className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#474554] bg-white border border-[#E5E8F0] hover:border-[#2D1783] px-3 py-2 rounded-xl transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[14px]">{uploadingFeatured ? "hourglass_empty" : "upload"}</span>
                {uploadingFeatured ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden disabled={uploadingFeatured} onChange={handleFeaturedFile} />
              </label>
              {featuredUploadError && <p className="text-[11px] text-red-600">{featuredUploadError}</p>}
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
          {!createMode && !isEditor && (
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

      {!createMode && (
        <div className="mt-6 bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
            <span className="material-symbols-outlined text-[#2D1783] text-[18px]">history</span>
            <h3 className="text-sm font-bold text-[#1b1b1c]">Change History</h3>
          </div>
          <div className="p-5">
            <ChangeHistory history={history} loading={historyLoading} />
          </div>
        </div>
      )}
    </div>
  )
}
