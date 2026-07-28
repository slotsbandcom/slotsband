"use client"

import { useState } from "react"
import Image from "next/image"

interface CasinoLogoProps {
  src?: string | null
  name: string
  /** Rendered px size — used for srcset selection and fallback letter scale. */
  size: number
  /**
   * Tailwind classes for the outer box.
   * Must include explicit dimensions (w-* h-*), bg-white, border, rounded, etc.
   */
  className?: string
  priority?: boolean
  unoptimized?: boolean
}

export function CasinoLogo({
  src,
  name,
  size,
  className = "",
  priority = false,
  unoptimized = false,
}: CasinoLogoProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState(false)

  const initial      = name?.charAt(0)?.toUpperCase() ?? "?"
  const showFallback = !src || error

  return (
    <div className={`relative overflow-hidden flex-shrink-0 ${className}`}>

      {/* Skeleton — visible while image is in-flight */}
      {!showFallback && !loaded && (
        <div className="absolute inset-0 bg-[#E5E8F0] animate-pulse" />
      )}

      {!showFallback && (
        <Image
          src={src!}
          alt={`${name} logo`}
          fill
          sizes={`${size * 2}px`}
          quality={75}
          priority={priority}
          unoptimized={unoptimized}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`transition-opacity duration-300 object-contain ${loaded ? "opacity-100" : "opacity-0"}`}
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
