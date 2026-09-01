import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Paths an "editor" role account is allowed to reach. Everything else under
// /admin and /api/admin is admin-only.
const EDITOR_ALLOWED_PREFIXES = ["/admin/blog", "/admin/login", "/api/admin/blog-posts", "/api/admin/me", "/api/admin/upload"]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl
  const isAdminApi = pathname.startsWith("/api/admin")

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect all /admin pages — redirect to /admin/login if unauthenticated
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  // Protect all /api/admin routes — 401 if unauthenticated
  if (isAdminApi && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Redirect authenticated users away from /admin/login
  if (pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin"
    return NextResponse.redirect(url)
  }

  // "editor" role accounts only get the Blog section — everything else
  // under /admin or /api/admin is admin-only.
  if (user) {
    const role = user.app_metadata?.role === "editor" ? "editor" : "admin"
    const isAdminArea = pathname.startsWith("/admin") || isAdminApi
    if (role === "editor" && isAdminArea && !EDITOR_ALLOWED_PREFIXES.some(p => pathname.startsWith(p))) {
      if (isAdminApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      const url = request.nextUrl.clone()
      url.pathname = "/admin/blog"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
