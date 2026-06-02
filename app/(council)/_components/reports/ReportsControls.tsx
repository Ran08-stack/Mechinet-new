"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Download, FileText } from "lucide-react"

type Org = { id: string; name: string }
type Kind = "national" | "compare" | "stages"

export function ReportsControls({ orgs, currentFrom, currentTo, currentOrgIds, currentKind }: {
  orgs: Org[]
  currentFrom: string
  currentTo: string
  currentOrgIds: string[]
  currentKind: Kind
}) {
  const router = useRouter()
  const params = useSearchParams()

  const [from, setFrom] = useState(currentFrom)
  const [to, setTo] = useState(currentTo)
  const [orgIds, setOrgIds] = useState<string[]>(currentOrgIds)
  const [kind, setKind] = useState<Kind>(currentKind)

  function buildQuery() {
    const sp = new URLSearchParams()
    if (from) sp.set("from", from)
    if (to) sp.set("to", to)
    if (orgIds.length > 0) sp.set("orgs", orgIds.join(","))
    sp.set("kind", kind)
    return sp.toString()
  }

  function apply() {
    router.push(`/council/reports?${buildQuery()}`)
  }

  function toggleOrg(id: string) {
    setOrgIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  const exportHref = (fmt: "csv" | "pdf") => `/council/reports/export/${fmt}?${buildQuery()}`

  const canExport = Boolean(from && to && orgIds.length > 0)
  const disabledHint = !from || !to
    ? "בחר תאריך התחלה וסיום"
    : orgIds.length === 0
      ? "בחר לפחות מכינה אחת"
      : ""

  return (
    <div className="rounded-lg border border-line bg-surface p-4 md:p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1.5fr_1fr]">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-fg-muted">מתאריך</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="h-9 w-full rounded-md border border-line bg-bg px-2 text-[13px]" />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-fg-muted">עד תאריך</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="h-9 w-full rounded-md border border-line bg-bg px-2 text-[13px]" />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-fg-muted">
            מכינות {orgIds.length === 0 ? "(כולן)" : `(${orgIds.length})`}
          </label>
          <details className="relative">
            <summary className="flex h-9 cursor-pointer items-center rounded-md border border-line bg-bg px-2 text-[13px] text-fg-muted">
              {orgIds.length === 0 ? "בחר מכינות" : `${orgIds.length} נבחרו`}
            </summary>
            <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-line bg-surface p-2 shadow-md">
              <button type="button" onClick={() => setOrgIds([])}
                className="mb-1 block w-full rounded px-2 py-1 text-start text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)]">
                נקה הכל
              </button>
              {orgs.map((o) => (
                <label key={o.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-[var(--bg-subtle)]">
                  <input type="checkbox" checked={orgIds.includes(o.id)} onChange={() => toggleOrg(o.id)} />
                  <span className="text-[13px]">{o.name}</span>
                </label>
              ))}
            </div>
          </details>
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-fg-muted">סוג דוח</label>
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)}
            className="h-9 w-full rounded-md border border-line bg-bg px-2 text-[13px]">
            <option value="national">גיוס ארצי</option>
            <option value="compare">השוואת מכינות</option>
            <option value="stages">התקדמות שלבים</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={apply}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-on-primary hover:opacity-90">
          הצג דוח
        </button>
        {/* כפתור בדיקה זמני — מוציא PDF דמה בלי ולידציה. להסיר אחרי שהפיצ'ר מאומת. */}
        <a href="/council/reports/export/pdf?test=1&kind=national" target="_blank" rel="noopener"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-dashed border-warning bg-warning/10 px-3 text-[13px] text-warning hover:bg-warning/15">
          <FileText className="h-3.5 w-3.5" /> PDF בדיקה (זמני)
        </a>
        {canExport ? (
          <>
            <a href={exportHref("csv")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-fg hover:bg-[var(--bg-subtle)]">
              <Download className="h-3.5 w-3.5" /> ייצא CSV
            </a>
            <a href={exportHref("pdf")} target="_blank" rel="noopener"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-fg hover:bg-[var(--bg-subtle)]">
              <FileText className="h-3.5 w-3.5" /> ייצא PDF
            </a>
          </>
        ) : (
          <>
            <button type="button" disabled title={disabledHint}
              className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md border border-line bg-[var(--bg-subtle)] px-3 text-[13px] text-fg-faint">
              <Download className="h-3.5 w-3.5" /> ייצא CSV
            </button>
            <button type="button" disabled title={disabledHint}
              className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md border border-line bg-[var(--bg-subtle)] px-3 text-[13px] text-fg-faint">
              <FileText className="h-3.5 w-3.5" /> ייצא PDF
            </button>
            <span className="text-[12px] text-fg-subtle">{disabledHint}</span>
          </>
        )}
      </div>
    </div>
  )
}
