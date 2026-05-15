import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Phone, MapPin, Calendar, Mail, FileText, User, Sparkles, Paperclip } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { FormField, Attachment } from "@/types/database"
import StageSelector from "@/components/candidates/StageSelector"
import AISummaryButton from "@/components/candidates/AISummaryButton"
import NotesEditor from "@/components/candidates/NotesEditor"
import { ActivityTimeline } from "@/components/candidates/ActivityTimeline"

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + parts[1][0]
}

export default async function CandidatePage({
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
  const attachments = (data.attachments ?? []) as Attachment[]

  let formFields: FormField[] = []
  if (data.form_id) {
    const { data: formData } = await supabase
      .from("forms")
      .select("fields")
      .eq("id", data.form_id)
      .single()
    if (formData && Array.isArray(formData.fields)) {
      formFields = formData.fields as FormField[]
    }
  }

  const extraAnswers = formFields.filter(
    (f) =>
      !["full_name", "email", "phone", "birth_date", "city", "school"].includes(
        f.id
      ) && answers[f.id]
  )

  // היסטוריית פעילות
  const { data: events } = await supabase
    .from("candidate_events")
    .select("*")
    .eq("candidate_id", params.id)
    .order("created_at", { ascending: false })

  return (
    <div>
      {/* כותרת עליונה — נתיב */}
      <div className="flex h-[60px] items-center gap-3.5 border-b border-line bg-surface px-7">
        <div className="flex items-center gap-2 text-[13px] text-fg-subtle">
          <Link href="/candidates" className="hover:text-fg">
            מועמדים
          </Link>
          <span className="text-[var(--fg-faint)]">/</span>
          <span className="font-medium text-fg">{data.full_name}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-line bg-surface px-7 pt-[22px]">
        <Link
          href="/candidates"
          className="mb-3.5 inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          חזרה לרשימה
        </Link>

        <div className="flex items-start gap-[18px] pb-[18px]">
          <span className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#b6c7ea] to-[#374765] text-[24px] font-semibold tracking-[-0.02em] text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.4)]">
            {initials(data.full_name)}
          </span>
          <div className="flex-1">
            <h1 className="m-0 text-[30px] font-semibold leading-[1.1] tracking-[-0.015em] text-primary">
              {data.full_name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-[18px] gap-y-1.5 text-[12.5px] text-fg-muted">
              <span className="inline-flex items-center gap-1.5 font-mono text-[12px]" dir="ltr">
                <Mail className="h-[13px] w-[13px] text-[var(--fg-faint)]" />
                {data.email}
              </span>
              {data.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-[13px] w-[13px] text-[var(--fg-faint)]" />
                  {data.phone}
                </span>
              )}
              {data.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-[13px] w-[13px] text-[var(--fg-faint)]" />
                  {data.city}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-[13px] w-[13px] text-[var(--fg-faint)]" />
                נרשם {formatDate(data.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* רצועת שלבים */}
        <div className="py-4">
          <StageSelector
            candidateId={data.id}
            organizationId={data.organization_id}
            currentStage={data.stage}
          />
        </div>
      </div>

      {/* גוף — מבנה דו-טורי */}
      <div className="grid grid-cols-1 items-start gap-[22px] px-7 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* טור ראשי */}
        <div className="flex flex-col gap-3.5">
          {/* סיכום AI */}
          <div className="overflow-hidden rounded-lg border border-[var(--ai-line)] bg-gradient-to-b from-surface to-[#f6fcfa]">
            <div className="flex items-center gap-2.5 border-b border-[var(--ai-line)] bg-[var(--ai-soft)] px-[18px] py-3.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-[var(--ai)] text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h2 className="m-0 text-[15px] font-semibold text-[var(--ai-deep)]">
                סיכום AI
              </h2>
              <div className="ms-auto">
                <AISummaryButton
                  candidateId={data.id}
                  hasSummary={!!data.ai_summary}
                />
              </div>
            </div>
            <div className="px-[18px] py-4">
              {data.ai_summary ? (
                <p className="m-0 whitespace-pre-line text-[13px] leading-relaxed text-fg">
                  {data.ai_summary}
                </p>
              ) : (
                <p className="m-0 text-[13px] text-fg-subtle">
                  טרם הופק סיכום למועמד זה.
                </p>
              )}
            </div>
          </div>

          {/* פרטים אישיים */}
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center gap-2.5 border-b border-[var(--line-faint)] px-[18px] py-3.5">
              <User className="h-[15px] w-[15px] text-[var(--fg-faint)]" />
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                פרטים אישיים
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 p-[18px] sm:grid-cols-2">
              <InfoCell label="טלפון" value={data.phone} />
              <InfoCell
                label="תאריך לידה"
                value={data.birth_date ? formatDate(data.birth_date) : null}
              />
              <InfoCell label="עיר מגורים" value={data.city} />
              <InfoCell label="בית ספר" value={data.school} />
            </div>
          </div>

          {/* תשובות לטופס */}
          {extraAnswers.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-line bg-surface">
              <div className="flex items-center gap-2.5 border-b border-[var(--line-faint)] px-[18px] py-3.5">
                <FileText className="h-[15px] w-[15px] text-[var(--fg-faint)]" />
                <h2 className="m-0 text-[15px] font-semibold text-primary">
                  תשובות לטופס
                </h2>
                <span className="rounded-full border border-line bg-[var(--bg-muted)] px-[7px] py-px font-mono text-[11px] text-fg-subtle">
                  {extraAnswers.length} שדות
                </span>
              </div>
              <div className="flex flex-col gap-4 px-[18px] py-4">
                {extraAnswers.map((field) => {
                  const answer = answers[field.id]
                  return (
                    <div key={field.id}>
                      <p className="mb-1 text-[12px] font-medium text-fg-subtle">
                        {field.label}
                      </p>
                      <p className="m-0 text-[13px] leading-relaxed text-fg">
                        {Array.isArray(answer) ? answer.join(", ") : answer}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* קבצים מצורפים */}
          {attachments.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-line bg-surface">
              <div className="flex items-center gap-2.5 border-b border-[var(--line-faint)] px-[18px] py-3.5">
                <Paperclip className="h-[15px] w-[15px] text-[var(--fg-faint)]" />
                <h2 className="m-0 text-[15px] font-semibold text-primary">
                  קבצים מצורפים
                </h2>
              </div>
              <div className="flex flex-col gap-2 p-[18px]">
                {attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[13px] text-primary hover:text-accent"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    {att.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* טור צד — הערות */}
        <div className="flex flex-col gap-3.5 lg:sticky lg:top-5">
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-[var(--line-faint)] px-[18px] py-3.5">
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                הערות
              </h2>
            </div>
            <div className="p-[18px]">
              <NotesEditor
                candidateId={data.id}
                organizationId={data.organization_id}
                initialNotes={data.notes ?? ""}
              />
            </div>
          </div>

          <ActivityTimeline events={events ?? []} />
        </div>
      </div>
    </div>
  )
}

function InfoCell({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>
      <div className="text-[12px] font-medium text-fg-subtle">{label}</div>
      <div className="mt-0.5 text-[13px] text-fg">{value || "—"}</div>
    </div>
  )
}
