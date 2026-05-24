"use client"

import { Calendar } from "lucide-react"
import { InterviewWithCandidate } from "./CalendarView"

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  })
}
function dateKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10)
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "מתוכנן",
  completed: "הושלם",
  cancelled: "בוטל",
  no_show: "לא הגיע",
}

export function AgendaList({
  interviews,
  onEventClick,
}: {
  interviews: InterviewWithCandidate[]
  onEventClick: (iv: InterviewWithCandidate) => void
}) {
  const grouped: Record<string, InterviewWithCandidate[]> = {}
  for (const iv of interviews) {
    const k = dateKey(iv.scheduled_at)
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(iv)
  }
  const days = Object.keys(grouped).sort()

  if (days.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-8 py-20 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-lg border border-line bg-[var(--bg-subtle)] text-fg-muted">
          <Calendar className="h-6 w-6" />
        </span>
        <p className="m-0 text-[13px] text-fg-muted">אין ראיונות בטווח זה</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto px-7 py-6">
      <div className="flex flex-col gap-6">
        {days.map((day) => (
          <div key={day}>
            <div className="mb-2.5 text-[11.5px] uppercase tracking-[0.06em] text-fg-subtle">
              {fmtDate(grouped[day][0].scheduled_at)}
            </div>
            <div className="flex flex-col gap-2">
              {grouped[day].map((iv) => (
                <button
                  key={iv.id}
                  onClick={() => onEventClick(iv)}
                  className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4 text-start transition-[border-color,box-shadow] hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-sm)]"
                >
                  <div className="flex w-16 shrink-0 flex-col items-center">
                    <span className="text-[17px] font-semibold tracking-[-0.01em] text-primary [font-variant-numeric:tabular-nums]">
                      {fmtTime(iv.scheduled_at)}
                    </span>
                    <span className="text-[10.5px] text-fg-subtle">
                      {iv.duration_minutes} דק׳
                    </span>
                  </div>
                  <div className="h-10 w-px bg-line" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-[14px] font-semibold text-fg">
                      {iv.candidates?.full_name ?? "מועמד"}
                    </span>
                    {iv.location && (
                      <span className="truncate text-[12px] text-fg-muted">
                        {iv.location}
                      </span>
                    )}
                  </div>
                  <span className="rounded-full border border-line bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] text-fg-muted">
                    {STATUS_LABEL[iv.status] ?? iv.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
