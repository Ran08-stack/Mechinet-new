"use client"

import { Copy, Trash2, GripVertical, ChevronDown, Calendar, Upload, ChevronUp } from "lucide-react"
import { FormField } from "@/types/database"
import { getTypeMeta, normalizeType } from "./fieldTypes"
import { getDataset } from "./datasets"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export function CanvasField({
  field,
  selected,
  collapsed,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleCollapse,
}: {
  field: FormField
  selected: boolean
  collapsed?: boolean
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleCollapse?: () => void
}) {
  const meta = getTypeMeta(field.type)
  const type = normalizeType(field.type)
  const Icon = meta.icon
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })
  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  if (type === "section") {
    return (
      <div
        ref={setNodeRef}
        style={sortableStyle}
        onClick={onSelect}
        className={`group relative my-1 cursor-pointer rounded-md border ps-9 pe-3.5 py-3 transition-all ${
          selected
            ? "border-[var(--accent-line)] bg-surface shadow-[0_0_0_3px_var(--ring),0_1px_3px_rgba(3,22,49,0.04)]"
            : "border-transparent hover:bg-[var(--bg-subtle)]"
        }`}
      >
        {selected && <SelectedBar />}
        <FieldActions selected={selected} onDuplicate={onDuplicate} onDelete={onDelete} />
        <Grip selected={selected} attributes={attributes} listeners={listeners} />
        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleCollapse()
              }}
              className="inline-grid h-5 w-5 place-items-center rounded text-fg-muted hover:bg-[var(--bg-muted)] hover:text-fg"
              title={collapsed ? "פתח מקטע" : "צמצם מקטע"}
            >
              {collapsed ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </button>
          )}
          <div className="relative flex-1 border-t-2 border-primary mt-2">
            <span className="absolute -top-2.5 start-0 bg-surface pe-2 text-[10.5px] uppercase tracking-[0.06em] text-primary">
              {field.label || "כותרת מקטע"}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (type === "info") {
    return (
      <div
        ref={setNodeRef}
        style={sortableStyle}
        onClick={onSelect}
        className={`group relative my-1 cursor-pointer rounded-md border ps-9 pe-3.5 py-3 transition-all ${
          selected
            ? "border-[var(--accent-line)] bg-surface shadow-[0_0_0_3px_var(--ring),0_1px_3px_rgba(3,22,49,0.04)]"
            : "border-transparent hover:bg-[var(--bg-subtle)]"
        }`}
      >
        {selected && <SelectedBar />}
        <FieldActions selected={selected} onDuplicate={onDuplicate} onDelete={onDelete} />
        <Grip selected={selected} attributes={attributes} listeners={listeners} />
        <div className="mb-1.5 flex items-center gap-2">
          <TypeChip icon={Icon} label={meta.label} />
        </div>
        <div className="rounded border-s-[3px] border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2 text-[13px] text-fg-muted">
          {field.help || field.label}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      onClick={onSelect}
      className={`group relative my-1 cursor-pointer rounded-md border ps-9 pe-3.5 py-3 transition-all ${
        selected
          ? "border-[var(--accent-line)] bg-surface shadow-[0_0_0_3px_var(--ring),0_1px_3px_rgba(3,22,49,0.04)]"
          : "border-transparent hover:bg-[var(--bg-subtle)]"
      }`}
    >
      {selected && <SelectedBar />}
      <FieldActions selected={selected} onDuplicate={onDuplicate} onDelete={onDelete} />
      <Grip selected={selected} attributes={attributes} listeners={listeners} />
      <div className="mb-1.5 flex items-center gap-2">
        <TypeChip icon={Icon} label={meta.label} />
        {field.required && (
          <span className="text-[12px] font-bold text-[var(--accent)]">*</span>
        )}
      </div>
      <div className="mb-1 text-[15px] font-medium text-fg">{field.label}</div>
      {field.help && (
        <div className="mb-2 text-[11px] text-fg-subtle">{field.help}</div>
      )}
      <PreviewControl field={field} />
    </div>
  )
}

function SelectedBar() {
  return (
    <span
      className="pointer-events-none absolute inset-y-1 start-0 w-[3px] rounded-full"
      style={{ background: "var(--accent)" }}
    />
  )
}

function FieldActions({
  selected,
  onDuplicate,
  onDelete,
}: {
  selected: boolean
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`absolute end-2 top-2 flex gap-0.5 transition-opacity ${
        selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDuplicate()
        }}
        title="שכפל"
        className="grid h-6 w-6 place-items-center rounded text-fg-muted hover:bg-[var(--bg-muted)] hover:text-fg"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        title="מחק"
        className="grid h-6 w-6 place-items-center rounded text-fg-muted hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function Grip({
  selected,
  attributes,
  listeners,
}: {
  selected: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners?: any
}) {
  return (
    <div
      {...(attributes ?? {})}
      {...(listeners ?? {})}
      onClick={(e) => e.stopPropagation()}
      title="גרור כדי להזיז"
      className={`absolute start-1 top-1/2 -translate-y-1/2 grid h-9 w-6 cursor-grab place-items-center rounded-md border border-[var(--line-faint)] bg-[var(--bg-subtle)] text-fg-muted touch-none select-none active:cursor-grabbing active:bg-[var(--accent-soft)] active:text-[var(--accent)] ${
        selected
          ? "opacity-100"
          : "opacity-80 md:opacity-0 md:group-hover:opacity-80"
      }`}
      style={{ touchAction: "none" }}
    >
      <GripVertical className="h-4 w-4" />
    </div>
  )
}

function TypeChip({
  icon: Icon,
  label,
}: {
  icon: typeof ChevronDown
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-muted)] px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

function PreviewControl({ field }: { field: FormField }) {
  const t = normalizeType(field.type)
  const inputBase =
    "w-full pointer-events-none rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-fg-subtle"
  switch (t) {
    case "short_text":
    case "email":
    case "phone":
    case "id_number":
    case "url":
    case "number":
      return (
        <input
          className={inputBase}
          placeholder={field.placeholder || " "}
          disabled
        />
      )
    case "long_text":
      return (
        <textarea
          className={inputBase + " min-h-[72px] resize-none"}
          placeholder={field.placeholder || " "}
          disabled
        />
      )
    case "date":
      return (
        <div className={inputBase + " flex items-center justify-between"}>
          <span>dd / mm / yyyy</span>
          <Calendar className="h-3.5 w-3.5 text-[var(--fg-faint)]" />
        </div>
      )
    case "dropdown":
      return (
        <div className={inputBase + " flex items-center justify-between"}>
          <span>בחר…</span>
          <ChevronDown className="h-3.5 w-3.5 text-[var(--fg-faint)]" />
        </div>
      )
    case "radio": {
      const all = mergeOptions(field)
      return (
        <div className="flex flex-col gap-1.5">
          {all.slice(0, 6).map((o, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-[13px] text-fg-muted"
            >
              <span className="h-4 w-4 shrink-0 rounded-full border-[1.5px] border-[var(--line-strong)] bg-surface" />
              {o}
            </div>
          ))}
          {all.length > 6 && (
            <span className="text-[11px] text-fg-subtle">
              ועוד {all.length - 6} אפשרויות…
            </span>
          )}
        </div>
      )
    }
    case "checkbox":
      return (
        <div className="flex flex-col gap-1.5">
          {mergeOptions(field).slice(0, 6).map((o, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-[13px] text-fg-muted"
            >
              <span className="h-4 w-4 shrink-0 rounded border-[1.5px] border-[var(--line-strong)] bg-surface" />
              {o}
            </div>
          ))}
        </div>
      )
    case "rating": {
      const n = Number(field.max) || 5
      return (
        <div className="flex gap-1.5 text-[var(--fg-faint)]">
          {Array.from({ length: n }).map((_, i) => (
            <svg
              key={i}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15 9 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 9 12 2" />
            </svg>
          ))}
        </div>
      )
    }
    case "file":
      return (
        <div className="rounded-md border-[1.5px] border-dashed border-[var(--line-strong)] bg-[var(--bg-subtle)] px-3 py-4 text-center text-[13px] text-fg-subtle">
          <Upload className="mx-auto mb-1 h-4 w-4 text-[var(--fg-faint)]" />
          <div>
            גרור קובץ או{" "}
            <span className="font-medium text-[var(--accent)]">בחר מהמחשב</span>
          </div>
          {field.accept && (
            <div className="mt-1 text-[10.5px] text-[var(--fg-faint)]">
              {field.accept}
            </div>
          )}
        </div>
      )
    case "signature":
      return (
        <div className="grid h-[100px] place-items-center rounded-md border-[1.5px] border-dashed border-[var(--line-strong)] bg-[var(--bg-subtle)] italic text-[var(--fg-faint)]">
          חתום כאן
        </div>
      )
    default:
      return null
  }
}

function mergeOptions(field: FormField): string[] {
  const builtin = getDataset(field.dataset)
  const custom = field.options ?? []
  // אפשרויות מותאמות בראש כדי שיופיעו ראשונות
  return [...custom, ...builtin]
}
