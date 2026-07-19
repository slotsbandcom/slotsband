"use client"

import { SWRConfig } from "swr"
import type { ReactNode } from "react"

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("fetch failed")
    return r.json()
  })

/**
 * Single global SWR cache for the entire app.
 * Wrapping here ensures all useStreamStatus() calls across
 * every component share one cache + one in-flight request.
 */
export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        // Dedupe all requests with the same key within 60 seconds —
        // prevents multiple simultaneous fetches from N components mounting
        dedupingInterval: 60_000,
        revalidateOnFocus: false,
        errorRetryInterval: 120_000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
