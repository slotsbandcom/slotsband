"use client"

import { useStreamStatus } from "@/hooks/use-stream-status"
import type { PlatformStatus } from "@/hooks/use-stream-status"

type Size = "sm" | "md"

interface StreamStatusBadgeProps {
  /** Which platform to show, or "any" for the first live platform */
  platform?: "twitch" | "youtube" | "kick" | "any"
  size?: Size
  showViewers?: boolean
  className?: string
}

export function StreamStatusBadge({
  platform = "any",
  size = "sm",
  showViewers = false,
  className = "",
}: StreamStatusBadgeProps) {
  const { status, isLoading, anyLive } = useStreamStatus()

  // Pick the relevant platform status
  let ps: PlatformStatus
  if (platform === "any") {
    // Use the first live platform, or kick as fallback for display
    if (status.kick.isLive)          ps = status.kick
    else if (status.twitch.isLive)   ps = status.twitch
    else if (status.youtube.isLive)  ps = status.youtube
    else ps = status.kick
  } else {
    ps = status[platform]
  }

  const dotSize    = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
  const textSize   = size === "sm" ? "text-[10px]"  : "text-xs"
  const pingSize   = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"

  if (isLoading) {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`} aria-label="Tarkistetaan lähetystä">
        <span className={`${dotSize} rounded-full bg-white/30 animate-pulse`} />
        <span className={`${textSize} font-bold text-white/40 uppercase tracking-wider`}>...</span>
      </span>
    )
  }

  if (ps.isLive) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 ${className}`}
        aria-label={`LIVE${ps.viewers ? ` — ${ps.viewers.toLocaleString()} katsojaa` : ""}`}
      >
        <span className="relative flex flex-shrink-0" style={{ width: size === "sm" ? 6 : 8, height: size === "sm" ? 6 : 8 }}>
          <span className={`animate-ping absolute inline-flex ${pingSize} rounded-full bg-red-400 opacity-75`} />
          <span className={`relative inline-flex ${dotSize} rounded-full bg-red-500`} />
        </span>
        <span className={`${textSize} font-bold text-red-400 uppercase tracking-wider`}>LIVE</span>
        {showViewers && ps.viewers > 0 && (
          <span className={`${textSize} text-white/50`}>{ps.viewers.toLocaleString()}</span>
        )}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} aria-label="OFFLINE">
      <span className={`${dotSize} rounded-full bg-white/25 flex-shrink-0`} />
      <span className={`${textSize} font-semibold text-white/40 uppercase tracking-wider`}>Offline</span>
    </span>
  )
}

/**
 * Compact dot-only indicator — used inside nav links
 */
export function StreamDot({ className = "" }: { className?: string }) {
  const { status } = useStreamStatus()
  const live = status.kick.isLive || status.twitch.isLive || status.youtube.isLive

  if (!live) return null

  return (
    <span className={`relative flex h-2 w-2 flex-shrink-0 ${className}`} aria-label="LIVE">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  )
}
