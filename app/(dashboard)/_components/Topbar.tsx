"use client"

import { ReactNode, useState } from "react"
import { Bell, X } from "lucide-react"
import { QuickSearch } from "./QuickSearch"

// Topbar עליון — מופיע בכל מסכי המכינה.
// crumb משתנה לפי המסך. action — כפתור ימני אופציונלי.

export function Topbar({
  crumb,
  action,
}: {
  crumb: string
  action?: ReactNode
}) {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <div className="relative flex h-[60px] flex-shrink-0 items-center gap-3.5 border-b border-line bg-surface px-7">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-fg-subtle">
        <span>ניווט</span>
        <span className="text-[var(--fg-faint)]">/</span>
        <span className="font-medium text-fg">{crumb}</span>
      </div>

      {/* צד שמאל */}
      <div className="ms-auto flex items-center gap-2">
        {/* חיפוש מהיר */}
        <QuickSearch />

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
