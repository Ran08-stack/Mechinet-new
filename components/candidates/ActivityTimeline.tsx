"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CandidateEvent } from "@/types/database"
import {
  Activity,
  ArrowLeftRight,
  MessageSquare,
  Sparkles,
  Calendar,
  CalendarX,
  FileText,
  X,
} from "lucide-react"

// ציר זמן פעילות — מציג את האירועים של המועמד.
// מאזין ל-INSERTים חדשים דרך Supabase Realtime ומוסיף אותם מעלה ברשימה.

const EVENT_ICON: Record<
  string,
  { icon: typeof Activity; bg: string; fg: string }
> = {
  stage_changed: {
    icon: ArrowLeftRight,
    bg: "var(--primary-soft)",
    fg: "var(--primary)",
  },
  note_added: {
    icon: MessageSquare,
    bg: "var(--bg-muted)",
    fg: "var(--fg-muted)",
  },
  ai_summary: {
    icon: Sparkles,
    bg: "var(--ai-soft)",
    fg: "var(--ai-deep)",
  },
  interview_scheduled: {
    icon: Calendar,
    bg: "var(--accent-soft)",
    fg: "var(--accent-hover)",
  },
  interview_cancelled: {
    icon: CalendarX,
    bg: "var(--danger-soft)",
    fg: "var(--danger)",
  },
  interview_updated: {
    icon: Calendar,
    bg: "var(--accent-soft)",
    fg: "var(--accent-hover)",
  },
  form_submitted: {
    icon: FileText,
    bg: "var(--bg-muted)",
    fg: "var(--fg-muted)",
  },
}

function fmtWhen(iso: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  return (
    d.toLocaleDateString("he-IL", { day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
  )
}

export function ActivityTimeline({
  candidateId,
  initialEvents,
}: {
  candidateId: string
  initialEvents: CandidateEvent[]
}) {
  const [events, setEvents] = useState<CandidateEvent[]>(initialEvents)
  const [detail, setDetail] = useState<CandidateEvent | null>(null)

  useEffect(() => {
    if (!candidateId) return
    const supabase = createClient()

    async function refetch() {
      const { data } = await supabase
        .from("candidate_events")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false })
      if (data) setEvents(data)
    }

    const channel = supabase
      .channel(`candidate_events:candidate:${candidateId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "candidate_events",
          filter: `candidate_id=eq.${candidateId}`,
        },
        () => {
          refetch()
        }
      )
      .subscribe()

    const poll = setInterval(refetch, 8000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [candidateId])

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-2.5 border-b border-[var(--line-faint)] px-[18px] py-3.5">
        <Activity className="h-[15px] w-[15px] text-[var(--fg-faint)]" />
        <h2 className="m-0 text-[15px] font-semibold text-primary">
          היסטוריית פעילות
        </h2>
      </div>

      {events.length === 0 ? (
        <div className="px-[18px] py-8 text-center text-[12.5px] text-fg-subtle">
          אין פעילות מתועדת עדיין
        </div>
      ) : (
        <div className="flex flex-col py-2">
          {events.map((event, idx) => {
            const cfg = EVENT_ICON[event.type] ?? {
              icon: Activity,
              bg: "var(--bg-muted)",
              fg: "var(--fg-muted)",
            }
            const Icon = cfg.icon
            const isLast = idx === events.length - 1
            return (
              <div
                key={event.id}
                className="relative grid grid-cols-[22px_1fr] gap-2.5 px-[18px] py-2"
              >
                {!isLast && (
                  <span className="absolute bottom-[-8px] start-[28px] top-[26px] w-px bg-line" />
                )}
                <span
                  className="z-10 grid h-[22px] w-[22px] place-items-center rounded-full border border-line"
                  style={{ background: cfg.bg, color: cfg.fg }}
                >
                  <Icon className="h-[11px] w-[11px]" />
                </span>
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <span className="text-[13px] leading-snug text-fg">
                    {(event.description ?? event.type).split("\n")[0]}
                    {event.description && event.description.includes("\n") && (
                      <>
                        {" · "}
                        <button
                          onClick={() => setDetail(event)}
                          className="text-[12px] text-accent-hover underline-offset-2 hover:underline"
                        >
                          ראה עוד
                        </button>
                      </>
                    )}
                  </span>
                  <span className="text-[10.5px] text-fg-subtle">
                    {fmtWhen(event.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detail && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-line bg-surface p-4 shadow-[var(--shadow-md)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="m-0 text-[14px] font-semibold text-primary">
                {(detail.description ?? detail.type).split("\n")[0]}
              </h3>
              <button
                onClick={() => setDetail(null)}
                className="grid h-6 w-6 place-items-center rounded text-fg-muted hover:bg-[var(--bg-subtle)]"
                aria-label="סגור"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="m-0 flex flex-col gap-1.5 p-0 text-[12.5px] text-fg">
              {detail.description
                ?.split("\n")
                .slice(1)
                .filter(Boolean)
                .map((line, i) => (
                  <li key={i} className="list-none">
                    {line}
                  </li>
                ))}
            </ul>
            <div className="mt-3 text-[10.5px] text-fg-subtle">
              {fmtWhen(detail.created_at)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
