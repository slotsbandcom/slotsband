import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { Lang } from "@/lib/types"

function formatDate(iso: string | null, lang: Lang) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(
    lang === "fi" ? "fi-FI" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  )
}

export async function BlogiHub({ lang }: { lang: Lang }) {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug_fi, slug_en, slug_uk, title_fi, title_en, title_uk, excerpt_fi, excerpt_en, excerpt_uk, featured_image_url, published_at")
    .eq("is_active", true)
    .order("published_at", { ascending: false, nullsFirst: false })

  const slugCol = lang === "fi" ? "slug_fi" : lang === "en" ? "slug_en" : "slug_uk"
  const titleKey = lang === "fi" ? "title_fi" : lang === "en" ? "title_en" : "title_uk"
  const excerptKey = lang === "fi" ? "excerpt_fi" : lang === "en" ? "excerpt_en" : "excerpt_uk"

  const heading = lang === "fi" ? "Blogi" : "Blog"
  const subtext = lang === "fi" ? "Kasinovinkit, uutiset ja oppaat" : "Casino tips, news and guides"
  const readMore = lang === "fi" ? "Lue lisää" : "Read more"

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <div className="bg-white border-b border-[#E5E8F0]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#787585] mb-4">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">
              {lang === "fi" ? "Etusivu" : "Home"}
            </Link>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#2D1783] font-semibold">Blog</span>
          </nav>
          <h1 className="font-display font-bold text-4xl text-[#1b1b1c] mb-2">{heading}</h1>
          <p className="text-[#787585] text-base">{subtext}</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-10">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-20 text-[#787585]">
            <span className="material-symbols-outlined text-[48px] text-[#E5E8F0] block mb-3">article</span>
            <p>{lang === "fi" ? "Ei artikkeleita vielä." : "No articles yet."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => {
              type PostRow = typeof post & Record<string, string | null>
              const p = post as PostRow
              const slug = p[slugCol] as string
              const title = (p[titleKey] ?? p.title_fi) as string
              const excerpt = p[excerptKey] as string | null
              const pubDate = formatDate(post.published_at, lang)
              return (
                <article key={post.id} className="bg-white rounded-2xl border border-[#E5E8F0] overflow-hidden flex flex-col hover:border-[#2D1783]/30 hover:shadow-md transition-all">
                  {post.featured_image_url ? (
                    <Link href={`/${lang}/${slug}`}>
                      <div className="relative w-full aspect-video overflow-hidden">
                        <Image
                          src={post.featured_image_url}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-[#2D1783]/10 to-[#2D1783]/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#2D1783]/30 text-[48px]">article</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    {pubDate && (
                      <p className="text-[10px] font-bold text-[#787585] uppercase tracking-wider mb-2">{pubDate}</p>
                    )}
                    <h2 className="font-display font-bold text-[#1b1b1c] text-base leading-snug mb-2">
                      <Link href={`/${lang}/${slug}`} className="hover:text-[#2D1783] transition-colors">
                        {title}
                      </Link>
                    </h2>
                    {excerpt && (
                      <p className="text-sm text-[#787585] line-clamp-3 flex-1 mb-4">{excerpt}</p>
                    )}
                    <Link href={`/${lang}/${slug}`}
                      className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[#2D1783] hover:underline">
                      {readMore}
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
