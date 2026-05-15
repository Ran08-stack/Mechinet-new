import { STAGE_LABELS } from "@/lib/utils"

// תווית שלב — צבע + נקודה + תווית, לפי מערכת העיצוב MechinaFlow.
// משמש בכל המסכים (טבלת מועמדים, פרופיל, פייפליין, לוח בקרה).

const STAGE_CLASSES: Record<string, { bg: string; fg: string; line: string; dot: string }> = {
  new: {
    bg: "var(--stage-new-bg)",
    fg: "var(--stage-new-fg)",
    line: "var(--stage-new-line)",
    dot: "var(--stage-new-dot)",
  },
  review: {
    bg: "var(--stage-review-bg)",
    fg: "var(--stage-review-fg)",
    line: "var(--stage-review-line)",
    dot: "var(--stage-review-dot)",
  },
  interview: {
    bg: "var(--stage-interview-bg)",
    fg: "var(--stage-interview-fg)",
    line: "var(--stage-interview-line)",
    dot: "var(--stage-interview-dot)",
  },
  accepted: {
    bg: "var(--stage-accepted-bg)",
    fg: "var(--stage-accepted-fg)",
    line: "var(--stage-accepted-line)",
    dot: "var(--stage-accepted-dot)",
  },
  rejected: {
    bg: "var(--stage-rejected-bg)",
    fg: "var(--stage-rejected-fg)",
    line: "var(--stage-rejected-line)",
    dot: "var(--stage-rejected-dot)",
  },
}

export function StageBadge({ stage }: { stage: string }) {
  const c = STAGE_CLASSES[stage] ?? STAGE_CLASSES.new
  const label = STAGE_LABELS[stage] ?? stage

  return (
    <span
      className="inline-flex h-[22px] items-center gap-[7px] whitespace-nowrap rounded-full border px-[9px] text-[11.5px] font-medium leading-none"
      style={{ background: c.bg, color: c.fg, borderColor: c.line }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: c.dot }}
      />
      {label}
    </span>
  )
}
