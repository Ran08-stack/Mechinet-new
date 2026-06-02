"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, X, Building2 } from "lucide-react"

// הוספת שלוחה ע"י המועצה.
// שלוחה = רשומת organization, משויכת למכינה (academy) ועיר.
// אפשר לבחור מכינה קיימת או ליצור חדשה בו-זמנית.
// יצירת חשבון המשתמש (auth) + magic link — צעד נפרד כשיוגדר שירות אימייל.

const NEW_ACADEMY = "__new__"

export function InviteAcademyButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [academies, setAcademies] = useState<{ id: string; name: string }[]>([])

  const [academyId, setAcademyId] = useState("")
  const [newAcademyName, setNewAcademyName] = useState("")
  const [branchName, setBranchName] = useState("")
  const [location, setLocation] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    supabase
      .from("academies")
      .select("id, name")
      .order("name")
      .then(({ data }) => setAcademies(data ?? []))
  }, [open])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!branchName.trim()) return
    setSaving(true)
    setError("")
    const supabase = createClient()

    // מכינה: קיימת או חדשה
    let resolvedAcademyId = academyId
    if (academyId === NEW_ACADEMY) {
      if (!newAcademyName.trim()) {
        setError("יש להזין שם מכינה")
        setSaving(false)
        return
      }
      const { data: ac, error: acErr } = await supabase
        .from("academies")
        .insert({ name: newAcademyName.trim() })
        .select("id")
        .single()
      if (acErr || !ac) {
        setError(`שגיאה ביצירת המכינה: ${acErr?.message ?? ""}`)
        setSaving(false)
        return
      }
      resolvedAcademyId = ac.id
    }

    // איתור מקום חופשי → קואורדינטות (אופציונלי)
    let lat: number | null = null
    let lng: number | null = null
    const loc = location.trim()
    if (loc) {
      const res = await fetch(`/api/council/geocode?q=${encodeURIComponent(loc)}`)
      if (!res.ok) {
        setError("לא נמצא מיקום בשם הזה. נסה עיר/קיבוץ/יישוב אחר, או השאר ריק.")
        setSaving(false)
        return
      }
      const g = await res.json()
      lat = g.lat
      lng = g.lng
    }

    const { error: insertError } = await supabase.from("organizations").insert({
      name: branchName.trim(),
      slug: "branch-" + Date.now().toString(36),
      academy_id: resolvedAcademyId || null,
      city: loc || null,
      lat,
      lng,
    })
    if (insertError) {
      console.error("InviteAcademyButton insert failed:", insertError.message)
      setError(`שגיאה ביצירת השלוחה: ${insertError.message}`)
      setSaving(false)
      return
    }
    setBranchName("")
    setNewAcademyName("")
    setLocation("")
    setAcademyId("")
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  const inputCls =
    "h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4" />
        הוסף שלוחה
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: "var(--overlay)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                שלוחה חדשה
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
                <label className="text-[13px] font-medium text-fg">מכינה</label>
                <select
                  required
                  value={academyId}
                  onChange={(e) => setAcademyId(e.target.value)}
                  className={inputCls}
                >
                  <option value="" disabled>
                    בחר מכינה...
                  </option>
                  {academies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                  <option value={NEW_ACADEMY}>+ מכינה חדשה...</option>
                </select>
              </div>

              {academyId === NEW_ACADEMY && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-fg">
                    שם המכינה החדשה
                  </label>
                  <input
                    type="text"
                    value={newAcademyName}
                    onChange={(e) => setNewAcademyName(e.target.value)}
                    placeholder="לדוגמה: מכינת רבין"
                    className={inputCls}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">
                  שם השלוחה
                </label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="לדוגמה: שלוחת אורנים"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">
                  מיקום (עיר / קיבוץ / יישוב)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="לדוגמה: קיבוץ אורנים"
                  className={inputCls}
                />
                <span className="text-[11px] text-fg-subtle">
                  המיקום יאותר אוטומטית על המפה. אפשר להשאיר ריק.
                </span>
              </div>

              {error && (
                <p className="m-0 text-[12px] text-[var(--danger)]">{error}</p>
              )}

              <p className="m-0 rounded-md bg-[var(--bg-subtle)] px-3 py-2.5 text-[12px] leading-relaxed text-fg-muted">
                השלוחה תיווצר במערכת. שליחת הזמנה במייל למנהל השלוחה תתאפשר
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
                  {saving ? "יוצר..." : "צור שלוחה"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
