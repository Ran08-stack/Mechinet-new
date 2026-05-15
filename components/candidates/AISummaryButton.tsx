"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, RefreshCw } from "lucide-react"

export default function AISummaryButton({
  candidateId,
  hasSummary,
}: {
  candidateId: string
  hasSummary: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function generateSummary() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      })
      if (!res.ok) throw new Error("שגיאה בהפקת הסיכום")
      router.refresh()
    } catch {
      setError("לא הצליח להפיק סיכום. נסה שוב.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={generateSummary}
        disabled={loading}
        className="inline-flex h-8 items-center gap-2 rounded-md bg-gradient-to-br from-[var(--ai-bright)] to-[var(--ai)] px-3.5 text-[13px] font-medium text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] transition-[filter] hover:brightness-95 disabled:opacity-60"
      >
        {hasSummary ? (
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "מפיק סיכום…" : hasSummary ? "רענן סיכום AI" : "הפק סיכום AI"}
      </button>
      {error && (
        <p className="mt-2 text-[12px] text-[var(--danger)]">{error}</p>
      )}
    </div>
  )
}
