"use client"

import Image from "next/image"
import { useState } from "react"

interface CasinoLogoProps {
  src?: string | null
  name: string
  size: number
  className?: string
  priority?: boolean
}

export function CasinoLogo({ src, name, size, className = "", priority = false }: CasinoLogoProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState(false)

  const initial     = name?.charAt(0)?.toUpperCase() ?? "?"
  const showFallback = !src || error

  return (
    <div className={`relative overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}>
      {/* Skeleton shimmer while image loads */}
      {!showFallback && !loaded && (
        <div className="absolute inset-0 bg-[#E5E8F0] animate-pulse" />
      )}

      {/* Logo image */}
      {!showFallback && (
        <Image
          src={src!}
          alt={`${name} logo`}
          width={size}
          height={size}
          className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
      )}

      {/* Letter avatar fallback */}
      {showFallback && (
        <div className="absolute inset-0 bg-[#2D1783] flex items-center justify-center">
          <span
            className="text-white font-bold select-none"
            style={{ fontSize: Math.round(size * 0.38) }}
          >
            {initial}
          </span>
        </div>
      )}
    </div>
  )
}
