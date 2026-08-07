import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse, type NextRequest } from "next/server"

const VALID_LANGS = ["fi", "en", "uk"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Surface the current locale as a request header — not-found.tsx has no
  // access to the [lang] route param, so it reads this instead.
  const langMatch = pathname.match(/^\/(fi|en|uk)(?:\/|$)/)
  request.headers.set("x-slotsband-lang", langMatch ? langMatch[1] : "fi")

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

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
