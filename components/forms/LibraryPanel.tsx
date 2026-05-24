"use client"

import { useState } from "react"
import { Search, Sparkles } from "lucide-react"
import { useDraggable } from "@dnd-kit/core"
import {
  FIELD_TYPES,
  GROUP_LABELS,
  FieldTypeMeta,
  newField,
} from "./fieldTypes"
import { FormField, FormFieldType } from "@/types/database"
import { uid } from "./fieldTypes"

export type BundleId = "personal" | "essays"

export const BUNDLES: { id: BundleId; label: string; build: () => FormField[] }[] = [
  {
    id: "personal",
    label: "פרטים אישיים",
    build: () => [
      { id: uid(), type: "section", label: "פרטים אישיים", required: false },
      {
        id: uid(),
        type: "short_text",
        label: "שם מלא",
        required: true,
        placeholder: "ישראל ישראלי",
      },
      { id: uid(), type: "id_number", label: 'ת"ז', required: true },
      { id: uid(), type: "email", label: "אימייל", required: true },
      {
        id: uid(),
        type: "phone",
        label: "טלפון נייד",
        required: true,
        placeholder: "0500000000",
      },
      { id: uid(), type: "date", label: "תאריך לידה", required: true },
      { id: uid(), type: "short_text", label: "עיר מגורים", required: true },
    ],
  },
  {
    id: "essays",
    label: "שאלות פתוחות",
    build: () => [
      { id: uid(), type: "section", label: "שאלות פתוחות", required: false },
      {
        id: uid(),
        type: "long_text",
        label: "ספר/י על עצמך",
        help: "מה חשוב לך, מה מעניין אותך, מהן נקודות החוזק שלך",
        required: true,
      },
      {
        id: uid(),
        type: "long_text",
        label: "למה את/ה רוצה להגיע למכינה שלנו?",
        help: "מה משך אותך דווקא למכינה הזו",
        required: true,
      },
      {
        id: uid(),
        type: "long_text",
        label: "מטרות וציפיות מהמכינה",
        help: "3 מטרות / יעדים שתרצה/י להשיג בשנת המכינה ומה הציפיות שלך",
        required: true,
      },
      {
        id: uid(),
        type: "long_text",
        label: "אתגר משמעותי שעברת",
        help: "תאר/י אירוע משמעותי ואיך התמודדת איתו",
        required: false,
      },
      {
        id: uid(),
        type: "long_text",
        label: "ספר על אדם משמעותי בחייך",
        help: "מי הוא ומה השפיע עליך",
        required: false,
      },
      {
        id: uid(),
        type: "long_text",
        label: "מה את/ה יודע/ת לעשות בצורה שונה וייחודית?",
        help: "כישרון, יכולת או נקודת מבט שמייחדים אותך",
        required: false,
      },
      {
        id: uid(),
        type: "long_text",
        label: "תנועת נוער / קהילה / התנדבות",
        help: "האם את/ה לוקח/ת חלק במסגרת? פרט/י",
        required: false,
      },
      {
        id: uid(),
        type: "short_text",
        label: "שאיפה צבאית",
        help: "תפקיד / חיל שאת/ה שואף/ת אליהם",
        required: false,
      },
    ],
  },
]

export function LibraryPanel({
  onAdd,
  onAddBundle,
}: {
  onAdd: (t: FormFieldType) => void
  onAddBundle: (id: BundleId) => void
}) {
  const [q, setQ] = useState("")
  const ql = q.trim().toLowerCase()
  const filtered = ql
    ? FIELD_TYPES.filter((f) => f.label.toLowerCase().includes(ql))
    : FIELD_TYPES

  const groups = (["text", "choice", "numdate", "upload", "layout"] as const)
    .map((g) => ({
      g,
      items: filtered.filter((f) => f.group === g),
    }))
    .filter((x) => x.items.length > 0)

  return (
    <aside className="overflow-y-auto border-s border-line bg-surface px-4 pb-7 pt-[18px]">
      <div className="relative mb-3.5">
        <Search className="pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fg-faint)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חפש שדה…"
          className="h-8 w-full rounded-md border border-line bg-[var(--bg-subtle)] pe-8 ps-2.5 text-[13px] outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
        />
      </div>

      {/* Bundles */}
      {!ql && (
        <div>
          <div className="mx-1 mb-2 mt-0 flex items-center gap-1 text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
            <Sparkles className="h-3 w-3 text-[var(--accent)]" />
            ערכות מוכנות
          </div>
          <div className="flex flex-col gap-1.5">
            {BUNDLES.map((b) => (
              <BundleItem key={b.id} bundle={b} onClick={() => onAddBundle(b.id)} />
            ))}
          </div>
        </div>
      )}

      {groups.map(({ g, items }) => (
        <div key={g}>
          <div className="mx-1 mb-2 mt-3.5 text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
            {GROUP_LABELS[g]}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {items.map((it) => (
              <LibraryItem key={it.id} item={it} onClick={() => onAdd(it.id)} />
            ))}
          </div>
        </div>
      ))}
    </aside>
  )
}

function LibraryItem({
  item,
  onClick,
}: {
  item: FieldTypeMeta
  onClick: () => void
}) {
  const Icon = item.icon
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib:${item.id}`,
  })
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="group flex cursor-grab flex-col items-start gap-1.5 rounded-md border border-line bg-surface p-2.5 text-start transition-all hover:-translate-y-[1px] hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)] hover:shadow-[0_2px_6px_rgba(3,22,49,.06)] active:cursor-grabbing"
    >
      <span className="grid h-6 w-6 place-items-center rounded bg-[var(--bg-muted)] text-primary transition-colors group-hover:bg-surface group-hover:text-accent">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-[12.5px] font-medium leading-tight text-fg">
        {item.label}
      </span>
    </button>
  )
}

function BundleItem({
  bundle,
  onClick,
}: {
  bundle: { id: BundleId; label: string }
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `bundle:${bundle.id}`,
  })
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="group flex cursor-grab items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-2 text-start text-[12.5px] font-medium text-fg transition-all hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-hover)] active:cursor-grabbing"
    >
      <span className="text-[var(--accent)]">+</span>
      {bundle.label}
    </button>
  )
}
