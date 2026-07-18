import Link from "next/link"
import type { Lang } from "@/lib/types"
import { TRANSLATIONS } from "@/lib/data"
import { SlotsbandLogo } from "@/components/slotsband-logo"

interface SiteFooterProps {
  lang: Lang
}

export function SiteFooter({ lang }: SiteFooterProps) {
  const t = TRANSLATIONS[lang].footer
  const base = `/${lang}`

  return (
    <footer className="w-full bg-[#2D1783]">
      {/* Responsible gambling banner — slightly darker band for hierarchy */}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand col */}
          <div className="md:col-span-1">
            <Link href={`/${lang}`} className="inline-block mb-4">
              <SlotsbandLogo variant="light" height={30} />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              {t.description}
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 hover:border-white/40 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-xs font-bold text-[#FFD700] uppercase mb-4 border-l-2 border-[#FFD700] pl-3 tracking-wider">
              {t.quicklinks}
            </h5>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link href={`${base}/nettikasinot`} className="hover:text-white transition-colors">{t.bestCasinos}</Link></li>
              <li><Link href={`${base}/nettikasinot?filter=pikakasino`} className="hover:text-white transition-colors">{t.quickCasinos}</Link></li>
              <li><Link href={`${base}/kasinobonukset`} className="hover:text-white transition-colors">{lang === "fi" ? "Kasinobonukset" : "Casino Bonuses"}</Link></li>
              <li><Link href={`${base}/kasinopelit`} className="hover:text-white transition-colors">{lang === "fi" ? "Kasinopelit" : "Casino Games"}</Link></li>
              <li><Link href={`${base}/rafflet`} className="hover:text-white transition-colors">{lang === "fi" ? "Rafflet" : "Raffles"}</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h5 className="text-xs font-bold text-[#FFD700] uppercase mb-4 border-l-2 border-[#FFD700] pl-3 tracking-wider">
              {t.about}
            </h5>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link href={`${base}/about`} className="hover:text-white transition-colors">{lang === "fi" ? "Tietoa SlotsBandista" : "About SlotsBand"}</Link></li>
              <li><Link href={`${base}/contact`} className="hover:text-white transition-colors">{t.contact}</Link></li>
              <li><Link href={`${base}/about#how-we-rate`} className="hover:text-white transition-colors">{lang === "fi" ? "Arviointikriteerit" : "How We Rate"}</Link></li>
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
              {lang === "fi" ? "Tietosuoja" : "Privacy Policy"}
            </Link>
            <Link href={`${base}/terms`} className="hover:text-white transition-colors">
              {lang === "fi" ? "Käyttöehdot" : "Terms & Conditions"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
