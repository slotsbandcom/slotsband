import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { NavigationProgress } from "@/components/navigation-progress"
import { getRouteSlugsByLang, type RouteSlugMap } from "@/lib/supabase/route-slugs"

interface LangLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export async function generateStaticParams() {
  return [{ lang: "fi" }, { lang: "uk" }, { lang: "en" }]
}

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
  const safeLang = (["fi", "en", "uk"].includes(lang) ? lang : "fi") as Lang

  const [fiSlugs, enSlugs, ukSlugs] = await Promise.all([
    getRouteSlugsByLang("fi"),
    getRouteSlugsByLang("en"),
    getRouteSlugsByLang("uk"),
  ])
  const allLangSlugs: Record<Lang, RouteSlugMap> = { fi: fiSlugs, en: enSlugs, uk: ukSlugs }
  const navSlugs = allLangSlugs[safeLang]

  return (
    <div lang={safeLang}>
      <NavigationProgress />
      <SiteHeader lang={safeLang} navSlugs={navSlugs} allLangSlugs={allLangSlugs} />
      {children}
      <SiteFooter lang={safeLang} navSlugs={navSlugs} />
    </div>
  )
}
