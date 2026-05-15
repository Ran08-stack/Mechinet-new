"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Plus,
  Clock,
} from "lucide-react"
import { Candidate } from "@/types/database"
import { STAGE_LABELS, formatDate } from "@/lib/utils"

const STAGES = ["new", "review", "interview", "accepted", "rejected"] as const
type Stage = (typeof STAGES)[number]

const STAGE_COLOR: Record<string, string> = {
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

export default function KanbanBoard({
  initialCandidates,
}: {
  initialCandidates: Candidate[]
}) {
  const [candidates, setCandidates] = useState(initialCandidates)
  const [moving, setMoving] = useState<string | null>(null)

  async function moveCandidate(candidateId: string, newStage: Stage) {
    setMoving(candidateId)
    // עדכון אופטימי
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    )
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error } = await supabase
      .from("candidates")
      .update({ stage: newStage })
      .eq("id", candidateId)
    if (error) {
      setCandidates(initialCandidates)
    }
    setMoving(null)
  }

  const byStage = (stage: string) =>
    candidates.filter((c) => c.stage === stage)

  return (
    <div
      className="grid flex-1 grid-cols-[repeat(5,minmax(280px,1fr))] gap-3.5 overflow-x-auto px-7 pb-7"
      dir="rtl"
    >
      {STAGES.map((stage) => {
        const cols = byStage(stage)
        const stageIndex = STAGES.indexOf(stage)
        const color = STAGE_COLOR[stage]
        return (
          <div
            key={stage}
            className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-[var(--bg-subtle)]"
          >
            {/* כותרת עמודה */}
            <div
              className="relative flex items-center gap-2.5 border-b border-line bg-surface px-3.5 pb-3 pt-3.5"
            >
              {/* פס צבע עליון */}
              <span
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: color }}
              />
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: color }}
              />
              <h2 className="m-0 flex-1 text-[13px] font-semibold text-primary">
                {STAGE_LABELS[stage]}
              </h2>
              <span className="rounded-full border border-line bg-[var(--bg-muted)] px-2 py-0.5 font-mono text-[11px] text-fg-muted [font-variant-numeric:tabular-nums]">
                {cols.length}
              </span>
              <button className="inline-grid h-6 w-6 place-items-center rounded text-[var(--fg-faint)] hover:bg-[var(--bg-subtle)] hover:text-primary">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* רשימת כרטיסים */}
            <div className="flex min-h-[100px] flex-1 flex-col gap-2 overflow-y-auto p-2.5">
              {cols.map((candidate, idx) => {
                const canRight = stageIndex < STAGES.length - 1
                const canLeft = stageIndex > 0
                return (
                  <div
                    key={candidate.id}
                    className={`group relative flex flex-col gap-2.5 rounded-md border border-line bg-surface p-3 transition-[border-color,box-shadow] hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-sm)] ${
                      moving === candidate.id ? "opacity-50" : ""
                    }`}
                  >
                    {/* פס צבע ימני */}
                    <span
                      className="absolute inset-y-3 end-0 w-0.5 rounded"
                      style={{ background: color }}
                    />

                    <div className="flex items-center gap-2">
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.35)]"
                        style={{
                          background: AV_GRADIENTS[idx % AV_GRADIENTS.length],
                        }}
                      >
                        {initials(candidate.full_name)}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col leading-tight">
                        <Link
                          href={`/candidates/${candidate.id}`}
                          className="truncate text-[13.5px] font-semibold text-fg hover:text-accent"
                        >
                          {candidate.full_name}
                        </Link>
                        <small className="truncate text-[11px] text-fg-subtle">
                          {candidate.city ?? candidate.email}
                        </small>
                      </span>
                      <button className="inline-grid h-[22px] w-[22px] place-items-center rounded text-[var(--fg-faint)] opacity-0 transition-opacity hover:bg-[var(--bg-subtle)] hover:text-fg group-hover:opacity-100">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* meta — קו מקווקו */}
                    <div className="flex items-center gap-2.5 border-t border-dashed border-line pt-2 font-mono text-[11px] text-fg-subtle">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-[11px] w-[11px] opacity-70" />
                        {formatDate(candidate.created_at)}
                      </span>
                    </div>

                    {/* כפתורי העברה */}
                    <div className="flex gap-1">
                      {canRight && (
                        <button
                          onClick={() =>
                            moveCandidate(
                              candidate.id,
                              STAGES[stageIndex + 1]
                            )
                          }
                          disabled={moving === candidate.id}
                          className="flex flex-1 items-center justify-center gap-1 rounded border border-line px-2 py-1 text-[11px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
                        >
                          <ChevronLeft className="h-3 w-3" />
                          {STAGE_LABELS[STAGES[stageIndex + 1]]}
                        </button>
                      )}
                      {canLeft && (
                        <button
                          onClick={() =>
                            moveCandidate(
                              candidate.id,
                              STAGES[stageIndex - 1]
                            )
                          }
                          disabled={moving === candidate.id}
                          className="rounded border border-line px-2 py-1 text-[11px] text-fg-subtle transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
                          title={`החזר ל${STAGE_LABELS[STAGES[stageIndex - 1]]}`}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {cols.length === 0 && (
                <div className="px-4 py-10 text-center text-[12px] text-[var(--fg-faint)]">
                  אין מועמדים בשלב זה
                </div>
              )}
            </div>

            {/* כפתור הוסף מועמד */}
            <button className="mx-2.5 mb-3 mt-1 flex h-9 items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--line-strong)] text-[13px] text-fg-subtle transition-colors hover:border-accent hover:bg-[var(--accent-soft)] hover:text-accent">
              <Plus className="h-3.5 w-3.5" />
              הוסף מועמד
            </button>
          </div>
        )
      })}
    </div>
  )
}
