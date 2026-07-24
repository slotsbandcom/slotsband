"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RichTextEditor } from "@/components/admin/RichTextEditor"

type Lang = "fi" | "en" | "uk"
const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }
const LANG_LABEL: Record<Lang, string> = { fi: "FI", en: "EN", uk: "UK" }

const TAXONOMIES = [
  "casino-category", "bonus-category", "deposit-method", "withdrawal-method",
  "software", "vendor", "licence", "game-category",
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

interface TermFormPageProps {
  termId: string | null
  defaultTaxonomy?: string
}

export function TermFormPage({ termId, defaultTaxonomy }: TermFormPageProps) {
  const router = useRouter()
  const isEdit = !!termId

  const [activeLang, setActiveLang] = useState<Lang>("fi")
  const [taxonomy, setTaxonomy] = useState(
    defaultTaxonomy && TAXONOMIES.includes(defaultTaxonomy) ? defaultTaxonomy : "casino-category"
  )

  // Names
  const [nameFi, setNameFi] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [nameUk, setNameUk] = useState("")

  // Slugs — separate per lang, auto-generate from name unless manual
  const [slugFi, setSlugFi] = useState("")
  const [slugEn, setSlugEn] = useState("")
  const [slugUk, setSlugUk] = useState("")
  const [slugFiManual, setSlugFiManual] = useState(isEdit)
  const [slugEnManual, setSlugEnManual] = useState(isEdit)
  const [slugUkManual, setSlugUkManual] = useState(isEdit)

  // Descriptions
  const [descFi, setDescFi] = useState("")
  const [descEn, setDescEn] = useState("")
  const [descUk, setDescUk] = useState("")

  const [icon, setIcon] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [sortOrder, setSortOrder] = useState("0")
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState<"idle" | "saving" | "ok" | "error">("idle")
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!termId) return
    fetch(`/api/admin/taxonomy-terms/${termId}`)
      .then(r => r.json())
      .then((term: Record<string, unknown>) => {
        setTaxonomy((term.taxonomy as string) ?? "casino-category")
        setNameFi((term.name_fi as string) ?? "")
        setNameEn((term.name_en as string) ?? "")
        setNameUk((term.name_uk as string) ?? "")
        setSlugFi((term.slug_fi as string) ?? "")
        setSlugEn((term.slug_en as string) ?? "")
        setSlugUk((term.slug_uk as string) ?? "")
        setSlugFiManual(true)
        setSlugEnManual(true)
        setSlugUkManual(true)
        setDescFi((term.description_fi as string) ?? "")
        setDescEn((term.description_en as string) ?? "")
        setDescUk((term.description_uk as string) ?? "")
        setIcon((term.icon as string) ?? "")
        setImageUrl((term.image_url as string) ?? "")
        setSortOrder(String(term.sort_order ?? 0))
        setIsActive((term.is_active as boolean) ?? true)
      })
      .finally(() => setLoading(false))
  }, [termId])

  const handleSubmit = async () => {
    if (!nameFi.trim()) { setSaveError("Name (FI) is required"); return }
    if (!slugFi.trim()) { setSaveError("Slug (FI) is required"); return }
    setSaving("saving")
    setSaveError(null)
    try {
      const payload = {
        taxonomy,
        name_fi: nameFi.trim(),
        name_en: nameEn.trim() || null,
        name_uk: nameUk.trim() || null,
        slug_fi: slugFi.trim(),
        slug_en: slugEn.trim() || slugFi.trim(),
        slug_uk: slugUk.trim() || slugFi.trim(),
        description_fi: descFi || null,
        description_en: descEn || null,
        description_uk: descUk || null,
        icon: icon || null,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        sort_order: Number(sortOrder) || 0,
      }
      const res = await fetch(
        isEdit ? `/api/admin/taxonomy-terms/${termId}` : "/api/admin/taxonomy-terms",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      const json = await res.json()
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Save failed")
      setSaving("ok")
      setTimeout(() => router.push(`/admin/taxonomies?tab=${taxonomy}`), 700)
    } catch (e) {
      setSaving("error")
      setSaveError(e instanceof Error ? e.message : "Save failed")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#2D1783] border-t-transparent animate-spin" />
          <p className="text-sm text-[#787585] font-medium">Loading term...</p>
        </div>
      </div>
    )
  }

  const termDisplayName = nameFi || (isEdit ? "Edit Term" : "New Term")

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-16 z-30 bg-[#F8F9FD] border-b border-[#E5E8F0] -mx-6 px-6 py-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/taxonomies?tab=${taxonomy}`}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-[#E5E8F0] hover:border-[#2D1783] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#474554]">arrow_back</span>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-[#2D1783]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">label</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-lg text-[#1b1b1c]">{termDisplayName}</h1>
                <span className="text-[10px] font-bold bg-[#2D1783]/10 text-[#2D1783] px-2 py-0.5 rounded-full">
                  {TAXONOMY_LABELS[taxonomy] ?? taxonomy}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-[#787585] font-mono">{slugFi || "—"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving === "saving"}
            className={`flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-70 ${
              saving === "ok"
                ? "bg-[#27AE60] text-white"
                : saving === "error"
                ? "bg-red-500 text-white"
                : "bg-[#2D1783] text-white hover:bg-[#3e2db2]"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {saving === "ok" ? "check" : saving === "error" ? "error" : saving === "saving" ? "hourglass_empty" : "save"}
            </span>
            {saving === "ok" ? "Saved!" : saving === "error" ? "Error!" : saving === "saving" ? "Saving..." : isEdit ? "Save Changes" : "Create Term"}
          </button>
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
        {/* Left: main content */}
        <div className="xl:col-span-2 space-y-5">
          {/* Taxonomy */}
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">label</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Taxonomy</h3>
            </div>
            <div className="p-5">
              {isEdit ? (
                <div className="inline-flex items-center gap-1.5 bg-[#2D1783]/10 text-[#2D1783] text-sm font-bold px-3 py-2 rounded-xl">
                  <span className="material-symbols-outlined text-[16px]">label</span>
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
          </div>

          {/* Content per language — Name, Slug, Description in each tab */}
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">translate</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Content</h3>
            </div>
            <div className="flex border-b border-[#E5E8F0] px-5">
              {(["fi", "en", "uk"] as Lang[]).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLang(l)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    activeLang === l
                      ? "border-[#2D1783] text-[#2D1783]"
                      : "border-transparent text-[#787585] hover:text-[#1b1b1c]"
                  }`}
                >
                  <span>{LANG_FLAGS[l]}</span> {LANG_LABEL[l]}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {/* FI tab */}
              {activeLang === "fi" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
                        Name (FI) <span className="text-[#E74C3C]">*</span>
                      </label>
                      <input
                        type="text"
                        value={nameFi}
                        onChange={e => {
                          setNameFi(e.target.value)
                          if (!slugFiManual) setSlugFi(slugify(e.target.value))
                        }}
                        placeholder="Finnish name..."
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
                        Slug (FI) <span className="text-[#E74C3C]">*</span>
                      </label>
                      <input
                        type="text"
                        value={slugFi}
                        onChange={e => { setSlugFi(e.target.value); setSlugFiManual(true) }}
                        placeholder="term-slug-fi"
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none"
                      />
                      {!slugFiManual && nameFi && (
                        <p className="text-[10px] text-[#787585] mt-1">Auto-generated from FI name</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
                      Description (FI)
                    </label>
                    <RichTextEditor value={descFi} onChange={setDescFi} placeholder="Finnish description..." minHeight={280} />
                  </div>
                </>
              )}

              {/* EN tab */}
              {activeLang === "en" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
                        Name (EN)
                      </label>
                      <input
                        type="text"
                        value={nameEn}
                        onChange={e => {
                          setNameEn(e.target.value)
                          if (!slugEnManual) setSlugEn(slugify(e.target.value))
                        }}
                        placeholder="English name..."
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
                        Slug (EN)
                      </label>
                      <input
                        type="text"
                        value={slugEn}
                        onChange={e => { setSlugEn(e.target.value); setSlugEnManual(true) }}
                        placeholder="term-slug-en"
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none"
                      />
                      {!slugEnManual && nameEn && (
                        <p className="text-[10px] text-[#787585] mt-1">Auto-generated from EN name</p>
                      )}
                      {!slugEn && slugFi && (
                        <p className="text-[10px] text-[#787585]/60 mt-1">Defaults to FI slug if empty</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
                      Description (EN)
                    </label>
                    <RichTextEditor value={descEn} onChange={setDescEn} placeholder="English description..." minHeight={280} />
                  </div>
                </>
              )}

              {/* UK tab */}
              {activeLang === "uk" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
                        Name (UK)
                      </label>
                      <input
                        type="text"
                        value={nameUk}
                        onChange={e => {
                          setNameUk(e.target.value)
                          if (!slugUkManual) setSlugUk(slugify(e.target.value))
                        }}
                        placeholder="UK English name..."
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
                        Slug (UK)
                      </label>
                      <input
                        type="text"
                        value={slugUk}
                        onChange={e => { setSlugUk(e.target.value); setSlugUkManual(true) }}
                        placeholder="term-slug-uk"
                        className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none"
                      />
                      {!slugUkManual && nameUk && (
                        <p className="text-[10px] text-[#787585] mt-1">Auto-generated from UK name</p>
                      )}
                      {!slugUk && slugFi && (
                        <p className="text-[10px] text-[#787585]/60 mt-1">Defaults to FI slug if empty</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
                      Description (UK)
                    </label>
                    <RichTextEditor value={descUk} onChange={setDescUk} placeholder="UK English description..." minHeight={280} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">toggle_on</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Status</h3>
            </div>
            <div className="p-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setIsActive(v => !v)}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${isActive ? "bg-[#2D1783]" : "bg-[#E5E8F0]"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? "left-5" : "left-1"}`} />
                </div>
                <span className="text-sm font-semibold text-[#1b1b1c]">
                  {isActive ? "Active — visible on site" : "Inactive — hidden from site"}
                </span>
              </label>
            </div>
          </div>

          {/* Sort order */}
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">sort</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Sort Order</h3>
            </div>
            <div className="p-5">
              <input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="w-32 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
              />
              <p className="text-[10px] text-[#787585] mt-1.5">Lower = appears first</p>
            </div>
          </div>

          {/* Icon picker */}
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">interests</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Icon</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-5 gap-2">
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(icon === ic ? "" : ic)}
                    title={ic}
                    className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-colors ${
                      icon === ic ? "border-[#2D1783] bg-[#2D1783]/10" : "border-[#E5E8F0] hover:border-[#2D1783]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#2D1783]">{ic}</span>
                  </button>
                ))}
              </div>
              {icon && (
                <p className="text-[10px] text-[#787585] mt-2">
                  Selected: <span className="font-mono">{icon}</span>
                </p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
              <span className="material-symbols-outlined text-[#2D1783] text-[18px]">image</span>
              <h3 className="text-sm font-bold text-[#1b1b1c]">Image URL</h3>
            </div>
            <div className="p-5">
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none"
              />
            </div>
          </div>

          {/* Slug summary */}
          {isEdit && (slugEn !== slugFi || slugUk !== slugFi) && (
            <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E8F0] bg-[#F8F9FD]">
                <span className="material-symbols-outlined text-[#2D1783] text-[18px]">link</span>
                <h3 className="text-sm font-bold text-[#1b1b1c]">Slugs</h3>
              </div>
              <div className="p-5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#787585] uppercase w-6">FI</span>
                  <span className="text-xs font-mono text-[#474554] bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded flex-1 truncate">{slugFi || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#787585] uppercase w-6">EN</span>
                  <span className="text-xs font-mono text-[#474554] bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded flex-1 truncate">{slugEn || slugFi || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#787585] uppercase w-6">UK</span>
                  <span className="text-xs font-mono text-[#474554] bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded flex-1 truncate">{slugUk || slugFi || "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
