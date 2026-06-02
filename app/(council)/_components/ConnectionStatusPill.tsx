// Pill לסטטוס חיבור של מכינה — מבוסס על last_login_at של admin
// ירוק <7 ימים, כתום 7-30, אדום >30 או null

type Props = { last: string | null | undefined }

export function ConnectionStatusPill({ last }: Props) {
  const now = Date.now()
  const t = last ? new Date(last).getTime() : null
  const days = t ? Math.floor((now - t) / (1000 * 60 * 60 * 24)) : null

  let label = "לא מחובר"
  let bg = "color-mix(in srgb, var(--danger) 12%, transparent)"
  let fg = "var(--danger)"
  let dot = "var(--danger)"
  let border = "color-mix(in srgb, var(--danger) 30%, transparent)"

  if (days !== null) {
    if (days < 7) {
      label = "מחובר"
      bg = "var(--ai-soft)"
      fg = "var(--ai-deep)"
      dot = "var(--ai)"
      border = "var(--ai-line)"
    } else if (days < 30) {
      label = `לפני ${days} ימים`
      bg = "color-mix(in srgb, var(--warning) 14%, transparent)"
      fg = "color-mix(in srgb, var(--warning) 80%, black)"
      dot = "var(--warning)"
      border = "color-mix(in srgb, var(--warning) 35%, transparent)"
    } else {
      label = `${days}+ ימים`
    }
  }

  return (
    <span
      className="inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium"
      style={{ background: bg, color: fg, border: `1px solid ${border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
      {label}
    </span>
  )
}
