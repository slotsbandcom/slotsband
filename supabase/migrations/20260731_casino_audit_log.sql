-- Casino audit log: who changed what, and when, on the casinos table.
-- No FK to casinos(id) on purpose — history must survive casino deletion.
CREATE TABLE IF NOT EXISTS public.casino_audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  casino_id    UUID NOT NULL,
  casino_name  TEXT,
  casino_slug  TEXT,
  action       TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  actor_id     UUID,
  actor_email  TEXT,
  changes      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS casino_audit_log_casino_id_idx
  ON public.casino_audit_log (casino_id, created_at DESC);

-- Admin-only table — all reads/writes go through the service-role client in
-- /api/admin/casinos routes, same pattern as newsletter_subscribers /
-- affiliate_clicks. No anon/authenticated policies needed.
ALTER TABLE public.casino_audit_log ENABLE ROW LEVEL SECURITY;
