/* eslint-disable jsx-a11y/alt-text */
import React from "react"
import fs from "node:fs"
import path from "node:path"
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"
import type { ReportData } from "./aggregate"
import { nationalReport, compareReport, stagesReport, type ReportKind } from "./aggregate"

const FONT_DIR = path.join(process.cwd(), "lib/reports/fonts")
function fontDataUrl(filename: string): string {
  const buf = fs.readFileSync(path.join(FONT_DIR, filename))
  return `data:font/ttf;base64,${buf.toString("base64")}`
}

let fontsRegistered = false
function ensureFonts() {
  if (fontsRegistered) return
  Font.register({
    family: "Rubik",
    fonts: [
      { src: fontDataUrl("Rubik-Regular.ttf") },
      { src: fontDataUrl("Rubik-Bold.ttf"), fontWeight: 700 },
    ],
  })
  Font.registerHyphenationCallback((word) => [word])
  fontsRegistered = true
}

// פלטה — accent יחיד (orange desaturated), navy רקע, off-black טקסט.
const C = {
  ink: "#0f1419",
  inkSoft: "#3b4456",
  inkMuted: "#6a7488",
  inkSubtle: "#9aa3b5",
  navy: "#1c2b4a",
  accent: "#d96a30",
  bg: "#ffffff",
  bgWash: "#f6f7fa",
  line: "#e6e9ef",
  lineFaint: "#eef0f4",
}

const s = StyleSheet.create({
  page: { padding: 0, fontFamily: "Rubik", fontSize: 10, color: C.ink },

  // Header אסימטרי — שתי עמודות בלי קופסה.
  header: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 44, paddingHorizontal: 44, paddingBottom: 18 },
  headerLeft: { maxWidth: "60%" },
  brand: { fontSize: 8, fontWeight: 700, color: C.accent, letterSpacing: 1.8, textAlign: "right" },
  title: { fontSize: 20, fontWeight: 700, color: C.navy, marginTop: 6, textAlign: "right", lineHeight: 1.1 },
  subtitle: { fontSize: 10, color: C.inkMuted, marginTop: 6, textAlign: "right" },
  metaCol: { alignItems: "flex-start", justifyContent: "flex-end" },
  metaItem: { flexDirection: "row-reverse", gap: 4, alignItems: "baseline" },
  metaLabel: { fontSize: 7.5, color: C.inkSubtle, letterSpacing: 0.6 },
  metaValue: { fontSize: 9.5, color: C.ink, fontWeight: 700 },
  accentRule: { height: 2, backgroundColor: C.accent, width: 56, marginHorizontal: 44, marginBottom: 24 },

  // KPI strip — בלי קופסאות, סדרת מספרים עם מפריד דק.
  kpiStrip: { flexDirection: "row-reverse", borderTop: `0.6px solid ${C.line}`, borderBottom: `0.6px solid ${C.line}`, marginHorizontal: 44, marginBottom: 26 },
  kpiCell: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, borderLeft: `0.6px solid ${C.lineFaint}` },
  kpiCellLast: { flex: 1, paddingVertical: 14, paddingHorizontal: 10 },
  kpiLabel: { fontSize: 7.5, color: C.inkSubtle, letterSpacing: 0.8, textAlign: "right", textTransform: "uppercase" },
  kpiValue: { fontSize: 22, fontWeight: 700, color: C.navy, marginTop: 4, textAlign: "right" },

  body: { paddingHorizontal: 44, paddingBottom: 80 },

  sectionLabel: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginTop: 18, marginBottom: 10 },
  sectionDot: { width: 4, height: 4, backgroundColor: C.accent, borderRadius: 2 },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: C.navy, letterSpacing: 0.4, textAlign: "right" },

  // טבלאות — קווי מפריד דקים, בלי תיבה חיצונית.
  tableHead: { flexDirection: "row-reverse", borderBottom: `1px solid ${C.navy}`, paddingBottom: 6 },
  cellHead: { flex: 1, fontSize: 7.5, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.6, textAlign: "right", textTransform: "uppercase", paddingHorizontal: 4 },
  rowEven: { flexDirection: "row-reverse", borderBottom: `0.5px solid ${C.lineFaint}` },
  rowOdd: { flexDirection: "row-reverse", borderBottom: `0.5px solid ${C.lineFaint}`, backgroundColor: C.bgWash },
  cell: { flex: 1, fontSize: 9.5, color: C.ink, textAlign: "right", paddingVertical: 8, paddingHorizontal: 4 },
  cellEmphasis: { flex: 1, fontSize: 9.5, color: C.navy, fontWeight: 700, textAlign: "right", paddingVertical: 8, paddingHorizontal: 4 },

  small: { fontSize: 7.5, color: C.inkSubtle, marginTop: 18, textAlign: "right" },

  // Footer — דק, מאוזן, ללא דגש.
  footer: { position: "absolute", bottom: 22, left: 44, right: 44, flexDirection: "row-reverse", justifyContent: "space-between", borderTop: `0.4px solid ${C.line}`, paddingTop: 8 },
  footerText: { fontSize: 7.5, color: C.inkSubtle, letterSpacing: 0.3 },
})

function Table({
  head, rows, emphasizeFirst = true,
}: {
  head: string[]
  rows: (string | number)[][]
  emphasizeFirst?: boolean
}) {
  return (
    <View>
      <View style={s.tableHead}>
        {head.map((h, i) => <Text key={i} style={s.cellHead}>{h}</Text>)}
      </View>
      {rows.map((r, ri) => (
        <View key={ri} style={ri % 2 === 1 ? s.rowOdd : s.rowEven}>
          {r.map((c, ci) => (
            <Text key={ci} style={emphasizeFirst && ci === r.length - 1 ? s.cellEmphasis : s.cell}>
              {String(c)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <View style={s.sectionLabel}>
        <View style={s.sectionDot} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </>
  )
}

export function ReportPDF({
  data, kind, periodFrom, periodTo,
}: {
  data: ReportData
  kind: ReportKind
  periodFrom: string
  periodTo: string
}) {
  ensureFonts()
  const today = new Date().toLocaleDateString("he-IL")
  const subtitleMap = {
    national: "סקירת גיוס לפי מכינה ותנועה",
    compare: "מבט השוואתי בין מכינות נבחרות",
    stages: "התפלגות מועמדים לפי שלבי קבלה",
  } as const
  const titleMap = {
    national: "דוח גיוס ארצי",
    compare: "השוואת מכינות",
    stages: "התקדמות שלבים",
  } as const
  const title = titleMap[kind]
  const subtitle = subtitleMap[kind]

  const totalCandidates = data.candidates.length
  const totalOrgs = new Set(data.candidates.map((c) => c.organization_id)).size || data.orgs.length
  const totalMovements = new Set(data.orgs.map((o) => o.movement_id).filter(Boolean)).size

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header אסימטרי — בלי hero בלוק */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.brand}>MECHINET · COUNCIL</Text>
            <Text style={s.title}>{title}</Text>
            <Text style={s.subtitle}>{subtitle}</Text>
          </View>
          <View style={s.metaCol}>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>הופק</Text>
              <Text style={s.metaValue}>{today}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>תקופה</Text>
              <Text style={s.metaValue}>{periodFrom || "—"} עד {periodTo || "—"}</Text>
            </View>
          </View>
        </View>
        <View style={s.accentRule} />

        {/* KPI strip — קווים בלבד, בלי קופסאות */}
        <View style={s.kpiStrip}>
          <View style={s.kpiCell}>
            <Text style={s.kpiLabel}>מועמדים</Text>
            <Text style={s.kpiValue}>{totalCandidates.toLocaleString()}</Text>
          </View>
          <View style={s.kpiCell}>
            <Text style={s.kpiLabel}>מכינות</Text>
            <Text style={s.kpiValue}>{totalOrgs}</Text>
          </View>
          <View style={s.kpiCellLast}>
            <Text style={s.kpiLabel}>תנועות</Text>
            <Text style={s.kpiValue}>{totalMovements || "—"}</Text>
          </View>
        </View>

        <View style={s.body}>
          {kind === "national" && (() => {
            const r = nationalReport(data)
            return (
              <>
                <Section title="פירוט לפי מכינה">
                  <Table
                    head={["מועמדים", "תנועה", "מכינה"]}
                    rows={r.rows.map((x) => [x.total, x.movementName, x.orgName])}
                  />
                </Section>
                <Section title="פילוח לפי תנועה">
                  <Table
                    head={["סה״כ", "תנועה"]}
                    rows={r.byMovement.map((x) => [x.total, x.name])}
                  />
                </Section>
              </>
            )
          })()}

          {kind === "compare" && (() => {
            const r = compareReport(data)
            return (
              <Section title="טבלת השוואה">
                <Table
                  head={["סטטוס", "% בנות", "% בנים", "התקדמות", "סה״כ", "מכינה"]}
                  rows={r.rows.map((x) => [x.status, `${x.femalePct}%`, `${x.malePct}%`, `${x.progressPct}%`, x.total, x.orgName])}
                />
              </Section>
            )
          })()}

          {kind === "stages" && (() => {
            const r = stagesReport(data)
            const head = ["סה״כ", ...r.stageNames.slice().reverse(), "מכינה"]
            const rows = r.rows.map((x) => [
              x.total,
              ...r.stageNames.slice().reverse().map((n) => x.counts[n] ?? 0),
              x.orgName,
            ])
            return (
              <Section title="מטריצת שלבים">
                <Table head={head} rows={rows} />
              </Section>
            )
          })()}

          <Text style={s.small}>הדוח אגרגטיבי בלבד · אין נתונים פרטניים של מועמדים.</Text>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>MECHINET · COUNCIL</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          <Text style={s.footerText}>mechinet-new.vercel.app</Text>
        </View>
      </Page>
    </Document>
  )
}
