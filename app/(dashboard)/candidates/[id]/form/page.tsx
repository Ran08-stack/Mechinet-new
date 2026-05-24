import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, FileText } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { FormField } from "@/types/database"

export default async function CandidateFormView({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!data) notFound()

  const answers = (data.answers ?? {}) as Record<string, string | string[]>

  let formFields: FormField[] = []
  let formName = ""
  if (data.form_id) {
    const { data: formData } = await supabase
      .from("forms")
      .select("name, fields")
      .eq("id", data.form_id)
      .single()
    if (formData) {
      formName = formData.name ?? ""
      if (Array.isArray(formData.fields)) {
        formFields = formData.fields as FormField[]
      }
    }
  }

  return (
    <div>
      {/* כותרת עליונה — נתיב */}
      <div className="flex h-[60px] items-center gap-3.5 border-b border-line bg-surface px-7">
        <div className="flex items-center gap-2 text-[13px] text-fg-subtle">
          <Link href="/candidates" className="hover:text-fg">
            מועמדים
          </Link>
          <span className="text-[var(--fg-faint)]">/</span>
          <Link href={`/candidates/${data.id}`} className="hover:text-fg">
            {data.full_name}
          </Link>
          <span className="text-[var(--fg-faint)]">/</span>
          <span className="font-medium text-fg">צפייה בטופס המקורי</span>
        </div>
      </div>

      <div className="border-b border-line bg-surface px-7 pt-[22px]">
        <Link
          href={`/candidates/${data.id}`}
          className="mb-3.5 inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          חזרה לפרופיל
        </Link>

        <div className="flex items-start gap-3 pb-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--bg-muted)] text-fg-muted">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h1 className="m-0 text-[22px] font-semibold leading-tight tracking-[-0.01em] text-primary">
              {formName || "טופס מועמדות"}
            </h1>
            <div className="mt-1 text-[12.5px] text-fg-muted">
              תשובות של {data.full_name} · הוגש ב-{formatDate(data.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* גוף — תשובות read-only */}
      <div className="px-7 py-6">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex flex-col gap-5 p-[22px]">
            {formFields.length === 0 ? (
              <p className="m-0 text-[13px] text-fg-subtle">
                לא נמצאו שדות טופס.
              </p>
            ) : (
              formFields.map((field) => {
                const answer = answers[field.id]
                const display = Array.isArray(answer)
                  ? answer.join(", ")
                  : answer
                return (
                  <div key={field.id} className="border-b border-[var(--line-faint)] pb-4 last:border-0 last:pb-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-[13px] font-medium text-fg">
                        {field.label}
                      </span>
                      {field.required && (
                        <span className="text-[11px] text-[var(--danger)]">חובה</span>
                      )}
                    </div>
                    <div className="text-[13px] leading-relaxed text-fg">
                      {display ? (
                        <span className="whitespace-pre-line">{display}</span>
                      ) : (
                        <span className="text-fg-subtle">— ללא תשובה —</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
