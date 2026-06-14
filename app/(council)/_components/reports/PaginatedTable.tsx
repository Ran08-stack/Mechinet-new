"use client"

import { useState, type ReactNode } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"

// טבלה עם בורר כמות-לעמוד + ניווט עמודים, כדי שרשימות ארוכות לא יתפסו מסך שלם.
// השורות מגיעות מוכנות (תאים כ-ReactNode) מ-server component.

const TH = "border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start text-[11px] font-semibold uppercase tracking-[0.04em] text-fg-subtle whitespace-nowrap"
const TD = "px-4 py-2.5 text-[13px]"
const SIZES = [10, 25, 50]

export function PaginatedTable({
  title, headers, rows,
}: {
  title: string
  headers: string[]
  rows: ReactNode[][]
}) {
  const [size, setSize] = useState(25)
  const [page, setPage] = useState(0)

  const total = rows.length
  const showAll = size === 0
  const pageCount = showAll ? 1 : Math.max(1, Math.ceil(total / size))
  const safePage = Math.min(page, pageCount - 1)
  const start = showAll ? 0 : safePage * size
  const end = showAll ? total : Math.min(start + size, total)
  const slice = rows.slice(start, end)

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-faint)] px-5 py-3.5">
        <h2 className="m-0 text-[14px] font-semibold text-primary">{title}</h2>
        <label className="flex items-center gap-2 text-[12px] text-fg-muted">
          הצג
          <select
            value={size}
            onChange={(e) => { setSize(Number(e.target.value)); setPage(0) }}
            className="h-8 rounded-md border border-line bg-bg px-2 text-[12.5px]"
          >
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value={0}>הכל</option>
          </select>
          מכינות לעמוד
        </label>
      </div>

      {total === 0 ? (
        <p className="m-0 px-5 py-12 text-center text-[13px] text-fg-muted">אין נתונים לתקופה ולמכינות שנבחרו.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>{headers.map((h, i) => <th key={i} className={TH}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {slice.map((cells, ri) => (
                  <tr key={start + ri} className="border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]">
                    {cells.map((c, ci) => <td key={ci} className={TD}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!showAll && pageCount > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-[var(--line-faint)] px-5 py-3 text-[12.5px] text-fg-muted">
              <span className="[font-variant-numeric:tabular-nums]">מציג {start + 1}–{end} מתוך {total}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="inline-grid h-7 w-7 place-items-center rounded-md border border-line bg-surface hover:bg-[var(--bg-subtle)] disabled:opacity-40"
                  aria-label="הקודם"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="px-1 [font-variant-numeric:tabular-nums]">עמוד {safePage + 1} מתוך {pageCount}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={safePage >= pageCount - 1}
                  className="inline-grid h-7 w-7 place-items-center rounded-md border border-line bg-surface hover:bg-[var(--bg-subtle)] disabled:opacity-40"
                  aria-label="הבא"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
