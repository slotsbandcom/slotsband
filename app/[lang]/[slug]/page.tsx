import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { createBuildClient } from "@/lib/supabase/build-client"
import { CasinoLogo } from "@/components/casino-logo"
import type { Lang } from "@/lib/types"

const VALID_LANGS: Lang[] = ["fi", "en", "uk"]
const SITE_URL = "https://slotsband.com"

interface BlogPost {
  id: string
  slug_fi: string; slug_en: string; slug_uk: string
  title_fi: string; title_en: string | null; title_uk: string | null
  content_fi: string | null; content_en: string | null; content_uk: string | null
  excerpt_fi: string | null; excerpt_en: string | null; excerpt_uk: string | null
  featured_image_url: string | null
  meta_title_fi: string | null; meta_title_en: string | null; meta_title_uk: string | null
  meta_description_fi: string | null; meta_description_en: string | null; meta_description_uk: string | null
  published_at: string | null
  is_active: boolean
}

interface SidebarCasino {
  id: string
  slug: string
  name: string
  logo_url: string | null
  mene_slug: string
  welcome_bonus_text: string | null
  welcome_bonus_percent: number | null
  welcome_bonus_max_amount: number | null
  rating: number
}

async function getBlogPost(lang: Lang, slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const col = lang === "fi" ? "slug_fi" : lang === "en" ? "slug_en" : "slug_uk"
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq(col, slug)
    .eq("is_active", true)
    .single()
  return data as BlogPost | null
}

async function getNewestCasinos(): Promise<SidebarCasino[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("casinos")
    .select("id, slug, name, logo_url, mene_slug, welcome_bonus_text, welcome_bonus_percent, welcome_bonus_max_amount, rating")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6)
  return (data ?? []) as SidebarCasino[]
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function getBonusLabel(casino: SidebarCasino): string {
  if (casino.welcome_bonus_text) {
    const stripped = stripHtml(casino.welcome_bonus_text)
    return stripped.length > 50 ? stripped.slice(0, 48) + "…" : stripped
  }
  if (casino.welcome_bonus_percent && casino.welcome_bonus_max_amount) {
    return `${casino.welcome_bonus_percent}% up to €${casino.welcome_bonus_max_amount}`
  }
  if (casino.welcome_bonus_max_amount) return `Up to €${casino.welcome_bonus_max_amount}`
  if (casino.welcome_bonus_percent) return `${casino.welcome_bonus_percent}% bonus`
  return ""
}

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const db = createBuildClient()
  const { data } = await db.from("blog_posts").select("slug_fi, slug_en, slug_uk").eq("is_active", true)
  const paths: { lang: string; slug: string }[] = []
  for (const row of data ?? []) {
    paths.push({ lang: "fi", slug: row.slug_fi })
    if (row.slug_en) paths.push({ lang: "en", slug: row.slug_en })
    if (row.slug_uk) paths.push({ lang: "uk", slug: row.slug_uk })
  }
  return paths
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "fi") as Lang
  const post = await getBlogPost(lang, slug)
  if (!post) return {}

  const title = (lang === "fi" ? post.meta_title_fi : lang === "en" ? post.meta_title_en : post.meta_title_uk)
    ?? (lang === "fi" ? post.title_fi : lang === "en" ? (post.title_en ?? post.title_fi) : (post.title_uk ?? post.title_fi))
  const desc = (lang === "fi" ? post.meta_description_fi : lang === "en" ? post.meta_description_en : post.meta_description_uk)
    ?? (lang === "fi" ? post.excerpt_fi : lang === "en" ? post.excerpt_en : post.excerpt_uk)
    ?? undefined

  return {
    title,
    description: desc ?? undefined,
    openGraph: {
      title: title ?? undefined,
      description: desc ?? undefined,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/${lang}/${slug}`,
      languages: {
        fi:          `${SITE_URL}/fi/${post.slug_fi}`,
        en:          `${SITE_URL}/en/${post.slug_en || post.slug_fi}`,
        "en-GB":     `${SITE_URL}/uk/${post.slug_uk || post.slug_fi}`,
        "x-default": `${SITE_URL}/fi/${post.slug_fi}`,
      },
    },
  }
}

function formatDate(iso: string | null, lang: Lang) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(
    lang === "fi" ? "fi-FI" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  )
}

export default async function BlogPostPage({ params }: PageProps) {
  const { lang: rawLang, slug } = await params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "fi") as Lang

  const [post, newestCasinos] = await Promise.all([
    getBlogPost(lang, slug),
    getNewestCasinos(),
  ])
  if (!post) notFound()

  const title = lang === "fi" ? post.title_fi
    : lang === "en" ? (post.title_en ?? post.title_fi)
    : (post.title_uk ?? post.title_fi)

  const content = lang === "fi" ? post.content_fi
    : lang === "en" ? post.content_en
    : post.content_uk

  const blankTranslation = !content
  const pubDate = formatDate(post.published_at, lang)

  const sidebarHeading = lang === "fi" ? "Uusimmat kasinot" : "Newest Casinos"
  const playNow = lang === "fi" ? "Pelaa" : "Play"
  const reviewText = lang === "fi" ? "Arvostelu" : "Review"
  const backLabel = lang === "fi" ? "Takaisin blogiin" : "Back to Blog"
  const homeLabel = lang === "fi" ? "Etusivu" : "Home"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "datePublished": post.published_at,
    "publisher": { "@type": "Organization", "name": "SlotsBand" },
    ...(post.featured_image_url ? { "image": post.featured_image_url } : {}),
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero bar ── */}
      <div className="bg-white border-b border-[#E5E8F0]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 pt-6 pb-8">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#787585] mb-5">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">{homeLabel}</Link>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <Link href={`/${lang}/blogi`} className="hover:text-[#2D1783] transition-colors">Blog</Link>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#2D1783] font-semibold truncate max-w-[200px]">{title}</span>
          </nav>

          {/* Featured image — constrained height, no aspect-ratio forcing */}
          {post.featured_image_url && (
            <div className="rounded-2xl overflow-hidden mb-6 border border-[#E5E8F0]
                            max-h-[240px] md:max-h-[420px]">
              <img
                src={post.featured_image_url}
                alt={title ?? ""}
                className="w-full h-full object-cover max-h-[240px] md:max-h-[420px]"
              />
            </div>
          )}

          <h1 className="font-display font-bold text-2xl md:text-4xl text-[#1b1b1c] mb-3 leading-tight">
            {title}
          </h1>

          {pubDate && (
            <p className="text-sm text-[#787585] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              {pubDate}
            </p>
          )}
        </div>
      </div>

      {/* ── Main content + Sidebar ── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">

          {/* Article body */}
          <div className="flex-1 min-w-0">
            {blankTranslation ? (
              <div className="bg-white rounded-2xl border border-[#E5E8F0] p-10 text-center">
                <span className="material-symbols-outlined text-[48px] text-[#E5E8F0] block mb-3">translate</span>
                <h2 className="font-display font-bold text-xl text-[#1b1b1c] mb-2">
                  {lang === "fi" ? "Käännös tulossa pian" : "Translation coming soon"}
                </h2>
                <p className="text-sm text-[#787585] mb-5">
                  {lang === "fi"
                    ? "Tämä artikkeli on parhaillaan käännettävänä. Palaa pian uudelleen."
                    : "This article is being translated. Please check back soon."}
                </p>
                <Link href={`/fi/${post.slug_fi}`}
                  className="inline-flex items-center gap-2 bg-[#2D1783] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#3e2db2] transition-colors">
                  🇫🇮 {lang === "fi" ? "Lue suomeksi" : "Read in Finnish"}
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6 md:p-10">
                <div className="casino-review" dangerouslySetInnerHTML={{ __html: content! }} />
              </div>
            )}

            {/* Back link */}
            <div className="mt-6">
              <Link href={`/${lang}/blogi`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2D1783] hover:underline">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                {backLabel}
              </Link>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-[300px] flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <div className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-[#E5E8F0] bg-[#F8F9FD]">
                  <span className="material-symbols-outlined text-[#2D1783] text-[18px]">casino</span>
                  <h2 className="font-display font-bold text-sm text-[#1b1b1c]">{sidebarHeading}</h2>
                </div>

                <div className="divide-y divide-[#F0F1F5]">
                  {newestCasinos.map(casino => {
                    const bonus = getBonusLabel(casino)
                    return (
                      <div key={casino.id} className="flex items-center gap-3 px-4 py-3.5">
                        {/* Logo */}
                        <CasinoLogo
                          src={casino.logo_url}
                          name={casino.name}
                          size={44}
                          className="w-11 h-11 rounded-xl border border-[#E5E7EB] bg-white flex-shrink-0"
                        />

                        {/* Name + bonus */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1b1b1c] text-sm leading-tight truncate">{casino.name}</p>
                          {bonus && (
                            <p className="text-[10px] text-[#787585] leading-snug mt-0.5 line-clamp-2">{bonus}</p>
                          )}
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <a
                            href={`/${lang}/mene/${casino.mene_slug}`}
                            rel="nofollow sponsored noopener noreferrer"
                            target="_blank"
                            className="block text-[10px] font-bold text-white bg-[#2D1783] hover:bg-[#3e2db2] px-2.5 py-1.5 rounded-lg text-center transition-colors whitespace-nowrap"
                          >
                            {playNow}
                          </a>
                          <Link
                            href={`/${lang}/nettikasinot/${casino.slug}`}
                            className="block text-[10px] font-semibold text-[#474554] border border-[#E5E8F0] hover:border-[#2D1783] hover:text-[#2D1783] px-2.5 py-1.5 rounded-lg text-center transition-colors whitespace-nowrap"
                          >
                            {reviewText}
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="px-5 py-3 border-t border-[#E5E8F0]">
                  <Link href={`/${lang}/nettikasinot`}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#2D1783] hover:underline">
                    {lang === "fi" ? "Kaikki kasinot" : "All Casinos"}
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
