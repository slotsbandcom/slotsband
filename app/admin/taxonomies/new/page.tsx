import { TermFormPage } from "../_term-form"

export default async function NewTermPage({
  searchParams,
}: {
  searchParams: Promise<{ taxonomy?: string }>
}) {
  const { taxonomy } = await searchParams
  return <TermFormPage termId={null} defaultTaxonomy={taxonomy} />
}
