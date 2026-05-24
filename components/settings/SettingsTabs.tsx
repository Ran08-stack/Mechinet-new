"use client"

import { useEffect, useState } from "react"
import { GraduationCap, Columns3, Tag } from "lucide-react"

type Tab = {
  id: string
  label: string
  icon: typeof GraduationCap
}

export function SettingsTabs({ isAdmin }: { isAdmin: boolean }) {
  const tabs: Tab[] = [
    { id: "org-details", label: "פרטי המכינה", icon: GraduationCap },
    { id: "pipeline", label: "שלבי קבלה", icon: Columns3 },
    ...(isAdmin
      ? [{ id: "role-labels", label: "תפקידי צוות", icon: Tag }]
      : []),
  ]

  const [active, setActive] = useState<string>(tabs[0]?.id ?? "")

  useEffect(() => {
    // לוגיקה מבוססת scroll: סקשן פעיל = זה שה-top שלו עבר את הקו ה-120px ועוד לא הוחלף ע"י הבא
    function onScroll() {
      // bottom-of-page: סקשן אחרון פעיל
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8
      if (atBottom) {
        const last = tabs[tabs.length - 1]
        if (last) setActive(last.id)
        return
      }
      const offset = 120
      let current = tabs[0]?.id ?? ""
      for (const t of tabs) {
        const el = document.getElementById(t.id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top - offset <= 0) current = t.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      // סימון מיידי — IntersectionObserver יעדכן אם המשתמש גולל ידנית אח"כ
      setActive(id)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: "smooth",
      })
    }
  }

  return (
    <nav className="sticky top-5 flex flex-col">
      <div className="px-3 pb-2 text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
        ארגון
      </div>
      {tabs.map((t) => {
        const Icon = t.icon
        const on = active === t.id
        return (
          <button
            key={t.id}
            onClick={() => scrollTo(t.id)}
            className={`relative flex h-9 items-center gap-2.5 rounded-md px-3 text-start text-[13px] transition-colors ${
              on
                ? "font-semibold text-primary"
                : "font-medium text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg"
            }`}
          >
            {on && (
              <span
                className="absolute inset-y-1.5 end-0 w-[2.5px] rounded-full"
                style={{ background: "var(--accent)" }}
              />
            )}
            <Icon
              className={`h-4 w-4 shrink-0 ${on ? "text-accent" : ""}`}
            />
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
