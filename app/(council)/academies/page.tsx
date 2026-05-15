import { createClient } from "@/lib/supabase/server"
import { Building2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { InviteAcademyButton } from "../_components/InviteAcademyButton"

export default async function AcademiesPage() {
  const supabase = await createClient()

  // כל המכינות + ספירות — RLS מאפשר ל-council_admin לקרוא הכל
  const [{ data: orgs }, { data: candidates }, { data: forms }] =
    await Promise.all([
      supabase.from("organizations").select("*").order("created_at"),
      supabase.from("candidates").select("organization_id"),
      supabase.from("forms").select("organization_id"),
    ])

  const organizations = orgs ?? []

  const candidatesByOrg: Record<string, number> = {}
  for (const c of candidates ?? []) {
    if (c.organization_id)
      candidatesByOrg[c.organization_id] =
        (candidatesByOrg[c.organization_id] ?? 0) + 1
  }

  const formsByOrg: Record<string, number> = {}
  for (const f of forms ?? []) {
    if (f.organization_id)
      formsByOrg[f.organization_id] =
        (formsByOrg[f.organization_id] ?? 0) + 1
  }

  return (
    <div className="pb-14">
      <div className="flex items-end justify-between gap-6 px-7 pb-2 pt-7">
        <div>
          <h1 className="m-0 text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
            מכינות
          </h1>
          <p className="mt-2 text-[15px] text-fg-muted">
            כל {organizations.length} המכינות במערכת.
          </p>
        </div>
        <InviteAcademyButton />
      </div>

      <div className="px-7 pt-4">
        {organizations.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-8 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-lg border border-line bg-[var(--bg-subtle)] text-fg-muted">
              <Building2 className="h-6 w-6" />
            </span>
            <p className="m-0 text-[13px] text-fg-muted">
              אין מכינות עדיין
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["מכינה", "מועמדים", "טפסים", "הצטרפה"].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-fg-subtle"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr
                    key={org.id}
                    className="border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[var(--primary-soft)] text-primary">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-fg">
                          {org.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-fg-muted [font-variant-numeric:tabular-nums]">
                      {candidatesByOrg[org.id] ?? 0}
                    </td>
                    <td className="px-4 py-3.5 text-fg-muted [font-variant-numeric:tabular-nums]">
                      {formsByOrg[org.id] ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-fg-muted">
                      {formatDate(org.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
