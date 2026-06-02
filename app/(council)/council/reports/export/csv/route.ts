import { NextRequest } from "next/server"
import {
  loadReportData, nationalReport, compareReport, stagesReport,
  type ReportKind,
} from "@/lib/reports/aggregate"

export const dynamic = "force-dynamic"

function csvEscape(v: string | number): string {
  const s = String(v ?? "")
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
function row(cols: (string | number)[]): string {
  return cols.map(csvEscape).join(",")
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const orgIds = (sp.get("orgs") ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  const allowed: ReportKind[] = ["national", "compare", "stages"]
  const kind: ReportKind = allowed.includes(sp.get("kind") as ReportKind) ? (sp.get("kind") as ReportKind) : "national"

  const from = sp.get("from"), to = sp.get("to")
  if (!from || !to || orgIds.length === 0) {
    return new Response("חסרים פרמטרים: תקופה (from, to) ולפחות מכינה אחת.", { status: 400 })
  }

  const data = await loadReportData({
    from: sp.get("from") || null,
    to: sp.get("to") || null,
    orgIds,
  })

  const lines: string[] = []
  lines.push(`# דוח מועצת המכינות · ${new Date().toLocaleDateString("he-IL")}`)
  const periodFrom = sp.get("from") || "—"
  const periodTo = sp.get("to") || "—"
  lines.push(`# תקופה: ${periodFrom} עד ${periodTo}`)
  lines.push("")

  if (kind === "national") {
    const r = nationalReport(data)
    lines.push(row(["מכינה", "תנועה", "מועמדים"]))
    for (const x of r.rows) lines.push(row([x.orgName, x.movementName, x.total]))
    lines.push("")
    lines.push(row(["תנועה", "סה\"כ"]))
    for (const x of r.byMovement) lines.push(row([x.name, x.total]))
  } else if (kind === "compare") {
    const r = compareReport(data)
    lines.push(row(["מכינה", "סה\"כ מועמדים", "ממוצע התקדמות %", "% בנים", "% בנות", "סטטוס"]))
    for (const x of r.rows) lines.push(row([x.orgName, x.total, x.progressPct, x.malePct, x.femalePct, x.status]))
  } else {
    const r = stagesReport(data)
    lines.push(row(["מכינה", ...r.stageNames, "סה\"כ"]))
    for (const x of r.rows) lines.push(row([x.orgName, ...r.stageNames.map((n) => x.counts[n] ?? 0), x.total]))
  }

  const body = "﻿" + lines.join("\n") // BOM לעברית
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="council-report-${kind}-${Date.now()}.csv"`,
    },
  })
}
