"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, X, Building2 } from "lucide-react"

// יצירת מכינה חדשה ע"י המועצה.
// בשלב זה: יוצר רשומת organization בלבד.
// יצירת חשבון המשתמש (auth) + magic link — צעד נפרד כשיוגדר שירות אימייל.

export function InviteAcademyButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError("")
    const supabase = createClient()
    const { error: insertError } = await supabase
      .from("organizations")
      .insert({
        name: name.trim(),
        slug: "academy-" + Date.now().toString(36),
      })
    if (insertError) {
      setError("שגיאה ביצירת המכינה. נסה שוב.")
      setSaving(false)
      return
    }
    setName("")
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4" />
        הזמן מכינה חדשה
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "var(--overlay)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                מכינה חדשה
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
                  שם המכינה
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="לדוגמה: מכינת רבין - שלוחה צפון"
                  className="h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
                />
              </div>

              {error && (
                <p className="m-0 text-[12px] text-[var(--danger)]">{error}</p>
              )}

              <p className="m-0 rounded-md bg-[var(--bg-subtle)] px-3 py-2.5 text-[12px] leading-relaxed text-fg-muted">
                המכינה תיווצר במערכת. שליחת הזמנה במייל למנהל המכינה תתאפשר
                לאחר הגדרת שירות האימייל.
              </p>

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
                  <Building2 className="h-4 w-4" />
                  {saving ? "יוצר..." : "צור מכינה"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
