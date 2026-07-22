"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Casino } from "@/lib/types"
import { CasinoLogo } from "@/components/casino-logo"

export default function AdminCasinosClient({ casinos }: { casinos: Casino[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const filtered = casinos.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.license_authority?.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  )

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((c) => c.id))
  }

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this casino?")) return
    await fetch(`/api/admin/casinos/${id}`, { method: "DELETE" })
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Casinos</h1>
          <p className="text-sm text-[#787585] mt-0.5">{casinos.length} total casinos</p>
        </div>
        <Link
          href="/admin/casinos/new"
          className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Casino
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#787585] text-[18px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search casinos..."
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl pl-9 pr-4 py-2 text-sm focus:border-[#2D1783] focus:outline-none transition-colors"
            />
          </div>
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#787585]">{selected.length} selected</span>
              <button className="text-xs bg-[#27AE60]/10 text-[#27AE60] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#27AE60]/20 transition-colors">
                Activate
              </button>
              <button className="text-xs bg-[#E74C3C]/10 text-[#E74C3C] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#E74C3C]/20 transition-colors">
                Deactivate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
        {casinos.length === 0 ? (
          <div className="text-center py-16 text-[#787585]">
            <span className="material-symbols-outlined text-[48px] block mb-3 opacity-30">casino</span>
            <p className="font-semibold">No casinos yet</p>
            <p className="text-sm mt-1">Add your first casino to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E8F0] bg-[#F8F9FD]">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded accent-[#2D1783]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Casino</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">License</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Flags</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8F0]">
                {filtered.map((casino) => (
                  <tr key={casino.id} className={`hover:bg-[#F8F9FD] transition-colors ${isPending ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(casino.id)}
                        onChange={() => toggle(casino.id)}
                        className="w-4 h-4 rounded accent-[#2D1783]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <CasinoLogo
                          src={casino.logo_url}
                          name={casino.name}
                          size={32}
                          className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB]"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#1b1b1c]">{casino.name}</p>
                          <p className="text-xs text-[#787585]">{casino.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-[#2D1783] text-white text-[10px] font-bold flex items-center justify-center">
                        {casino.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#FFD700] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-sm font-bold text-[#1b1b1c]">{Number(casino.rating).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#474554]">{casino.license_authority ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${casino.is_active ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                        {casino.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {casino.is_featured && (
                          <span className="material-symbols-outlined text-[#FFD700] text-[16px]" title="Featured" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        )}
                        {casino.is_new && (
                          <span className="material-symbols-outlined text-[#27AE60] text-[16px]" title="New" style={{ fontVariationSettings: "'FILL' 1" }}>new_releases</span>
                        )}
                        {casino.is_pikakasino && (
                          <span className="material-symbols-outlined text-[#2D1783] text-[16px]" title="Quick Casino" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/fi/nettikasinot/${casino.slug}`}
                          target="_blank"
                          className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors"
                          title="View"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#474554]">open_in_new</span>
                        </Link>
                        <Link
                          href={`/admin/casinos/${casino.slug}/edit`}
                          className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#474554]">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(casino.id)}
                          className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#E74C3C] transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#787585]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
