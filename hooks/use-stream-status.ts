import useSWR from "swr"

export interface PlatformStatus {
  isLive: boolean
  viewers: number
  title: string
}

export interface StreamStatus {
  twitch: PlatformStatus
  youtube: PlatformStatus
  kick: PlatformStatus
}

const FALLBACK: StreamStatus = {
  twitch:  { isLive: false, viewers: 0, title: "" },
  youtube: { isLive: false, viewers: 0, title: "" },
  kick:    { isLive: false, viewers: 0, title: "" },
}

/**
 * Polls /api/stream-status every 60 seconds.
 * Falls back to all-OFFLINE on error — never shows fake LIVE.
 * Fetcher and deduping are provided by the global SWRConfig in swr-provider.tsx.
 */
export function useStreamStatus() {
  const { data, isLoading } = useSWR<StreamStatus>(
    "/api/stream-status",
    {
      refreshInterval: 60_000,
      fallbackData: FALLBACK,
    }
  )

  const anyLive = !!(data?.twitch.isLive || data?.youtube.isLive || data?.kick.isLive)

  return {
    status: data ?? FALLBACK,
    isLoading,
    anyLive,
  }
}
