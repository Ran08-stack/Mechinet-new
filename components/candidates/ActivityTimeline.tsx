import { CandidateEvent } from "@/types/database"
import { Activity, ArrowLeftRight, MessageSquare, Sparkles, Calendar, FileText } from "lucide-react"

// ציר זמן פעילות — מציג את האירועים של המועמד

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

export function ActivityTimeline({ events }: { events: CandidateEvent[] }) {
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
                    {event.description ?? event.type}
                  </span>
                  <span className="font-mono text-[10.5px] text-fg-subtle">
                    {fmtWhen(event.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
