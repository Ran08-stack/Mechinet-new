"use client"

import { useState } from "react"
import { Bell, X } from "lucide-react"
import { InviteAcademyButton } from "./InviteAcademyButton"
import { CouncilQuickSearch } from "./CouncilQuickSearch"

// Topbar עליון לצד מועצה — חיפוש, התראות, כפתור הוסף מכינה.
// תואם ל-HTML mockup של מסך 11.

export function CouncilTopbar() {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <div className="relative flex h-[60px] flex-shrink-0 items-center gap-3 border-b border-line bg-[var(--surface-2)] px-3 md:gap-4 md:px-7">
      <CouncilQuickSearch />

      <div className="ms-auto flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="התראות"
            className="relative inline-grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <Bell className="h-4 w-4" />
            <span
              className="absolute h-[7px] w-[7px] rounded-full border-[1.5px] border-surface bg-accent"
              style={{ top: 6, insetInlineEnd: 7 }}
            />
          </button>

          {notifOpen && (
            <div className="fixed end-3 top-14 z-50 max-w-[calc(100vw-1.5rem)] md:absolute md:end-0 md:top-11 w-[300px] overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]">
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

        <InviteAcademyButton />
      </div>
    </div>
  )
}
