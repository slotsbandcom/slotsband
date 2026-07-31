import Link from "next/link"
import type { Lang } from "@/lib/types"
import type { RouteSlugMap } from "@/lib/supabase/route-slugs"
import { TRANSLATIONS } from "@/lib/data"
import { SlotsbandLogo } from "@/components/slotsband-logo"

function TwitchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.0763.0763 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  )
}

interface SiteFooterProps {
  lang: Lang
  navSlugs?: RouteSlugMap
}

export function SiteFooter({ lang, navSlugs = {} }: SiteFooterProps) {
  const t = TRANSLATIONS[lang].footer
  const base = `/${lang}`
  const ns = (key: string) => navSlugs[key] || key

  return (
    <footer className="w-full bg-[#2D1783]">
      {/* Responsible gambling banner */}
      <div className="bg-black/20 py-3">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-white/80">
          <span className="material-symbols-outlined text-[#FFD700] text-[18px]" aria-hidden="true">warning</span>
          <span>{t.disclaimer}</span>
          <Link href={`${base}/responsible-gambling`} className="text-white underline underline-offset-2 hover:text-[#FFD700] transition-colors">
            {t.responsibleGambling}
          </Link>
          {lang === "uk" && (
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:text-[#FFD700] transition-colors">
              BeGambleAware.org
            </a>
          )}
          {lang === "fi" && (
            <a href="https://peluuri.fi" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:text-[#FFD700] transition-colors">
              Peluuri.fi
            </a>
          )}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">

          {/* Brand col */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href={`/${lang}`} className="inline-block mb-4">
              <SlotsbandLogo variant="light" height={30} />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              {t.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { label: "Kick",    bg: "#53FC18", text: "#000", href: "https://kick.com/slotsband", icon: <span className="text-[10px] font-black">K</span> },
                { label: "Twitch",  bg: "#9146FF", text: "#fff", href: "https://twitch.tv/slotsband", icon: <TwitchIcon /> },
                { label: "YouTube", bg: "#FF0000", text: "#fff", href: "https://youtube.com/@slotsband", icon: <YouTubeIcon /> },
                { label: "Discord", bg: "#5865F2", text: "#fff", href: "https://discord.com/invite/VhcAnYcDMd", icon: <DiscordIcon /> },
              ].map(p => (
                <a
                  key={p.label}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={p.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: p.bg, color: p.text }}
                >
                  {p.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-xs font-bold text-[#FFD700] uppercase mb-4 border-l-2 border-[#FFD700] pl-3 tracking-wider">
              {t.quicklinks}
            </h5>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link href={`${base}/${ns("nettikasinot")}`} className="hover:text-white transition-colors">{t.bestCasinos}</Link></li>
              <li><Link href={`${base}/${ns("nettikasinot")}?filter=pikakasinot`} className="hover:text-white transition-colors">{t.quickCasinos}</Link></li>
              <li><Link href={`${base}/${ns("kasinobonukset")}`} className="hover:text-white transition-colors">{t.bonuses}</Link></li>
              <li><Link href={`${base}/${ns("kasinopelit")}`} className="hover:text-white transition-colors">{t.games}</Link></li>
              <li><Link href={`${base}/${ns("rafflet")}`} className="hover:text-white transition-colors">{t.raffles}</Link></li>
              <li><Link href={`${base}/${ns("blogi")}`} className="hover:text-white transition-colors">{t.blog}</Link></li>
            </ul>
          </div>

          {/* Browse (taxonomy index pages) */}
          <div>
            <h5 className="text-xs font-bold text-[#FFD700] uppercase mb-4 border-l-2 border-[#FFD700] pl-3 tracking-wider">
              {t.browseTitle}
            </h5>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link href={`${base}/${ns("kasinot")}`} className="hover:text-white transition-colors">{t.casinoCategories}</Link></li>
              <li><Link href={`${base}/${ns("tarjoukset")}`} className="hover:text-white transition-colors">{t.offers}</Link></li>
              <li><Link href={`${base}/${ns("talletustavat")}`} className="hover:text-white transition-colors">{t.depositMethods}</Link></li>
              <li><Link href={`${base}/${ns("kotiutustavat")}`} className="hover:text-white transition-colors">{t.withdrawalMethods}</Link></li>
              <li><Link href={`${base}/${ns("ohjelmistot")}`} className="hover:text-white transition-colors">{t.software}</Link></li>
              <li><Link href={`${base}/${ns("valmistaja")}`} className="hover:text-white transition-colors">{t.vendors}</Link></li>
              <li><Link href={`${base}/${ns("lisenssi")}`} className="hover:text-white transition-colors">{t.licences}</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h5 className="text-xs font-bold text-[#FFD700] uppercase mb-4 border-l-2 border-[#FFD700] pl-3 tracking-wider">
              {t.about}
            </h5>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link href={`${base}/about`} className="hover:text-white transition-colors">{t.aboutSlotsband}</Link></li>
              <li><Link href={`${base}/contact`} className="hover:text-white transition-colors">{t.contact}</Link></li>
              <li><Link href={`${base}/about#how-we-rate`} className="hover:text-white transition-colors">{t.howWeRate}</Link></li>
            </ul>
          </div>

          {/* Responsibility */}
          <div>
            <h5 className="text-xs font-bold text-[#FFD700] uppercase mb-4 border-l-2 border-[#FFD700] pl-3 tracking-wider">
              {t.responsibility}
            </h5>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <Link href={`${base}/responsible-gambling`} className="hover:text-white transition-colors">
                  {t.responsibleGambling}
                </Link>
              </li>
              {lang === "fi" && (
                <li>
                  <a href="https://peluuri.fi" target="_blank" rel="noopener noreferrer" className="text-[#FFD700] font-semibold hover:text-white transition-colors">
                    Peluuri.fi
                  </a>
                </li>
              )}
              {lang === "uk" && (
                <>
                  <li>
                    <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-[#FFD700] font-semibold hover:text-white transition-colors">
                      BeGambleAware
                    </a>
                  </li>
                  <li>
                    <a href="https://www.gamstop.co.uk" target="_blank" rel="noopener noreferrer" className="text-[#FFD700] font-semibold hover:text-white transition-colors">
                      GamStop
                    </a>
                  </li>
                </>
              )}
            </ul>

            {/* Trust badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white">
                <span className="material-symbols-outlined text-[14px] text-[#FFD700]" aria-hidden="true">verified_user</span>
                18+
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white">
                <span className="material-symbols-outlined text-[14px] text-[#FFD700]" aria-hidden="true">security</span>
                SSL
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/15 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/60">{t.copyright}</p>
          <div className="flex gap-4 text-xs text-white/60">
            <Link href={`${base}/privacy`} className="hover:text-white transition-colors">
              {t.privacy}
            </Link>
            <Link href={`${base}/terms`} className="hover:text-white transition-colors">
              {t.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
