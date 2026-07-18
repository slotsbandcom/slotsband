import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { CASINOS, TRANSLATIONS } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSlider } from "@/components/hero-slider"
import { CasinoCard } from "@/components/casino-card"

const VALID_LANGS: Lang[] = ["fi", "uk", "en"]

interface HomePageProps {
  params: Promise<{ lang: string }>
}

export async function generateStaticParams() {
  return VALID_LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params
  const safeLang = (VALID_LANGS.includes(lang as Lang) ? lang : "fi") as Lang
  const t = TRANSLATIONS[safeLang]

  const titles: Record<Lang, string> = {
    fi: "SlotsBand – Parhaat Nettikasinot Suomessa 2026",
    uk: "SlotsBand – Best UK Online Casinos 2026",
    en: "SlotsBand – Best Online Casinos 2026",
  }
  const descs: Record<Lang, string> = {
    fi: "Löydä Suomen parhaat nettikasinot 2026. Eksklusiiviset bonukset, verovapaat voitot, pikakotiutukset. Asiantuntijoiden testaama.",
    uk: "Find the best UK online casinos 2026. Exclusive bonuses, UKGC licensed, fast payouts. Expert tested and reviewed.",
    en: "Find the best online casinos 2026. Exclusive bonuses, fast payouts, expert reviews. Trusted casino guide.",
  }

  return {
    title: titles[safeLang],
    description: descs[safeLang],
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const safeLang = (VALID_LANGS.includes(lang as Lang) ? lang : "fi") as Lang
  const t = TRANSLATIONS[safeLang]
  const featuredCasinos = CASINOS.filter((c) => c.is_active).sort((a, b) => a.rank - b.rank).slice(0, 10)

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader lang={safeLang} currentPath={`/${safeLang}`} />

      {/* Hero */}
      <header className="bg-white pt-3 pb-3 md:pt-6 md:pb-6 border-b border-[#E5E8F0]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">

          {/* Mobile layout: slider on top, compact text strip below */}
          <div className="lg:hidden flex flex-col gap-2">
            <HeroSlider lang={safeLang} />
            {/* Compact text row */}
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-display font-bold text-base text-[#1b1b1c] leading-snug">
                {t.hero.title}{" "}
                <span className="text-[#2D1783]">{t.hero.titleHighlight}</span>
                {t.hero.titleSuffix ? ` ${t.hero.titleSuffix}` : ""}
              </h1>
              {/* Trust pills — 3 compact icons only */}
              <div className="flex-shrink-0 flex gap-1">
                {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((trust) => (
                  <div key={trust} className="flex items-center gap-1 bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-1 rounded-full">
                    <span
                      className="material-symbols-outlined text-[#FFD700] text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                      aria-hidden="true"
                    >
                      check_circle
                    </span>
                    <span className="text-[8px] font-bold text-[#2D1783] uppercase tracking-wide whitespace-nowrap hidden sm:inline">
                      {trust}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop layout: text left, slider right */}
          <div className="hidden lg:flex flex-row items-center gap-8">
            <div className="flex-1 space-y-2 max-w-xl">
              <h1 className="font-display font-bold text-3xl lg:text-4xl text-[#1b1b1c] leading-snug text-balance">
                {t.hero.title}{" "}
                <span className="text-[#2D1783] relative">
                  {t.hero.titleHighlight}
                  <span className="absolute bottom-0.5 left-0 w-full h-1.5 bg-[#FFD700]/40 -z-10 rounded" aria-hidden="true" />
                </span>
                {t.hero.titleSuffix ? ` ${t.hero.titleSuffix}` : ""}
              </h1>
              <p className="text-sm md:text-base text-[#787585] leading-snug">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((trust) => (
                  <div key={trust} className="flex items-center gap-1 bg-[#F8F9FD] border border-[#E5E8F0] px-2.5 py-1 rounded-full">
                    <span
                      className="material-symbols-outlined text-[#FFD700] text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                      aria-hidden="true"
                    >
                      check_circle
                    </span>
                    <span className="text-[9px] font-bold text-[#2D1783] uppercase tracking-wide whitespace-nowrap">
                      {trust}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full max-w-xl">
              <HeroSlider lang={safeLang} />
            </div>
          </div>

        </div>
      </header>

      {/* Quick filter bar — desktop only */}
      <section className="hidden md:block bg-[#F8F9FD] py-1.5 border-b border-[#E5E8F0]" aria-label="Pikafiltterit">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { icon: "bolt", label: t.filters.quickCasinos, filter: "pikakasino" },
              { icon: "new_releases", label: t.filters.newCasinos, filter: "uudet" },
              { icon: "feature_search", label: t.filters.nonSticky, filter: "non-sticky" },
              { icon: "verified", label: t.filters.taxFree, filter: "verovapaat" },
              { icon: "casino", label: t.filters.freeSpins, filter: "ilmaiskierrokset" },
            ].map((item) => (
              <a
                key={item.filter}
                href={`/${safeLang}/nettikasinot?filter=${item.filter}`}
                className="flex-shrink-0 bg-white border border-[#E5E8F0] px-3.5 py-2 rounded-xl flex items-center gap-2 hover:border-[#FFD700] hover:shadow-md transition-all group"
              >
                <span className="material-symbols-outlined text-[#2D1783] group-hover:text-[#FFD700] transition-colors text-[16px]" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-[11px] font-bold text-[#1b1b1c] whitespace-nowrap">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Casino listing */}
      <main className="pt-[15px] pb-12">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="font-display font-bold text-3xl text-[#1b1b1c]">{t.listing.title}</h2>
              <p className="text-[#787585] mt-1.5">{t.listing.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#787585] font-semibold bg-white px-4 py-2.5 rounded-xl border border-[#E5E8F0] cursor-pointer hover:border-[#2D1783] transition-colors">
              <span className="material-symbols-outlined text-[#FFD700] text-[18px]">sort</span>
              <span>{t.listing.sortBy}</span>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {featuredCasinos.map((casino, idx) => (
              <CasinoCard
                key={casino.id}
                casino={casino}
                lang={safeLang}
                rank={idx + 1}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href={`/${safeLang}/nettikasinot`}
              className="flex items-center gap-2 text-[#2D1783] font-semibold hover:text-[#FFD700] transition-colors group"
            >
              {t.listing.showMore}
              <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform text-[20px]">
                expand_more
              </span>
            </a>
          </div>
        </div>
      </main>

      {/* Trust / Info section */}
      <section className="bg-white py-16 border-t border-[#E5E8F0]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display font-bold text-3xl text-[#1b1b1c] text-balance">
                {safeLang === "fi" ? (
                  <>
                    Pelaajien turvallisuus on{" "}
                    <span className="text-[#2D1783] relative">
                      prioriteettimme
                      <span className="absolute bottom-1 left-0 w-full h-2.5 bg-[#FFD700]/30 -z-10 rounded" />
                    </span>
                  </>
                ) : (
                  <>Player safety is our <span className="text-[#2D1783]">top priority</span></>
                )}
              </h2>
              <p className="text-lg text-[#787585] leading-relaxed">
                {safeLang === "fi"
                  ? "SlotsBand on asiantuntijoiden ylläpitämä sivusto, joka on omistautunut rehellisyyteen ja läpinäkyvyyteen. Jokainen kasino listauksessamme on käynyt läpi tiukan laadunvalvontaprosessin."
                  : "SlotsBand is maintained by experts dedicated to honesty and transparency. Every casino in our listings has undergone a rigorous quality control process."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: "verified_user",
                    title: safeLang === "fi" ? "Vain lisensoidut" : "Licensed Only",
                    desc: safeLang === "fi" ? "Vain virallisten peliviranomaisten (MGA, EMTA) valvomat sivustot." : "Only sites supervised by official gaming authorities (MGA, UKGC).",
                  },
                  {
                    icon: "account_balance_wallet",
                    title: safeLang === "fi" ? "Varmistetut maksut" : "Verified Payments",
                    desc: safeLang === "fi" ? "Testaamme itse kotiutukset Trustlylla, Zimplerillä ja Britellä." : "We test withdrawals ourselves with Trustly, Brite and other methods.",
                  },
                ].map((item) => (
                  <div
                    key={item.icon}
                    className="bg-[#F8F9FD] p-5 rounded-2xl border border-[#E5E8F0] space-y-2 group hover:border-[#FFD700] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#2D1783] text-3xl group-hover:scale-110 transition-transform inline-block">
                      {item.icon}
                    </span>
                    <h4 className="font-display font-bold text-[#1b1b1c]">{item.title}</h4>
                    <p className="text-sm text-[#787585] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="relative">
              <div className="absolute -inset-4 bg-[#FFD700]/10 rounded-3xl -rotate-1" />
              <div className="bg-white p-8 rounded-3xl border border-[#E5E8F0] shadow-xl relative z-10">
                <h3 className="font-display font-bold text-xl text-[#1b1b1c] mb-6">
                  {safeLang === "fi" ? "Miten nettikasinot toimivat?" : "How do online casinos work?"}
                </h3>
                <ol className="space-y-5">
                  {[
                    {
                      n: "1",
                      title: safeLang === "fi" ? "Valitse" : "Choose",
                      desc: safeLang === "fi"
                        ? "Selaa listauksiamme ja valitse itsellesi sopivin bonus tai pelitapa."
                        : "Browse our listings and choose the bonus or game style that suits you.",
                    },
                    {
                      n: "2",
                      title: safeLang === "fi" ? "Talleta" : "Deposit",
                      desc: safeLang === "fi"
                        ? "Käytä pankkitunnuksia nopeaan ja turvalliseen talletukseen ilman rekisteröitymistä."
                        : "Use your preferred payment method for a fast and secure deposit.",
                    },
                    {
                      n: "3",
                      title: safeLang === "fi" ? "Pelaa & Nosta" : "Play & Withdraw",
                      desc: safeLang === "fi"
                        ? "Nauti tuhansista peleistä ja nosta voittosi jopa minuuteissa pankkitilillesi."
                        : "Enjoy thousands of games and withdraw your winnings in minutes.",
                    },
                  ].map((step) => (
                    <li key={step.n} className="flex gap-4">
                      <span className="w-8 h-8 rounded-full bg-[#2D1783] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 border-[#FFD700]">
                        {step.n}
                      </span>
                      <p className="text-sm text-[#474554] leading-relaxed">
                        <span className="font-bold text-[#1b1b1c]">{step.title}: </span>
                        {step.desc}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter lang={safeLang} />
    </div>
  )
}
