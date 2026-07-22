"use client"

import { useState, useEffect, useRef } from "react"

interface CasinoLogoProps {
  src?: string | null
  name: string
  /** Largest rendered px size — used only to scale the fallback letter. */
  size: number
  /**
   * Tailwind classes for the outer box.
   * Must include explicit dimensions (w-* h-*), bg-white, border, rounded, etc.
   * Do NOT add padding here — 8% inner padding is applied directly on the image.
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
  const [loaded, setLoaded]  = useState(false)
  const [error, setError]    = useState(false)
  const imgRef               = useRef<HTMLImageElement>(null)

  const initial      = name?.charAt(0)?.toUpperCase() ?? "?"
  const showFallback = !src || error

  // If the browser already has the image cached (common with priority images),
  // the `onLoad` event fires before React attaches the handler. Detect that here.
  useEffect(() => {
    if (imgRef.current?.complete && !error) {
      setLoaded(true)
    }
  }, [error])

  return (
    <div className={`relative overflow-hidden flex-shrink-0 ${className}`}>

      {/* Skeleton — visible while image is in-flight */}
      {!showFallback && !loaded && (
        <div className="absolute inset-0 bg-[#E5E8F0] animate-pulse" />
      )}

      {/* Logo — plain <img> so no framework adds surprise inline styles.
          padding: 8% creates visual breathing-room; box-sizing: border-box
          keeps the element flush with the container edges. */}
      {!showFallback && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src!}
          alt={`${name} logo`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading={priority ? "eager" : "lazy"}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
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
