-- Blog editor approval workflow: an "editor" role account can create/edit
-- articles, but nothing they touch goes live (or changes what's already
-- live) until an admin approves it.
--
-- review_status: 'approved' (default, no pending change) | 'pending'
-- (awaiting admin review) | 'rejected' (admin sent it back with a note).
--
-- pending_data holds a staged copy of the editable fields when an editor
-- edits an ALREADY-LIVE post — the live columns/is_active stay untouched
-- until approval, so the public site never shows an unreviewed edit.
-- New (not-yet-live) posts are edited in place instead, since there's no
-- live version to protect.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'approved'
    CHECK (review_status IN ('approved', 'pending', 'rejected')),
  ADD COLUMN IF NOT EXISTS pending_data jsonb,
  ADD COLUMN IF NOT EXISTS review_note text,
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id);
