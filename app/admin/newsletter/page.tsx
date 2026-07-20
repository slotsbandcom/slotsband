import { getNewsletterSubscribers } from "@/lib/supabase/queries"
import AdminNewsletterPage from "./newsletter-client"

export default async function NewsletterPage() {
  const rows = await getNewsletterSubscribers()

  // Map Supabase rows to the shape the client component expects
  const subscribers = rows.map((r: any) => ({
    id: r.id,
    email: r.email,
    lang: r.lang ?? "fi",
    date: r.subscribed_at?.slice(0, 10) ?? "",
    status: (r.is_active ? "active" : "unsubscribed") as "active" | "unsubscribed",
  }))

  return <AdminNewsletterPage subscribers={subscribers} />
}
