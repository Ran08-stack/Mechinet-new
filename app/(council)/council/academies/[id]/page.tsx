import { notFound } from "next/navigation"
import Link from "next/link"
import { Building2, ChevronRight, MapPin, Phone, User2, Flag } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AcademyActionsCard } from "../../../_components/AcademyActionsCard"
import { ResendInviteButton } from "../../../_components/ResendInviteButton"
import { ResetPasswordButton } from "../../../_components/ResetPasswordButton"
import { ArchiveAcademyButton } from "../../../_components/ArchiveAcademyButton"

// דף מכינה פרטני לצד המועצה — אגרגציה בלבד, אסור להציג שמות מועמדים.

const GENDER_LABEL: Record<string, string> = {
  mixed: "מעורב",
  male: "זכר",
  female: "נקבה",
  boys: "בנים",
  girls: "בנות",
  boys_only: "רק בנים",
  girls_only: "רק בנות",
}
const RELIGIOUS_LABEL: Record<string, string> = {
  secular: "חילוני",
  religious: "דתי",
  mixed: "מעורב",
}
const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  active: { label: "פעילה", cls: "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]" },
  suspended: { label: "מושעית", cls: "bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]" },
  archived: { label: "בארכיון", cls: "bg-[var(--bg-subtle)] text-fg-muted" },
}

export default async function AcademyDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single()
  if (!org) notFound()

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const nowIso = new Date().toISOString()

  const [
    { data: movements },
    { data: stages },
    { data: candidates },
    { data: stageEvents, count: stageEventsCount },
    { count: upcomingInterviewsCount },
    { data: accounts },
    { data: orgInvites },
  ] = await Promise.all([
    supabase.from("movements").select("id, name").order("name"),
    supabase
      .from("pipeline_stages")
      .select("id, name, order_index, is_default, color")
      .eq("organization_id", id)
      .order("order_index"),
    supabase
      .from("candidates")
      .select("stage, gender")
      .eq("organization_id", id),
    supabase
      .from("candidate_events")
      .select("id", { count: "exact", head: false })
      .eq("organization_id", id)
      .eq("type", "stage_change")
      .gte("created_at", since30d)
      .limit(1),
    supabase
      .from("interviews")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", id)
      .gte("scheduled_at", nowIso),
    supabase
      .from("users")
      .select("id, full_name, email, role, last_login_at")
      .eq("organization_id", id)
      .order("created_at"),
    supabase
      .from("invitations")
      .select("user_id, status")
      .eq("organization_id", id),
  ])

  void stageEvents // נשתמש ב-count בלבד

  // חשבונות השלוחה: לא מציגים את חשבון המועצה. סטטוס "טרם הופעל" = יש הזמנה ממתינה (sent).
  const pendingInviteUsers = new Set(
    (orgInvites ?? []).filter((i) => i.status === "sent").map((i) => i.user_id)
  )
  const orgAccounts = (accounts ?? []).filter((a) => a.role !== "council_admin")
  // ראש השלוחה (כל תפקיד שאינו org_staff) מוצג ראשון, אחריו הצוות.
  const sortedAccounts = [...orgAccounts].sort(
    (a, b) => (a.role === "org_staff" ? 1 : 0) - (b.role === "org_staff" ? 1 : 0)
  )

  const movement = org.movement_id
    ? (movements ?? []).find((m) => m.id === org.movement_id)
    : null

  // KPIs
  const totalCandidates = candidates?.length ?? 0
  const defaultStageNames = new Set(
    (stages ?? []).filter((s) => s.is_default).map((s) => s.name)
  )
  const inProgress = (candidates ?? []).filter(
    (c) => c.stage && !defaultStageNames.has(c.stage)
  ).length
  const progressPct = totalCandidates > 0 ? Math.round((inProgress / totalCandidates) * 100) : 0

  // פילוח שלבים
  const stageCounts: Record<string, number> = {}
  for (const c of candidates ?? []) {
    if (!c.stage) continue
    stageCounts[c.stage] = (stageCounts[c.stage] ?? 0) + 1
  }
  const stageRows = (stages ?? []).map((s) => ({
    name: s.name,
    color: s.color,
    count: stageCounts[s.name] ?? 0,
  }))
  const maxStage = Math.max(1, ...stageRows.map((s) => s.count))

  // יחס מגדר
  const genderCounts: Record<string, number> = {}
  for (const c of candidates ?? []) {
    const g = c.gender ?? "unknown"
    genderCounts[g] = (genderCounts[g] ?? 0) + 1
  }

  const status = STATUS_PILL[org.status] ?? STATUS_PILL.active

  return (
    <div className="pb-16">
      {/* פירורי לחם */}
      <div className="flex items-center gap-1.5 px-7 pt-6 text-[12.5px] text-fg-subtle">
        <Link href="/council/academies" className="hover:text-fg">מכינות</Link>
        <ChevronRight className="h-3.5 w-3.5 -scale-x-100" />
        <span className="text-fg-muted">{org.name}</span>
      </div>

      {/* Hero */}
      <div className="flex items-start justify-between gap-6 px-7 pb-2 pt-3">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-[var(--primary-soft)] text-primary">
            {org.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo_url} alt={org.name} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-6 w-6" />
            )}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="m-0 text-[28px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
                {org.name}
              </h1>
              <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-medium ${status.cls}`}>
                {status.label}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-fg-muted">
              <InfoChip icon={<Flag className="h-3.5 w-3.5" />} text={movement?.name ?? "ללא תנועה"} />
              <InfoChip icon={<MapPin className="h-3.5 w-3.5" />} text={org.city ?? org.region ?? "—"} />
              <InfoChip icon={<User2 className="h-3.5 w-3.5" />} text={org.contact_person ?? "—"} />
              <InfoChip icon={<Phone className="h-3.5 w-3.5" />} text={org.contact_phone ?? "—"} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 px-7 pt-6 lg:grid-cols-3">
        {/* KPIs */}
        <Kpi label="סה״כ מועמדים" value={totalCandidates} />
        <Kpi label="ממוצע התקדמות" value={`${progressPct}%`} hint={`${inProgress} מתוך ${totalCandidates}`} />
        <Kpi
          label="מדיניות המכינה"
          value={GENDER_LABEL[org.gender_policy] ?? org.gender_policy}
          hint={RELIGIOUS_LABEL[org.religious_policy] ?? org.religious_policy}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 px-7 pt-5 lg:grid-cols-3">
        {/* פילוח שלבים */}
        <div className="rounded-lg border border-line bg-surface lg:col-span-2">
          <div className="border-b border-[var(--line-faint)] px-5 py-3">
            <h3 className="m-0 text-[13px] font-semibold text-primary">פילוח שלבי מועמדים</h3>
          </div>
          <div className="flex flex-col gap-2.5 p-5">
            {stageRows.length === 0 && (
              <p className="m-0 text-[13px] text-fg-muted">לא הוגדרו שלבים למכינה.</p>
            )}
            {stageRows.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-[12.5px] text-fg-muted">{s.name}</span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                  <span
                    className="absolute inset-y-0 right-0 rounded-full"
                    style={{
                      width: `${(s.count / maxStage) * 100}%`,
                      background: s.color ?? "var(--accent)",
                    }}
                  />
                </div>
                <span className="w-10 shrink-0 text-end text-[12.5px] font-medium text-fg [font-variant-numeric:tabular-nums]">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* יחס מגדר + היסטוריה */}
        <div className="flex flex-col gap-5">
          <div className="rounded-lg border border-line bg-surface">
            <div className="border-b border-[var(--line-faint)] px-5 py-3">
              <h3 className="m-0 text-[13px] font-semibold text-primary">יחס מגדר במועמדים</h3>
            </div>
            <div className="flex flex-col gap-2 p-5">
              {Object.keys(genderCounts).length === 0 && (
                <p className="m-0 text-[13px] text-fg-muted">אין נתונים.</p>
              )}
              {Object.entries(genderCounts).map(([g, n]) => {
                const pct = totalCandidates ? Math.round((n / totalCandidates) * 100) : 0
                return (
                  <div key={g} className="flex items-center justify-between text-[12.5px]">
                    <span className="text-fg-muted">{GENDER_LABEL[g] ?? (g === "unknown" ? "לא צוין" : g)}</span>
                    <span className="text-fg [font-variant-numeric:tabular-nums]">{n} · {pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface">
            <div className="border-b border-[var(--line-faint)] px-5 py-3">
              <h3 className="m-0 text-[13px] font-semibold text-primary">פעילות אחרונה</h3>
            </div>
            <div className="flex flex-col gap-3 p-5 text-[13px]">
              <Row label="שינויי שלב (30 ימים)" value={stageEventsCount ?? 0} />
              <Row label="ראיונות מתוכננים" value={upcomingInterviewsCount ?? 0} />
            </div>
          </div>

          {/* חשבונות הכניסה של השלוחה — מי שיכול להיכנס ולנהל את המועמדים שלה */}
          <div className="rounded-lg border border-line bg-surface">
            <div className="border-b border-[var(--line-faint)] px-5 py-3">
              <h3 className="m-0 text-[13px] font-semibold text-primary">חשבונות כניסה</h3>
              <p className="m-0 mt-0.5 text-[11.5px] text-fg-muted">
                מי שיכול להיכנס ולנהל את המועמדים של השלוחה
              </p>
            </div>
            <div className="flex flex-col p-2">
              {sortedAccounts.length === 0 ? (
                <p className="m-0 px-3 py-4 text-[13px] text-fg-muted">
                  טרם הוזמן ראש שלוחה.
                </p>
              ) : (
                sortedAccounts.map((a) => {
                  const pending = pendingInviteUsers.has(a.id)
                  const isHead = a.role !== "org_staff"
                  const initial = (a.full_name || a.email || "?").trim().charAt(0).toUpperCase()
                  return (
                    <div key={a.email} className="flex items-start gap-3 rounded-md px-3 py-2.5 hover:bg-[var(--bg-subtle)]">
                      <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold ${isHead ? "bg-[var(--primary-soft)] text-primary" : "bg-[var(--bg-muted)] text-fg-muted"}`}>
                        {initial}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-medium text-fg">
                            {a.full_name || "ללא שם"}
                          </span>
                          <span className={`shrink-0 rounded-full px-1.5 py-px text-[10.5px] font-medium ${isHead ? "bg-[var(--primary-soft)] text-primary" : "bg-[var(--bg-muted)] text-fg-muted"}`}>
                            {isHead ? "ראש השלוחה" : "צוות"}
                          </span>
                        </div>
                        <span className="mt-0.5 block truncate font-mono text-[12px] text-fg-subtle" dir="ltr">
                          {a.email}
                        </span>
                        <div className="mt-1.5 flex items-center gap-2.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] ${pending ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${pending ? "bg-[var(--warning)]" : "bg-[var(--success)]"}`} />
                            {pending ? "הוזמן · טרם הופעל" : "פעיל"}
                          </span>
                          {pending ? (
                            <ResendInviteButton userId={a.id} />
                          ) : (
                            <ResetPasswordButton userId={a.id} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* פעולות */}
      <div className="px-7 pt-5">
        <AcademyActionsCard
          orgId={org.id}
          initial={{
            contact_person: org.contact_person,
            contact_phone: org.contact_phone,
            region: org.region,
            city: org.city,
            status: org.status,
            movement_id: org.movement_id,
            gender_policy: org.gender_policy,
            religious_policy: org.religious_policy,
          }}
          movements={movements ?? []}
          accounts={orgAccounts.map((a) => ({ full_name: a.full_name, email: a.email }))}
        />
      </div>

      <div className="px-7 pt-5">
        <ArchiveAcademyButton orgId={org.id} orgName={org.name} currentStatus={org.status} />
      </div>
    </div>
  )
}

function InfoChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-fg-subtle">{icon}</span>
      <span>{text}</span>
    </span>
  )
}

function Kpi({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-5 py-4">
      <p className="m-0 text-[12px] uppercase tracking-[0.06em] text-fg-subtle">{label}</p>
      <p className="m-0 mt-1.5 text-[22px] font-semibold text-primary [font-variant-numeric:tabular-nums]">{value}</p>
      {hint && <p className="m-0 mt-1 text-[12px] text-fg-muted">{hint}</p>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium text-fg [font-variant-numeric:tabular-nums]">{value}</span>
    </div>
  )
}
