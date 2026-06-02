import { NextRequest } from "next/server"
import { renderToStream } from "@react-pdf/renderer"
import React from "react"
import {
  loadReportData, type ReportKind,
} from "@/lib/reports/aggregate"
import { ReportPDF } from "@/lib/reports/pdf"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const orgIds = (sp.get("orgs") ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  const allowed: ReportKind[] = ["national", "compare", "stages"]
  const kind: ReportKind = allowed.includes(sp.get("kind") as ReportKind) ? (sp.get("kind") as ReportKind) : "national"
  const periodFrom = sp.get("from") || ""
  const periodTo = sp.get("to") || ""

  // ייצוא בדיקה: ?test=1 עוקף ולידציה (זמני, לפיתוח בלבד).
  const isTest = sp.get("test") === "1"
  if (!isTest && (!periodFrom || !periodTo || orgIds.length === 0)) {
    return new Response("חסרים פרמטרים: תקופה (from, to) ולפחות מכינה אחת.", { status: 400 })
  }

  const data = await loadReportData({
    from: sp.get("from") || null,
    to: sp.get("to") || null,
    orgIds,
  })

  try {
    const element = React.createElement(ReportPDF, { data, kind, periodFrom, periodTo })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await renderToStream(element as any)

    // צריך לאסוף את כל ה-stream לפני שמחזירים — אחרת stream errors לא יוצפו אצל הקליינט.
    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      stream.on("data", (c: Buffer) => chunks.push(c))
      stream.on("end", () => resolve())
      stream.on("error", (err) => reject(err))
    })
    const body = Buffer.concat(chunks)

    return new Response(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="council-report-${kind}-${Date.now()}.pdf"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err)
    console.error("[pdf-export]", msg)
    return new Response(`PDF generation failed: ${msg}`, { status: 500 })
  }
}
