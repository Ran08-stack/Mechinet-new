"use client"

import { FormField } from "@/types/database"
import { normalizeType } from "./fieldTypes"
import { getDataset } from "./datasets"
import { Star } from "lucide-react"

export function PreviewMode({
  title,
  description,
  fields,
  orgName,
}: {
  title: string
  description: string
  fields: FormField[]
  orgName?: string
}) {
  return (
    <section
      className="overflow-y-auto"
      style={{
        background:
          "radial-gradient(ellipse 800px 400px at 50% -10%, rgba(3,22,49,.04), transparent 60%), var(--bg)",
        padding: "48px 24px 96px",
      }}
    >
      <div className="mx-auto max-w-[640px] overflow-hidden rounded-lg border border-line bg-surface shadow-[0_1px_0_rgba(3,22,49,.03),0_24px_64px_-32px_rgba(3,22,49,.20)]">
        {/* banner */}
        <div
          className="h-2"
          style={{
            background:
              "linear-gradient(90deg, var(--accent) 0%, var(--primary) 100%)",
          }}
        />
        {/* head */}
        <div className="border-b border-[var(--line-faint)] px-9 pb-6 pt-8">
          {orgName && (
            <div className="mb-2 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
              {orgName} · מועמדות
            </div>
          )}
          <h1 className="m-0 mb-2 text-[24px] font-semibold tracking-[-0.01em] text-primary">
            {title || "טופס מועמדות"}
          </h1>
          {description && (
            <p className="m-0 text-[15px] text-fg-muted">{description}</p>
          )}
        </div>

        {/* body */}
        <div className="px-9 pb-2 pt-7">
          {fields.map((f) => (
            <PreviewField key={f.id} field={f} />
          ))}
        </div>

        {/* foot */}
        <div className="flex items-center gap-3.5 border-t border-[var(--line-faint)] bg-[var(--bg-subtle)] px-9 pb-8 pt-[18px]">
          <button
            type="button"
            className="rounded-md bg-[var(--accent)] px-7 py-3 text-[15px] font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            שליחת הטופס
          </button>
          <span className="text-[11px] text-fg-subtle">
            <span className="font-bold text-[var(--accent)]">*</span> שדה חובה
          </span>
        </div>
      </div>
    </section>
  )
}

function mergeOptionsPv(field: FormField): string[] {
  const builtin = getDataset(field.dataset)
  const custom = field.options ?? []
  return [...custom, ...builtin]
}

function PreviewField({ field }: { field: FormField }) {
  const t = normalizeType(field.type)
  const inputCls =
    "h-10 w-full rounded-md border border-line bg-surface px-3 text-[15px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"

  if (t === "section") {
    return (
      <div className="my-7 mb-4 border-t-[1.5px] border-primary pt-2 relative">
        <span className="absolute -top-3 start-0 bg-surface pe-2.5 text-[11px] uppercase tracking-[0.06em] text-primary">
          {field.label}
        </span>
      </div>
    )
  }
  if (t === "info") {
    return (
      <div className="mb-[22px] rounded-md border-s-[3px] border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-3 text-[13px] text-fg-muted">
        {field.help || field.label}
      </div>
    )
  }

  return (
    <div className="mb-[22px]">
      <label className="mb-1.5 block text-[13px] font-medium text-fg">
        {field.label}
        {field.required && (
          <span className="ms-0.5 font-bold text-[var(--accent)]">*</span>
        )}
      </label>
      {field.help && (
        <div className="mb-2 text-[11px] text-fg-subtle">{field.help}</div>
      )}

      {(() => {
        switch (t) {
          case "short_text":
            return (
              <input
                type="text"
                placeholder={field.placeholder}
                className={inputCls}
              />
            )
          case "long_text":
            return (
              <textarea
                placeholder={field.placeholder}
                className={inputCls + " min-h-[96px] py-2.5"}
              />
            )
          case "email":
            return (
              <input
                type="email"
                dir="ltr"
                placeholder={field.placeholder}
                className={inputCls}
              />
            )
          case "phone":
            return (
              <input
                type="tel"
                dir="ltr"
                inputMode="numeric"
                maxLength={10}
                placeholder={field.placeholder || "0500000000"}
                className={inputCls}
              />
            )
          case "id_number":
            return (
              <input
                type="text"
                dir="ltr"
                inputMode="numeric"
                maxLength={9}
                placeholder={field.placeholder || "9 ספרות"}
                className={inputCls}
              />
            )
          case "url":
            return (
              <input
                type="url"
                dir="ltr"
                placeholder={field.placeholder}
                className={inputCls}
              />
            )
          case "number":
            return (
              <input
                type="number"
                min={field.min as number}
                max={field.max as number}
                placeholder={field.placeholder}
                className={inputCls}
              />
            )
          case "date":
            return <input type="date" className={inputCls} />
          case "dropdown":
            return (
              <select className={inputCls} defaultValue="">
                <option value="" disabled>
                  בחר…
                </option>
                {mergeOptionsPv(field).map((o, i) => (
                  <option key={i} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )
          case "radio":
            return (
              <div className="flex flex-col gap-2">
                {mergeOptionsPv(field).map((o, i) => (
                  <label
                    key={i}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line px-3 py-2.5 text-[15px] transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--bg-subtle)]"
                  >
                    <input
                      type="radio"
                      name={field.id}
                      className="accent-[var(--accent)]"
                    />
                    {o}
                  </label>
                ))}
              </div>
            )
          case "checkbox":
            return (
              <div className="flex flex-col gap-2">
                {mergeOptionsPv(field).map((o, i) => (
                  <label
                    key={i}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line px-3 py-2.5 text-[15px] transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--bg-subtle)]"
                  >
                    <input
                      type="checkbox"
                      className="accent-[var(--accent)]"
                    />
                    {o}
                  </label>
                ))}
              </div>
            )
          case "rating": {
            const n = Number(field.max) || 5
            return (
              <div className="flex gap-2 text-[var(--fg-faint)]">
                {Array.from({ length: n }).map((_, i) => (
                  <Star key={i} className="h-7 w-7 cursor-pointer hover:text-[var(--accent)]" />
                ))}
              </div>
            )
          }
          case "file":
            return (
              <div className="rounded-md border-[1.5px] border-dashed border-[var(--line-strong)] bg-[var(--bg-subtle)] px-4 py-5 text-center text-[13px] text-fg-subtle">
                גרור קובץ או{" "}
                <span className="font-medium text-[var(--accent)]">
                  בחר מהמחשב
                </span>
                {field.accept && (
                  <div className="mt-1 text-[11px] text-[var(--fg-faint)]">
                    {field.accept}
                  </div>
                )}
              </div>
            )
          case "signature":
            return (
              <div className="grid h-[110px] place-items-center rounded-md border-[1.5px] border-dashed border-[var(--line-strong)] bg-[var(--bg-subtle)] italic text-[var(--fg-faint)]">
                חתום כאן
              </div>
            )
          default:
            return null
        }
      })()}
    </div>
  )
}
