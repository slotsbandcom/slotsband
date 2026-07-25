"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type Lang = "fi" | "en" | "uk"
const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }

interface PageRow {
  id: string
  slug: string
  lang: string
  title: string
  is_published: boolean
  created_at: string
  updated_at: string
}

interface GroupedPage {
  slug: string
  langs: { lang: Lang; title: string; is_published: boolean }[]
  created_at: string
}

function groupPages(rows: PageRow[]): GroupedPage[] {
  const map = new Map<string, GroupedPage>()
  for (const row of rows) {
    if (!map.has(row.slug)) {
      map.set(row.slug, { slug: row.slug, langs: [], created_at: row.created_at })
    }
    map.get(row.slug)!.langs.push({
      lang: row.lang as Lang,
      title: row.title,
      is_published: row.is_published,
    })
  }
  return Array.from(map.values())
}

export function PagesClient() {
  const [pages, setPages] = useState<GroupedPage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/pages")
      .then(r => r.ok ? r.json() : [])
      .then((rows: PageRow[]) => setPages(groupPages(rows)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = pages.filter(p =>
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    p.langs.some(l => l.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D1783]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#2D1783] text-[20px]">description</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-[#1b1b1c]">Pages</h1>
            <p className="text-xs text-[#787585]">{pages.length} pages</p>
          </div>
        </div>
        <Link href="/admin/pages/new"
          className="flex items-center gap-2 text-sm font-bold text-white bg-[#2D1783] hover:bg-[#3e2db2] px-4 py-2.5 rounded-xl transition-colors">
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Page
        </Link>
      </div>

      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] text-[18px]">search</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search pages..."
          className="w-full bg-white border border-[#E5E8F0] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#2D1783] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#787585]">
          <span className="material-symbols-outlined text-[48px] text-[#E5E8F0] block mb-3">description</span>
          {search ? "No pages match your search." : "No pages yet. Create your first page."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FD] text-[10px] font-bold uppercase tracking-wider text-[#787585]">
                <th className="px-5 py-3 text-left">Page</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Slug</th>
                <th className="px-5 py-3 text-center">Languages</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F5]">
              {filtered.map(page => {
                const fiLang = page.langs.find(l => l.lang === "fi")
                const title = fiLang?.title || page.langs[0]?.title || page.slug
                const anyPublished = page.langs.some(l => l.is_published)
                return (
                  <tr key={page.slug} className="hover:bg-[#F8F9FD]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#2D1783]/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[#2D1783] text-[15px]">description</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#1b1b1c]">{title}</p>
                          <span className={`text-[10px] font-bold ${anyPublished ? "text-[#27AE60]" : "text-[#787585]"}`}>
                            {anyPublished ? "● Published" : "○ Draft"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs font-mono text-[#474554] bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded">
                        {page.slug}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {(["fi", "en", "uk"] as Lang[]).map(lang => {
                          const row = page.langs.find(l => l.lang === lang)
                          return (
                            <span key={lang} title={`${lang.toUpperCase()}: ${row ? (row.is_published ? "published" : "draft") : "missing"}`}
                              className={`text-base ${!row ? "opacity-20" : ""}`}>
                              {LANG_FLAGS[lang]}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/fi/${page.slug}`} target="_blank"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F1F5] transition-colors" title="View">
                          <span className="material-symbols-outlined text-[#787585] text-[16px]">open_in_new</span>
                        </Link>
                        <Link href={`/admin/pages/${encodeURIComponent(page.slug)}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F1F5] transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[#2D1783] text-[16px]">edit</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
