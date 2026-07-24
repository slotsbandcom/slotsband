/**
 * scripts/import-taxonomies.mjs
 *
 * 1. Verifică dacă tabelele taxonomy_terms / casino_taxonomy_terms există.
 *    Dacă nu, afișează DDL-ul și iese cu instrucțiuni.
 * 2. Importă toți cei 136 de termeni din cele 8 taxonomii.
 * 3. Importă relațiile casino ↔ termen (pentru taxonomiile cu asocieri).
 *
 * Run: node scripts/import-taxonomies.mjs [--dry-run]
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, ...rest] = line.split("=")
    if (k && rest.length && !k.startsWith("#"))
      process.env[k.trim()] = rest.join("=").trim()
  }
}
loadEnv()

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY
const XML_PATH         = path.join(__dirname, "../data/slotsbandcomsuomi.WordPress.2026-07-24.xml")
const DRY_RUN          = process.argv.includes("--dry-run")

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY lipsesc din .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ─── Taxonomiile de importat ──────────────────────────────────────────────────
const TARGET_TAXONOMIES = [
  "casino-category",
  "bonus-category",
  "deposit-method",
  "withdrawal-method",
  "software",
  "vendor",
  "licence",
  "game-category",
]

// Taxonomii pentru care NU creăm relații casino↔termen (se leagă de bonus/game)
const SKIP_CASINO_RELATIONS = new Set(["bonus-category", "game-category"])

// ─── XML Parser helpers ───────────────────────────────────────────────────────
function extractTag(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "s")
  const m  = block.match(re)
  return m ? m[1].trim() : ""
}

// ─── Parse XML ────────────────────────────────────────────────────────────────
function parseXml() {
  const xml = fs.readFileSync(XML_PATH, "utf-8")

  // Termeni
  const terms = []
  const termRe = /<wp:term>(.*?)<\/wp:term>/sg
  let tm
  while ((tm = termRe.exec(xml)) !== null) {
    const block    = tm[1]
    const taxonomy = extractTag(block, "wp:term_taxonomy")
    if (!TARGET_TAXONOMIES.includes(taxonomy)) continue

    terms.push({
      wp_term_id:    parseInt(extractTag(block, "wp:term_id"), 10),
      taxonomy,
      slug:          extractTag(block, "wp:term_slug"),
      name_fi:       extractTag(block, "wp:term_name"),
      description_fi: extractTag(block, "wp:term_description") || null,
    })
  }

  // Posturi casino + asocierile lor cu taxonomiile
  const casinoTermRelations = [] // { casinoSlug, taxonomy, termSlug }
  const itemRe = /<item>(.*?)<\/item>/sg
  let im
  while ((im = itemRe.exec(xml)) !== null) {
    const block    = im[1]
    const postType = extractTag(block, "wp:post_type")
    if (postType !== "casino") continue

    const casinoSlug = extractTag(block, "wp:post_name")
    if (!casinoSlug) continue

    const catRe = /<category domain="([^"]+)" nicename="([^"]+)"><!\[CDATA\[.*?\]\]><\/category>/g
    let cm
    while ((cm = catRe.exec(block)) !== null) {
      const taxonomy = cm[1]
      const termSlug = cm[2]
      if (TARGET_TAXONOMIES.includes(taxonomy) && !SKIP_CASINO_RELATIONS.has(taxonomy)) {
        casinoTermRelations.push({ casinoSlug, taxonomy, termSlug })
      }
    }
  }

  return { terms, casinoTermRelations }
}

// ─── Verifică existența tabelelor ─────────────────────────────────────────────
async function checkTablesExist() {
  // PostgREST returnează mesaj "schema cache" sau "relation ... does not exist"
  // când tabela lipsește; orice altă eroare înseamnă că tabela există.
  function tableExists(error) {
    if (!error) return true
    const msg = (error.message ?? "").toLowerCase()
    return !msg.includes("schema cache") && !msg.includes("does not exist") && !msg.includes("relation")
  }

  const { error: e1 } = await supabase.from("taxonomy_terms").select("id").limit(1)
  const { error: e2 } = await supabase.from("casino_taxonomy_terms").select("casino_id").limit(1)

  return {
    taxonomy_terms:       tableExists(e1),
    casino_taxonomy_terms: tableExists(e2),
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${"═".repeat(70)}`)
  console.log(`  TAXONOMY IMPORT — ${DRY_RUN ? "DRY RUN" : "LIVE"}`)
  console.log(`${"═".repeat(70)}\n`)

  // 1. Verifică tabele
  console.log("🔍  Verificare tabele Supabase...")
  const tableStatus = await checkTablesExist()

  if (!tableStatus.taxonomy_terms || !tableStatus.casino_taxonomy_terms) {
    const missing = []
    if (!tableStatus.taxonomy_terms)       missing.push("taxonomy_terms")
    if (!tableStatus.casino_taxonomy_terms) missing.push("casino_taxonomy_terms")

    console.error(`\n❌  TABELELE LIPSESC: ${missing.join(", ")}`)
    console.error("\n━━━  SOLUȚIE: Rulează DDL-ul de mai jos în Supabase Dashboard → SQL Editor  ━━━")
    console.error("\n" + fs.readFileSync(
      path.join(__dirname, "../supabase/migrations/20260724_taxonomy_terms.sql"), "utf-8"
    ))
    console.error("\n━━━  Apoi rulează din nou: node scripts/import-taxonomies.mjs  ━━━\n")
    process.exit(1)
  }

  console.log("✅  Ambele tabele există.\n")

  // 2. Parse XML
  console.log("📖  Parsare XML...")
  const { terms, casinoTermRelations } = parseXml()
  console.log(`   Termeni găsiți: ${terms.length}`)
  console.log(`   Relații casino↔termen găsite: ${casinoTermRelations.length}\n`)

  // 3. Import termeni
  console.log("📥  Import taxonomy_terms...")

  // Verifică care termeni există deja (după wp_term_id)
  const { data: existing } = await supabase
    .from("taxonomy_terms")
    .select("id, wp_term_id, taxonomy, slug")

  const existingByWpId = new Map((existing ?? []).map(r => [r.wp_term_id, r]))
  const existingByTaxSlug = new Map((existing ?? []).map(r => [`${r.taxonomy}::${r.slug}`, r]))

  const toInsert = []
  const toUpdate = []

  for (const term of terms) {
    const byWpId   = existingByWpId.get(term.wp_term_id)
    const bySlug   = existingByTaxSlug.get(`${term.taxonomy}::${term.slug}`)
    const existing = byWpId ?? bySlug

    if (existing) {
      toUpdate.push({ id: existing.id, ...term })
    } else {
      toInsert.push(term)
    }
  }

  console.log(`   Noi: ${toInsert.length} | De actualizat: ${toUpdate.length}`)

  const termIdMap = new Map() // taxonomy::slug -> uuid

  // Adaugă existenții în map
  for (const r of existing ?? []) {
    termIdMap.set(`${r.taxonomy}::${r.slug}`, r.id)
  }

  if (!DRY_RUN) {
    // Insert batch
    if (toInsert.length > 0) {
      const { data: inserted, error: ie } = await supabase
        .from("taxonomy_terms")
        .insert(toInsert)
        .select("id, taxonomy, slug")

      if (ie) {
        console.error("❌  Eroare insert taxonomy_terms:", ie.message)
        process.exit(1)
      }
      for (const r of inserted ?? []) termIdMap.set(`${r.taxonomy}::${r.slug}`, r.id)
      console.log(`   ✅  Inserați: ${inserted?.length ?? 0}`)
    }

    // Update batch (upsert pe wp_term_id)
    for (const t of toUpdate) {
      const { id, ...fields } = t
      const { error: ue } = await supabase
        .from("taxonomy_terms")
        .update(fields)
        .eq("id", id)
      if (ue) console.warn(`   ⚠️  Update eșuat pentru ${t.taxonomy}::${t.slug}: ${ue.message}`)
      termIdMap.set(`${t.taxonomy}::${t.slug}`, id)
    }
    if (toUpdate.length > 0) console.log(`   ✅  Actualizați: ${toUpdate.length}`)
  } else {
    // Dry run — adaugă termeni noi cu id fictiv
    for (const t of toInsert)  termIdMap.set(`${t.taxonomy}::${t.slug}`, `new-${t.wp_term_id}`)
    for (const t of toUpdate)  termIdMap.set(`${t.taxonomy}::${t.slug}`, t.id)
    console.log("   ℹ️  DRY RUN — nicio scriere")
  }

  // 4. Rezoluție casino_id din cazinouri
  console.log("\n📥  Pregătire relații casino↔termen...")

  const { data: casinos, error: ce } = await supabase
    .from("casinos")
    .select("id, slug")
  if (ce) { console.error("❌  Nu pot fetch cazinouri:", ce.message); process.exit(1) }

  const casinoIdBySlug = new Map((casinos ?? []).map(c => [c.slug, c.id]))

  // Build perechi (casino_id, term_id)
  const relPairs = []
  const relWarnings = []

  for (const rel of casinoTermRelations) {
    const casinoId = casinoIdBySlug.get(rel.casinoSlug)
    const termId   = termIdMap.get(`${rel.taxonomy}::${rel.termSlug}`)

    if (!casinoId) {
      relWarnings.push(`casino slug "${rel.casinoSlug}" nu există în DB`)
      continue
    }
    if (!termId) {
      relWarnings.push(`termen ${rel.taxonomy}::${rel.termSlug} nu a fost importat`)
      continue
    }
    if (!termId.startsWith?.("new-")) { // skip fictive ids in dry run
      relPairs.push({ casino_id: casinoId, term_id: termId })
    } else if (DRY_RUN) {
      relPairs.push({ casino_id: casinoId, term_id: termId }) // keep for count
    }
  }

  // Deduplicare
  const seen = new Set()
  const uniquePairs = []
  for (const p of relPairs) {
    const key = `${p.casino_id}::${p.term_id}`
    if (!seen.has(key)) { seen.add(key); uniquePairs.push(p) }
  }

  console.log(`   Total relații unice: ${uniquePairs.length}`)
  if (relWarnings.length > 0) {
    const uniq = [...new Set(relWarnings)]
    console.log(`   ⚠️  Avertismente (${uniq.length} unice):`)
    for (const w of uniq.slice(0, 10)) console.log(`      • ${w}`)
    if (uniq.length > 10) console.log(`      ... și ${uniq.length - 10} altele`)
  }

  if (!DRY_RUN) {
    // Fetch existing relations to avoid duplicate key errors
    const { data: existingRels } = await supabase
      .from("casino_taxonomy_terms")
      .select("casino_id, term_id")

    const existingRelSet = new Set(
      (existingRels ?? []).map(r => `${r.casino_id}::${r.term_id}`)
    )

    const newPairs = uniquePairs.filter(
      p => !p.term_id.startsWith?.("new-") &&
           !existingRelSet.has(`${p.casino_id}::${p.term_id}`)
    )

    console.log(`   Relații noi de insertat: ${newPairs.length}`)

    // Insert în batch de 200
    const BATCH = 200
    let inserted = 0
    for (let i = 0; i < newPairs.length; i += BATCH) {
      const batch = newPairs.slice(i, i + BATCH)
      const { error: re } = await supabase
        .from("casino_taxonomy_terms")
        .insert(batch)

      if (re) {
        console.error(`   ❌  Eroare relații batch ${Math.floor(i/BATCH)+1}: ${re.message}`)
      } else {
        inserted += batch.length
        process.stdout.write(`\r   ✅  Insertat: ${inserted}/${newPairs.length}`)
      }
    }
    if (newPairs.length > 0) console.log()
  } else {
    console.log("   ℹ️  DRY RUN — nicio scriere")
  }

  // 5. Raport final
  console.log(`\n${"═".repeat(70)}`)
  console.log("  RAPORT FINAL")
  console.log(`${"═".repeat(70)}`)

  // Termeni per taxonomie
  const termsByTax = {}
  for (const t of TARGET_TAXONOMIES) termsByTax[t] = { total: 0, new: 0, updated: 0 }
  for (const t of terms)   termsByTax[t.taxonomy].total++
  for (const t of toInsert) termsByTax[t.taxonomy].new++
  for (const t of toUpdate) termsByTax[t.taxonomy].updated++

  // Relații per taxonomie
  const relsByTax = {}
  for (const t of TARGET_TAXONOMIES) relsByTax[t] = 0
  for (const p of uniquePairs) {
    // inversează lookup: term_id -> taxonomy
    const term = terms.find(t => termIdMap.get(`${t.taxonomy}::${t.slug}`) === p.term_id ||
                                  (DRY_RUN && termIdMap.get(`${t.taxonomy}::${t.slug}`) === p.term_id))
    if (term) relsByTax[term.taxonomy]++
  }
  // Re-count from casinoTermRelations
  const relCountByTax = {}
  for (const t of TARGET_TAXONOMIES) relCountByTax[t] = 0
  for (const r of casinoTermRelations) relCountByTax[r.taxonomy]++

  console.log(`\n  ${"TAXONOMIE".padEnd(24)} ${"TERMENI".padEnd(10)} ${"NOU".padEnd(8)} ${"UPDATE".padEnd(10)} RELAȚII`)
  console.log(`  ${"─".repeat(24)} ${"─".repeat(10)} ${"─".repeat(8)} ${"─".repeat(10)} ${"─".repeat(10)}`)
  for (const tax of TARGET_TAXONOMIES) {
    const { total, newly: n, updated: u } = { ...termsByTax[tax], newly: termsByTax[tax].new }
    const skip = SKIP_CASINO_RELATIONS.has(tax) ? "(skip)" : String(relCountByTax[tax])
    console.log(`  ${tax.padEnd(24)} ${String(total).padEnd(10)} ${String(termsByTax[tax].new).padEnd(8)} ${String(termsByTax[tax].updated).padEnd(10)} ${skip}`)
  }

  const totalTerms = terms.length
  const totalNew   = toInsert.length
  const totalUpd   = toUpdate.length
  const totalRels  = Object.values(relCountByTax).reduce((a,b) => a+b, 0)
  console.log(`  ${"─".repeat(70)}`)
  console.log(`  ${"TOTAL".padEnd(24)} ${String(totalTerms).padEnd(10)} ${String(totalNew).padEnd(8)} ${String(totalUpd).padEnd(10)} ${totalRels}`)

  if (DRY_RUN) console.log("\n  ⚠️  DRY RUN — nicio modificare în DB\n")
  else console.log("\n  🎉  Import complet!\n")
}

main().catch(e => { console.error("❌  Fatal:", e.message); process.exit(1) })
