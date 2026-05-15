"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Search, X, User } from "lucide-react"

// חיפוש מהיר — overlay שנפתח בלחיצה. מחפש מועמדים לפי שם/אימייל/עיר.
// טוען את המועמדים פעם אחת כשנפתח. בהמשך אפשר להרחיב לטפסים/ראיונות.

type Result = {
  id: string
  full_name: string
  email: string
  city: string | null
  stage: string
}

export function QuickSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [candidates, setCandidates] = useState<Result[]>([])
  const [loaded, setLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // טעינת מועמדים בפעם הראשונה שנפתח
  useEffect(() => {
    if (open && !loaded) {
      const supabase = createClient()
      supabase
        .from("candidates")
        .select("id, full_name, email, city, stage")
        .then(({ data }) => {
          setCandidates((data as Result[]) ?? [])
          setLoaded(true)
        })
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, loaded])

  // קיצור ⌘K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const q = query.trim().toLowerCase()
  const results = q
    ? candidates.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.city ?? "").toLowerCase().includes(q)
      )
    : candidates.slice(0, 8)

  function go(id: string) {
    setOpen(false)
    setQuery("")
    router.push(`/candidates/${id}`)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[13px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)]"
      >
        <Search className="h-3.5 w-3.5" />
        חיפוש מהיר
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
          style={{ background: "var(--overlay)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[560px] overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* שורת חיפוש */}
            <div className="flex items-center gap-2.5 border-b border-[var(--line-faint)] px-4">
              <Search className="h-4 w-4 shrink-0 text-fg-subtle" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חיפוש מועמדים — שם, אימייל, עיר…"
                className="h-12 flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-fg-subtle"
              />
              <button
                onClick={() => setOpen(false)}
                className="inline-grid h-6 w-6 shrink-0 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* תוצאות */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {!loaded ? (
                <div className="px-3 py-8 text-center text-[12.5px] text-fg-subtle">
                  טוען…
                </div>
              ) : results.length === 0 ? (
                <div className="px-3 py-8 text-center text-[12.5px] text-fg-subtle">
                  לא נמצאו תוצאות
                </div>
              ) : (
                results.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => go(c.id)}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-start transition-colors hover:bg-[var(--bg-subtle)]"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-primary">
                      <User className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-[13px] font-medium text-fg">
                        {c.full_name}
                      </span>
                      <span
                        className="truncate font-mono text-[11px] text-fg-subtle"
                        dir="ltr"
                      >
                        {c.email}
                      </span>
                    </span>
                    {c.city && (
                      <span className="shrink-0 text-[11.5px] text-fg-subtle">
                        {c.city}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
