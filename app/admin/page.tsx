import Link from "next/link"
import { getDashboardStats, getCasinos } from "@/lib/supabase/queries"
import GoLivePanel from "./go-live-panel"


const QUICK_ACTIONS = [
  { icon: "add_circle", label: "Add Casino", href: "/admin/casinos/new", color: "bg-[#2D1783] text-white hover:bg-[#3e2db2]" },
  { icon: "note_add", label: "Add Page", href: "/admin/pages/new", color: "bg-white text-[#2D1783] border border-[#E5E8F0] hover:border-[#2D1783]" },
  { icon: "campaign", label: "Add Banner", href: "/admin/banners/new", color: "bg-white text-[#2D1783] border border-[#E5E8F0] hover:border-[#2D1783]" },
]

export default async function AdminDashboard() {
  const [stats, casinos] = await Promise.all([
    getDashboardStats(),
    getCasinos(),
  ])

  const recentCasinos = casinos.slice(0, 5)

  const STATS = [
    { icon: "casino", label: "Total Casinos", value: stats.totalCasinos, color: "bg-[#2D1783]/10 text-[#2D1783]", link: "/admin/casinos" },
    { icon: "public", label: "Active Casinos", value: stats.activeCasinos, color: "bg-[#27AE60]/10 text-[#27AE60]", link: "/admin/casinos" },
    { icon: "redeem", label: "Bonuses", value: stats.totalBonuses, color: "bg-[#FFD700]/20 text-[#775900]", link: "/admin/bonuses" },
    { icon: "email", label: "Subscribers", value: stats.totalSubscribers, color: "bg-[#3e2db2]/10 text-[#3e2db2]", link: "/admin/newsletter" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Dashboard</h1>
        <p className="text-sm text-[#787585] mt-1">Welcome back! Here is what is happening with SlotsBand.</p>
      </div>

      {/* Go Live panel */}
      <GoLivePanel />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Link
            key={stat.label}
            href={stat.link}
            className="bg-white rounded-2xl border border-[#E5E8F0] p-5 hover:border-[#2D1783] transition-colors group"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
            </div>
            <p className="font-display font-bold text-2xl text-[#1b1b1c]">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-[#787585] mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent casinos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E8F0]">
            <h2 className="font-display font-bold text-[#1b1b1c]">Recent Casinos</h2>
            <Link href="/admin/casinos" className="text-xs text-[#2D1783] font-semibold hover:text-[#FFD700] transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#E5E8F0]">
            {recentCasinos.map((casino) => (
              <div key={casino.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#F8F9FD] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#F0EDEE] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#2D1783] text-[16px]">casino</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1b1b1c] truncate">{casino.name}</p>
                  <p className="text-xs text-[#787585]">{casino.license_authority} · Rank #{casino.rank}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${casino.is_active ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"}`}>
                    {casino.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-sm font-bold text-[#2D1783]">{Number(casino.rating).toFixed(1)}</span>
                </div>
                <Link
                  href={`/admin/casinos/${casino.slug}/edit`}
                  className="w-7 h-7 rounded-lg bg-[#F8F9FD] border border-[#E5E8F0] flex items-center justify-center hover:border-[#2D1783] transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px] text-[#474554]">edit</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions + activity */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
            <h2 className="font-display font-bold text-[#1b1b1c] mb-4">Quick Actions</h2>
            <div className="space-y-2.5">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${action.color}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
            <h2 className="font-display font-bold text-[#1b1b1c] mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { icon: "casino", text: "Spinnair rank updated to #1", time: "2 min ago", color: "text-[#2D1783]" },
                { icon: "redeem", text: "New bonus added for Lussurio", time: "1h ago", color: "text-[#27AE60]" },
                { icon: "email", text: "3 new newsletter subscribers", time: "3h ago", color: "text-[#FFD700]" },
                { icon: "image", text: "Banner updated for homepage", time: "1d ago", color: "text-[#474554]" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <span className={`material-symbols-outlined ${item.color} text-[16px] flex-shrink-0 mt-0.5`}>{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#474554] font-medium">{item.text}</p>
                    <p className="text-[#787585]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
