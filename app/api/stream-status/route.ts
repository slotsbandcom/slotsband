import { unstable_cache } from "next/cache"
import { getStreamOverrideRow, toStreamOverrideResponse } from "@/lib/supabase/stream-override"
import { NextResponse } from "next/server"

// The override check itself stays fully live (uncached DB read below) —
// changes need to show up immediately. Only the external Twitch/YouTube/Kick
// auto-detect calls are cached (see getCachedAutoStatus), since those were
// being re-fetched from scratch by every visitor's tab every 60s with zero
// sharing between them, which is what drove Vercel's Fluid Active CPU over
// quota despite modest traffic.
export const dynamic = "force-dynamic"

interface PlatformStatus {
  isLive: boolean
  viewers: number
  title: string
  /** true when status came from a manual admin override */
  overridden?: boolean
}

const FALLBACK: PlatformStatus = { isLive: false, viewers: 0, title: "" }

// ─── Twitch ──────────────────────────────────────────────────────────────────

// Twitch app access tokens are valid for ~60 days — fetching a brand new one
// on every single status poll (was happening before) is pure waste. Cache it
// for a day; getTwitchStatus() still handles a stale/rejected token safely
// via the streamRes.ok check below.
const getCachedTwitchToken = unstable_cache(
  async (clientId: string, clientSecret: string): Promise<string | null> => {
    try {
      const tokenRes = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
        { method: "POST", signal: AbortSignal.timeout(3000) }
      )
      if (!tokenRes.ok) return null
      const { access_token } = await tokenRes.json()
      return access_token ?? null
    } catch {
      return null
    }
  },
  ["twitch-app-token"],
  { revalidate: 86_400 }
)

async function getTwitchStatus(): Promise<PlatformStatus> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  if (!clientId || !clientSecret) return FALLBACK

  try {
    const access_token = await getCachedTwitchToken(clientId, clientSecret)
    if (!access_token) return FALLBACK

    const streamRes = await fetch(
      "https://api.twitch.tv/helix/streams?user_login=slotsband",
      {
        headers: { "Client-ID": clientId, Authorization: `Bearer ${access_token}` },
        signal: AbortSignal.timeout(3000),
      }
    )
    if (!streamRes.ok) return FALLBACK
    const { data } = await streamRes.json()
    if (!data?.length) return FALLBACK
    return {
      isLive: true,
      viewers: data[0].viewer_count ?? 0,
      title: data[0].title ?? "",
    }
  } catch {
    return FALLBACK
  }
}

// ─── YouTube ─────────────────────────────────────────────────────────────────

async function getYouTubeStatus(): Promise<PlatformStatus> {
  const apiKey = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID
  if (!apiKey || !channelId) return FALLBACK

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (!res.ok) return FALLBACK
    const { items } = await res.json()
    if (!items?.length) return FALLBACK

    // Fetch live viewer count from video details
    const videoId = items[0].id?.videoId
    if (!videoId) return { isLive: true, viewers: 0, title: items[0].snippet?.title ?? "" }

    const detailRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,snippet&id=${videoId}&key=${apiKey}`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (!detailRes.ok) return { isLive: true, viewers: 0, title: items[0].snippet?.title ?? "" }
    const detail = await detailRes.json()
    const vid = detail.items?.[0]
    return {
      isLive: true,
      viewers: parseInt(vid?.liveStreamingDetails?.concurrentViewers ?? "0", 10),
      title: vid?.snippet?.title ?? "",
    }
  } catch {
    return FALLBACK
  }
}

// ─── Kick ─────────────────────────────────────────────────────────────────────
// Kick.com blocks server-side requests with 403/CORS from cloud IPs.
// We try both known API endpoints; on any failure we return FALLBACK
// so the admin manual override is the reliable fallback path.

async function getKickStatus(): Promise<PlatformStatus> {
  const endpoints = [
    "https://kick.com/api/v2/channels/slotsband",
    "https://kick.com/api/v1/channels/slotsband",
  ]
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(3000),
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; SlotsBand/1.0)",
        },
      })
      if (!res.ok) continue
      const data = await res.json()
      const live = data.livestream !== null && data.is_banned === false
      return {
        isLive: live,
        viewers: data.livestream?.viewer_count ?? 0,
        title: data.livestream?.session_title ?? "",
      }
    } catch {
      continue
    }
  }
  // Both endpoints failed (403 / CORS / timeout) — return FALLBACK
  // Admin can set a manual override to cover this case.
  return FALLBACK
}

// ─── Override store ───────────────────────────────────────────────────────────

// Reads the row directly in-process instead of making an HTTP round-trip to
// /api/stream-override (a second, separate function invocation) — same data,
// same shape, no self-fetch. Stays fully uncached so a manual override still
// takes effect immediately.
async function getOverride() {
  try {
    const row = await getStreamOverrideRow()
    return toStreamOverrideResponse(row)
  } catch {
    return null
  }
}

// ─── Auto-detect (cached) ──────────────────────────────────────────────────────

// The real stream state doesn't change second-to-second, but this was being
// re-fetched from Twitch/YouTube/Kick by every visitor's tab independently
// every 60s. Cache the combined result for 30s so concurrent visitors share
// one set of external calls instead of one each.
const getCachedAutoStatus = unstable_cache(
  async () => {
    const [twitch, youtube, kick] = await Promise.all([
      getTwitchStatus(),
      getYouTubeStatus(),
      getKickStatus(),
    ])
    return { twitch, youtube, kick }
  },
  ["stream-auto-status"],
  { revalidate: 30 }
)

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  // 1. Check manual override first
  const ov = await getOverride()

  if (ov?.mode === "manual") {
    const manualStatus: PlatformStatus = {
      isLive: ov.isLive,
      viewers: ov.viewers ?? 0,
      title: ov.title ?? "",
      overridden: true,
    }
    return NextResponse.json(
      { kick: manualStatus, twitch: manualStatus, youtube: manualStatus, override: ov },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  // 2. Auto-detect all platforms (cached — see getCachedAutoStatus)
  const { twitch, youtube, kick } = await getCachedAutoStatus()

  return NextResponse.json(
    { kick, twitch, youtube, override: ov },
    { headers: { "Cache-Control": "no-store" } }
  )
}
