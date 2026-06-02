import { FileBarChart } from "lucide-react"
import { ReportsControls } from "../../_components/reports/ReportsControls"
import { NationalCharts, StagesChart } from "../../_components/reports/ReportCharts"
import {
  loadReportData, nationalReport, compareReport, stagesReport,
  type ReportKind,
} from "@/lib/reports/aggregate"

type SearchParams = { from?: string; to?: string; orgs?: string; kind?: string }

function parseFilters(sp: SearchParams) {
  const orgs = (sp.orgs ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  const allowedKinds: ReportKind[] = ["national", "compare", "stages"]
  const kind: ReportKind = allowedKinds.includes(sp.kind as ReportKind) ? (sp.kind as ReportKind) : "national"
  return {
    from: sp.from || null,
    to: sp.to || null,
    orgIds: orgs,
    kind,
  }
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
          דוחות אגרגטיביים. אין כאן נתונים פרטניים על מועמדים — רק סכומים והשוואות.
        </p>
      </div>

      <ReportsControls
        orgs={data.orgs.map((o) => ({ id: o.id, name: o.name }))}
        currentFrom={f.from ?? ""}
        currentTo={f.to ?? ""}
        currentOrgIds={f.orgIds}
        currentKind={f.kind}
      />

      <div className="mt-5 space-y-4">
        {f.kind === "national" && <NationalSection data={data} />}
        {f.kind === "compare" && <CompareSection data={data} />}
        {f.kind === "stages" && <StagesSection data={data} />}
      </div>
    </div>
  )
}

function NationalSection({ data }: { data: Awaited<ReturnType<typeof loadReportData>> }) {
  const r = nationalReport(data)
  return (
    <>
      <div className="rounded-lg border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="m-0 text-[15px] font-semibold text-primary">גיוס ארצי · סה&quot;כ {r.total.toLocaleString()} מועמדים</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["מכינה", "תנועה", "מועמדים"].map((h) => (
                  <th key={h} className="border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] uppercase text-fg-subtle">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.rows.map((row) => (
                <tr key={row.orgName} className="border-b border-[var(--line-faint)] last:border-b-0">
                  <td className="px-4 py-2.5 font-medium text-fg">{row.orgName}</td>
                  <td className="px-4 py-2.5 text-fg-muted">{row.movementName}</td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-primary [font-variant-numeric:tabular-nums]">{row.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <NationalCharts rows={r.rows} byMovement={r.byMovement} />
    </>
  )
}

function CompareSection({ data }: { data: Awaited<ReturnType<typeof loadReportData>> }) {
  const r = compareReport(data)
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h2 className="m-0 mb-3 text-[15px] font-semibold text-primary">השוואת מכינות</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["מכינה", "סה\"כ מועמדים", "ממוצע התקדמות", "בנים", "בנות", "סטטוס"].map((h) => (
                <th key={h} className="border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] uppercase text-fg-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.rows.map((row) => (
              <tr key={row.orgName} className="border-b border-[var(--line-faint)] last:border-b-0">
                <td className="px-4 py-2.5 font-medium text-fg">{row.orgName}</td>
                <td className="px-4 py-2.5 font-mono font-semibold text-primary">{row.total}</td>
                <td className="px-4 py-2.5 font-mono text-fg">{row.progressPct}%</td>
                <td className="px-4 py-2.5 font-mono text-fg-muted">{row.malePct}%</td>
                <td className="px-4 py-2.5 font-mono text-fg-muted">{row.femalePct}%</td>
                <td className="px-4 py-2.5 text-fg-muted">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StagesSection({ data }: { data: Awaited<ReturnType<typeof loadReportData>> }) {
  const r = stagesReport(data)
  return (
    <>
      <div className="rounded-lg border border-line bg-surface p-4">
        <h2 className="m-0 mb-3 text-[15px] font-semibold text-primary">התקדמות שלבים · matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] uppercase text-fg-subtle">מכינה</th>
                {r.stageNames.map((s) => (
                  <th key={s} className="border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] uppercase text-fg-subtle">{s}</th>
                ))}
                <th className="border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] uppercase text-fg-subtle">סה&quot;כ</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((row) => (
                <tr key={row.orgName} className="border-b border-[var(--line-faint)] last:border-b-0">
                  <td className="px-4 py-2.5 font-medium text-fg">{row.orgName}</td>
                  {r.stageNames.map((s) => (
                    <td key={s} className="px-4 py-2.5 font-mono text-fg-muted">{row.counts[s] ?? 0}</td>
                  ))}
                  <td className="px-4 py-2.5 font-mono font-semibold text-primary">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <StagesChart stageNames={r.stageNames} rows={r.rows} />
    </>
  )
}
