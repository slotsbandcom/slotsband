"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { Casino } from "@/lib/types"
import { RichTextEditor } from "@/components/admin/RichTextEditor"

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "general",    label: "General Info",      icon: "info" },
  { id: "affiliate",  label: "Affiliate Links",   icon: "link" },
  { id: "licensing",  label: "Licensing",         icon: "verified_user" },
  { id: "bonuses",    label: "Bonuses",           icon: "redeem" },
  { id: "payments",   label: "Payments",          icon: "payment" },
  { id: "games",      label: "Games & Software",  icon: "sports_esports" },
  { id: "ux",         label: "UX & Support",      icon: "devices" },
  { id: "content_fi", label: "Content FI",        icon: "flag" },
  { id: "content_en", label: "Content EN",        icon: "flag" },
  { id: "content_uk", label: "Content UK",        icon: "flag" },
  { id: "media",      label: "Media",             icon: "perm_media" },
  { id: "ai",         label: "AI Populate",       icon: "auto_awesome" },
]

const LANGUAGES = ["fi", "en", "uk", "se", "no", "de", "pl", "es", "pt"]
const COUNTRIES = ["FI","SE","NO","DK","DE","NL","BE","AT","CH","CA","AU","NZ","IE","GB","US"]
const LICENSE_AUTHORITIES = [
  "MGA","UKGC","Gibraltar","Isle of Man","Spelinspektionen",
  "Kahnawake","Curacao eGaming","Curaçao Gaming Control Board","Antillephone N.V.",
  "PAGCOR","Anjouan Gaming Board","Government of Belize","Comoros Island Gaming Authority",
  "Veikkaus","Other",
]

const LICENSE_TRUST_SCORES: Record<string, number> = {
  "UKGC": 90, "MGA": 85, "Spelinspektionen": 85, "Gibraltar": 80,
  "Isle of Man": 80, "Veikkaus": 80,
  "Kahnawake": 65, "Curacao eGaming": 55, "Curaçao Gaming Control Board": 55,
  "Antillephone N.V.": 50, "PAGCOR": 50, "Anjouan Gaming Board": 35,
  "Government of Belize": 35, "Comoros Island Gaming Authority": 30,
}
const PAYMENT_METHODS = ["Visa","Mastercard","Trustly","Brite","Zimpler","PayPal","Skrill","Neteller","MuchBetter","Paysafecard","Bank Transfer","Bitcoin","Ethereum","Litecoin","Tether","Apple Pay","Google Pay","Revolut","Klarna","Swish","MobilePay","Vipps","Interac"]
const CURRENCIES = ["EUR","GBP","USD","SEK","NOK","DKK","CAD","BTC","ETH"]
const GAME_PROVIDERS = ["NetEnt","Microgaming","Play'n GO","Pragmatic Play","Evolution Gaming","Yggdrasil","Big Time Gaming","Red Tiger","Relax Gaming","Hacksaw Gaming","Push Gaming","Nolimit City","Elk Studios","Blueprint Gaming","Quickspin","Thunderkick","Betsoft","Playtech","IGT","WMS","Novomatic"]
const AI_FIELDS = ["General","Licensing","Bonuses","Payments","Games","UX","Content FI","Content EN"]

// ─── Reusable sub-components ─────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-[#474554] mb-1">{children}</label>
}
function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input
        {...props}
        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-xl px-3 py-2 text-sm text-[#1b1b1c] placeholder:text-[#b0adb8] transition-colors"
      />
    </div>
  )
}
function Textarea({ label, maxLength, value, onChange, placeholder, rows = 4 }: {
  label?: string; maxLength?: number; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div>
      {label && (
        <div className="flex justify-between mb-1">
          <Label>{label}</Label>
          {maxLength && <span className={`text-[10px] font-medium ${String(value).length > maxLength * 0.9 ? "text-red-500" : "text-[#787585]"}`}>{String(value).length}/{maxLength}</span>}
        </div>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-xl px-3 py-2 text-sm text-[#1b1b1c] placeholder:text-[#b0adb8] transition-colors resize-none"
      />
    </div>
  )
}
function MediaUpload({
  value, onChange, bucket, field, slug, hint, aspect = "square",
}: {
  value?: string | null | undefined; onChange: (url: string) => void
  bucket: string; field: string; slug: string; hint?: string; aspect?: "square" | "wide"
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file); fd.append("slug", slug)
      fd.append("bucket", bucket); fd.append("field", field)
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const json = await res.json() as { url?: string; error?: string }
      if (json.url) onChange(json.url)
      else alert(json.error ?? "Upload failed")
    } catch { alert("Upload failed") }
    finally { setUploading(false) }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const imgClass = aspect === "wide"
    ? "w-full h-28 object-cover rounded-xl border border-[#E5E8F0] mb-2"
    : "w-full h-full object-contain rounded-xl"

  return (
    <div className="space-y-2">
      {value ? (
        <div className={aspect === "wide" ? "" : "w-20 h-20 rounded-xl bg-[#F8F9FD] border border-[#E5E8F0] relative"}>
          <img src={value} alt="" className={imgClass} />
          <button type="button" onClick={() => onChange("")}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            title="Remove">
            <span className="material-symbols-outlined text-white text-[12px]">close</span>
          </button>
        </div>
      ) : null}
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }} />
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={[
          "border-2 border-dashed rounded-2xl p-4 text-center transition-colors",
          uploading ? "opacity-60 cursor-wait" : "cursor-pointer",
          dragOver ? "border-[#2D1783] bg-[#F5F3FF]" : "border-[#E5E8F0] hover:border-[#2D1783]",
        ].join(" ")}
      >
        <span className={`material-symbols-outlined text-[24px] block mb-1 ${uploading ? "animate-spin" : "text-[#787585]"}`}>
          {uploading ? "refresh" : "upload"}
        </span>
        <p className="text-xs font-semibold text-[#474554]">
          {uploading ? "Uploading…" : "Drop image or click to browse"}
        </p>
        {hint && !uploading && <p className="text-[10px] text-[#787585] mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[#F0EDEE] last:border-0">
      <div>
        <p className="text-sm font-semibold text-[#1b1b1c]">{label}</p>
        {description && <p className="text-xs text-[#787585] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${checked ? "bg-[#2D1783]" : "bg-[#E5E8F0]"}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${checked ? "left-5" : "left-1"}`} />
      </button>
    </div>
  )
}
function SectionCard({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
      {title && (
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
          {icon && <span className="material-symbols-outlined text-[#2D1783] text-[18px]">{icon}</span>}
          <h3 className="text-sm font-bold text-[#1b1b1c]">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
function CheckboxGrid({ label, items, selected, onChange }: { label: string; items: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (item: string) => onChange(selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item])
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-1">
        {items.map(item => (
          <button key={item} type="button" onClick={() => toggle(item)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors ${selected.includes(item) ? "bg-[#2D1783] text-white border-[#2D1783]" : "bg-white text-[#474554] border-[#E5E8F0] hover:border-[#2D1783]"}`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button type="button" onClick={copy}
      className="flex items-center gap-1 text-xs font-semibold text-[#2D1783] bg-[#2D1783]/8 hover:bg-[#2D1783]/15 px-2.5 py-1.5 rounded-lg transition-colors">
      <span className="material-symbols-outlined text-[13px]">{copied ? "check" : "content_copy"}</span>
      {copied ? "Copied" : "Copy"}
    </button>
  )
}
function ListEditor({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("")
  const add = () => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft("") } }
  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-1.5 mb-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2">
            <span className="material-symbols-outlined text-[#787585] text-[14px] cursor-grab">drag_indicator</span>
            <span className="flex-1 text-sm text-[#1b1b1c]">{item}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-[#787585] hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder || "Add item..."}
          className="flex-1 bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-xl px-3 py-2 text-sm" />
        <button type="button" onClick={add} className="bg-[#2D1783] text-white text-xs font-bold px-3 rounded-xl hover:bg-[#3e2db2] transition-colors">Add</button>
      </div>
    </div>
  )
}
function FaqEditor({ faqs, onChange }: { faqs: { q: string; a: string }[]; onChange: (v: { q: string; a: string }[]) => void }) {
  const add = () => onChange([...faqs, { q: "", a: "" }])
  const update = (i: number, field: "q" | "a", val: string) => {
    const copy = [...faqs]; copy[i] = { ...copy[i], [field]: val }; onChange(copy)
  }
  return (
    <div>
      <Label>FAQ</Label>
      <div className="space-y-3 mb-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-bold text-[#787585]">#{i + 1}</span>
              <button type="button" onClick={() => onChange(faqs.filter((_, j) => j !== i))} className="text-[#787585] hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            </div>
            <input value={faq.q} onChange={e => update(i, "q", e.target.value)} placeholder="Question..."
              className="w-full bg-white border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-lg px-3 py-2 text-sm" />
            <textarea value={faq.a} onChange={e => update(i, "a", e.target.value)} placeholder="Answer..." rows={2}
              className="w-full bg-white border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-bold text-[#2D1783] hover:text-[#3e2db2] transition-colors">
        <span className="material-symbols-outlined text-[16px]">add_circle</span> Add FAQ
      </button>
    </div>
  )
}
function RatingSlider({ label, value, onChange, min = 0, max = 10, step = 0.1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <Label>{label}</Label>
        <span className="text-xs font-bold text-[#2D1783]">{value}</span>
      </div>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none bg-[#E5E8F0] accent-[#2D1783]" />
        <input type="number" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-16 bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-lg px-2 py-1 text-sm text-center" />
      </div>
    </div>
  )
}

function TrustScoreField({ value, onChange, licenseAuthority, establishedYear, liveChatSupport, mobileOptimized, vipProgram }: {
  value: number
  onChange: (v: number) => void
  licenseAuthority?: string | null
  establishedYear?: number | null
  liveChatSupport?: boolean | null
  mobileOptimized?: boolean | null
  vipProgram?: boolean | null
}) {
  const suggestion = useMemo(() => {
    if (!licenseAuthority) return null
    let base = LICENSE_TRUST_SCORES[licenseAuthority] ?? 30
    if (establishedYear && establishedYear < 2015) base += 5
    if (liveChatSupport) base += 3
    if (mobileOptimized) base += 2
    if (vipProgram) base += 2
    return Math.min(100, base)
  }, [licenseAuthority, establishedYear, liveChatSupport, mobileOptimized, vipProgram])

  const badge =
    value >= 86 ? { label: "Excellent trust", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "🟢" }
    : value >= 71 ? { label: "Good trust",    cls: "text-green-700 bg-green-50 border-green-200",     dot: "🟢" }
    : value >= 41 ? { label: "Medium trust",  cls: "text-amber-700 bg-amber-50 border-amber-200",     dot: "🟡" }
    :               { label: "Low trust",     cls: "text-red-700 bg-red-50 border-red-200",           dot: "🔴" }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label>Trust Score (0–100)</Label>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.dot} {badge.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <input type="range" min={0} max={100} step={1} value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none bg-[#E5E8F0] accent-[#2D1783]" />
        <input type="number" min={0} max={100} step={1} value={value}
          onChange={e => onChange(parseInt(e.target.value) || 0)}
          className="w-16 bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-lg px-2 py-1 text-sm text-center" />
      </div>
      {suggestion !== null && suggestion !== value && (
        <div className="mt-2 flex items-center gap-2 text-xs bg-[#2D1783]/5 border border-[#2D1783]/15 rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-[#2D1783] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="flex-1 text-[#474554]">Suggested based on license: <strong className="text-[#2D1783]">{suggestion}</strong></span>
          <button type="button" onClick={() => onChange(suggestion)}
            className="text-[10px] font-bold text-[#2D1783] hover:underline flex-shrink-0">Apply</button>
        </div>
      )}
      <p className="text-[10px] text-[#787585] mt-1.5">Based on license, history and player reviews. Can be manually adjusted.</p>
    </div>
  )
}

// ─── Content tab (FI/EN/UK) ───────────────────────────────────────────────────

function ContentTab({ lang, form, onChange }: {
  lang: "fi" | "en" | "uk"
  form: Casino
  onChange: (patch: Partial<Casino>) => void
}) {
  const metaTitle = (form[`meta_title_${lang}` as keyof Casino] as string) ?? ""
  const metaDesc = (form[`meta_description_${lang}` as keyof Casino] as string) ?? ""
  const review = (form[`review_${lang}` as keyof Casino] as string) ?? ""
  const pros = (form[`pros_${lang}` as keyof Casino] as string[]) ?? []
  const cons = (form[`cons_${lang}` as keyof Casino] as string[]) ?? []
  const faqs = (form[`faq_${lang}` as keyof Casino] as { q: string; a: string }[]) ?? []

  return (
    <div className="space-y-4">
      {lang === "uk" && (
        <SectionCard title="UK Compliance" icon="gavel">
          <div className="space-y-0">
            <Toggle label="GamStop Compliance" checked={false} onChange={() => {}} description="Casino complies with GamStop self-exclusion" />
            <Toggle label="UKGC License Required" checked={false} onChange={() => {}} description="Display UKGC license notice on page" />
          </div>
        </SectionCard>
      )}
      <SectionCard title="SEO" icon="search">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <Label>Meta Title</Label>
              <span className={`text-[10px] font-medium ${metaTitle.length > 54 ? "text-orange-500" : "text-[#787585]"}`}>{metaTitle.length}/60</span>
            </div>
            <input value={metaTitle} onChange={e => onChange({ [`meta_title_${lang}`]: e.target.value })}
              maxLength={60}
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-xl px-3 py-2 text-sm" />
          </div>
          <Textarea label="Meta Description" maxLength={160} value={metaDesc}
            onChange={v => onChange({ [`meta_description_${lang}`]: v })}
            placeholder="Compelling meta description..." />
        </div>
      </SectionCard>
      <SectionCard title="Review Content" icon="article">
        <div>
          <label className="block text-xs font-bold text-[#474554] mb-2">Full Review</label>
          <RichTextEditor
            value={review}
            onChange={v => onChange({ [`review_${lang}`]: v })}
            placeholder="Write detailed casino review..."
          />
        </div>
      </SectionCard>
      <SectionCard title="Pros & Cons" icon="compare">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ListEditor label="Pros" items={pros} onChange={v => onChange({ [`pros_${lang}`]: v })} placeholder="Add a pro..." />
          <ListEditor label="Cons" items={cons} onChange={v => onChange({ [`cons_${lang}`]: v })} placeholder="Add a con..." />
        </div>
      </SectionCard>
      <SectionCard title="FAQ" icon="help">
        <FaqEditor faqs={faqs} onChange={v => onChange({ [`faq_${lang}`]: v })} />
      </SectionCard>
    </div>
  )
}

// ─── AI Populate tab ─────────────────────────────────────────────────────────

interface AiApiResponse {
  success: boolean
  data: Record<string, unknown>
}

const AI_META_KEYS = new Set(["data_sources", "data_confidence", "summary", "_sources"])

function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined) return true
  if (typeof v === "string") return v === ""
  if (Array.isArray(v)) return v.length === 0
  return false
}

function formatAiValue(v: unknown): string {
  if (v === null || v === undefined) return "—"
  if (typeof v === "boolean") return v ? "Yes" : "No"
  if (Array.isArray(v)) return v.length > 0 ? `[${v.length} items: ${v.slice(0, 3).join(", ")}${v.length > 3 ? "…" : ""}]` : "[]"
  if (typeof v === "object") return JSON.stringify(v).slice(0, 60)
  return String(v).slice(0, 80)
}

function AiPopulateTab({ casinoName, casinoSlug, casinoId, currentForm, onApply }: {
  casinoName: string
  casinoSlug: string
  casinoId: string
  currentForm: Casino
  onApply: (data: Partial<Casino>) => void
}) {
  const [regenerateReview, setRegenerateReview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [apiResponse, setApiResponse] = useState<AiApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [applyMsg, setApplyMsg] = useState<string | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [progress, setProgress] = useState<"researching" | "generating" | null>(null)

  const generate = async () => {
    setLoading(true); setError(null); setApiResponse(null); setApplyMsg(null); setApplyError(null)
    try {
      // Step 1: factual data with web search
      setProgress("researching")
      const res1 = await fetch("/api/admin/ai-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ casinoName }),
      })
      const json1 = await res1.json()
      if (!res1.ok) throw new Error(json1.error || "Research failed")

      // Step 2: content generation (non-fatal if it fails)
      setProgress("generating")
      let contentData: Record<string, unknown> = {}
      try {
        const res2 = await fetch("/api/admin/ai-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ casinoName, facts: json1.data, regenerateReview }),
        })
        const json2 = await res2.json()
        if (res2.ok && json2.data) contentData = json2.data
      } catch {
        // Step 2 failure is non-fatal — show Step 1 data only
        console.warn("[AI Populate] Content generation failed — showing research data only")
      }

      const merged = { ...json1.data, ...contentData }
      setApiResponse({ success: true, data: merged })

      const auto = new Set<string>()
      for (const [key, val] of Object.entries(merged)) {
        if (!AI_META_KEYS.has(key) && !isEmptyValue(val)) auto.add(key)
      }
      setSelectedKeys(auto)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  const saveToDb = async (patch: Record<string, unknown>): Promise<boolean> => {
    if (!casinoId) {
      setApplyError("Casino ID missing — save the casino record first, then retry.")
      return false
    }
    setSaving(true)
    setApplyError(null)
    try {
      console.log("[AI Populate] Saving to Supabase — casino:", casinoId)
      console.log("[AI Populate] Patch data:", JSON.stringify(patch, null, 2))
      const res = await fetch(`/api/admin/casinos/${casinoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      const json = await res.json()
      if (!res.ok) {
        console.error("[AI Populate] PATCH failed:", json)
        throw new Error((json as { error?: string }).error || `HTTP ${res.status}`)
      }
      console.log("[AI Populate] PATCH success — updated row:", JSON.stringify(json, null, 2))
      return true
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed"
      console.error("[AI Populate] Save error:", msg)
      setApplyError(msg)
      return false
    } finally {
      setSaving(false)
    }
  }

  const doApply = async (patch: Record<string, unknown>, count: number) => {
    onApply(patch as Partial<Casino>)
    const ok = await saveToDb(patch)
    if (ok) {
      setApplyMsg(`Applied & saved ${count} field${count !== 1 ? "s" : ""} to Supabase`)
      setTimeout(() => setApplyMsg(null), 5000)
    }
  }

  const applySelected = async () => {
    if (!apiResponse || selectedKeys.size === 0) return
    const patch: Record<string, unknown> = {}
    for (const key of selectedKeys) {
      if (!AI_META_KEYS.has(key) && key in apiResponse.data) patch[key] = apiResponse.data[key]
    }
    await doApply(patch, Object.keys(patch).length)
  }

  const applyAll = async () => {
    if (!apiResponse) return
    const patch: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(apiResponse.data)) {
      if (!AI_META_KEYS.has(key) && !isEmptyValue(val)) patch[key] = val
    }
    await doApply(patch, Object.keys(patch).length)
  }

  // Build diff list from API result vs current form
  const diffItems = apiResponse ? Object.entries(apiResponse.data)
    .filter(([key, val]) => !AI_META_KEYS.has(key) && !isEmptyValue(val))
    .map(([key, newVal]) => {
      const currentVal = (currentForm as unknown as Record<string, unknown>)[key]
      const status: "new" | "update" | "same" =
        isEmptyValue(currentVal) ? "new"
        : JSON.stringify(currentVal) !== JSON.stringify(newVal) ? "update"
        : "same"
      return { key, newVal, status }
    }) : []

  const newCount = diffItems.filter(i => i.status === "new").length
  const updateCount = diffItems.filter(i => i.status === "update").length

  return (
    <div className="space-y-4">
      <SectionCard title="AI Casino Research" icon="auto_awesome">
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-[#2D1783]/8 to-[#FFD700]/8 border border-[#2D1783]/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#2D1783] text-[28px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <div>
                <p className="font-bold text-[#1b1b1c] text-sm">AI Casino Research</p>
                <p className="text-xs text-[#787585] mt-0.5 leading-relaxed">
                  Uses Claude AI to generate structured casino data, pros/cons, FAQs, and SEO fields based on its knowledge of {casinoName}.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label>Casino</Label>
            <div className="flex items-center gap-2 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5">
              <span className="material-symbols-outlined text-[#787585] text-[16px]">casino</span>
              <span className="text-sm font-semibold text-[#1b1b1c]">{casinoName}</span>
              <span className="text-xs text-[#787585] ml-1">({casinoSlug})</span>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={regenerateReview}
                onChange={e => setRegenerateReview(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${regenerateReview ? "bg-[#F39C12] border-[#F39C12]" : "bg-white border-[#E5E8F0] group-hover:border-[#F39C12]"}`}>
                {regenerateReview && <span className="material-symbols-outlined text-white text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1b1b1c]">
                Regenerate review text
                <span className="ml-1.5 text-[9px] font-bold bg-[#F39C12]/15 text-[#F39C12] px-1.5 py-0.5 rounded uppercase tracking-wide">Overwrites existing</span>
              </p>
              <p className="text-[10px] text-[#787585] mt-0.5 leading-relaxed">
                Generates unique review_fi + review_en using extracted data. Leave unchecked to keep your edited review text.
              </p>
            </div>
          </label>

          <button type="button" onClick={generate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#2D1783] text-white font-bold py-3 rounded-xl hover:bg-[#3e2db2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{progress === "researching" ? "🔍 Researching casino data..." : "✍️ Generating content..."}</>
              : <><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>Populate with AI</>
            }
          </button>
          {loading && (
            <div className="flex items-center gap-3 text-[10px] text-[#787585]">
              <span className={`flex items-center gap-1 ${progress === "researching" ? "text-[#2D1783] font-bold" : progress === "generating" ? "text-[#27AE60]" : ""}`}>
                {progress === "researching" ? <span className="w-2 h-2 rounded-full bg-[#2D1783] animate-pulse inline-block" /> : <span className="w-2 h-2 rounded-full bg-[#27AE60] inline-block" />}
                Step 1: Research
              </span>
              <span className="text-[#C5C3CE]">→</span>
              <span className={`flex items-center gap-1 ${progress === "generating" ? "text-[#2D1783] font-bold" : "text-[#C5C3CE]"}`}>
                {progress === "generating" && <span className="w-2 h-2 rounded-full bg-[#2D1783] animate-pulse inline-block" />}
                Step 2: Content
              </span>
            </div>
          )}
        </div>
      </SectionCard>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-red-500 text-[18px] flex-shrink-0">error</span>
          <div>
            <p className="text-sm font-bold text-red-700">Research failed</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {apiResponse && (
        <>
          {/* Diff preview */}
          <SectionCard title={`Diff Preview — ${newCount} new, ${updateCount} updates`} icon="difference">
            {diffItems.length === 0 ? (
              <p className="text-sm text-[#787585] text-center py-4">No data could be extracted from the sources.</p>
            ) : (
              <div className="space-y-1">
                {/* Toolbar */}
                <div className="flex items-center gap-3 pb-2 mb-1 border-b border-[#E5E8F0] sticky top-0 bg-white z-10">
                  <button type="button"
                    onClick={() => setSelectedKeys(new Set(diffItems.filter(i => i.status !== "same").map(i => i.key)))}
                    className="text-xs font-bold text-[#2D1783] hover:underline">Select changed</button>
                  <button type="button"
                    onClick={() => setSelectedKeys(new Set(diffItems.map(i => i.key)))}
                    className="text-xs font-bold text-[#2D1783] hover:underline">Select all</button>
                  <button type="button"
                    onClick={() => setSelectedKeys(new Set())}
                    className="text-xs font-bold text-[#787585] hover:underline">Clear</button>
                  <span className="text-xs text-[#787585] ml-auto">{selectedKeys.size} selected</span>
                </div>
                {/* Field rows */}
                <div className="max-h-80 overflow-y-auto space-y-0.5 pr-1">
                  {diffItems.map(({ key, newVal, status }) => {
                    const s = {
                      new:    { bg: "bg-[#27AE60]/6 border-[#27AE60]/20",  badge: "bg-[#27AE60]/15 text-[#27AE60]",  label: "NEW" },
                      update: { bg: "bg-[#F39C12]/6 border-[#F39C12]/20",  badge: "bg-[#F39C12]/15 text-[#F39C12]",  label: "UPDATE" },
                      same:   { bg: "bg-[#F8F9FD] border-[#E5E8F0]",       badge: "bg-[#E5E8F0] text-[#787585]",     label: "SAME" },
                    }[status]
                    return (
                      <label key={key} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity ${s.bg}`}>
                        <input type="checkbox" checked={selectedKeys.has(key)}
                          onChange={e => {
                            const next = new Set(selectedKeys)
                            e.target.checked ? next.add(key) : next.delete(key)
                            setSelectedKeys(next)
                          }}
                          className="w-3.5 h-3.5 accent-[#2D1783] flex-shrink-0"
                        />
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${s.badge}`}>{s.label}</span>
                        <span className="text-[11px] font-mono text-[#474554] flex-shrink-0 w-36 truncate">{key}</span>
                        <span className="text-[11px] text-[#787585] flex-1 truncate">{formatAiValue(newVal)}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Apply buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <button type="button" onClick={applySelected} disabled={selectedKeys.size === 0 || saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#2D1783] text-white font-bold py-2.5 rounded-xl hover:bg-[#3e2db2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <span className="material-symbols-outlined text-[16px]">checklist</span>}
                Apply Selected ({selectedKeys.size})
              </button>
              <button type="button" onClick={applyAll} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#27AE60] text-white font-bold py-2.5 rounded-xl hover:bg-[#219a52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <span className="material-symbols-outlined text-[16px]">done_all</span>}
                {saving ? "Saving..." : "Apply All & Save"}
              </button>
            </div>
            {applyMsg && (
              <div className="flex items-center gap-2 text-sm text-[#27AE60] font-medium">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {applyMsg}
              </div>
            )}
            {applyError && (
              <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span className="flex-1">{applyError}</span>
                <button type="button" onClick={() => setApplyError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const EMPTY_CASINO = (slug: string): Casino => ({
  id: "", slug, name: slug, rank: 99, rating: 7.0, trust_score: 70,
  is_active: false, is_featured: false, is_new: false, is_pikakasino: false,
  affiliate_url: "", mene_slug: slug, languages_supported: [], available_in: [],
  restricted_in: [], payment_methods: [], currencies_accepted: [],
  game_providers: [], support_languages: [],
})

export default function CasinoEditPage() {
  const params = useParams()
  const slug = params.slug as string

  const [form, setForm] = useState<Casino>(EMPTY_CASINO(slug))
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("general")
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "error">("idle")
  const [saveError, setSaveError] = useState<string | null>(null)

  // Fetch casino from Supabase on mount
  useEffect(() => {
    fetch(`/api/admin/casinos/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setForm(data)
      })
      .finally(() => setLoading(false))
  }, [slug])

  const patch = useCallback((p: Partial<Casino>) => {
    setForm(prev => ({ ...prev, ...p }))
  }, [])

  const save = async () => {
    setSaved("saving")
    setSaveError(null)
    try {
      const endpoint = form.id
        ? `/api/admin/casinos/${form.id}`
        : `/api/admin/casinos/${slug}`
      const method = form.id ? "PATCH" : "POST"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error((errData as { error?: string }).error || `HTTP ${res.status}`)
      }
      const updated = await res.json()
      if (updated?.id) setForm(updated)
      setSaved("ok")
    } catch (err) {
      setSaved("error")
      setSaveError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setTimeout(() => { setSaved("idle") }, 4000)
    }
  }

  // UTM builder state
  const [utmCampaign, setUtmCampaign] = useState(form.slug)
  const [utmContent, setUtmContent] = useState("")
  const generatedUrl = `${form.affiliate_url}${form.affiliate_url.includes("?") ? "&" : "?"}utm_source=slotsband&utm_medium=affiliate&utm_campaign=${utmCampaign}${utmContent ? `&utm_content=${utmContent}` : ""}`

  const prettyLinks = [
    { lang: "fi", url: `/fi/mene/${form.mene_slug}/` },
    { lang: "en", url: `/en/mene/${form.mene_slug}/` },
    { lang: "uk", url: `/uk/mene/${form.mene_slug}/` },
  ]

  const [nofollow, setNofollow] = useState(true)
  const [sponsored, setSponsored] = useState(true)
  const [noopener, setNoopener] = useState(true)
  const [newTab, setNewTab] = useState(true)
  const relAttr = [nofollow && "nofollow", sponsored && "sponsored", noopener && "noopener"].filter(Boolean).join(" ")
  const aTag = `<a href="/fi/mene/${form.mene_slug}"\n   ${newTab ? 'target="_blank"\n   ' : ""}${relAttr ? `rel="${relAttr}"\n   ` : ""}>\n  Pelaa nyt\n</a>`

  // Mock link stats
  const MOCK_STATS = { total: 12480, month: 1847, last: "2026-07-19 08:41", by_lang: { fi: 68, en: 22, uk: 10 } }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#2D1783] border-t-transparent animate-spin" />
          <p className="text-sm text-[#787585] font-medium">Loading casino data...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="sticky top-16 z-30 bg-[#F8F9FD] border-b border-[#E5E8F0] -mx-6 px-6 py-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/casinos" className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-[#E5E8F0] hover:border-[#2D1783] transition-colors">
              <span className="material-symbols-outlined text-[16px] text-[#474554]">arrow_back</span>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-[#2D1783]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">casino</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg text-[#1b1b1c]">{form.name}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${form.is_active ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                  {form.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-[#787585]">Last modified: Today at 09:15</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/fi/nettikasinot/${form.slug}`} target="_blank"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#474554] bg-white border border-[#E5E8F0] hover:border-[#2D1783] px-3 py-2 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              View on site
            </Link>
            <button type="button" onClick={save} disabled={saved === "saving"}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-70 ${
                saved === "ok" ? "bg-[#27AE60] text-white"
                : saved === "error" ? "bg-red-500 text-white"
                : "bg-[#2D1783] text-white hover:bg-[#3e2db2]"
              }`}>
              <span className="material-symbols-outlined text-[14px]">
                {saved === "ok" ? "check" : saved === "error" ? "error" : saved === "saving" ? "hourglass_empty" : "save"}
              </span>
              {saved === "ok" ? "Saved!" : saved === "error" ? "Error!" : saved === "saving" ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-[15px] flex-shrink-0 mt-0.5">error</span>
          <span><strong>Save failed:</strong> {saveError}</span>
          <button type="button" onClick={() => setSaveError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Vertical tab sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden sticky top-36">
            {TABS.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold transition-colors border-b border-[#F0EDEE] last:border-0 ${activeTab === tab.id ? "bg-[#2D1783] text-white" : "text-[#474554] hover:bg-[#F8F9FD]"}`}>
                <span className="material-symbols-outlined text-[15px] flex-shrink-0">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* TAB 1 — General */}
          {activeTab === "general" && (
            <>
              <SectionCard title="Basic Info" icon="badge">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Casino Name" value={form.name} onChange={e => patch({ name: e.target.value })} />
                  <div>
                    <Input label="Slug" value={form.slug} onChange={e => patch({ slug: e.target.value, mene_slug: e.target.value })} />
                    <p className="text-[10px] text-[#787585] mt-1">slotsband.com/fi/nettikasinot/{form.slug}/</p>
                  </div>
                  <Input label="Established Year" type="number" value={form.established_year ?? ""} onChange={e => patch({ established_year: parseInt(e.target.value) })} />
                  <Input label="Rank" type="number" value={form.rank} onChange={e => patch({ rank: parseInt(e.target.value) })} />
                </div>
              </SectionCard>
              <SectionCard title="Ratings" icon="star">
                <div className="space-y-4">
                  <RatingSlider label="Rating (0–10)" value={form.rating} onChange={v => patch({ rating: v })} min={0} max={10} step={0.1} />
                  <TrustScoreField
                    value={form.trust_score}
                    onChange={v => patch({ trust_score: v })}
                    licenseAuthority={form.license_authority}
                    establishedYear={form.established_year}
                    liveChatSupport={form.live_chat_support}
                    mobileOptimized={form.mobile_optimized}
                    vipProgram={form.vip_program}
                  />
                </div>
              </SectionCard>
              <SectionCard title="Flags" icon="flag">
                <div className="space-y-0">
                  <Toggle label="Active" checked={form.is_active} onChange={v => patch({ is_active: v })} description="Show on the site" />
                  <Toggle label="Featured" checked={form.is_featured} onChange={v => patch({ is_featured: v })} description="Show on homepage featured section" />
                  <Toggle label="New" checked={form.is_new} onChange={v => patch({ is_new: v })} description="Shows 'New' badge on casino card" />
                  <Toggle label="Pikakasino" checked={!!form.is_pikakasino} onChange={v => patch({ is_pikakasino: v })} description="Finnish no-registration casino" />
                </div>
              </SectionCard>
              <SectionCard title="Languages & Countries" icon="language">
                <div className="space-y-5">
                  <CheckboxGrid label="Languages Supported" items={LANGUAGES} selected={form.languages_supported} onChange={v => patch({ languages_supported: v })} />
                  <CheckboxGrid label="Available In" items={COUNTRIES} selected={form.available_in} onChange={v => patch({ available_in: v })} />
                  <CheckboxGrid label="Restricted In" items={COUNTRIES} selected={form.restricted_in} onChange={v => patch({ restricted_in: v })} />
                </div>
              </SectionCard>
            </>
          )}

          {/* TAB 2 — Affiliate Links */}
          {activeTab === "affiliate" && (
            <>
              <SectionCard title="Affiliate URL" icon="link">
                <div className="space-y-4">
                  <Input label="Raw Affiliate URL" value={form.affiliate_url} onChange={e => patch({ affiliate_url: e.target.value })} placeholder="https://..." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="utm_source" value="slotsband" readOnly />
                    <Input label="utm_medium" value="affiliate" readOnly />
                    <Input label="utm_campaign" value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} />
                    <Input label="utm_content" value={utmContent} onChange={e => setUtmContent(e.target.value)} placeholder="optional" />
                  </div>
                  <div>
                    <Label>Generated URL</Label>
                    <div className="flex items-center gap-2 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5">
                      <span className="flex-1 text-xs text-[#474554] font-mono break-all">{generatedUrl}</span>
                      <CopyButton text={generatedUrl} />
                    </div>
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Pretty Links" icon="link">
                <div className="space-y-2">
                  {prettyLinks.map(({ lang, url }) => (
                    <div key={lang} className="flex items-center gap-2 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2.5">
                      <span className="text-xs font-bold uppercase text-[#2D1783] w-5">{lang}</span>
                      <span className="flex-1 text-xs font-mono text-[#474554]">slotsband.com{url}</span>
                      <CopyButton text={`https://slotsband.com${url}`} />
                    </div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Link Stats (Preview)" icon="bar_chart">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[{ label: "Total Clicks", value: MOCK_STATS.total.toLocaleString(), icon: "click" }, { label: "This Month", value: MOCK_STATS.month.toLocaleString(), icon: "calendar_month" }, { label: "Last Click", value: MOCK_STATS.last.split(" ")[0], icon: "schedule" }].map(s => (
                    <div key={s.label} className="bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl p-3 text-center">
                      <span className="material-symbols-outlined text-[#2D1783] text-[20px] block mb-1">{s.icon}</span>
                      <p className="text-base font-bold text-[#1b1b1c]">{s.value}</p>
                      <p className="text-[10px] text-[#787585]">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Clicks by Language</Label>
                  <div className="space-y-2 mt-1">
                    {Object.entries(MOCK_STATS.by_lang).map(([lang, pct]) => (
                      <div key={lang} className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase text-[#787585] w-5">{lang}</span>
                        <div className="flex-1 bg-[#E5E8F0] rounded-full h-2">
                          <div className="h-2 rounded-full bg-[#2D1783] transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#474554]">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Link Settings & Code Generator" icon="code">
                <div className="space-y-4">
                  <div className="space-y-0">
                    <Toggle label="Open in new tab" checked={newTab} onChange={setNewTab} />
                    <Toggle label="rel=nofollow" checked={nofollow} onChange={setNofollow} />
                    <Toggle label="rel=sponsored" checked={sponsored} onChange={setSponsored} />
                    <Toggle label="rel=noopener" checked={noopener} onChange={setNoopener} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Generated {'<a>'} tag</Label>
                      <CopyButton text={aTag} />
                    </div>
                    <pre className="bg-[#0d0820] text-green-400 text-xs font-mono rounded-xl p-4 overflow-x-auto">{aTag}</pre>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* TAB 3 — Licensing */}
          {activeTab === "licensing" && (
            <>
              <SectionCard title="License Details" icon="verified_user">
                {(() => {
                  const isCustom = !!form.license_authority && !LICENSE_AUTHORITIES.includes(form.license_authority)
                  const dropdownVal = isCustom ? "Other" : (form.license_authority ?? "")
                  const suggestedScore = LICENSE_TRUST_SCORES[form.license_authority ?? ""] ?? 0
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label>License Authority</Label>
                        <select value={dropdownVal}
                          onChange={e => {
                            const val = e.target.value
                            patch({ license_authority: val === "Other" ? "" : val })
                            const score = LICENSE_TRUST_SCORES[val] ?? 0
                            if (score > 0 && (!form.trust_score || form.trust_score === 70)) {
                              patch({ trust_score: score })
                            }
                          }}
                          className="w-full bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-xl px-3 py-2 text-sm">
                          <option value="">Select authority...</option>
                          {LICENSE_AUTHORITIES.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        {(dropdownVal === "Other" || isCustom) && (
                          <input
                            type="text"
                            placeholder="Enter license authority name..."
                            value={isCustom ? (form.license_authority ?? "") : ""}
                            onChange={e => patch({ license_authority: e.target.value })}
                            className="mt-2 w-full bg-[#F8F9FD] border border-[#F39C12] focus:border-[#2D1783] focus:outline-none rounded-xl px-3 py-2 text-sm text-[#1b1b1c] placeholder:text-[#b0adb8]"
                          />
                        )}
                        {suggestedScore > 0 && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[11px] text-[#787585]">Suggested trust score for this license:</span>
                            <button type="button"
                              onClick={() => patch({ trust_score: suggestedScore })}
                              className="text-[11px] font-bold text-[#2D1783] hover:underline">
                              {suggestedScore} (apply)
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Verification Status</Label>
                        <select value={form.is_verified === true ? "verified" : form.is_verified === false ? "unverified" : ""}
                          onChange={e => patch({ is_verified: e.target.value === "verified" })}
                          className="w-full bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-xl px-3 py-2 text-sm">
                          <option value="">Select...</option>
                          <option value="verified">Verified</option>
                          <option value="unverified">Unverified</option>
                        </select>
                      </div>
                      <div>{/* spacer */}</div>
                      <Input label="License Number" value={form.license_number ?? ""} onChange={e => patch({ license_number: e.target.value })} />
                      <Input label="License URL" type="url" value={form.license_url ?? ""} onChange={e => patch({ license_url: e.target.value })} placeholder="https://..." />
                    </div>
                  )
                })()}
              </SectionCard>
            </>
          )}

          {/* TAB 4 — Bonuses */}
          {activeTab === "bonuses" && (
            <>
              <SectionCard title="Welcome Bonus" icon="redeem">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input label="Welcome Bonus Text" value={form.welcome_bonus_text ?? ""} onChange={e => patch({ welcome_bonus_text: e.target.value })} placeholder="e.g. 200% up to 500€ + 100 Free Spins" />
                  </div>
                  <Input label="Bonus Percent (%)" type="number" value={form.welcome_bonus_percent ?? ""} onChange={e => patch({ welcome_bonus_percent: parseInt(e.target.value) })} />
                  <Input label="Max Amount" type="number" value={form.welcome_bonus_max_amount ?? ""} onChange={e => patch({ welcome_bonus_max_amount: parseInt(e.target.value) })} />
                  <div>
                    <Label>Currency</Label>
                    <select value={form.welcome_bonus_currency ?? "EUR"} onChange={e => patch({ welcome_bonus_currency: e.target.value })}
                      className="w-full bg-[#F8F9FD] border border-[#E5E8F0] focus:border-[#2D1783] focus:outline-none rounded-xl px-3 py-2 text-sm">
                      {["EUR","GBP","USD","SEK","NOK"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <Input label="Min Deposit" type="number" value={form.welcome_bonus_min_deposit ?? ""} onChange={e => patch({ welcome_bonus_min_deposit: parseInt(e.target.value) })} />
                  <Input label="Wagering (x)" type="number" value={form.welcome_bonus_wagering ?? ""} onChange={e => patch({ welcome_bonus_wagering: parseInt(e.target.value) })} />
                  <Input label="Valid for Days" type="number" placeholder="e.g. 30" />
                  <Input label="Bonus Terms URL" type="url" placeholder="https://..." />
                </div>
              </SectionCard>
              <SectionCard title="Other Bonuses" icon="card_giftcard">
                <div className="space-y-0">
                  <Toggle label="No Deposit Bonus" checked={!!form.no_deposit_bonus} onChange={v => patch({ no_deposit_bonus: v })} />
                  {form.no_deposit_bonus && (
                    <div className="py-3 px-1 grid grid-cols-2 gap-3">
                      <Input label="No Deposit Amount" type="number" value={form.no_deposit_amount ?? ""} onChange={e => patch({ no_deposit_amount: parseInt(e.target.value) })} />
                    </div>
                  )}
                  <Toggle label="Reload Bonus" checked={false} onChange={() => {}} />
                  <Toggle label="Cashback" checked={!!form.cashback_percent} onChange={() => {}} />
                  {form.cashback_percent !== undefined && (
                    <div className="py-3 px-1"><Input label="Cashback %" type="number" value={form.cashback_percent ?? ""} onChange={e => patch({ cashback_percent: parseInt(e.target.value) })} /></div>
                  )}
                </div>
              </SectionCard>
              <SectionCard title="Free Spins" icon="autorenew">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Free Spins Amount" type="number" value={form.free_spins_amount ?? ""} onChange={e => patch({ free_spins_amount: parseInt(e.target.value) })} />
                  <Input label="Free Spins Game" value={form.free_spins_game ?? ""} onChange={e => patch({ free_spins_game: e.target.value })} placeholder="e.g. Book of Dead" />
                </div>
              </SectionCard>
              <SectionCard title="Programs" icon="workspace_premium">
                <div className="space-y-0">
                  <Toggle label="Loyalty Program" checked={!!form.loyalty_program} onChange={v => patch({ loyalty_program: v })} />
                  <Toggle label="VIP Program" checked={!!form.vip_program} onChange={v => patch({ vip_program: v })} />
                </div>
              </SectionCard>
            </>
          )}

          {/* TAB 5 — Payments */}
          {activeTab === "payments" && (
            <>
              <SectionCard title="Deposit & Withdrawal Limits" icon="account_balance_wallet">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Min Deposit (€)" type="number" value={form.min_deposit ?? ""} onChange={e => patch({ min_deposit: parseInt(e.target.value) })} />
                  <Input label="Max Withdrawal / Day (€)" type="number" value={form.max_withdrawal_per_day ?? ""} onChange={e => patch({ max_withdrawal_per_day: parseInt(e.target.value) })} />
                  <Input label="Max Withdrawal / Week (€)" type="number" />
                  <Input label="Max Withdrawal / Month (€)" type="number" value={form.max_withdrawal_per_month ?? ""} onChange={e => patch({ max_withdrawal_per_month: parseInt(e.target.value) })} />
                  <Input label="Withdrawal Min (hours)" type="number" value={form.withdrawal_time_min_hours ?? ""} onChange={e => patch({ withdrawal_time_min_hours: parseInt(e.target.value) })} />
                  <Input label="Withdrawal Max (hours)" type="number" value={form.withdrawal_time_max_hours ?? ""} onChange={e => patch({ withdrawal_time_max_hours: parseInt(e.target.value) })} />
                  <div>
                    <Input label="Withdrawal Time Display" placeholder="e.g. 0-24 hours" />
                    <p className="text-[10px] text-[#787585] mt-1">Shown to users on casino page</p>
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Payment Methods" icon="credit_card">
                <CheckboxGrid label="" items={PAYMENT_METHODS} selected={form.payment_methods ?? []} onChange={v => patch({ payment_methods: v })} />
              </SectionCard>
              <SectionCard title="Currencies" icon="currency_exchange">
                <CheckboxGrid label="" items={CURRENCIES} selected={form.currencies_accepted ?? []} onChange={v => patch({ currencies_accepted: v })} />
              </SectionCard>
            </>
          )}

          {/* TAB 6 — Games */}
          {activeTab === "games" && (
            <>
              <SectionCard title="Game Counts" icon="casino">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input label="Total Games" type="number" value={form.total_games_count ?? ""} onChange={e => patch({ total_games_count: parseInt(e.target.value) })} />
                  <Input label="Slots" type="number" value={form.slots_count ?? ""} onChange={e => patch({ slots_count: parseInt(e.target.value) })} />
                  <Input label="Live Casino" type="number" />
                  <Input label="Table Games" type="number" />
                </div>
              </SectionCard>
              <SectionCard title="Game Types" icon="grid_view">
                <div className="space-y-0">
                  <Toggle label="Live Casino" checked={!!form.live_casino} onChange={v => patch({ live_casino: v })} />
                  <Toggle label="Sports Betting" checked={!!form.sports_betting} onChange={v => patch({ sports_betting: v })} />
                  <Toggle label="Poker" checked={!!form.poker} onChange={v => patch({ poker: v })} />
                  <Toggle label="Jackpot Games" checked={!!form.jackpot_games} onChange={v => patch({ jackpot_games: v })} />
                  <Toggle label="Demo Play Available" checked={!!form.game_demo_available} onChange={v => patch({ game_demo_available: v })} />
                </div>
              </SectionCard>
              <SectionCard title="Game Providers" icon="business">
                <CheckboxGrid label="" items={GAME_PROVIDERS} selected={form.game_providers ?? []} onChange={v => patch({ game_providers: v })} />
              </SectionCard>
            </>
          )}

          {/* TAB 7 — UX & Support */}
          {activeTab === "ux" && (
            <>
              <SectionCard title="Mobile" icon="smartphone">
                <div className="space-y-0">
                  <Toggle label="Mobile Optimized" checked={!!form.mobile_optimized} onChange={v => patch({ mobile_optimized: v })} />
                  <Toggle label="iOS App" checked={!!form.mobile_app_ios} onChange={v => patch({ mobile_app_ios: v })} />
                  {form.mobile_app_ios && <div className="py-2 px-1"><Input label="App Store URL" type="url" placeholder="https://apps.apple.com/..." /></div>}
                  <Toggle label="Android App" checked={!!form.mobile_app_android} onChange={v => patch({ mobile_app_android: v })} />
                  {form.mobile_app_android && <div className="py-2 px-1"><Input label="Play Store URL" type="url" placeholder="https://play.google.com/..." /></div>}
                </div>
              </SectionCard>
              <SectionCard title="Support" icon="support_agent">
                <div className="space-y-0">
                  <Toggle label="Live Chat" checked={!!form.live_chat_support} onChange={v => patch({ live_chat_support: v })} />
                  {form.live_chat_support && <div className="py-2 px-1"><Input label="Live Chat Hours" placeholder="e.g. 24/7 or 09:00-23:00" /></div>}
                  <Toggle label="Email Support" checked={!!form.support_email} onChange={v => patch({ support_email: v })} />
                  {form.support_email && <div className="py-2 px-1"><Input label="Support Email" type="email" placeholder="support@casino.com" /></div>}
                  <Toggle label="Phone Support" checked={!!form.support_phone} onChange={v => patch({ support_phone: v })} />
                  {form.support_phone && <div className="py-2 px-1"><Input label="Phone Number" type="tel" /></div>}
                </div>
                <div className="mt-4">
                  <CheckboxGrid label="Support Languages" items={LANGUAGES} selected={form.support_languages} onChange={v => patch({ support_languages: v })} />
                </div>
              </SectionCard>
              <SectionCard title="KYC & Registration" icon="how_to_reg">
                <div className="space-y-4">
                  <Toggle label="KYC Required" checked={!!form.kyc_required} onChange={v => patch({ kyc_required: v })} description="Players must verify identity before withdrawing" />
                  {form.kyc_required && (
                    <CheckboxGrid label="KYC Documents" items={["ID", "Proof of Address", "Payment Proof"]}
                      selected={form.kyc_documents ?? []}
                      onChange={v => patch({ kyc_documents: v })} />
                  )}
                  <RatingSlider label="Registration Steps (1–5)" value={form.registration_steps ?? 3} onChange={v => patch({ registration_steps: v })} min={1} max={5} step={1} />
                  <Input label="Account Verification Time (hours)" type="number" placeholder="e.g. 24"
                    value={form.account_verification_time ?? ""}
                    onChange={e => patch({ account_verification_time: e.target.value ? parseInt(e.target.value) : undefined })} />
                </div>
              </SectionCard>
            </>
          )}

          {/* TABS 8–10 — Content */}
          {activeTab === "content_fi" && <ContentTab lang="fi" form={form} onChange={patch} />}
          {activeTab === "content_en" && <ContentTab lang="en" form={form} onChange={patch} />}
          {activeTab === "content_uk" && <ContentTab lang="uk" form={form} onChange={patch} />}

          {/* TAB 11 — Media */}
          {activeTab === "media" && (
            <>
              <SectionCard title="Logo" icon="image">
                <div className="flex items-start gap-5">
                  <MediaUpload
                    value={form.logo_url} slug={slug}
                    bucket="casino-logos" field="logo"
                    hint="PNG, SVG, WebP · max 2 MB"
                    onChange={url => patch({ logo_url: url || undefined })}
                  />
                  <div className="flex-1">
                    <Input label="Or enter logo URL directly" value={form.logo_url ?? ""}
                      onChange={e => patch({ logo_url: e.target.value || undefined })} placeholder="https://..." />
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Banner / Hero Image" icon="panorama">
                <MediaUpload
                  value={form.banner_url} slug={slug}
                  bucket="casino-banners" field="banner"
                  aspect="wide" hint="Recommended: 1200 × 400 px · max 2 MB"
                  onChange={url => patch({ banner_url: url || undefined })}
                />
                <div className="mt-2">
                  <Input label="Or enter banner URL directly" value={form.banner_url ?? ""}
                    onChange={e => patch({ banner_url: e.target.value || undefined })} placeholder="https://..." />
                </div>
              </SectionCard>
              <SectionCard title="Screenshot Gallery" icon="photo_library">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {(form.screenshots ?? []).map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt={`Screenshot ${i + 1}`} className="w-full aspect-video object-cover rounded-xl border border-[#E5E8F0]" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <button type="button" onClick={() => patch({ screenshots: form.screenshots?.filter((_, j) => j !== i) })}
                          className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  <MediaUpload
                    value={null} slug={slug}
                    bucket="casino-screenshots" field={`screenshot-${(form.screenshots?.length ?? 0) + 1}`}
                    aspect="wide" hint="Add screenshot"
                    onChange={url => { if (url) patch({ screenshots: [...(form.screenshots ?? []), url] }) }}
                  />
                </div>
              </SectionCard>
              <SectionCard title="Video Review" icon="play_circle">
                <div className="space-y-3">
                  <Input label="YouTube Video URL" value={form.video_review_url ?? ""} onChange={e => patch({ video_review_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                  {form.video_review_url && (
                    <div className="aspect-video rounded-xl overflow-hidden border border-[#E5E8F0]">
                      <iframe
                        src={`https://www.youtube.com/embed/${form.video_review_url.match(/v=([^&]+)/)?.[1] ?? ""}`}
                        className="w-full h-full"
                        allowFullScreen
                        title="Video review"
                      />
                    </div>
                  )}
                </div>
              </SectionCard>
            </>
          )}

          {/* TAB 12 — AI Populate */}
          {activeTab === "ai" && <AiPopulateTab casinoName={form.name} casinoSlug={form.slug} casinoId={form.id} currentForm={form} onApply={patch} />}
        </div>
      </div>
    </div>
  )
}
