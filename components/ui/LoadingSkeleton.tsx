// שלד טעינה — בזמן fetch
export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-md bg-[var(--bg-muted)]"
        />
      ))}
    </div>
  )
}
