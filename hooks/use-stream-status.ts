"use client"

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

const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error("fetch failed")
    return r.json()
  })

/**
 * Polls /api/stream-status every 60 seconds.
 * Falls back to all-OFFLINE on error — never shows fake LIVE.
 * On error retries after 120 seconds.
 */
export function useStreamStatus() {
  const { data, isLoading } = useSWR<StreamStatus>(
    "/api/stream-status",
    fetcher,
    {
      refreshInterval: 60_000,
      errorRetryInterval: 120_000,
      fallbackData: FALLBACK,
      revalidateOnFocus: false,
    }
  )

  const anyLive = !!(data?.twitch.isLive || data?.youtube.isLive || data?.kick.isLive)

  return {
    status: data ?? FALLBACK,
    isLoading,
    anyLive,
  }
}
