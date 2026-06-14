import type { ReactNode } from "react"
import { FileBarChart } from "lucide-react"
import { ReportsControls } from "../../_components/reports/ReportsControls"
import {
  loadReportData, nationalReport, compareReport, stagesReport,
  type ReportKind,
} from "@/lib/reports/aggregate"

// דף הדוחות = דשבורד ויזואלי לחקירה (גרפים + KPI). ה-PDF = הטבלה המלאה להדפסה.

type SearchParams = { from?: string; to?: string; orgs?: string; kind?: string }
type Data = Awaited<ReturnType<typeof loadReportData>>

function parseFilters(sp: SearchParams) {
  const orgs = (sp.orgs ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  const allowedKinds: ReportKind[] = ["national", "compare", "stages"]
  const kind: ReportKind = allowedKinds.includes(sp.kind as ReportKind) ? (sp.kind as ReportKind) : "national"
  return { from: sp.from || null, to: sp.to || null, orgIds: orgs, kind }
}

const PALETTE = ["#243049", "#1f8fd0", "#5a9e2f", "#7c5cd6", "#c98a1b", "#3b82f6", "#0ea5a4", "#9aa3b5"]
const STATUS: Record<string, { label: string; color: string }> = {
  active: { label: "פעילה", color: "var(--success)" },
  suspended: { label: "מושעית", color: "var(--warning)" },
  archived: { label: "בארכיון", color: "var(--fg-faint)" },
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const f = parseFilters(sp)
  const data = await loadReportData({ from: f.from, to: f.to, orgIds: f.orgIds })

  return (
    <div className="px-3 pb-14 pt-5 md:px-7 md:pt-7">
      <div className="mb-5">
        <h1 className="m-0 inline-flex items-center gap-2.5 text-[22px] font-semibold tracking-[-0.01em] text-primary md:text-[28px]">
          <FileBarChart className="h-6 w-6 text-fg-faint" />
          דוחות מועצה
        </h1>
        <p className="mt-1.5 max-w-[65ch] text-[14px] text-fg-muted">
          מבט מהיר על הנתונים. לדוח מלא ומודפס — ייצוא PDF.
        </p>
      </div>

      <ReportsControls
        orgs={data.orgs.map((o) => ({ id: o.id, name: o.name }))}
        currentFrom={f.from ?? ""}
        currentTo={f.to ?? ""}
        currentOrgIds={f.orgIds}
        currentKind={f.kind}
      />

      <div className="mt-6 flex flex-col gap-5">
        {f.kind === "national" && <NationalSection data={data} />}
        {f.kind === "compare" && <CompareSection data={data} />}
        {f.kind === "stages" && <StagesSection data={data} />}
      </div>
    </div>
  )
}

/* ---------- רכיבים משותפים ---------- */

function KpiStrip({ items }: { items: { label: string; value: ReactNode; sub?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
      {items.map((k) => (
        <div key={k.label} className="bg-surface px-5 py-4">
          <div className="text-[11.5px] font-medium text-fg-subtle">{k.label}</div>
          <div className="mt-1 truncate text-[22px] font-bold leading-tight tracking-[-0.01em] text-primary [font-variant-numeric:tabular-nums]">
            {k.value}
          </div>
          {k.sub && <div className="mt-0.5 text-[11.5px] text-fg-muted">{k.sub}</div>}
        </div>
      ))}
    </div>
  )
}

function Card({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      <div className="border-b border-[var(--line-faint)] px-5 py-3.5">
        <h2 className="m-0 text-[14px] font-semibold text-primary">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function StatusPill({ status }: { status: string }) {
  const st = STATUS[status] ?? STATUS.active
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: st.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} />
      {st.label}
    </span>
  )
}

function HBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-muted)]">
      <div className="h-full rounded-full bg-[var(--primary-3)]" style={{ width: `${pct}%` }} />
    </div>
  )
}

function TopBars({ rows }: { rows: { orgName: string; total: number }[] }) {
  const top = rows.slice(0, 10)
  const max = Math.max(1, ...top.map((r) => r.total))
  if (top.every((r) => r.total === 0)) {
    return <p className="m-0 px-5 py-10 text-center text-[13px] text-fg-muted">אין מועמדים בתקופה שנבחרה.</p>
  }
  return (
    <div className="flex flex-col gap-2.5 p-5">
      {top.map((r, i) => (
        <div key={r.orgName} className="flex items-center gap-3 text-[12.5px]">
          <span className="w-4 shrink-0 text-end text-fg-subtle [font-variant-numeric:tabular-nums]">{i + 1}</span>
          <span className="w-28 shrink-0 truncate text-fg md:w-36">{r.orgName}</span>
          <HBar value={r.total} max={max} />
          <span className="w-8 shrink-0 text-end font-semibold text-primary [font-variant-numeric:tabular-nums]">{r.total}</span>
        </div>
      ))}
    </div>
  )
}

function Donut({ data }: { data: { name: string; total: number }[] }) {
  const total = data.reduce((s, d) => s + d.total, 0)
  let acc = 0
  const stops =
    total > 0
      ? data
          .map((d, i) => {
            const start = (acc / total) * 360
            acc += d.total
            const end = (acc / total) * 360
            return `${PALETTE[i % PALETTE.length]} ${start}deg ${end}deg`
          })
          .join(", ")
      : "var(--bg-muted) 0deg 360deg"

  return (
    <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-center">
      <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops})` }}>
        <div className="absolute inset-[20%] grid place-items-center rounded-full bg-surface">
          <div className="text-center">
            <div className="text-[19px] font-bold leading-none text-primary [font-variant-numeric:tabular-nums]">{total}</div>
            <div className="mt-0.5 text-[10px] text-fg-subtle">מועמדים</div>
          </div>
        </div>
      </div>
      <ul className="m-0 flex w-full min-w-0 flex-1 list-none flex-col gap-2 p-0">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-[12.5px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="min-w-0 flex-1 truncate text-fg-muted">{d.name}</span>
            <span className="font-semibold text-primary [font-variant-numeric:tabular-nums]">{d.total}</span>
            <span className="w-9 text-end text-fg-subtle [font-variant-numeric:tabular-nums]">
              {total ? Math.round((d.total / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const TH = "border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start text-[11px] font-semibold uppercase tracking-[0.04em] text-fg-subtle"
const TD = "px-4 py-2.5 text-[13px]"

/* ---------- גיוס ארצי ---------- */

function NationalSection({ data }: { data: Data }) {
  const r = nationalReport(data)
  const leader = r.rows[0]
  const avg = r.rows.length ? Math.round(r.total / r.rows.length) : 0

  return (
    <>
      <KpiStrip
        items={[
          { label: "סך מועמדים", value: r.total.toLocaleString() },
          { label: "מכינות בדוח", value: r.rows.length },
          { label: "מכינה מובילה", value: leader ? leader.orgName : "—", sub: leader ? `${leader.total} מועמדים` : undefined },
          { label: "ממוצע למכינה", value: avg },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card title="מכינות מובילות · טופ 10">
          <TopBars rows={r.rows} />
        </Card>
        <Card title="פילוח לפי תנועה">
          <Donut data={r.byMovement} />
        </Card>
      </div>

      <Card title={`כל המכינות (${r.rows.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>מכינה</th>
                <th className={TH}>תנועה</th>
                <th className={TH}>מועמדים</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((row) => (
                <tr key={row.orgName} className="border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]">
                  <td className={`${TD} font-medium text-fg`}>{row.orgName}</td>
                  <td className={`${TD} text-fg-muted`}>{row.movementName}</td>
                  <td className={`${TD} font-semibold text-primary [font-variant-numeric:tabular-nums]`}>{row.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

/* ---------- השוואת מכינות ---------- */

function CompareSection({ data }: { data: Data }) {
  const r = compareReport(data)
  const totalCandidates = r.rows.reduce((s, x) => s + x.total, 0)
  const avgProgress = r.rows.length ? Math.round(r.rows.reduce((s, x) => s + x.progressPct, 0) / r.rows.length) : 0

  return (
    <>
      <KpiStrip
        items={[
          { label: "סך מועמדים", value: totalCandidates.toLocaleString() },
          { label: "מכינות בהשוואה", value: r.rows.length },
          { label: "ממוצע התקדמות", value: `${avgProgress}%` },
        ]}
      />
      <Card title="השוואת מכינות">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>מכינה</th>
                <th className={TH}>מועמדים</th>
                <th className={`${TH} w-[26%]`}>התקדמות</th>
                <th className={TH}>בנים</th>
                <th className={TH}>בנות</th>
                <th className={TH}>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((row) => (
                <tr key={row.orgName} className="border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]">
                  <td className={`${TD} font-medium text-fg`}>{row.orgName}</td>
                  <td className={`${TD} font-semibold text-primary [font-variant-numeric:tabular-nums]`}>{row.total}</td>
                  <td className={TD}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 text-end text-fg [font-variant-numeric:tabular-nums]">{row.progressPct}%</span>
                      <HBar value={row.progressPct} max={100} />
                    </div>
                  </td>
                  <td className={`${TD} text-fg-muted [font-variant-numeric:tabular-nums]`}>{row.malePct}%</td>
                  <td className={`${TD} text-fg-muted [font-variant-numeric:tabular-nums]`}>{row.femalePct}%</td>
                  <td className={TD}><StatusPill status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

/* ---------- התקדמות שלבים ---------- */

function StagesSection({ data }: { data: Data }) {
  const r = stagesReport(data)
  const stageTotals = r.stageNames.map((s) => r.rows.reduce((sum, row) => sum + (row.counts[s] ?? 0), 0))
  const grand = stageTotals.reduce((a, b) => a + b, 0)

  return (
    <>
      <KpiStrip
        items={[
          { label: "סך מועמדים", value: grand.toLocaleString() },
          { label: "מכינות בדוח", value: r.rows.length },
          { label: "שלבים", value: r.stageNames.length },
        ]}
      />

      <Card title="התפלגות כללית לפי שלב">
        <div className="p-5">
          <div className="flex h-4 overflow-hidden rounded-full bg-[var(--bg-muted)]">
            {grand > 0
              ? r.stageNames.map((s, i) =>
                  stageTotals[i] > 0 ? (
                    <div key={s} style={{ width: `${(stageTotals[i] / grand) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
                  ) : null
                )
              : null}
          </div>
          <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-x-6 gap-y-2 p-0 sm:grid-cols-3">
            {r.stageNames.map((s, i) => (
              <li key={s} className="flex items-center gap-2 text-[12.5px]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
                <span className="min-w-0 flex-1 truncate text-fg-muted">{s}</span>
                <span className="font-semibold text-primary [font-variant-numeric:tabular-nums]">{stageTotals[i]}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card title="מטריצת שלבים · לפי מכינה">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>מכינה</th>
                {r.stageNames.map((s) => <th key={s} className={TH}>{s}</th>)}
                <th className={TH}>סה&quot;כ</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((row) => (
                <tr key={row.orgName} className="border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]">
                  <td className={`${TD} font-medium text-fg`}>{row.orgName}</td>
                  {r.stageNames.map((s) => (
                    <td key={s} className={`${TD} text-fg-muted [font-variant-numeric:tabular-nums]`}>{row.counts[s] ?? 0}</td>
                  ))}
                  <td className={`${TD} font-semibold text-primary [font-variant-numeric:tabular-nums]`}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
