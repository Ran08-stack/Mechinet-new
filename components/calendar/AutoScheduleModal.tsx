"use client"

import { useMemo, useState } from "react"
import { X, Sparkles, AlertTriangle } from "lucide-react"
import { Candidate } from "@/types/database"
import { Interviewer, InterviewWithCandidate } from "./CalendarView"

type Plan = {
  candidateId: string
  candidateName: string
  scheduledAt: string // ISO
  interviewerId: string | null
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}
function parseHM(s: string): [number, number] {
  const [h, m] = s.split(":").map(Number)
  return [h || 0, m || 0]
}
function fmtDateHe(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}
function fmtTimeHe(iso: string): string {
  return new Date(iso).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AutoScheduleModal({
  pendingCandidates,
  existingInterviews,
  interviewers,
  onClose,
  onConfirm,
}: {
  pendingCandidates: Candidate[]
  existingInterviews: InterviewWithCandidate[]
  interviewers: Interviewer[]
  onClose: () => void
  onConfirm: (plan: Plan[], duration: number) => Promise<void>
}) {
  const today = new Date()
  const defaultEnd = addDays(today, 6)

  const [startDate, setStartDate] = useState(toISODate(today))
  const [endDate, setEndDate] = useState(toISODate(defaultEnd))
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [duration, setDuration] = useState(55)
  const [gap, setGap] = useState(5)
  const [skipWeekends, setSkipWeekends] = useState(true)
  const [selectedInterviewers, setSelectedInterviewers] = useState<Set<string>>(
    new Set(interviewers.map((i) => i.id))
  )
  const [busy, setBusy] = useState(false)

  function toggleInterviewer(id: string) {
    setSelectedInterviewers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // חישוב התוכנית — slots פנויים × pendingCandidates
  const plan = useMemo<Plan[]>(() => {
    if (!startDate || !endDate || pendingCandidates.length === 0) return []

    const start = new Date(startDate + "T00:00:00")
    const end = new Date(endDate + "T00:00:00")
    if (end < start) return []

    const [sh, sm] = parseHM(startTime)
    const [eh, em] = parseHM(endTime)
    const slotMinutes = duration + gap

    // רשימת מראיינים שנבחרו — מאפשרת ראיונות מקבילים
    const ivList = interviewers.filter((iv) => selectedInterviewers.has(iv.id))
    // אם אין מראיין נבחר — slot יחיד למועד (lane אחת ללא הקצאה)
    const lanes: { id: string | null; busy: { start: number; end: number }[] }[] =
      ivList.length > 0
        ? ivList.map((iv) => ({
            id: iv.id,
            busy: existingInterviews
              .filter(
                (i) => i.status === "scheduled" && i.interviewer_id === iv.id
              )
              .map((i) => {
                const s = new Date(i.scheduled_at).getTime()
                return { start: s, end: s + i.duration_minutes * 60_000 }
              }),
          }))
        : [
            {
              id: null,
              busy: existingInterviews
                .filter((i) => i.status === "scheduled")
                .map((i) => {
                  const s = new Date(i.scheduled_at).getTime()
                  return { start: s, end: s + i.duration_minutes * 60_000 }
                }),
            },
          ]

    const out: Plan[] = []
    const queue = [...pendingCandidates]
    let laneIdx = 0 // round-robin

    for (let d = new Date(start); d <= end && queue.length; d = addDays(d, 1)) {
      const dow = d.getDay()
      if (skipWeekends && dow === 6 /* שבת */) continue

      const dayStart = new Date(d)
      dayStart.setHours(sh, sm, 0, 0)
      const dayEnd = new Date(d)
      dayEnd.setHours(eh, em, 0, 0)

      for (
        let slot = new Date(dayStart);
        slot.getTime() + duration * 60_000 <= dayEnd.getTime() && queue.length;
        slot = new Date(slot.getTime() + slotMinutes * 60_000)
      ) {
        const slotStart = slot.getTime()
        const slotEnd = slotStart + duration * 60_000
        if (slotStart < Date.now()) continue

        // נסה כל מראיין בסיבוב — מציאת lane פנוי לזמן הזה
        for (let tries = 0; tries < lanes.length && queue.length; tries++) {
          const lane = lanes[laneIdx % lanes.length]
          laneIdx++
          const conflict = lane.busy.some(
            (r) => slotStart < r.end && slotEnd > r.start
          )
          if (conflict) continue
          const next = queue.shift()!
          out.push({
            candidateId: next.id,
            candidateName: next.full_name,
            scheduledAt: new Date(slotStart).toISOString(),
            interviewerId: lane.id,
          })
          lane.busy.push({ start: slotStart, end: slotEnd })
        }
      }
    }

    return out
  }, [
    startDate,
    endDate,
    startTime,
    endTime,
    duration,
    gap,
    skipWeekends,
    selectedInterviewers,
    interviewers,
    existingInterviews,
    pendingCandidates,
  ])

  const unscheduled = pendingCandidates.length - plan.length

  async function confirm() {
    if (plan.length === 0) return
    setBusy(true)
    await onConfirm(plan, duration)
    setBusy(false)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEAD */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line-faint)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-8 w-8 place-items-center rounded-md text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--ai-bright), var(--ai))",
              }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                תזמון אוטומטי של ראיונות
              </h2>
              <p className="m-0 text-[12px] text-fg-subtle">
                מילוי אוטומטי של כל המועמדים הממתינים בחלון הזמן שתבחר
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {pendingCandidates.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-fg-muted">
            אין מועמדים ממתינים לזימון. (מועמדים בשלב "ראיון" שאין להם
            ראיון מתוכנן.)
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2">
              {/* טווח תאריכים */}
              <Field label="מתאריך" required>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="עד תאריך" required>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputCls}
                />
              </Field>

              {/* טווח שעות */}
              <Field label="משעה" required>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="עד שעה" required>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="משך ראיון (דקות)">
                <input
                  type="number"
                  min={15}
                  max={300}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 55)}
                  className={inputCls}
                />
              </Field>
              <Field label="הפסקה בין ראיונות (דקות)">
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={gap}
                  onChange={(e) => setGap(parseInt(e.target.value) || 0)}
                  className={inputCls}
                />
              </Field>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-[13px] text-fg">
                  <input
                    type="checkbox"
                    checked={skipWeekends}
                    onChange={(e) => setSkipWeekends(e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  דלג על שבת
                </label>
              </div>
            </div>

            {/* בחירת מראיינים — multi */}
            <div className="border-t border-line bg-surface px-5 py-3.5">
              <label className="mb-1.5 block text-[13px] font-medium text-fg">
                מראיינים שישובצו{" "}
                <span className="text-[11.5px] text-fg-subtle">
                  ({selectedInterviewers.size} נבחרו — חלוקה שווה בין כולם)
                </span>
              </label>
              {interviewers.length === 0 ? (
                <p className="m-0 text-[12px] text-fg-subtle">
                  אין אנשי צוות במכינה. השיבוץ יבוצע ללא הקצאת מראיין.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {interviewers.map((iv) => {
                    const on = selectedInterviewers.has(iv.id)
                    const name = iv.full_name?.trim() || iv.email.split("@")[0]
                    return (
                      <button
                        key={iv.id}
                        type="button"
                        onClick={() => toggleInterviewer(iv.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                          on
                            ? "border-accent bg-[var(--accent-soft)] font-medium text-[var(--accent-hover)]"
                            : "border-line bg-surface text-fg-muted hover:bg-[var(--bg-subtle)]"
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                        {name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* PREVIEW */}
            <div className="border-t border-line bg-[var(--bg-subtle)] px-5 py-3.5">
              <div className="mb-2 flex items-center gap-2 text-[12.5px]">
                <span className="font-medium text-primary">תצוגה מקדימה</span>
                <span className="text-fg-subtle">·</span>
                <span className="text-fg-muted">
                  {plan.length} מתוך {pendingCandidates.length} מועמדים ישובצו
                </span>
                {unscheduled > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-2 py-0.5 text-[10.5px] text-[var(--accent-hover)]">
                    <AlertTriangle className="h-3 w-3" />
                    {unscheduled} ישארו ללא שיבוץ
                  </span>
                )}
              </div>
              <div
                className="max-h-[180px] overflow-y-auto rounded-md border border-line bg-surface"
                style={{ minHeight: plan.length === 0 ? 60 : undefined }}
              >
                {plan.length === 0 ? (
                  <div className="px-3 py-6 text-center text-[12px] text-fg-subtle">
                    אין shibutim — בדוק טווח התאריכים והשעות
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--line-faint)]">
                    {plan.map((p) => {
                      const iv = interviewers.find(
                        (i) => i.id === p.interviewerId
                      )
                      return (
                        <li
                          key={p.candidateId}
                          className="flex items-center gap-3 px-3 py-2 text-[12.5px]"
                        >
                          <span className="flex-1 truncate font-medium text-fg">
                            {p.candidateName}
                          </span>
                          {iv && (
                            <span className="truncate text-fg-muted">
                              {iv.full_name || iv.email.split("@")[0]}
                            </span>
                          )}
                          <span className="text-fg-subtle">
                            {fmtDateHe(p.scheduledAt)}
                          </span>
                          <span className="font-medium text-primary [direction:ltr] [font-variant-numeric:tabular-nums]">
                            {fmtTimeHe(p.scheduledAt)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-line bg-surface px-5 py-3">
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]"
          >
            ביטול
          </button>
          <button
            onClick={confirm}
            disabled={busy || plan.length === 0}
            className="inline-flex h-9 items-center gap-2 rounded-md px-4 text-[13px] font-medium text-white disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, var(--ai-bright), var(--ai))",
            }}
          >
            <Sparkles className="h-4 w-4" />
            {busy ? "משבץ…" : `תזמן ${plan.length} ראיונות`}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputCls =
  "h-10 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-fg">
        {label}
        {required && <span className="ms-1 text-[var(--danger)]">*</span>}
      </label>
      {children}
    </div>
  )
}
