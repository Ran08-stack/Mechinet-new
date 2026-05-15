"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, X, UserPlus } from "lucide-react"

const STAGES = [
  { value: "new", label: "חדש" },
  { value: "review", label: "בבדיקה" },
  { value: "interview", label: "ראיון" },
  { value: "accepted", label: "התקבל" },
  { value: "rejected", label: "נדחה" },
]

// כפתור "מועמד חדש" + מודאל יצירה ידנית.
// מקבל organizationId מהעמוד (server) כדי לשייך את המועמד למכינה.

export default function NewCandidateButton({
  organizationId,
}: {
  organizationId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [stage, setStage] = useState("new")

  function reset() {
    setFullName("")
    setEmail("")
    setPhone("")
    setCity("")
    setStage("new")
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
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      city: city.trim() || null,
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
            className="w-full max-w-md rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
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
            <form onSubmit={handleCreate} className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">
                  שם מלא
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="שם המועמד"
                  className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">
                  אימייל
                </label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-fg">
                    טלפון
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-fg">
                    עיר
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="עיר מגורים"
                    className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">
                  שלב
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
                >
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
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
