"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

interface Post {
  id: string
  slug_fi: string
  title_fi: string
  title_en: string | null
  published_at: string | null
  is_active: boolean
  featured_image_url: string | null
  review_status: "approved" | "pending" | "rejected"
  review_note: string | null
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("fi-FI", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function ReviewBadge({ post }: { post: Post }) {
  if (post.review_status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {post.is_active ? "Edit pending review" : "Pending review"}
      </span>
    )
  }
  if (post.review_status === "rejected") {
    // An article that's already live stays live even after its proposed
    // edit is rejected — label it distinctly so "rejected" doesn't read as
    // "unpublished".
    return post.is_active ? (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-orange-50 text-orange-700" title={post.review_note || undefined}>
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        Active — edit rejected
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 text-red-700" title={post.review_note || undefined}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Rejected
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
      post.is_active ? "bg-green-50 text-green-700" : "bg-[#F0F1F5] text-[#787585]"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${post.is_active ? "bg-green-500" : "bg-[#B0ADB8]"}`} />
      {post.is_active ? "Active" : "Draft"}
    </span>
  )
}

export function BlogClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState<"admin" | "editor">("admin")

  const load = useCallback(() => {
    fetch("/api/admin/blog-posts")
      .then(r => r.ok ? r.json() : [])
      .then(data => setPosts(data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch("/api/admin/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => setRole(data?.role === "editor" ? "editor" : "admin"))
      .catch(() => {})
  }, [])

  async function approve(id: string) {
    await fetch(`/api/admin/blog-posts/${id}/approve`, { method: "POST" })
    load()
  }

  async function reject(id: string) {
    const note = window.prompt("Reason for rejecting this article (optional):") || ""
    await fetch(`/api/admin/blog-posts/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    })
    load()
  }

  const pending = posts.filter(p => p.review_status === "pending")

  const filtered = posts.filter(p =>
    p.title_fi.toLowerCase().includes(search.toLowerCase()) ||
    p.slug_fi.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D1783]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#2D1783] text-[20px]">article</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-[#1b1b1c]">Blog</h1>
            <p className="text-xs text-[#787585]">{posts.length} articles</p>
          </div>
        </div>
        <Link href="/admin/blog/new"
          className="flex items-center gap-2 text-sm font-bold text-white bg-[#2D1783] hover:bg-[#3e2db2] px-4 py-2.5 rounded-xl transition-colors">
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Article
        </Link>
      </div>

      {/* Pending review queue (admin only) */}
      {role === "admin" && pending.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-200">
            <span className="material-symbols-outlined text-amber-700 text-[18px]">pending_actions</span>
            <h2 className="text-sm font-bold text-amber-900">Pending Review ({pending.length})</h2>
          </div>
          <div className="divide-y divide-amber-200">
            {pending.map(post => (
              <div key={post.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-semibold text-[#1b1b1c] text-sm">{post.title_fi}</p>
                  <p className="text-xs text-[#787585]">{post.is_active ? "Edit to a live article" : "New article"} — <span className="font-mono">{post.slug_fi}</span></p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/blog/${post.id}/edit`}
                    className="text-xs font-bold text-[#2D1783] hover:underline">Review</Link>
                  <button type="button" onClick={() => approve(post.id)}
                    className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors">Approve</button>
                  <button type="button" onClick={() => reject(post.id)}
                    className="text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] text-[18px]">search</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full bg-white border border-[#E5E8F0] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#2D1783] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#787585]">
          <span className="material-symbols-outlined text-[48px] text-[#E5E8F0] block mb-3">article</span>
          {search ? "No articles match your search." : "No articles yet."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FD] text-[10px] font-bold uppercase tracking-wider text-[#787585]">
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Slug</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Published</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F5]">
              {filtered.map(post => (
                <tr key={post.id} className="hover:bg-[#F8F9FD]/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {post.featured_image_url ? (
                        <img src={post.featured_image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[#E5E8F0]" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#F0F1F5] flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[#B0ADB8] text-[18px]">image</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#1b1b1c] line-clamp-1">{post.title_fi}</p>
                        {post.title_en && <p className="text-xs text-[#787585] line-clamp-1">{post.title_en}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs font-mono text-[#474554]">{post.slug_fi}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs text-[#787585]">{formatDate(post.published_at)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <ReviewBadge post={post} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {post.is_active && (
                        <Link href={`/fi/${post.slug_fi}`} target="_blank"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F1F5] transition-colors" title="View on site">
                          <span className="material-symbols-outlined text-[#787585] text-[16px]">open_in_new</span>
                        </Link>
                      )}
                      <Link href={`/admin/blog/${post.id}/edit`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F1F5] transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[#2D1783] text-[16px]">edit</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
