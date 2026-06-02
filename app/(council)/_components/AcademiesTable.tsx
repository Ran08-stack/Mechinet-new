"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

export type BranchRow = {
  id: string
  name: string
  academyName: string | null
  city: string | null
  candidates: number
  forms: number
  createdAt: string | null
}

export function AcademiesTable({
  rows,
  academyNames,
}: {
  rows: BranchRow[]
  academyNames: string[]
}) {
  const [filter, setFilter] = useState("")

  const visible = filter
    ? rows.filter((r) => r.academyName === filter)
    : rows

  const selectCls =
    "h-9 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
          מכינה
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={selectCls}
        >
          <option value="">כל המכינות</option>
          {academyNames.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["שלוחה", "מכינה", "עיר", "מועמדים", "טפסים", "הצטרפה"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-fg-subtle"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr
                key={r.id}
                className="border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]"
              >
                <td className="px-4 py-3.5">
                  <Link
                    href={`/council/academies/${r.id}`}
                    className="flex items-center gap-2.5 text-fg hover:text-accent"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[var(--primary-soft)] text-primary">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{r.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-fg-muted">
                  {r.academyName ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-fg-muted">{r.city ?? "—"}</td>
                <td className="px-4 py-3.5 text-fg-muted [font-variant-numeric:tabular-nums]">
                  {r.candidates}
                </td>
                <td className="px-4 py-3.5 text-fg-muted [font-variant-numeric:tabular-nums]">
                  {r.forms}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-fg-muted">
                  {formatDate(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
