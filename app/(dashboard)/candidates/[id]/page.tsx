import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight,
  Calendar,
  Mail,
  FileText,
  User,
  Sparkles,
  Paperclip,
  ExternalLink,
  Download,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { FormField, Attachment } from "@/types/database"
import StageSelector from "@/components/candidates/StageSelector"
import AISummaryButton from "@/components/candidates/AISummaryButton"
import NotesEditor from "@/components/candidates/NotesEditor"
import { ActivityTimeline } from "@/components/candidates/ActivityTimeline"
import EditCandidateButton from "@/components/candidates/EditCandidateButton"
import { getStages } from "@/lib/stages"

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + parts[1][0]
}

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const b = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

function fileExt(name: string): string {
  const p = name.split(".")
  return p.length > 1 ? p[p.length - 1].toUpperCase().slice(0, 4) : "FILE"
}

function fileKind(ext: string): "pdf" | "img" | "vid" | "doc" {
  const e = ext.toLowerCase()
  if (["pdf"].includes(e)) return "pdf"
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(e)) return "img"
  if (["mp4", "mov", "webm", "avi"].includes(e)) return "vid"
  return "doc"
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

  // שדות "מיוחדים" — נשמרים גם בעמודות ייעודיות. אל תכפיל אותם ב"תשובות".
  // זיהוי כפול: לפי סוג השדה (אמין לשינוי label) + לפי label עברי canonical (legacy).
  const PERSONAL_TYPES = new Set([
    "id_number",
    "email",
    "phone",
    "date",
  ])
  const PERSONAL_LABELS = new Set([
    "שם מלא",
    "אימייל",
    "טלפון",
    "טלפון נייד",
    "תאריך לידה",
    "עיר מגורים",
    "בית ספר",
    'ת"ז',
    "תעודת זהות",
  ])
  const extraAnswers = formFields.filter((f) => {
    if (!answers[f.id]) return false
    if (PERSONAL_TYPES.has(String(f.type))) return false
    if (PERSONAL_LABELS.has(f.label)) return false
    // sections/info — לא לשלוף לתשובות
    if (f.type === "section" || f.type === "info") return false
    return true
  })

  // היסטוריית פעילות
  const { data: events } = await supabase
    .from("candidate_events")
    .select("*")
    .eq("candidate_id", params.id)
    .order("created_at", { ascending: false })

  // שלבי הצנרת של המכינה
  const stages = await getStages(data.organization_id)

  const idTag = "#cnd_" + data.id.slice(0, 6)

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
              <span
                className="inline-flex items-center gap-1.5 font-mono text-[12px]"
                dir="ltr"
              >
                <Mail className="h-[13px] w-[13px] text-[var(--fg-faint)]" />
                {data.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-[13px] w-[13px] text-[var(--fg-faint)]" />
                נרשם {formatDate(data.created_at)}
              </span>
              <span
                className="rounded border border-line bg-[var(--bg-muted)] px-1.5 py-px font-mono text-[11px] text-fg-muted"
                dir="ltr"
              >
                {idTag}
              </span>
            </div>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex gap-2">
            <a
              href={`mailto:${data.email}`}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line-strong)] bg-surface px-3.5 text-[13px] font-medium text-primary shadow-[var(--shadow-xs)] transition-colors hover:bg-[var(--bg-subtle)]"
            >
              <Mail className="h-4 w-4" />
              שלח מייל
            </a>
            <Link
              href="/calendar"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
            >
              <Calendar className="h-4 w-4" />
              קבע ראיון
            </Link>
          </div>
        </div>

        {/* רצועת שלבים */}
        <div className="py-4">
          <StageSelector
            candidateId={data.id}
            organizationId={data.organization_id}
            currentStage={data.stage}
            stages={stages}
          />
        </div>
      </div>

      {/* גוף — מבנה דו-טורי */}
      <div className="grid grid-cols-1 items-start gap-[22px] px-7 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* טור ראשי */}
        <div className="flex flex-col gap-3.5">
          {/* פרטים אישיים */}
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center gap-2.5 border-b border-[var(--line-faint)] px-[18px] py-3.5">
              <User className="h-[15px] w-[15px] text-[var(--fg-faint)]" />
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                פרטים אישיים
              </h2>
              <div className="ms-auto">
                <EditCandidateButton candidate={data} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 p-[18px] sm:grid-cols-2">
              <InfoCell label='ת"ז' value={data.national_id} />
              <InfoCell label="טלפון" value={data.phone} />
              <InfoCell
                label="תאריך לידה"
                value={(() => {
                  if (!data.birth_date) return null
                  const age = calcAge(data.birth_date)
                  return `${formatDate(data.birth_date)}${age !== null ? ` · גיל ${age}` : ""}`
                })()}
              />
              <InfoCell label="עיר מגורים" value={data.city} />
              <InfoCell label="בית ספר" value={data.school} />
            </div>
          </div>

          {/* תשובות לטופס */}
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center gap-2.5 border-b border-[var(--line-faint)] px-[18px] py-3.5">
              <FileText className="h-[15px] w-[15px] text-[var(--fg-faint)]" />
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                תשובות לטופס
              </h2>
              <span className="rounded-full border border-line bg-[var(--bg-muted)] px-[7px] py-px font-mono text-[11px] text-fg-subtle">
                {extraAnswers.length} שדות
              </span>
              <Link
                href={`/candidates/${data.id}/form`}
                className="ms-auto inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:text-accent-hover"
              >
                צפייה בטופס המקורי
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex flex-col gap-4 px-[18px] py-4">
              {extraAnswers.length === 0 ? (
                <p className="m-0 text-[13px] text-fg-subtle">
                  אין תשובות נוספות מעבר לפרטים האישיים.
                </p>
              ) : (
                extraAnswers.map((field) => {
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
                })
              )}
            </div>
          </div>

          {/* קבצים מצורפים */}
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center gap-2.5 border-b border-[var(--line-faint)] px-[18px] py-3.5">
              <Paperclip className="h-[15px] w-[15px] text-[var(--fg-faint)]" />
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                קבצים מצורפים
              </h2>
              <span className="rounded-full border border-line bg-[var(--bg-muted)] px-[7px] py-px font-mono text-[11px] text-fg-subtle">
                {attachments.length}
              </span>
            </div>
            <div className="p-[18px]">
              {attachments.length === 0 ? (
                <p className="m-0 text-[13px] text-fg-subtle">
                  המועמד לא צירף קבצים.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {attachments.map((att, i) => {
                    const ext = fileExt(att.file_name)
                    const kind = fileKind(ext)
                    const kindClass: Record<typeof kind, string> = {
                      pdf: "text-[oklch(0.50_0.15_25)] border-[oklch(0.85_0.08_25)] bg-[oklch(0.97_0.025_25)]",
                      img: "text-[oklch(0.45_0.13_260)] border-[oklch(0.84_0.07_260)] bg-[oklch(0.96_0.03_260)]",
                      vid: "text-[oklch(0.45_0.13_295)] border-[oklch(0.85_0.07_295)] bg-[oklch(0.97_0.025_295)]",
                      doc: "text-[oklch(0.45_0.10_155)] border-[oklch(0.85_0.06_155)] bg-[oklch(0.96_0.025_155)]",
                    }
                    return (
                      <a
                        key={i}
                        href={att.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-md border border-line bg-[var(--bg-subtle)] px-3.5 py-3 transition-colors hover:border-[var(--line-strong)] hover:bg-surface"
                      >
                        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border font-mono text-[9.5px] font-semibold tracking-wider ${kindClass[kind]}`}>
                          {ext}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-[13px] font-medium text-fg">
                            {att.file_name}
                          </span>
                          <span className="font-mono text-[11px] text-fg-subtle">
                            {formatDate(att.uploaded_at)}
                          </span>
                        </div>
                        <Download className="h-3.5 w-3.5 text-[var(--fg-faint)]" />
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* טור צד — סיכום AI + הערות + פעילות */}
        <div className="flex flex-col gap-3.5 lg:sticky lg:top-5">
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
                <>
                  <p className="m-0 whitespace-pre-line text-[13px] leading-relaxed text-fg">
                    {data.ai_summary}
                  </p>
                  {data.ai_summary_at && (
                    <p className="m-0 mt-3 text-[11px] text-fg-subtle">
                      סוכם {summaryAgo(data.ai_summary_at)}
                    </p>
                  )}
                </>
              ) : (
                <p className="m-0 text-[13px] text-fg-subtle">
                  טרם הופק סיכום למועמד זה.
                </p>
              )}
            </div>
          </div>

          {/* הערות */}
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

          <ActivityTimeline
            candidateId={data.id}
            initialEvents={events ?? []}
          />
        </div>
      </div>
    </div>
  )
}

function summaryAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "כרגע"
  if (mins < 60) return `לפני ${mins} דקות`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `לפני ${hours} שעות`
  const days = Math.floor(hours / 24)
  if (days < 7) return `לפני ${days} ימים`
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
  })
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
