-- Phase 1: invitations ledger — tracks each invite issued (who, which org, expiry, sent/accepted).
-- The actual invite token is owned by Supabase Auth; this is our provisioning ledger for
-- "resend" and "who hasn't activated yet". Writes happen server-side via the service-role
-- client (bypasses RLS). Reads: council (all) + org_admin (own org).

CREATE TABLE IF NOT EXISTS public.invitations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id   uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email             text NOT NULL,
  role              text NOT NULL CHECK (role IN ('org_admin','org_staff')),
  request_id        uuid,
  status            text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','accepted','expired','failed')),
  sent_at           timestamptz,
  accepted_at       timestamptz,
  expires_at        timestamptz,
  email_provider_id text,
  created_by        uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invitations_org_idx ON public.invitations (organization_id);
CREATE INDEX IF NOT EXISTS invitations_status_idx ON public.invitations (status);
CREATE INDEX IF NOT EXISTS invitations_user_idx ON public.invitations (user_id);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invitations' AND policyname='invitations_council_read') THEN
    CREATE POLICY "invitations_council_read" ON public.invitations FOR SELECT TO authenticated USING (is_council_admin()); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invitations' AND policyname='invitations_org_read') THEN
    CREATE POLICY "invitations_org_read" ON public.invitations FOR SELECT TO authenticated USING (organization_id = get_user_organization_id()); END IF;
END $$;
