"use client"

// טבלת ניהול מכינות בסקירה הארצית — client עם סינון (סוג מגדרי / אזור / חיפוש שם),
// בורר כמות שורות לעמוד + עימוד, וייצוא CSV. הנתונים מחושבים בשרת (page.tsx).

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, ChevronLeft, Download, Search } from "lucide-react"
import { ConnectionStatusPill } from "./ConnectionStatusPill"

export type AcademyRow = {
  id: string
  name: string
  year: number
  typeLabel: string
  genderPolicy: string | null
  contactPerson: string | null
  contactPhone: string | null
  count: number
  lastLogin: string | null
  lat: number | null
  badge: string
}

type Region = "north" | "center" | "south" | "unknown"
function regionOf(lat: number | null): Region {
  if (lat == null) return "unknown"
  return lat >= 32.5 ? "north" : lat >= 31.5 ? "center" : "south"
}
const REGION_LABEL: Record<Region, string> = {
  north: "צפון",
  center: "מרכז · שפלה",
  south: "דרום",
  unknown: "—",
}

const PAGE_SIZES = [12, 24, 32, 64, 100]

const controlClass =
  "h-[30px] rounded-md border border-line bg-surface px-2.5 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | "…")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push("…")
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push("…")
  out.push(total)
  return out
}

export function AcademiesOverviewTable({
  rows,
  totalAcademies,
}: {
  rows: AcademyRow[]
  totalAcademies: number
}) {
  const [gender, setGender] = useState("")
  const [region, setRegion] = useState("")
  const [q, setQ] = useState("")
  const [perPage, setPerPage] = useState(24)
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (gender && r.genderPolicy !== gender) return false
        if (region && regionOf(r.lat) !== region) return false
        if (q.trim() && !r.name.toLowerCase().includes(q.trim().toLowerCase())) return false
        return true
      }),
    [rows, gender, region, q]
  )

  // איפוס לעמוד הראשון בכל שינוי סינון / כמות
  useEffect(() => {
    setPage(1)
  }, [gender, region, q, perPage])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * perPage, safePage * perPage)
  const from = filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1
  const to = Math.min(safePage * perPage, filtered.length)

  function exportCsv() {
    const headers = ["שם המכינה", "סוג", "איש קשר", "טלפון", "מועמדים", "אזור"]
    const body = filtered.map((r) => [
      r.name,
      r.typeLabel,
      r.contactPerson ?? "",
      r.contactPhone ?? "",
      String(r.count),
      REGION_LABEL[regionOf(r.lat)],
    ])
    const csv = [headers, ...body]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\r\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "מכינות-סקירה-ארצית.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      {/* Toolbar: כותרת מימין, פקדים נדחפים שמאלה, ייצוא בסוף */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4">
        <h2 className="m-0 text-[15px] font-semibold text-primary">ניהול מכינות</h2>

        <div className="ms-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute inset-y-0 start-2 my-auto h-3.5 w-3.5 text-fg-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="חיפוש מכינה"
              className="h-[30px] w-[160px] rounded-md border border-line bg-surface ps-7 pe-2.5 text-[12px] text-fg placeholder:text-fg-faint focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <select value={gender} onChange={(e) => setGender(e.target.value)} className={controlClass}>
            <option value="">כל סוגי המכינות</option>
            <option value="mixed">מעורבת</option>
            <option value="boys_only">רק בנים</option>
            <option value="girls_only">רק בנות</option>
          </select>

          <select value={region} onChange={(e) => setRegion(e.target.value)} className={controlClass}>
            <option value="">כל המיקומים</option>
            <option value="north">צפון</option>
            <option value="center">מרכז · שפלה</option>
            <option value="south">דרום</option>
          </select>

          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className={controlClass}
            aria-label="כמות שורות בעמוד"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n} בעמוד
              </option>
            ))}
          </select>

          {(gender || region || q) && (
            <button
              onClick={() => {
                setGender("")
                setRegion("")
                setQ("")
              }}
              className="h-[30px] rounded-md border border-line bg-surface px-3 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)]"
            >
              נקה
            </button>
          )}

          <button
            onClick={exportCsv}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-[var(--line-strong)] bg-surface px-3 text-[12px] text-primary hover:bg-[var(--primary-soft)]"
          >
            <Download className="h-3 w-3" />
            ייצוא
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-8 py-12 text-center text-[13px] text-fg-muted">
          {rows.length === 0 ? "אין מכינות עדיין" : "אין מכינות שתואמות לסינון"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["שם המכינה", "סוג", "איש קשר", "טלפון", "מועמדים", "סטטוס חיבור", ""].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] font-medium uppercase tracking-[var(--tracking-caps)] text-fg-subtle"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((org) => {
                const initial = org.name?.[0] ?? "?"
                return (
                  <tr
                    key={org.id}
                    className="border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-sm font-mono text-[11px] font-semibold text-white"
                          style={{ background: org.badge, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)" }}
                        >
                          {initial}
                        </div>
                        <div>
                          <b className="block text-[13.5px] font-semibold leading-tight text-fg">{org.name}</b>
                          <small className="mt-0.5 block text-[11px] text-fg-subtle">מאז {org.year}</small>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-fg-muted">{org.typeLabel}</td>
                    <td className="px-4 py-3.5 text-[12.5px] leading-tight text-fg-muted">{org.contactPerson || "—"}</td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-fg-muted [font-variant-numeric:tabular-nums]">{org.contactPhone || "—"}</td>
                    <td className="px-4 py-3.5 font-mono text-[14px] font-semibold text-primary [font-variant-numeric:tabular-nums]">{org.count}</td>
                    <td className="px-4 py-3.5">
                      <ConnectionStatusPill last={org.lastLogin} />
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/council/academies?org=${org.id}`}
                        className="inline-flex h-7 items-center rounded-sm border border-[var(--line-strong)] bg-surface px-2.5 text-[12px] text-primary hover:bg-[var(--primary-soft)]"
                      >
                        ניהול
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-[var(--bg-subtle)] px-5 py-3.5">
          <span className="font-mono text-[12px] text-fg-muted">
            מציג {from}–{to} מתוך {filtered.length}
            {filtered.length !== totalAcademies ? ` (מסונן מתוך ${totalAcademies})` : " מכינות"}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="inline-grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-fg-muted hover:bg-surface disabled:opacity-40"
                aria-label="הקודם"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {pageNumbers(safePage, totalPages).map((n, i) =>
                n === "…" ? (
                  <span key={`e${i}`} className="px-1 text-[12px] text-fg-subtle">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-7 min-w-7 rounded-md border px-2 font-mono text-[12px] ${
                      n === safePage
                        ? "border-primary bg-primary text-white"
                        : "border-line bg-surface text-fg-muted hover:bg-surface"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="inline-grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-fg-muted hover:bg-surface disabled:opacity-40"
                aria-label="הבא"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
