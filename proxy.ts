import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse, type NextRequest } from "next/server"

const VALID_LANGS = ["fi", "en", "uk"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Language redirect for bare root — runs before Supabase session refresh.
  if (pathname === "/") {
    const cookie = request.cookies.get("slotsband-lang")?.value
    if (cookie && VALID_LANGS.includes(cookie)) {
      return NextResponse.redirect(new URL(`/${cookie}`, request.url))
    }
    // No cookie preference — let the language picker page at / render.
    // Client-side localStorage check in app/page.tsx handles auto-redirect
    // for returning users who saved a preference.
    return NextResponse.next()
  }

  return await updateSession(request)
}

// Only the routes that actually need it. The proxy runs as a Vercel Function
// *before* the CDN cache, so matching every public page made each request
// (bots included) cost a function invocation even when the page itself was
// cached. Public pages don't read the Supabase session at all.
export const config = {
  matcher: ["/", "/admin/:path*", "/api/admin/:path*"],
}
