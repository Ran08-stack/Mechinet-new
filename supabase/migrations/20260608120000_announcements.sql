-- Announcements: council publishes one-way broadcasts; org members read those
-- targeted at them. Targeting: 'all' | 'movement' (orgs whose movement_id matches)
-- | 'selected' (explicit org set in announcement_targets). announcement_reads holds
-- per-user read receipts. Follows the council-all + org-read-own two-policy pattern
-- from baseline_rls_and_helpers (is_council_admin() / get_user_organization_id()).
-- Idempotent: tables IF NOT EXISTS, policies guarded — safe no-op on existing DB.

CREATE TABLE IF NOT EXISTS public.announcements (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text NOT NULL,
  body               text NOT NULL,
  target_type        text NOT NULL DEFAULT 'all' CHECK (target_type IN ('all','movement','selected')),
  target_movement_id uuid REFERENCES public.movements(id) ON DELETE CASCADE,
  created_by         uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcement_targets (
  announcement_id    uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  organization_id    uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  PRIMARY KEY (announcement_id, organization_id)
);

CREATE TABLE IF NOT EXISTS public.announcement_reads (
  announcement_id    uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id            uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at            timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS announcements_movement_idx     ON public.announcements (target_movement_id);
CREATE INDEX IF NOT EXISTS announcements_created_at_idx    ON public.announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS announcement_targets_org_idx   ON public.announcement_targets (organization_id);
CREATE INDEX IF NOT EXISTS announcement_reads_user_idx    ON public.announcement_reads (user_id);

ALTER TABLE public.announcements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads   ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='announcements' AND policyname='announcements_council_all') THEN
    CREATE POLICY "announcements_council_all" ON public.announcements FOR ALL TO authenticated
      USING (is_council_admin()) WITH CHECK (is_council_admin()); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='announcements' AND policyname='announcements_member_read') THEN
    CREATE POLICY "announcements_member_read" ON public.announcements FOR SELECT TO authenticated
      USING (
        target_type = 'all'
        OR (target_type = 'movement' AND target_movement_id = (
              SELECT o.movement_id FROM organizations o WHERE o.id = get_user_organization_id()))
        OR (target_type = 'selected' AND EXISTS (
              SELECT 1 FROM announcement_targets t
              WHERE t.announcement_id = announcements.id
                AND t.organization_id = get_user_organization_id()))
      ); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='announcement_targets' AND policyname='announcement_targets_council_all') THEN
    CREATE POLICY "announcement_targets_council_all" ON public.announcement_targets FOR ALL TO authenticated
      USING (is_council_admin()) WITH CHECK (is_council_admin()); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='announcement_targets' AND policyname='announcement_targets_member_read') THEN
    CREATE POLICY "announcement_targets_member_read" ON public.announcement_targets FOR SELECT TO authenticated
      USING (organization_id = get_user_organization_id()); END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='announcement_reads' AND policyname='announcement_reads_own') THEN
    CREATE POLICY "announcement_reads_own" ON public.announcement_reads FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); END IF;

END $$;
