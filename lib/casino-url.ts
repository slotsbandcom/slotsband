import type { Lang } from "./types"

export function getCasinoUrl(lang: Lang, slug: string): string {
  if (lang === "fi") return `/fi/nettikasinot/${slug}`
  return `/${lang}/online-casinos/${slug}`
}

export function getCasinoListUrl(lang: Lang): string {
  if (lang === "fi") return `/fi/nettikasinot`
  return `/${lang}/online-casinos`
}
