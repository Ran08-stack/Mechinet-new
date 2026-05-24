"use client"

import { AlertTriangle, X } from "lucide-react"
import { InterviewWithCandidate } from "./CalendarView"

function fmtWhen(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }) +
    " · " +
    d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
  )
}

export function DeleteInterviewConfirm({
  interview,
  onClose,
  onConfirm,
}: {
  interview: InterviewWithCandidate
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <h2 className="m-0 text-[15px] font-semibold text-primary">
              לבטל את הראיון?
            </h2>
            <p className="mt-1 text-[12.5px] text-fg-muted">
              <b className="text-fg">
                {interview.candidates?.full_name ?? "מועמד"}
              </b>{" "}
              · {fmtWhen(interview.scheduled_at)}
            </p>
            <p className="mt-1.5 text-[11.5px] text-fg-subtle">
              הפעולה תופיע ב-"פעילות בזמן אמת".
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[var(--line-faint)] bg-[var(--bg-subtle)] px-4 py-3">
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-surface"
          >
            השאר
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex h-9 items-center rounded-md bg-[var(--danger)] px-4 text-[13px] font-medium text-white hover:opacity-90"
          >
            בטל ראיון
          </button>
        </div>
      </div>
    </div>
  )
}
