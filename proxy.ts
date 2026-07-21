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
    const accept = request.headers.get("accept-language") ?? ""
    if (/\bfi\b/i.test(accept)) return NextResponse.redirect(new URL("/fi", request.url))
    if (/\ben[-_]GB\b/i.test(accept)) return NextResponse.redirect(new URL("/uk", request.url))
    // Default fallback — always land on Finnish homepage, never a blank page.
    return NextResponse.redirect(new URL("/fi", request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
