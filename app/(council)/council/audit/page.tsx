import { ScrollText } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AuditTimeline, type AuditEntry } from "../../_components/AuditTimeline"

// יומן פעולות המועצה — הופך את audit_log הגולמי למשפטים קריאים, מקובץ לפי יום.
// כל פעולה = שורה אחת; הפרטים (לפני→אחרי) נפתחים בלחיצה ברכיב הלקוח.

const FIELD_LABEL: Record<string, string> = {
  contact_person: "איש קשר",
  contact_phone: "טלפון",
  region: "אזור",
  city: "מיקום",
  status: "סטטוס",
  movement_id: "תנועה",
  gender_policy: "הרכב מגדרי",
  religious_policy: "אופי דתי",
}
const STATUS_LABEL: Record<string, string> = { active: "פעילה", suspended: "מושעית", archived: "בארכיון" }
const GENDER_LABEL: Record<string, string> = { mixed: "מעורבת", boys_only: "רק בנים", girls_only: "רק בנות" }
const RELIGIOUS_LABEL: Record<string, string> = { religious: "דתי", secular: "חילוני", mixed: "מעורב" }
const TARGET_LABEL: Record<string, string> = { all: "כל המכינות", movement: "תנועה", selected: "מכינות נבחרות" }

type AuditRow = {
  id: string
  action: string
  target_id: string | null
  meta: Record<string, unknown> | null
  created_at: string
  actor: { full_name: string | null; email: string } | null
}

// תאריך לפי שעון ישראל — לקיבוץ עקבי ("היום"/"אתמול"/תאריך) בלי תלות באזור הזמן של השרת.
function ilDate(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" })
}

export default async function AuditPage() {
  const supabase = await createClient()

  const [{ data: logs }, { data: orgs }, { data: movements }] = await Promise.all([
    supabase
      .from("audit_log")
      .select("id, action, target_id, meta, created_at, actor:users(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(300),
    supabase.from("organizations").select("id, name"),
    supabase.from("movements").select("id, name"),
  ])

  const orgName: Record<string, string> = {}
  for (const o of orgs ?? []) orgName[o.id] = o.name
  const movementName: Record<string, string> = {}
  for (const m of movements ?? []) movementName[m.id] = m.name

  const now = new Date()
  const todayStr = ilDate(now)
  const yesterdayStr = ilDate(new Date(now.getTime() - 86400000))
  function dayHeader(iso: string): string {
    const d = new Date(iso)
    const s = ilDate(d)
    if (s === todayStr) return "היום"
    if (s === yesterdayStr) return "אתמול"
    return d.toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem", day: "numeric", month: "long", year: "numeric" })
  }
  function timeOf(iso: string): string {
    return new Date(iso).toLocaleTimeString("he-IL", { timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit" })
  }

  function valLabel(field: string, v: unknown): string {
    if (v === null || v === undefined || v === "") return "—"
    const s = String(v)
    if (field === "status") return STATUS_LABEL[s] ?? s
    if (field === "gender_policy") return GENDER_LABEL[s] ?? s
    if (field === "religious_policy") return RELIGIOUS_LABEL[s] ?? s
    if (field === "movement_id") return movementName[s] ?? s
    return s
  }

  const rows = (logs ?? []) as unknown as AuditRow[]

  const entries: AuditEntry[] = rows.map((row) => {
    const actor = row.actor?.full_name?.trim() || row.actor?.email || "מערכת"
    const meta = row.meta ?? {}
    const base = { id: row.id, actor, dayHeader: dayHeader(row.created_at), time: timeOf(row.created_at) }

    if (row.action === "announcement.create") {
      const title = String(meta.title ?? "")
      const tt = String(meta.target_type ?? "all")
      return { ...base, kind: "announce", verb: `שלח הודעה «${title}»`, summary: TARGET_LABEL[tt] ?? tt, details: [] }
    }

    // org.* — עדכון/סטטוס/תנועה
    const oName = row.target_id ? orgName[row.target_id] ?? "מכינה" : "מכינה"
    const changes = (meta.changes ?? {}) as Record<string, { from?: unknown; to?: unknown }>
    const fields = Object.keys(changes)
    const details = fields.map((f) => ({
      label: FIELD_LABEL[f] ?? f,
      from: valLabel(f, changes[f]?.from),
      to: valLabel(f, changes[f]?.to),
    }))
    let verb = `עדכן את ${oName}`
    let kind: AuditEntry["kind"] = "edit"
    if (row.action === "org.status_change") {
      verb = `שינה סטטוס של ${oName}`
      kind = "status"
    } else if (row.action === "org.movement_change") {
      verb = `שינה תנועה של ${oName}`
      kind = "movement"
    }
    const summary = fields.map((f) => FIELD_LABEL[f] ?? f).join(", ")
    return { ...base, kind, verb, summary, details }
  })

  return (
    <div className="px-3 pb-14 pt-5 md:px-7 md:pt-7">
      <div className="mb-5">
        <h1 className="m-0 inline-flex items-center gap-2.5 text-[22px] font-semibold tracking-[-0.01em] text-primary md:text-[28px]">
          <ScrollText className="h-6 w-6 text-fg-faint" />
          יומן פעולות
        </h1>
        <p className="mt-1.5 max-w-[65ch] text-[14px] text-fg-muted">
          תיעוד כל פעולה שבוצעה במערכת המועצה — מי, מה, ומתי. לחץ על &quot;פרטים&quot; כדי לראות מה בדיוק השתנה.
        </p>
      </div>
      <AuditTimeline entries={entries} />
    </div>
  )
}
