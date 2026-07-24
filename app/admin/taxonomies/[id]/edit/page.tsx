import { TermFormPage } from "../../_term-form"

export default async function EditTermPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TermFormPage termId={id} />
}
