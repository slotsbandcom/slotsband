"use client"

import { use, useState } from "react"
import { TRANSLATIONS } from "@/lib/data"
import type { Lang } from "@/lib/types"

function KickIcon() {
  return <span className="text-[10px] font-black">K</span>
}

function TwitchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.0763.0763 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

type ContactT = (typeof TRANSLATIONS)["fi"]["contact"]

function getChannels(t: ContactT) {
  return [
    { label: "Telegram", desc: t.telegramDesc, href: "https://t.me/slotsband", icon: <TelegramIcon />, bg: "#229ED9" },
    { label: "Discord", desc: t.discordDesc, href: "https://discord.com/invite/VhcAnYcDMd", icon: <DiscordIcon />, bg: "#5865F2" },
    { label: "Kick", desc: t.kickDesc, href: "https://kick.com/slotsband", icon: <KickIcon />, bg: "#53FC18", text: "#000" },
    { label: "Twitch", desc: t.twitchDesc, href: "https://twitch.tv/slotsband", icon: <TwitchIcon />, bg: "#9146FF" },
    { label: "YouTube", desc: t.youtubeDesc, href: "https://youtube.com/@slotsband", icon: <YouTubeIcon />, bg: "#FF0000" },
  ]
}

/** Only assembled client-side after an explicit click, so it never
 * appears in the server-rendered HTML for scrapers to harvest. */
function EmailCard({ t }: { t: ContactT }) {
  const [email, setEmail] = useState<string | null>(null)

  const reveal = () => {
    const user = "slotsband.com"
    const domain = "gmail.com"
    setEmail(`${user}@${domain}`)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5 flex items-start gap-3.5 hover:border-[#2D1783]/30 hover:shadow-md transition-all">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#2D1783" }}
      >
        <span className="material-symbols-outlined text-[#FFD700] text-[20px]" aria-hidden="true">mail</span>
      </div>
      <div className="min-w-0">
        <p className="font-display font-bold text-sm text-[#1b1b1c]">{t.emailLabel}</p>
        {email ? (
          <a href={`mailto:${email}`} className="text-sm text-[#2D1783] font-semibold hover:underline break-all">
            {email}
          </a>
        ) : (
          <button onClick={reveal} className="text-sm text-[#2D1783] font-semibold hover:underline">
            {t.emailReveal}
          </button>
        )}
        <p className="text-xs text-[#6B6879] mt-0.5">{t.emailResponseTime}</p>
      </div>
    </div>
  )
}

export default function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = use(params)
  const lang = (["fi", "en", "uk"].includes(langParam) ? langParam : "fi") as Lang
  const t = TRANSLATIONS[lang].contact
  const channels = getChannels(t)

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Header */}
      <header className="bg-[#2D1783] text-white pt-10 pb-14">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-2">{t.eyebrow}</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white text-balance">{t.title}</h1>
          <p className="text-white/70 text-sm mt-2 max-w-lg leading-relaxed">{t.subtitle}</p>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-[#E5E8F0] p-5 flex items-start gap-3.5 hover:border-[#2D1783]/30 hover:shadow-md transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: c.bg, color: c.text ?? "#fff" }}
              >
                {c.icon}
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-sm text-[#1b1b1c]">{c.label}</p>
                <p className="text-xs text-[#6B6879] mt-0.5 leading-relaxed">{c.desc}</p>
              </div>
            </a>
          ))}
          <EmailCard t={t} />
        </div>
      </div>
      <div className="pb-12" />
    </div>
  )
}
