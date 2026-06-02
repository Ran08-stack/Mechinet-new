import { createClient } from "@/lib/supabase/server"
import {
  Building2, Users, ChevronUp, MapPin, BarChart3,
} from "lucide-react"
import { CouncilInsight } from "../_components/CouncilInsight"
import { AcademiesOverviewTable, type AcademyRow } from "../_components/AcademiesOverviewTable"
import { BranchMapClient } from "@/components/council/BranchMapClient"
import type { BranchPoint } from "@/components/council/BranchMap"

// קבועים
const ACCEPTED_STAGE_NAMES = ["accepted", "התקבל", "מתקבל", "אושר"]

function isAcceptedStage(stage: string | null | undefined): boolean {
  if (!stage) return false
  return ACCEPTED_STAGE_NAMES.some((n) => stage.includes(n))
}

function currentHebrewSchoolYear(now: Date = new Date()): string {
  const m = now.getMonth()
  const y = now.getFullYear()
  const gregYear = m >= 8 ? y + 1 : y
  const offset = gregYear - 2025
  const labels = ["תשפ\"ה", "תשפ\"ו", "תשפ\"ז", "תשפ\"ח", "תשפ\"ט", "תש\"ץ"]
  if (offset < 0 || offset >= labels.length) return "שנה נוכחית"
  return labels[offset]
}

type Org = {
  id: string
  name: string
  slug: string | null
  created_at: string
  gender_policy?: string | null
  religious_policy?: string | null
  contact_person?: string | null
  contact_phone?: string | null
  city?: string | null
  lat?: number | null
  lng?: number | null
  academy_id?: string | null
}

const BADGE_GRADIENTS = [
  "linear-gradient(135deg, #374765, #1a2b47)",
  "linear-gradient(135deg, #c1583d, #ac3509)",
  "linear-gradient(135deg, #00a58e, #00322a)",
  "linear-gradient(135deg, #7c5cd6, #4b2a8a)",
  "linear-gradient(135deg, #e5a228, #8a5400)",
]

function policyLabel(g?: string | null, r?: string | null) {
  const genderMap: Record<string, string> = { mixed: "מעורבת", boys: "רק בנים", girls: "רק בנות" }
  const religMap: Record<string, string> = { secular: "חילוני", religious: "דתי", mixed: "מעורב" }
  const gl = g ? genderMap[g] ?? g : "—"
  const rl = r ? religMap[r] ?? r : ""
  return rl ? `${gl} · ${rl}` : gl
}

export default async function CouncilDashboardPage() {
  const supabase = await createClient()
  const hebrewYear = currentHebrewSchoolYear()

  const [
    { data: orgs },
    { data: academiesData },
    { data: candidates },
    { data: adminUsers },
  ] = await Promise.all([
    supabase.from("organizations").select("*").order("created_at"),
    supabase.from("academies").select("id, name"),
    supabase.from("candidates").select("organization_id, stage, city"),
    supabase.from("users").select("organization_id, last_login_at, role").eq("role", "admin"),
  ])

  const organizations = (orgs ?? []) as Org[]
  const allCandidates = candidates ?? []
  const totalAcademies = organizations.length
  const totalCandidates = allCandidates.length

  // אחרון התחברות לכל מכינה (max על admin users)
  const lastLoginByOrg: Record<string, string | null> = {}
  for (const u of (adminUsers ?? []) as Array<{ organization_id: string | null; last_login_at: string | null }>) {
    if (!u.organization_id) continue
    const prev = lastLoginByOrg[u.organization_id]
    if (!prev || (u.last_login_at && u.last_login_at > prev)) {
      lastLoginByOrg[u.organization_id] = u.last_login_at
    }
  }

  // ממוצע התקדמות
  const countByOrg: Record<string, number> = {}
  const acceptedByOrg: Record<string, number> = {}
  for (const c of allCandidates) {
    if (!c.organization_id) continue
    countByOrg[c.organization_id] = (countByOrg[c.organization_id] ?? 0) + 1
    if (isAcceptedStage(c.stage)) acceptedByOrg[c.organization_id] = (acceptedByOrg[c.organization_id] ?? 0) + 1
  }

  // שמות מכינות + ספירת שלוחות לכל מכינה (לקביעת multi)
  const academyNameById: Record<string, string> = {}
  for (const a of academiesData ?? []) academyNameById[a.id] = a.name
  const branchesPerAcademy: Record<string, number> = {}
  for (const o of organizations) {
    if (o.academy_id) branchesPerAcademy[o.academy_id] = (branchesPerAcademy[o.academy_id] ?? 0) + 1
  }

  // נקודות מפה = שלוחות בעלות קואורדינטות (lat/lng). לחיצה → דף השלוחה.
  const branchPoints: BranchPoint[] = organizations
    .map((o): BranchPoint | null => {
      if (o.lat == null || o.lng == null) return null
      const academyName = o.academy_id ? academyNameById[o.academy_id] ?? o.name : o.name
      return {
        id: o.id,
        academyName,
        branchName: o.name,
        city: o.city ?? null,
        lat: o.lat,
        lng: o.lng,
        gender:
          o.gender_policy === "boys_only"
            ? "boys"
            : o.gender_policy === "girls_only"
              ? "girls"
              : o.gender_policy === "mixed"
                ? "mixed"
                : null,
        rel: (o.religious_policy as BranchPoint["rel"]) ?? null,
        multi: o.academy_id ? (branchesPerAcademy[o.academy_id] ?? 0) > 1 : false,
        href: `/council/academies/${o.id}`,
        contactPhone: o.contact_phone ?? null,
      }
    })
    .filter((p): p is BranchPoint => p !== null)
  const orgRates = organizations
    .map((o) => (countByOrg[o.id] ? (acceptedByOrg[o.id] ?? 0) / countByOrg[o.id] : null))
    .filter((r): r is number => r !== null)
  const avgProgress = orgRates.length
    ? Math.round((orgRates.reduce((s, r) => s + r, 0) / orgRates.length) * 100)
    : 0

  // breakdown
  const breakdown = {
    boys: 0, girls: 0, mixed: 0, genderUnknown: 0,
    religious: 0, secular: 0, mixedRel: 0, religionUnknown: 0,
  }
  for (const o of organizations) {
    const cnt = countByOrg[o.id] ?? 0
    if (o.gender_policy === "boys_only") breakdown.boys += cnt
    else if (o.gender_policy === "girls_only") breakdown.girls += cnt
    else if (o.gender_policy === "mixed") breakdown.mixed += cnt
    else breakdown.genderUnknown += cnt
    if (o.religious_policy === "religious") breakdown.religious += cnt
    else if (o.religious_policy === "mixed") breakdown.mixedRel += cnt
    else if (o.religious_policy === "secular") breakdown.secular += cnt
    else breakdown.religionUnknown += cnt
  }
  const breakdownTotal = totalCandidates || 1
  const pct = (n: number) => Math.round((n / breakdownTotal) * 100)

  // שורות טבלת ניהול המכינות — מחושב בשרת, סינון/ייצוא בצד הלקוח.
  const rows: AcademyRow[] = organizations.map((org, i) => ({
    id: org.id,
    name: org.name,
    year: new Date(org.created_at).getFullYear(),
    typeLabel: policyLabel(org.gender_policy, org.religious_policy),
    genderPolicy: org.gender_policy ?? null,
    contactPerson: org.contact_person ?? null,
    contactPhone: org.contact_phone ?? null,
    count: countByOrg[org.id] ?? 0,
    lastLogin: lastLoginByOrg[org.id] ?? null,
    lat: org.lat ?? null,
    badge: BADGE_GRADIENTS[i % BADGE_GRADIENTS.length],
  }))

  return (
    <div className="pb-14">
      <div className="flex flex-wrap items-end justify-between gap-4 px-3 md:px-7 pb-2 pt-5 md:pt-7">
        <div>
          <h1 className="m-0 flex flex-wrap items-center gap-3 text-[22px] md:text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
            סקירה ארצית
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary-line)] bg-[var(--primary-soft)] px-2.5 py-[3px] font-mono text-[11.5px] font-medium text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              {hebrewYear}
            </span>
          </h1>
          <p className="mt-2 max-w-[60ch] text-[15px] text-fg-muted">
            סקירה של פעילות {totalAcademies} המכינות הקדם־צבאיות במערכת · מחזור גיוס פעיל
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-3 md:px-7 pt-3">
        {/* KPI row */}
        <section className="grid grid-cols-1 gap-3.5 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="flex flex-col gap-3 rounded-lg border border-line p-[20px_22px]" style={{ background: "linear-gradient(180deg, var(--surface), var(--bg-subtle))" }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-fg-muted">ממוצע התקדמות גיוס</span>
              <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--accent-soft)] text-[var(--accent-hover)]">
                <ChevronUp className="h-[18px] w-[18px]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-[40px] font-bold leading-none tracking-[-0.02em] text-primary [font-variant-numeric:tabular-nums]">{avgProgress}%</div>
            </div>
            <div className="relative mt-1 h-3 overflow-hidden rounded-full bg-[var(--bg-muted)]">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(avgProgress, 100)}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-hover))" }} />
              <div className="absolute -top-1 -bottom-1 w-[2px] bg-primary" style={{ insetInlineStart: "90%" }}>
                <span className="absolute -bottom-[22px] -start-[22px] whitespace-nowrap font-mono text-[10px] text-primary">יעד 90%</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between font-mono text-[12px] text-fg-subtle">
              <span>{orgRates.filter((r) => r >= 0.9).length} מכינות מעל היעד</span>
              {avgProgress > 0 && (
                <span className="text-[var(--warning)]">{orgRates.filter((r) => r < (avgProgress / 100)).length} מתחת לממוצע</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-[20px_22px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-fg-muted">סה&quot;כ מכינות</span>
              <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--primary-soft)] text-primary">
                <Building2 className="h-[18px] w-[18px]" />
              </div>
            </div>
            <div className="text-[40px] font-bold leading-none tracking-[-0.02em] text-primary [font-variant-numeric:tabular-nums]">{totalAcademies}</div>
            <div className="flex items-center justify-between font-mono text-[12px] text-fg-subtle">
              <span>במערכת</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-[20px_22px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-fg-muted">מועמדים רשומים</span>
              <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--ai-soft)] text-[var(--ai-deep)]">
                <Users className="h-[18px] w-[18px]" />
              </div>
            </div>
            <div className="text-[40px] font-bold leading-none tracking-[-0.02em] text-primary [font-variant-numeric:tabular-nums]">{totalCandidates.toLocaleString()}</div>
            <div className="flex items-center justify-between font-mono text-[12px] text-fg-subtle">
              <span>סה&quot;כ ארצי</span>
            </div>
          </div>
        </section>

        {/* Map + chart */}
        <section className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-primary">
                <MapPin className="h-4 w-4 text-fg-faint" />
                פריסה גיאוגרפית · {branchPoints.length} שלוחות על המפה
              </h2>
            </div>
            <div className="relative px-[18px] pb-[22px] pt-[14px]">
              <BranchMapClient points={branchPoints} />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-primary">
                <BarChart3 className="h-4 w-4 text-fg-faint" />
                מועמדים לפי סוג מכינה
              </h2>
            </div>
            <div className="flex flex-col gap-3.5 p-[18px]">
              <div className="font-mono text-[10.5px] uppercase tracking-[var(--tracking-caps)] text-fg-subtle">לפי מגדר</div>
              {[
                { label: "מעורבת · בנים ובנות", val: breakdown.mixed, color: "var(--primary)" },
                { label: "רק בנים", val: breakdown.boys, color: "var(--accent)" },
                { label: "רק בנות", val: breakdown.girls, color: "var(--ai)" },
                { label: "לא הוגדר", val: breakdown.genderUnknown, color: "var(--fg-faint)" },
              ].map((r) => (
                <div key={r.label} className="grid items-center gap-3" style={{ gridTemplateColumns: "100px 1fr 70px" }}>
                  <span className="inline-flex items-center gap-[7px] text-[13px] text-fg-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />{r.label}
                  </span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                    <div className="h-full rounded-full" style={{ width: `${pct(r.val)}%`, background: r.color }} />
                  </div>
                  <span className="text-end font-mono text-[12.5px] font-semibold text-primary [font-variant-numeric:tabular-nums]">{r.val.toLocaleString()}</span>
                </div>
              ))}
              <div className="mt-1 border-t border-[var(--line-faint)] pt-2.5 font-mono text-[10.5px] uppercase tracking-[var(--tracking-caps)] text-fg-subtle">לפי אופי דתי</div>
              {[
                { label: "דתי", val: breakdown.religious, color: "#7c5cd6" },
                { label: "חילוני", val: breakdown.secular, color: "var(--warning)" },
                { label: "מעורב · דתי + חילוני", val: breakdown.mixedRel, color: "var(--ai-deep)" },
                { label: "לא הוגדר", val: breakdown.religionUnknown, color: "var(--fg-faint)" },
              ].map((r) => (
                <div key={r.label} className="grid items-center gap-3" style={{ gridTemplateColumns: "100px 1fr 70px" }}>
                  <span className="inline-flex items-center gap-[7px] text-[13px] text-fg-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />{r.label}
                  </span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                    <div className="h-full rounded-full" style={{ width: `${pct(r.val)}%`, background: r.color }} />
                  </div>
                  <span className="text-end font-mono text-[12.5px] font-semibold text-primary [font-variant-numeric:tabular-nums]">{r.val.toLocaleString()}</span>
                </div>
              ))}
              <div className="mt-1 flex items-center justify-between border-t border-[var(--line-faint)] pt-3 text-[12.5px]">
                <span className="text-fg-muted">סה&quot;כ פעיל</span>
                <span className="font-mono text-[14px] font-semibold text-primary">{totalCandidates.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Academies table */}
        <AcademiesOverviewTable rows={rows} totalAcademies={totalAcademies} />

        {/* AI insight — server component עם cache */}
        <CouncilInsight
          totalCandidates={totalCandidates}
          totalAcademies={totalAcademies}
          avgProgress={avgProgress}
          breakdown={breakdown as unknown as Record<string, number>}
          hebrewYear={hebrewYear}
        />
      </div>
    </div>
  )
}
