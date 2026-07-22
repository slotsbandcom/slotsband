import useSWR from "swr"

export interface PlatformStatus {
  isLive: boolean
  viewers: number
  title: string
}

export interface StreamStatus {
  kick:    PlatformStatus
  twitch:  PlatformStatus
  youtube: PlatformStatus
}

const FALLBACK: StreamStatus = {
  kick:    { isLive: false, viewers: 0, title: "" },
  twitch:  { isLive: false, viewers: 0, title: "" },
  youtube: { isLive: false, viewers: 0, title: "" },
}

/**
 * Polls /api/stream-status every 60 seconds.
 * Falls back to all-OFFLINE on error — never shows fake LIVE.
 */
export function useStreamStatus() {
  const { data, isLoading } = useSWR<StreamStatus>(
    "/api/stream-status",
    {
      refreshInterval: 60_000,
      fallbackData: FALLBACK,
    }
  )

  const s = data ?? FALLBACK
  const anyLive = !!(s.kick.isLive || s.twitch.isLive || s.youtube.isLive)

  return { status: s, isLoading, anyLive }
}
