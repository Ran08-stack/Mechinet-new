"use client"

// פעולות תחת תובנת ה-AI הארצית:
// - "דוח לדירקטוריון" → ניווט למסך הדוחות (/council/reports).
// - "רענן ניתוח" → מבטל cache (server action) ומרענן את הראוט.
// - "אשר את התובנה" → אישור ויזואלי בסשן (ללא persistence — שמירה היסטורית היא פיצ'ר עתידי).

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FileText, RefreshCw, Check, Loader2 } from "lucide-react"
import { refreshCouncilInsight } from "./council-actions"

export function CouncilInsightActions() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [approved, setApproved] = useState(false)

  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      <button
        onClick={() => router.push("/council/reports")}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ai)] bg-[var(--ai)] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[var(--ai-deep)]"
      >
        <FileText className="h-3 w-3" />
        דוח מלא לדירקטוריון
      </button>
      <button
        onClick={() =>
          startTransition(async () => {
            await refreshCouncilInsight()
            router.refresh()
          })
        }
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ai)] bg-surface px-3 py-1.5 text-[12.5px] font-medium text-[var(--ai-deep)] hover:bg-[var(--ai)] hover:text-white disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        {pending ? "מרענן…" : "רענן ניתוח"}
      </button>
      <button
        onClick={() => setApproved(true)}
        disabled={approved}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ai)] bg-surface px-3 py-1.5 text-[12.5px] font-medium text-[var(--ai-deep)] hover:bg-[var(--ai)] hover:text-white disabled:cursor-default disabled:bg-[var(--ai)] disabled:text-white disabled:opacity-100"
      >
        <Check className="h-3 w-3" />
        {approved ? "התובנה אושרה" : "אשר את התובנה"}
      </button>
    </div>
  )
}
