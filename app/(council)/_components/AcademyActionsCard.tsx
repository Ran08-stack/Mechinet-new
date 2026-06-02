"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2 } from "lucide-react"

type Movement = { id: string; name: string }
type Status = "active" | "suspended" | "archived"

type Props = {
  orgId: string
  initial: {
    contact_person: string | null
    contact_phone: string | null
    region: string | null
    city: string | null
    status: string
    movement_id: string | null
  }
  movements: Movement[]
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "active", label: "פעילה" },
  { value: "suspended", label: "מושעית" },
  { value: "archived", label: "בארכיון" },
]

export function AcademyActionsCard({ orgId, initial, movements }: Props) {
  const router = useRouter()
  const [contactPerson, setContactPerson] = useState(initial.contact_person ?? "")
  const [contactPhone, setContactPhone] = useState(initial.contact_phone ?? "")
  const [region, setRegion] = useState(initial.region ?? "")
  const [city, setCity] = useState(initial.city ?? "")
  const [status, setStatus] = useState<Status>((initial.status as Status) ?? "active")
  const [movementId, setMovementId] = useState(initial.movement_id ?? "")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  async function handlePhone(v: string) {
    setContactPhone(v.replace(/\D/g, "").slice(0, 10))
  }

  async function save() {
    setSaving(true)
    setMsg(null)

    const body: Record<string, unknown> = {
      contact_person: contactPerson,
      contact_phone: contactPhone,
      region,
      city,
      status,
      movement_id: movementId || null,
    }

    // אם המיקום השתנה — לאתר קואורדינטות מחדש
    const loc = city.trim()
    if (loc !== (initial.city ?? "").trim()) {
      if (loc) {
        const gr = await fetch(`/api/council/geocode?q=${encodeURIComponent(loc)}`)
        if (!gr.ok) {
          setSaving(false)
          setMsg({ kind: "err", text: "לא נמצא מיקום בשם הזה. נסה עיר/קיבוץ/יישוב אחר." })
          return
        }
        const g = await gr.json()
        body.lat = g.lat
        body.lng = g.lng
      } else {
        body.lat = null
        body.lng = null
      }
    }

    const res = await fetch(`/api/council/organizations/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setMsg({ kind: "err", text: `שמירה נכשלה: ${j.error ?? res.status}` })
      return
    }
    setMsg({ kind: "ok", text: "נשמר" })
    router.refresh()
  }

  const inputCls =
    "h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="border-b border-[var(--line-faint)] px-5 py-3">
        <h3 className="m-0 text-[13px] font-semibold text-primary">פעולות ניהול</h3>
        <p className="m-0 mt-0.5 text-[12px] text-fg-muted">
          כל שינוי נרשם ביומן הביקורת
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        <Field label="איש קשר">
          <input
            className={inputCls}
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="שם מנהל/ת"
          />
        </Field>
        <Field label="טלפון">
          <input
            className={inputCls}
            value={contactPhone}
            onChange={(e) => handlePhone(e.target.value)}
            placeholder="0501234567"
            inputMode="numeric"
          />
        </Field>
        <Field label="מיקום (עיר / קיבוץ / יישוב)">
          <input
            className={inputCls}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="לדוגמה: קיבוץ אורנים"
          />
        </Field>
        <Field label="אזור">
          <input
            className={inputCls}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="צפון / מרכז / דרום…"
          />
        </Field>
        <Field label="תנועה">
          <select
            className={inputCls}
            value={movementId}
            onChange={(e) => setMovementId(e.target.value)}
          >
            <option value="">— ללא תנועה —</option>
            {movements.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </Field>
        <Field label="סטטוס">
          <select
            className={inputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--line-faint)] px-5 py-3">
        <span className={`text-[12px] ${msg?.kind === "err" ? "text-[var(--danger)]" : "text-fg-muted"}`}>
          {msg?.text ?? " "}
        </span>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          שמור שינויים
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-fg-muted">{label}</span>
      {children}
    </label>
  )
}
