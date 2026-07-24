import type { Metadata } from "next"
import { TaxonomyTermPage } from "@/components/taxonomy-term-page"
import {
  resolveLang,
  buildTermStaticParams,
  buildTermMetadata,
  getTermData,
} from "@/lib/taxonomy-page-helpers"

export const revalidate = 3600

const TAX = "vendor"
interface Props { params: Promise<{ lang: string; slug: string }> }

export async function generateStaticParams() {
  return buildTermStaticParams(TAX)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  return buildTermMetadata(TAX, resolveLang(lang), slug)
}

export default async function Page({ params }: Props) {
  const { lang, slug } = await params
  const resolvedLang = resolveLang(lang)
  const { term, casinos } = await getTermData(TAX, slug, resolvedLang)
  return <TaxonomyTermPage taxonomy={TAX} lang={resolvedLang} term={term} casinos={casinos} />
}
