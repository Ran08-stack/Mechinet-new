"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-7 py-10">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="m-0 text-[20px] font-semibold text-primary">
          משהו השתבש
        </h2>
        <p className="mt-2 text-[13px] text-fg-muted">
          קרתה שגיאה בטעינת המסך. אפשר לנסות שוב.
        </p>
        {error.digest && (
          <p className="mt-2 text-[11px] text-fg-subtle [direction:ltr]">
            ref: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-[var(--primary-2)]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          נסה שוב
        </button>
      </div>
    </div>
  )
}
