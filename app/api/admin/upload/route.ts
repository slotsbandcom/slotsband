import { getAdminSession } from "@/lib/supabase/admin-auth"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"])
const MAX_SIZE = 5 * 1024 * 1024  // 5 MB

// Buckets this endpoint is allowed to write to, and (where restricted) which
// roles may use them. An "editor" account only ever needs blog images.
const BUCKET_ROLES: Record<string, ("admin" | "editor")[]> = {
  "casino-logos": ["admin"],
  "casino-banners": ["admin"],
  "blog-images": ["admin", "editor"],
}

function extFromType(type: string): string {
  if (type.includes("png"))  return "png"
  if (type.includes("webp")) return "webp"
  if (type.includes("svg"))  return "svg"
  if (type.includes("gif"))  return "gif"
  return "jpg"
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const form = await req.formData()
    const file   = form.get("file")   as File   | null
    const slug   = form.get("slug")   as string | null
    const bucket = form.get("bucket") as string | null
    const field  = form.get("field")  as string | null

    if (!file || !slug || !bucket || !field) {
      return NextResponse.json({ error: "file, slug, bucket, and field are required" }, { status: 400 })
    }
    const allowedRoles = BUCKET_ROLES[bucket]
    if (!allowedRoles) {
      return NextResponse.json({ error: `Unknown bucket: ${bucket}` }, { status: 400 })
    }
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File exceeds ${MAX_SIZE / (1024 * 1024)} MB limit` }, { status: 400 })
    }

    const ext         = extFromType(file.type)
    // A slug segment can't contain "/" — keeps callers from writing outside
    // their intended folder within the bucket.
    const safeSlug    = slug.replace(/[^a-zA-Z0-9_-]/g, "-")
    const safeField   = field.replace(/[^a-zA-Z0-9_-]/g, "-")
    const storagePath = `${safeSlug}/${safeField}.${ext}`
    const bytes       = await file.arrayBuffer()

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(storagePath, bytes, { contentType: file.type, upsert: true })

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 })
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath)
    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error("[upload]", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
