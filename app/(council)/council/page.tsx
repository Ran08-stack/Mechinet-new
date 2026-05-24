import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
  Building2, Users, ChevronUp, MapPin, BarChart3, Database,
  Triangle, Mail, DollarSign, Filter, ChevronDown, Download,
  Sparkles, FileText, RefreshCw, Check, Info,
} from "lucide-react"
import { InviteAcademyButton } from "../_components/InviteAcademyButton"

type Org = {
  id: string
  name: string
  slug: string | null
  created_at: string
  gender_policy?: string | null
  religious_policy?: string | null
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

  const [{ data: orgs }, { data: candidates }] = await Promise.all([
    supabase.from("organizations").select("*").order("created_at"),
    supabase.from("candidates").select("organization_id, stage"),
  ])

  const organizations = (orgs ?? []) as Org[]
  const allCandidates = candidates ?? []

  const totalAcademies = organizations.length
  const totalCandidates = allCandidates.length

  // ממוצע התקדמות = ממוצע (accepted/total) per org
  const countByOrg: Record<string, number> = {}
  const acceptedByOrg: Record<string, number> = {}
  for (const c of allCandidates) {
    if (!c.organization_id) continue
    countByOrg[c.organization_id] = (countByOrg[c.organization_id] ?? 0) + 1
    if (c.stage === "accepted" || c.stage === "התקבל") {
      acceptedByOrg[c.organization_id] = (acceptedByOrg[c.organization_id] ?? 0) + 1
    }
  }
  const orgRates = organizations
    .map((o) => (countByOrg[o.id] ? (acceptedByOrg[o.id] ?? 0) / countByOrg[o.id] : null))
    .filter((r): r is number => r !== null)
  const avgProgress = orgRates.length
    ? Math.round((orgRates.reduce((s, r) => s + r, 0) / orgRates.length) * 100)
    : 0

  // breakdown לפי gender + religion (סכום מועמדים per org × policy)
  const breakdown = { boys: 0, girls: 0, mixed: 0, religious: 0, secular: 0, mixedRel: 0 }
  for (const o of organizations) {
    const cnt = countByOrg[o.id] ?? 0
    if (o.gender_policy === "boys") breakdown.boys += cnt
    else if (o.gender_policy === "girls") breakdown.girls += cnt
    else breakdown.mixed += cnt
    if (o.religious_policy === "religious") breakdown.religious += cnt
    else if (o.religious_policy === "mixed") breakdown.mixedRel += cnt
    else breakdown.secular += cnt
  }
  const breakdownTotal = totalCandidates || 1
  const pct = (n: number) => Math.round((n / breakdownTotal) * 100)

  // עלויות תשתית (סטטי per briefing — מועצה משלמת)
  const infraCosts = [
    { name: "Supabase", note: "DB · Storage · Auth", cost: 184, bg: "#3ECF8E22", fg: "#1B5E3F", border: "#3ECF8E66" },
    { name: "Vercel", note: "Pro · Edge functions", cost: 78, bg: "#00000011", fg: "#000", border: "#00000022" },
    { name: "Resend · אימיילים", note: `${totalCandidates.toLocaleString()} שליחות / חודש`, cost: 22, bg: "var(--accent-soft)", fg: "var(--accent-hover)", border: "var(--accent-line)" },
  ]
  const totalInfra = infraCosts.reduce((s, c) => s + c.cost, 0) + 0

  return (
    <div className="pb-14">
      <div className="flex items-end justify-between gap-6 px-7 pb-2 pt-7">
        <div>
          <h1 className="m-0 flex items-center gap-3 text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
            סקירה ארצית
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary-line)] bg-[var(--primary-soft)] px-2.5 py-[3px] font-mono text-[11.5px] font-medium text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              תשפ&quot;ז
            </span>
          </h1>
          <p className="mt-2 max-w-[60ch] text-[15px] text-fg-muted">
            סקירה של פעילות {totalAcademies} המכינות הקדם־צבאיות במערכת · מחזור גיוס פעיל
          </p>
        </div>
        <InviteAcademyButton />
      </div>

      <div className="flex flex-col gap-5 px-7 pt-3">
        {/* KPI row */}
        <section className="grid gap-3.5" style={{ gridTemplateColumns: "1.2fr 1fr 1fr" }}>
          {/* Progress KPI */}
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
              <span className="text-[var(--warning)]">{orgRates.filter((r) => r < (avgProgress / 100)).length} מתחת לממוצע</span>
            </div>
          </div>

          {/* סה"כ מכינות */}
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

          {/* מועמדים רשומים */}
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
        <section className="grid gap-3.5" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
          {/* Map */}
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-primary">
                <MapPin className="h-4 w-4 text-fg-faint" />
                פריסה גיאוגרפית · {totalAcademies} מכינות
              </h2>
              <button className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg">
                <Filter className="h-3 w-3" />
                לפי אזור
              </button>
            </div>
            <div className="relative px-[18px] pb-[22px] pt-[14px]">
              <svg viewBox="0 0 400 280" className="block h-[280px] w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#eef2f7" />
                    <stop offset="1" stopColor="#e1e3e4" />
                  </linearGradient>
                </defs>
                <path d="M 180 12 L 195 8 L 218 18 L 232 38 L 232 62 L 245 78 L 248 100 L 240 122 L 245 145 L 252 168 L 240 190 L 225 215 L 210 240 L 195 268 L 178 268 L 168 248 L 162 218 L 155 188 L 152 162 L 158 138 L 160 112 L 156 88 L 158 64 L 162 42 L 170 22 Z" fill="url(#land)" stroke="#c5c6ce" strokeWidth="1.2" />
                <text x="178" y="76" fontFamily="Rubik" fontSize="9" fill="#75777e" textAnchor="middle">חיפה</text>
                <text x="185" y="155" fontFamily="Rubik" fontSize="9" fill="#75777e" textAnchor="middle">ת״א</text>
                <text x="210" y="158" fontFamily="Rubik" fontSize="9" fill="#75777e" textAnchor="middle">ירושלים</text>
                <text x="200" y="230" fontFamily="Rubik" fontSize="9" fill="#75777e" textAnchor="middle">ב״ש</text>
                {[
                  [175, 48, 10, "#00a58e"], [190, 65, 7, "#fe6f42"], [200, 48, 6, "#00a58e"], [218, 78, 9, "#00a58e"],
                  [182, 135, 14, "#fe6f42"], [195, 115, 9, "#00a58e"], [172, 155, 8, "#00a58e"], [198, 142, 7, "#00a58e"],
                  [215, 148, 11, "#fe6f42"], [208, 170, 6, "#e5a228"], [190, 200, 8, "#00a58e"], [200, 245, 5, "#75777e"], [183, 225, 6, "#e5a228"],
                ].map(([cx, cy, r, color], i) => (
                  <circle key={i} cx={cx as number} cy={cy as number} r={r as number} fill={color as string} fillOpacity="0.2" stroke={color as string} strokeWidth="2" />
                ))}
              </svg>
              <div className="mt-2 flex gap-3.5 px-1 text-[11.5px] text-fg-muted">
                {[
                  { c: "#00a58e", t: "בקצב יעד" }, { c: "#fe6f42", t: "מעל היעד" },
                  { c: "#e5a228", t: "מתחת ליעד" }, { c: "#75777e", t: "בהקמה" },
                ].map((l) => (
                  <span key={l.t} className="inline-flex items-center gap-1.5">
                    <span className="h-[9px] w-[9px] rounded-full" style={{ background: l.c }} />
                    {l.t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-primary">
                <BarChart3 className="h-4 w-4 text-fg-faint" />
                מועמדים לפי סוג מכינה
              </h2>
            </div>
            <div className="flex flex-col gap-3.5 p-[18px]">
              {[
                { label: "מעורבת · בנים ובנות", val: breakdown.mixed, color: "var(--primary)" },
                { label: "רק בנים", val: breakdown.boys, color: "var(--accent)" },
                { label: "רק בנות", val: breakdown.girls, color: "var(--ai)" },
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
              <div className="mt-1 border-t border-[var(--line-faint)] pt-2.5 font-mono text-[10.5px] uppercase tracking-[var(--tracking-caps)] text-fg-subtle">לפי אופי</div>
              {[
                { label: "דתי", val: breakdown.religious, color: "#7c5cd6" },
                { label: "חילוני", val: breakdown.secular, color: "var(--warning)" },
                { label: "מעורב · דתי + חילוני", val: breakdown.mixedRel, color: "var(--ai-deep)" },
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

        {/* Infrastructure costs */}
        <div className="overflow-hidden rounded-lg border border-line" style={{ background: "linear-gradient(180deg, var(--surface) 0%, var(--bg-subtle) 100%)" }}>
          <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
            <h2 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-primary">
              <Database className="h-4 w-4 text-fg-faint" />
              עלויות תשתית · התחזוקה השוטפת של המערכת
            </h2>
            <button className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[11.5px] text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg">
              <ChevronDown className="h-3 w-3" />
              מאי 2026
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3.5 p-[18px_22px]">
            {infraCosts.map((item) => (
              <div key={item.name} className="rounded-md border border-line bg-surface p-3.5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="grid h-6 w-6 place-items-center rounded-sm" style={{ background: item.bg, color: item.fg, border: `1px solid ${item.border}` }}>
                    <DollarSign className="h-3 w-3" />
                  </div>
                  <span className="text-[12.5px] font-medium text-fg-muted">{item.name}</span>
                </div>
                <div className="text-[22px] font-bold tracking-[-0.01em] text-primary [font-variant-numeric:tabular-nums]">
                  ${item.cost}<span className="text-[11px] font-normal text-fg-subtle">/חודש</span>
                </div>
                <div className="mt-1 font-mono text-[10.5px] text-fg-subtle">{item.note}</div>
              </div>
            ))}
            <div className="rounded-md p-3.5 text-on-primary" style={{ background: "var(--primary)" }}>
              <div className="mb-2 flex items-center gap-2">
                <div className="grid h-6 w-6 place-items-center rounded-sm bg-white/[0.12]">
                  <DollarSign className="h-3 w-3" />
                </div>
                <span className="text-[12.5px] font-medium text-white/75">סה&quot;כ חודשי</span>
              </div>
              <div className="text-[22px] font-bold tracking-[-0.01em] [font-variant-numeric:tabular-nums]">${totalInfra}</div>
              <div className="mt-1 font-mono text-[10.5px] text-white/55">≈ ‎₪{Math.round(totalInfra * 3.65).toLocaleString()} · {totalAcademies} מכינות</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5 border-t border-line bg-[var(--bg-subtle)] px-[22px] py-3 font-mono text-[12px] text-fg-subtle">
            <Info className="h-3 w-3" />
            התשתית מנוהלת מרכזית על־ידי המועצה · המכינות אינן משלמות בנפרד.
          </div>
        </div>

        {/* Academies table */}
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <h2 className="m-0 flex-1 text-[15px] font-semibold text-primary">ניהול מכינות</h2>
            <button className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg">
              <ChevronDown className="h-3 w-3" />כל סוגי המכינות
            </button>
            <button className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg">
              <ChevronDown className="h-3 w-3" />כל המיקומים
            </button>
            <button className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg">
              <Filter className="h-3 w-3" />סינון
            </button>
            <button className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg">
              <Download className="h-3 w-3" />ייצוא
            </button>
          </div>
          {organizations.length === 0 ? (
            <div className="px-8 py-12 text-center text-[13px] text-fg-muted">אין מכינות עדיין</div>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["שם המכינה", "סוג", "איש קשר", "מועמדים", "סטטוס חיבור", ""].map((h) => (
                    <th key={h} className="whitespace-nowrap border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] font-medium uppercase tracking-[var(--tracking-caps)] text-fg-subtle">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {organizations.map((org, i) => {
                  const initial = org.name?.[0] ?? "?"
                  const year = new Date(org.created_at).getFullYear()
                  const cnt = countByOrg[org.id] ?? 0
                  return (
                    <tr key={org.id} className="cursor-pointer border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-sm font-mono text-[11px] font-semibold text-white" style={{ background: BADGE_GRADIENTS[i % BADGE_GRADIENTS.length], boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)" }}>{initial}</div>
                          <div>
                            <b className="block text-[13.5px] font-semibold leading-tight text-fg">{org.name}</b>
                            <small className="mt-0.5 block text-[11px] text-fg-subtle">מאז {year}</small>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-fg-muted">{policyLabel(org.gender_policy, org.religious_policy)}</td>
                      <td className="px-4 py-3.5 text-[12.5px] leading-tight text-fg-muted">—</td>
                      <td className="px-4 py-3.5 font-mono text-[14px] font-semibold text-primary [font-variant-numeric:tabular-nums]">{cnt}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full border border-[var(--ai-line)] bg-[var(--ai-soft)] px-2.5 text-[11.5px] font-medium text-[var(--ai-deep)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ai)]" />מחובר
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/council/academies`} className="inline-flex h-7 items-center rounded-sm border border-[var(--line-strong)] bg-surface px-2.5 text-[12px] text-primary hover:bg-[var(--primary-soft)]">ניהול</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {organizations.length > 0 && (
            <div className="flex items-center justify-between border-t border-line bg-[var(--bg-subtle)] px-5 py-3.5">
              <span className="font-mono text-[12px] text-fg-muted">מציג 1–{organizations.length} מתוך {totalAcademies} מכינות</span>
            </div>
          )}
        </div>

        {/* AI insight */}
        <div className="relative mt-2 overflow-hidden rounded-lg border border-[var(--ai-line)] p-[20px_22px]" style={{ background: "linear-gradient(135deg, var(--ai-soft), #d4f5e9)" }}>
          <div className="pointer-events-none absolute -start-12 -top-12 h-[180px] w-[180px]" style={{ background: "radial-gradient(circle, rgba(0,165,142,0.18), transparent 60%)" }} />
          <div className="relative flex items-start gap-3.5">
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[var(--ai)] text-white">
              <Sparkles className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h3 className="m-0 mb-1.5 text-[15px] font-semibold text-[var(--ai-deep)]">תובנה ארצית · רישום תשפ&quot;ז</h3>
              <p className="m-0 mb-2 max-w-[80ch] text-[13px] leading-[1.65] text-[var(--ai-deep)] opacity-85">
                סך {totalCandidates.toLocaleString()} מועמדים רשומים על פני {totalAcademies} מכינות. ממוצע התקדמות הגיוס עומד על {avgProgress}% — היעד הארצי {`90%`}. מומלץ לבחון הקצאת משאבים נוספת למכינות עם נפח רישום גבוה ושיעור התקדמות נמוך.
              </p>
              <div className="mt-2.5 flex gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ai)] bg-[var(--ai)] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[var(--ai-deep)]">
                  <FileText className="h-3 w-3" />דוח מלא לדירקטוריון
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ai)] bg-surface px-3 py-1.5 text-[12.5px] font-medium text-[var(--ai-deep)] hover:bg-[var(--ai)] hover:text-white">
                  <RefreshCw className="h-3 w-3" />רענן ניתוח
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ai)] bg-surface px-3 py-1.5 text-[12.5px] font-medium text-[var(--ai-deep)] hover:bg-[var(--ai)] hover:text-white">
                  <Check className="h-3 w-3" />אשר את התובנה
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
