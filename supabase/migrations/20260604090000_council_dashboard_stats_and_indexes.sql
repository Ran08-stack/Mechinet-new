-- Phase 3: scale — replace the council dashboard's unbounded "load every candidate
-- nationwide" with a server-side aggregate, plus supporting indexes.
-- council_dashboard_stats() returns per-org totals (count + accepted count). It is
-- SECURITY DEFINER but guarded to council_admin only (returns nothing otherwise).

CREATE OR REPLACE FUNCTION public.council_dashboard_stats()
  RETURNS TABLE (organization_id uuid, total bigint, accepted bigint)
  LANGUAGE plpgsql
  STABLE SECURITY DEFINER
AS $function$
BEGIN
  IF NOT public.is_council_admin() THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT c.organization_id,
           count(*)::bigint AS total,
           count(*) FILTER (
             WHERE c.stage ILIKE ANY (ARRAY['%accepted%','%התקבל%','%מתקבל%','%אושר%'])
           )::bigint AS accepted
    FROM public.candidates c
    WHERE c.organization_id IS NOT NULL
    GROUP BY c.organization_id;
END;
$function$;

CREATE INDEX IF NOT EXISTS candidates_org_stage_idx ON public.candidates (organization_id, stage);
CREATE INDEX IF NOT EXISTS organizations_status_idx ON public.organizations (status);
CREATE INDEX IF NOT EXISTS organizations_academy_idx ON public.organizations (academy_id);
