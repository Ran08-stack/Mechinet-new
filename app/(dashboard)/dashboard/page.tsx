import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Users, FileText, CheckCircle2, ChevronLeft } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { StageBadge } from "@/components/ui/StageBadge"
import { getStages, getStageColor } from "@/lib/stages"
import { PipelineStage, CandidateEvent } from "@/types/database"
import { Topbar } from "@/app/(dashboard)/_components/Topbar"
import NewCandidateButton from "@/components/candidates/NewCandidateButton"
import { LiveActivity } from "@/components/dashboard/LiveActivity"

// ברכת בוקר/צהריים/ערב לפי שעה ישראלית
function greeting(): string {
  const hour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })).getHours()
  if (hour < 5) return "לילה טוב"
  if (hour < 12) return "בוקר טוב"
  if (hour < 17) return "צהריים טובים"
  if (hour < 21) return "ערב טוב"
  return "לילה טוב"
}

// "ספטמבר 2026" — מחזור גיוס נוכחי (לצורך התצוגה — נסתמך על השנה הנוכחית)
function currentCycleLabel(): string {
  const now = new Date()
  return now.toLocaleDateString("he-IL", { month: "long", year: "numeric" })
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from("users")
    .select("organization_id, full_name, email")
    .eq("id", user?.id ?? "")
    .single()

  // שם הצוות לתצוגה ב"בוקר טוב X" — full_name, או החלק לפני @ במייל
  const userDisplay =
    userData?.full_name?.trim() ||
    (userData?.email?.split("@")[0] ?? "")

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false })

  const list = candidates ?? []

  let stages: PipelineStage[] = []
  if (userData?.organization_id) {
    stages = await getStages(userData.organization_id)
  }

  // אירועי פעילות (6 אחרונים) — פעילות בזמן אמת.
  // join ל-users (actor) ול-candidates (subject) כדי להציג שמות.
  type LiveEvent = CandidateEvent & {
    actor?: { full_name: string | null; email: string } | null
    candidate?: { full_name: string } | null
  }
  let liveEvents: LiveEvent[] = []
  if (userData?.organization_id) {
    const { data: ev } = await supabase
      .from("candidate_events")
      .select("*, actor:users(full_name, email), candidate:candidates(full_name)")
      .eq("organization_id", userData.organization_id)
      .order("created_at", { ascending: false })
      .limit(6)
    liveEvents = (ev ?? []) as unknown as LiveEvent[]
  }

  // ספירות לפי שלב דינמי
  const countByStage: Record<string, number> = {}
  for (const s of stages) countByStage[s.name] = 0
  for (const c of list) {
    if (countByStage[c.stage] !== undefined) countByStage[c.stage]++
  }

  const total = list.length
  // משך/יעד: השלב האמצעי והשלב האחרון (היו: review, interview)
  const midStage = stages[Math.floor(stages.length / 2)]
  const lastStage = stages[stages.length - 1]
  const inMid = midStage ? countByStage[midStage.name] ?? 0 : 0
  const inLast = lastStage ? countByStage[lastStage.name] ?? 0 : 0

  const recent = list.slice(0, 6)

  const kpis = [
    {
      label: "סך מועמדים",
      value: total,
      icon: Users,
      iconBg: "var(--primary-soft)",
      iconFg: "var(--primary)",
    },
    {
      label: midStage?.name ?? "—",
      value: inMid,
      icon: FileText,
      iconBg: "var(--accent-soft)",
      iconFg: "var(--accent-hover)",
    },
    {
      label: lastStage?.name ?? "—",
      value: inLast,
      icon: CheckCircle2,
      iconBg: "var(--primary-soft)",
      iconFg: "var(--primary)",
    },
  ]

  return (
    <>
      <Topbar
        crumb="לוח בקרה"
        action={
          userData?.organization_id ? (
            <NewCandidateButton organizationId={userData.organization_id} stages={stages} />
          ) : null
        }
      />

      <div className="pb-14">
        {/* ברכת בוקר */}
        <div className="flex flex-wrap items-end justify-between gap-6 px-7 pb-2 pt-7">
          <div>
            <h1 className="m-0 text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
              {greeting()}{userDisplay ? `, ${userDisplay}` : ""}
            </h1>
            <p className="mt-2 max-w-[60ch] text-[15px] text-fg-muted">
              סקירה של מחזור הגיוס — {currentCycleLabel()} · {total} מועמדים פעילים בתהליך
            </p>
          </div>
        </div>

      <div className="flex flex-col gap-[22px] px-7 pt-4">
        {/* כרטיסי מדדים */}
        <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
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

        {/* משפך שלבים — אינטראקטיבי, שורות אופקיות */}
        <section className="rounded-lg border border-line bg-surface p-[22px]">
          <div className="mb-[6px] flex items-baseline justify-between">
            <div>
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                שלבי קבלה
              </h2>
              <p className="mt-1 text-[12px] text-fg-subtle">
                לחץ על שלב כדי לראות את המועמדים בו
              </p>
            </div>
            <span className="font-mono text-[11px] text-fg-subtle">
              {total} סה"כ
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {stages.length === 0 && (
              <p className="m-0 py-6 text-center text-[13px] text-fg-subtle">
                לא הוגדרו שלבי קבלה. ניתן להגדיר ב<Link href="/settings" className="text-accent hover:underline">הגדרות</Link>.
              </p>
            )}
            {stages.map((stage) => {
              const count = countByStage[stage.name] ?? 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <Link
                  key={stage.id}
                  href={`/candidates?stage=${encodeURIComponent(stage.name)}`}
                  className={`group grid items-center gap-3.5 rounded-md border border-transparent px-3 py-2.5 transition-colors hover:border-line hover:bg-[var(--bg-subtle)] ${stage.color ?? ""}`}
                  style={{ gridTemplateColumns: "180px 1fr 90px 28px" }}
                >
                  <span className="flex items-center gap-2.5 text-[13.5px] font-medium text-fg">
                    <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                    {stage.name}
                  </span>
                  <span className="relative h-[26px] overflow-hidden rounded bg-[var(--bg-muted)]">
                    <span
                      className="absolute inset-y-0 start-0 rounded bg-current opacity-25 transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute inset-y-0 start-2.5 flex items-center font-mono text-[11px] font-medium text-fg">
                      {pct}%
                    </span>
                  </span>
                  <span className="text-end text-[22px] font-bold tracking-[-0.01em] text-primary [font-variant-numeric:tabular-nums]">
                    {count}
                  </span>
                  <span className="grid place-items-center text-[var(--fg-faint)] opacity-40 transition-[opacity,transform] group-hover:-translate-x-1 group-hover:opacity-100">
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* מועמדים אחרונים + פעילות בזמן אמת */}
        <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-[minmax(0,1fr)_360px]">
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
                    {["מועמד", "עיר מגורים", "טלפון", 'ת"ז', "אימייל", "שלב", "תאריך"].map((h) => (
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
                      <td className="whitespace-nowrap px-4 py-3.5 text-start text-fg-muted">
                        {c.city ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-start text-fg-muted [font-variant-numeric:tabular-nums]">
                        {c.phone ? <span dir="ltr">{c.phone}</span> : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-start text-fg-muted [font-variant-numeric:tabular-nums]">
                        {c.national_id ? <span dir="ltr">{c.national_id}</span> : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-start text-fg-muted">
                        {c.email ? (
                          <span dir="ltr" className="block max-w-[180px] truncate">
                            {c.email}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-start">
                        <StageBadge stage={c.stage} colorClass={getStageColor(stages, c.stage)} />
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

          <LiveActivity
            initialEvents={liveEvents}
            organizationId={userData?.organization_id ?? ""}
          />
        </div>
        </div>
      </div>
    </>
  )
}
