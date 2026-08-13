"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { BonusHunt, BonusHuntPrediction } from "@/lib/types"

function fmtEur(n: number | null | undefined) {
  if (n === null || n === undefined) return "—"
  return `${n.toLocaleString("fi-FI", { maximumFractionDigits: 2 })}€`
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("fi-FI", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
}

// ─── New session form ──────────────────────────────────────────────────────
function NewSessionForm({ onClose, onSaved, hasActive }: { onClose: () => void; onSaved: () => void; hasActive: boolean }) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Title is required"); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/bonushunt/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to start session")
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start session")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <h2 className="font-display font-bold text-lg text-[#1b1b1c] mb-1">Start New Session</h2>
        {hasActive && (
          <p className="text-xs text-[#E74C3C] bg-[#E74C3C]/8 border border-[#E74C3C]/25 rounded-xl px-3 py-2 mb-4">
            There is already an active session — it will be marked completed automatically.
          </p>
        )}
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Bonus Hunt #4"
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
          </div>
          {error && <p className="text-xs text-[#E74C3C] bg-[#E74C3C]/8 border border-[#E74C3C]/25 rounded-xl px-4 py-2.5">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl hover:border-[#2D1783] transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] disabled:opacity-50 transition-colors">
            {saving ? "Starting..." : "Start Session"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Active session panel ──────────────────────────────────────────────────
function ActiveSessionPanel({ session, onSaved, showToast }: { session: BonusHunt; onSaved: () => void; showToast: (m: string) => void }) {
  const [finalResult, setFinalResult] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const predictions = session.predictions ?? []

  // Derived from data (not local state) so the tie stays resolvable across
  // refreshes/reloads — the session keeps showing here (instead of moving to
  // history) as long as a result is set but no winner has been picked yet.
  const tiedCandidates = useMemo(() => {
    if (session.final_result == null || session.winner_prediction_id || predictions.length === 0) return []
    const diffs = predictions.map(p => ({ id: p.id, diff: Math.abs(p.amount - session.final_result!) }))
    const minDiff = Math.min(...diffs.map(d => d.diff))
    return diffs.filter(d => d.diff === minDiff)
  }, [session.final_result, session.winner_prediction_id, predictions])

  const handleSaveResult = async () => {
    const amount = Number(finalResult)
    if (!Number.isFinite(amount) || amount < 0) { setError("Enter a valid amount"); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bonushunt/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalResult: amount }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to save result")
      onSaved()
      if (json.tiedCandidates?.length > 0) {
        showToast("Result saved — multiple predictions tied, pick the winner below")
      } else {
        showToast("Result saved and winner determined")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save result")
    } finally {
      setSaving(false)
    }
  }

  const handlePickWinner = async (predictionId: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/bonushunt/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerPredictionId: predictionId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to set winner")
      onSaved()
      showToast("Winner selected")
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to set winner")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E8F0]">
        <div className="flex items-center gap-2.5">
          {session.status === "active" ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD700]/20 text-[#775900]">Needs winner</span>
          )}
          <h2 className="font-display font-bold text-lg text-[#1b1b1c]">{session.title}</h2>
          <span className="text-xs text-[#787585]">{session.date}</span>
        </div>
        <span className="text-xs font-bold text-[#787585]">{predictions.length} prediction{predictions.length === 1 ? "" : "s"}</span>
      </div>

      {/* Predictions table */}
      <div className="overflow-x-auto">
        {predictions.length === 0 ? (
          <div className="text-center py-12 text-[#787585]">
            <span className="material-symbols-outlined text-[40px] block mb-2 opacity-30">emoji_events</span>
            <p className="font-semibold text-sm">No predictions yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E8F0] bg-[#F8F9FD]">
                <th className="px-4 py-2.5 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Nickname</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Loppusumma</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Voittava peli</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Submitted</th>
                <th className="px-4 py-2.5 text-right text-xs font-bold text-[#787585] uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8F0]">
              {predictions.map((p: BonusHuntPrediction) => {
                const isWinner = session.winner_prediction_id === p.id
                const isTied = tiedCandidates.some(c => c.id === p.id)
                return (
                  <tr key={p.id} className={isWinner ? "bg-[#FFD700]/10" : "hover:bg-[#F8F9FD] transition-colors"}>
                    <td className="px-4 py-2.5 text-sm font-semibold text-[#1b1b1c] flex items-center gap-1.5">
                      {isWinner && <span className="material-symbols-outlined text-[#FFD700] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>}
                      {p.nickname}
                      {isWinner && <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD700] text-[#1b1b1c]">Winner</span>}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-[#474554]">{fmtEur(p.amount)}</td>
                    <td className="px-4 py-2.5 text-sm text-[#787585]">{p.game || "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-[#787585]">{fmtDateTime(p.submitted_at)}</td>
                    <td className="px-4 py-2.5 text-right">
                      {isTied && (
                        <button onClick={() => handlePickWinner(p.id)} disabled={saving}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2D1783] text-white hover:bg-[#3e2db2] disabled:opacity-50 transition-colors">
                          Pick as winner
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {tiedCandidates.length > 0 && (
        <div className="mx-5 mb-4 px-4 py-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl text-sm text-[#775900] font-semibold">
          Final result: {fmtEur(session.final_result)} — {tiedCandidates.length} predictions tied exactly. Pick the winner using the button in the table above.
        </div>
      )}

      {/* Enter final result — only while it hasn't been entered yet */}
      {session.final_result == null && (
        <div className="px-5 py-4 border-t border-[#E5E8F0] bg-[#F8F9FD] flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">Final result (€)</label>
            <input type="number" value={finalResult} onChange={e => setFinalResult(e.target.value)} placeholder="e.g. 2744.88" min="0" step="0.01"
              className="w-48 bg-white border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none" />
          </div>
          <button onClick={handleSaveResult} disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save & Determine Winner"}
          </button>
          {error && <p className="text-xs text-[#E74C3C]">{error}</p>}
        </div>
      )}
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function AdminBonushuntPage({ sessions = [] }: { sessions?: BonusHunt[] }) {
  const router = useRouter()
  const [showNewForm, setShowNewForm] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const active = sessions.find(s => s.status === "active")
  // A completed session with a result but no resolved winner (exact tie) stays
  // in the top panel instead of history, so the tie-break UI stays reachable.
  const pendingWinner = sessions.find(s =>
    s.status === "completed" && s.final_result != null && s.winner_prediction_id == null && (s.predictions ?? []).length > 0
  )
  const focusSession = active ?? pendingWinner
  const history = sessions
    .filter(s => s.id !== focusSession?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleNewSessionSaved = () => {
    setShowNewForm(false)
    router.refresh()
    showToast("Session started")
  }

  return (
    <div className="space-y-5">
      {showNewForm && <NewSessionForm onClose={() => setShowNewForm(false)} onSaved={handleNewSessionSaved} hasActive={!!active} />}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#27AE60] text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Bonushunt</h1>
          <p className="text-sm text-[#787585] mt-0.5">Viewer predictions, final results, and winners</p>
        </div>
        <button onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Start New Session
        </button>
      </div>

      {/* Active / pending-winner session */}
      {focusSession ? (
        <ActiveSessionPanel session={focusSession} onSaved={() => router.refresh()} showToast={showToast} />
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E8F0] text-center py-16 text-[#787585]">
          <span className="material-symbols-outlined text-[48px] block mb-3 opacity-30">emoji_events</span>
          <p className="font-semibold">No active session</p>
          <p className="text-sm mt-1">Start a new session so viewers can submit predictions.</p>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-display font-bold text-base text-[#1b1b1c] mb-3">Session History</h2>
        <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
          {history.length === 0 ? (
            <div className="text-center py-10 text-[#787585] text-sm">No previous sessions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E8F0] bg-[#F8F9FD]">
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Session</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Final Result</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Winner</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#787585] uppercase tracking-wider">Predictions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8F0]">
                  {history.map(s => {
                    const winner = (s.predictions ?? []).find(p => p.id === s.winner_prediction_id)
                    return (
                      <tr key={s.id} className="hover:bg-[#F8F9FD] transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-[#1b1b1c]">{s.title}</td>
                        <td className="px-4 py-3 text-sm text-[#474554]">{s.date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === "completed" ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-[#E5E8F0] text-[#787585]"
                          }`}>{s.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#474554]">{fmtEur(s.final_result)}</td>
                        <td className="px-4 py-3 text-sm">
                          {winner
                            ? <span className="font-semibold text-[#1b1b1c] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#FFD700] text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                                {winner.nickname} <span className="text-[#787585] font-normal">({fmtEur(winner.amount)})</span>
                              </span>
                            : <span className="text-[#787585]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#787585]">{(s.predictions ?? []).length}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
