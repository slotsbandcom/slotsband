import Link from "next/link"
import type { Lang } from "@/lib/types"

const LABELS: Record<Lang, { home: string; title: string; body: string }> = {
  fi: {
    home: "Etusivu",
    title: "Käyttöehdot",
    body: "Käyttöehtomme ovat parhaillaan päivitettävänä. Palaa pian uudelleen.",
  },
  en: {
    home: "Home",
    title: "Terms & Conditions",
    body: "Our terms and conditions are currently being updated. Please check back soon.",
  },
  uk: {
    home: "Home",
    title: "Terms & Conditions",
    body: "Our terms and conditions are currently being updated. Please check back soon.",
  },
}

export default function TermsPage({ params }: { params: { lang: string } }) {
  const lang = (params.lang as Lang) || "fi"
  const c = LABELS[lang] ?? LABELS.fi

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <div className="bg-white border-b border-[#E5E8F0]">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 pt-6 pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#787585] mb-5">
            <Link href={`/${lang}`} className="hover:text-[#2D1783] transition-colors">{c.home}</Link>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">chevron_right</span>
            <span className="text-[#2D1783] font-semibold">{c.title}</span>
          </nav>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-[#1b1b1c]">{c.title}</h1>
        </div>
      </div>
      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-2xl border border-[#E5E8F0] p-6 md:p-10 text-center">
          <span className="material-symbols-outlined text-[48px] text-[#E5E8F0] block mb-3" aria-hidden="true">description</span>
          <p className="text-[#787585]">{c.body}</p>
        </div>
      </div>
    </div>
  )
}
