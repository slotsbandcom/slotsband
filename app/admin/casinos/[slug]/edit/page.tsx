"use client"

import { useParams } from "next/navigation"
import { CasinoForm } from "../../_CasinoForm"

export default function CasinoEditPage() {
  const { slug } = useParams<{ slug: string }>()
  return <CasinoForm slug={slug} />
}
