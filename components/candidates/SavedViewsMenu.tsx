"use client"

import { useEffect, useState } from "react"
import { Bookmark, Trash2 } from "lucide-react"

export type ViewFilters = {
  stage: string
  search: string
  city: string
  sortBy: string
}

type SavedView = {
  name: string
  filters: ViewFilters
}

function storageKey(orgId: string) {
  return `mechinet_saved_views_${orgId}`
}

function loadViews(orgId: string): SavedView[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(storageKey(orgId))
    return raw ? (JSON.parse(raw) as SavedView[]) : []
  } catch {
    return []
  }
}

function saveViews(orgId: string, views: SavedView[]) {
  localStorage.setItem(storageKey(orgId), JSON.stringify(views))
}

export default function SavedViewsMenu({
  orgId,
  currentFilters,
  onApply,
}: {
  orgId: string
  currentFilters: ViewFilters
  onApply: (filters: ViewFilters) => void
}) {
  const [open, setOpen] = useState(false)
  const [views, setViews] = useState<SavedView[]>([])
  const [name, setName] = useState("")

  useEffect(() => {
    setViews(loadViews(orgId))
  }, [orgId])

  function persist(next: SavedView[]) {
    setViews(next)
    saveViews(orgId, next)
  }

  function addCurrent() {
    const trimmed = name.trim()
    if (!trimmed) return
    const next = [
      ...views.filter((v) => v.name !== trimmed),
      { name: trimmed, filters: currentFilters },
    ]
    persist(next)
    setName("")
  }

  function remove(viewName: string) {
    persist(views.filter((v) => v.name !== viewName))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
      >
        <Bookmark className="h-3.5 w-3.5" />
        תצוגות שמורות
      </button>
      {open && (
        <div className="absolute end-0 top-10 z-40 w-[260px] rounded-lg border border-line bg-surface p-3 shadow-[var(--shadow-lg)]">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
            שמור תצוגה נוכחית
          </div>
          <div className="flex gap-1.5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם התצוגה…"
              className="h-8 flex-1 rounded-md border border-line bg-surface px-2 text-[13px] outline-none focus:border-accent"
            />
            <button
              onClick={addCurrent}
              disabled={!name.trim()}
              className="rounded-md bg-accent px-2.5 text-[12px] font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              שמור
            </button>
          </div>

          <div className="my-3 h-px bg-line" />

          {views.length === 0 ? (
            <p className="m-0 py-2 text-center text-[12px] text-fg-subtle">
              אין תצוגות שמורות
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {views.map((v) => (
                <li
                  key={v.name}
                  className="flex items-center gap-1 rounded px-1 hover:bg-[var(--bg-subtle)]"
                >
                  <button
                    onClick={() => {
                      onApply(v.filters)
                      setOpen(false)
                    }}
                    className="flex-1 truncate py-1.5 text-start text-[13px] text-fg-muted hover:text-fg"
                  >
                    {v.name}
                  </button>
                  <button
                    onClick={() => remove(v.name)}
                    aria-label="מחק תצוגה"
                    className="inline-grid h-6 w-6 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-muted)] hover:text-[var(--danger)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
