"use client"

import Image from "next/image"
import { useState } from "react"

interface CasinoLogoProps {
  /** Public URL of the logo image. Null/undefined triggers the letter avatar. */
  src?: string | null
  /** Casino name — used for alt text and the fallback initial. */
  name: string
  /**
   * Largest dimension (px) the logo will appear at — used for the `sizes` hint
   * and for scaling the fallback letter. The container's VISUAL size comes from
   * the className you pass (e.g. "w-20 h-20").
   */
  size: number
  /**
   * Tailwind classes for the outer box.
   * Must include explicit dimensions (w-* h-*), background, border, etc.
   * Do NOT include padding — internal padding is handled via CSS on the image.
   */
  className?: string
  priority?: boolean
}

export function CasinoLogo({
  src,
  name,
  size,
  className = "",
  priority = false,
}: CasinoLogoProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState(false)

  const initial      = name?.charAt(0)?.toUpperCase() ?? "?"
  const showFallback = !src || error

  return (
    // `relative` is required by Next.js Image `fill` mode.
    // `overflow-hidden` clips the skeleton/fallback to the container's border-radius.
    <div className={`relative overflow-hidden flex-shrink-0 ${className}`}>

      {/* Pulse skeleton — shown while the image is in-flight */}
      {!showFallback && !loaded && (
        <div className="absolute inset-0 bg-[#E5E8F0] animate-pulse" />
      )}

      {/* Logo image — `fill` stretches to the container; `p-[8%]` creates
          proportional visual breathing-room without touching the skeleton/fallback. */}
      {!showFallback && (
        <Image
          src={src!}
          alt={`${name} logo`}
          fill
          className={`object-contain p-[8%] transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          sizes={`${size}px`}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          unoptimized
        />
      )}

      {/* Letter-avatar fallback */}
      {showFallback && (
        <div className="absolute inset-0 bg-[#2D1783] flex items-center justify-center">
          <span
            className="text-white font-bold select-none leading-none"
            style={{ fontSize: Math.round(size * 0.4) }}
          >
            {initial}
          </span>
        </div>
      )}
    </div>
  )
}
