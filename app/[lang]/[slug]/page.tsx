import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { createBuildClient } from "@/lib/supabase/build-client"
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

async function getBlogPost(lang: Lang, slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const col = lang === "fi" ? "slug_fi" : lang === "en" ? "slug_en" : "slug_uk"
  const { data } = await supabase.from("blog_posts").select("*").eq(col, slug).eq("is_active", true).single()
  return data as BlogPost | null
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

  const canonical = `${SITE_URL}/${lang}/${slug}`

  return {
    title,
    description: desc ?? undefined,
    openGraph: {
      title: title ?? undefined,
      description: desc ?? undefined,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
    alternates: {
      canonical,
      languages: {
        fi:       `${SITE_URL}/fi/${post.slug_fi}`,
        en:       `${SITE_URL}/en/${post.slug_en || post.slug_fi}`,
        "en-GB":  `${SITE_URL}/uk/${post.slug_uk || post.slug_fi}`,
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

  const post = await getBlogPost(lang, slug)
  if (!post) notFound()

  const title = lang === "fi" ? post.title_fi
    : lang === "en" ? (post.title_en ?? post.title_fi)
    : (post.title_uk ?? post.title_fi)

  const content = lang === "fi" ? post.content_fi
    : lang === "en" ? post.content_en
    : post.content_uk

  const blankTranslation = !content

  const pubDate = formatDate(post.published_at, lang)

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

      {/* Hero */}
      <div className="bg-white border-b border-[#E5E8F0]">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 pt-6 pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#787585] mb-4">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">
              {lang === "fi" ? "Etusivu" : "Home"}
            </Link>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <Link href={`/${lang}/blogi`} className="hover:text-[#2D1783] transition-colors">Blog</Link>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#2D1783] font-semibold truncate max-w-[200px]">{title}</span>
          </nav>

          {post.featured_image_url && (
            <div className="rounded-2xl overflow-hidden mb-6 border border-[#E5E8F0]">
              <img src={post.featured_image_url} alt={title ?? ""} className="w-full aspect-video object-cover" />
            </div>
          )}

          <h1 className="font-display font-bold text-3xl md:text-4xl text-[#1b1b1c] mb-3">{title}</h1>

          {pubDate && (
            <p className="text-sm text-[#787585] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              {pubDate}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-8">
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
            <div
              className="blog-content prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content! }}
            />
          </div>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link href={`/${lang}/blogi`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2D1783] hover:underline">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {lang === "fi" ? "Takaisin blogiin" : "Back to Blog"}
          </Link>
        </div>
      </div>
    </div>
  )
}
