"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Archive, Loader2, AlertTriangle } from "lucide-react"

// "מחיקה רכה" — מעבירה את השלוחה ל-archived. הנתונים נשמרים, ניתן לשחזר ע"י שינוי סטטוס חזרה.

export function ArchiveAcademyButton({
  orgId, orgName, currentStatus,
}: {
  orgId: string
  orgName: string
  currentStatus: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  const alreadyArchived = currentStatus === "archived"

  async function archive() {
    setBusy(true)
    setErr("")
    const res = await fetch(`/api/council/organizations/${orgId}/archive`, { method: "POST" })
    setBusy(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setErr(`מחיקה נכשלה: ${j.error ?? res.status}`)
      return
    }
    setOpen(false)
    router.refresh()
  }

  if (alreadyArchived) return null

  return (
    <>
      <div className="rounded-lg border border-[color-mix(in_srgb,var(--danger)_30%,var(--line))] bg-[color-mix(in_srgb,var(--danger)_5%,transparent)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="m-0 text-[13px] font-semibold text-[var(--danger)]">אזור מסוכן</h3>
              <p className="m-0 mt-0.5 max-w-[60ch] text-[12px] text-fg-muted">
                מחיקת השלוחה מעבירה אותה לארכיון — היא תיעלם מתצוגות פעילות, אך הנתונים נשמרים וניתן לשחזר ע"י שינוי הסטטוס חזרה ל"פעילה".
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-[var(--danger)] bg-surface px-4 text-[13px] font-medium text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]"
          >
            <Archive className="h-4 w-4" />
            מחק שלוחה
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: "var(--overlay)" }}
          onClick={() => !busy && setOpen(false)}
        >
          <div className="w-full max-w-md rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--danger)]">
                <AlertTriangle className="h-4 w-4" />
                מחיקת שלוחה
              </h2>
            </div>
            <div className="px-5 py-4 text-[13px] text-fg">
              <p className="m-0">למחוק את <b>{orgName}</b>?</p>
              <p className="m-0 mt-2 text-[12px] text-fg-muted">
                השלוחה תועבר לארכיון. ניתן לשחזר אותה בהמשך ע"י שינוי הסטטוס ל"פעילה" בפעולות הניהול.
              </p>
              {err && <p className="m-0 mt-3 text-[12px] text-[var(--danger)]">{err}</p>}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[var(--line-faint)] px-5 py-3">
              <button onClick={() => setOpen(false)} disabled={busy} className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]">
                ביטול
              </button>
              <button
                onClick={archive}
                disabled={busy}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--danger)] px-4 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                כן, מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
