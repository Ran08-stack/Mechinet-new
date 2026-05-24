"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Pencil, X } from "lucide-react"
import { normalizePhone } from "@/lib/utils"
import { Candidate } from "@/types/database"

// כפתור "ערוך פרטים" + מודאל עריכה של שדות בסיסיים של מועמד.
// תיקון שגיאות הקלדה בדואל/טלפון/ת"ז/עיר/בית ספר.

export default function EditCandidateButton({ candidate }: { candidate: Candidate }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  const [fullName, setFullName] = useState(candidate.full_name)
  const [nationalId, setNationalId] = useState(candidate.national_id ?? "")
  const [email, setEmail] = useState(candidate.email)
  const [phone, setPhone] = useState(candidate.phone ?? "")
  const [city, setCity] = useState(candidate.city ?? "")
  const [school, setSchool] = useState(candidate.school ?? "")
  const [birthDate, setBirthDate] = useState(candidate.birth_date ?? "")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) return
    setSaving(true)
    setErr("")
    const supabase = createClient()
    const { error } = await supabase
      .from("candidates")
      .update({
        full_name: fullName.trim(),
        national_id: nationalId.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
        school: school.trim() || null,
        birth_date: birthDate || null,
      })
      .eq("id", candidate.id)
    if (error) {
      setErr("שגיאה בשמירה")
      setSaving(false)
      return
    }
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="ערוך פרטים"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg"
      >
        <Pencil className="h-3 w-3" />
        ערוך
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "var(--overlay)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                עריכת פרטי מועמד
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-3 p-5">
              <Field label="שם מלא" required>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label='ת"ז'>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    value={nationalId}
                    onChange={(e) =>
                      setNationalId(
                        e.target.value.replace(/\D/g, "").slice(0, 9)
                      )
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="תאריך לידה">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="אימייל" required>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="טלפון">
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(normalizePhone(e.target.value))}
                    className={inputCls}
                  />
                </Field>
                <Field label="עיר">
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="בית ספר">
                <input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className={inputCls}
                />
              </Field>
              {err && (
                <p className="text-[12px] text-[var(--danger)]">{err}</p>
              )}
              <div className="flex justify-end gap-2 pt-1">
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
                  className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-[var(--primary-2)] disabled:opacity-60"
                >
                  {saving ? "שומר…" : "שמור"}
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
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-fg">
        {label}
        {required && <span className="ms-1 text-[var(--danger)]">*</span>}
      </label>
      {children}
    </div>
  )
}
