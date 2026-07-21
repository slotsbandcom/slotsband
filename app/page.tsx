import { redirect } from "next/navigation"

// The proxy (proxy.ts) handles language detection and redirects /
// based on the slotsband-lang cookie or Accept-Language header.
// This server component is the fallback in case proxy is bypassed.
export default function RootPage() {
  redirect("/fi")
}
