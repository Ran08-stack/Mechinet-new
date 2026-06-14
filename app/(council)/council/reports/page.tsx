import type { ReactNode } from "react"
import { FileBarChart } from "lucide-react"
import { ReportsControls } from "../../_components/reports/ReportsControls"
import {
  loadReportData, nationalReport, compareReport, stagesReport,
  type ReportKind,
} from "@/lib/reports/aggregate"

type SearchParams = { from?: string; to?: string; orgs?: string; kind?: string }
type Data = Awaited<ReturnType<typeof loadReportData>>

function parseFilters(sp: SearchParams) {
  const orgs = (sp.orgs ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  const allowedKinds: ReportKind[] = ["national", "compare", "stages"]
  const kind: ReportKind = allowedKinds.includes(sp.kind as ReportKind) ? (sp.kind as ReportKind) : "national"
  return { from: sp.from || null, to: sp.to || null, orgIds: orgs, kind }
}

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
          דוחות אגרגטיביים — סכומים והשוואות בלבד, ללא נתונים פרטניים על מועמדים.
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
          <div className="mt-1 truncate text-[21px] font-bold leading-tight tracking-[-0.01em] text-primary [font-variant-numeric:tabular-nums]">
            {k.value}
          </div>
          {k.sub && <div className="mt-0.5 text-[11.5px] text-fg-muted">{k.sub}</div>}
        </div>
      ))}
    </div>
  )
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-2 min-w-[60px] flex-1 overflow-hidden rounded-full bg-[var(--bg-muted)]">
      <div className="h-full rounded-full bg-[var(--primary-3)]" style={{ width: `${pct}%` }} />
    </div>
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

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line-faint)] px-5 py-3.5">
        <h2 className="m-0 text-[14px] font-semibold text-primary">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

const TH = "border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start text-[11px] font-semibold uppercase tracking-[0.04em] text-fg-subtle"
const TD = "px-4 py-2.5 text-[13px]"

/* ---------- גיוס ארצי ---------- */

function NationalSection({ data }: { data: Data }) {
  const r = nationalReport(data)
  const maxTotal = Math.max(1, ...r.rows.map((x) => x.total))
  const maxMove = Math.max(1, ...r.byMovement.map((m) => m.total))
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

      <Card title="פירוט לפי מכינה">
        {r.rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={TH}>מכינה</th>
                  <th className={TH}>תנועה</th>
                  <th className={`${TH} w-[42%]`}>מועמדים</th>
                </tr>
              </thead>
              <tbody>
                {r.rows.map((row, i) => (
                  <tr key={row.orgName} className="border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]">
                    <td className={`${TD} font-medium text-fg`}>
                      <span className="me-2.5 inline-grid h-5 w-5 place-items-center rounded-md bg-[var(--primary-soft)] text-[11px] font-semibold text-primary [font-variant-numeric:tabular-nums]">
                        {i + 1}
                      </span>
                      {row.orgName}
                    </td>
                    <td className={`${TD} text-fg-muted`}>{row.movementName}</td>
                    <td className={TD}>
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-end font-semibold text-primary [font-variant-numeric:tabular-nums]">{row.total}</span>
                        <Bar value={row.total} max={maxTotal} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {r.byMovement.length > 0 && (
        <Card title="פילוח לפי תנועה">
          <div className="flex flex-col gap-3 p-5">
            {r.byMovement.map((m) => (
              <div key={m.name} className="flex items-center gap-3 text-[13px]">
                <span className="w-36 shrink-0 truncate text-fg">{m.name}</span>
                <Bar value={m.total} max={maxMove} />
                <span className="w-10 shrink-0 text-end font-semibold text-primary [font-variant-numeric:tabular-nums]">{m.total}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
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
        {r.rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["מכינה", "מועמדים", "התקדמות", "בנים", "בנות", "סטטוס"].map((h) => (
                    <th key={h} className={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.rows.map((row) => (
                  <tr key={row.orgName} className="border-b border-[var(--line-faint)] last:border-b-0 hover:bg-[var(--bg-subtle)]">
                    <td className={`${TD} font-medium text-fg`}>{row.orgName}</td>
                    <td className={`${TD} font-semibold text-primary [font-variant-numeric:tabular-nums]`}>{row.total}</td>
                    <td className={`${TD} text-fg [font-variant-numeric:tabular-nums]`}>{row.progressPct}%</td>
                    <td className={`${TD} text-fg-muted [font-variant-numeric:tabular-nums]`}>{row.malePct}%</td>
                    <td className={`${TD} text-fg-muted [font-variant-numeric:tabular-nums]`}>{row.femalePct}%</td>
                    <td className={TD}><StatusPill status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

/* ---------- התקדמות שלבים ---------- */

function StagesSection({ data }: { data: Data }) {
  const r = stagesReport(data)
  const grandTotal = r.rows.reduce((s, x) => s + x.total, 0)

  return (
    <>
      <KpiStrip
        items={[
          { label: "סך מועמדים", value: grandTotal.toLocaleString() },
          { label: "מכינות בדוח", value: r.rows.length },
          { label: "שלבים", value: r.stageNames.length },
        ]}
      />
      <Card title="מטריצת שלבים">
        {r.rows.length === 0 ? (
          <Empty />
        ) : (
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
        )}
      </Card>
    </>
  )
}

function Empty() {
  return (
    <p className="m-0 px-5 py-12 text-center text-[13px] text-fg-muted">
      אין נתונים לתקופה ולמכינות שנבחרו.
    </p>
  )
}
