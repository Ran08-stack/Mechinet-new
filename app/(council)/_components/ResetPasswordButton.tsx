"use client"

import { useState } from "react"
import { Key, Loader2, Check } from "lucide-react"

// איפוס סיסמה — שולח למשתמש פעיל מייל recovery של Supabase.
// מוצג בכרטיס "חשבונות כניסה" רק לחשבונות פעילים (לא לחשבון עם הזמנה ממתינה).

export function ResetPasswordButton({ userId }: { userId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [err, setErr] = useState("")

  async function reset() {
    if (!confirm("לשלוח מייל איפוס סיסמה לחשבון זה?")) return
    setState("loading")
    setErr("")
    try {
      const res = await fetch(`/api/council/users/${userId}/reset-password`, { method: "POST" })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(j.error ?? "שגיאה")
        setState("error")
        return
      }
      setState("done")
    } catch {
      setErr("שגיאת רשת")
      setState("error")
    }
  }

  if (state === "done") {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-[var(--success)]">
        <Check className="h-3 w-3" />
        מייל איפוס נשלח
      </span>
    )
  }

  return (
    <button
      onClick={reset}
      disabled={state === "loading"}
      title={err || "שלח מייל איפוס סיסמה"}
      className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11.5px] text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg disabled:opacity-60"
    >
      {state === "loading" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Key className="h-3 w-3" />}
      {state === "error" ? "נסה שוב" : "איפוס סיסמה"}
    </button>
  )
}
