/**
 * Shared with app/api/stream-status/route.ts so it can read the manual
 * override directly (in-process DB read) instead of making an HTTP
 * round-trip to app/api/stream-override/route.ts on every poll.
 */
import { createBuildClient } from "@/lib/supabase/build-client"

export async function getStreamOverrideRow() {
  const supabase = createBuildClient()
  const { data } = await supabase
    .from("stream_status")
    .select("*")
    .eq("platform", "kick")
    .single()
  return data
}

export function toStreamOverrideResponse(row: any) {
  // Auto-expire manual overrides
  if (row?.override_mode === "manual" && row.expires_at && new Date() > new Date(row.expires_at)) {
    return { mode: "auto", isLive: false, title: "", viewers: 0, expiresAt: null }
  }
  return {
    mode: row?.override_mode ?? "auto",
    isLive: row?.is_live ?? false,
    title: row?.title ?? "",
    viewers: row?.viewers ?? 0,
    expiresAt: row?.expires_at ?? null,
  }
}
