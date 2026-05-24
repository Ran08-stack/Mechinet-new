"use client"

import { useState } from "react"
import { X, Clock } from "lucide-react"
import { Candidate } from "@/types/database"
import { Interviewer } from "./CalendarView"

export function NewEventModal({
  candidates,
  interviewers,
  prefillDate,
  prefillTime,
  prefillCandidateId,
  onClose,
  onSubmit,
}: {
  candidates: Candidate[]
  interviewers: Interviewer[]
  prefillDate?: string
  prefillTime?: string
  prefillCandidateId?: string
  onClose: () => void
  onSubmit: (input: {
    candidateId: string
    date: string
    time: string
    duration: number
    location: string
    meetingUrl: string
    interviewerId: string
  }) => Promise<void> | void
}) {
  const [candidateId, setCandidateId] = useState(prefillCandidateId ?? "")
  const [date, setDate] = useState(prefillDate ?? "")
  const [time, setTime] = useState(prefillTime ?? "")
  const [duration, setDuration] = useState("55")
  const [interviewerId, setInterviewerId] = useState("")
  const [location, setLocation] = useState("")
  const [meetingUrl, setMeetingUrl] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!candidateId || !date || !time) return
    setBusy(true)
    await onSubmit({
      candidateId,
      date,
      time,
      duration: parseInt(duration) || 55,
      location,
      meetingUrl,
      interviewerId,
    })
    setBusy(false)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
          <h2 className="m-0 text-[15px] font-semibold text-primary">
            ראיון חדש
          </h2>
          <button
            onClick={onClose}
            className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3 p-5">
          <Field label="מועמד" required>
            <select
              required
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className={inputCls}
            >
              <option value="">בחר מועמד…</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="מראיין">
            <select
              value={interviewerId}
              onChange={(e) => setInterviewerId(e.target.value)}
              className={inputCls}
            >
              <option value="">ללא הקצאה</option>
              {interviewers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name || m.email.split("@")[0]}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="תאריך" required>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="שעה" required>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="משך (דקות)">
            <input
              type="number"
              min={15}
              max={300}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="מיקום">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="חדר ראיונות, כתובת…"
              className={inputCls}
            />
          </Field>

          <Field label="קישור לפגישה">
            <input
              type="url"
              dir="ltr"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>

          <div className="mt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              <Clock className="h-4 w-4" />
              {busy ? "שומר…" : "קבע ראיון"}
            </button>
          </div>
        </form>
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
