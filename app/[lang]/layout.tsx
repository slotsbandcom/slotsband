import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { Lang } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getRouteSlugsByLang, type RouteSlugMap } from "@/lib/supabase/route-slugs"

interface LangLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export async function generateStaticParams() {
  return [{ lang: "fi" }, { lang: "uk" }, { lang: "en" }]
}

// Every public page under [lang] is ISR: served from the CDN, regenerated at
// most hourly, and purged right away after admin edits (revalidatePublicSite).
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const langMap: Record<string, string> = {
    fi: "fi_FI",
    uk: "en_GB",
    en: "en_US",
  }
  return {
    alternates: {
      languages: {
        "fi": "/fi",
        "en": "/en",
        "en-GB": "/uk",
      },
    },
    openGraph: {
      locale: langMap[lang] ?? "fi_FI",
    },
  }
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params
  // Anything that isn't a real language (/wp-login.php, /.env, …) is a 404,
  // not a full homepage render.
  if (!["fi", "en", "uk"].includes(lang)) notFound()
  const safeLang = lang as Lang

  const [fiSlugs, enSlugs, ukSlugs] = await Promise.all([
    getRouteSlugsByLang("fi"),
    getRouteSlugsByLang("en"),
    getRouteSlugsByLang("uk"),
  ])
  const allLangSlugs: Record<Lang, RouteSlugMap> = { fi: fiSlugs, en: enSlugs, uk: ukSlugs }
  const navSlugs = allLangSlugs[safeLang]

  return (
    <div lang={safeLang}>
      <SiteHeader lang={safeLang} navSlugs={navSlugs} allLangSlugs={allLangSlugs} />
      {children}
      <SiteFooter lang={safeLang} navSlugs={navSlugs} />
    </div>
  )
}
