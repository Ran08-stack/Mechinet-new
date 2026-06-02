"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, Loader2, Check } from "lucide-react"

// שליחה חוזרת של הזמנה לחשבון שטרם הופעל (קורא ל-/api/council/invite-admin/resend).

export function ResendInviteButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [err, setErr] = useState("")

  async function resend() {
    setState("loading")
    setErr("")
    try {
      const res = await fetch("/api/council/invite-admin/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(j.error ?? "שגיאה")
        setState("error")
        return
      }
      setState("done")
      router.refresh()
    } catch {
      setErr("שגיאת רשת")
      setState("error")
    }
  }

  if (state === "done") {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-[var(--success)]">
        <Check className="h-3 w-3" />
        הזמנה נשלחה מחדש
      </span>
    )
  }

  return (
    <button
      onClick={resend}
      disabled={state === "loading"}
      title={err || "שלח שוב הזמנה"}
      className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11.5px] text-primary hover:bg-[var(--primary-soft)] disabled:opacity-60"
    >
      {state === "loading" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RefreshCw className="h-3 w-3" />
      )}
      {state === "error" ? "נסה שוב" : "שלח שוב הזמנה"}
    </button>
  )
}
