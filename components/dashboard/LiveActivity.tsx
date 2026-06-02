"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CandidateEvent } from "@/types/database"
import {
  Activity,
  MessageSquare,
  Sparkles,
  Calendar,
  CalendarX,
  FileText,
  Check,
  X,
} from "lucide-react"

// פעילות בזמן אמת — מוצג בלוח הבקרה לצד "מועמדים אחרונים".
// טוען events של candidate_events של המכינה, ממוין מהחדש לישן.
// מאזין ל-INSERTים חדשים דרך Supabase Realtime ומוסיף אותם מעלה ברשימה.

type LiveEvent = CandidateEvent & {
  actor?: { full_name: string | null; email: string } | null
  candidate?: { full_name: string } | null
}

const EVENT_STYLE: Record<
  string,
  { icon: typeof Activity; tone: "orange" | "navy" | "teal" | "default" | "danger" }
> = {
  stage_changed: { icon: Check, tone: "navy" },
  note_added: { icon: MessageSquare, tone: "default" },
  ai_summary: { icon: Sparkles, tone: "teal" },
  interview_scheduled: { icon: Calendar, tone: "orange" },
  interview_cancelled: { icon: CalendarX, tone: "danger" },
  interview_updated: { icon: Calendar, tone: "orange" },
  form_submitted: { icon: FileText, tone: "default" },
}

const TONE_CLASS: Record<string, string> = {
  orange:
    "bg-[var(--accent-soft)] text-[var(--accent-hover)] border-[var(--accent-line)]",
  navy: "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary-line)]",
  teal: "bg-[var(--ai-soft)] text-[var(--ai-deep)] border-[var(--ai-line)]",
  default: "bg-surface text-fg-muted border-line",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]",
}

function timeAgo(iso: string | null): string {
  if (!iso) return ""
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "כרגע"
  if (mins < 60) return `לפני ${mins} דק׳`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `לפני ${hours} שעות`
  const days = Math.floor(hours / 24)
  if (days < 7) return `לפני ${days} ימים`
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
  })
}

function actorName(actor: LiveEvent["actor"]): string {
  if (!actor) return "המערכת"
  return actor.full_name?.trim() || actor.email?.split("@")[0] || "משתמש"
}

function describe(ev: LiveEvent): React.ReactNode {
  const cand = ev.candidate?.full_name
  const actor = actorName(ev.actor)
  switch (ev.type) {
    case "stage_changed": {
      const m = ev.description?.match(/"([^"]+)"/)
      const stage = m?.[1] ?? ""
      return (
        <>
          <b className="font-semibold">{actor}</b> העביר את{" "}
          <b className="font-semibold">{cand ?? "מועמד"}</b> לשלב{" "}
          <b className="font-semibold">{stage || "—"}</b>
        </>
      )
    }
    case "note_added":
      return (
        <>
          <b className="font-semibold">{actor}</b> הוסיף הערה על{" "}
          <b className="font-semibold">{cand ?? "מועמד"}</b>
        </>
      )
    case "ai_summary":
      return (
        <>
          סיכום AI הופק עבור <b className="font-semibold">{cand ?? "מועמד"}</b>
        </>
      )
    case "interview_scheduled":
      // fallback: שורות ישנות עם type=scheduled אבל description ביטול
      if (ev.description?.startsWith("ראיון בוטל")) {
        return (
          <>
            <b className="font-semibold">{actor}</b> ביטל ראיון של{" "}
            <b className="font-semibold">{cand ?? "מועמד"}</b>
          </>
        )
      }
      return (
        <>
          <b className="font-semibold">{actor}</b> שיבץ ראיון ל-
          <b className="font-semibold">{cand ?? "מועמד"}</b>
        </>
      )
    case "interview_cancelled":
      return (
        <>
          <b className="font-semibold">{actor}</b> ביטל ראיון של{" "}
          <b className="font-semibold">{cand ?? "מועמד"}</b>
        </>
      )
    case "interview_updated":
      return (
        <>
          <b className="font-semibold">{actor}</b> עדכן ראיון של{" "}
          <b className="font-semibold">{cand ?? "מועמד"}</b>
        </>
      )
    case "form_submitted":
      return (
        <>
          <b className="font-semibold">{cand ?? "מועמד"}</b> הגיש טופס
        </>
      )
    default:
      return ev.description ?? ev.type
  }
}

const INITIAL_EVENTS = 6
const PAGE_SIZE = 10

export function LiveActivity({
  initialEvents,
  organizationId,
}: {
  initialEvents: LiveEvent[]
  organizationId: string
}) {
  const [events, setEvents] = useState<LiveEvent[]>(initialEvents)
  const [limit, setLimit] = useState(INITIAL_EVENTS)
  const [hasMore, setHasMore] = useState(initialEvents.length >= INITIAL_EVENTS)
  const [loadingMore, setLoadingMore] = useState(false)
  const [detail, setDetail] = useState<LiveEvent | null>(null)
  // refresh timeAgo כל דקה
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!organizationId) return
    const supabase = createClient()

    // משיכה מלאה — בשימוש גם ע"י polling fallback וגם אחרי INSERT
    async function refetch() {
      const { data } = await supabase
        .from("candidate_events")
        .select(
          "*, actor:users(full_name, email), candidate:candidates(full_name)"
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(Math.max(limit, INITIAL_EVENTS))
      if (data) {
        setEvents(data as unknown as LiveEvent[])
        setHasMore(data.length >= Math.max(limit, INITIAL_EVENTS))
      }
    }

    let realtimeOk = false
    // Realtime — push instant
    const channel = supabase
      .channel(`candidate_events:org:${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "candidate_events",
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          refetch()
        }
      )
      .subscribe((status) => {
        realtimeOk = status === "SUBSCRIBED"
      })

    // Polling fallback — רץ רק אם הטאב גלוי וגם realtime לא חי.
    const poll = setInterval(() => {
      if (document.visibilityState !== "visible") return
      if (realtimeOk) return
      refetch()
    }, 12000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [organizationId, limit])

  async function loadMore() {
    setLoadingMore(true)
    const supabase = createClient()
    const newLimit = limit + PAGE_SIZE
    const { data } = await supabase
      .from("candidate_events")
      .select(
        "*, actor:users(full_name, email), candidate:candidates(full_name)"
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(newLimit)
    if (data) {
      setEvents(data as unknown as LiveEvent[])
      setHasMore(data.length >= newLimit)
      setLimit(newLimit)
    }
    setLoadingMore(false)
  }

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-[18px] py-4">
        <h2 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-primary">
          <Activity className="h-4 w-4 text-[var(--fg-faint)]" />
          פעילות בזמן אמת
        </h2>
        <span className="relative grid h-2 w-2 place-items-center">
          <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-[oklch(0.65_0.15_145)] opacity-50" />
          <span className="h-2 w-2 rounded-full bg-[oklch(0.55_0.15_145)] shadow-[0_0_0_3px_rgba(0,165,142,0.20)]" />
        </span>
      </div>

      {events.length === 0 ? (
        <div className="px-[18px] py-14 text-center text-[12.5px] text-fg-subtle">
          אין פעילות מתועדת עדיין
        </div>
      ) : (
        <div className="max-h-[520px] overflow-y-auto py-2">
          {events.map((event, idx) => {
            const cfg =
              EVENT_STYLE[event.type] ??
              { icon: Activity, tone: "default" as const }
            const Icon = cfg.icon
            const isLast = idx === events.length - 1
            return (
              <div
                key={event.id}
                className="relative grid grid-cols-[24px_1fr] gap-2.5 px-[18px] py-2.5"
              >
                {!isLast && (
                  <span className="absolute bottom-[-10px] start-[30px] top-[34px] w-px bg-line" />
                )}
                <span
                  className={`z-10 grid h-6 w-6 place-items-center rounded-full border ${TONE_CLASS[cfg.tone]}`}
                >
                  <Icon className="h-[11px] w-[11px]" />
                </span>
                <div className="flex flex-col gap-0.5 pt-px">
                  <span className="text-[13px] leading-[1.45] text-fg">
                    {describe(event)}
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
                    {timeAgo(event.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
          {hasMore && (
            <div className="px-[18px] pb-2 pt-1">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-[12px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg disabled:opacity-60"
              >
                {loadingMore ? "טוען…" : "טען עוד פעילות"}
              </button>
            </div>
          )}
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
                {describe(detail)}
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
              {timeAgo(detail.created_at)}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
