-- Change history for blog posts — who submitted, approved, rejected, or
-- edited what, and when. Mirrors casino_audit_log's shape/usage pattern.
CREATE TABLE IF NOT EXISTS public.blog_post_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL,
  post_title  TEXT,
  post_slug   TEXT,
  action      TEXT NOT NULL CHECK (action IN ('create', 'submit', 'update', 'approve', 'reject', 'delete')),
  actor_id    UUID,
  actor_email TEXT,
  changes     JSONB,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_post_audit_log_post_id_idx
  ON public.blog_post_audit_log (post_id, created_at DESC);

-- Admin-only table — all reads/writes go through the service-role client,
-- same pattern as casino_audit_log. No anon/authenticated policies needed.
ALTER TABLE public.blog_post_audit_log ENABLE ROW LEVEL SECURITY;
