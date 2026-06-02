"use client"

import { useEffect, useState } from "react"
import {
  InterviewWithCandidate,
  Interviewer,
  addDays,
  sameDay,
  avatarColor,
} from "./CalendarView"

const HOUR_START = 8 // 08:00
const HOUR_END = 20 // 20:00
const SLOT_PX = 56 // pixels per hour
const TOTAL_HEIGHT = (HOUR_END - HOUR_START) * SLOT_PX

const DOW_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]

export function WeekGrid({
  weekStart,
  interviews,
  interviewers,
  onEventClick,
  onSlotClick,
}: {
  weekStart: Date
  interviews: InterviewWithCandidate[]
  interviewers: Interviewer[]
  onEventClick: (iv: InterviewWithCandidate) => void
  onSlotClick: (dayIso: string, hour: number) => void
}) {
  // עדכון מיקום קו "עכשיו" כל דקה
  const [now, setNow] = useState<Date>(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  // לפי יום: אירועים של היום
  const byDay: Record<number, InterviewWithCandidate[]> = {}
  for (let i = 0; i < 7; i++) byDay[i] = []
  for (const iv of interviews) {
    const d = new Date(iv.scheduled_at)
    for (let i = 0; i < 7; i++) {
      if (sameDay(d, days[i])) {
        byDay[i].push(iv)
        break
      }
    }
  }

  return (
    <div className="grid h-full grid-cols-1">
      {/* HEADER */}
      <div
        className="grid border-b border-line bg-surface"
        style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}
      >
        <div className="px-2 py-3.5 text-center text-[10px] uppercase tracking-[0.06em] text-[var(--fg-faint)] [direction:ltr]">
          GMT+3
        </div>
        {days.map((d, i) => {
          const isToday = sameDay(d, today)
          const isWeekend = i === 6 // שבת
          return (
            <div
              key={i}
              className={`relative border-s border-line py-3 text-center ${
                isWeekend ? "bg-[var(--bg-subtle)]" : ""
              }`}
            >
              <div
                className={`mb-1.5 text-[10.5px] uppercase tracking-[0.06em] ${
                  isToday
                    ? "font-medium text-primary"
                    : isWeekend
                    ? "text-[var(--fg-faint)]"
                    : "text-fg-subtle"
                }`}
              >
                {DOW_LABELS[i]}
              </div>
              {isToday ? (
                <div className="mx-auto -my-0.5 grid h-7 w-7 place-items-center rounded-full bg-primary text-[14px] font-semibold text-white [font-variant-numeric:tabular-nums]">
                  {d.getDate()}
                </div>
              ) : (
                <div
                  className={`text-[20px] font-medium leading-none [font-variant-numeric:tabular-nums] ${
                    isWeekend ? "text-[var(--fg-faint)]" : "text-primary"
                  }`}
                >
                  {d.getDate()}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* SCROLLABLE GRID */}
      <div className="overflow-y-auto bg-surface">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: "56px repeat(7, 1fr)",
            height: TOTAL_HEIGHT,
          }}
        >
          {/* TIME COLUMN */}
          <div className="border-e border-line">
            {Array.from({ length: HOUR_END - HOUR_START }, (_, h) => (
              <div
                key={h}
                className="px-2 pt-0.5 text-end text-[10.5px] text-[var(--fg-faint)] [direction:ltr]"
                style={{ height: SLOT_PX }}
              >
                {String(HOUR_START + h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* DAY COLUMNS */}
          {days.map((d, di) => {
            const isToday = sameDay(d, today)
            const isWeekend = di === 6
            const dayIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
            return (
              <div
                key={di}
                className={`relative border-s border-line ${
                  isWeekend ? "bg-[var(--bg-subtle)]" : ""
                }`}
              >
                {Array.from(
                  { length: HOUR_END - HOUR_START },
                  (_, h) => (
                    <button
                      key={h}
                      onClick={() =>
                        !isWeekend && onSlotClick(dayIso, HOUR_START + h)
                      }
                      disabled={isWeekend}
                      className={`block w-full border-b border-[var(--line-faint)] transition-colors ${
                        !isWeekend
                          ? "cursor-pointer hover:bg-[var(--accent-soft)]"
                          : "cursor-default"
                      }`}
                      style={{ height: SLOT_PX }}
                      aria-label={`קבע אירוע ב-${HOUR_START + h}:00`}
                    />
                  )
                )}

                {/* NOW LINE */}
                {isToday && (() => {
                  const minutes =
                    (now.getHours() - HOUR_START) * 60 + now.getMinutes()
                  if (minutes < 0 || minutes > (HOUR_END - HOUR_START) * 60)
                    return null
                  const top = (minutes / 60) * SLOT_PX
                  return (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-[4]"
                      style={{ top }}
                    >
                      <div
                        className="h-[1.5px]"
                        style={{ background: "var(--accent)" }}
                      />
                      <span
                        className="absolute -top-1.5 -end-1 h-2 w-2 rounded-full"
                        style={{ background: "var(--accent)" }}
                      />
                    </div>
                  )
                })()}

                {/* EVENTS */}
                {byDay[di].map((iv) => {
                  const d2 = new Date(iv.scheduled_at)
                  const mins =
                    (d2.getHours() - HOUR_START) * 60 + d2.getMinutes()
                  const top = (mins / 60) * SLOT_PX
                  const height = Math.max(
                    28,
                    (iv.duration_minutes / 60) * SLOT_PX
                  )
                  const interviewer = interviewers.find(
                    (m) => m.id === iv.interviewer_id
                  )
                  const color = iv.interviewer_id
                    ? avatarColor(iv.interviewer_id)
                    : "var(--accent)"
                  const isCancelled = iv.status === "cancelled"
                  const isCompleted = iv.status === "completed"
                  const endTime = new Date(
                    d2.getTime() + iv.duration_minutes * 60_000
                  )
                  return (
                    <button
                      key={iv.id}
                      onClick={() => onEventClick(iv)}
                      className={`absolute z-[2] overflow-hidden rounded-md border bg-surface px-2 py-1.5 text-start transition-shadow hover:shadow-[0_2px_6px_rgba(3,22,49,0.08)] ${
                        isCancelled ? "opacity-50 line-through" : ""
                      }`}
                      style={{
                        top,
                        height,
                        insetInlineStart: 4,
                        insetInlineEnd: 4,
                        borderColor: "transparent",
                        background: isCompleted
                          ? "var(--stage-accepted-bg)"
                          : "var(--stage-interview-bg)",
                      }}
                    >
                      <span
                        className="absolute bottom-1.5 top-1.5 w-[2.5px] rounded"
                        style={{
                          insetInlineEnd: 0,
                          background: color,
                        }}
                      />
                      <div className="text-[10px] text-fg-subtle [direction:ltr]">
                        {fmtHM(d2)} – {fmtHM(endTime)}
                      </div>
                      <div
                        className="truncate text-[11.5px] font-medium"
                        style={{
                          color: isCompleted
                            ? "var(--stage-accepted-fg)"
                            : "var(--stage-interview-fg)",
                        }}
                      >
                        {shortName(iv.candidates?.full_name ?? "מועמד")}
                      </div>
                      {(interviewer || iv.location) && (
                        <div className="truncate text-[10.5px] text-fg-subtle">
                          {interviewer?.full_name ||
                            interviewer?.email.split("@")[0] ||
                            ""}
                          {interviewer && iv.location ? " · " : ""}
                          {iv.location ?? ""}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function fmtHM(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

// מקצר שם מלא ל"ר. שטרן" כדי שיתאים לתאי שבוע צרים
function shortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return name
  if (parts.length === 1) return parts[0]
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`
}
