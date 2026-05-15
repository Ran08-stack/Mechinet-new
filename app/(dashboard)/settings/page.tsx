import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OrgSettings from "@/components/settings/OrgSettings"
import PipelineStagesEditor from "@/components/settings/PipelineStagesEditor"

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
      <div className="px-7 py-7">
        <p className="text-[13px] text-fg-muted">
          לא נמצאה מכינה מחוברת לחשבון זה.
        </p>
      </div>
    )
  }

  const [{ data: org }, { data: stages }] = await Promise.all([
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
  ])

  if (!org) redirect("/login")

  return (
    <div className="mx-auto max-w-2xl pb-14">
      {/* כותרת העמוד */}
      <div className="px-7 pb-[18px] pt-7">
        <h1 className="m-0 text-[24px] font-semibold leading-[34px] tracking-[-0.015em] text-primary">
          הגדרות
        </h1>
        <p className="mt-1.5 text-[13px] text-fg-muted">
          ניהול פרטי המכינה ושלבי הקבלה.
        </p>
      </div>

      <div className="flex flex-col gap-3.5 px-7">
        <OrgSettings org={org} />
        <PipelineStagesEditor
          stages={stages ?? []}
          organizationId={org.id}
        />
      </div>
    </div>
  )
}
