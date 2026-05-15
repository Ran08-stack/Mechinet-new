"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, Calendar, Clock, MapPin, Video, X, Trash2, ClipboardCheck } from "lucide-react"
import { Interview, Candidate } from "@/types/database"
import { logCandidateEvent } from "@/lib/events"

type InterviewWithCandidate = Interview & {
  candidates: { full_name: string } | null
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "מתוכנן",
  completed: "הושלם",
  cancelled: "בוטל",
  no_show: "לא הגיע",
}

const STATUS_STYLE: Record<
  string,
  { bg: string; fg: string; line: string }
> = {
  scheduled: {
    bg: "var(--stage-interview-bg)",
    fg: "var(--stage-interview-fg)",
    line: "var(--stage-interview-line)",
  },
  completed: {
    bg: "var(--stage-accepted-bg)",
    fg: "var(--stage-accepted-fg)",
    line: "var(--stage-accepted-line)",
  },
  cancelled: {
    bg: "var(--stage-rejected-bg)",
    fg: "var(--stage-rejected-fg)",
    line: "var(--stage-rejected-line)",
  },
  no_show: {
    bg: "var(--bg-muted)",
    fg: "var(--fg-muted)",
    line: "var(--line-strong)",
  },
}

function fmtDateHeader(iso: string) {
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

export default function CalendarView({
  initialInterviews,
  candidates,
  organizationId,
}: {
  initialInterviews: InterviewWithCandidate[]
  candidates: Candidate[]
  organizationId: string
}) {
  const router = useRouter()
  const [interviews, setInterviews] = useState(initialInterviews)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [candidateId, setCandidateId] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("55")
  const [location, setLocation] = useState("")
  const [meetingUrl, setMeetingUrl] = useState("")

  function resetForm() {
    setCandidateId("")
    setDate("")
    setTime("")
    setDuration("55")
    setLocation("")
    setMeetingUrl("")
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!candidateId || !date || !time) return
    setSaving(true)
    const scheduled_at = new Date(`${date}T${time}`).toISOString()
    const supabase = createClient()
    const { data, error } = await supabase
      .from("interviews")
      .insert({
        organization_id: organizationId,
        candidate_id: candidateId,
        scheduled_at,
        duration_minutes: parseInt(duration) || 55,
        location: location || null,
        meeting_url: meetingUrl || null,
      })
      .select("*, candidates(full_name)")
      .single()
    if (!error && data) {
      await logCandidateEvent({
        candidateId,
        organizationId,
        type: "interview_scheduled",
        description: "ראיון נקבע",
      })
      setInterviews((prev) =>
        [...prev, data as InterviewWithCandidate].sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime()
        )
      )
      resetForm()
      setShowForm(false)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from("interviews").delete().eq("id", id)
    setInterviews((prev) => prev.filter((i) => i.id !== id))
    router.refresh()
  }

  async function handleStatusChange(id: string, status: string) {
    const supabase = createClient()
    await supabase.from("interviews").update({ status }).eq("id", id)
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    )
    router.refresh()
  }

  const grouped: Record<string, InterviewWithCandidate[]> = {}
  for (const iv of interviews) {
    const k = dateKey(iv.scheduled_at)
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(iv)
  }
  const sortedDays = Object.keys(grouped).sort()

  return (
    <div className="pb-14">
      <div className="flex items-end justify-between gap-5 px-7 pb-[18px] pt-7">
        <div>
          <h1 className="m-0 text-[24px] font-semibold leading-[34px] tracking-[-0.015em] text-primary">
            יומן ראיונות
          </h1>
          <p className="mt-1.5 text-[13px] text-fg-muted">
            כל הראיונות המתוכננים, לפי תאריך.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          ראיון חדש
        </button>
      </div>

      <div className="px-7">
        {sortedDays.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-8 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-lg border border-line bg-[var(--bg-subtle)] text-fg-muted">
              <Calendar className="h-6 w-6" />
            </span>
            <p className="m-0 text-[13px] text-fg-muted">
              אין ראיונות מתוכננים
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              קבע ראיון ראשון
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {sortedDays.map((day) => (
              <div key={day}>
                <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
                  {fmtDateHeader(grouped[day][0].scheduled_at)}
                </div>
                <div className="flex flex-col gap-2">
                  {grouped[day].map((iv) => {
                    const st =
                      STATUS_STYLE[iv.status] ?? STATUS_STYLE.scheduled
                    return (
                      <div
                        key={iv.id}
                        className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-sm)]"
                      >
                        <div className="flex w-16 shrink-0 flex-col items-center">
                          <span className="text-[17px] font-semibold tracking-[-0.01em] text-primary [font-variant-numeric:tabular-nums]">
                            {fmtTime(iv.scheduled_at)}
                          </span>
                          <span className="font-mono text-[10.5px] text-fg-subtle">
                            {iv.duration_minutes} דק׳
                          </span>
                        </div>

                        <div className="h-10 w-px bg-line" />

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="text-[14px] font-semibold text-fg">
                            {iv.candidates?.full_name ?? "מועמד"}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12px] text-fg-muted">
                            {iv.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-[var(--fg-faint)]" />
                                {iv.location}
                              </span>
                            )}
                            {iv.meeting_url && (
                              <a
                                href={iv.meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:text-accent"
                              >
                                <Video className="h-3 w-3" />
                                קישור לפגישה
                              </a>
                            )}
                          </div>
                        </div>

                        <select
                          value={iv.status}
                          onChange={(e) =>
                            handleStatusChange(iv.id, e.target.value)
                          }
                          className="h-[26px] cursor-pointer rounded-full border px-2.5 text-[11.5px] font-medium outline-none"
                          style={{
                            background: st.bg,
                            color: st.fg,
                            borderColor: st.line,
                          }}
                        >
                          {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>

                        <Link
                          href={`/interviews/${iv.id}/evaluate`}
                          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
                        >
                          <ClipboardCheck className="h-3.5 w-3.5" />
                          הערכה
                        </Link>
                        <button
                          onClick={() => handleDelete(iv.id)}
                          className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line text-[var(--fg-faint)] transition-colors hover:border-[var(--stage-rejected-line)] hover:bg-[var(--stage-rejected-bg)] hover:text-[var(--stage-rejected-fg)]"
                          aria-label="מחק ראיון"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "var(--overlay)" }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                ראיון חדש
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">
                  מועמד
                </label>
                <select
                  required
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="">בחר מועמד…</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-fg">
                    תאריך
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-fg">
                    שעה
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">
                  משך (דקות)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">
                  מיקום <span className="text-fg-subtle">(אופציונלי)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="חדר ראיונות, כתובת…"
                  className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">
                  קישור לפגישה{" "}
                  <span className="text-fg-subtle">(אופציונלי)</span>
                </label>
                <input
                  type="url"
                  dir="ltr"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://…"
                  className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
                />
              </div>

              <div className="mt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  <Clock className="h-4 w-4" />
                  {saving ? "שומר…" : "קבע ראיון"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
