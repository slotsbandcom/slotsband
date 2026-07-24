import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
const __dirname = path.dirname(fileURLToPath(import.meta.url))
for (const line of fs.readFileSync(path.join(__dirname, "../.env.local"), "utf-8").split("\n")) {
  const [k, ...rest] = line.split("=")
  if (k && rest.length && !k.startsWith("#")) process.env[k.trim()] = rest.join("=").trim()
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data } = await db.from("taxonomy_terms").select("name_fi,description_fi,faq_fi").not("faq_fi","is",null)
console.log("Terms with faq_fi:", data?.length)
const withShortcode = data?.filter(t => t.description_fi?.includes("[joli-faq-seo"))
console.log("Still have shortcode:", withShortcode?.length ?? 0)
for (const t of data ?? []) {
  const hasCode = t.description_fi?.includes("[joli-faq-seo") ? "⚠️ shortcode!" : "✓"
  console.log(` ${hasCode} ${t.name_fi} — ${t.faq_fi?.length} FAQs`)
}
