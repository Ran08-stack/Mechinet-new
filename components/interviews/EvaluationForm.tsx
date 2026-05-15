"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Check, Save } from "lucide-react"
import { InterviewEvaluation } from "@/types/database"

// תגיות אופי — קבוצות
const TAG_GROUPS: { title: string; tags: string[] }[] = [
  {
    title: "תכונות חיוביות",
    tags: [
      "מנהיגות",
      "יוזמה",
      "אחריות",
      "יכולת ביטוי",
      "דבקות במטרה",
      "סקרנות אינטלקטואלית",
      "גמישות",
      "עבודת צוות",
    ],
  },
  {
    title: "נקודות לתשומת לב",
    tags: [
      "ביישנות",
      "חוסר ניסיון",
      "מוטיבציה לא ברורה",
      "קושי בעבודת צוות",
      "ציפיות לא ריאליות",
    ],
  },
]

// סולם התאמה 1-4
const SCALE = [
  {
    value: 1,
    label: "לא מתאים",
    desc: "לא בשלב הזה",
    bg: "var(--stage-rejected-bg)",
    fg: "var(--stage-rejected-fg)",
    line: "var(--stage-rejected-dot)",
  },
  {
    value: 2,
    label: "מתאים עם הסתייגות",
    desc: "צריך בדיקה נוספת",
    bg: "var(--stage-review-bg)",
    fg: "var(--stage-review-fg)",
    line: "var(--stage-review-dot)",
  },
  {
    value: 3,
    label: "מתאים",
    desc: "מועמד טוב",
    bg: "var(--stage-interview-bg)",
    fg: "var(--stage-interview-fg)",
    line: "var(--stage-interview-dot)",
  },
  {
    value: 4,
    label: "מתאים מאוד",
    desc: "מועמד חזק — לקבל ולחזק",
    bg: "var(--ai-soft)",
    fg: "var(--ai-deep)",
    line: "var(--ai)",
  },
]

export default function EvaluationForm({
  interviewId,
  organizationId,
  candidateName,
  existing,
}: {
  interviewId: string
  organizationId: string
  candidateName: string
  existing: InterviewEvaluation | null
}) {
  const router = useRouter()
  const [tags, setTags] = useState<string[]>(existing?.tags ?? [])
  const [scale, setScale] = useState<number | null>(existing?.scale ?? null)
  const [notes, setNotes] = useState(existing?.notes ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 6
        ? [...prev, tag]
        : prev
    )
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    if (existing) {
      await supabase
        .from("interview_evaluations")
        .update({ tags, scale, notes })
        .eq("id", existing.id)
    } else {
      await supabase.from("interview_evaluations").insert({
        interview_id: interviewId,
        organization_id: organizationId,
        tags,
        scale,
        notes,
      })
    }
    // עדכון סטטוס הראיון להושלם
    await supabase
      .from("interviews")
      .update({ status: "completed" })
      .eq("id", interviewId)
    setSaving(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="pb-14">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d2543] to-[#1a2b47] px-7 py-6 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 90% 10%, rgba(254,111,66,0.15), transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-white/55">
            הערכת ראיון
          </div>
          <h1 className="m-0 mt-1 text-[26px] font-semibold tracking-[-0.015em]">
            {candidateName}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 px-7 pt-6">
        {/* תגיות */}
        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-[var(--line-faint)] px-[18px] py-3.5">
            <h2 className="m-0 text-[15px] font-semibold text-primary">
              תגיות אופי
            </h2>
            <p className="mt-0.5 text-[12px] text-fg-subtle">
              סמן את התכונות שצפית בראיון · עד 6 ({tags.length}/6)
            </p>
          </div>
          <div className="flex flex-col gap-4 p-[18px]">
            {TAG_GROUPS.map((group) => (
              <div key={group.title}>
                <h4 className="m-0 mb-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
                  {group.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => {
                    const on = tags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                          on
                            ? "border-[var(--primary-line)] bg-[var(--primary-soft)] text-primary"
                            : "border-line bg-surface text-fg-muted hover:bg-[var(--bg-subtle)]"
                        }`}
                      >
                        {on && <Check className="h-3 w-3 text-accent" />}
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* סולם התאמה */}
        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-[var(--line-faint)] px-[18px] py-3.5">
            <h2 className="m-0 text-[15px] font-semibold text-primary">
              רמת התאמה
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-2.5 p-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {SCALE.map((s) => {
              const on = scale === s.value
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setScale(s.value)
                    setSaved(false)
                  }}
                  className="flex flex-col gap-1.5 rounded-md border p-3 text-start transition-all"
                  style={
                    on
                      ? {
                          background: s.bg,
                          borderColor: s.line,
                          boxShadow: `0 0 0 1px ${s.line}`,
                        }
                      : { borderColor: "var(--line)" }
                  }
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="grid h-6 w-6 place-items-center rounded font-mono text-[12px] font-bold"
                      style={
                        on
                          ? { background: s.line, color: "#fff" }
                          : {
                              background: "var(--bg-muted)",
                              color: "var(--fg-muted)",
                            }
                      }
                    >
                      {s.value}
                    </span>
                    <b
                      className="text-[13px] font-semibold"
                      style={{ color: on ? s.fg : "var(--fg)" }}
                    >
                      {s.label}
                    </b>
                  </div>
                  <p
                    className="m-0 text-[11.5px]"
                    style={{ color: on ? s.fg : "var(--fg-subtle)" }}
                  >
                    {s.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        {/* הערות */}
        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-[var(--line-faint)] px-[18px] py-3.5">
            <h2 className="m-0 text-[15px] font-semibold text-primary">
              רשמים מהראיון
            </h2>
          </div>
          <div className="p-[18px]">
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                setSaved(false)
              }}
              placeholder="כתוב את הרשמים שלך מהראיון…"
              rows={8}
              dir="rtl"
              className="w-full resize-none rounded-md border border-line bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
            />
          </div>
        </section>

        {/* שמירה */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-[13px] text-[var(--stage-accepted-fg)]">
              ההערכה נשמרה
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-5 text-[14px] font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "שומר…" : "שמור הערכה"}
          </button>
        </div>
      </div>
    </div>
  )
}
