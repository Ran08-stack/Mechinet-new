"use client"

import { useState } from "react"
import { Megaphone, Pencil, Power, Flag, ScrollText, ChevronLeft } from "lucide-react"

// ציר זמן ליומן הפעולות. שורה אחת לכל פעולה, מקובץ לפי יום.
// הפרטים (לפני→אחרי) מוסתרים ונפתחים בלחיצה — כדי שהמסך לא יהיה עמוס.

export type AuditEntry = {
  id: string
  kind: "announce" | "edit" | "status" | "movement"
  actor: string
  verb: string
  summary: string
  details: { label: string; from: string; to: string }[]
  dayHeader: string
  time: string
}

const ICONS: Record<AuditEntry["kind"], typeof Megaphone> = {
  announce: Megaphone,
  edit: Pencil,
  status: Power,
  movement: Flag,
}

const FILTERS = [
  { key: "all", label: "כל הפעולות" },
  { key: "announce", label: "הודעות" },
  { key: "org", label: "עדכוני מכינות" },
]

const PAGE = 30

export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  const [filter, setFilter] = useState("all")
  const [limit, setLimit] = useState(PAGE)
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface px-5 py-12 text-center text-[13px] text-fg-muted">
        אין עדיין פעולות ביומן.
      </div>
    )
  }

  const filtered = entries.filter((e) =>
    filter === "all" ? true : filter === "announce" ? e.kind === "announce" : e.kind !== "announce"
  )
  const shown = filtered.slice(0, limit)

  // קיבוץ לפי כותרת היום (הרשומות כבר ממוינות מהחדש לישן).
  const groups: { header: string; items: AuditEntry[] }[] = []
  for (const e of shown) {
    const last = groups[groups.length - 1]
    if (last && last.header === e.dayHeader) last.items.push(e)
    else groups.push({ header: e.dayHeader, items: [e] })
  }

  function toggle(id: string) {
    setOpenIds((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key)
              setLimit(PAGE)
            }}
            className={`h-8 rounded-md border px-3 text-[12.5px] font-medium transition-colors ${
              filter === f.key
                ? "border-[var(--primary-line)] bg-[var(--primary-soft)] text-primary"
                : "border-line bg-surface text-fg-muted hover:bg-[var(--bg-subtle)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {groups.map((g) => (
          <div key={g.header}>
            <div className="border-b border-[var(--line-faint)] bg-[var(--bg-subtle)] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
              {g.header}
            </div>
            {g.items.map((e) => {
              const Icon = ICONS[e.kind] ?? ScrollText
              const isOpen = openIds.has(e.id)
              const hasDetails = e.details.length > 0
              return (
                <div key={e.id} className="border-b border-[var(--line-faint)] last:border-b-0">
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                        e.kind === "announce"
                          ? "bg-[var(--ai-soft)] text-[var(--ai-deep)]"
                          : "bg-[var(--primary-soft)] text-primary"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[13px] leading-snug text-fg">
                          <b className="font-semibold">{e.actor}</b> · {e.verb}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-fg-subtle [font-variant-numeric:tabular-nums]">
                          {e.time}
                        </span>
                      </div>
                      {e.summary && (
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-fg-muted">
                          <span>{e.summary}</span>
                          {hasDetails && (
                            <button
                              onClick={() => toggle(e.id)}
                              className="inline-flex items-center gap-0.5 text-[11.5px] text-accent hover:underline"
                            >
                              פרטים
                              <ChevronLeft className={`h-3 w-3 transition-transform ${isOpen ? "-rotate-90" : ""}`} />
                            </button>
                          )}
                        </div>
                      )}
                      {isOpen && hasDetails && (
                        <div className="mt-2 flex flex-col gap-1.5 rounded-md bg-[var(--bg-subtle)] p-3">
                          {e.details.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-[12px]">
                              <span className="w-24 shrink-0 text-fg-muted">{d.label}</span>
                              <span className="truncate text-fg-subtle line-through">{d.from}</span>
                              <ChevronLeft className="h-3 w-3 shrink-0 text-fg-faint" />
                              <span className="truncate font-medium text-fg">{d.to}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {filtered.length > limit && (
        <button
          onClick={() => setLimit((l) => l + PAGE)}
          className="mx-auto inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]"
        >
          טען עוד
        </button>
      )}
    </div>
  )
}
