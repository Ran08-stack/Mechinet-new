import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { GraduationCap } from "lucide-react"
import { FormField } from "@/types/database"
import ApplyForm from "@/components/forms/ApplyForm"

export default async function ApplyPage({
  params,
}: {
  params: { formId: string }
}) {
  const supabase = await createClient()

  const { data: form } = await supabase
    .from("forms")
    .select("*, organizations(name)")
    .eq("id", params.formId)
    .eq("is_active", true)
    .single()

  if (!form) notFound()

  const fields = form.fields as FormField[]
  const orgName = (form.organizations as { name: string })?.name

  return (
    <div className="min-h-screen bg-bg py-8 font-sans sm:py-12" dir="rtl">
      <div className="mx-auto max-w-2xl px-4">
        {/* כותרת מותג */}
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[17px] font-semibold leading-tight text-primary">
              {orgName}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
              טופס מועמדות
            </div>
          </div>
        </div>

        {/* כרטיס הטופס */}
        <div className="rounded-lg border border-line bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="m-0 mb-1 text-[24px] font-semibold tracking-[-0.015em] text-primary">
            הגשת מועמדות
          </h1>
          <p className="mb-8 text-[13px] text-fg-muted">
            מלא את הפרטים. כל השדות המסומנים בכוכבית הם חובה.
          </p>
          <ApplyForm
            formId={form.id}
            organizationId={form.organization_id}
            fields={fields}
          />
        </div>
      </div>
    </div>
  )
}
