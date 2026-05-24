"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react"
import { Interview, Candidate } from "@/types/database"
import { logCandidateEvent } from "@/lib/events"
import { WeekGrid } from "./WeekGrid"
import { AgendaList } from "./AgendaList"
import { EventPopover } from "./EventPopover"
import { NewEventModal } from "./NewEventModal"
import { AutoScheduleModal } from "./AutoScheduleModal"
import { DeleteInterviewConfirm } from "./DeleteInterviewConfirm"

export type InterviewWithCandidate = Interview & {
  candidates: { full_name: string } | null
}

export type Interviewer = {
  id: string
  full_name: string | null
  email: string
}

type View = "week" | "agenda"

// תחילת השבוע = ראשון מקומי
function startOfWeek(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  out.setDate(out.getDate() - out.getDay())
  return out
}
function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function fmtRange(start: Date): string {
  const end = addDays(start, 6)
  const sameMonth = start.getMonth() === end.getMonth()
  const f = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long" })
  const year = end.getFullYear()
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ב${f.formatToParts(end).find((p) => p.type === "month")?.value} ${year}`
  }
  return `${f.format(start)} — ${f.format(end)} ${year}`
}

function fmtHebrewMonth(d: Date): string {
  try {
    return new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
      month: "long",
      year: "numeric",
    }).format(d)
  } catch {
    return ""
  }
}

export default function CalendarView({
  initialInterviews,
  candidates,
  interviewers,
  pendingCandidates,
  organizationId,
}: {
  initialInterviews: InterviewWithCandidate[]
  candidates: Candidate[]
  interviewers: Interviewer[]
  pendingCandidates: Candidate[]
  organizationId: string
}) {
  const router = useRouter()
  const supabase = createClient()

  const [interviews, setInterviews] =
    useState<InterviewWithCandidate[]>(initialInterviews)
  const [view, setView] = useState<View>("week")
  const [anchor, setAnchor] = useState<Date>(startOfWeek(new Date()))
  const [selected, setSelected] = useState<InterviewWithCandidate | null>(null)
  const [newModal, setNewModal] = useState<{
    open: boolean
    prefillDate?: string
    prefillTime?: string
    prefillCandidateId?: string
  }>({ open: false })
  const [autoOpen, setAutoOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<InterviewWithCandidate | null>(null)

  // מסנן מראיינים — סט של ids פעילים. ריק = הצג הכול.
  const [activeInterviewers, setActiveInterviewers] = useState<Set<string>>(
    new Set()
  )

  const filtered = useMemo(() => {
    if (activeInterviewers.size === 0) return interviews
    return interviews.filter(
      (i) => i.interviewer_id && activeInterviewers.has(i.interviewer_id)
    )
  }, [interviews, activeInterviewers])

  function toggleInterviewer(id: string) {
    setActiveInterviewers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleCreate(input: {
    candidateId: string
    date: string
    time: string
    duration: number
    location: string
    meetingUrl: string
    interviewerId: string
  }) {
    const scheduled_at = new Date(`${input.date}T${input.time}`).toISOString()
    const { data, error } = await supabase
      .from("interviews")
      .insert({
        organization_id: organizationId,
        candidate_id: input.candidateId,
        scheduled_at,
        duration_minutes: input.duration || 55,
        location: input.location || null,
        meeting_url: input.meetingUrl || null,
        interviewer_id: input.interviewerId || null,
      })
      .select("*, candidates(full_name)")
      .single()
    if (error || !data) {
      alert("שגיאה בקביעת ראיון")
      return
    }
    await logCandidateEvent({
      candidateId: input.candidateId,
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
    setNewModal({ open: false })
    router.refresh()
  }

  async function handleDelete(iv: InterviewWithCandidate) {
    await supabase.from("interviews").delete().eq("id", iv.id)
    // רישום אירוע — יופיע ב-LiveActivity וב-ActivityTimeline
    await logCandidateEvent({
      candidateId: iv.candidate_id,
      organizationId,
      type: "interview_cancelled",
      description: `ראיון בוטל — ${iv.candidates?.full_name ?? "מועמד"}`,
    })
    setInterviews((prev) => prev.filter((i) => i.id !== iv.id))
    setSelected(null)
    setConfirmDelete(null)
    router.refresh()
  }

  async function handleStatusChange(id: string, status: string) {
    await supabase.from("interviews").update({ status }).eq("id", id)
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    )
    if (selected?.id === id) setSelected({ ...selected, status })
    router.refresh()
  }

  function gotoToday() {
    setAnchor(startOfWeek(new Date()))
  }
  function gotoPrev() {
    setAnchor(addDays(anchor, -7))
  }
  function gotoNext() {
    setAnchor(addDays(anchor, 7))
  }

  function openNewAt(dayIso: string, hour: number) {
    setNewModal({
      open: true,
      prefillDate: dayIso,
      prefillTime: `${String(hour).padStart(2, "0")}:00`,
    })
  }

  function schedulePending(candidateId: string) {
    setNewModal({ open: true, prefillCandidateId: candidateId })
  }

  return (
    <div className="flex h-[calc(100vh-60px)] flex-col bg-surface">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-7 py-3">
        <h1 className="m-0 text-[20px] font-semibold tracking-[-0.01em] text-primary">
          יומן
        </h1>
        <button
          onClick={gotoToday}
          className="h-7 rounded-md border border-line bg-surface px-3 text-[12.5px] font-medium text-primary hover:bg-[var(--bg-subtle)]"
        >
          היום
        </button>
        <div className="inline-flex items-center gap-0.5">
          {/* RTL: ימין = שבוע קודם, שמאל = שבוע הבא — לפי כיוון הזמן בעברית */}
          <button
            onClick={gotoPrev}
            aria-label="שבוע קודם"
            title="שבוע קודם"
            className="inline-grid h-7 w-7 place-items-center rounded text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={gotoNext}
            aria-label="שבוע הבא"
            title="שבוע הבא"
            className="inline-grid h-7 w-7 place-items-center rounded text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-[15px] font-medium text-primary">
          {fmtRange(anchor)}
          <em className="ms-2 not-italic text-[12.5px] font-normal text-fg-subtle">
            {fmtHebrewMonth(anchor)}
          </em>
        </span>
        <div className="flex-1" />
        <div className="inline-flex rounded-md bg-[var(--bg-subtle)] p-0.5">
          {(["week", "agenda"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`h-7 rounded px-3 text-[12.5px] transition-colors ${
                view === v
                  ? "bg-surface font-medium text-primary shadow-[var(--shadow-xs)]"
                  : "text-fg-muted hover:bg-surface"
              }`}
            >
              {v === "week" ? "שבוע" : "רשימה"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAutoOpen(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--ai-bright), var(--ai))",
          }}
          title="תזמון אוטומטי של כל הממתינים לראיון"
        >
          <Sparkles className="h-3.5 w-3.5" />
          תזמון אוטומטי
          {pendingCandidates.length > 0 && (
            <span className="ms-0.5 rounded-full bg-white/25 px-1.5 py-px text-[10.5px] font-semibold">
              {pendingCandidates.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setNewModal({ open: true })}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-white hover:bg-[var(--primary-2)]"
        >
          <Plus className="h-3.5 w-3.5" />
          אירוע
        </button>
      </div>

      {/* PENDING STRIP */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-bg px-7 py-2 text-[12.5px] text-fg-muted">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          <span>
            <b className="font-medium text-fg">
              {pendingCandidates.length} מועמדים
            </b>{" "}
            ממתינים לזימון לראיון
          </span>
        </span>
        {pendingCandidates.length > 0 && (
          <div className="flex gap-1.5">
            {pendingCandidates.slice(0, 3).map((c) => (
              <button
                key={c.id}
                onClick={() => schedulePending(c.id)}
                className="inline-flex h-6 items-center gap-1 rounded-full border border-line bg-surface px-2.5 text-[11.5px] text-fg hover:border-accent hover:bg-[var(--accent-soft)]"
              >
                + {c.full_name}
              </button>
            ))}
            {pendingCandidates.length > 3 && (
              <span className="text-[11.5px] text-fg-subtle">
                ועוד {pendingCandidates.length - 3}…
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {interviewers.length > 0 && (
          <div className="inline-flex flex-wrap items-center gap-1">
            <span className="me-1 text-[11px] text-fg-subtle">מסנן:</span>
            {interviewers.map((iv) => {
              const on =
                activeInterviewers.size === 0 || activeInterviewers.has(iv.id)
              const display = iv.full_name?.trim() || iv.email.split("@")[0]
              return (
                <button
                  key={iv.id}
                  onClick={() => toggleInterviewer(iv.id)}
                  className={`inline-flex h-6 items-center gap-1.5 rounded-full border bg-surface px-2 ps-2.5 text-[11.5px] transition-opacity ${
                    on
                      ? "border-line text-fg"
                      : "border-line text-fg opacity-40"
                  } hover:bg-[var(--bg-subtle)]`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: avatarColor(iv.id) }}
                  />
                  {display}
                </button>
              )
            })}
            {activeInterviewers.size > 0 && (
              <button
                onClick={() => setActiveInterviewers(new Set())}
                className="text-[11.5px] text-primary hover:text-accent"
              >
                נקה
              </button>
            )}
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-hidden">
        {view === "week" ? (
          <WeekGrid
            weekStart={anchor}
            interviews={filtered}
            interviewers={interviewers}
            onEventClick={setSelected}
            onSlotClick={openNewAt}
          />
        ) : (
          <AgendaList
            interviews={filtered}
            onEventClick={setSelected}
          />
        )}
      </div>

      {selected && (
        <EventPopover
          interview={selected}
          interviewers={interviewers}
          onClose={() => setSelected(null)}
          onDelete={() => setConfirmDelete(selected)}
          onStatusChange={(s) => handleStatusChange(selected.id, s)}
        />
      )}

      {confirmDelete && (
        <DeleteInterviewConfirm
          interview={confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}

      {autoOpen && (
        <AutoScheduleModal
          pendingCandidates={pendingCandidates}
          existingInterviews={interviews}
          interviewers={interviewers}
          onClose={() => setAutoOpen(false)}
          onConfirm={async (plan, duration) => {
            const rows = plan.map((p) => ({
              organization_id: organizationId,
              candidate_id: p.candidateId,
              scheduled_at: p.scheduledAt,
              duration_minutes: duration,
              interviewer_id: p.interviewerId,
            }))
            const { data, error } = await supabase
              .from("interviews")
              .insert(rows)
              .select("*, candidates(full_name)")
            if (error || !data) {
              alert("שגיאה בתזמון אוטומטי")
              return
            }
            for (const p of plan) {
              await logCandidateEvent({
                candidateId: p.candidateId,
                organizationId,
                type: "interview_scheduled",
                description: "ראיון נקבע אוטומטית",
              })
            }
            setInterviews((prev) =>
              [...prev, ...(data as InterviewWithCandidate[])].sort(
                (a, b) =>
                  new Date(a.scheduled_at).getTime() -
                  new Date(b.scheduled_at).getTime()
              )
            )
            setAutoOpen(false)
            router.refresh()
          }}
        />
      )}

      {newModal.open && (
        <NewEventModal
          candidates={candidates}
          interviewers={interviewers}
          prefillDate={newModal.prefillDate}
          prefillTime={newModal.prefillTime}
          prefillCandidateId={newModal.prefillCandidateId}
          onClose={() => setNewModal({ open: false })}
          onSubmit={handleCreate}
        />
      )}
    </div>
  )
}

// צבע אווטאר יציב לפי id
const AVATAR_COLORS = [
  "#374765",
  "#fe6f42",
  "#00a58e",
  "#7c5cd6",
  "#c1583d",
  "#3a8fb7",
]
export function avatarColor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export { startOfWeek, addDays, sameDay }
