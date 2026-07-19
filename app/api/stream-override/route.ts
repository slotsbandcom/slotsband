import { NextResponse } from "next/server"

// ─── In-memory override store ─────────────────────────────────────────────────
// This persists for the lifetime of the serverless function instance.
// For production persistence use a KV store (Vercel KV / Upstash).

export interface StreamOverride {
  mode: "auto" | "manual"
  /** Only relevant when mode === "manual" */
  isLive: boolean
  title: string
  viewers: number
  /** ISO string — when to auto-reset to OFFLINE (null = never) */
  expiresAt: string | null
  /** Hours until auto-reset, 0 = never */
  autoResetHours: number
  updatedAt: string
}

const DEFAULT: StreamOverride = {
  mode: "auto",
  isLive: false,
  title: "",
  viewers: 0,
  expiresAt: null,
  autoResetHours: 8,
  updatedAt: new Date().toISOString(),
}

// Module-level singleton — shared across requests in the same instance
let override: StreamOverride = { ...DEFAULT }

function resolvedOverride(): StreamOverride {
  // Auto-expire: if expiresAt is set and has passed, reset to OFFLINE
  if (override.expiresAt && new Date() > new Date(override.expiresAt)) {
    override = {
      ...override,
      isLive: false,
      expiresAt: null,
      updatedAt: new Date().toISOString(),
    }
  }
  return override
}

export async function GET() {
  return NextResponse.json(resolvedOverride())
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<StreamOverride>

    // Merge patch
    override = {
      ...override,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    // Compute expiresAt when switching to manual LIVE
    if (body.mode === "manual" && body.isLive === true) {
      const hours = body.autoResetHours ?? override.autoResetHours
      if (hours > 0) {
        const exp = new Date()
        exp.setHours(exp.getHours() + hours)
        override.expiresAt = exp.toISOString()
      } else {
        override.expiresAt = null
      }
    }

    // Clear expiry when going OFFLINE manually
    if (body.mode === "manual" && body.isLive === false) {
      override.expiresAt = null
    }

    return NextResponse.json(resolvedOverride())
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }
}
