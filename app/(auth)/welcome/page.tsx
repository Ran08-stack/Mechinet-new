"use client"

// /welcome — נחיתה מלינק ההזמנה. ה-Supabase client מזהה את ה-session מה-URL אוטומטית.
// המשתמש קובע סיסמה → updateUser → סימון ההזמנה accepted → כניסה ל-/candidates.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function WelcomePage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [ready, setReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setHasSession(!!data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setHasSession(!!session)
      setReady(true)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("הסיסמה חייבת להיות לפחות 8 תווים")
      return
    }
    if (password !== confirm) {
      setError("הסיסמאות אינן תואמות")
      return
    }
    setSaving(true)
    const { error: upErr } = await supabase.auth.updateUser({ password })
    if (upErr) {
      setError(upErr.message)
      setSaving(false)
      return
    }
    await fetch("/api/invitations/accept", { method: "POST" }).catch(() => {})
    router.push("/candidates")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4" dir="rtl">
      <div className="w-full max-w-[420px] rounded-lg border border-line bg-surface p-7 shadow-[var(--shadow-lg)]">
        {!ready ? (
          <p className="py-8 text-center text-[13px] text-fg-muted">טוען…</p>
        ) : !hasSession ? (
          <div className="text-center">
            <h1 className="m-0 text-[20px] font-semibold text-primary">ההזמנה אינה תקפה</h1>
            <p className="mt-3 text-[14px] text-fg-muted">
              ייתכן שהלינק פג תוקף או כבר נוצל. פנה למנהל המערכת לקבלת הזמנה חדשה.
            </p>
            <a
              href="/login"
              className="mt-5 inline-flex h-10 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-primary hover:bg-[var(--bg-subtle)]"
            >
              למסך הכניסה
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h1 className="m-0 text-[22px] font-semibold text-primary">ברוך הבא ל-Mechinet</h1>
              <p className="mt-2 text-[14px] text-fg-muted">בחר סיסמה כדי להפעיל את החשבון.</p>
            </div>
            <label className="flex flex-col gap-1.5 text-[13px] text-fg-muted">
              סיסמה
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-10 rounded-md border border-line bg-surface px-3 text-[14px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] text-fg-muted">
              אימות סיסמה
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="h-10 rounded-md border border-line bg-surface px-3 text-[14px] text-fg outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
              />
            </label>
            {error && <p className="m-0 text-[13px] text-[var(--danger)]">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-md bg-accent px-4 text-[14px] font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {saving ? "מפעיל…" : "הפעל חשבון והיכנס"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
