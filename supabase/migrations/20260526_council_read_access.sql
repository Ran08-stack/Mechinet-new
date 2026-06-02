-- מאפשר ל-council_admin SELECT על הטבלאות הנדרשות למסך המועצה.
-- council_admin הוא משתמש ללא organization_id ולכן ה-policies הקיימות
-- (שמסוננות לפי organization) חוסמות אותו. כאן מוסיפים policy מפורש לקריאה.
--
-- הסתמכות על הפונקציה is_council_admin() שנוצרה ב-migration
-- add_council_role_architecture (raises if missing).

-- ORGANIZATIONS
DROP POLICY IF EXISTS "council_admin_select_organizations" ON public.organizations;
CREATE POLICY "council_admin_select_organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (public.is_council_admin());

-- CANDIDATES
DROP POLICY IF EXISTS "council_admin_select_candidates" ON public.candidates;
CREATE POLICY "council_admin_select_candidates"
  ON public.candidates FOR SELECT
  TO authenticated
  USING (public.is_council_admin());

-- FORMS
DROP POLICY IF EXISTS "council_admin_select_forms" ON public.forms;
CREATE POLICY "council_admin_select_forms"
  ON public.forms FOR SELECT
  TO authenticated
  USING (public.is_council_admin());

-- PIPELINE_STAGES
DROP POLICY IF EXISTS "council_admin_select_pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "council_admin_select_pipeline_stages"
  ON public.pipeline_stages FOR SELECT
  TO authenticated
  USING (public.is_council_admin());
