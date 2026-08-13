-- Bonushunt predictions: store the guessed winning game, and let sessions
-- record the real final result + the auto/manually picked winning prediction.
--
-- bonushunt_predictions already existed (RLS enabled, service_role only —
-- see enable_rls.sql §5) but nothing in the app read or wrote it yet. The
-- admin Bonushunt section and the public "Tee ennuste" form now do, so we
-- add a public SELECT policy here (writes still go exclusively through
-- adminDb()/service role in the API routes, never directly from anon).

ALTER TABLE public.bonushunt_predictions
  ADD COLUMN IF NOT EXISTS predicted_game TEXT;

CREATE INDEX IF NOT EXISTS bonushunt_predictions_session_id_idx
  ON public.bonushunt_predictions (session_id);

CREATE POLICY "public read" ON public.bonushunt_predictions FOR SELECT USING (true);

ALTER TABLE public.bonushunt_sessions
  ADD COLUMN IF NOT EXISTS final_result NUMERIC,
  ADD COLUMN IF NOT EXISTS winner_prediction_id UUID REFERENCES public.bonushunt_predictions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS result_entered_at TIMESTAMPTZ;
