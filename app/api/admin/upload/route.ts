import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"])
const MAX_SIZE = 2 * 1024 * 1024  // 2 MB

function extFromType(type: string): string {
  if (type.includes("png"))  return "png"
  if (type.includes("webp")) return "webp"
  if (type.includes("svg"))  return "svg"
  if (type.includes("gif"))  return "gif"
  return "jpg"
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file   = form.get("file")   as File   | null
    const slug   = form.get("slug")   as string | null
    const bucket = form.get("bucket") as string | null  // "casino-logos" | "casino-banners"
    const field  = form.get("field")  as string | null  // "logo" | "banner"

    if (!file || !slug || !bucket || !field) {
      return NextResponse.json({ error: "file, slug, bucket, and field are required" }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 2 MB limit" }, { status: 400 })
    }

    const ext         = extFromType(file.type)
    const storagePath = `${slug}/${field}.${ext}`
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
