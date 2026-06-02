import { createClient } from "@/lib/supabase/server"
import { Building2 } from "lucide-react"
import { InviteAcademyButton } from "../../_components/InviteAcademyButton"
import { AcademiesTable, type BranchRow } from "../../_components/AcademiesTable"

export default async function AcademiesPage() {
  const supabase = await createClient()

  // כל השלוחות + מכינות + ספירות — RLS מאפשר ל-council_admin לקרוא הכל
  const [{ data: orgs }, { data: academies }, { data: candidates }, { data: forms }] =
    await Promise.all([
      supabase.from("organizations").select("*").order("created_at"),
      supabase.from("academies").select("id, name").order("name"),
      supabase.from("candidates").select("organization_id"),
      supabase.from("forms").select("organization_id"),
    ])

  const organizations = orgs ?? []

  const academyNameById: Record<string, string> = {}
  for (const a of academies ?? []) academyNameById[a.id] = a.name

  const candidatesByOrg: Record<string, number> = {}
  for (const c of candidates ?? []) {
    if (c.organization_id)
      candidatesByOrg[c.organization_id] =
        (candidatesByOrg[c.organization_id] ?? 0) + 1
  }

  const formsByOrg: Record<string, number> = {}
  for (const f of forms ?? []) {
    if (f.organization_id)
      formsByOrg[f.organization_id] = (formsByOrg[f.organization_id] ?? 0) + 1
  }

  const rows: BranchRow[] = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    academyName: org.academy_id ? academyNameById[org.academy_id] ?? null : null,
    city: org.city,
    candidates: candidatesByOrg[org.id] ?? 0,
    forms: formsByOrg[org.id] ?? 0,
    createdAt: org.created_at,
  }))

  const academyNames = (academies ?? []).map((a) => a.name)

  return (
    <div className="pb-14">
      <div className="flex items-end justify-between gap-6 px-7 pb-2 pt-7">
        <div>
          <h1 className="m-0 text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
            מכינות ושלוחות
          </h1>
          <p className="mt-2 text-[15px] text-fg-muted">
            {rows.length} שלוחות ב-{academyNames.length} מכינות.
          </p>
        </div>
        <InviteAcademyButton />
      </div>

      <div className="px-7 pt-4">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-8 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-lg border border-line bg-[var(--bg-subtle)] text-fg-muted">
              <Building2 className="h-6 w-6" />
            </span>
            <p className="m-0 text-[13px] text-fg-muted">אין שלוחות עדיין</p>
          </div>
        ) : (
          <AcademiesTable rows={rows} academyNames={academyNames} />
        )}
      </div>
    </div>
  )
}
