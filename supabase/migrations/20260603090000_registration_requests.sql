-- Phase 2: registration_requests — academy self-service signups awaiting council approval.
-- One row per submission. Requested branches stored as JSONB:
--   [{ branch_name, city, link_org_id?, gender_policy?, religious_policy? }]
-- Inserts happen via a service-role server route (rate-limited); reads/updates: council only.

CREATE TABLE IF NOT EXISTS public.registration_requests (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_name        text NOT NULL,
  movement_id         uuid REFERENCES public.movements(id) ON DELETE SET NULL,
  existing_academy_id uuid REFERENCES public.academies(id) ON DELETE SET NULL,
  contact_name        text NOT NULL,
  contact_email       text NOT NULL,
  contact_phone       text,
  branches            jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes               text,
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by         uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at         timestamptz,
  reject_reason       text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS registration_requests_status_idx
  ON public.registration_requests (status, created_at DESC);

ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='registration_requests' AND policyname='reg_requests_council_read') THEN
    CREATE POLICY "reg_requests_council_read" ON public.registration_requests FOR SELECT TO authenticated USING (is_council_admin()); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='registration_requests' AND policyname='reg_requests_council_write') THEN
    CREATE POLICY "reg_requests_council_write" ON public.registration_requests FOR UPDATE TO authenticated USING (is_council_admin()) WITH CHECK (is_council_admin()); END IF;
END $$;
