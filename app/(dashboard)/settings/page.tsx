import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OrgSettings from "@/components/settings/OrgSettings"
import PipelineStagesEditor from "@/components/settings/PipelineStagesEditor"
import { RoleLabelsEditor } from "@/components/settings/RoleLabelsEditor"
import { SettingsTabs } from "@/components/settings/SettingsTabs"
import { Topbar } from "../_components/Topbar"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase
    .from("users")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (!userData?.organization_id) {
    return (
      <>
        <Topbar crumb="הגדרות" />
        <div className="px-3 py-4 md:px-7 md:py-7">
          <p className="text-[13px] text-fg-muted">
            לא נמצאה מכינה מחוברת לחשבון זה.
          </p>
        </div>
      </>
    )
  }

  const isAdmin =
    userData.role === "admin" || userData.role === "org_admin"

  const [{ data: org }, { data: stages }, { data: roleLabels }] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("*")
        .eq("id", userData.organization_id)
        .single(),
      supabase
        .from("pipeline_stages")
        .select("*")
        .eq("organization_id", userData.organization_id)
        .order("order_index"),
      supabase
        .from("org_role_labels")
        .select("*")
        .eq("organization_id", userData.organization_id)
        .order("name"),
    ])

  if (!org) redirect("/login")

  return (
    <>
      <Topbar crumb="הגדרות" />
      <div className="px-3 pb-10 pt-4 md:px-7 md:pb-14 md:pt-7">
        <div className="mb-5">
          <h1 className="m-0 text-[28px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
            הגדרות
          </h1>
          <p className="mt-2 text-[14px] text-fg-muted">
            ניהול המכינה, שלבי הקבלה ותפקידי הצוות.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
          <SettingsTabs isAdmin={isAdmin} />
          <div className="flex flex-col gap-5">
            {isAdmin ? (
              <OrgSettings org={org} />
            ) : (
              <NotAllowedCard
                title="פרטי המכינה"
                desc="רק מנהל מכינה יכול לערוך פרטים אלה."
              />
            )}
            <div id="pipeline" className="scroll-mt-24">
              {isAdmin ? (
                <PipelineStagesEditor
                  stages={stages ?? []}
                  organizationId={org.id}
                />
              ) : (
                <NotAllowedCard
                  title="שלבי קבלה"
                  desc="רק מנהל מכינה יכול לערוך את שלבי הקבלה."
                />
              )}
            </div>
            {isAdmin && (
              <div id="role-labels" className="scroll-mt-24">
                <RoleLabelsEditor
                  initialLabels={roleLabels ?? []}
                  organizationId={org.id}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function NotAllowedCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="border-b border-[var(--line-faint)] px-[22px] py-[18px]">
        <h2 className="m-0 text-[17px] font-semibold tracking-[-0.005em] text-primary">
          {title}
        </h2>
        <p className="mt-0.5 text-[12.5px] text-fg-subtle">{desc}</p>
      </div>
      <div className="px-[22px] py-8 text-center text-[13px] text-fg-subtle">
        אין הרשאה.
      </div>
    </div>
  )
}
