import Link from "next/link"
import type { Lang } from "@/lib/types"
import type { RouteSlugMap } from "@/lib/supabase/route-slugs"
import { TRANSLATIONS } from "@/lib/data"
import { SlotsbandLogo } from "@/components/slotsband-logo"

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
                { label: "Kick",    badge: "K",  bg: "#53FC18", text: "#000", href: "https://kick.com/slotsband" },
                { label: "Twitch",  badge: "T",  bg: "#9146FF", text: "#fff", href: "https://twitch.tv/slotsband" },
                { label: "YouTube", badge: "YT", bg: "#FF0000", text: "#fff", href: "https://youtube.com/@slotsband" },
              ].map(p => (
                <a
                  key={p.label}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={p.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: p.bg, color: p.text }}
                >
                  {p.badge}
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
          <p className="text-xs text-white/50">{t.copyright}</p>
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
