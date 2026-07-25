"use client"
import { useParams } from "next/navigation"
import { PageForm } from "../../_PageForm"

export default function EditPagePage() {
  const { slug } = useParams<{ slug: string }>()
  return <PageForm pageSlug={decodeURIComponent(slug)} />
}
