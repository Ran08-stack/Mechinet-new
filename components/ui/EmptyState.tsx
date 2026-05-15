import { ReactNode } from "react"

// מצב ריק — לטבלאות וגרידים ללא תוכן
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-8 py-14 text-center">
      {icon && (
        <span className="grid h-14 w-14 place-items-center rounded-lg border border-line bg-[var(--bg-subtle)] text-fg-muted">
          {icon}
        </span>
      )}
      <div>
        <h3 className="m-0 text-[17px] font-semibold tracking-[-0.01em] text-primary">
          {title}
        </h3>
        {description && (
          <p className="m-0 mt-1 max-w-[44ch] text-[13px] leading-relaxed text-fg-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
