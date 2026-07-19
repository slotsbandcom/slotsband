"use client"

import { useState, useEffect } from "react"

type Lang = "fi" | "en" | "uk"
type SettingsTab = "general" | "affiliate" | "seo" | "responsible" | "stream"

const LANG_FLAGS: Record<Lang, string> = { fi: "🇫🇮", en: "🇬🇧", uk: "🇺🇦" }

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "general",     label: "General",             icon: "settings" },
  { id: "affiliate",   label: "Affiliate",           icon: "link" },
  { id: "seo",         label: "SEO",                 icon: "manage_search" },
  { id: "responsible", label: "Responsible Gambling", icon: "shield" },
  { id: "stream",      label: "Stream",              icon: "live_tv" },
]

// ─── Reusable field components ────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ placeholder, defaultValue, type = "text" }: { placeholder?: string; defaultValue?: string; type?: string }) {
  return (
    <input type={type} defaultValue={defaultValue} placeholder={placeholder}
      className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none transition-colors" />
  )
}

function Textarea({ placeholder, defaultValue, rows = 4 }: { placeholder?: string; defaultValue?: string; rows?: number }) {
  return (
    <textarea rows={rows} defaultValue={defaultValue} placeholder={placeholder}
      className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-3 text-sm focus:border-[#2D1783] focus:outline-none transition-colors resize-none" />
  )
}

function Toggle({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[#E5E8F0] last:border-0">
      <div>
        <p className="text-sm font-semibold text-[#1b1b1c]">{label}</p>
        {description && <p className="text-xs text-[#787585] mt-0.5">{description}</p>}
      </div>
      <button onClick={() => setChecked(!checked)}
        className={`flex-shrink-0 w-10 h-6 rounded-full transition-colors relative mt-0.5 ${checked ? "bg-[#2D1783]" : "bg-[#E5E8F0]"}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-1"}`} />
      </button>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E8F0]">
        <h2 className="font-display font-bold text-[#1b1b1c]">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

// ─── Tab content ─────────────────────────────────────────────────────────────
function GeneralTab() {
  const [activeLang, setActiveLang] = useState<Lang>("fi")
  return (
    <div className="space-y-5">
      <SectionCard title="Site Identity">
        {/* Per-language tabs */}
        <div className="flex border-b border-[#E5E8F0] -mt-1">
          {(["fi", "en", "uk"] as Lang[]).map(l => (
            <button key={l} onClick={() => setActiveLang(l)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${activeLang === l ? "border-[#2D1783] text-[#2D1783]" : "border-transparent text-[#787585] hover:text-[#1b1b1c]"}`}>
              <span>{LANG_FLAGS[l]}</span> {l.toUpperCase()}
            </button>
          ))}
        </div>
        <Field label={`Site Name (${activeLang.toUpperCase()})`}><TextInput placeholder="SlotsBand" defaultValue="SlotsBand" /></Field>
        <Field label={`Tagline (${activeLang.toUpperCase()})`}><TextInput placeholder="Finland's #1 casino comparison" /></Field>
      </SectionCard>

      <SectionCard title="Contact & Analytics">
        <Field label="Contact Email"><TextInput type="email" placeholder="admin@slotsband.com" /></Field>
        <Field label="Google Analytics ID"><TextInput placeholder="G-XXXXXXXXXX" /></Field>
      </SectionCard>

      <SectionCard title="Social Media">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Facebook URL",  icon: "facebook",  placeholder: "https://facebook.com/..." },
            { label: "Twitter / X",   icon: "share",     placeholder: "https://x.com/..." },
            { label: "Instagram",     icon: "photo_camera", placeholder: "https://instagram.com/..." },
            { label: "Twitch",        icon: "live_tv",   placeholder: "https://twitch.tv/slotsband" },
            { label: "Kick",          icon: "sports_esports", placeholder: "https://kick.com/slotsband" },
            { label: "YouTube",       icon: "play_circle", placeholder: "https://youtube.com/@..." },
          ].map(s => (
            <div key={s.label}>
              <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">{s.icon}</span>{s.label}
              </label>
              <TextInput type="url" placeholder={s.placeholder} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function AffiliateTab() {
  const [format, setFormat] = useState("https://slotsband.com/fi/mene/{casino_slug}")
  return (
    <div className="space-y-5">
      <SectionCard title="Link Configuration">
        <Field label="Default Affiliate Link Format">
          <input type="text" value={format} onChange={e => setFormat(e.target.value)}
            className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[#2D1783] focus:outline-none" />
          <p className="text-xs text-[#787585] mt-1">Use <code className="bg-[#E5E8F0] px-1 py-0.5 rounded text-[11px]">{"{ casino_slug }"}</code> as placeholder</p>
        </Field>
      </SectionCard>

      <SectionCard title="Tracking">
        <Toggle label="nofollow attribute" description="Add rel=nofollow to all affiliate links" defaultChecked />
        <Toggle label="sponsored attribute" description="Add rel=sponsored to all affiliate links" defaultChecked />
        <Toggle label="Click tracking" description="Log all affiliate link clicks to analytics" defaultChecked />
      </SectionCard>

      <SectionCard title="Excluded IPs">
        <Field label="Excluded IP Addresses">
          <Textarea placeholder={"127.0.0.1\n192.168.1.1\n10.0.0.0/8"} rows={5} />
        </Field>
        <p className="text-xs text-[#787585]">One IP or CIDR range per line. Clicks from these IPs will not be tracked.</p>
      </SectionCard>
    </div>
  )
}

function SeoTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Default Meta Formats">
        <Field label="Default Meta Title Format">
          <TextInput placeholder="{page_title} | SlotsBand" defaultValue="{page_title} | SlotsBand — Finland's Casino Guide" />
          <p className="text-xs text-[#787585] mt-1">Use <code className="bg-[#E5E8F0] px-1 py-0.5 rounded text-[11px]">{"{ page_title }"}</code> as placeholder</p>
        </Field>
        <Field label="Default Meta Description">
          <Textarea placeholder="Default meta description..." rows={3} defaultValue="SlotsBand — Finland's #1 casino comparison site. Find the best bonuses, free spins and trusted online casinos." />
        </Field>
      </SectionCard>

      <SectionCard title="Robots.txt">
        <Field label="robots.txt content">
          <Textarea defaultValue={"User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://slotsband.com/sitemap.xml"} rows={8} />
        </Field>
      </SectionCard>

      <SectionCard title="Sitemap">
        <Toggle label="Auto-generate sitemap" description="Automatically include new pages, casinos, and games in the sitemap" defaultChecked />
        <Toggle label="Include casino pages" defaultChecked />
        <Toggle label="Include bonus pages" defaultChecked />
        <Toggle label="Include game pages" />
        <Field label="Sitemap URL">
          <TextInput defaultValue="https://slotsband.com/sitemap.xml" />
        </Field>
      </SectionCard>
    </div>
  )
}

function ResponsibleTab() {
  const [activeLang, setActiveLang] = useState<Lang>("fi")
  return (
    <div className="space-y-5">
      <SectionCard title="Badges & Toggles">
        <Toggle label="Show 18+ badge" description="Display age verification badge in site header and footer" defaultChecked />
        <Toggle label="Show BeGambleAware link" defaultChecked />
        <Toggle label="Show GamStop link" defaultChecked />
        <Toggle label="Show Peluuri link (Finnish)" defaultChecked />
      </SectionCard>

      <SectionCard title="Links">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="GamStop URL"><TextInput defaultValue="https://www.gamstop.co.uk" /></Field>
          <Field label="BeGambleAware URL"><TextInput defaultValue="https://www.begambleaware.org" /></Field>
          <Field label="Peluuri URL (FI)"><TextInput defaultValue="https://www.peluuri.fi" /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Footer Disclaimer">
        <div className="flex border-b border-[#E5E8F0] -mt-1">
          {(["fi", "en", "uk"] as Lang[]).map(l => (
            <button key={l} onClick={() => setActiveLang(l)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${activeLang === l ? "border-[#2D1783] text-[#2D1783]" : "border-transparent text-[#787585] hover:text-[#1b1b1c]"}`}>
              <span>{LANG_FLAGS[l]}</span> {l.toUpperCase()}
            </button>
          ))}
        </div>
        <Field label={`Disclaimer text (${activeLang.toUpperCase()})`}>
          <Textarea rows={4} placeholder="Footer disclaimer text..."
            defaultValue={activeLang === "fi" ? "Pelaaminen voi olla koukuttavaa. Pelaa vastuullisesti. 18+. Peluuri.fi auttaa." : activeLang === "en" ? "Gambling can be addictive. Play responsibly. 18+. BeGambleAware.org." : "Азартні ігри можуть викликати залежність. Грайте відповідально. 18+."} />
        </Field>
      </SectionCard>
    </div>
  )
}

function StreamTab() {
  const [pollInterval, setPollInterval] = useState(60)

  // ── Override state ──
  const [overrideMode, setOverrideMode] = useState<"auto" | "manual">("auto")
  const [manualLive, setManualLive] = useState(false)
  const [streamTitle, setStreamTitle] = useState("")
  const [viewers, setViewers] = useState(0)
  const [autoResetHours, setAutoResetHours] = useState(8)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")

  // Load current override on mount
  useEffect(() => {
    fetch("/api/stream-override")
      .then(r => r.json())
      .then(data => {
        setOverrideMode(data.mode ?? "auto")
        setManualLive(data.isLive ?? false)
        setStreamTitle(data.title ?? "")
        setViewers(data.viewers ?? 0)
        setAutoResetHours(data.autoResetHours ?? 8)
        setExpiresAt(data.expiresAt ?? null)
      })
      .catch(() => {})
  }, [])

  async function saveOverride(patch: object) {
    setSaving(true)
    setSaveMsg("")
    try {
      const res = await fetch("/api/stream-override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      setOverrideMode(data.mode)
      setManualLive(data.isLive)
      setStreamTitle(data.title ?? "")
      setViewers(data.viewers ?? 0)
      setExpiresAt(data.expiresAt ?? null)
      setSaveMsg("Saved")
      setTimeout(() => setSaveMsg(""), 2000)
    } catch {
      setSaveMsg("Error saving")
    } finally {
      setSaving(false)
    }
  }

  const expiresFormatted = expiresAt
    ? new Date(expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null

  return (
    <div className="space-y-5">

      {/* ── Stream Status Override ── */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E8F0] flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-[#1b1b1c]">Stream Status Override</h2>
            <p className="text-xs text-[#787585] mt-0.5">
              Kick.com blocks server-side API calls with 403. Use Manual mode to set live status directly.
            </p>
          </div>
          {/* Mode toggle pills */}
          <div className="flex bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl p-1 gap-1">
            {(["auto", "manual"] as const).map(m => (
              <button
                key={m}
                onClick={() => saveOverride({ mode: m })}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  overrideMode === m
                    ? "bg-[#2D1783] text-white shadow-sm"
                    : "text-[#787585] hover:text-[#1b1b1c]"
                }`}
              >
                {m === "auto" ? "Auto-detect" : "Manual"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {overrideMode === "auto" ? (
            <div className="flex items-center gap-3 text-sm text-[#474554] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-[18px] text-[#2D1783]">autorenew</span>
              Stream status is detected automatically from Twitch and YouTube APIs every {pollInterval}s.
              Kick status falls back to OFFLINE if their API is unreachable.
            </div>
          ) : (
            <>
              {/* LIVE / OFFLINE buttons */}
              <div>
                <label className="block text-xs font-bold text-[#474554] uppercase tracking-wider mb-2">
                  Current Status
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => saveOverride({ mode: "manual", isLive: true, title: streamTitle, viewers, autoResetHours })}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                      manualLive
                        ? "bg-red-500 border-red-500 text-white shadow-md"
                        : "bg-white border-[#E5E8F0] text-[#474554] hover:border-red-400 hover:text-red-500"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${manualLive ? "bg-white animate-pulse" : "bg-[#E5E8F0]"}`} />
                    LIVE
                  </button>
                  <button
                    onClick={() => saveOverride({ mode: "manual", isLive: false, title: "", viewers: 0 })}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                      !manualLive
                        ? "bg-[#474554] border-[#474554] text-white"
                        : "bg-white border-[#E5E8F0] text-[#474554] hover:border-[#474554]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current opacity-50" />
                    OFFLINE
                  </button>
                  {manualLive && expiresFormatted && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      Auto-resets at {expiresFormatted}
                    </div>
                  )}
                </div>
              </div>

              {/* Stream details — only shown when LIVE */}
              {manualLive && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <Field label="Stream Title">
                    <input
                      type="text"
                      value={streamTitle}
                      onChange={e => setStreamTitle(e.target.value)}
                      onBlur={() => saveOverride({ mode: "manual", isLive: true, title: streamTitle, viewers })}
                      placeholder="e.g. Bonus Hunt #42 — 50 bonuksen avaus!"
                      className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none transition-colors"
                    />
                  </Field>
                  <Field label="Viewer Count (optional)">
                    <input
                      type="number"
                      min={0}
                      value={viewers}
                      onChange={e => setViewers(Number(e.target.value))}
                      onBlur={() => saveOverride({ mode: "manual", isLive: true, title: streamTitle, viewers })}
                      placeholder="0"
                      className="w-full bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-[#2D1783] focus:outline-none transition-colors"
                    />
                  </Field>
                </div>
              )}

              {/* Auto-reset */}
              <Field label="Auto-reset to OFFLINE after">
                <div className="flex items-center gap-3">
                  <select
                    value={autoResetHours}
                    onChange={e => setAutoResetHours(Number(e.target.value))}
                    className="bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2 text-sm focus:border-[#2D1783] focus:outline-none"
                  >
                    {[0, 2, 4, 6, 8, 12, 24].map(h => (
                      <option key={h} value={h}>{h === 0 ? "Never" : `${h} hour${h !== 1 ? "s" : ""}`}</option>
                    ))}
                  </select>
                  <p className="text-xs text-[#787585]">
                    Automatically sets status back to OFFLINE after the stream ends.
                  </p>
                </div>
              </Field>
            </>
          )}

          {/* Save feedback */}
          {saveMsg && (
            <p className={`text-xs font-semibold ${saveMsg === "Saved" ? "text-[#27AE60]" : "text-red-500"}`}>
              {saveMsg}
            </p>
          )}
        </div>
      </div>

      {/* ── Channel Settings ── */}
      <SectionCard title="Channel Settings">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
              <span className="w-5 h-5 rounded bg-[#9146FF] flex items-center justify-center text-white text-[10px] font-black">T</span>
              Twitch Channel
            </label>
            <TextInput placeholder="slotsband" defaultValue="slotsband" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
              <span className="w-5 h-5 rounded bg-[#FF0000] flex items-center justify-center text-white text-[9px] font-black">YT</span>
              YouTube Channel ID
            </label>
            <TextInput placeholder="UCxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#474554] uppercase tracking-wider mb-1.5">
              <span className="w-5 h-5 rounded bg-[#53FC18] flex items-center justify-center text-black text-[10px] font-black">K</span>
              Kick Channel
            </label>
            <TextInput placeholder="slotsband" defaultValue="slotsband" />
          </div>
        </div>
      </SectionCard>

      {/* ── Polling ── */}
      <SectionCard title="Auto-detect Polling">
        <Field label="Stream Status Check Interval (seconds)">
          <div className="flex items-center gap-4">
            <input type="range" min={15} max={300} step={15} value={pollInterval}
              onChange={e => setPollInterval(Number(e.target.value))}
              className="flex-1 accent-[#2D1783]" />
            <div className="w-20 bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl px-3 py-2 text-sm font-bold text-[#2D1783] text-center">
              {pollInterval}s
            </div>
          </div>
          <p className="text-xs text-[#787585] mt-1">
            Lower values give more real-time status but increase API usage. Minimum 15s.
          </p>
        </Field>
      </SectionCard>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")

  const TabContent = {
    general:     <GeneralTab />,
    affiliate:   <AffiliateTab />,
    seo:         <SeoTab />,
    responsible: <ResponsibleTab />,
    stream:      <StreamTab />,
  }[activeTab]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#1b1b1c]">Settings</h1>
        <p className="text-sm text-[#787585] mt-0.5">Manage site-wide configuration and preferences.</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] p-1.5 flex flex-wrap gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-[#2D1783] text-white shadow-sm" : "text-[#787585] hover:text-[#1b1b1c] hover:bg-[#F8F9FD]"}`}
          >
            <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {TabContent}

      {/* Save bar */}
      <div className="bg-white rounded-2xl border border-[#E5E8F0] px-5 py-4 flex items-center justify-between">
        <p className="text-xs text-[#787585]">Unsaved changes will be lost if you navigate away.</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-semibold text-[#787585] bg-[#F8F9FD] border border-[#E5E8F0] rounded-xl hover:border-[#2D1783] transition-colors">Discard</button>
          <button className="px-5 py-2 text-sm font-semibold text-white bg-[#2D1783] rounded-xl hover:bg-[#3e2db2] transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  )
}
