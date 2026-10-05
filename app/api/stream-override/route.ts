import { getStreamOverrideRow, toStreamOverrideResponse } from "@/lib/supabase/stream-override"
import { NextResponse } from "next/server"

// Public read of the manual stream override. Writes live in
// app/api/admin/stream-override (admin-only).
export const dynamic = "force-dynamic"

export async function GET() {
  const row = await getStreamOverrideRow()
  return NextResponse.json(toStreamOverrideResponse(row), { headers: { "Cache-Control": "no-store" } })
}
