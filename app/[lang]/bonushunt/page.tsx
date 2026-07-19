import { BONUS_HUNTS } from "@/lib/data"
import type { Lang } from "@/lib/types"

function MultiplierCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[#787585]">—</span>
  const color = value >= 500 ? "text-[#2D1783] font-bold" : value >= 100 ? "text-[#27AE60] font-semibold" : "text-[#474554]"
  return <span className={color}>{value}x</span>
}

function StatCard({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-3 ${highlight ? "bg-[#2D1783] border-[#2D1783]" : "bg-white border-[#E5E8F0]"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${highlight ? "bg-white/10" : "bg-[#F8F9FD]"}`}>
        <span className={`material-symbols-outlined text-[22px] ${highlight ? "text-[#FFD700]" : "text-[#2D1783]"}`} aria-hidden="true">{icon}</span>
      </div>
      <div>
        <p className={`text-[10px] uppercase tracking-wide font-bold ${highlight ? "text-white/60" : "text-[#787585]"}`}>{label}</p>
        <p className={`font-display font-bold text-lg leading-tight ${highlight ? "text-white" : "text-[#1b1b1c]"}`}>{value}</p>
      </div>
    </div>
  )
}

export default function BonusHuntPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang as Lang) || "fi"
  const active = BONUS_HUNTS.find((b) => b.is_active) ?? BONUS_HUNTS[0]
  const past = BONUS_HUNTS.filter((b) => !b.is_active)

  const completedSlots = active.slots.filter((s) => s.multiplier !== null)
  const progress = Math.round((completedSlots.length / active.slots.length) * 100)
  const avgMultiplier = completedSlots.length
    ? Math.round(completedSlots.reduce((sum, s) => sum + (s.multiplier ?? 0), 0) / completedSlots.length)
    : 0

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Header */}
      <header className="bg-[#1b1b1c] text-white pt-8 pb-10 md:pt-12 md:pb-14">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1 rounded-full mb-3 ${active.is_active ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}`}>
                <span className="material-symbols-outlined text-[12px]" aria-hidden="true">{active.is_active ? "fiber_manual_record" : "history"}</span>
                {active.is_active ? "Live Session" : "Päättynyt"}
              </span>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-white text-balance">{active.title}</h1>
              <p className="text-white/50 text-sm mt-1">{active.date}</p>
            </div>
            {/* ROI badge */}
            {!active.is_active && active.total_won > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center">
                <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">ROI</p>
                <p className={`font-display font-bold text-3xl mt-0.5 ${active.total_won >= active.total_invested ? "text-[#27AE60]" : "text-red-400"}`}>
                  {Math.round(((active.total_won - active.total_invested) / active.total_invested) * 100)}%
                </p>
              </div>
            )}
          </div>

          {/* Progress bar (active hunt only) */}
          {active.is_active && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-white/60 text-xs font-semibold">Edistyminen</p>
                <p className="text-white text-xs font-bold">{completedSlots.length}/{active.slots.length} bonusta avattu</p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#FFD700] h-2.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon="payments" label="Investoitu" value={`${active.total_invested}€`} />
          <StatCard icon="trending_up" label="Voitettu" value={active.total_won > 0 ? `${active.total_won}€` : "—"} highlight={active.total_won >= active.total_invested} />
          <StatCard icon="bar_chart" label="Keskim. kertoimet" value={avgMultiplier > 0 ? `${avgMultiplier}x` : "—"} />
          <StatCard icon="casino" label="Bonuksia" value={`${active.slots.length}`} />
        </div>

        {/* Slots table */}
        <section>
          <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-4">Bonuslista</h2>
          <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]" aria-label="Bonushunt slotit">
                <thead>
                  <tr className="bg-[#F8F9FD] border-b border-[#E5E8F0]">
                    {["#", "Peli", "Tarjoaja", "Saldo", "Panos", "Bonus arvo", "Kerroin"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#787585] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.slots.map((slot, i) => (
                    <tr key={i} className={`border-b border-[#F8F9FD] last:border-0 hover:bg-[#F8F9FD] transition-colors ${slot.multiplier && slot.multiplier >= 500 ? "bg-[#FFF4B0]/30" : ""}`}>
                      <td className="px-4 py-3 text-[#787585] text-xs font-semibold">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#2D1783]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[#2D1783] text-[14px]" aria-hidden="true">casino</span>
                          </div>
                          <span className="font-semibold text-[#1b1b1c]">{slot.game}</span>
                          {slot.multiplier !== null && slot.multiplier >= 500 && (
                            <span className="bg-[#FFD700] text-[#1b1b1c] text-[9px] font-bold px-1.5 py-0.5 rounded">MEGA</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#787585]">{slot.provider}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#1b1b1c]">{slot.balance}€</td>
                      <td className="px-4 py-3 text-xs text-[#474554]">{slot.bet}€</td>
                      <td className="px-4 py-3 text-xs text-[#474554]">{slot.bonus_value}x</td>
                      <td className="px-4 py-3 text-sm">
                        <MultiplierCell value={slot.multiplier} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Past hunts archive */}
        {past.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-4">Aikaisemmat bonushuntit</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {past.map((hunt) => {
                const roi = Math.round(((hunt.total_won - hunt.total_invested) / hunt.total_invested) * 100)
                const profit = hunt.total_won >= hunt.total_invested
                return (
                  <div key={hunt.id} className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-display font-bold text-sm text-[#1b1b1c]">{hunt.title}</p>
                        <p className="text-[10px] text-[#787585] mt-0.5">{hunt.date} &bull; {hunt.slots.length} peliä</p>
                      </div>
                      <span className={`text-sm font-bold ${profit ? "text-[#27AE60]" : "text-red-500"}`}>
                        {profit ? "+" : ""}{roi}% ROI
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#F8F9FD] rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-[#787585] uppercase">Investoitu</p>
                        <p className="font-bold text-xs text-[#1b1b1c]">{hunt.total_invested}€</p>
                      </div>
                      <div className="bg-[#F8F9FD] rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-[#787585] uppercase">Voitettu</p>
                        <p className={`font-bold text-xs ${profit ? "text-[#27AE60]" : "text-red-500"}`}>{hunt.total_won}€</p>
                      </div>
                      <div className="bg-[#F8F9FD] rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-[#787585] uppercase">Keskim.</p>
                        <p className="font-bold text-xs text-[#1b1b1c]">
                          {Math.round(hunt.slots.filter(s => s.multiplier !== null).reduce((sum, s) => sum + (s.multiplier ?? 0), 0) / hunt.slots.filter(s => s.multiplier !== null).length)}x
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
      <div className="pb-12" />
    </div>
  )
}
