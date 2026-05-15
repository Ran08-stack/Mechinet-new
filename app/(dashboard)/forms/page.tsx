import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, FileText, MoreVertical } from "lucide-react"
import CopyLinkButton from "@/components/forms/CopyLinkButton"
import DeleteFormButton from "@/components/forms/DeleteFormButton"

export default async function FormsPage() {
  const supabase = await createClient()

  const { data: forms } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false })

  // ספירת מועמדים לכל טופס
  const { data: candidates } = await supabase
    .from("candidates")
    .select("form_id")

  const countByForm: Record<string, number> = {}
  for (const c of candidates ?? []) {
    if (c.form_id) countByForm[c.form_id] = (countByForm[c.form_id] ?? 0) + 1
  }

  const list = forms ?? []

  return (
    <div className="pb-14">
      {/* כותרת העמוד */}
      <div className="flex items-end justify-between gap-5 px-7 pb-6 pt-7">
        <div>
          <h1 className="m-0 text-[24px] font-semibold leading-[34px] tracking-[-0.015em] text-primary">
            טפסים
          </h1>
          <p className="mt-1.5 text-[13px] text-fg-muted">
            טפסי מועמדות שמולאו על ידי מועמדים. כל טופס מקבל קישור ציבורי.
          </p>
        </div>
        <Link
          href="/forms/new/builder"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          טופס חדש
        </Link>
      </div>

      <div className="px-7">
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-8 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-lg border border-line bg-[var(--bg-subtle)] text-fg-muted">
              <FileText className="h-6 w-6" />
            </span>
            <p className="m-0 text-[13px] text-fg-muted">אין טפסים עדיין</p>
            <Link
              href="/forms/new/builder"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              צור טופס ראשון
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            {list.map((form) => {
              const fieldCount = Array.isArray(form.fields)
                ? form.fields.length
                : 0
              const candidateCount = countByForm[form.id] ?? 0
              return (
                <div
                  key={form.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow] hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-sm)]"
                >
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--primary-soft)] text-primary">
                        <FileText className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="m-0 text-[17px] font-semibold leading-[1.3] tracking-[-0.005em] text-primary">
                          {form.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2.5 text-[12px] text-fg-subtle">
                          <span>{fieldCount} שאלות</span>
                          <span className="text-[var(--fg-faint)]">·</span>
                          <span>{candidateCount} מועמדים</span>
                        </div>
                      </div>
                      <button
                        className="inline-grid h-[30px] w-[30px] shrink-0 place-items-center rounded border border-line text-[var(--fg-faint)] hover:bg-[var(--bg-subtle)] hover:text-fg"
                        aria-label="עוד"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-[22px] items-center gap-1.5 rounded-full border px-[9px] text-[11.5px] font-medium"
                        style={
                          form.is_active
                            ? {
                                background: "var(--stage-accepted-bg)",
                                color: "var(--stage-accepted-fg)",
                                borderColor: "var(--stage-accepted-line)",
                              }
                            : {
                                background: "var(--bg-muted)",
                                color: "var(--fg-muted)",
                                borderColor: "var(--line-strong)",
                              }
                        }
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: form.is_active
                              ? "var(--stage-accepted-dot)"
                              : "var(--fg-faint)",
                          }}
                        />
                        {form.is_active ? "פעיל" : "לא פעיל"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-line bg-[var(--bg-subtle)] px-5 py-3.5">
                    <CopyLinkButton formId={form.id} />
                    <Link
                      href={`/forms/${form.id}/builder`}
                      className="inline-flex h-[30px] items-center rounded-md border border-line bg-surface px-3 text-[12.5px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
                    >
                      עריכה
                    </Link>
                    <div className="ms-auto">
                      <DeleteFormButton formId={form.id} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
