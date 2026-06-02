"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { normalizePhone } from "@/lib/utils"
import { Plus, X, GraduationCap, ChevronLeft, CheckCircle2 } from "lucide-react"

// מסך הרשמה ציבורי של מכינה (self-service, ללא auth).
// שולח POST ל-/api/register שמכניס רשומת registration_requests בסטטוס pending.

type BranchRow = { branch_name: string; city: string }

const inputCls =
  "h-[46px] w-full rounded-md border border-line bg-surface px-3.5 text-[14px] text-fg outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-accent focus:shadow-[var(--shadow-focus)]"

export default function RegisterPage() {
  const [movements, setMovements] = useState<{ id: string; name: string }[]>([])
  const [academies, setAcademies] = useState<{ id: string; name: string }[]>([])

  const [academyName, setAcademyName] = useState("")
  const [movementId, setMovementId] = useState("")
  const [linkExisting, setLinkExisting] = useState(false)
  const [existingAcademyId, setExistingAcademyId] = useState("")

  const [branches, setBranches] = useState<BranchRow[]>([
    { branch_name: "", city: "" },
  ])

  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [notes, setNotes] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("movements")
      .select("id, name")
      .order("name")
      .then(({ data }) => setMovements(data ?? []))
    supabase
      .from("academies")
      .select("id, name")
      .order("name")
      .then(({ data }) => setAcademies(data ?? []))
  }, [])

  function updateBranch(i: number, field: keyof BranchRow, value: string) {
    setBranches((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    )
  }

  function addBranch() {
    setBranches((rows) => [...rows, { branch_name: "", city: "" }])
  }

  function removeBranch(i: number) {
    setBranches((rows) => rows.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!academyName.trim()) {
      setError("שם המכינה חובה")
      return
    }
    if (!contactName.trim()) {
      setError("שם איש הקשר חובה")
      return
    }
    if (!contactEmail.trim()) {
      setError("אימייל חובה")
      return
    }
    const validBranches = branches.filter((b) => b.branch_name.trim())
    if (validBranches.length === 0) {
      setError("יש להזין לפחות שלוחה אחת עם שם")
      return
    }

    setLoading(true)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        academy_name: academyName.trim(),
        movement_id: movementId || null,
        existing_academy_id: linkExisting ? existingAcademyId || null : null,
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone,
        notes: notes.trim() || null,
        branches: validBranches.map((b) => ({
          branch_name: b.branch_name.trim(),
          city: b.city.trim(),
        })),
      }),
    })

    const data = await res.json().catch(() => null)
    setLoading(false)

    if (!res.ok || !data?.ok) {
      setError(data?.error ?? "אירעה שגיאה. נסו שוב.")
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6 font-sans" dir="rtl">
        <div className="flex w-full max-w-[480px] flex-col items-center gap-4 rounded-lg border border-line bg-surface p-10 text-center shadow-[var(--shadow-lg)]">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[rgba(68,221,193,0.12)] text-[var(--ai-bright)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="m-0 text-[22px] font-semibold text-primary">
            הבקשה התקבלה
          </h1>
          <p className="m-0 text-[15px] leading-[1.6] text-fg-muted">
            לאחר אישור מועצת המכינות יישלח אליך מייל להפעלת החשבון.
          </p>
          <Link
            href="/login"
            className="mt-2 text-[13px] font-medium text-accent hover:underline"
          >
            חזרה למסך הכניסה
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg p-6 font-sans sm:p-12" dir="rtl">
      <div className="m-auto flex w-full max-w-[560px] flex-col gap-6">
        {/* head */}
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-white shadow-[0_6px_14px_rgba(254,111,66,0.35)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="text-[15px] font-semibold leading-tight tracking-[-0.005em] text-primary">
            Mechinet
            <span className="mt-0.5 block font-mono text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
              ניהול מיונים למכינות קדם־צבאיות
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-[28px] font-semibold leading-[1.15] tracking-[-0.015em] text-primary">
            הרשמת מכינה חדשה
          </h1>
          <p className="m-0 text-[15px] leading-[1.55] text-fg-muted">
            מלאו את הפרטים. הבקשה תועבר לאישור מועצת המכינות.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* פרטי מכינה */}
          <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="m-0 text-[13px] font-semibold uppercase tracking-[0.04em] text-fg-subtle">
              פרטי המכינה
            </h2>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="academy" className="text-[13px] font-medium text-fg">
                שם המכינה
              </label>
              <input
                id="academy"
                type="text"
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
                placeholder="לדוגמה: מכינת רבין"
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="movement" className="text-[13px] font-medium text-fg">
                תנועה / ארגון (אופציונלי)
              </label>
              <select
                id="movement"
                value={movementId}
                onChange={(e) => setMovementId(e.target.value)}
                className={inputCls}
              >
                <option value="">ללא / לא רלוונטי</option>
                {movements.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-[13px] text-fg">
              <input
                type="checkbox"
                checked={linkExisting}
                onChange={(e) => setLinkExisting(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              כבר רשומה במערכת? קשר למכינה קיימת
            </label>

            {linkExisting && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="existing" className="text-[13px] font-medium text-fg">
                  מכינה קיימת
                </label>
                <select
                  id="existing"
                  value={existingAcademyId}
                  onChange={(e) => setExistingAcademyId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">בחר מכינה...</option>
                  {academies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </section>

          {/* שלוחות */}
          <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="m-0 text-[13px] font-semibold uppercase tracking-[0.04em] text-fg-subtle">
              שלוחות
            </h2>

            {branches.map((b, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-fg">
                    שם השלוחה
                  </label>
                  <input
                    type="text"
                    value={b.branch_name}
                    onChange={(e) => updateBranch(i, "branch_name", e.target.value)}
                    placeholder="לדוגמה: שלוחת אורנים"
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-fg">
                    עיר (אופציונלי)
                  </label>
                  <input
                    type="text"
                    value={b.city}
                    onChange={(e) => updateBranch(i, "city", e.target.value)}
                    placeholder="לדוגמה: קיבוץ אורנים"
                    className={inputCls}
                  />
                </div>
                {branches.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBranch(i)}
                    aria-label="הסר שלוחה"
                    className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-md border border-line text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addBranch}
              className="inline-flex h-9 items-center gap-2 self-start rounded-md border border-line bg-surface px-4 text-[13px] font-medium text-fg-muted transition-colors hover:bg-[var(--bg-subtle)]"
            >
              <Plus className="h-4 w-4" />
              הוסף שלוחה
            </button>
          </section>

          {/* איש קשר */}
          <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="m-0 text-[13px] font-semibold uppercase tracking-[0.04em] text-fg-subtle">
              איש קשר (מנהל המכינה)
            </h2>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cname" className="text-[13px] font-medium text-fg">
                שם מלא
              </label>
              <input
                id="cname"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="שם מנהל המכינה"
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cemail" className="text-[13px] font-medium text-fg">
                אימייל
              </label>
              <input
                id="cemail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="name@mechina.org.il"
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cphone" className="text-[13px] font-medium text-fg">
                טלפון (אופציונלי)
              </label>
              <input
                id="cphone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={contactPhone}
                onChange={(e) => setContactPhone(normalizePhone(e.target.value))}
                placeholder="0500000000"
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="notes" className="text-[13px] font-medium text-fg">
                הערות (אופציונלי)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="מידע נוסף שתרצו להעביר למועצה"
                className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-[14px] text-fg outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-accent focus:shadow-[var(--shadow-focus)]"
              />
            </div>
          </section>

          {error && <p className="m-0 text-[13px] text-[var(--danger)]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2 rounded-md bg-accent text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(254,111,66,0.25)] transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "שולח..." : "שליחת בקשת הרשמה"}
            {!loading && <ChevronLeft className="h-4 w-4" />}
          </button>

          <Link
            href="/login"
            className="self-center text-[13px] text-fg-muted hover:text-fg hover:underline"
          >
            כבר יש לך חשבון? כניסה למערכת
          </Link>
        </form>
      </div>
    </div>
  )
}
