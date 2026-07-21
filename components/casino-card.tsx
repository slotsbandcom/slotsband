import Link from "next/link"
import Image from "next/image"
import type { Casino, Lang } from "@/lib/types"
import { TRANSLATIONS } from "@/lib/data"

interface CasinoCardProps {
  casino: Casino
  lang: Lang
  rank?: number
}

/** Strip HTML tags and collapse whitespace */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

/** Pick the best bonus text to display */
function getBonusText(casino: Casino): string {
  const raw = casino.bonus_text || casino.welcome_bonus_text || ""
  return raw ? stripHtml(raw) : ""
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round((rating / 10) * 5)
  return (
    <div className="flex items-center gap-0.5" aria-label={`Arvosana ${rating} / 10`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[14px] ${i < filled ? "text-[#FFD700]" : "text-[#E5E8F0]"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          star
        </span>
      ))}
      <span className="text-[11px] font-bold text-[#2D1783] ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

function WithdrawalBadge({ hours }: { hours?: number | null }) {
  if (hours === undefined || hours === null) return <span className="text-sm font-bold text-[#787585]">—</span>
  if (hours === 0) return <span className="text-xs font-bold text-[#27AE60]">Välitön</span>
  if (hours <= 1) return <span className="text-xs font-bold text-[#27AE60]">alle 1h</span>
  if (hours <= 6) return <span className="text-xs font-bold text-[#27AE60]">Nopea</span>
  if (hours <= 24) return <span className="text-xs font-bold text-[#27AE60]">0–{hours}h</span>
  return <span className="text-xs font-bold">{hours}h</span>
}

function WageringDisplay({ wagering }: { wagering?: number | null }) {
  if (wagering === undefined || wagering === null) return <span className="text-sm font-bold text-[#787585]">—</span>
  if (wagering === 0) return <span className="text-sm font-bold text-[#27AE60]">Kierrätysvapaa</span>
  return <span className="text-sm font-bold text-[#1b1b1c]">{wagering}x</span>
}

function MinDepositDisplay({ amount }: { amount?: number | null }) {
  if (!amount) return <span className="text-sm font-bold text-[#787585]">—</span>
  return <span className="text-sm font-bold text-[#1b1b1c]">{amount}€</span>
}

function CasinoLogo({ casino, size }: { casino: Casino; size: "sm" | "lg" }) {
  const initial = casino.name?.charAt(0)?.toUpperCase() ?? "?"
  const dim = size === "sm" ? "w-16 h-16" : "w-24 h-24"
  const textSize = size === "sm" ? "text-2xl" : "text-3xl"
  const imgSize = size === "sm" ? 64 : 96

  return (
    <div className={`${dim} bg-[#F0EDEE] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {casino.logo_url ? (
        <Image
          src={casino.logo_url}
          alt={`${casino.name} logo`}
          width={imgSize}
          height={imgSize}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      ) : (
        <div className={`w-full h-full bg-[#2D1783] rounded-xl flex items-center justify-center`}>
          <span className={`text-white font-display font-bold ${textSize}`}>{initial}</span>
        </div>
      )}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const colors =
    rank === 1 ? "bg-[#FFD700] text-[#1b1b1c]" :
    rank === 2 ? "bg-[#C0C0C0] text-[#1b1b1c]" :
    rank === 3 ? "bg-[#CD7F32] text-white" :
    "bg-[#2D1783] text-white"

  return (
    <div className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${colors}`}>
      {rank}
    </div>
  )
}

const BADGE_STYLES: Record<string, string> = {
  gold: "bg-[#FFD700] text-[#1b1b1c]",
  yellow: "bg-[#FFF4B0] text-[#775900]",
  gray: "bg-[#eae7e8] text-[#474554]",
}

export function CasinoCard({ casino, lang, rank }: CasinoCardProps) {
  const t = TRANSLATIONS[lang].listing
  const badgeStyle = BADGE_STYLES[casino.badge_variant ?? "gray"]
  const bonusText = getBonusText(casino)
  const paymentMethods = casino.payment_methods ?? []

  return (
    <article className="casino-card bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden relative">
      {rank !== undefined && <RankBadge rank={rank} />}

      {/* ── Mobile layout ── */}
      <div className="md:hidden">

        {/* Row 1: logo + name / rating / badges */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <CasinoLogo casino={casino} size="sm" />

          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-display font-bold text-[#1b1b1c] text-base leading-tight">{casino.name}</p>
            <StarRating rating={casino.rating} />
            <div className="flex flex-wrap gap-1">
              {casino.badge && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badgeStyle}`}>
                  {casino.badge}
                </span>
              )}
              {casino.is_pikakasino && (
                <span className="bg-[#eae7e8] text-[#474554] px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[11px]" aria-hidden="true">bolt</span>
                  Pika
                </span>
              )}
              {casino.is_new && (
                <span className="bg-[#eae7e8] text-[#474554] px-2 py-0.5 rounded text-[10px] font-bold uppercase">Uusi</span>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Bonus headline */}
        {bonusText && (
          <div className="mx-4 mb-3 px-3 py-2.5 bg-[#F0EDFF] rounded-xl border border-[#D6CEFF]">
            <h3 className="font-display font-bold text-[#2D1783] text-sm leading-snug line-clamp-2">
              {bonusText}
            </h3>
          </div>
        )}

        {/* Row 3: Stats grid */}
        <div className="grid grid-cols-2 gap-px bg-[#E5E8F0] border-t border-b border-[#E5E8F0] mx-0">
          <div className="bg-white px-4 py-2.5">
            <p className="text-[10px] font-semibold text-[#787585] uppercase tracking-wide">{t.minDeposit}</p>
            <div className="mt-0.5"><MinDepositDisplay amount={casino.min_deposit} /></div>
          </div>
          <div className="bg-white px-4 py-2.5">
            <p className="text-[10px] font-semibold text-[#787585] uppercase tracking-wide">{t.withdrawalSpeed}</p>
            <div className="mt-0.5"><WithdrawalBadge hours={casino.withdrawal_time_max_hours} /></div>
          </div>
          <div className="bg-white px-4 py-2.5">
            <p className="text-[10px] font-semibold text-[#787585] uppercase tracking-wide">{t.license}</p>
            <p className="text-sm font-bold text-[#1b1b1c] mt-0.5">{casino.license_authority ?? "—"}</p>
          </div>
          <div className="bg-white px-4 py-2.5">
            <p className="text-[10px] font-semibold text-[#787585] uppercase tracking-wide">{t.bonusType}</p>
            <div className="mt-0.5"><WageringDisplay wagering={casino.welcome_bonus_wagering} /></div>
          </div>
        </div>

        {/* Row 4: CTAs */}
        <div className="flex gap-2 px-4 py-3">
          <a
            href={`/${lang}/mene/${casino.mene_slug}`}
            rel="nofollow sponsored noopener noreferrer"
            target="_blank"
            className="flex-1 bg-[#2D1783] text-white font-bold text-sm py-3.5 rounded-xl text-center flex items-center justify-center gap-1.5 hover:bg-[#3e2db2] active:scale-95 transition-all"
          >
            {t.playNow}
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
          </a>
          <Link
            href={`/${lang}/nettikasinot/${casino.slug}`}
            className="px-4 py-3.5 rounded-xl border border-[#E5E8F0] text-[#474554] font-semibold text-sm hover:text-[#2D1783] hover:border-[#2D1783] transition-all text-center whitespace-nowrap"
          >
            {t.readReview}
          </Link>
        </div>

        <p className="text-[9px] text-[#787585] text-center pb-3">
          {lang === "fi" ? "18+ | Pelaa vastuullisesti" : "18+ | Gamble responsibly"}
        </p>
      </div>

      {/* ── Desktop layout (md+) ── */}
      <div className="hidden md:flex items-stretch">
        {/* Left accent bar */}
        <div className="w-1.5 bg-[#FFD700] flex-shrink-0 rounded-l-2xl" />

        <div className="flex items-center gap-6 p-6 lg:p-8 flex-1">
          {/* Logo + name */}
          <div className="w-32 flex-shrink-0 flex flex-col items-center gap-3">
            <div className="w-24 h-24 bg-[#F0EDEE] rounded-2xl flex items-center justify-center overflow-hidden">
              {casino.logo_url ? (
                <Image
                  src={casino.logo_url}
                  alt={`${casino.name} logo`}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-[#2D1783] rounded-2xl flex items-center justify-center">
                  <span className="text-white font-display font-bold text-3xl">
                    {casino.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </span>
                </div>
              )}
            </div>
            <span className="font-display font-bold text-[#1b1b1c] text-center text-sm leading-tight">
              {casino.name}
            </span>
          </div>

          {/* Main info */}
          <div className="flex-1 space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {casino.badge && (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${badgeStyle}`}>
                  {casino.badge}
                </span>
              )}
              {casino.is_pikakasino && (
                <span className="bg-[#eae7e8] text-[#474554] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]" aria-hidden="true">bolt</span>
                  Pikakasino
                </span>
              )}
              {casino.is_new && (
                <span className="bg-[#eae7e8] text-[#474554] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">Uusi</span>
              )}
            </div>

            {/* Bonus headline */}
            {bonusText && (
              <h3 className="font-display font-bold text-[#2D1783] text-lg leading-tight">
                {bonusText}
              </h3>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide">{t.minDeposit}</p>
                <div className="mt-0.5"><MinDepositDisplay amount={casino.min_deposit} /></div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide">{t.withdrawalSpeed}</p>
                <div className="mt-0.5"><WithdrawalBadge hours={casino.withdrawal_time_max_hours} /></div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide">{t.license}</p>
                <p className="text-sm font-bold text-[#1b1b1c] mt-0.5">{casino.license_authority ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide">{t.bonusType}</p>
                <div className="mt-0.5"><WageringDisplay wagering={casino.welcome_bonus_wagering} /></div>
              </div>
            </div>

            {/* Payment methods */}
            {paymentMethods.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {paymentMethods.slice(0, 5).map((pm) => (
                  <span key={pm} className="bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded text-[10px] font-semibold text-[#474554]">
                    {pm}
                  </span>
                ))}
                {paymentMethods.length > 5 && (
                  <span className="bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded text-[10px] font-semibold text-[#787585]">
                    +{paymentMethods.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="w-44 flex flex-col gap-2.5 flex-shrink-0">
            <a
              href={`/${lang}/mene/${casino.mene_slug}`}
              rel="nofollow sponsored noopener noreferrer"
              target="_blank"
              className="bg-[#2D1783] text-white font-semibold text-sm w-full py-3.5 rounded-xl hover:bg-[#3e2db2] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            >
              {t.playNow}
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
            </a>
            <Link
              href={`/${lang}/nettikasinot/${casino.slug}`}
              className="border border-[#E5E8F0] text-[#474554] font-semibold text-sm w-full py-3.5 rounded-xl hover:text-[#2D1783] hover:border-[#2D1783] transition-all text-center"
            >
              {t.readReview}
            </Link>
            <p className="text-[10px] text-[#787585] text-center leading-tight">
              {lang === "fi" ? "18+ | Pelaa vastuullisesti" : "18+ | Gamble responsibly"}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
