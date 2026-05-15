"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { STAGE_LABELS } from "@/lib/utils"
import { logCandidateEvent } from "@/lib/events"

const ALL_STAGES = ["new", "review", "interview", "accepted", "rejected"]

const STAGE_DOT: Record<string, string> = {
  new: "var(--stage-new-dot)",
  review: "var(--stage-review-dot)",
  interview: "var(--stage-interview-dot)",
  accepted: "var(--stage-accepted-dot)",
  rejected: "var(--stage-rejected-dot)",
}

export default function StageSelector({
  candidateId,
  organizationId,
  currentStage,
}: {
  candidateId: string
  organizationId: string
  currentStage: string
}) {
  const [stage, setStage] = useState(currentStage)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleChange(newStage: string) {
    if (newStage === stage || loading) return
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from("candidates")
      .update({ stage: newStage })
      .eq("id", candidateId)
    await logCandidateEvent({
      candidateId,
      organizationId,
      type: "stage_changed",
      description: `השלב שונה ל"${STAGE_LABELS[newStage] ?? newStage}"`,
    })
    setStage(newStage)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
        שלב
      </span>
      <div className="flex max-w-[720px] flex-1 items-center gap-0.5 rounded-full border border-line bg-[var(--bg-subtle)] p-[3px]">
        {ALL_STAGES.map((s) => {
          const active = stage === s
          return (
            <button
              key={s}
              onClick={() => handleChange(s)}
              disabled={loading}
              className={`flex h-[30px] flex-1 items-center justify-center gap-[7px] rounded-full text-[13px] transition-all ${
                active
                  ? "bg-surface font-semibold text-primary shadow-[var(--shadow-xs)]"
                  : "font-medium text-fg-muted hover:text-fg"
              } ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ background: STAGE_DOT[s] }}
              />
              {STAGE_LABELS[s]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
