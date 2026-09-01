"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SlotsbandLogo } from "@/components/slotsband-logo"
import { createClient } from "@/lib/supabase/client"

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/admin" },
  { icon: "casino", label: "Casinos", href: "/admin/casinos" },
  { icon: "description", label: "Pages", href: "/admin/pages" },
  { icon: "redeem", label: "Bonuses", href: "/admin/bonuses" },
  { icon: "image", label: "Banners", href: "/admin/banners" },
  { icon: "emoji_events", label: "Bonushunt", href: "/admin/bonushunt" },
  { icon: "category", label: "Categories", href: "/admin/categories" },
  { icon: "label", label: "Taxonomies", href: "/admin/taxonomies" },
  { icon: "article", label: "Blog", href: "/admin/blog" },
  { icon: "sports_esports", label: "Games", href: "/admin/games" },
  { icon: "email", label: "Newsletter", href: "/admin/newsletter" },
  { icon: "settings", label: "Settings", href: "/admin/settings" },
]

const EDITOR_NAV_ITEMS = NAV_ITEMS.filter(item => item.href === "/admin/blog")

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [role, setRole] = useState<"admin" | "editor" | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    if (pathname === "/admin/login") return
    fetch("/api/admin/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => { setRole(data?.role ?? "admin"); setEmail(data?.email ?? null) })
      .catch(() => setRole("admin"))
  }, [pathname])

  const displayName = email ? email.split("@")[0] : (role === null ? "" : role === "editor" ? "Editor" : "Admin")

  // Don't show the full nav before we know the role — briefly rendering
  // every admin section to an editor (even just visually) is the wrong default.
  const navItems = role === null ? [] : role === "editor" ? EDITOR_NAV_ITEMS : NAV_ITEMS

  // Login page is standalone — no sidebar or header
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FD]">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-56"} flex-shrink-0 bg-[#2D1783] min-h-screen flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? "justify-center px-3" : "px-5"} h-16 border-b border-white/10`}>
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <SlotsbandLogo variant="light" height={26} />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`${collapsed ? "" : "ml-auto"} w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {collapsed ? "menu_open" : "menu"}
            </span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? "bg-[#FFD700] text-[#1b1b1c]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className="material-symbols-outlined text-[20px] flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={`p-3 border-t border-white/10`}>
          <Link
            href="/fi"
            className="flex items-center gap-2 text-white/60 hover:text-white text-xs transition-colors px-2 py-2"
            title={collapsed ? "View Site" : undefined}
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            {!collapsed && <span>View Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#E5E8F0] flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#1b1b1c]">SlotsBand Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors">
              <span className="material-symbols-outlined text-[#474554] text-[18px]">notifications</span>
            </button>
            <div className="flex items-center gap-2.5">
              {displayName && (
                <>
                  <div className="w-8 h-8 rounded-full bg-[#2D1783] flex items-center justify-center text-white text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[#1b1b1c] hidden sm:block capitalize">{displayName}</span>
                </>
              )}
              <button
                onClick={handleLogout}
                title="Sign out"
                className="w-8 h-8 rounded-xl bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
