import { AlertCircle } from "lucide-react"

// מצב שגיאה — נפילת query
export function ErrorState({
  message = "אירעה שגיאה בטעינת הנתונים.",
}: {
  message?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-[var(--stage-rejected-line)] bg-[var(--stage-rejected-bg)] px-8 py-12 text-center">
      <AlertCircle className="h-8 w-8 text-[var(--stage-rejected-fg)]" />
      <p className="m-0 text-[13px] text-[var(--stage-rejected-fg)]">
        {message}
      </p>
    </div>
  )
}
