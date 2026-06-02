"use client"

import Link from "next/link"
import {
  X,
  User,
  UserCheck,
  MapPin,
  Video,
  Trash2,
  ClipboardCheck,
  ExternalLink,
  Pencil,
} from "lucide-react"
import { InterviewWithCandidate, Interviewer, avatarColor } from "./CalendarView"

function fmtWhen(iso: string, duration: number): string {
  const d = new Date(iso)
  const end = new Date(d.getTime() + duration * 60_000)
  const date = d.toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  const t = (x: Date) =>
    `${String(x.getHours()).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")}`
  return `${date} · ${t(d)} – ${t(end)}`
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "מתוכנן",
  completed: "הושלם",
  cancelled: "בוטל",
  no_show: "לא הגיע",
}

export function EventPopover({
  interview,
  interviewers,
  onClose,
  onDelete,
  onEdit,
  onStatusChange,
}: {
  interview: InterviewWithCandidate
  interviewers: Interviewer[]
  onClose: () => void
  onDelete: () => void
  onEdit: () => void
  onStatusChange: (status: string) => void
}) {
  const interviewer = interviewers.find((m) => m.id === interview.interviewer_id)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEAD */}
        <div className="flex items-start gap-3 border-b border-[var(--line-faint)] px-5 py-4">
          <span
            className="mt-0.5 h-9 w-[3px] shrink-0 rounded"
            style={{
              background: interview.interviewer_id
                ? avatarColor(interview.interviewer_id)
                : "var(--accent)",
            }}
          />
          <div className="flex-1">
            <h3 className="m-0 text-[15px] font-semibold text-primary">
              {interview.candidates?.full_name ?? "מועמד"}
            </h3>
            <div className="mt-1 text-[12px] text-fg-muted">
              {fmtWhen(interview.scheduled_at, interview.duration_minutes)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-col gap-2.5 px-5 py-4 text-[13px]">
          <Row icon={UserCheck} label="מועמד">
            {interview.candidates?.full_name ?? "—"}
          </Row>
          <Row icon={User} label="מראיין">
            {interviewer ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold text-white"
                  style={{ background: avatarColor(interviewer.id) }}
                >
                  {initials(interviewer.full_name || interviewer.email)}
                </span>
                {interviewer.full_name || interviewer.email.split("@")[0]}
              </span>
            ) : (
              "לא הוקצה"
            )}
          </Row>
          {interview.location && (
            <Row icon={MapPin} label="מיקום">
              {interview.location}
            </Row>
          )}
          {interview.meeting_url && (
            <Row icon={Video} label="קישור">
              <a
                href={interview.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:text-accent hover:underline [direction:ltr]"
              >
                {interview.meeting_url}
              </a>
            </Row>
          )}
          {/* status select */}
          <Row icon={ClipboardCheck} label="סטטוס">
            <select
              value={interview.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="h-7 rounded-md border border-line bg-surface px-2 text-[12.5px] outline-none focus:border-accent"
            >
              {Object.entries(STATUS_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Row>
        </div>

        {/* FOOT */}
        <div className="flex items-center gap-2 border-t border-line bg-[var(--bg-subtle)] px-4 py-3">
          <button
            onClick={onDelete}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] text-[var(--danger)] hover:border-[var(--stage-rejected-line)] hover:bg-[var(--danger-soft)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            בטל ראיון
          </button>
          <button
            onClick={onEdit}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] text-fg hover:bg-surface"
          >
            <Pencil className="h-3.5 w-3.5" />
            ערוך
          </button>
          <Link
            href={`/interviews/${interview.id}/evaluate`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] text-fg hover:bg-surface"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            הערכה
          </Link>
          <div className="flex-1" />
          {interview.candidate_id && (
            <Link
              href={`/candidates/${interview.candidate_id}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-medium text-white hover:bg-[var(--primary-2)]"
            >
              פתח כרטיס
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--fg-faint)]" />
      <span className="w-14 shrink-0 text-fg-subtle">{label}</span>
      <span className="flex-1 text-fg">{children}</span>
    </div>
  )
}

function initials(s: string): string {
  const parts = s.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return s.slice(0, 2).toUpperCase()
}
