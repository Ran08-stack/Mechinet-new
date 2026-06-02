-- Baseline: helper functions, auth trigger, and all RLS policies — extracted verbatim
-- from the live DB (project jlliayuelzvmqxvwdihr) on 2026-06-02 to bring the unversioned
-- security surface under version control.
--
-- SAFETY: policies are created only IF NOT EXISTS (via guards), so applying this to the
-- existing production DB is a guaranteed no-op. It recreates the full security baseline
-- on a fresh/branch DB. Functions use CREATE OR REPLACE (identical definitions).
--
-- The critical invariant captured here: org A can never read org B's data, because every
-- tenant table is gated by `organization_id = get_user_organization_id()`, with a
-- council read overlay via `is_council_admin()`. Do not weaken these.

-- ============================================================
-- Helper functions (SECURITY DEFINER — bypass RLS to avoid recursion)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_organization_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE SECURITY DEFINER
AS $function$
  SELECT organization_id FROM public.users WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_council_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'council_admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$function$;

-- Trigger: create a public.users row when an auth user is created.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Enable RLS on all tenant tables (idempotent)
-- ============================================================
ALTER TABLE public.academies              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_coords            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.council_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_evaluations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_role_labels        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_roles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policies (created only if missing — no-op on existing prod)
-- ============================================================
DO $$ BEGIN

-- academies
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='academies' AND policyname='academies_council_all') THEN
  CREATE POLICY "academies_council_all" ON public.academies FOR ALL USING (is_council_admin()) WITH CHECK (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='academies' AND policyname='academies_member_read') THEN
  CREATE POLICY "academies_member_read" ON public.academies FOR SELECT USING (id IN (
    SELECT o.academy_id FROM organizations o JOIN users u ON u.organization_id = o.id WHERE u.id = auth.uid())); END IF;

-- audit_log
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audit_log' AND policyname='audit_insert_council') THEN
  CREATE POLICY "audit_insert_council" ON public.audit_log FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'council_admin')); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audit_log' AND policyname='audit_read_council') THEN
  CREATE POLICY "audit_read_council" ON public.audit_log FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'council_admin')); END IF;

-- candidate_events
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='candidate_events' AND policyname='anon_insert_form_submitted') THEN
  CREATE POLICY "anon_insert_form_submitted" ON public.candidate_events FOR INSERT
    WITH CHECK (type = 'form_submitted' AND actor_id IS NULL AND EXISTS (
      SELECT 1 FROM candidates c WHERE c.id = candidate_events.candidate_id AND c.organization_id = candidate_events.organization_id)); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='candidate_events' AND policyname='candidate_events_insert_own_org') THEN
  CREATE POLICY "candidate_events_insert_own_org" ON public.candidate_events FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='candidate_events' AND policyname='candidate_events_select_own_org') THEN
  CREATE POLICY "candidate_events_select_own_org" ON public.candidate_events FOR SELECT
    USING (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='candidate_events' AND policyname='council_read_all_candidate_events') THEN
  CREATE POLICY "council_read_all_candidate_events" ON public.candidate_events FOR SELECT USING (is_council_admin()); END IF;

-- candidates
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='candidates' AND policyname='candidates_org_access') THEN
  CREATE POLICY "candidates_org_access" ON public.candidates FOR ALL USING (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='candidates' AND policyname='candidates_public_insert') THEN
  CREATE POLICY "candidates_public_insert" ON public.candidates FOR INSERT WITH CHECK (true); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='candidates' AND policyname='council_admin_select_candidates') THEN
  CREATE POLICY "council_admin_select_candidates" ON public.candidates FOR SELECT TO authenticated USING (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='candidates' AND policyname='council_read_all_candidates') THEN
  CREATE POLICY "council_read_all_candidates" ON public.candidates FOR SELECT USING (is_council_admin()); END IF;

-- city_coords
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='city_coords' AND policyname='city_coords_read_all') THEN
  CREATE POLICY "city_coords_read_all" ON public.city_coords FOR SELECT TO authenticated USING (true); END IF;

-- council_settings
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='council_settings' AND policyname='council_settings_read_all') THEN
  CREATE POLICY "council_settings_read_all" ON public.council_settings FOR SELECT TO authenticated USING (true); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='council_settings' AND policyname='council_settings_write_council') THEN
  CREATE POLICY "council_settings_write_council" ON public.council_settings FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'council_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'council_admin')); END IF;

-- forms
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='forms' AND policyname='council_admin_select_forms') THEN
  CREATE POLICY "council_admin_select_forms" ON public.forms FOR SELECT TO authenticated USING (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='forms' AND policyname='council_read_all_forms') THEN
  CREATE POLICY "council_read_all_forms" ON public.forms FOR SELECT USING (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='forms' AND policyname='forms_org_access') THEN
  CREATE POLICY "forms_org_access" ON public.forms FOR ALL USING (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='forms' AND policyname='forms_public_read') THEN
  CREATE POLICY "forms_public_read" ON public.forms FOR SELECT USING (is_active = true); END IF;

-- interview_evaluations
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='interview_evaluations' AND policyname='interview_evaluations_delete_own_org') THEN
  CREATE POLICY "interview_evaluations_delete_own_org" ON public.interview_evaluations FOR DELETE USING (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='interview_evaluations' AND policyname='interview_evaluations_insert_own_org') THEN
  CREATE POLICY "interview_evaluations_insert_own_org" ON public.interview_evaluations FOR INSERT WITH CHECK (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='interview_evaluations' AND policyname='interview_evaluations_select_own_org') THEN
  CREATE POLICY "interview_evaluations_select_own_org" ON public.interview_evaluations FOR SELECT USING (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='interview_evaluations' AND policyname='interview_evaluations_update_own_org') THEN
  CREATE POLICY "interview_evaluations_update_own_org" ON public.interview_evaluations FOR UPDATE USING (organization_id = get_user_organization_id()); END IF;

-- interviews
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='interviews' AND policyname='council_read_all_interviews') THEN
  CREATE POLICY "council_read_all_interviews" ON public.interviews FOR SELECT USING (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='interviews' AND policyname='interviews_delete_own_org') THEN
  CREATE POLICY "interviews_delete_own_org" ON public.interviews FOR DELETE USING (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='interviews' AND policyname='interviews_insert_own_org') THEN
  CREATE POLICY "interviews_insert_own_org" ON public.interviews FOR INSERT WITH CHECK (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='interviews' AND policyname='interviews_select_own_org') THEN
  CREATE POLICY "interviews_select_own_org" ON public.interviews FOR SELECT USING (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='interviews' AND policyname='interviews_update_own_org') THEN
  CREATE POLICY "interviews_update_own_org" ON public.interviews FOR UPDATE USING (organization_id = get_user_organization_id()); END IF;

-- movements
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='movements' AND policyname='movements_read_all') THEN
  CREATE POLICY "movements_read_all" ON public.movements FOR SELECT USING (true); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='movements' AND policyname='movements_write_council') THEN
  CREATE POLICY "movements_write_council" ON public.movements FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'council_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'council_admin')); END IF;

-- org_role_labels
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='org_role_labels' AND policyname='org_admin_manage_role_labels') THEN
  CREATE POLICY "org_admin_manage_role_labels" ON public.org_role_labels FOR ALL
    USING (organization_id = get_user_organization_id() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = ANY (ARRAY['admin','org_admin'])))
    WITH CHECK (organization_id = get_user_organization_id() AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = ANY (ARRAY['admin','org_admin']))); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='org_role_labels' AND policyname='org_members_read_role_labels') THEN
  CREATE POLICY "org_members_read_role_labels" ON public.org_role_labels FOR SELECT
    USING (organization_id = get_user_organization_id() OR is_council_admin()); END IF;

-- org_roles
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='org_roles' AND policyname='council_see_all_org_roles') THEN
  CREATE POLICY "council_see_all_org_roles" ON public.org_roles FOR SELECT USING (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='org_roles' AND policyname='users_see_own_org_roles') THEN
  CREATE POLICY "users_see_own_org_roles" ON public.org_roles FOR SELECT USING (organization_id = get_user_organization_id()); END IF;

-- organizations
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='organizations' AND policyname='council_admin_select_organizations') THEN
  CREATE POLICY "council_admin_select_organizations" ON public.organizations FOR SELECT TO authenticated USING (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='organizations' AND policyname='council_insert_organizations') THEN
  CREATE POLICY "council_insert_organizations" ON public.organizations FOR INSERT WITH CHECK (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='organizations' AND policyname='council_read_all_organizations') THEN
  CREATE POLICY "council_read_all_organizations" ON public.organizations FOR SELECT USING (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='organizations' AND policyname='users_see_own_org') THEN
  CREATE POLICY "users_see_own_org" ON public.organizations FOR SELECT USING (id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='organizations' AND policyname='users_update_own_org') THEN
  CREATE POLICY "users_update_own_org" ON public.organizations FOR UPDATE
    USING (id = get_user_organization_id()) WITH CHECK (id = get_user_organization_id()); END IF;

-- pipeline_stages
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pipeline_stages' AND policyname='council_admin_select_pipeline_stages') THEN
  CREATE POLICY "council_admin_select_pipeline_stages" ON public.pipeline_stages FOR SELECT TO authenticated USING (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pipeline_stages' AND policyname='pipeline_stages_org_access') THEN
  CREATE POLICY "pipeline_stages_org_access" ON public.pipeline_stages FOR ALL USING (organization_id = get_user_organization_id()); END IF;

-- users
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='council_read_all_users') THEN
  CREATE POLICY "council_read_all_users" ON public.users FOR SELECT USING (is_council_admin()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_see_own_org_members') THEN
  CREATE POLICY "users_see_own_org_members" ON public.users FOR SELECT USING (organization_id = get_user_organization_id()); END IF;
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_update_own_profile') THEN
  CREATE POLICY "users_update_own_profile" ON public.users FOR UPDATE USING (id = auth.uid()); END IF;

END $$;
