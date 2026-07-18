import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { CASINOS } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CasinoCard } from "@/components/casino-card"

const VALID_LANGS: Lang[] = ["fi", "uk", "en"]

interface CasinoPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const paths: { lang: string; slug: string }[] = []
  for (const lang of VALID_LANGS) {
    for (const casino of CASINOS) {
      paths.push({ lang, slug: casino.slug })
    }
  }
  return paths
}

export async function generateMetadata({ params }: CasinoPageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "fi") as Lang
  const casino = CASINOS.find((c) => c.slug === slug)
  if (!casino) return {}

  const title = lang === "fi"
    ? (casino.meta_title_fi ?? `${casino.name} Arvostelu 2026 | SlotsBand`)
    : `${casino.name} Review 2026 | SlotsBand`
  const desc = lang === "fi"
    ? (casino.meta_description_fi ?? `Lue ${casino.name} kasino arvostelu. Bonukset, maksutavat, lisenssi ja enemmän.`)
    : `Read ${casino.name} casino review. Bonuses, payment methods, license and more.`

  return { title, description: desc }
}

function TrustScore({ score }: { score: number }) {
  const pct = score
  const color = score >= 85 ? "#27AE60" : score >= 70 ? "#FFD700" : "#E74C3C"
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E8F0" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#1b1b1c]">
          {score}
        </span>
      </div>
      <span className="text-[10px] font-bold text-[#787585] uppercase tracking-wide">Trust</span>
    </div>
  )
}

export default async function CasinoPage({ params }: CasinoPageProps) {
  const { lang: rawLang, slug } = await params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "fi") as Lang
  const casino = CASINOS.find((c) => c.slug === slug)
  if (!casino) notFound()

  const review = lang === "fi" ? casino.review_fi : lang === "uk" ? casino.review_uk : casino.review_en
  const pros = lang === "fi" ? casino.pros_fi : lang === "uk" ? casino.pros_uk : casino.pros_en
  const cons = lang === "fi" ? casino.cons_fi : lang === "uk" ? casino.cons_uk : casino.cons_en
  const faqs = lang === "fi" ? casino.faq_fi : lang === "uk" ? casino.faq_uk : casino.faq_en

  const similar = CASINOS
    .filter((c) => c.slug !== slug && c.is_active)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  const isInstant = (casino.withdrawal_time_max_hours ?? 99) === 0

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Casino",
      "name": casino.name,
      "url": casino.affiliate_url,
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": casino.rating,
      "bestRating": 10,
      "worstRating": 0,
    },
    "author": { "@type": "Organization", "name": "SlotsBand" },
    "publisher": { "@type": "Organization", "name": "SlotsBand" },
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <SiteHeader lang={lang} currentPath={`/${lang}/nettikasinot/${slug}`} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="bg-white border-b border-[#E5E8F0]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#787585] mb-6">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">
              {lang === "fi" ? "Etusivu" : "Home"}
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href={`/${lang}/nettikasinot`} className="hover:text-[#2D1783] transition-colors">
              {lang === "fi" ? "Nettikasinot" : "Casinos"}
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#2D1783] font-semibold">{casino.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Logo + name */}
            <div className="flex flex-col items-center gap-3 w-32 flex-shrink-0">
              <div className="w-28 h-28 bg-[#F0EDEE] rounded-2xl flex items-center justify-center p-3">
                {casino.logo_url ? (
                  <Image src={casino.logo_url} alt={`${casino.name} logo`} width={112} height={112} className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-[#2D1783] text-4xl">casino</span>
                )}
              </div>
              <span className="text-xs font-semibold text-[#787585]">{lang === "fi" ? "Perustettu" : "Est."} {casino.established_year ?? "—"}</span>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display font-bold text-3xl md:text-4xl text-[#1b1b1c]">{casino.name}</h1>
                {casino.is_verified && (
                  <span className="flex items-center gap-1 bg-[#27AE60]/10 text-[#27AE60] text-xs font-bold px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    {lang === "fi" ? "Vahvistettu" : "Verified"}
                  </span>
                )}
                {casino.is_pikakasino && (
                  <span className="flex items-center gap-1 bg-[#2D1783]/10 text-[#2D1783] text-xs font-bold px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    {lang === "fi" ? "Pikakasino" : "Quick Casino"}
                  </span>
                )}
              </div>

              {/* Quick stats bar */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`material-symbols-outlined text-[18px] ${i < Math.round((casino.rating / 10) * 5) ? "star-filled" : "star-empty"}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <span className="font-bold text-[#2D1783] text-lg">{casino.rating.toFixed(1)}/10</span>
                </div>
                <TrustScore score={casino.trust_score} />
              </div>

              {/* Quick facts */}
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: "security", label: casino.license_authority ?? "—" },
                  { icon: "payments", label: `Min. ${casino.min_deposit ?? "—"}€` },
                  { icon: "speed", label: isInstant ? (lang === "fi" ? "Välitön kotiutus" : "Instant withdrawal") : `${casino.withdrawal_time_max_hours}h` },
                  { icon: "casino", label: `${casino.total_games_count?.toLocaleString() ?? "—"} ${lang === "fi" ? "peliä" : "games"}` },
                ].map((fact) => (
                  <div key={fact.icon} className="flex items-center gap-2 bg-[#F8F9FD] border border-[#E5E8F0] px-3 py-2 rounded-xl text-sm">
                    <span className="material-symbols-outlined text-[#2D1783] text-[16px]">{fact.icon}</span>
                    <span className="font-semibold text-[#474554]">{fact.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA box */}
            <div className="w-full md:w-56 flex-shrink-0">
              <div className="bg-[#2D1783] rounded-2xl p-5 text-white space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                  {lang === "fi" ? "Eksklusiivinen tarjous" : "Exclusive offer"}
                </p>
                <p className="font-display font-bold text-sm leading-tight">{casino.welcome_bonus_text}</p>
                <a
                  href={`/${lang}/mene/${casino.mene_slug}`}
                  rel="nofollow sponsored noopener noreferrer"
                  target="_blank"
                  className="block bg-[#FFD700] text-[#1b1b1c] font-bold text-sm text-center py-3.5 rounded-xl hover:bg-[#FFE866] active:scale-95 transition-all"
                >
                  {lang === "fi" ? "Pelaa Nyt" : "Play Now"}
                  <span className="material-symbols-outlined text-[16px] ml-1 align-middle">arrow_forward</span>
                </a>
                <p className="text-[10px] text-white/60 text-center">{lang === "fi" ? "18+ | Pelaa vastuullisesti" : "18+ | Gamble responsibly"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Pros & Cons */}
            {(pros || cons) && (
              <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6">
                <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-5">
                  {lang === "fi" ? "Hyvät & Huonot puolet" : "Pros & Cons"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pros && pros.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#27AE60] mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
                        {lang === "fi" ? "Hyvää" : "Pros"}
                      </p>
                      <ul className="space-y-2.5">
                        {pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-[#474554]">
                            <span className="material-symbols-outlined text-[#27AE60] text-[18px] flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cons && cons.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#E74C3C] mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>thumb_down</span>
                        {lang === "fi" ? "Huonoa" : "Cons"}
                      </p>
                      <ul className="space-y-2.5">
                        {cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-[#474554]">
                            <span className="material-symbols-outlined text-[#E74C3C] text-[18px] flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bonus details */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6">
              <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-5">
                {lang === "fi" ? "Bonustiedot" : "Bonus Details"}
              </h2>
              <div className="bg-[#F8F9FD] rounded-xl p-5 border border-[#E5E8F0] mb-4">
                <p className="font-display font-bold text-[#2D1783] text-lg mb-2">{casino.welcome_bonus_text}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {[
                    { label: lang === "fi" ? "Minimitalletus" : "Min Deposit", value: casino.welcome_bonus_min_deposit ? `${casino.welcome_bonus_min_deposit}€` : "—" },
                    { label: lang === "fi" ? "Kierrätys" : "Wagering", value: casino.welcome_bonus_wagering === 0 ? (lang === "fi" ? "Vapaa" : "None") : `${casino.welcome_bonus_wagering}x` },
                    { label: lang === "fi" ? "Max. Bonus" : "Max Bonus", value: casino.welcome_bonus_max_amount ? `${casino.welcome_bonus_max_amount}€` : "—" },
                    { label: lang === "fi" ? "Valuutta" : "Currency", value: casino.welcome_bonus_currency ?? "EUR" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide">{item.label}</p>
                      <p className="font-bold text-[#1b1b1c] mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {casino.no_deposit_bonus && (
                  <span className="flex items-center gap-1.5 bg-[#27AE60]/10 text-[#27AE60] text-xs font-bold px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[14px]">money_off</span>
                    {lang === "fi" ? "Ei talletusta" : "No Deposit"}
                  </span>
                )}
                {casino.free_spins_amount && casino.free_spins_amount > 0 && (
                  <span className="flex items-center gap-1.5 bg-[#2D1783]/10 text-[#2D1783] text-xs font-bold px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[14px]">rotate_right</span>
                    {casino.free_spins_amount} {lang === "fi" ? "Ilmaiskierrosta" : "Free Spins"}
                  </span>
                )}
                {casino.cashback_percent && casino.cashback_percent > 0 && (
                  <span className="flex items-center gap-1.5 bg-[#FFD700]/20 text-[#775900] text-xs font-bold px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[14px]">percent</span>
                    {casino.cashback_percent}% Cashback
                  </span>
                )}
              </div>
            </div>

            {/* Casino info table */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6">
              <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-5">
                {lang === "fi" ? "Kasinon Tiedot" : "Casino Info"}
              </h2>
              <div className="divide-y divide-[#E5E8F0]">
                {[
                  { label: lang === "fi" ? "Lisenssi" : "License", value: casino.license_authority },
                  { label: lang === "fi" ? "Lisenssijärjestö" : "License number", value: casino.license_number },
                  { label: lang === "fi" ? "Perustettu" : "Established", value: casino.established_year?.toString() },
                  { label: lang === "fi" ? "Min. talletus" : "Min deposit", value: casino.min_deposit ? `${casino.min_deposit}€` : undefined },
                  { label: lang === "fi" ? "Max. nosto/pv" : "Max withdrawal/day", value: casino.max_withdrawal_per_day ? `${casino.max_withdrawal_per_day}€` : undefined },
                  { label: lang === "fi" ? "Kotiutusaika" : "Withdrawal time", value: isInstant ? (lang === "fi" ? "Välitön" : "Instant") : `${casino.withdrawal_time_min_hours}-${casino.withdrawal_time_max_hours}h` },
                  { label: lang === "fi" ? "Pelejä yhteensä" : "Total games", value: casino.total_games_count?.toLocaleString() },
                  { label: lang === "fi" ? "Live kasino" : "Live casino", value: casino.live_casino ? (lang === "fi" ? "Kyllä" : "Yes") : (lang === "fi" ? "Ei" : "No") },
                  { label: lang === "fi" ? "Mobiili" : "Mobile", value: casino.mobile_optimized ? (lang === "fi" ? "Optimoitu" : "Optimized") : "—" },
                  { label: lang === "fi" ? "Live chat" : "Live chat", value: casino.live_chat_support ? (lang === "fi" ? "Kyllä" : "Yes") : (lang === "fi" ? "Ei" : "No") },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex justify-between py-3 text-sm">
                    <span className="text-[#787585] font-medium">{row.label}</span>
                    <span className="font-semibold text-[#1b1b1c] text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment methods */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6">
              <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-5">
                {lang === "fi" ? "Maksutavat" : "Payment Methods"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {casino.payment_methods.map((pm) => (
                  <span
                    key={pm}
                    className="bg-[#F8F9FD] border border-[#E5E8F0] px-3 py-2 rounded-xl text-sm font-semibold text-[#474554] flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[#2D1783] text-[14px]">payments</span>
                    {pm}
                  </span>
                ))}
              </div>
            </div>

            {/* Game providers */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6">
              <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-5">
                {lang === "fi" ? "Peliohjelmistot" : "Game Providers"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {casino.game_providers.map((gp) => (
                  <span
                    key={gp}
                    className="bg-[#F8F9FD] border border-[#E5E8F0] px-3 py-2 rounded-xl text-sm font-semibold text-[#474554]"
                  >
                    {gp}
                  </span>
                ))}
              </div>
            </div>

            {/* Review text */}
            {review && (
              <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6">
                <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-4">
                  {lang === "fi" ? `${casino.name} Arvostelu` : `${casino.name} Review`}
                </h2>
                <div className="prose prose-sm max-w-none text-[#474554] leading-relaxed">
                  {review}
                </div>
              </div>
            )}

            {/* FAQ */}
            {faqs && faqs.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6">
                <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-5">
                  {lang === "fi" ? "Usein kysytyt kysymykset" : "FAQ"}
                </h2>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      "mainEntity": faqs.map((f) => ({
                        "@type": "Question",
                        "name": f.q,
                        "acceptedAnswer": { "@type": "Answer", "text": f.a },
                      })),
                    }),
                  }}
                />
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <details key={i} className="group border border-[#E5E8F0] rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-semibold text-[#1b1b1c] list-none hover:bg-[#F8F9FD] transition-colors">
                        {faq.q}
                        <span className="material-symbols-outlined text-[#787585] group-open:rotate-180 transition-transform text-[18px]">
                          expand_more
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-[#787585] leading-relaxed">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="lg:w-72 flex-shrink-0 space-y-5">
            {/* Sticky CTA */}
            <div className="bg-[#2D1783] rounded-2xl p-6 text-white sticky top-20">
              <p className="text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-3">
                {lang === "fi" ? "Paras tarjous" : "Best Offer"}
              </p>
              <p className="font-display font-bold text-base leading-snug mb-4">{casino.welcome_bonus_text}</p>
              <a
                href={`/${lang}/mene/${casino.mene_slug}`}
                rel="nofollow sponsored noopener noreferrer"
                target="_blank"
                className="block bg-[#FFD700] text-[#1b1b1c] font-bold text-sm text-center py-4 rounded-xl hover:bg-[#FFE866] active:scale-95 transition-all"
              >
                {lang === "fi" ? "Pelaa Nyt" : "Play Now"}
              </a>
              <div className="mt-4 space-y-2.5 text-xs text-white/70">
                {[
                  { icon: "security", text: casino.license_authority },
                  { icon: "speed", text: isInstant ? (lang === "fi" ? "Välitön kotiutus" : "Instant withdrawal") : `Max ${casino.withdrawal_time_max_hours}h` },
                  { icon: "payments", text: `Min. ${casino.min_deposit}€` },
                ].map((item) => (
                  <div key={item.icon} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FFD700] text-[14px]">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/40 text-center mt-4">
                {lang === "fi" ? "18+ | Pelaa vastuullisesti" : "18+ | Gamble responsibly"}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5">
              <h3 className="font-display font-bold text-[#1b1b1c] mb-4">
                {lang === "fi" ? "Ominaisuudet" : "Features"}
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: lang === "fi" ? "Live Kasino" : "Live Casino", val: casino.live_casino },
                  { label: lang === "fi" ? "Mobiili" : "Mobile Optimized", val: casino.mobile_optimized },
                  { label: lang === "fi" ? "iOS App" : "iOS App", val: casino.mobile_app_ios },
                  { label: lang === "fi" ? "Android App" : "Android App", val: casino.mobile_app_android },
                  { label: "Live Chat", val: casino.live_chat_support },
                  { label: lang === "fi" ? "Urheiluvedonlyönti" : "Sports Betting", val: casino.sports_betting },
                  { label: lang === "fi" ? "Pikakasino" : "Quick Casino", val: casino.is_pikakasino },
                  { label: lang === "fi" ? "VIP-ohjelma" : "VIP Program", val: casino.vip_program },
                ].map((feat) => (
                  <div key={feat.label} className="flex items-center justify-between text-sm">
                    <span className="text-[#787585]">{feat.label}</span>
                    <span className={`material-symbols-outlined text-[18px] ${feat.val ? "text-[#27AE60]" : "text-[#E5E8F0]"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {feat.val ? "check_circle" : "cancel"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Similar casinos */}
        <div className="mt-12">
          <h2 className="font-display font-bold text-2xl text-[#1b1b1c] mb-6">
            {lang === "fi" ? "Samankaltaiset kasinot" : "Similar Casinos"}
          </h2>
          <div className="flex flex-col gap-5">
            {similar.map((c, idx) => (
              <CasinoCard key={c.id} casino={c} lang={lang} rank={idx + 1} />
            ))}
          </div>
        </div>
      </div>

      <SiteFooter lang={lang} />
    </div>
  )
}
