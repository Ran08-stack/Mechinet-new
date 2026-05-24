"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, X, UserPlus } from "lucide-react"
import { normalizePhone } from "@/lib/utils"
import { PipelineStage } from "@/types/database"

// כפתור "מועמד חדש" + מודאל יצירה ידנית.

export default function NewCandidateButton({
  organizationId,
  stages,
  forms = [],
}: {
  organizationId: string
  stages: PipelineStage[]
  forms?: { id: string; name: string }[]
}) {
  const router = useRouter()
  const defaultStage = stages.find((s) => s.is_default)?.name ?? stages[0]?.name ?? ""
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [fullName, setFullName] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [school, setSchool] = useState("")
  const [stage, setStage] = useState(defaultStage)
  const [formId, setFormId] = useState<string>("")

  // גיל מחושב מתאריך לידה
  const age = computeAge(birthDate)

  function reset() {
    setFullName("")
    setNationalId("")
    setBirthDate("")
    setGender("")
    setEmail("")
    setPhone("")
    setCity("")
    setSchool("")
    setStage(defaultStage)
    setError("")
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) return
    setSaving(true)
    setError("")
    const supabase = createClient()
    const { error: insertError } = await supabase.from("candidates").insert({
      organization_id: organizationId,
      form_id: formId || null,
      full_name: fullName.trim(),
      national_id: nationalId.trim() || null,
      birth_date: birthDate || null,
      gender: gender || null,
      email: email.trim(),
      phone: phone.trim() || null,
      city: city.trim() || null,
      school: school.trim() || null,
      stage,
    })
    if (insertError) {
      setError("שגיאה ביצירת המועמד. נסה שוב.")
      setSaving(false)
      return
    }
    reset()
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-7 items-center gap-1.5 rounded-md bg-accent px-3 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
      >
        <Plus className="h-3.5 w-3.5" />
        מועמד חדש
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "var(--overlay)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                מועמד חדש
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={handleCreate}
              className="flex max-h-[calc(100vh-160px)] flex-col gap-4 overflow-y-auto p-5"
            >
              {/* שם מלא */}
              <Field label="שם מלא" required>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="שם המועמד"
                  className={inputCls}
                />
              </Field>

              {/* ת"ז + תאריך לידה */}
              <div className="grid grid-cols-2 gap-3">
                <Field label='ת"ז'>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    value={nationalId}
                    onChange={(e) =>
                      setNationalId(e.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    placeholder="9 ספרות"
                    className={inputCls}
                  />
                </Field>
                <Field label="תאריך לידה" hint={age !== null ? `גיל ${age}` : undefined}>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* מגדר */}
              <Field label="מגדר">
                <div className="flex gap-2">
                  {[
                    { v: "male", l: "זכר" },
                    { v: "female", l: "נקבה" },
                    { v: "other", l: "אחר" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setGender(gender === opt.v ? "" : opt.v)}
                      className={`h-9 flex-1 rounded-md border px-3 text-[13px] transition-colors ${
                        gender === opt.v
                          ? "border-accent bg-[var(--accent-soft)] font-medium text-[var(--accent-hover)]"
                          : "border-line text-fg-muted hover:bg-[var(--bg-subtle)]"
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </Field>

              {/* אימייל */}
              <Field label="אימייל" required>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={inputCls}
                />
              </Field>

              {/* טלפון + עיר */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="טלפון">
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(normalizePhone(e.target.value))}
                    placeholder="0500000000"
                    className={inputCls}
                  />
                </Field>
                <Field label="עיר">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="עיר מגורים"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* בית ספר */}
              <Field label="בית ספר">
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="שם בית הספר"
                  className={inputCls}
                />
              </Field>

              {/* טופס + שלב */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="טופס שיוך"
                  hint={
                    forms.length === 0
                      ? "אין טפסים — צור טופס בעמוד הטפסים"
                      : undefined
                  }
                >
                  <select
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">ידני (ללא טופס)</option>
                    {forms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="שלב">
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className={inputCls}
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {error && (
                <p className="m-0 text-[12px] text-[var(--danger)]">{error}</p>
              )}

              <div className="mt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
                  {saving ? "יוצר…" : "צור מועמד"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

const inputCls =
  "h-10 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[13px] font-medium text-fg">
          {label}
          {required && <span className="ms-1 text-[var(--danger)]">*</span>}
        </label>
        {hint && <span className="text-[11.5px] text-fg-subtle">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function computeAge(iso: string): number | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age >= 0 && age < 150 ? age : null
}
