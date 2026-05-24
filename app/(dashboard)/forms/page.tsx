import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
  Plus,
  FileText,
  Sparkles,
  ExternalLink,
  ArrowLeft,
} from "lucide-react"
import CopyLinkButton from "@/components/forms/CopyLinkButton"
import DeleteFormButton from "@/components/forms/DeleteFormButton"
import { Topbar } from "../_components/Topbar"
import type { FormField } from "@/types/database"

export default async function FormsPage() {
  const supabase = await createClient()

  const { data: forms } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: candidates } = await supabase
    .from("candidates")
    .select("form_id")

  const countByForm: Record<string, number> = {}
  for (const c of candidates ?? []) {
    if (c.form_id) countByForm[c.form_id] = (countByForm[c.form_id] ?? 0) + 1
  }

  const list = forms ?? []
  const totalSubmissions = (candidates ?? []).filter((c) => c.form_id).length
  const activeCount = list.filter((f) => f.is_active).length
  const draftCount = list.length - activeCount

  return (
    <>
      <Topbar
        crumb="טפסים"
        action={
          <Link
            href="/forms/new/builder"
            className="inline-flex h-7 items-center gap-1.5 rounded-md bg-accent px-3 text-[13px] font-medium text-white hover:bg-accent-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            טופס חדש
          </Link>
        }
      />

      {/* HERO */}
      <section
        className="relative overflow-hidden border-b border-line"
        style={{
          background:
            "radial-gradient(ellipse 800px 320px at 85% -10%, rgba(254,111,66,.08), transparent 60%), radial-gradient(ellipse 600px 240px at 15% 110%, rgba(55,71,101,.06), transparent 65%), var(--surface)",
        }}
      >
        <div className="mx-auto max-w-[1200px] px-7 py-10">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* כותרת + תיאור */}
            <div>
              <h1 className="m-0 text-[40px] font-bold leading-[1.1] tracking-[-0.02em] text-primary">
                טפסי מועמדות
              </h1>
              <p className="mt-3 max-w-[52ch] text-[14px] leading-[1.55] text-fg-muted">
                ניהול הטפסים של המכינה — יצירה, עריכה, פרסום ושיתוף קישור.
              </p>
            </div>

            {/* סטטיסטיקות */}
            <div className="grid grid-cols-3 gap-3">
              <StatTile
                value={list.length}
                label="טפסים"
                accent="primary"
              />
              <StatTile
                value={totalSubmissions}
                label="הגשות"
                accent="accent"
              />
              <StatTile
                value={activeCount}
                label="פעילים"
                hint={`${draftCount} טיוטה`}
                accent="ai"
              />
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-[1200px] px-7 py-8 pb-16">
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {list.map((form, idx) => {
              const fields = Array.isArray(form.fields)
                ? (form.fields as FormField[])
                : []
              const fieldCount = fields.length
              const requiredCount = fields.filter((f) => f.required).length
              const candidateCount = countByForm[form.id] ?? 0
              return (
                <FormCard
                  key={form.id}
                  index={idx + 1}
                  id={form.id}
                  name={form.name}
                  description={form.description}
                  isActive={form.is_active}
                  fieldCount={fieldCount}
                  requiredCount={requiredCount}
                  candidateCount={candidateCount}
                  createdAt={form.created_at}
                />
              )
            })}

            {/* + new form card */}
            <Link
              href="/forms/new/builder"
              className="group flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border-[1.5px] border-dashed border-[var(--line-strong)] bg-[var(--bg-subtle)]/40 p-8 text-center transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/30"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-surface text-fg-muted transition-colors group-hover:bg-[var(--accent)] group-hover:text-white shadow-[var(--shadow-sm)]">
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[15px] font-semibold text-fg group-hover:text-[var(--accent-hover)]">
                  טופס חדש
                </div>
                <div className="mt-1 text-[12px] text-fg-subtle">
                  התחל ריק או בחר ערכה מוכנה
                </div>
              </div>
            </Link>
          </div>
        )}
      </section>
    </>
  )
}

function StatTile({
  value,
  label,
  hint,
  accent,
}: {
  value: number
  label: string
  hint?: string
  accent: "primary" | "accent" | "ai"
}) {
  const colors: Record<typeof accent, string> = {
    primary: "var(--primary)",
    accent: "var(--accent)",
    ai: "var(--ai-deep)",
  }
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3.5">
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-[32px] font-bold leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums]"
          style={{ color: colors[accent] }}
        >
          {value}
        </span>
        {hint && (
          <span className="text-[11px] text-fg-subtle">+ {hint}</span>
        )}
      </div>
      <div className="mt-1 text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
        {label}
      </div>
    </div>
  )
}

function FormCard({
  index,
  id,
  name,
  description,
  isActive,
  fieldCount,
  requiredCount,
  candidateCount,
  createdAt,
}: {
  index: number
  id: string
  name: string
  description: string | null
  isActive: boolean
  fieldCount: number
  requiredCount: number
  candidateCount: number
  createdAt: string | null
}) {
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("he-IL", {
        day: "numeric",
        month: "short",
      })
    : ""

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-[0_12px_32px_-16px_rgba(3,22,49,.18)]">
      {/* פס accent ימני */}
      <div
        className="absolute inset-y-0 start-0 w-1"
        style={{
          background: isActive
            ? "linear-gradient(180deg, var(--accent) 0%, var(--primary) 100%)"
            : "linear-gradient(180deg, var(--line-strong) 0%, var(--line) 100%)",
        }}
      />

      {/* תוכן */}
      <div className="flex flex-1 flex-col gap-4 p-6 ps-7">
        {/* meta line */}
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-fg-subtle [font-variant-numeric:tabular-nums]">
            #{String(index).padStart(2, "0")}
            {date && (
              <span className="ms-2 font-normal normal-case text-[var(--fg-faint)]">
                · {date}
              </span>
            )}
          </span>
          <StatusBadge active={isActive} />
        </div>

        {/* title */}
        <div>
          <h2 className="m-0 text-[20px] font-bold leading-[1.2] tracking-[-0.015em] text-primary">
            {name}
          </h2>
          {description && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.5] text-fg-muted">
              {description}
            </p>
          )}
        </div>

        {/* stats row */}
        <div className="mt-auto flex items-center gap-4 border-t border-[var(--line-faint)] pt-3.5 text-[12px]">
          <Metric value={fieldCount} label="שדות" />
          <Divider />
          <Metric value={requiredCount} label="חובה" />
          <Divider />
          <Metric
            value={candidateCount}
            label="הוגשו"
            highlight={candidateCount > 0}
          />
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 border-t border-line bg-[var(--bg-subtle)] px-5 py-3">
        <Link
          href={`/forms/${id}/builder`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] font-medium text-fg hover:bg-[var(--bg-subtle)] hover:border-[var(--line-strong)]"
        >
          עריכה
          <ArrowLeft className="h-3 w-3" />
        </Link>
        <CopyLinkButton formId={id} />
        <a
          href={`/apply/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          title="פתח קישור ציבורי"
          className="inline-grid h-8 w-8 place-items-center rounded-md border border-line bg-surface text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <div className="ms-auto">
          <DeleteFormButton formId={id} />
        </div>
      </div>
    </article>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em]"
      style={{
        background: active ? "var(--stage-accepted-bg)" : "var(--bg-muted)",
        color: active ? "var(--stage-accepted-fg)" : "var(--fg-muted)",
        borderColor: active
          ? "var(--stage-accepted-line)"
          : "var(--line-strong)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: active
            ? "var(--stage-accepted-dot)"
            : "var(--fg-faint)",
        }}
      />
      {active ? "פעיל" : "טיוטה"}
    </span>
  )
}

function Metric({
  value,
  label,
  highlight,
}: {
  value: number
  label: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span
        className={`text-[15px] font-bold leading-none tracking-[-0.015em] [font-variant-numeric:tabular-nums] ${
          highlight ? "text-[var(--accent-hover)]" : "text-fg"
        }`}
      >
        {value}
      </span>
      <span className="text-[11px] text-fg-subtle">{label}</span>
    </div>
  )
}

function Divider() {
  return <span className="h-3 w-px bg-line" />
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface px-8 py-24 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle 400px at 50% 0%, rgba(254,111,66,.06), transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-line bg-[var(--bg-subtle)] text-fg-muted">
          <FileText className="h-7 w-7" />
        </div>
        <h3 className="m-0 text-[22px] font-bold tracking-[-0.015em] text-primary">
          אין עדיין טפסים
        </h3>
        <p className="mx-auto mt-2 max-w-[44ch] text-[14px] text-fg-muted">
          התחל ביצירת טופס הראשון. כל הצרכים שלך — פרטים אישיים, שאלות
          פתוחות, העלאות — בלחיצה אחת.
        </p>
        <Link
          href="/forms/new/builder"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-[var(--accent)] px-5 text-[14px] font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          <Plus className="h-4 w-4" />
          צור טופס ראשון
        </Link>
      </div>
    </div>
  )
}
