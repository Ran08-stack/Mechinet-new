"use client"

// חיפוש מהיר בצד המועצה — כמו ה-QuickSearch של צד המכינה, אך מחפש מכינות/שלוחות
// (לא מועמדים — ה-RLS חוסם drill-down למועמד). טוען פעם אחת, מסנן לפי שם/עיר/מכינה,
// לחיצה מנווטת לדף השלוחה. ⌘K/Ctrl+K ממקד, Esc סוגר, קליק בחוץ סוגר.

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Search, Building2 } from "lucide-react"

type Org = { id: string; name: string; city: string | null; academy_id: string | null }

export function CouncilQuickSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [orgs, setOrgs] = useState<Org[]>([])
  const [academyName, setAcademyName] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && !loaded) {
      const supabase = createClient()
      Promise.all([
        supabase.from("organizations").select("id, name, city, academy_id").order("name"),
        supabase.from("academies").select("id, name"),
      ]).then(([o, a]) => {
        setOrgs((o.data as Org[]) ?? [])
        const m: Record<string, string> = {}
        for (const x of a.data ?? []) m[x.id] = x.name
        setAcademyName(m)
        setLoaded(true)
      })
    }
  }, [open, loaded])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("mousedown", onClick)
    return () => window.removeEventListener("mousedown", onClick)
  }, [])

  const q = query.trim().toLowerCase()
  const results = q
    ? orgs
        .filter(
          (o) =>
            o.name.toLowerCase().includes(q) ||
            (o.city ?? "").toLowerCase().includes(q) ||
            (o.academy_id ? (academyName[o.academy_id] ?? "").toLowerCase().includes(q) : false)
        )
        .slice(0, 30)
    : orgs.slice(0, 8)

  function label(o: Org) {
    const acad = o.academy_id ? academyName[o.academy_id] : undefined
    return acad && acad !== o.name ? `${acad} · ${o.name}` : o.name
  }

  function go(id: string) {
    setOpen(false)
    setQuery("")
    router.push(`/council/academies/${id}`)
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-[360px]">
      <Search className="pointer-events-none absolute inset-y-0 start-0 my-auto ms-3 h-[15px] w-[15px] text-fg-subtle" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="חיפוש מכינה או שלוחה…"
        className="h-9 w-full rounded-md border border-line bg-[var(--bg-subtle)] ps-9 pe-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:bg-surface focus:shadow-[var(--shadow-focus)]"
      />

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]">
          <div className="max-h-[360px] overflow-y-auto p-2">
            {!loaded ? (
              <div className="px-3 py-6 text-center text-[12.5px] text-fg-subtle">טוען…</div>
            ) : results.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12.5px] text-fg-subtle">לא נמצאו תוצאות</div>
            ) : (
              results.map((o) => (
                <button
                  key={o.id}
                  onClick={() => go(o.id)}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-start transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-primary">
                    <Building2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-[13px] font-medium text-fg">{label(o)}</span>
                    {o.city && <span className="truncate text-[11px] text-fg-subtle">{o.city}</span>}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
