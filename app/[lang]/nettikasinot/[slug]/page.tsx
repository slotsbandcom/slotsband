import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { getCasinos, getCasinoBySlug } from "@/lib/supabase/queries"
import { getCasinoSlugs } from "@/lib/supabase/build-client"
import { CasinoCard } from "@/components/casino-card"

const VALID_LANGS: Lang[] = ["fi", "uk", "en"]

interface CasinoPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getCasinoSlugs()
  const paths: { lang: string; slug: string }[] = []
  for (const lang of VALID_LANGS) {
    for (const slug of slugs) {
      paths.push({ lang, slug })
    }
  }
  return paths
}

const SITE_URL = "https://slotsband.com"

export async function generateMetadata({ params }: CasinoPageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "fi") as Lang
  const casino = await getCasinoBySlug(slug)
  if (!casino) return {}

  const title = lang === "fi"
    ? (casino.meta_title_fi ?? `${casino.name} Arvostelu 2026 | SlotsBand`)
    : `${casino.name} Review 2026 | SlotsBand`
  const desc = lang === "fi"
    ? (casino.meta_description_fi ?? `Lue ${casino.name} kasino arvostelu. Bonukset, maksutavat, lisenssi ja enemmän.`)
    : `Read ${casino.name} casino review. Bonuses, payment methods, license and more.`

  return {
    title,
    description: desc,
    openGraph: { title, description: desc },
    alternates: {
      canonical: `${SITE_URL}/${lang}/nettikasinot/${slug}`,
      languages: {
        "fi":      `${SITE_URL}/fi/nettikasinot/${slug}`,
        "en":      `${SITE_URL}/en/nettikasinot/${slug}`,
        "en-GB":   `${SITE_URL}/uk/nettikasinot/${slug}`,
        "x-default": `${SITE_URL}/fi/nettikasinot/${slug}`,
      },
    },
  }
}

function TrustScore({ score }: { score: number }) {
  if (!score) return null
  const color = score >= 85 ? "#27AE60" : score >= 70 ? "#FFD700" : "#E74C3C"
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90" aria-hidden="true">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E8F0" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#1b1b1c]">
          {score}
        </span>
      </div>
      <span className="text-[9px] font-bold text-[#787585] uppercase tracking-wide">Trust</span>
    </div>
  )
}

// Returns val+suffix when val is present and non-zero, otherwise fallback.
function d(val: string | number | null | undefined, suffix = "", fallback = "—"): string {
  if (val === null || val === undefined || val === "" || val === 0) return fallback
  return `${val}${suffix}`
}

function getLicenseBadge(license: string | null | undefined) {
  if (!license) return null
  const l = license.toLowerCase()
  if (l.includes("mga") || l.includes("ukgc") || l.includes("gibraltar") || l.includes("spelinspektionen") || l.includes("isle of man") || l.includes("veikkaus")) {
    return { dot: "#27AE60", label: "Eurooppalainen lisenssi" }
  }
  if (l.includes("curacao") || l.includes("kahnawake") || l.includes("pagcor") || l.includes("antillephone")) {
    return { dot: "#F39C12", label: "Kansainvälinen lisenssi" }
  }
  return { dot: "#E74C3C", label: "Heikko lisenssi" }
}

const LANG_LABELS: Record<string, { flag: string; name: string }> = {
  fi: { flag: "🇫🇮", name: "Suomi" },
  en: { flag: "🌍", name: "English" },
  sv: { flag: "🇸🇪", name: "Svenska" },
  se: { flag: "🇸🇪", name: "Svenska" },
  no: { flag: "🇳🇴", name: "Norsk" },
  de: { flag: "🇩🇪", name: "Deutsch" },
  pl: { flag: "🇵🇱", name: "Polski" },
  es: { flag: "🇪🇸", name: "Español" },
  pt: { flag: "🇵🇹", name: "Português" },
  fr: { flag: "🇫🇷", name: "Français" },
  it: { flag: "🇮🇹", name: "Italiano" },
  nl: { flag: "🇳🇱", name: "Nederlands" },
  uk: { flag: "🇬🇧", name: "English (UK)" },
}

const COUNTRY_LABELS_FI: Record<string, string> = {
  FI: "🇫🇮 Suomi", SE: "🇸🇪 Ruotsi", NO: "🇳🇴 Norja", DK: "🇩🇰 Tanska",
  DE: "🇩🇪 Saksa", IE: "🇮🇪 Irlanti", CA: "🇨🇦 Kanada", NZ: "🇳🇿 Uusi-Seelanti",
  AT: "🇦🇹 Itävalta", CH: "🇨🇭 Sveitsi", BE: "🇧🇪 Belgia", NL: "🇳🇱 Alankomaat",
  GB: "🇬🇧 Iso-Britannia", US: "🇺🇸 USA", AU: "🇦🇺 Australia", FR: "🇫🇷 Ranska",
  ES: "🇪🇸 Espanja", IT: "🇮🇹 Italia", PL: "🇵🇱 Puola", PT: "🇵🇹 Portugali",
  BR: "🇧🇷 Brasilia", JP: "🇯🇵 Japani", IN: "🇮🇳 Intia", ZA: "🇿🇦 Etelä-Afrikka",
}

function cleanWpHtml(html: string): string {
  return html
    .replace(/<!--\s*wp:[^>]*?-->/g, "")
    .replace(/<!--\s*\/wp:[^>]*?-->/g, "")
    .replace(/<figure[\s\S]*?<\/figure>/gi, "")
    .replace(/\[joli-faq-seo[^\]]*\]/g, "")
    .replace(/<p>\s*<\/p>/g, "")
    .trim()
}

export default async function CasinoPage({ params }: CasinoPageProps) {
  const { lang: rawLang, slug } = await params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "fi") as Lang
  const [casino, allCasinos] = await Promise.all([
    getCasinoBySlug(slug),
    getCasinos({ activeOnly: true }),
  ])
  if (!casino) notFound()

  const review = lang === "fi" ? casino.review_fi : lang === "uk" ? casino.review_uk : casino.review_en
  const pros = lang === "fi" ? casino.pros_fi : lang === "uk" ? casino.pros_uk : casino.pros_en
  const cons = lang === "fi" ? casino.cons_fi : lang === "uk" ? casino.cons_uk : casino.cons_en
  const faqs = lang === "fi" ? casino.faq_fi : lang === "uk" ? casino.faq_uk : casino.faq_en

  const similar = allCasinos
    .filter((c) => c.slug !== slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  const isInstant = (casino.withdrawal_time_max_hours ?? 99) === 0

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": { "@type": "Casino", "name": casino.name, "url": casino.affiliate_url },
    "reviewRating": { "@type": "Rating", "ratingValue": casino.rating, "bestRating": 10, "worstRating": 0 },
    "author": { "@type": "Organization", "name": "SlotsBand" },
    "publisher": { "@type": "Organization", "name": "SlotsBand" },
  }

  const stars = Math.round((casino.rating / 10) * 5)

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ── */}
      <div className="bg-white border-b border-[#E5E8F0]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 pt-5 pb-6 md:pt-8 md:pb-8">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#787585] mb-4">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">
              {lang === "fi" ? "Etusivu" : "Home"}
            </Link>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">chevron_right</span>
            <Link href={`/${lang}/nettikasinot`} className="hover:text-[#2D1783] transition-colors">
              {lang === "fi" ? "Nettikasinot" : "Casinos"}
            </Link>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">chevron_right</span>
            <span className="text-[#2D1783] font-semibold truncate max-w-[120px]">{casino.name}</span>
          </nav>

          {/* Mobile hero: single column */}
          <div className="flex flex-col gap-4 md:hidden">
            {/* Row 1: logo + name + badges */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-[#F0EDEE] rounded-2xl flex items-center justify-center p-2.5 flex-shrink-0 overflow-hidden">
                {casino.logo_url ? (
                  <Image src={casino.logo_url} alt={`${casino.name} logo`} width={80} height={80} className="w-full h-full object-contain" priority />
                ) : (
                  <span className="material-symbols-outlined text-[#2D1783] text-4xl" aria-hidden="true">casino</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display font-bold text-2xl text-[#1b1b1c] leading-tight">{casino.name}</h1>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {casino.is_verified && (
                    <span className="flex items-center gap-1 bg-[#27AE60]/10 text-[#27AE60] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">verified</span>
                      {lang === "fi" ? "Vahvistettu" : "Verified"}
                    </span>
                  )}
                  {casino.is_pikakasino && (
                    <span className="flex items-center gap-0.5 bg-[#2D1783]/10 text-[#2D1783] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[11px]" aria-hidden="true">bolt</span>
                      {lang === "fi" ? "Pikakasino" : "Quick"}
                    </span>
                  )}
                  {(casino.available_in ?? []).includes("FI") && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#27AE60]/10 text-[#27AE60]">
                      ✅ Suomi
                    </span>
                  )}
                  {(casino.restricted_in ?? []).includes("FI") && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E74C3C]/10 text-[#E74C3C]">
                      ❌ Ei Suomi
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: stars + trust + rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`material-symbols-outlined text-[20px] ${i < stars ? "text-[#FFD700]" : "text-[#E5E8F0]"}`} style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                ))}
              </div>
              <span className="font-bold text-[#2D1783] text-base">{casino.rating.toFixed(1)}/10</span>
              <TrustScore score={casino.trust_score} />
            </div>

            {/* Row 3: quick facts as 2×2 grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "security", label: lang === "fi" ? "Lisenssi" : "License", value: casino.license_authority ?? "—" },
                { icon: "payments", label: lang === "fi" ? "Min. talletus" : "Min deposit", value: casino.min_deposit ? `${casino.min_deposit}€` : "—" },
                { icon: "speed", label: lang === "fi" ? "Kotiutus" : "Withdrawal", value: isInstant ? (lang === "fi" ? "Välitön" : "Instant") : casino.withdrawal_time_max_hours ? `Max ${casino.withdrawal_time_max_hours}h` : "—" },
                { icon: "casino", label: lang === "fi" ? "Peliä" : "Games", value: casino.total_games_count?.toLocaleString() ?? "—" },
              ].map((fact) => (
                <div key={fact.icon} className="flex items-center gap-2 bg-[#F8F9FD] border border-[#E5E8F0] px-3 py-2 rounded-xl">
                  <span className="material-symbols-outlined text-[#2D1783] text-[16px]" aria-hidden="true">{fact.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-[#787585] uppercase tracking-wide leading-none">{fact.label}</p>
                    <p className="text-xs font-bold text-[#1b1b1c] mt-0.5 truncate">{fact.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 4: bonus text + CTA */}
            <div className="bg-[#2D1783] rounded-2xl p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFD700] mb-1">
                {lang === "fi" ? "Eksklusiivinen tarjous" : "Exclusive offer"}
              </p>
              <p className="font-display font-bold text-sm leading-snug mb-3">{casino.welcome_bonus_text}</p>
              <a
                href={`/${lang}/mene/${casino.mene_slug}`}
                rel="nofollow sponsored noopener noreferrer"
                target="_blank"
                className="block bg-[#FFD700] text-[#1b1b1c] font-bold text-sm text-center py-3.5 rounded-xl hover:bg-[#FFE866] active:scale-95 transition-all"
              >
                {lang === "fi" ? "Pelaa Nyt" : "Play Now"}
                <span className="material-symbols-outlined text-[16px] ml-1 align-middle" aria-hidden="true">arrow_forward</span>
              </a>
              <p className="text-[9px] text-white/50 text-center mt-2">
                {lang === "fi" ? "18+ | Pelaa vastuullisesti" : "18+ | Gamble responsibly"}
              </p>
            </div>
          </div>

          {/* Desktop hero: multi-column */}
          <div className="hidden md:flex items-start gap-8">
            <div className="flex flex-col items-center gap-2 w-32 flex-shrink-0">
              <div className="w-28 h-28 bg-[#F0EDEE] rounded-2xl flex items-center justify-center p-3 overflow-hidden">
                {casino.logo_url ? (
                  <Image src={casino.logo_url} alt={`${casino.name} logo`} width={112} height={112} className="w-full h-full object-contain" priority />
                ) : (
                  <span className="material-symbols-outlined text-[#2D1783] text-4xl" aria-hidden="true">casino</span>
                )}
              </div>
              <span className="text-xs font-semibold text-[#787585] text-center">
                {lang === "fi" ? "Perustettu" : "Est."} {casino.established_year ?? "—"}
              </span>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display font-bold text-3xl md:text-4xl text-[#1b1b1c]">{casino.name}</h1>
                {casino.is_verified && (
                  <span className="flex items-center gap-1 bg-[#27AE60]/10 text-[#27AE60] text-xs font-bold px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">verified</span>
                    {lang === "fi" ? "Vahvistettu" : "Verified"}
                  </span>
                )}
                {casino.is_pikakasino && (
                  <span className="flex items-center gap-1 bg-[#2D1783]/10 text-[#2D1783] text-xs font-bold px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">bolt</span>
                    {lang === "fi" ? "Pikakasino" : "Quick Casino"}
                  </span>
                )}
                {(casino.available_in ?? []).includes("FI") && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#27AE60]/10 text-[#27AE60]">
                    ✅ {lang === "fi" ? "Saatavilla Suomessa" : "Available in Finland"}
                  </span>
                )}
                {(casino.restricted_in ?? []).includes("FI") && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E74C3C]/10 text-[#E74C3C]">
                    ❌ {lang === "fi" ? "Ei saatavilla Suomessa" : "Not available in Finland"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-5 items-center">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`material-symbols-outlined text-[20px] ${i < stars ? "text-[#FFD700]" : "text-[#E5E8F0]"}`} style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                    ))}
                  </div>
                  <span className="font-bold text-[#2D1783] text-lg">{casino.rating.toFixed(1)}/10</span>
                </div>
                <TrustScore score={casino.trust_score} />
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: "security", label: casino.license_authority ?? "—" },
                  { icon: "payments", label: casino.min_deposit ? `Min. ${casino.min_deposit}€` : "—" },
                  { icon: "speed", label: isInstant ? (lang === "fi" ? "Välitön kotiutus" : "Instant withdrawal") : casino.withdrawal_time_max_hours ? `${casino.withdrawal_time_max_hours}h` : "—" },
                  { icon: "casino", label: `${casino.total_games_count?.toLocaleString() ?? "—"} ${lang === "fi" ? "peliä" : "games"}` },
                ].map((fact) => (
                  <div key={fact.icon} className="flex items-center gap-2 bg-[#F8F9FD] border border-[#E5E8F0] px-3 py-2 rounded-xl text-sm">
                    <span className="material-symbols-outlined text-[#2D1783] text-[16px]" aria-hidden="true">{fact.icon}</span>
                    <span className="font-semibold text-[#474554]">{fact.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-56 flex-shrink-0">
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
                  <span className="material-symbols-outlined text-[16px] ml-1 align-middle" aria-hidden="true">arrow_forward</span>
                </a>
                <p className="text-[10px] text-white/60 text-center">{lang === "fi" ? "18+ | Pelaa vastuullisesti" : "18+ | Gamble responsibly"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      {/* On mobile add bottom padding so sticky CTA bar doesn't obscure content */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-6 md:py-10 pb-24 md:pb-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left content */}
          <div className="flex-1 min-w-0 space-y-4 md:space-y-6">

            {/* Pros & Cons */}
            {(pros?.length || cons?.length) ? (
              <section className="bg-white rounded-2xl border border-[#E5E8F0] p-5 md:p-6">
                <h2 className="font-display font-bold text-lg md:text-xl text-[#1b1b1c] mb-4">
                  {lang === "fi" ? "Hyvät & Huonot puolet" : "Pros & Cons"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {pros && pros.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#27AE60] mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">thumb_up</span>
                        {lang === "fi" ? "Hyvää" : "Pros"}
                      </p>
                      <ul className="space-y-2">
                        {pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#474554]">
                            <span className="material-symbols-outlined text-[#27AE60] text-[16px] flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">check_circle</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cons && cons.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#E74C3C] mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">thumb_down</span>
                        {lang === "fi" ? "Huonoa" : "Cons"}
                      </p>
                      <ul className="space-y-2">
                        {cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#474554]">
                            <span className="material-symbols-outlined text-[#E74C3C] text-[16px] flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">cancel</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            {/* Bonus details */}
            <section className="bg-white rounded-2xl border border-[#E5E8F0] p-5 md:p-6">
              <h2 className="font-display font-bold text-lg md:text-xl text-[#1b1b1c] mb-4">
                {lang === "fi" ? "Bonustiedot" : "Bonus Details"}
              </h2>
              <div className="bg-[#F8F9FD] rounded-xl p-4 border border-[#E5E8F0] mb-4">
                <p className="font-display font-bold text-[#2D1783] text-base mb-3">{casino.welcome_bonus_text}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { label: lang === "fi" ? "Minimitalletus" : "Min Deposit", value: d(casino.welcome_bonus_min_deposit, "€") },
                    { label: lang === "fi" ? "Kierrätys" : "Wagering", value: casino.welcome_bonus_wagering == null ? "—" : casino.welcome_bonus_wagering === 0 ? (lang === "fi" ? "Vapaa" : "None") : `${casino.welcome_bonus_wagering}x` },
                    { label: lang === "fi" ? "Max. Bonus" : "Max Bonus", value: d(casino.welcome_bonus_max_amount, "€") },
                    { label: lang === "fi" ? "Valuutta" : "Currency", value: casino.welcome_bonus_currency ?? "EUR" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide leading-none">{item.label}</p>
                      <p className="font-bold text-[#1b1b1c] text-sm mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {casino.no_deposit_bonus && (
                  <span className="flex items-center gap-1.5 bg-[#27AE60]/10 text-[#27AE60] text-xs font-bold px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[13px]" aria-hidden="true">money_off</span>
                    {lang === "fi" ? "Ei talletusta" : "No Deposit"}
                  </span>
                )}
                {casino.free_spins_amount && casino.free_spins_amount > 0 && (
                  <span className="flex items-center gap-1.5 bg-[#2D1783]/10 text-[#2D1783] text-xs font-bold px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[13px]" aria-hidden="true">rotate_right</span>
                    {casino.free_spins_amount} {lang === "fi" ? "Ilmaiskierrosta" : "Free Spins"}
                  </span>
                )}
                {casino.cashback_percent && casino.cashback_percent > 0 && (
                  <span className="flex items-center gap-1.5 bg-[#FFD700]/20 text-[#775900] text-xs font-bold px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[13px]" aria-hidden="true">percent</span>
                    {casino.cashback_percent}% Cashback
                  </span>
                )}
              </div>
            </section>

            {/* Casino info table */}
            <section className="bg-white rounded-2xl border border-[#E5E8F0] p-5 md:p-6">
              <h2 className="font-display font-bold text-lg md:text-xl text-[#1b1b1c] mb-4">
                {lang === "fi" ? "Kasinon Tiedot" : "Casino Info"}
              </h2>
              <div className="divide-y divide-[#E5E8F0]">
                {/* License row with quality badge */}
                {casino.license_authority && (() => {
                  const badge = getLicenseBadge(casino.license_authority)
                  return (
                    <div className="flex justify-between items-center py-2.5 text-sm gap-4">
                      <span className="text-[#787585] font-medium flex-shrink-0">{lang === "fi" ? "Lisenssi" : "License"}</span>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="font-semibold text-[#1b1b1c]">{casino.license_authority}</span>
                        {badge && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${badge.dot}18`, color: badge.dot }}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: badge.dot }} />
                            {badge.label}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })()}
                {[
                  { label: lang === "fi" ? "Lisenssijärjestö" : "License number", value: casino.license_number || undefined },
                  { label: lang === "fi" ? "Perustettu" : "Established", value: casino.established_year?.toString() },
                  { label: lang === "fi" ? "Min. talletus" : "Min deposit", value: casino.min_deposit ? `${casino.min_deposit}€` : undefined },
                  { label: lang === "fi" ? "Max. nosto/pv" : "Max withdrawal/day", value: casino.max_withdrawal_per_day ? `${casino.max_withdrawal_per_day}€` : undefined },
                  { label: lang === "fi" ? "Kotiutusaika" : "Withdrawal time", value: isInstant ? (lang === "fi" ? "Välitön" : "Instant") : (casino.withdrawal_time_max_hours != null ? `${casino.withdrawal_time_min_hours ?? 0}–${casino.withdrawal_time_max_hours}h` : undefined) },
                  { label: lang === "fi" ? "Pelejä yhteensä" : "Total games", value: casino.total_games_count ? casino.total_games_count.toLocaleString() : undefined },
                  { label: lang === "fi" ? "Live kasino" : "Live casino", value: casino.live_casino ? (lang === "fi" ? "Kyllä" : "Yes") : undefined },
                  { label: lang === "fi" ? "Mobiili" : "Mobile", value: casino.mobile_optimized ? (lang === "fi" ? "Optimoitu" : "Optimized") : undefined },
                  { label: lang === "fi" ? "Live chat" : "Live chat", value: casino.live_chat_support ? (lang === "fi" ? "Kyllä" : "Yes") : undefined },
                  (casino.available_in ?? []).length > 0 ? { label: lang === "fi" ? "Saatavilla" : "Available in", value: `${casino.available_in!.length} ${lang === "fi" ? "maassa" : "countries"}` } : null,
                  (casino.languages_supported ?? []).length > 0 ? { label: lang === "fi" ? "Tuetut kielet" : "Supported languages", value: `${casino.languages_supported!.length} ${lang === "fi" ? "kieltä" : "languages"}` } : null,
                ].filter((r): r is { label: string; value: string } => !!r && !!r.value).map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2.5 text-sm gap-4">
                    <span className="text-[#787585] font-medium flex-shrink-0">{row.label}</span>
                    <span className="font-semibold text-[#1b1b1c] text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Languages & Countries */}
            {((casino.available_in ?? []).length > 0 || (casino.languages_supported ?? []).length > 0 || (casino.restricted_in ?? []).length > 0) && (
              <section className="bg-white rounded-2xl border border-[#E5E8F0] p-5 md:p-6 space-y-5">
                <h2 className="font-display font-bold text-lg md:text-xl text-[#1b1b1c]">
                  {lang === "fi" ? "Saatavuus & Kielet" : "Availability & Languages"}
                </h2>

                {/* Finnish availability — prominent badge */}
                {((casino.available_in ?? []).includes("FI") || (casino.restricted_in ?? []).includes("FI")) && (
                  <div>
                    {(casino.available_in ?? []).includes("FI") ? (
                      <div className="flex items-center gap-3 bg-[#27AE60]/8 border border-[#27AE60]/25 rounded-xl px-4 py-3">
                        <span className="text-xl">✅</span>
                        <div>
                          <p className="font-bold text-[#27AE60] text-sm">{lang === "fi" ? "Saatavilla Suomessa" : "Available in Finland"}</p>
                          <p className="text-xs text-[#787585] mt-0.5">{lang === "fi" ? "Tämä kasino hyväksyy suomalaisia pelaajia" : "This casino accepts Finnish players"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-[#E74C3C]/8 border border-[#E74C3C]/25 rounded-xl px-4 py-3">
                        <span className="text-xl">❌</span>
                        <div>
                          <p className="font-bold text-[#E74C3C] text-sm">{lang === "fi" ? "Ei saatavilla Suomessa" : "Not available in Finland"}</p>
                          <p className="text-xs text-[#787585] mt-0.5">{lang === "fi" ? "Tämä kasino ei hyväksy suomalaisia pelaajia" : "This casino does not accept Finnish players"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Supported languages */}
                {(casino.languages_supported ?? []).length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-[#474554] mb-2">{lang === "fi" ? "Tuetut kielet" : "Supported Languages"}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(casino.languages_supported ?? []).map(code => {
                        const info = LANG_LABELS[code.toLowerCase()]
                        return info ? (
                          <span key={code} className="flex items-center gap-1 bg-[#F8F9FD] border border-[#E5E8F0] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#474554]">
                            <span>{info.flag}</span>
                            <span>{info.name}</span>
                          </span>
                        ) : (
                          <span key={code} className="bg-[#F8F9FD] border border-[#E5E8F0] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#474554]">{code.toUpperCase()}</span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Available in countries */}
                {(casino.available_in ?? []).length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-[#474554] mb-2">
                      {lang === "fi" ? `Hyväksytyt maat (${casino.available_in!.length})` : `Accepted countries (${casino.available_in!.length})`}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(casino.available_in ?? []).map(code => (
                        <span key={code} className="bg-[#27AE60]/8 border border-[#27AE60]/20 text-[#1a6b3a] px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {COUNTRY_LABELS_FI[code] ?? code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Restricted countries */}
                {(casino.restricted_in ?? []).length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-[#474554] mb-2">
                      {lang === "fi" ? `Rajoitetut maat (${casino.restricted_in!.length})` : `Restricted countries (${casino.restricted_in!.length})`}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(casino.restricted_in ?? []).map(code => (
                        <span key={code} className="bg-[#E74C3C]/8 border border-[#E74C3C]/20 text-[#8b2f2f] px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {COUNTRY_LABELS_FI[code] ?? code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Payment methods */}
            <section className="bg-white rounded-2xl border border-[#E5E8F0] p-5 md:p-6">
              <h2 className="font-display font-bold text-lg md:text-xl text-[#1b1b1c] mb-4">
                {lang === "fi" ? "Maksutavat" : "Payment Methods"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(casino.payment_methods ?? []).map((pm) => (
                  <span key={pm} className="bg-[#F8F9FD] border border-[#E5E8F0] px-3 py-1.5 rounded-xl text-sm font-semibold text-[#474554] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#2D1783] text-[13px]" aria-hidden="true">payments</span>
                    {pm}
                  </span>
                ))}
              </div>
            </section>

            {/* Game providers */}
            <section className="bg-white rounded-2xl border border-[#E5E8F0] p-5 md:p-6">
              <h2 className="font-display font-bold text-lg md:text-xl text-[#1b1b1c] mb-4">
                {lang === "fi" ? "Peliohjelmistot" : "Game Providers"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(casino.game_providers ?? []).map((gp) => (
                  <span key={gp} className="bg-[#F8F9FD] border border-[#E5E8F0] px-3 py-1.5 rounded-xl text-sm font-semibold text-[#474554]">
                    {gp}
                  </span>
                ))}
              </div>
            </section>

            {/* Review text */}
            {review && (
              <section className="bg-white rounded-2xl border border-[#E5E8F0] p-5 md:p-6">
                <h2 className="font-display font-bold text-lg md:text-xl text-[#1b1b1c] mb-4">
                  {lang === "fi" ? `${casino.name} Arvostelu` : `${casino.name} Review`}
                </h2>
                <div
                  className="prose prose-sm max-w-none text-[#474554] leading-relaxed [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-[#1b1b1c] [&_h3]:font-bold [&_h3]:text-[#1b1b1c] [&_a]:text-[#2D1783] [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: cleanWpHtml(review) }}
                />
              </section>
            )}

            {/* FAQ */}
            {faqs && faqs.length > 0 && (
              <section className="bg-white rounded-2xl border border-[#E5E8F0] p-5 md:p-6">
                <h2 className="font-display font-bold text-lg md:text-xl text-[#1b1b1c] mb-4">
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
                <div className="space-y-2">
                  {faqs.map((faq, i) => (
                    <details key={i} className="group border border-[#E5E8F0] rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-semibold text-[#1b1b1c] list-none hover:bg-[#F8F9FD] transition-colors gap-3">
                        <span className="flex-1">{faq.q}</span>
                        <span className="material-symbols-outlined text-[#787585] group-open:rotate-180 transition-transform text-[18px] flex-shrink-0" aria-hidden="true">
                          expand_more
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-[#787585] leading-relaxed border-t border-[#E5E8F0]">
                        <div className="pt-3">{faq.a}</div>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Desktop right sidebar ── */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0 space-y-5">
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
                  { icon: "speed", text: isInstant ? (lang === "fi" ? "Välitön kotiutus" : "Instant withdrawal") : casino.withdrawal_time_max_hours ? `Max ${casino.withdrawal_time_max_hours}h` : null },
                  { icon: "payments", text: casino.min_deposit ? `Min. ${casino.min_deposit}€` : null },
                ].filter(item => item.text).map((item) => (
                  <div key={item.icon} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FFD700] text-[14px]" aria-hidden="true">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/40 text-center mt-4">
                {lang === "fi" ? "18+ | Pelaa vastuullisesti" : "18+ | Gamble responsibly"}
              </p>
            </div>
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
                    <span className={`material-symbols-outlined text-[18px] ${feat.val ? "text-[#27AE60]" : "text-[#E5E8F0]"}`} style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
                      {feat.val ? "check_circle" : "cancel"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Similar casinos */}
        <div className="mt-10 md:mt-12">
          <h2 className="font-display font-bold text-xl md:text-2xl text-[#1b1b1c] mb-5">
            {lang === "fi" ? "Samankaltaiset kasinot" : "Similar Casinos"}
          </h2>
          <div className="flex flex-col gap-4">
            {similar.map((c) => (
              <CasinoCard key={c.id} casino={c} lang={lang} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom CTA bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#E5E8F0] px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide leading-none">{lang === "fi" ? "Paras bonus" : "Best bonus"}</p>
          <p className="text-xs font-bold text-[#2D1783] truncate mt-0.5">{casino.welcome_bonus_text}</p>
        </div>
        <a
          href={`/${lang}/mene/${casino.mene_slug}`}
          rel="nofollow sponsored noopener noreferrer"
          target="_blank"
          className="flex-shrink-0 bg-[#2D1783] text-white font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-[#3e2db2] active:scale-95 transition-all"
        >
          {lang === "fi" ? "Pelaa Nyt" : "Play Now"}
          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">arrow_forward</span>
        </a>
      </div>

    </div>
  )
}
