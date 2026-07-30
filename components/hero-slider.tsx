"use client"

import { useState, useEffect, useCallback } from "react"
import type { Lang } from "@/lib/types"

export interface Banner {
  id: string
  title: string
  bonus_text: string | null
  subtext: string | null
  bg_color: string
  text_color: string
  btn_class: string
  image_url: string | null
  link_url: string | null
}

interface HeroSliderProps {
  lang: Lang
  banners: Banner[]
}

// btn_class comes from the DB at request time, so Tailwind's build-time
// content scanner never sees arbitrary-value classes like "bg-[#26039d]" and
// drops them from the production CSS. Pull those out into inline styles and
// keep only plain, always-generated utilities (e.g. "text-white") as classes.
function parseBtnClass(btnClass: string): { className: string; style: React.CSSProperties } {
  const style: React.CSSProperties = {}
  const classes: string[] = []
  for (const token of btnClass.split(/\s+/).filter(Boolean)) {
    const bg = token.match(/^bg-\[(#[0-9a-fA-F]{3,8})\]$/)
    const text = token.match(/^text-\[(#[0-9a-fA-F]{3,8})\]$/)
    if (bg) style.backgroundColor = bg[1]
    else if (text) style.color = text[1]
    else classes.push(token)
  }
  return { className: classes.join(" "), style }
}

export function HeroSlider({ lang, banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (banners.length < 2) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [next, banners.length])

  if (banners.length === 0) return null

  return (
    <div className="relative w-full h-[168px] md:aspect-[2.6/1] md:h-auto rounded-2xl overflow-hidden shadow-xl border border-[#E5E8F0]">
      {/* Slides */}
      <div
        className="slider-wrapper h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
        aria-live="polite"
      >
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className="slide flex items-center justify-center"
            style={b.image_url ? undefined : { backgroundColor: b.bg_color }}
            aria-hidden={idx !== current}
            {...(idx !== current ? { inert: true } : {})}
          >
            {b.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
            ) : (
              <>
                {/* Mobile layout: stacked centered */}
                <div className="md:hidden w-full px-4 flex flex-col items-center text-center gap-1.5">
                  <p className="font-display font-bold text-[11px] uppercase tracking-widest" style={{ color: b.text_color }}>
                    {b.title}
                  </p>
                  {b.bonus_text && (
                    <p className="font-display font-bold text-base leading-tight" style={{ color: b.text_color }}>
                      {b.bonus_text}
                    </p>
                  )}
                  {b.subtext && (
                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={{ color: b.text_color }}>
                      {b.subtext}
                    </p>
                  )}
                  <a
                    href={b.link_url ?? `/${lang}`}
                    rel="nofollow sponsored noopener noreferrer"
                    target="_blank"
                    {...(() => {
                      const { className, style } = parseBtnClass(b.btn_class)
                      return { className: `${className} mt-1 px-6 py-2 rounded-full font-bold text-xs hover:opacity-90 active:scale-95 transition-all`, style }
                    })()}
                  >
                    {lang === "fi" ? "Pelaa Nyt" : "Play Now"}
                  </a>
                </div>

                {/* Desktop layout: centered vertical stack */}
                <div className="hidden md:flex px-14 flex-col items-center text-center space-y-3">
                  <p className="font-display font-bold text-2xl tracking-tight" style={{ color: b.text_color }}>
                    {b.title}
                  </p>
                  <div className="space-y-1">
                    {b.bonus_text && (
                      <p className="font-display font-bold text-2xl" style={{ color: b.text_color }}>
                        {b.bonus_text}
                      </p>
                    )}
                    {b.subtext && (
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70" style={{ color: b.text_color }}>
                        {b.subtext}
                      </p>
                    )}
                  </div>
                  <a
                    href={b.link_url ?? `/${lang}`}
                    rel="nofollow sponsored noopener noreferrer"
                    target="_blank"
                    {...(() => {
                      const { className, style } = parseBtnClass(b.btn_class)
                      return { className: `${className} px-8 py-3 rounded-full font-semibold text-sm hover:opacity-90 hover:shadow-xl transition-all active:scale-95`, style }
                    })()}
                  >
                    {lang === "fi" ? "Pelaa Nyt" : "Play Now"}
                  </a>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          {/* Dots */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`slider-dot ${idx === current ? "active" : ""}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev/Next arrows */}
          <button
            onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow"
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined text-[#2D1783] text-[16px] md:text-[18px]">chevron_left</span>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow"
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined text-[#2D1783] text-[16px] md:text-[18px]">chevron_right</span>
          </button>
        </>
      )}
    </div>
  )
}
