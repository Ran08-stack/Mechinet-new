"use client"

import { ReactNode, useState } from "react"
import { Bell, HelpCircle, X } from "lucide-react"
import { QuickSearch } from "./QuickSearch"

// Topbar עליון — מופיע בכל מסכי המכינה.
// crumb משתנה לפי המסך. orgName/action אופציונליים.
// כשמועברים rightLabel — מוצג מימין במקום ה-breadcrumb (משמש בלוח הבקרה כשם המכינה).

export function Topbar({
  crumb,
  action,
  rightLabel,
}: {
  crumb?: string
  action?: ReactNode
  rightLabel?: { title: string; subtitle?: string }
}) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <div className="relative flex h-[60px] flex-shrink-0 items-center gap-3.5 border-b border-line bg-[var(--surface-2)] px-7">
      {/* צד ימין */}
      {rightLabel ? (
        <div className="flex min-w-0 flex-col items-end text-end leading-tight">
          <b className="truncate text-[14px] font-semibold text-primary">
            {rightLabel.title}
          </b>
          {rightLabel.subtitle && (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
              {rightLabel.subtitle}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[13px] text-fg-subtle">
          <span>ניווט</span>
          <span className="text-[var(--fg-faint)]">/</span>
          <span className="font-medium text-fg">{crumb}</span>
        </div>
      )}

      {/* אמצע — חיפוש מהיר */}
      <div className="mx-auto">
        <QuickSearch />
      </div>

      {/* צד שמאל */}
      <div className="flex items-center gap-2">
        {/* עזרה */}
        <div className="relative">
          <button
            onClick={() => setHelpOpen((v) => !v)}
            aria-label="עזרה"
            className="inline-grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
          {helpOpen && (
            <div className="absolute end-0 top-9 z-50 w-[280px] overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]">
              <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-4 py-3">
                <span className="text-[13px] font-semibold text-primary">
                  עזרה
                </span>
                <button
                  onClick={() => setHelpOpen(false)}
                  className="inline-grid h-6 w-6 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-2 px-4 py-3 text-[12.5px] text-fg-muted">
                <p className="m-0">
                  Mechinet — מערכת לניהול מועמדויות במכינות קדם-צבאיות.
                </p>
                <p className="m-0">
                  לשאלות ותמיכה: <a href="mailto:support@mechinet.app" className="text-accent">support@mechinet.app</a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* התראות */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="התראות"
            className="inline-grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <Bell className="h-3.5 w-3.5" />
          </button>

          {notifOpen && (
            <div className="absolute end-0 top-9 z-50 w-[300px] overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]">
              <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-4 py-3">
                <span className="text-[13px] font-semibold text-primary">
                  התראות
                </span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="inline-grid h-6 w-6 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="px-4 py-8 text-center text-[12.5px] text-fg-subtle">
                אין התראות חדשות
              </div>
            </div>
          )}
        </div>

        {action}
      </div>
    </div>
  )
}
