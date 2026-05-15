import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Users, FileText, Sparkles, CheckCircle2, ChevronLeft } from "lucide-react"
import { STAGE_LABELS, formatDate } from "@/lib/utils"
import { StageBadge } from "@/components/ui/StageBadge"

const STAGES = ["new", "review", "interview", "accepted", "rejected"] as const

const STAGE_DOT: Record<string, string> = {
  new: "var(--stage-new-dot)",
  review: "var(--stage-review-dot)",
  interview: "var(--stage-interview-dot)",
  accepted: "var(--stage-accepted-dot)",
  rejected: "var(--stage-rejected-dot)",
}

const AV_GRADIENTS = [
  "linear-gradient(135deg,#b6c7ea,#374765)",
  "linear-gradient(135deg,#ffb59f,#fe6f42)",
  "linear-gradient(135deg,#44ddc1,#00a58e)",
  "linear-gradient(135deg,#f4b8a8,#c1583d)",
  "linear-gradient(135deg,#d5c4f7,#7c5cd6)",
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + parts[1][0]
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false })

  const list = candidates ?? []

  // ספירות לפי שלב
  const countByStage: Record<string, number> = {}
  for (const s of STAGES) countByStage[s] = 0
  for (const c of list) {
    if (countByStage[c.stage] !== undefined) countByStage[c.stage]++
  }

  const total = list.length
  const inReview = countByStage["review"] ?? 0
  const inInterview = countByStage["interview"] ?? 0
  const withSummary = list.filter((c) => c.ai_summary).length

  const recent = list.slice(0, 6)
  const maxStageCount = Math.max(1, ...STAGES.map((s) => countByStage[s] ?? 0))

  const kpis = [
    {
      label: "סך מועמדים",
      value: total,
      icon: Users,
      iconBg: "var(--primary-soft)",
      iconFg: "var(--primary)",
    },
    {
      label: "בבדיקה",
      value: inReview,
      icon: FileText,
      iconBg: "var(--accent-soft)",
      iconFg: "var(--accent-hover)",
    },
    {
      label: "בשלב ראיון",
      value: inInterview,
      icon: CheckCircle2,
      iconBg: "var(--primary-soft)",
      iconFg: "var(--primary)",
    },
    {
      label: "סיכומי AI",
      value: withSummary,
      icon: Sparkles,
      iconBg: "var(--ai-soft)",
      iconFg: "var(--ai-deep)",
    },
  ]

  return (
    <div className="pb-14">
      {/* כותרת העמוד */}
      <div className="flex items-end justify-between gap-6 px-7 pb-2 pt-7">
        <div>
          <h1 className="m-0 text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
            לוח בקרה
          </h1>
          <p className="mt-2 max-w-[60ch] text-[15px] text-fg-muted">
            סקירה של מחזור הגיוס — {total} מועמדים בתהליך.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-[22px] px-7 pt-4">
        {/* כרטיסי מדדים */}
        <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-5 transition-[border-color,box-shadow] hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-sm)]"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-fg-muted">
                    {kpi.label}
                  </span>
                  <span
                    className="grid h-8 w-8 place-items-center rounded-md"
                    style={{ background: kpi.iconBg, color: kpi.iconFg }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="text-[32px] font-bold leading-[1.1] tracking-[-0.015em] text-primary [font-variant-numeric:tabular-nums]">
                  {kpi.value}
                </div>
              </div>
            )
          })}
        </section>

        {/* משפך שלבים */}
        <section className="rounded-lg border border-line bg-surface p-[22px]">
          <div className="mb-[18px] flex items-baseline justify-between">
            <h2 className="m-0 text-[15px] font-semibold text-primary">
              שלבי קבלה
            </h2>
            <span className="font-mono text-[11px] text-fg-subtle">
              {total} סה"כ
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {STAGES.map((stage) => {
              const count = countByStage[stage] ?? 0
              const pct = Math.round((count / maxStageCount) * 100)
              return (
                <div key={stage} className="flex flex-col gap-2.5">
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${pct}%`,
                        background: STAGE_DOT[stage],
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[24px] font-bold leading-none tracking-[-0.015em] text-primary [font-variant-numeric:tabular-nums]">
                      {count}
                    </span>
                    <span className="text-[12.5px] font-medium text-fg-muted">
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* מועמדים אחרונים */}
        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
            <h2 className="m-0 text-[15px] font-semibold text-primary">
              מועמדים אחרונים
            </h2>
            <Link
              href="/candidates"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:text-accent"
            >
              כל המועמדים
              <ChevronLeft className="h-[13px] w-[13px]" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="px-8 py-14 text-center text-[13px] text-fg-muted">
              אין מועמדים עדיין
            </div>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["מועמד", "עיר", "שלב", "תאריך"].map((h) => (
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
                {recent.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--line-faint)] transition-colors last:border-b-0 hover:bg-[var(--bg-subtle)]"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/candidates/${c.id}`}
                        className="flex items-center gap-2.5"
                      >
                        <span
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.35)]"
                          style={{
                            background:
                              AV_GRADIENTS[idx % AV_GRADIENTS.length],
                          }}
                        >
                          {initials(c.full_name)}
                        </span>
                        <span className="font-medium text-fg">
                          {c.full_name}
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-fg-muted">
                      {c.city ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StageBadge stage={c.stage} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-fg-muted [font-variant-numeric:tabular-nums]">
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
