import { createClient as createSupabaseClient } from "@supabase/supabase-js"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type BlogAuditAction = "create" | "submit" | "update" | "approve" | "reject" | "delete"
export type BlogAuditChange = { field: string; old: unknown; new: unknown }

export async function logBlogAudit(entry: {
  postId: string
  postTitle?: string | null
  postSlug?: string | null
  action: BlogAuditAction
  actorId: string
  actorEmail?: string | null
  changes?: BlogAuditChange[] | null
  note?: string | null
}) {
  try {
    await adminDb().from("blog_post_audit_log").insert({
      post_id: entry.postId,
      post_title: entry.postTitle ?? null,
      post_slug: entry.postSlug ?? null,
      action: entry.action,
      actor_id: entry.actorId,
      actor_email: entry.actorEmail ?? null,
      changes: entry.changes ?? null,
      note: entry.note ?? null,
    })
  } catch (e) {
    console.warn("[blog-audit-log]", e)
  }
}

export function diffFields(
  oldObj: Record<string, unknown> | null | undefined,
  newObj: Record<string, unknown>,
  keys: string[]
): BlogAuditChange[] {
  return keys
    .filter(k => k in newObj)
    .map(k => ({ field: k, old: oldObj?.[k] ?? null, new: newObj[k] }))
    .filter(c => JSON.stringify(c.old) !== JSON.stringify(c.new))
}
