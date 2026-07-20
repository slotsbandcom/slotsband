"use client"

import { useState, useEffect } from "react"

export default function GoLivePanel() {
  const [isLive, setIsLive] = useState(false)
  const [mode, setMode] = useState<"auto" | "manual">("auto")
  const [title, setTitle] = useState("")
  const [viewers, setViewers] = useState(0)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch("/api/stream-override")
      .then(r => r.json())
      .then(d => {
        setMode(d.mode ?? "auto")
        setIsLive(d.isLive ?? false)
        setTitle(d.title ?? "")
        setViewers(d.viewers ?? 0)
        setExpiresAt(d.expiresAt ?? null)
      })
      .catch(() => {})
  }, [])

  async function toggle(live: boolean) {
    setLoading(true)
    try {
      const res = await fetch("/api/stream-override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "manual",
          isLive: live,
          title: live ? title : "",
          viewers: live ? viewers : 0,
          autoResetHours: 8,
        }),
      })
      const d = await res.json()
      setMode(d.mode)
      setIsLive(d.isLive)
      setExpiresAt(d.expiresAt ?? null)
      if (live) setExpanded(true)
      else { setExpanded(false); setTitle(""); setViewers(0) }
    } catch {}
    finally { setLoading(false) }
  }

  const expTime = expiresAt
    ? new Date(expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null

  const isManualLive = mode === "manual" && isLive

  return (
    <div className={`rounded-2xl border-2 transition-colors overflow-hidden ${isManualLive ? "border-red-400 bg-red-50" : "border-[#E5E8F0] bg-white"}`}>
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isManualLive ? "bg-red-500" : "bg-[#F8F9FD] border border-[#E5E8F0]"}`}>
            <span className={`material-symbols-outlined text-[20px] ${isManualLive ? "text-white" : "text-[#474554]"}`}>live_tv</span>
          </div>
          <div>
            <p className="font-display font-bold text-[#1b1b1c] text-sm leading-tight">
              {isManualLive ? "Stream is LIVE" : mode === "auto" ? "Stream: Auto-detect" : "Stream is OFFLINE"}
            </p>
            <p className="text-xs text-[#787585]">
              {isManualLive && expTime ? `Auto-resets at ${expTime}` : isManualLive ? "Manual override active" : "Click to go live manually"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isManualLive ? (
            <button
              onClick={() => toggle(false)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-400 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-all disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">stop_circle</span>
              End Stream
            </button>
          ) : (
            <button
              onClick={() => { setExpanded(true); toggle(true) }}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all shadow-sm disabled:opacity-60"
            >
              <span className={`w-2 h-2 rounded-full bg-white ${loading ? "" : "animate-pulse"}`} />
              Go Live
            </button>
          )}
        </div>
      </div>

      {isManualLive && expanded && (
        <div className="px-5 pb-4 pt-0 flex gap-3 border-t border-red-200">
          <div className="flex-1 pt-3">
            <label className="block text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Stream Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => fetch("/api/stream-override", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "manual", isLive: true, title, viewers }) })}
              placeholder="e.g. Bonus Hunt #42 — 50 bonuksen avaus!"
              className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
            />
          </div>
          <div className="w-28 pt-3">
            <label className="block text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Viewers</label>
            <input
              type="number"
              min={0}
              value={viewers}
              onChange={e => setViewers(Number(e.target.value))}
              onBlur={() => fetch("/api/stream-override", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "manual", isLive: true, title, viewers }) })}
              className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}
