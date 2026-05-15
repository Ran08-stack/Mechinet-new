"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Repeat, Building2, Landmark, X } from "lucide-react"

// מתג החלפת חשבונות — כלי בדיקות.
// מחליף את ה-role של המשתמש הנוכחי בין מכינה למועצה ומרענן.
// ה-middleware מנתב לצד הנכון לפי ה-role.
// כלי זמני לפיתוח — בפרודקשן כל משתמש יהיה role קבוע.

export default function AccountSwitcher({
  currentRole,
}: {
  currentRole: string
}) {
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  const isCouncil = currentRole === "council_admin"

  async function switchTo(role: "admin" | "council_admin") {
    if (role === currentRole) return
    setSwitching(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSwitching(false)
      return
    }
    await supabase.from("users").update({ role }).eq("id", user.id)
    // ניווט מלא — כדי שה-middleware ירוץ מחדש וינתב לצד הנכון
    window.location.href = role === "council_admin" ? "/council" : "/dashboard"
  }

  return (
    <div className="fixed bottom-4 start-4 z-[100]">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3 shadow-[var(--shadow-lg)]"
          aria-label="החלפת חשבון"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: isCouncil
                ? "var(--primary)"
                : "var(--accent)",
            }}
          />
          <Repeat className="h-4 w-4 text-fg-muted" />
        </button>
      ) : (
        <div className="w-[260px] rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-3.5 py-2.5">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
              החלפת חשבון · בדיקות
            </span>
            <button
              onClick={() => setOpen(false)}
              className="inline-grid h-6 w-6 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-2 p-3">
            <button
              onClick={() => switchTo("admin")}
              disabled={switching}
              className={`flex items-center gap-2.5 rounded-md border p-2.5 text-start transition-colors disabled:opacity-60 ${
                !isCouncil
                  ? "border-[var(--accent-line)] bg-[var(--accent-soft)]"
                  : "border-line hover:bg-[var(--bg-subtle)]"
              }`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[var(--accent-soft)] text-[var(--accent-hover)]">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="flex flex-col leading-tight">
                <b className="text-[13px] font-semibold text-fg">מכינה</b>
                <small className="text-[11px] text-fg-subtle">
                  ניהול יומיומי
                </small>
              </span>
              {!isCouncil && (
                <span className="ms-auto font-mono text-[10px] text-[var(--accent-hover)]">
                  פעיל
                </span>
              )}
            </button>

            <button
              onClick={() => switchTo("council_admin")}
              disabled={switching}
              className={`flex items-center gap-2.5 rounded-md border p-2.5 text-start transition-colors disabled:opacity-60 ${
                isCouncil
                  ? "border-[var(--primary-line)] bg-[var(--primary-soft)]"
                  : "border-line hover:bg-[var(--bg-subtle)]"
              }`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[var(--primary-soft)] text-primary">
                <Landmark className="h-4 w-4" />
              </span>
              <span className="flex flex-col leading-tight">
                <b className="text-[13px] font-semibold text-fg">
                  מועצת המכינות
                </b>
                <small className="text-[11px] text-fg-subtle">
                  סקירה ארצית
                </small>
              </span>
              {isCouncil && (
                <span className="ms-auto font-mono text-[10px] text-primary">
                  פעיל
                </span>
              )}
            </button>

            {switching && (
              <span className="text-center font-mono text-[10.5px] text-fg-subtle">
                מחליף…
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
