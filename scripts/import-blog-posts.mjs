/**
 * Import 25 blog posts from WordPress XML into blog_posts table.
 * Run AFTER creating the table in Supabase Dashboard.
 * Usage: node scripts/import-blog-posts.mjs
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { config } from "dotenv"

const __dir = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dir, "../.env.local") })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function decodeEntities(str) {
  if (!str) return ""
  return str
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
}

function stripShortcodes(html) {
  return html
    .replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/g, "$1")
    .replace(/\[gallery[^\]]*\]/g, "")
    .replace(/\[\/?\w+[^\]]*\]/g, "")
    .replace(/<!--\s*wp:[^>]*-->/g, "")
    .replace(/<!--\s*\/wp:[^>]*-->/g, "")
    .trim()
}

const xmlPath = join(__dir, "../data/slotsbandcomsuomi.WordPress.2026-07-24.xml")
console.log("Reading XML...")
const xml = readFileSync(xmlPath, "utf8")

const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1])

// Build attachment map: wp_post_id → url
const attachments = {}
items
  .filter(i => (i.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/) || [])[1] === "attachment")
  .forEach(a => {
    const id = (a.match(/<wp:post_id>(\d+)<\/wp:post_id>/) || [])[1]
    const url = (a.match(/<wp:attachment_url><!\[CDATA\[(.*?)\]\]><\/wp:attachment_url>/) || [])[1]
    if (id && url) attachments[id] = url
  })

const posts = items.filter(i => {
  const pt = (i.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/) || [])[1]
  const st = (i.match(/<wp:status><!\[CDATA\[(.*?)\]\]><\/wp:status>/) || [])[1]
  return pt === "post" && st === "publish"
})

console.log(`Found ${posts.length} published posts\n`)

function getMeta(postXml, key) {
  const metas = [...postXml.matchAll(/<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/g)].map(m => m[1])
  for (const m of metas) {
    const k = (m.match(/<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>/) || [])[1]
    if (k === key) {
      return decodeEntities((m.match(/<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>/) || [])[1] || "")
    }
  }
  return ""
}

let ok = 0, fail = 0

for (const p of posts) {
  const slug = (p.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/) || [])[1] || ""
  const title = decodeEntities((p.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || [])[1] || "")
  const rawContent = (p.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) || [])[1] || ""
  const content = stripShortcodes(decodeEntities(rawContent))
  const rawExcerpt = (p.match(/<excerpt:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/excerpt:encoded>/) || [])[1] || ""
  const excerpt = stripShortcodes(decodeEntities(rawExcerpt))
  const pubDate = (p.match(/<wp:post_date_gmt><!\[CDATA\[(.*?)\]\]><\/wp:post_date_gmt>/) || [])[1] || ""
  const postId = parseInt((p.match(/<wp:post_id>(\d+)<\/wp:post_id>/) || [])[1] || "0")
  const thumbId = getMeta(p, "_thumbnail_id")
  const featuredImage = thumbId ? (attachments[thumbId] || null) : null
  const metaTitle = getMeta(p, "_yoast_wpseo_title") || null
  const metaDesc = getMeta(p, "_yoast_wpseo_metadesc") || null

  const row = {
    slug_fi: slug,
    slug_en: slug,
    slug_uk: slug,
    title_fi: title,
    content_fi: content || null,
    excerpt_fi: excerpt || null,
    featured_image_url: featuredImage,
    meta_title_fi: metaTitle,
    meta_description_fi: metaDesc,
    published_at: pubDate && pubDate !== "0000-00-00 00:00:00" ? new Date(pubDate + " UTC").toISOString() : null,
    is_active: true,
    wp_post_id: postId,
  }

  const { error } = await supabase.from("blog_posts").insert(row)
  if (error) {
    console.error(`✗ FAIL [${slug}]: ${error.message}`)
    fail++
  } else {
    console.log(`✓ ${slug}`)
    ok++
  }
}

console.log(`\nDone: ${ok} imported, ${fail} failed`)
