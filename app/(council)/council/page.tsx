import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Building2, Users, TrendingUp, Server } from "lucide-react"
import { InviteAcademyButton } from "../_components/InviteAcademyButton"

export default async function CouncilDashboardPage() {
  const supabase = await createClient()

  // נתונים אגרגטיביים — RLS מאפשר ל-council_admin לקרוא הכל
  const [{ data: orgs }, { data: candidates }] = await Promise.all([
    supabase.from("organizations").select("*").order("created_at"),
    supabase.from("candidates").select("organization_id, stage"),
  ])

  const organizations = orgs ?? []
  const allCandidates = candidates ?? []

  const totalAcademies = organizations.length
  const totalCandidates = allCandidates.length
  const accepted = allCandidates.filter((c) => c.stage === "accepted").length
  const acceptanceRate =
    totalCandidates > 0
      ? Math.round((accepted / totalCandidates) * 100)
      : 0

  // ספירת מועמדים לכל מכינה
  const countByOrg: Record<string, number> = {}
  for (const c of allCandidates) {
    if (c.organization_id)
      countByOrg[c.organization_id] =
        (countByOrg[c.organization_id] ?? 0) + 1
  }

  // פאנל עלויות תשתית — נתונים קשיחים (לפי ה-briefing)
  const infraCosts = [
    { name: "Supabase", cost: 25 },
    { name: "Vercel", cost: 20 },
    { name: "OpenAI API", cost: 15 },
    { name: "שירות אימייל", cost: 10 },
  ]
  const totalInfra = infraCosts.reduce((s, c) => s + c.cost, 0)

  const kpis = [
    {
      label: "מכינות פעילות",
      value: totalAcademies,
      icon: Building2,
      bg: "var(--primary-soft)",
      fg: "var(--primary)",
    },
    {
      label: "סך מועמדים בארץ",
      value: totalCandidates,
      icon: Users,
      bg: "var(--accent-soft)",
      fg: "var(--accent-hover)",
    },
    {
      label: "אחוז קבלה ממוצע",
      value: `${acceptanceRate}%`,
      icon: TrendingUp,
      bg: "var(--ai-soft)",
      fg: "var(--ai-deep)",
    },
    {
      label: "עלות תשתית חודשית",
      value: `$${totalInfra}`,
      icon: Server,
      bg: "var(--primary-soft)",
      fg: "var(--primary)",
    },
  ]

  return (
    <div className="pb-14">
      <div className="flex items-end justify-between gap-6 px-7 pb-2 pt-7">
        <div>
          <h1 className="m-0 text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
            סקירה ארצית
          </h1>
          <p className="mt-2 text-[15px] text-fg-muted">
            סקירה של פעילות {totalAcademies} המכינות הקדם־צבאיות במערכת.
          </p>
        </div>
        <InviteAcademyButton />
      </div>

      <div className="flex flex-col gap-[22px] px-7 pt-4">
        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-5"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-fg-muted">
                    {kpi.label}
                  </span>
                  <span
                    className="grid h-8 w-8 place-items-center rounded-md"
                    style={{ background: kpi.bg, color: kpi.fg }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="text-[32px] font-bold leading-[1.1] tracking-[-0.015em] text-primary [font-variant-numeric:tabular-nums]">
                  {kpi.value}
                </div>
              </div>
            )
          })}
        </section>

        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.4fr_1fr]">
          {/* רשימת מכינות */}
          <section className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                מכינות במערכת
              </h2>
            </div>
            {organizations.length === 0 ? (
              <div className="px-8 py-12 text-center text-[13px] text-fg-muted">
                אין מכינות עדיין
              </div>
            ) : (
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {["מכינה", "מועמדים", ""].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-fg-subtle"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr
                      key={org.id}
                      className="border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-fg">
                          {org.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-fg-muted [font-variant-numeric:tabular-nums]">
                        {countByOrg[org.id] ?? 0}
                      </td>
                      <td className="px-4 py-3.5"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* פאנל עלויות תשתית */}
          <section className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 text-[15px] font-semibold text-primary">
                עלויות תשתית
              </h2>
              <p className="mt-0.5 text-[12px] text-fg-subtle">
                עלות חודשית מרכזית — המועצה משלמת.
              </p>
            </div>
            <div className="flex flex-col">
              {infraCosts.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-3 text-[13px]"
                >
                  <span className="text-fg">{item.name}</span>
                  <span className="font-mono text-fg-muted [font-variant-numeric:tabular-nums]">
                    ${item.cost}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-3 text-[13px]">
                <span className="font-semibold text-primary">סה"כ</span>
                <span className="font-mono font-semibold text-primary [font-variant-numeric:tabular-nums]">
                  ${totalInfra}/חודש
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
