"use client"

import { useState, useEffect, useCallback } from "react"
import { HERO_SLIDES } from "@/lib/data"
import type { Lang } from "@/lib/types"

interface HeroSliderProps {
  lang: Lang
}

export function HeroSlider({ lang }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [next])

  return (
    <div className="relative w-full h-[168px] md:aspect-[2.6/1] md:h-auto rounded-2xl overflow-hidden shadow-xl border border-[#E5E8F0]">
      {/* Slides */}
      <div
        className="slider-wrapper h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
        aria-live="polite"
      >
        {HERO_SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`slide ${s.bgColor} flex items-center justify-center`}
            aria-hidden={idx !== current}
          >
            {/* Mobile layout: stacked centered */}
            <div className="md:hidden w-full px-4 flex flex-col items-center text-center gap-1.5">
              <p className={`font-display font-bold text-[11px] uppercase tracking-widest ${s.accentColor ?? s.textColor}`}>
                {s.casinoName}
              </p>
              <p className={`font-display font-bold text-base leading-tight ${s.bonusColor}`}>
                {s.bonus}
              </p>
              <p className={`text-[9px] font-bold uppercase tracking-wider opacity-60 ${s.textColor}`}>
                {s.subtext}
              </p>
              <a
                href={`/${lang}/mene/${s.slug}`}
                rel="nofollow sponsored noopener noreferrer"
                target="_blank"
                className={`${s.btnClass} mt-1 px-6 py-2 rounded-full font-bold text-xs hover:opacity-90 active:scale-95 transition-all`}
              >
                {lang === "fi" ? "Pelaa Nyt" : "Play Now"}
              </a>
            </div>

            {/* Desktop layout: centered vertical stack */}
            <div className="hidden md:flex px-14 flex-col items-center text-center space-y-3">
              <h4 className={`font-display font-bold text-2xl tracking-tight ${s.accentColor ?? s.textColor}`}>
                {s.casinoName}
              </h4>
              <div className="space-y-1">
                <p className={`font-display font-bold text-2xl ${s.bonusColor}`}>
                  {s.bonus}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-widest opacity-70 ${s.textColor}`}>
                  {s.subtext}
                </p>
              </div>
              <a
                href={`/${lang}/mene/${s.slug}`}
                rel="nofollow sponsored noopener noreferrer"
                target="_blank"
                className={`${s.btnClass} px-8 py-3 rounded-full font-semibold text-sm hover:opacity-90 hover:shadow-xl transition-all active:scale-95`}
              >
                {lang === "fi" ? "Pelaa Nyt" : "Play Now"}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {HERO_SLIDES.map((_, idx) => (
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
        onClick={() => setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
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
    </div>
  )
}
