"use client"

// טבלת ניהול מכינות בסקירה הארצית — client עם סינון (סוג מגדרי / אזור / חיפוש שם) + ייצוא CSV.
// הנתונים מחושבים בצד השרת (page.tsx) ומועברים כ-rows.

import { useMemo, useState } from "react"
import Link from "next/link"
import { Filter, MapPin, Download, Search } from "lucide-react"
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

const selectClass =
  "inline-flex h-[30px] items-center rounded-md border border-line bg-surface px-2.5 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"

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
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4">
        <h2 className="m-0 mr-auto text-[15px] font-semibold text-primary">ניהול מכינות</h2>

        <div className="relative">
          <Search className="pointer-events-none absolute inset-y-0 start-2 my-auto h-3.5 w-3.5 text-fg-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="חיפוש מכינה"
            className="h-[30px] w-[150px] rounded-md border border-line bg-surface ps-7 pe-2.5 text-[12px] text-fg placeholder:text-fg-faint focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
          <option value="">כל סוגי המכינות</option>
          <option value="mixed">מעורבת</option>
          <option value="boys_only">רק בנים</option>
          <option value="girls_only">רק בנות</option>
        </select>

        <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
          <option value="">כל המיקומים</option>
          <option value="north">צפון</option>
          <option value="center">מרכז · שפלה</option>
          <option value="south">דרום</option>
        </select>

        {(gender || region || q) && (
          <button
            onClick={() => {
              setGender("")
              setRegion("")
              setQ("")
            }}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)]"
          >
            <Filter className="h-3 w-3" />
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
              {filtered.map((org) => {
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

      {rows.length > 0 && (
        <div className="flex items-center justify-between border-t border-line bg-[var(--bg-subtle)] px-5 py-3.5">
          <span className="flex items-center gap-1.5 font-mono text-[12px] text-fg-muted">
            <MapPin className="h-3 w-3 text-fg-faint" />
            מציג {filtered.length} מתוך {totalAcademies} מכינות
          </span>
        </div>
      )}
    </div>
  )
}
