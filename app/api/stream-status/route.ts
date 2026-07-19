import { NextResponse } from "next/server"

// Never cache this route — override changes need to be reflected immediately
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

async function getTwitchStatus(): Promise<PlatformStatus> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  if (!clientId || !clientSecret) return FALLBACK

  try {
    // Fetch app access token
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST", signal: AbortSignal.timeout(3000) }
    )
    if (!tokenRes.ok) return FALLBACK
    const { access_token } = await tokenRes.json()

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

async function getOverride() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/stream-override`, {
      signal: AbortSignal.timeout(1000),
      cache: "no-store",
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

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

  // 2. Auto-detect all platforms in parallel
  const [twitch, youtube, kick] = await Promise.all([
    getTwitchStatus(),
    getYouTubeStatus(),
    getKickStatus(),
  ])

  return NextResponse.json(
    { twitch, youtube, kick, override: ov },
    { headers: { "Cache-Control": "no-store" } }
  )
}
