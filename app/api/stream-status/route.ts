import { NextResponse } from "next/server"

export const revalidate = 60 // cache 60 seconds at the edge

interface PlatformStatus {
  isLive: boolean
  viewers: number
  title: string
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

async function getKickStatus(): Promise<PlatformStatus> {
  try {
    const res = await fetch("https://kick.com/api/v1/channels/slotsband", {
      signal: AbortSignal.timeout(3000),
      headers: { "Accept": "application/json" },
    })
    if (!res.ok) return FALLBACK
    const data = await res.json()
    return {
      isLive: data.livestream !== null && data.is_banned === false,
      viewers: data.livestream?.viewer_count ?? 0,
      title: data.livestream?.session_title ?? "",
    }
  } catch {
    return FALLBACK
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  const [twitch, youtube, kick] = await Promise.all([
    getTwitchStatus(),
    getYouTubeStatus(),
    getKickStatus(),
  ])

  return NextResponse.json(
    { twitch, youtube, kick },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  )
}
