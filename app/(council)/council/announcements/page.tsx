import { Megaphone } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AnnouncementCreateButton } from "../../_components/AnnouncementCreateButton"

// הודעות מועצה — רשימת הודעות שנשלחו + יצירת הודעה חדשה.
// RLS (announcements_council_all) מאפשר ל-council_admin לראות את כולן.

const TARGET_LABEL: Record<string, string> = {
  all: "כל המכינות",
  movement: "תנועה",
  selected: "מכינות נבחרות",
}

export default async function AnnouncementsPage() {
  const supabase = await createClient()

  const [{ data: announcements }, { data: movements }, { data: orgs }] = await Promise.all([
    supabase
      .from("announcements")
      .select("id, title, body, target_type, target_movement_id, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("movements").select("id, name").order("name"),
    supabase.from("organizations").select("id, name").order("name"),
  ])

  const movementName: Record<string, string> = {}
  for (const m of movements ?? []) movementName[m.id] = m.name

  const rows = announcements ?? []

  return (
    <div className="px-3 pb-14 pt-5 md:px-7 md:pt-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 inline-flex items-center gap-2.5 text-[22px] font-semibold tracking-[-0.01em] text-primary md:text-[28px]">
            <Megaphone className="h-6 w-6 text-fg-faint" />
            הודעות מועצה
          </h1>
          <p className="mt-1.5 max-w-[65ch] text-[14px] text-fg-muted">
            שליחת הודעה לכל המכינות, לתנועה מסוימת, או למכינות נבחרות. ההודעה מופיעה אצל המכינה בפעמון ההתראות.
          </p>
        </div>
        <AnnouncementCreateButton
          movements={(movements ?? []).map((m) => ({ id: m.id, name: m.name }))}
          orgs={(orgs ?? []).map((o) => ({ id: o.id, name: o.name }))}
        />
      </div>

      <div className="rounded-lg border border-line bg-surface">
        {rows.length === 0 ? (
          <p className="m-0 px-5 py-12 text-center text-[13px] text-fg-muted">
            אין הודעות עדיין. לחץ &quot;הודעה חדשה&quot; כדי לשלוח את הראשונה.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["כותרת", "יעד", "תאריך"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] uppercase text-fg-subtle"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--line-faint)] align-top last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-fg">{a.title}</div>
                      <div className="mt-0.5 max-w-[60ch] truncate text-[12.5px] text-fg-muted">{a.body}</div>
                    </td>
                    <td className="px-4 py-3 text-fg-muted">
                      {a.target_type === "movement"
                        ? movementName[a.target_movement_id ?? ""] ?? "תנועה"
                        : TARGET_LABEL[a.target_type] ?? a.target_type}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-fg-subtle">
                      {new Date(a.created_at).toLocaleDateString("he-IL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
