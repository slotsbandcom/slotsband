import Link from "next/link"
import Image from "next/image"
import type { Casino, Lang } from "@/lib/types"
import { TRANSLATIONS } from "@/lib/data"

interface CasinoCardProps {
  casino: Casino
  lang: Lang
  rank?: number
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round((rating / 10) * 5)
  return (
    <div className="flex items-center gap-0.5" aria-label={`Arvosana ${rating} / 10`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[14px] ${i < filled ? "star-filled" : "star-empty"}`}
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

function WithdrawalBadge({ hours }: { hours?: number }) {
  if (hours === undefined) return <span className="text-sm font-bold">—</span>
  if (hours === 0) return <span className="text-xs font-bold text-[#27AE60]">Välitön</span>
  if (hours <= 1) return <span className="text-xs font-bold text-[#27AE60]">1–15 min</span>
  if (hours <= 6) return <span className="text-xs font-bold text-[#27AE60]">Nopea</span>
  if (hours <= 24) return <span className="text-xs font-bold text-[#27AE60]">0–24h</span>
  return <span className="text-xs font-bold">{hours}h</span>
}

const BADGE_STYLES: Record<string, string> = {
  gold: "bg-[#FFD700] text-[#1b1b1c]",
  yellow: "bg-[#FFF4B0] text-[#775900]",
  gray: "bg-[#eae7e8] text-[#474554]",
}

export function CasinoCard({ casino, lang, rank }: CasinoCardProps) {
  const t = TRANSLATIONS[lang].listing
  const badgeStyle = BADGE_STYLES[casino.badge_variant ?? "gray"]

  return (
    <article className="casino-card bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
      {/* Mobile layout */}
      <div className="md:hidden">
        {/* Top row: rank badge + logo + name + stars */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-[#E5E8F0]">
          {rank && (
            <span className="w-7 h-7 rounded-full bg-[#2D1783] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {rank}
            </span>
          )}
          <div className="w-14 h-14 bg-[#F0EDEE] rounded-xl flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0">
            {casino.logo_url ? (
              <Image
                src={casino.logo_url}
                alt={`${casino.name} logo`}
                width={56}
                height={56}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="material-symbols-outlined text-[#2D1783] text-2xl" aria-hidden="true">casino</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-[#1b1b1c] text-sm leading-tight truncate">{casino.name}</p>
            <StarRating rating={casino.rating} />
            {/* Badges inline */}
            <div className="flex flex-wrap gap-1 mt-1">
              {casino.badge && (
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${badgeStyle}`}>
                  {casino.badge}
                </span>
              )}
              {casino.is_pikakasino && (
                <span className="bg-[#eae7e8] text-[#474554] px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px]" aria-hidden="true">bolt</span>
                  Pika
                </span>
              )}
              {casino.is_new && (
                <span className="bg-[#eae7e8] text-[#474554] px-2 py-0.5 rounded text-[9px] font-bold uppercase">Uusi</span>
              )}
            </div>
          </div>
        </div>

        {/* Bonus headline */}
        <div className="px-4 py-3 bg-[#F8F9FD] border-b border-[#E5E8F0]">
          <h3 className="font-display font-bold text-[#2D1783] text-sm leading-snug line-clamp-2">
            {casino.welcome_bonus_text}
          </h3>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 divide-x divide-[#E5E8F0] border-b border-[#E5E8F0]">
          <div className="px-3 py-2.5 flex flex-col gap-0.5">
            <p className="text-[9px] font-bold text-[#787585] uppercase tracking-wide leading-none">{t.minDeposit}</p>
            <p className="text-xs font-bold text-[#1b1b1c] mt-0.5">{casino.min_deposit}€</p>
          </div>
          <div className="px-3 py-2.5 flex flex-col gap-0.5">
            <p className="text-[9px] font-bold text-[#787585] uppercase tracking-wide leading-none">{t.withdrawalSpeed}</p>
            <WithdrawalBadge hours={casino.withdrawal_time_max_hours} />
          </div>
          <div className="px-3 py-2.5 flex flex-col gap-0.5">
            <p className="text-[9px] font-bold text-[#787585] uppercase tracking-wide leading-none">{t.license}</p>
            <p className="text-[11px] font-bold text-[#1b1b1c] mt-0.5 leading-tight">{casino.license_authority}</p>
          </div>
          <div className="px-3 py-2.5 flex flex-col gap-0.5">
            <p className="text-[9px] font-bold text-[#787585] uppercase tracking-wide leading-none">{t.bonusType}</p>
            <p className="text-[11px] font-bold text-[#1b1b1c] mt-0.5 leading-tight">
              {casino.welcome_bonus_wagering === 0 ? "Vapaa" : `${casino.welcome_bonus_wagering}x`}
            </p>
          </div>
        </div>

        {/* CTA row */}
        <div className="flex gap-2 px-4 py-3">
          <a
            href={`/${lang}/mene/${casino.mene_slug}`}
            rel="nofollow sponsored noopener noreferrer"
            target="_blank"
            className="flex-1 bg-[#2D1783] text-white font-bold text-sm py-3 rounded-xl text-center flex items-center justify-center gap-1.5 hover:bg-[#3e2db2] active:scale-95 transition-all"
          >
            {t.playNow}
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
          </a>
          <Link
            href={`/${lang}/nettikasinot/${casino.slug}`}
            className="px-4 py-3 rounded-xl border border-[#E5E8F0] text-[#474554] font-semibold text-sm hover:text-[#2D1783] hover:border-[#2D1783] transition-all text-center whitespace-nowrap"
          >
            {t.readReview}
          </Link>
        </div>
        <p className="text-[9px] text-[#787585] text-center pb-2.5">
          {lang === "fi" ? "18+ | Pelaa vastuullisesti" : "18+ | Gamble responsibly"}
        </p>
      </div>

      {/* Desktop layout (md+) */}
      <div className="hidden md:flex items-stretch">
        {/* Left accent bar */}
        <div className="w-1.5 bg-[#FFD700] flex-shrink-0 rounded-l-2xl" />

        <div className="flex items-center gap-6 p-6 lg:p-8 flex-1">
          {/* Rank + Logo */}
          <div className="w-40 flex-shrink-0 flex flex-col items-center gap-3">
            {rank && (
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-full bg-[#2D1783] text-white flex items-center justify-center text-xs font-bold">
                  {rank}
                </span>
                <StarRating rating={casino.rating} />
              </div>
            )}
            <div className="w-24 h-24 bg-[#F0EDEE] rounded-2xl flex items-center justify-center p-3 overflow-hidden">
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
                <span className="material-symbols-outlined text-[#2D1783] text-4xl" aria-hidden="true">casino</span>
              )}
            </div>
            <span className="font-display font-bold text-[#1b1b1c] text-center text-sm leading-tight">
              {casino.name}
            </span>
          </div>

          {/* Main info */}
          <div className="flex-1 space-y-3">
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
            <h3 className="font-display font-bold text-[#2D1783] text-lg leading-tight">
              {casino.welcome_bonus_text}
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide">{t.minDeposit}</p>
                <p className="text-sm font-bold text-[#1b1b1c] mt-0.5">{casino.min_deposit}€</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide">{t.withdrawalSpeed}</p>
                <WithdrawalBadge hours={casino.withdrawal_time_max_hours} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide">{t.license}</p>
                <p className="text-sm font-bold text-[#1b1b1c] mt-0.5">{casino.license_authority}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wide">{t.bonusType}</p>
                <p className="text-sm font-bold text-[#1b1b1c] mt-0.5">
                  {casino.welcome_bonus_wagering === 0 ? "Kierrätysvapaa" : `${casino.welcome_bonus_wagering}x`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {casino.payment_methods.slice(0, 5).map((pm) => (
                <span key={pm} className="bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded text-[10px] font-semibold text-[#474554]">
                  {pm}
                </span>
              ))}
              {casino.payment_methods.length > 5 && (
                <span className="bg-[#F8F9FD] border border-[#E5E8F0] px-2 py-0.5 rounded text-[10px] font-semibold text-[#787585]">
                  +{casino.payment_methods.length - 5}
                </span>
              )}
            </div>
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
