import type { Lang } from "@/lib/types"
import { SearchResultsPage } from "@/components/search-results-page"

interface Props {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams
  return {
    title: q ? `Search results: "${q}" | SlotsBand` : "Search | SlotsBand",
    robots: { index: false },
  }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { lang } = await params
  const { q } = await searchParams
  const safeLang = (["fi", "en", "uk"].includes(lang) ? lang : "fi") as Lang
  return <SearchResultsPage lang={safeLang} query={q ?? ""} />
}
