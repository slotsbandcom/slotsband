#!/usr/bin/env node
/**
 * WordPress XML → Supabase Storage logo/banner/screenshot uploader
 *
 * Reads the WP export, resolves attachment IDs to URLs,
 * downloads each image, uploads to Supabase Storage, and
 * updates the casinos table with the new public URLs.
 *
 * Usage: npx tsx scripts/upload-casino-logos.ts
 */

import { XMLParser } from "fast-xml-parser"
import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// ── Env ────────────────────────────────────────────────────────────────────────
function loadEnvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, "utf-8")
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (!m) continue
      const key = m[1]; const val = m[2].replace(/^["']|["']$/g, "").trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch {}
}
loadEnvFile(path.join(process.cwd(), ".env.local"))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Config ─────────────────────────────────────────────────────────────────────
const XML_PATH        = "C:\\Users\\claud\\Downloads\\slotsbandcomsuomi.WordPress.2026-07-20.xml"
const LOGO_BUCKET     = "casino-logos"
const BANNER_BUCKET   = "casino-banners"
const SHOT_BUCKET     = "casino-screenshots"
const DOWNLOAD_DELAY  = 300   // ms between downloads — be polite to the server
const MAX_SCREENSHOTS = 4     // max screenshots per casino

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; SlotsBand-Bot/1.0)",
  Accept: "image/*,*/*;q=0.8",
}

// ── Supabase Storage helpers ───────────────────────────────────────────────────
async function ensureBucket(name: string) {
  const { data: list } = await supabase.storage.listBuckets()
  if (list?.find(b => b.name === name)) return
  const { error } = await supabase.storage.createBucket(name, {
    public: true,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"],
    fileSizeLimit: 2097152,  // 2 MB
  })
  if (error) console.error(`  ✗ createBucket(${name}):`, error.message)
  else       console.log(`  ✓ Created bucket: ${name}`)
}

function extFromContentType(ct: string, url: string): string {
  if (ct.includes("png"))  return "png"
  if (ct.includes("webp")) return "webp"
  if (ct.includes("svg"))  return "svg"
  if (ct.includes("gif"))  return "gif"
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg"
  const m = url.match(/\.(png|jpg|jpeg|webp|svg|gif)(\?|$)/i)
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg"
}

async function downloadImage(url: string): Promise<{ buf: Buffer; ct: string; ext: string } | null> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 12000)
    const res = await fetch(url, { headers: FETCH_HEADERS, signal: ctrl.signal })
    clearTimeout(t)
    if (!res.ok) return null
    const ct  = res.headers.get("content-type") ?? "image/jpeg"
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) return null  // suspiciously small
    return { buf, ct, ext: extFromContentType(ct, url) }
  } catch { return null }
}

async function uploadImage(
  bucket: string, storagePath: string, buf: Buffer, ct: string,
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buf, { contentType: ct, upsert: true })
  if (error) { console.error(`    upload error (${storagePath}):`, error.message); return null }
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath)
  return data.publicUrl
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// ── XML parsing ────────────────────────────────────────────────────────────────
interface WpItem {
  title?: { __cdata?: string } | string
  "wp:post_id"?: { __cdata?: string } | string | number
  "wp:post_name"?: { __cdata?: string } | string
  "wp:post_type"?: { __cdata?: string } | string
  "wp:post_parent"?: { __cdata?: string } | string | number
  "wp:attachment_url"?: { __cdata?: string } | string
  "content:encoded"?: { __cdata?: string } | string
  "wp:postmeta"?: MetaEntry | MetaEntry[]
}
interface MetaEntry {
  "wp:meta_key"?: { __cdata?: string } | string
  "wp:meta_value"?: { __cdata?: string } | string | number
}

function str(v: unknown): string {
  if (v === null || v === undefined) return ""
  if (typeof v === "object" && "__cdata" in (v as any)) return String((v as any).__cdata ?? "")
  return String(v)
}

function buildMeta(raw: unknown): Record<string, string> {
  const entries = Array.isArray(raw) ? raw : raw ? [raw] : []
  const out: Record<string, string> = {}
  for (const e of entries as MetaEntry[]) {
    const k = str(e["wp:meta_key"])
    const v = str(e["wp:meta_value"])
    if (k) out[k] = v
  }
  return out
}

function extractImgUrls(html: string): string[] {
  const urls: string[] = []
  const re = /src=["'](https?:\/\/[^"']+\.(?:png|jpe?g|webp|gif|svg)[^"']*)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) urls.push(m[1])
  return urls
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════════════════")
  console.log("  WordPress → Supabase Storage: Casino Logo/Banner Uploader")
  console.log("═══════════════════════════════════════════════════════════\n")

  // ── 1. Parse XML ─────────────────────────────────────────────────────────
  console.log("── Step 1: Parsing XML ─────────────────────────────────────")
  if (!fs.existsSync(XML_PATH)) { console.error("XML not found:", XML_PATH); process.exit(1) }
  const xmlContent = fs.readFileSync(XML_PATH, "utf-8")
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "__cdata",
    isArray: (name) => ["item", "wp:postmeta", "category"].includes(name),
    parseTagValue: false,
    trimValues: false,
  })
  const parsed   = parser.parse(xmlContent)
  const allItems = (parsed?.rss?.channel?.item ?? []) as WpItem[]
  console.log(`Total items: ${allItems.length}`)

  // ── 2. Build attachment map (id → url) ────────────────────────────────────
  const attachMap = new Map<string, string>()   // wp_post_id → attachment_url
  for (const item of allItems) {
    if (str(item["wp:post_type"]) !== "attachment") continue
    const id  = str(item["wp:post_id"])
    const url = str(item["wp:attachment_url"])
    if (id && url) attachMap.set(id, url)
  }
  console.log(`Attachments found: ${attachMap.size}`)

  // ── 3. Build casino slug → images map ────────────────────────────────────
  interface CasinoImages { logo?: string; banner?: string; screenshots: string[] }
  const casinoImages = new Map<string, CasinoImages>()

  for (const item of allItems) {
    if (str(item["wp:post_type"]) !== "casino") continue
    const slug = str(item["wp:post_name"])
    if (!slug) continue

    const meta     = buildMeta(item["wp:postmeta"])
    const thumbId  = meta["_thumbnail_id"]
    const bgId     = meta["aces_single_casino_background_image"] || meta["aces_casino_background_image"]
    const content  = str(item["content:encoded"])

    const entry: CasinoImages = { screenshots: [] }

    if (thumbId) {
      const url = attachMap.get(thumbId)
      if (url) entry.logo = url
    }
    if (bgId) {
      const url = attachMap.get(bgId)
      if (url) entry.banner = url
    }

    // Extract screenshot candidates from content (exclude logo/banner)
    const imgUrls = extractImgUrls(content)
    for (const u of imgUrls) {
      const lower = u.toLowerCase()
      if (lower.includes("logo") || lower.includes("taustakuva") || lower.includes("background")) continue
      if (entry.screenshots.length < MAX_SCREENSHOTS) entry.screenshots.push(u)
    }

    casinoImages.set(slug, entry)
  }
  console.log(`Casino items with image data: ${casinoImages.size}\n`)

  // ── 4. Ensure buckets ─────────────────────────────────────────────────────
  console.log("── Step 2: Ensuring storage buckets ────────────────────────")
  await ensureBucket(LOGO_BUCKET)
  await ensureBucket(BANNER_BUCKET)
  await ensureBucket(SHOT_BUCKET)
  console.log()

  // ── 5. Get existing casinos from Supabase ─────────────────────────────────
  console.log("── Step 3: Loading casinos from Supabase ───────────────────")
  const { data: dbCasinos, error: dbErr } = await supabase
    .from("casinos")
    .select("id, slug, name, logo_url, banner_url, screenshots")
  if (dbErr) { console.error("Supabase fetch error:", dbErr.message); process.exit(1) }

  const dbMap = new Map((dbCasinos ?? []).map(c => [c.slug, c]))
  console.log(`Casinos in Supabase: ${dbMap.size}\n`)

  // ── 6. Upload logos ────────────────────────────────────────────────────────
  console.log("── Step 4: Uploading logos ─────────────────────────────────")
  let logoOk = 0, logoFail = 0, logoSkip = 0

  for (const [slug, imgs] of casinoImages) {
    const db = dbMap.get(slug)
    if (!db) continue

    if (!imgs.logo) { logoSkip++; continue }

    // Skip if already a Supabase Storage URL (already uploaded)
    if (db.logo_url?.includes(SUPABASE_URL!)) {
      console.log(`  ↷ ${db.name}: logo already in Supabase Storage`)
      logoSkip++; continue
    }

    process.stdout.write(`  ↓ ${db.name}: downloading logo... `)
    const img = await downloadImage(imgs.logo)
    if (!img) {
      console.log("✗ download failed")
      logoFail++; await sleep(DOWNLOAD_DELAY); continue
    }

    const storagePath = `${slug}/logo.${img.ext}`
    const publicUrl   = await uploadImage(LOGO_BUCKET, storagePath, img.buf, img.ct)
    if (!publicUrl) { logoFail++; await sleep(DOWNLOAD_DELAY); continue }

    const { error } = await supabase.from("casinos").update({ logo_url: publicUrl }).eq("slug", slug)
    if (error) {
      console.log(`✗ db update: ${error.message}`)
      logoFail++
    } else {
      console.log(`✓ (${Math.round(img.buf.length / 1024)} KB)`)
      logoOk++
    }
    await sleep(DOWNLOAD_DELAY)
  }
  console.log(`\nLogos — uploaded: ${logoOk}, failed: ${logoFail}, skipped: ${logoSkip}\n`)

  // ── 7. Upload banners ─────────────────────────────────────────────────────
  console.log("── Step 5: Uploading banners ───────────────────────────────")
  let bannerOk = 0, bannerFail = 0, bannerSkip = 0

  for (const [slug, imgs] of casinoImages) {
    const db = dbMap.get(slug)
    if (!db) continue
    if (!imgs.banner) { bannerSkip++; continue }
    if (db.banner_url?.includes(SUPABASE_URL!)) {
      console.log(`  ↷ ${db.name}: banner already in Supabase Storage`)
      bannerSkip++; continue
    }

    process.stdout.write(`  ↓ ${db.name}: downloading banner... `)
    const img = await downloadImage(imgs.banner)
    if (!img) { console.log("✗ download failed"); bannerFail++; await sleep(DOWNLOAD_DELAY); continue }

    const storagePath = `${slug}/banner.${img.ext}`
    const publicUrl   = await uploadImage(BANNER_BUCKET, storagePath, img.buf, img.ct)
    if (!publicUrl) { bannerFail++; await sleep(DOWNLOAD_DELAY); continue }

    const { error } = await supabase.from("casinos").update({ banner_url: publicUrl }).eq("slug", slug)
    if (error) { console.log(`✗ db update: ${error.message}`); bannerFail++ }
    else       { console.log(`✓ (${Math.round(img.buf.length / 1024)} KB)`); bannerOk++ }
    await sleep(DOWNLOAD_DELAY)
  }
  console.log(`\nBanners — uploaded: ${bannerOk}, failed: ${bannerFail}, skipped: ${bannerSkip}\n`)

  // ── 8. Upload screenshots ─────────────────────────────────────────────────
  console.log("── Step 6: Uploading screenshots ───────────────────────────")
  let shotOk = 0, shotFail = 0

  for (const [slug, imgs] of casinoImages) {
    const db = dbMap.get(slug)
    if (!db || imgs.screenshots.length === 0) continue

    const newScreenshots: string[] = []
    for (let i = 0; i < imgs.screenshots.length; i++) {
      const url = imgs.screenshots[i]
      process.stdout.write(`  ↓ ${db.name} screenshot ${i + 1}/${imgs.screenshots.length}... `)
      const img = await downloadImage(url)
      if (!img) { console.log("✗"); shotFail++; await sleep(DOWNLOAD_DELAY); continue }

      const storagePath = `${slug}/screenshot-${i + 1}.${img.ext}`
      const publicUrl   = await uploadImage(SHOT_BUCKET, storagePath, img.buf, img.ct)
      if (publicUrl) { newScreenshots.push(publicUrl); console.log("✓"); shotOk++ }
      else            { shotFail++ }
      await sleep(DOWNLOAD_DELAY)
    }

    if (newScreenshots.length > 0) {
      await supabase.from("casinos").update({ screenshots: newScreenshots }).eq("slug", slug)
    }
  }
  console.log(`\nScreenshots — uploaded: ${shotOk}, failed: ${shotFail}`)

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════════")
  console.log(`  Done! Logos: ${logoOk} ✓  Banners: ${bannerOk} ✓  Screenshots: ${shotOk} ✓`)
  console.log("═══════════════════════════════════════════════════════════")
}

main().catch(err => { console.error(err); process.exit(1) })
