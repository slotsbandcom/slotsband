"use client"

import { useState } from "react"

type Lang = "fi" | "en" | "uk"

interface Category {
  id: string
  name: Record<Lang, string>
  slug: string
  icon: string
  parentId: string | null
  isActive: boolean
  description?: string
  children?: Category[]
}

const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }

const MOCK_CATEGORIES: Category[] = [
  {
    id: "1", slug: "nettikasinot", icon: "casino", isActive: true, parentId: null,
    name: { fi: "Nettikasinot", en: "Online Casinos", uk: "Онлайн казино" },
    description: "All online casino reviews and listings",
    children: [
      { id: "1-1", slug: "pikakasinot", icon: "bolt", isActive: true, parentId: "1", name: { fi: "Pikakasinot", en: "Quick Casinos", uk: "Швидкі казино" } },
      { id: "1-2", slug: "uudet-kasinot", icon: "new_releases", isActive: true, parentId: "1", name: { fi: "Uudet kasinot", en: "New Casinos", uk: "Нові казино" } },
      { id: "1-3", slug: "ilman-rekisteroitymista", icon: "no_accounts", isActive: true, parentId: "1", name: { fi: "Ilman rekisteröitymistä", en: "No Registration", uk: "Без реєстрації" } },
    ],
  },
  {
    id: "2", slug: "bonukset", icon: "redeem", isActive: true, parentId: null,
    name: { fi: "Bonukset", en: "Bonuses", uk: "Бонуси" },
    children: [
      { id: "2-1", slug: "ilmaiskierrokset", icon: "casino", isActive: true, parentId: "2", name: { fi: "Ilmaiskierrokset", en: "Free Spins", uk: "Безкоштовні обертання" } },
      { id: "2-2", slug: "ei-talletusta", icon: "money_off", isActive: true, parentId: "2", name: { fi: "Ei talletusta", en: "No Deposit", uk: "Без депозиту" } },
    ],
  },
  {
    id: "3", slug: "pelit", icon: "sports_esports", isActive: true, parentId: null,
    name: { fi: "Pelit", en: "Games", uk: "Ігри" },
    children: [
      { id: "3-1", slug: "kolikkopelit", icon: "casino", isActive: true, parentId: "3", name: { fi: "Kolikkopelit", en: "Slots", uk: "Слоти" } },
      { id: "3-2", slug: "live-kasino", icon: "live_tv", isActive: true, parentId: "3", name: { fi: "Live Kasino", en: "Live Casino", uk: "Живе казино" } },
    ],
  },
  {
    id: "4", slug: "oppaat", icon: "menu_book", isActive: false, parentId: null,
    name: { fi: "Oppaat", en: "Guides", uk: "Посібники" },
  },
]

const ICONS = ["casino", "redeem", "sports_esports", "menu_book", "bolt", "new_releases", "star", "live_tv", "money_off", "shield", "category", "local_offer"]

// ─── Form ─────────────────────────────────────────────────────────────────────
function CategoryForm({ onClose }: { onClose: () => void }) {
  const [activeLang, setActiveLang] = useState<Lang>("fi")
  const [selectedIcon, setSelectedIcon] = useState("category")
  const [isActive, setIsActive] = useState(true)

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8F0]">
          <h2 className="font-display font-bold text-lg text-[#1b1b1c]">Add Category</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Lang tabs */}
        <div className="flex border-b border-[#E5E8F0] px-6">
          {(["fi", "en", "uk"] as Lang[]).map(l => (
            <button key={l} onClick={() => setActiveLang(l)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeLang === l ? "border-[#2D1783] text-[#2D1783]" : "border-transparent text-[#787585] hover:text-[#1b1b1c]"}`}>
              <span>{LANG_FLAGS[l]}</span> {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Name ({activeLang.toUpperCase()})</label>
            <input type="text" placeholder="Category name..." className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Slug</label>
            <input type="text" placeholder="/category-slug" className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Parent Category</label>
            <select className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none">
              <option value="">None (top-level)</option>
              {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name.fi}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map(icon => (
                <button key={icon} onClick={() => setSelectedIcon(icon)}
                  className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-colors ${selectedIcon === icon ? "border-[#2D1783] bg-[#2D1783]/10" : "border-[#E5E8F0] hover:border-[#2D1783]"}`}
                  title={icon}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#2D1783]">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Description ({activeLang.toUpperCase()})</label>
            <textarea rows={3} placeholder="Category description..." className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-3 text-sm focus:border-[#2D1783] focus:outline-none resize-none" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setIsActive(!isActive)} className={`w-10 h-6 rounded-full transition-colors ${isActive ? "bg-[#2D1783]" : "bg-[#E5E8F0]"} relative flex-shrink-0`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? "left-5" : "left-1"}`} />
            </div>
            <span className="text-sm font-semibold text-[#1b1b1c]">Active</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E8F0] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl hover:border-[#2D1783] transition-colors">Cancel</button>
          <button className="px-5 py-2 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] transition-colors">Save Category</button>
        </div>
      </aside>
    </div>
  )
}

// ─── Tree Row ─────────────────────────────────────────────────────────────────
function CategoryRow({ cat, depth = 0, onEdit }: { cat: Category; depth?: number; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = (cat.children ?? []).length > 0

  return (
    <>
      <tr className="hover:bg-[#F8F9FD] transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)}
                className="w-5 h-5 rounded flex items-center justify-center text-[#787585] hover:text-[#2D1783] transition-colors flex-shrink-0">
                <span className="material-symbols-outlined text-[16px]">{expanded ? "expand_more" : "chevron_right"}</span>
              </button>
            ) : (
              <span className="w-5 flex-shrink-0" />
            )}
            <div className="w-8 h-8 rounded-lg bg-[#2D1783]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#2D1783] text-[15px]">{cat.icon}</span>
            </div>
            <span className="text-sm font-semibold text-[#1b1b1c]">{cat.name.fi}</span>
            {depth === 0 && (
              <span className="text-[10px] bg-[#2D1783]/10 text-[#2D1783] font-bold px-2 py-0.5 rounded-full ml-1">
                {(cat.children ?? []).length} sub
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-1">
            <span className="text-sm">🇫🇮</span><span className="text-sm">🇬🇧</span><span className="text-sm">🇺🇦</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="text-xs font-mono text-[#787585] bg-[#F8F9FD] px-2 py-0.5 rounded">{cat.slug}</span>
        </td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.isActive ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
            {cat.isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1.5">
            <button className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#787585] transition-colors cursor-grab" title="Drag to reorder">
              <span className="material-symbols-outlined text-[13px] text-[#787585]">drag_indicator</span>
            </button>
            <button onClick={onEdit} className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors" title="Edit">
              <span className="material-symbols-outlined text-[13px] text-[#474554]">edit</span>
            </button>
            <button className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#E74C3C] transition-colors" title="Delete">
              <span className="material-symbols-outlined text-[13px] text-[#787585]">delete</span>
            </button>
          </div>
        </td>
      </tr>
      {hasChildren && expanded && cat.children!.map(child => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} onEdit={onEdit} />
      ))}
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-5">
      {showForm && <CategoryForm onClose={() => setShowForm(false)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Categories</h1>
          <p className="text-sm text-[#787585] mt-0.5">{MOCK_CATEGORIES.length} top-level categories</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#E5E8F0] bg-[#F8F9FD]">
          <span className="material-symbols-outlined text-[#787585] text-[16px]">info</span>
          <p className="text-xs text-[#787585]">Drag the <span className="font-bold">drag indicator</span> icon to reorder categories within their level.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E8F0]">
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Languages</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#787585] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8F0]">
              {MOCK_CATEGORIES.map(cat => (
                <CategoryRow key={cat.id} cat={cat} onEdit={() => setShowForm(true)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
