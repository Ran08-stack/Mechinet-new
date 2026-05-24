import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { GraduationCap, CheckCircle2, Clock, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getStages } from "@/lib/stages"

export default async function CandidatePortalPage({
  params,
}: {
  params: { candidateId: string }
}) {
  const supabase = await createClient()

  const { data: candidate } = await supabase
    .from("candidates")
    .select("*, organizations(name)")
    .eq("id", params.candidateId)
    .single()

  if (!candidate) notFound()

  const orgRel = candidate.organizations as
    | { name: string }
    | { name: string }[]
    | null
  const orgName = Array.isArray(orgRel)
    ? orgRel[0]?.name ?? "המכינה"
    : orgRel?.name ?? "המכינה"

  // ראיון מתוכנן אם יש
  const { data: interview } = await supabase
    .from("interviews")
    .select("*")
    .eq("candidate_id", params.candidateId)
    .eq("status", "scheduled")
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  const stages = await getStages(candidate.organization_id)
  const currentStageIndex = stages.findIndex((s) => s.name === candidate.stage)
  const isLast = currentStageIndex === stages.length - 1 && stages.length > 0
  // אין לנו "rejected" כשלב מובחן — משאירים false (השלב פשוט יוצג כשלב הנוכחי).
  const isRejected = false
  const isAccepted = isLast

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
              פורטל מועמד
            </div>
          </div>
        </div>

        {/* כרטיס סטטוס ראשי */}
        <div
          className="overflow-hidden rounded-lg border p-6 sm:p-8"
          style={
            isAccepted
              ? {
                  background: "var(--ai-soft)",
                  borderColor: "var(--ai-line)",
                }
              : {
                  background: "var(--surface)",
                  borderColor: "var(--line)",
                }
          }
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
            שלום {candidate.full_name}
          </div>
          <h1 className="m-0 mt-2 text-[26px] font-semibold tracking-[-0.015em] text-primary">
            {isAccepted
              ? "מזל טוב, התקבלת!"
              : isRejected
              ? "תהליך המועמדות הסתיים"
              : `המועמדות שלך בשלב: ${candidate.stage}`}
          </h1>
        </div>

        {/* פס התקדמות שלבים */}
        {!isRejected && (
          <div className="mt-3.5 rounded-lg border border-line bg-surface p-6">
            <h2 className="m-0 mb-4 text-[15px] font-semibold text-primary">
              שלבי התהליך
            </h2>
            <div className="flex flex-col gap-3">
              {stages.map((stage, idx) => {
                const done = idx < currentStageIndex
                const current = idx === currentStageIndex
                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
                      style={
                        done
                          ? {
                              background: "var(--stage-accepted-dot)",
                              color: "#fff",
                            }
                          : current
                          ? {
                              background: "var(--accent)",
                              color: "#fff",
                            }
                          : {
                              background: "var(--bg-muted)",
                              color: "var(--fg-faint)",
                            }
                      }
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-[12px] font-bold">
                          {idx + 1}
                        </span>
                      )}
                    </span>
                    <span
                      className="text-[14px]"
                      style={{
                        color: current
                          ? "var(--primary)"
                          : done
                          ? "var(--fg)"
                          : "var(--fg-subtle)",
                        fontWeight: current ? 600 : 500,
                      }}
                    >
                      {stage.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ראיון מתוכנן */}
        {interview && (
          <div className="mt-3.5 flex items-center gap-4 rounded-lg border border-[var(--stage-interview-line)] bg-[var(--stage-interview-bg)] p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--stage-interview-dot)] text-white">
              <Calendar className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[14px] font-semibold text-[var(--stage-interview-fg)]">
                ראיון מתוכנן
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[13px] text-[var(--stage-interview-fg)]">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(interview.scheduled_at)} ·{" "}
                {new Date(interview.scheduled_at).toLocaleTimeString("he-IL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {interview.location && ` · ${interview.location}`}
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-[12px] text-fg-subtle">
          לשאלות — פנה ישירות למכינה.
        </p>
      </div>
    </div>
  )
}
