import { revalidatePath, revalidateTag } from "next/cache"

/**
 * Cache settings for the public-facing reads (casinos, bonuses, pages, blog,
 * taxonomy…). They read the same publicly-readable rows for every visitor,
 * so they're served from Next's data cache and the [lang] pages built from
 * them are ISR (served from Vercel's CDN, not re-rendered per request).
 *
 * Note: an unstable_cache `revalidate` also caps the revalidate of every ISR
 * page that calls it — keep this long and rely on revalidatePublicSite()
 * after admin writes for freshness.
 */
export const PUBLIC_TAG = "public"
export const PUBLIC_REVALIDATE = 3600

export function publicCache(...tags: string[]) {
  return { revalidate: PUBLIC_REVALIDATE, tags: [PUBLIC_TAG, ...tags] }
}

/**
 * Call after any admin write that changes something visible on the public
 * site. Expires every public data-cache entry (and, via the propagated tag,
 * every ISR page that read one) plus the full route cache, so the next visit
 * renders fresh content — same "shows up right away" behaviour as before the
 * pages were cached.
 */
export function revalidatePublicSite() {
  revalidateTag(PUBLIC_TAG, { expire: 0 })
  revalidatePath("/", "layout")
}
