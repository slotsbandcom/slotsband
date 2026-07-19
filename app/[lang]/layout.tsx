import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

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
  return (
    <div lang={safeLang}>
      <SiteHeader lang={safeLang} currentPath="" />
      {children}
      <SiteFooter lang={safeLang} />
    </div>
  )
}
