import { ReactNode } from "react"
import { Search, Bell } from "lucide-react"

// Topbar עליון — מופיע בכל מסכי המכינה.
// breadcrumb משתנה לפי המסך. action — כפתור ימני אופציונלי (למשל "מועמד חדש").
// חיפוש מהיר + פעמון התראות — ויזואלי כרגע, פיצ'רים בהמשך.

export function Topbar({
  crumb,
  action,
}: {
  crumb: string
  action?: ReactNode
}) {
  return (
    <div className="flex h-[60px] flex-shrink-0 items-center gap-3.5 border-b border-line bg-surface px-7">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-fg-subtle">
        <span>ניווט</span>
        <span className="text-[var(--fg-faint)]">/</span>
        <span className="font-medium text-fg">{crumb}</span>
      </div>

      {/* צד שמאל */}
      <div className="ms-auto flex items-center gap-2">
        {/* חיפוש מהיר */}
        <button className="inline-flex h-7 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[13px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)]">
          <Search className="h-3.5 w-3.5" />
          חיפוש מהיר
          <span
            className="ms-1.5 rounded border border-line px-1 font-mono text-[10.5px] text-[var(--fg-faint)]"
            dir="ltr"
          >
            ⌘K
          </span>
        </button>

        {/* התראות */}
        <button
          aria-label="התראות"
          className="relative inline-grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
        >
          <Bell className="h-3.5 w-3.5" />
        </button>

        {action}
      </div>
    </div>
  )
}
