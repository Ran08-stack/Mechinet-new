"use client"

import { Trash2, Plus, X, GripVertical, Star } from "lucide-react"
import { FormField } from "@/types/database"
import {
  getTypeMeta,
  normalizeType,
  HAS_OPTIONS,
  HAS_PLACEHOLDER,
} from "./fieldTypes"
import { DATASET_LABELS, getDataset } from "./datasets"

export function PropertiesPanel({
  field,
  onChange,
  onDelete,
}: {
  field: FormField | null
  onChange: (updates: Partial<FormField>) => void
  onDelete: () => void
}) {
  if (!field) {
    return (
      <aside className="overflow-y-auto border-e border-line bg-surface">
        <div className="px-6 py-16 text-center text-[13px] text-fg-subtle">
          <Star className="mx-auto mb-2.5 h-7 w-7 text-[var(--fg-faint)]" />
          בחר שדה כדי לערוך את ההגדרות שלו
        </div>
      </aside>
    )
  }

  const meta = getTypeMeta(field.type)
  const Icon = meta.icon
  const type = normalizeType(field.type)
  const hasOptions = HAS_OPTIONS.includes(type)
  const hasPlaceholder = HAS_PLACEHOLDER.includes(type)
  const isStructural = type === "section" || type === "info"

  return (
    <aside className="overflow-y-auto border-e border-line bg-surface pb-8">
      <div className="flex items-center gap-2.5 border-b border-[var(--line-faint)] px-[18px] py-4">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-[var(--primary-soft)] text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div>
          <div className="text-[14px] font-semibold text-fg">{meta.label}</div>
          <div className="text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle [direction:ltr]">
            field · {field.id.slice(0, 8)}
          </div>
        </div>
      </div>

      {/* תוכן השדה */}
      <Section title="תוכן השדה">
        <FieldRow label="תווית (Label)">
          <input
            type="text"
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className={inputCls}
          />
        </FieldRow>
        <FieldRow label="טקסט עזרה">
          <textarea
            value={field.help ?? ""}
            onChange={(e) => onChange({ help: e.target.value })}
            placeholder="טיפ למילוי…"
            className={inputCls + " h-auto min-h-[60px] resize-y py-2"}
          />
        </FieldRow>
        {hasPlaceholder && (
          <FieldRow label="טקסט placeholder">
            <input
              type="text"
              value={field.placeholder ?? ""}
              onChange={(e) => onChange({ placeholder: e.target.value })}
              className={inputCls}
            />
          </FieldRow>
        )}
      </Section>

      {/* אפשרויות + מקור רשימה מובנה */}
      {hasOptions && (
        <Section title="אפשרויות">
          <FieldRow label="מקור רשימה">
            <select
              value={field.dataset ?? "custom"}
              onChange={(e) =>
                onChange({
                  dataset: e.target.value as "schools" | "cities" | "custom",
                })
              }
              className={inputCls}
            >
              <option value="custom">{DATASET_LABELS.custom}</option>
              <option value="schools">{DATASET_LABELS.schools}</option>
              <option value="cities">{DATASET_LABELS.cities}</option>
            </select>
          </FieldRow>
          {field.dataset && field.dataset !== "custom" && (
            <p className="-mt-1 mb-2 text-[11px] text-fg-subtle">
              הרשימה המובנית מציגה {getDataset(field.dataset).length} פריטים.
              ניתן להוסיף עוד פריטים מותאמים למטה — הם יופיעו בראש הרשימה.
            </p>
          )}
          <FieldRow
            label={
              field.dataset && field.dataset !== "custom"
                ? "פריטים מותאמים (נוספים)"
                : "פריטים"
            }
          >
            <OptionsEditor
              options={field.options ?? []}
              onChange={(options) => onChange({ options })}
            />
          </FieldRow>
        </Section>
      )}

      {/* תחום ערכים — מספר */}
      {type === "number" && (
        <Section title="תחום ערכים">
          <div className="grid grid-cols-2 gap-2.5">
            <FieldRow label="מינימום">
              <input
                type="number"
                value={field.min ?? ""}
                onChange={(e) => onChange({ min: e.target.value })}
                className={inputCls}
              />
            </FieldRow>
            <FieldRow label="מקסימום">
              <input
                type="number"
                value={field.max ?? ""}
                onChange={(e) => onChange({ max: e.target.value })}
                className={inputCls}
              />
            </FieldRow>
          </div>
        </Section>
      )}

      {/* מגבלות קובץ */}
      {type === "file" && (
        <Section title="מגבלות קובץ">
          <FieldRow label="סוגים ומשקל">
            <input
              type="text"
              value={field.accept ?? ""}
              onChange={(e) => onChange({ accept: e.target.value })}
              className={inputCls}
            />
          </FieldRow>
        </Section>
      )}

      {/* דירוג */}
      {type === "rating" && (
        <Section title="סולם הדירוג">
          <FieldRow label="מספר כוכבים">
            <select
              value={String(field.max ?? 5)}
              onChange={(e) => onChange({ max: parseInt(e.target.value) })}
              className={inputCls}
            >
              {[3, 5, 7, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </FieldRow>
        </Section>
      )}

      {/* תיקוף */}
      {!isStructural && (
        <Section title="תיקוף">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-[13px] text-fg">שדה חובה</div>
              <div className="mt-0.5 text-[11px] text-fg-subtle">
                המועמד לא יוכל לשלוח טופס בלי למלא
              </div>
            </div>
            <Switch
              on={field.required}
              onChange={(v) => onChange({ required: v })}
            />
          </div>
        </Section>
      )}

      <div className="px-[18px] py-3.5">
        <button
          onClick={onDelete}
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-line bg-surface text-[13px] font-medium text-[var(--danger)] hover:border-[var(--danger)] hover:bg-[var(--danger-soft)]"
        >
          <Trash2 className="h-3.5 w-3.5" />
          מחק שדה
        </button>
      </div>
    </aside>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-[var(--line-faint)] px-[18px] py-4">
      <h4 className="m-0 mb-3 text-[10.5px] font-medium uppercase tracking-[0.06em] text-fg-subtle">
        {title}
      </h4>
      {children}
    </div>
  )
}

function FieldRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-3 flex flex-col gap-1.5 last:mb-0">
      <label className="text-[11px] font-medium text-fg-muted">{label}</label>
      {children}
    </div>
  )
}

function Switch({
  on,
  onChange,
}: {
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative h-5 w-[34px] shrink-0 rounded-full transition-colors ${
        on ? "bg-[var(--accent)]" : "bg-[var(--line-strong)]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-all ${
          on ? "start-0.5" : "end-0.5"
        }`}
      />
    </button>
  )
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[]
  onChange: (options: string[]) => void
}) {
  function setAt(i: number, v: string) {
    const next = [...options]
    next[i] = v
    onChange(next)
  }
  function removeAt(i: number) {
    onChange(options.filter((_, idx) => idx !== i))
  }
  function add() {
    onChange([...options, `אפשרות ${options.length + 1}`])
  }
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((o, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-[var(--fg-faint)]" />
          <input
            type="text"
            value={o}
            onChange={(e) => setAt(i, e.target.value)}
            className="h-[30px] flex-1 rounded border border-line bg-surface px-2 text-[13px] outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
          />
          <button
            onClick={() => removeAt(i)}
            title="מחק"
            className="grid h-[26px] w-[26px] place-items-center rounded text-[var(--fg-faint)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="mt-1 inline-flex items-center gap-1.5 self-start py-1.5 text-[13px] font-medium text-[var(--accent)]"
      >
        <Plus className="h-3 w-3" />
        הוסף אפשרות
      </button>
    </div>
  )
}

const inputCls =
  "h-8 w-full rounded-md border border-line bg-surface px-2.5 text-[13px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
