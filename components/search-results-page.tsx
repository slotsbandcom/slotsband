import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { CasinoCard } from "@/components/casino-card"
import type { Casino, Lang } from "@/lib/types"

interface Props {
  lang: Lang
  query: string
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E8F0] p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-[#E5E8F0] rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#E5E8F0] rounded w-1/2" />
          <div className="h-3 bg-[#E5E8F0] rounded w-3/4" />
          <div className="h-3 bg-[#E5E8F0] rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#FFD700]/40 text-[#1b1b1c] font-bold rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export async function SearchResultsPage({ lang, query }: Props) {
  const q = query.trim()

  const fi = lang === "fi"
  const labels = {
    title: fi ? "Hakutulokset" : "Search Results",
    for: fi ? "haulle" : "for",
    casinosFound: fi ? "kasinoa" : "casinos",
    pagesFound: fi ? "sivua" : "pages",
    and: fi ? "ja" : "and",
    noResults: fi ? "Ei tuloksia haulle" : "No results for",
    noResultsHint: fi ? "Kokeile hakea: Pikakasino, MGA, Bonus" : "Try searching: Pikakasino, MGA, Bonus",
    featuredCasinos: fi ? "Suositellut kasinot" : "Featured Casinos",
    casinosSection: fi ? "Kasinot" : "Casinos",
    pagesSection: fi ? "Sivut" : "Pages",
    emptySearch: fi ? "Kirjoita kasinon nimi hakukenttään" : "Type a casino name in the search bar",
    visitCasino: fi ? "Vieraile sivulla" : "Visit page",
  }

  if (!q) {
    return (
      <div className="min-h-screen bg-[#F8F9FD]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-16 text-center">
          <span className="material-symbols-outlined text-[64px] text-[#E5E8F0]" aria-hidden="true">search</span>
          <p className="text-[#787585] mt-4">{labels.emptySearch}</p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const [{ data: casinoData }, { data: pageData }] = await Promise.all([
    supabase
      .from("casinos")
      .select("*")
      .or(
        `name.ilike.%${q}%,` +
        `review_fi.ilike.%${q}%,` +
        `welcome_bonus_text.ilike.%${q}%,` +
        `license_authority.ilike.%${q}%`
      )
      .eq("is_active", true)
      .order("rating", { ascending: false })
      .limit(20),
    supabase
      .from("pages")
      .select("id, title, slug, excerpt, lang")
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .eq("lang", lang)
      .limit(10),
  ])

  const casinos = (casinoData ?? []) as Casino[]
  const pages = (pageData ?? []) as Array<{ id: string; title: string; slug: string; excerpt?: string; lang: string }>

  const totalCount = casinos.length + pages.length

  // Fetch featured casinos for no-results state
  let featured: Casino[] = []
  if (totalCount === 0) {
    const { data } = await supabase
      .from("casinos")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("rating", { ascending: false })
      .limit(3)
    featured = (data ?? []) as Casino[]
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8 md:py-12">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-[#1b1b1c]">
            {labels.title} &ldquo;<span className="text-[#2D1783]">{q}</span>&rdquo;
          </h1>
          {totalCount > 0 && (
            <p className="text-[#787585] mt-1 text-sm">
              {fi
                ? `Löydettiin ${casinos.length > 0 ? `${casinos.length} ${labels.casinosFound}` : ""}${casinos.length > 0 && pages.length > 0 ? ` ${labels.and} ` : ""}${pages.length > 0 ? `${pages.length} ${labels.pagesFound}` : ""}`
                : `Found ${casinos.length > 0 ? `${casinos.length} ${labels.casinosFound}` : ""}${casinos.length > 0 && pages.length > 0 ? ` ${labels.and} ` : ""}${pages.length > 0 ? `${pages.length} ${labels.pagesFound}` : ""}`
              }
            </p>
          )}
        </div>

        {/* ── No results ── */}
        {totalCount === 0 && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-[#E5E8F0] p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-[#E5E8F0]" aria-hidden="true">search_off</span>
              <h2 className="font-display font-bold text-xl text-[#1b1b1c] mt-3">
                {labels.noResults} &ldquo;{q}&rdquo;
              </h2>
              <p className="text-[#787585] text-sm mt-2">{labels.noResultsHint}</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {["Pikakasino", "MGA", "Bonus", "200€"].map(hint => (
                  <Link
                    key={hint}
                    href={`/${lang}/${lang === "fi" ? "haku" : "search"}?q=${encodeURIComponent(hint)}`}
                    className="bg-[#F8F9FD] border border-[#E5E8F0] hover:border-[#2D1783] text-[#474554] text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {hint}
                  </Link>
                ))}
              </div>
            </div>

            {featured.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-lg text-[#1b1b1c] mb-4">{labels.featuredCasinos}</h2>
                <div className="space-y-3">
                  {featured.map((c, i) => <CasinoCard key={c.id} casino={c} lang={lang} rank={i + 1} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Casino results ── */}
        {casinos.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display font-bold text-lg text-[#1b1b1c] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2D1783] text-[20px]" aria-hidden="true">casino</span>
              {labels.casinosSection}
              <span className="text-sm font-normal text-[#787585]">({casinos.length})</span>
            </h2>
            <div className="space-y-3">
              {casinos.map((casino, i) => (
                <div key={casino.id} className="relative">
                  {/* Highlight casino name in search context */}
                  {casino.name.toLowerCase().includes(q.toLowerCase()) && (
                    <div className="absolute top-3 right-3 z-10 bg-[#FFD700]/20 text-[#775900] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <HighlightMatch text={casino.name} query={q} />
                    </div>
                  )}
                  <CasinoCard casino={casino} lang={lang} rank={i + 1} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Pages results ── */}
        {pages.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-lg text-[#1b1b1c] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2D1783] text-[20px]" aria-hidden="true">article</span>
              {labels.pagesSection}
              <span className="text-sm font-normal text-[#787585]">({pages.length})</span>
            </h2>
            <div className="space-y-2">
              {pages.map(page => (
                <Link
                  key={page.id}
                  href={`/${lang}/${page.slug}`}
                  className="block bg-white rounded-2xl border border-[#E5E8F0] hover:border-[#2D1783] px-5 py-4 transition-colors group"
                >
                  <h3 className="font-semibold text-[#1b1b1c] group-hover:text-[#2D1783] transition-colors">
                    <HighlightMatch text={page.title} query={q} />
                  </h3>
                  {page.excerpt && (
                    <p className="text-sm text-[#787585] mt-1 line-clamp-2">{page.excerpt}</p>
                  )}
                  <span className="text-xs text-[#2D1783] font-semibold mt-2 inline-flex items-center gap-1">
                    {labels.visitCasino}
                    <span className="material-symbols-outlined text-[12px]" aria-hidden="true">arrow_forward</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
