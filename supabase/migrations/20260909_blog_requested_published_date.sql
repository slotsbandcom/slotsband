-- Lets an editor propose a publish date when submitting/staging an article.
-- Kept separate from published_at (which editors still can't set directly,
-- per 20260901_blog_review_workflow.sql) so an editor can never make a date
-- go live without going through admin approval — approval copies this value
-- into published_at and clears it.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS requested_published_at timestamptz;
