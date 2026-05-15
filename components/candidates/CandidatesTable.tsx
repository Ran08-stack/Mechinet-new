"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  SlidersHorizontal,
  ArrowDownWideNarrow,
  Download,
  ArrowLeftRight,
  Mail,
  Tag,
  Trash2,
  X,
} from "lucide-react"
import { Candidate } from "@/types/database"
import { STAGE_LABELS, formatDate } from "@/lib/utils"
import { StageBadge } from "@/components/ui/StageBadge"

const ALL_STAGES = ["new", "review", "interview", "accepted", "rejected"]

const STAGE_DOT: Record<string, string> = {
  new: "var(--stage-new-dot)",
  review: "var(--stage-review-dot)",
  interview: "var(--stage-interview-dot)",
  accepted: "var(--stage-accepted-dot)",
  rejected: "var(--stage-rejected-dot)",
}

const AV_GRADIENTS = [
  "linear-gradient(135deg,#b6c7ea,#374765)",
  "linear-gradient(135deg,#ffb59f,#fe6f42)",
  "linear-gradient(135deg,#44ddc1,#00a58e)",
  "linear-gradient(135deg,#f4b8a8,#c1583d)",
  "linear-gradient(135deg,#d5c4f7,#7c5cd6)",
]

const PAGE_SIZES = [12, 24, 48, 64]

type SortKey = "date" | "name"

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + "." + parts[1][0]
}

// ייצוא לאקסל — CSV עם BOM כדי שעברית תיפתח נכון
function exportToExcel(rows: Candidate[]) {
  const headers = ["שם", "אימייל", "טלפון", "עיר", "שלב", "תאריך הגשה"]
  const lines = rows.map((c) =>
    [
      c.full_name,
      c.email,
      c.phone ?? "",
      c.city ?? "",
      STAGE_LABELS[c.stage] ?? c.stage,
      formatDate(c.created_at),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  )
  const csv = "﻿" + [headers.join(","), ...lines].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `מועמדים-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function CandidatesTable({
  candidates,
}: {
  candidates: Candidate[]
}) {
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortOpen, setSortOpen] = useState(false)
  const [pageSize, setPageSize] = useState(24)
  const [page, setPage] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [cityFilter, setCityFilter] = useState("")

  const cities = Array.from(
    new Set(candidates.map((c) => c.city).filter(Boolean))
  ) as string[]

  let filtered = candidates.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.city ?? "").toLowerCase().includes(q)
    const matchStage = stageFilter === "all" || c.stage === stageFilter
    const matchCity = !cityFilter || c.city === cityFilter
    return matchSearch && matchStage && matchCity
  })

  filtered = [...filtered].sort((a, b) => {
    if (sortKey === "name") return a.full_name.localeCompare(b.full_name, "he")
    return (
      new Date(b.created_at ?? 0).getTime() -
      new Date(a.created_at ?? 0).getTime()
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const paged = filtered.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize
  )

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (paged.every((c) => selected.has(c.id))) {
      setSelected((prev) => {
        const next = new Set(prev)
        paged.forEach((c) => next.delete(c.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        paged.forEach((c) => next.add(c.id))
        return next
      })
    }
  }

  return (
    <div>
      {/* רצועת פילטר שלבים */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-line bg-surface px-7">
        <button
          onClick={() => {
            setStageFilter("all")
            setPage(0)
          }}
          className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-[11px] pt-3 text-[13px] font-medium transition-colors ${
            stageFilter === "all"
              ? "border-accent text-fg"
              : "border-transparent text-fg-muted hover:text-fg"
          }`}
        >
          הכל
          <span
            className={`rounded-full border px-1.5 py-px font-mono text-[10.5px] ${
              stageFilter === "all"
                ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-hover)]"
                : "border-line bg-[var(--bg-muted)] text-fg-subtle"
            }`}
          >
            {candidates.length}
          </span>
        </button>
        {ALL_STAGES.map((stage) => {
          const count = candidates.filter((c) => c.stage === stage).length
          return (
            <button
              key={stage}
              onClick={() => {
                setStageFilter(stage)
                setPage(0)
              }}
              className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-[11px] pt-3 text-[13px] font-medium transition-colors ${
                stageFilter === stage
                  ? "border-accent text-fg"
                  : "border-transparent text-fg-muted hover:text-fg"
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: STAGE_DOT[stage] }}
              />
              {STAGE_LABELS[stage]}
              <span
                className={`rounded-full border px-1.5 py-px font-mono text-[10.5px] ${
                  stageFilter === stage
                    ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-hover)]"
                    : "border-line bg-[var(--bg-muted)] text-fg-subtle"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* סרגל כלים */}
      <div className="flex flex-wrap items-center gap-2.5 px-7 py-3.5">
        <div className="relative max-w-[380px] flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle" />
          <input
            type="text"
            placeholder="חיפוש לפי שם, אימייל, או עיר…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="h-8 w-full rounded-md border border-[var(--line-strong)] bg-surface ps-8 pe-2.5 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
          />
        </div>

        {/* סינון נוסף */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[13px] transition-colors ${
              cityFilter
                ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-hover)]"
                : "border-line bg-surface text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            סינון נוסף
          </button>
          {filterOpen && (
            <div className="absolute end-0 top-10 z-40 w-[220px] rounded-lg border border-line bg-surface p-3 shadow-[var(--shadow-lg)]">
              <label className="mb-1.5 block text-[12px] font-medium text-fg-subtle">
                סינון לפי עיר
              </label>
              <select
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value)
                  setPage(0)
                }}
                className="h-8 w-full rounded-md border border-line bg-surface px-2 text-[13px] text-fg outline-none focus:border-accent"
              >
                <option value="">כל הערים</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {cityFilter && (
                <button
                  onClick={() => {
                    setCityFilter("")
                    setPage(0)
                  }}
                  className="mt-2 text-[12px] text-accent hover:underline"
                >
                  נקה סינון
                </button>
              )}
            </div>
          )}
        </div>

        {/* מיון */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <ArrowDownWideNarrow className="h-3.5 w-3.5" />
            מיון: {sortKey === "date" ? "תאריך הגשה" : "שם"}
          </button>
          {sortOpen && (
            <div className="absolute end-0 top-10 z-40 w-[160px] rounded-lg border border-line bg-surface p-1 shadow-[var(--shadow-lg)]">
              {(
                [
                  { k: "date", l: "תאריך הגשה" },
                  { k: "name", l: "שם" },
                ] as { k: SortKey; l: string }[]
              ).map((opt) => (
                <button
                  key={opt.k}
                  onClick={() => {
                    setSortKey(opt.k)
                    setSortOpen(false)
                  }}
                  className={`flex w-full items-center rounded px-2.5 py-1.5 text-start text-[13px] transition-colors hover:bg-[var(--bg-subtle)] ${
                    sortKey === opt.k
                      ? "font-medium text-accent"
                      : "text-fg-muted"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <span className="me-2 font-mono text-[11.5px] text-fg-subtle">
          {filtered.length} מתוך {candidates.length}
        </span>

        {/* תצוגה — כמות שורות בעמוד */}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
            setPage(0)
          }}
          className="h-8 rounded-md border border-line bg-surface px-2 text-[13px] text-fg-muted outline-none focus:border-accent"
          aria-label="כמות שורות בעמוד"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} בעמוד
            </option>
          ))}
        </select>

        <button
          onClick={() => exportToExcel(filtered)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
        >
          <Download className="h-3.5 w-3.5" />
          ייצוא
        </button>
      </div>

      {/* סרגל פעולות — מתחת לטולבר, מופיע כשמסמנים שורות */}
      {selected.size > 0 && (
        <div className="mx-7 mb-3.5 flex items-center gap-3.5 rounded-md bg-fg px-3.5 py-2.5 text-[13px] text-bg shadow-[var(--shadow-md)]">
          <span className="font-semibold">{selected.size} נבחרו</span>
          <span className="h-[18px] w-px bg-white/15" />
          <button className="inline-flex items-center gap-1.5 rounded px-2 py-1 opacity-85 transition-opacity hover:bg-white/10 hover:opacity-100">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            שינוי שלב
          </button>
          <button className="inline-flex items-center gap-1.5 rounded px-2 py-1 opacity-85 transition-opacity hover:bg-white/10 hover:opacity-100">
            <Mail className="h-3.5 w-3.5" />
            שליחת מייל
          </button>
          <button className="inline-flex items-center gap-1.5 rounded px-2 py-1 opacity-85 transition-opacity hover:bg-white/10 hover:opacity-100">
            <Tag className="h-3.5 w-3.5" />
            תיוג
          </button>
          <button className="inline-flex items-center gap-1.5 rounded px-2 py-1 opacity-85 transition-opacity hover:bg-white/10 hover:opacity-100">
            <Trash2 className="h-3.5 w-3.5" />
            מחיקה
          </button>
          <button
            onClick={() => setSelected(new Set())}
            aria-label="בטל בחירה"
            className="ms-auto inline-grid h-6 w-6 place-items-center rounded opacity-60 transition-opacity hover:bg-white/10 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* טבלה */}
      <div className="mx-7 overflow-hidden rounded-lg border border-line bg-surface">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="w-9 border-b border-line bg-[var(--surface-2)] px-3.5 py-[11px] text-start">
                <input
                  type="checkbox"
                  checked={
                    paged.length > 0 &&
                    paged.every((c) => selected.has(c.id))
                  }
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 cursor-pointer accent-[var(--accent)]"
                />
              </th>
              {["שם", "אימייל", "טלפון", "מקום מגורים", "שלב", "תאריך הגשה"].map(
                (h, i) => (
                <th
                  key={i}
                  className="whitespace-nowrap border-b border-line bg-[var(--surface-2)] px-3.5 py-[11px] text-start font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-fg-subtle"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((candidate, idx) => {
              const isSelected = selected.has(candidate.id)
              return (
                <tr
                  key={candidate.id}
                  className={`group cursor-pointer border-b border-[var(--line-faint)] transition-colors last:border-b-0 ${
                    isSelected
                      ? "bg-[var(--accent-soft)]"
                      : "hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <td className="w-9 px-3.5 py-[11px]">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(candidate.id)}
                      className="h-3.5 w-3.5 cursor-pointer accent-[var(--accent)]"
                    />
                  </td>
                  <td className="px-3.5 py-[11px]">
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="flex min-w-[180px] items-center gap-2.5"
                    >
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.35)]"
                        style={{
                          background:
                            AV_GRADIENTS[idx % AV_GRADIENTS.length],
                        }}
                      >
                        {initials(candidate.full_name)}
                      </span>
                      <span className="font-medium text-fg">
                        {candidate.full_name}
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-[11px] text-start font-mono text-[12px] text-fg-muted">
                    <span dir="ltr" className="inline-block">
                      {candidate.email}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-[11px] text-start font-mono text-[12px] text-fg-muted">
                    <span dir="ltr" className="inline-block">
                      {candidate.phone ?? "—"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-[11px] text-start text-fg-muted">
                    {candidate.city ?? "—"}
                  </td>
                  <td className="px-3.5 py-[11px]">
                    <StageBadge stage={candidate.stage} />
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-[11px] text-[12.5px] text-fg-muted [font-variant-numeric:tabular-nums]">
                    {formatDate(candidate.created_at)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-8 py-14 text-center text-[13px] text-fg-muted">
            {search || stageFilter !== "all" || cityFilter
              ? "לא נמצאו מועמדים התואמים לחיפוש"
              : "אין מועמדים עדיין"}
          </div>
        )}
      </div>

      {/* עימוד */}
      {totalPages > 1 && (
        <div className="mx-7 mt-3.5 flex items-center justify-between text-[13px] text-fg-muted">
          <span className="font-mono text-[11.5px] text-fg-subtle">
            עמוד {safePage + 1} מתוך {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="h-7 rounded-md border border-line bg-surface px-3 text-[12px] transition-colors hover:bg-[var(--bg-subtle)] disabled:opacity-40"
            >
              הקודם
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={safePage >= totalPages - 1}
              className="h-7 rounded-md border border-line bg-surface px-3 text-[12px] transition-colors hover:bg-[var(--bg-subtle)] disabled:opacity-40"
            >
              הבא
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
