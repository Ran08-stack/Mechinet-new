"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  MoreVertical,
  SlidersHorizontal,
  ArrowDownWideNarrow,
  LayoutGrid,
  Download,
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

// צבעי אווטאר מתחלפים לפי אינדקס השורה
const AV_GRADIENTS = [
  "linear-gradient(135deg,#b6c7ea,#374765)",
  "linear-gradient(135deg,#ffb59f,#fe6f42)",
  "linear-gradient(135deg,#44ddc1,#00a58e)",
  "linear-gradient(135deg,#f4b8a8,#c1583d)",
  "linear-gradient(135deg,#d5c4f7,#7c5cd6)",
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + "." + parts[1][0]
}

export default function CandidatesTable({
  candidates,
}: {
  candidates: Candidate[]
}) {
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.city ?? "").toLowerCase().includes(q)
    const matchStage = stageFilter === "all" || c.stage === stageFilter
    return matchSearch && matchStage
  })

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((c) => c.id)))
    }
  }

  return (
    <div>
      {/* רצועת פילטר שלבים */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-line bg-surface px-7">
        <button
          onClick={() => setStageFilter("all")}
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
              onClick={() => setStageFilter(stage)}
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

      {/* סרגל כלים — חיפוש + פעולות */}
      <div className="flex flex-wrap items-center gap-2.5 px-7 py-3.5">
        <div className="relative max-w-[380px] flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle" />
          <input
            type="text"
            placeholder="חיפוש לפי שם, אימייל, או עיר…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-[var(--line-strong)] bg-surface ps-8 pe-2.5 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
          />
        </div>

        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          סינון נוסף
        </button>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg">
          <ArrowDownWideNarrow className="h-3.5 w-3.5" />
          מיון: תאריך הגשה
        </button>

        <div className="flex-1" />

        <span className="me-2 font-mono text-[11.5px] text-fg-subtle">
          {filtered.length} מתוך {candidates.length}
        </span>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg">
          <LayoutGrid className="h-3.5 w-3.5" />
          תצוגה
        </button>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg">
          <Download className="h-3.5 w-3.5" />
          ייצוא
        </button>
      </div>

      {/* טבלה */}
      <div className="mx-7 overflow-hidden rounded-lg border border-line bg-surface">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="w-9 border-b border-line bg-[var(--surface-2)] px-3.5 py-[11px] text-start">
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 &&
                    selected.size === filtered.length
                  }
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 cursor-pointer accent-[var(--accent)]"
                />
              </th>
              {["שם", "אימייל", "עיר", "שלב", "מקור", "תאריך הגשה", ""].map(
                (h, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap border-b border-line bg-[var(--surface-2)] px-3.5 py-[11px] text-start font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-fg-subtle"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((candidate, idx) => {
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
                      className="flex min-w-[200px] items-center gap-2.5"
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
                  <td
                    className="whitespace-nowrap px-3.5 py-[11px] font-mono text-[12px] text-fg-muted"
                    dir="ltr"
                  >
                    {candidate.email}
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-[11px] text-fg-muted">
                    {candidate.city ?? "—"}
                  </td>
                  <td className="px-3.5 py-[11px]">
                    <StageBadge stage={candidate.stage} />
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-[11px] text-[12.5px] text-fg-muted">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-[var(--bg-subtle)] px-[7px] py-0.5 text-[11px] text-fg-muted">
                      טופס · ציבורי
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-[11px] text-[12.5px] text-fg-muted [font-variant-numeric:tabular-nums]">
                    {formatDate(candidate.created_at)}
                  </td>
                  <td className="w-9 px-3.5 py-[11px] text-center">
                    <button className="inline-grid h-[26px] w-[26px] place-items-center rounded text-[var(--fg-faint)] opacity-0 transition-opacity hover:bg-[var(--bg-muted)] hover:text-fg group-hover:opacity-100">
                      <MoreVertical className="h-[15px] w-[15px]" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-8 py-14 text-center text-[13px] text-fg-muted">
            {search || stageFilter !== "all"
              ? "לא נמצאו מועמדים התואמים לחיפוש"
              : "אין מועמדים עדיין"}
          </div>
        )}
      </div>
    </div>
  )
}
