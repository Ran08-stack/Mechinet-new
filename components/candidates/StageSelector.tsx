"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { logCandidateEvent } from "@/lib/events"
import { PipelineStage } from "@/types/database"

export default function StageSelector({
  candidateId,
  organizationId,
  currentStage,
  stages,
}: {
  candidateId: string
  organizationId: string
  currentStage: string
  stages: PipelineStage[]
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
      description: `השלב שונה ל"${newStage}"`,
    })
    setStage(newStage)
    setLoading(false)
    router.refresh()
  }

  if (stages.length === 0) {
    return (
      <div className="text-[12px] text-fg-subtle">
        לא הוגדרו שלבי קבלה. ניתן להגדיר ב<a href="/settings" className="text-accent">הגדרות</a>.
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
        שלב
      </span>
      <div className="flex max-w-[720px] flex-1 items-center gap-0.5 rounded-full border border-line bg-[var(--bg-subtle)] p-[3px]">
        {stages.map((s) => {
          const active = stage === s.name
          return (
            <button
              key={s.id}
              onClick={() => handleChange(s.name)}
              disabled={loading}
              className={`flex h-[30px] flex-1 items-center justify-center gap-[7px] rounded-full text-[13px] transition-all ${
                active
                  ? "bg-surface font-semibold text-primary shadow-[var(--shadow-xs)]"
                  : "font-medium text-fg-muted hover:text-fg"
              } ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              <span className="h-[7px] w-[7px] rounded-full bg-current opacity-60" />
              {s.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
