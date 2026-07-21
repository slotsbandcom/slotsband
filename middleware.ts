import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const VALID_LANGS = ["fi", "en", "uk"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only intercept the bare root path.
  if (pathname !== "/") return

  // 1. Cookie preference (set when user picks a language)
  const cookie = request.cookies.get("slotsband-lang")?.value
  if (cookie && VALID_LANGS.includes(cookie)) {
    return NextResponse.redirect(new URL(`/${cookie}`, request.url))
  }

  // 2. Accept-Language header fallback
  const accept = request.headers.get("accept-language") ?? ""
  if (/\bfi\b/i.test(accept)) return NextResponse.redirect(new URL("/fi", request.url))
  if (/\ben[-_]GB\b/i.test(accept)) return NextResponse.redirect(new URL("/uk", request.url))

  // No preference → let the language picker page render.
}

export const config = {
  matcher: "/",
}
