/* eslint-disable jsx-a11y/alt-text */
import React from "react"
import fs from "node:fs"
import path from "node:path"
import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer"
import type { ReportData } from "./aggregate"
import { nationalReport, compareReport, stagesReport, type ReportKind } from "./aggregate"

const ASSET_DIR = path.join(process.cwd(), "lib/reports")
const FONT_DIR = path.join(ASSET_DIR, "fonts")

function fontDataUrl(filename: string): string {
  const buf = fs.readFileSync(path.join(FONT_DIR, filename))
  return `data:font/ttf;base64,${buf.toString("base64")}`
}

let logoCache: string | null = null
function logoDataUrl(): string {
  if (logoCache) return logoCache
  const buf = fs.readFileSync(path.join(ASSET_DIR, "council-logo.png"))
  logoCache = `data:image/png;base64,${buf.toString("base64")}`
  return logoCache
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

// פלטה — accent כחול (מהלוגו), navy ראשי, off-black טקסט.
const C = {
  ink: "#222e3c",
  inkSoft: "#56657a",
  inkMuted: "#6a7488",
  inkSubtle: "#9aa3b5",
  navy: "#243049",
  blue: "#1f8fd0",
  blueSoft: "#eaf4fb",
  blueInk: "#15598a",
  green: "#5a9e2f",
  amber: "#c98a1b",
  gray: "#9aa3b5",
  bgWash: "#f8fafc",
  track: "#eef2f7",
  line: "#e6eaf0",
  lineFaint: "#eef1f6",
}

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 42,
    fontFamily: "Rubik",
    fontSize: 10,
    color: C.ink,
  },

  // Header — כותרת + תקופה מימין, לוגו משמאל.
  header: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 21, fontWeight: 700, color: C.navy, letterSpacing: -0.3, textAlign: "right" },
  periodRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6, marginTop: 8 },
  periodLabel: { fontSize: 9.5, color: C.inkMuted },
  periodVal: { fontSize: 10, color: C.ink, fontWeight: 700 },
  periodArrow: { fontSize: 10, color: C.blue, fontWeight: 700 },
  logo: { width: 108, height: 76 },

  // KPI — כרטיס עם 4 תאים מופרדים בקו דק.
  kpiCard: {
    flexDirection: "row-reverse",
    marginTop: 22,
    border: `1px solid ${C.line}`,
    borderRadius: 10,
  },
  kpiCell: { flex: 1, paddingVertical: 13, paddingHorizontal: 16, borderRight: `1px solid ${C.lineFaint}` },
  kpiCellFirst: { flex: 1, paddingVertical: 13, paddingHorizontal: 16 },
  kpiLabel: { fontSize: 8, color: C.inkSubtle, letterSpacing: 0.4, textAlign: "right" },
  kpiValue: { fontSize: 21, fontWeight: 700, color: C.navy, marginTop: 4, textAlign: "right", letterSpacing: -0.4 },
  kpiSub: { fontSize: 10, color: C.inkMuted, fontWeight: 400 },
  kpiLeaderName: { fontSize: 13, fontWeight: 700, color: C.navy, marginTop: 5, textAlign: "right", lineHeight: 1.15 },
  kpiLeaderSub: { fontSize: 9, color: C.inkMuted, marginTop: 2, textAlign: "right" },

  // Section
  sectionLabel: { flexDirection: "row-reverse", alignItems: "center", gap: 7, marginTop: 22, marginBottom: 9 },
  sectionDot: { width: 4, height: 4, backgroundColor: C.blue, borderRadius: 2 },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: C.navy, textAlign: "right" },

  // National table
  tHead: { flexDirection: "row-reverse", borderBottom: `1px solid ${C.line}`, paddingBottom: 7, paddingHorizontal: 4 },
  tHeadCell: { fontSize: 8, fontWeight: 700, color: C.inkSubtle, letterSpacing: 0.4, textAlign: "right" },
  tRow: { flexDirection: "row-reverse", alignItems: "center", borderBottom: `0.5px solid ${C.lineFaint}`, paddingVertical: 7, paddingHorizontal: 4 },
  orgWrap: { flexDirection: "row-reverse", alignItems: "center", gap: 7 },
  rankBadge: { width: 16, height: 16, borderRadius: 4, backgroundColor: C.blueSoft, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 8, fontWeight: 700, color: C.blueInk },
  orgName: { fontSize: 9.5, fontWeight: 700, color: C.ink, textAlign: "right" },
  mvText: { fontSize: 9, color: C.inkMuted, textAlign: "right" },
  barWrap: { flexDirection: "row-reverse", alignItems: "center", gap: 7 },
  barNum: { width: 26, fontSize: 10, fontWeight: 700, color: C.navy, textAlign: "right" },
  barTrack: { flex: 1, height: 6, backgroundColor: C.track, borderRadius: 3 },
  barFill: { height: 6, backgroundColor: C.blue, borderRadius: 3 },
  statusWrap: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 8.5, fontWeight: 700, textAlign: "right" },

  // Generic table (compare / stages)
  gHead: { flexDirection: "row-reverse", borderBottom: `1px solid ${C.navy}`, paddingBottom: 6 },
  gHeadCell: { flex: 1, fontSize: 8, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.4, textAlign: "right", paddingHorizontal: 4 },
  gRowEven: { flexDirection: "row-reverse", borderBottom: `0.5px solid ${C.lineFaint}` },
  gRowOdd: { flexDirection: "row-reverse", borderBottom: `0.5px solid ${C.lineFaint}`, backgroundColor: C.bgWash },
  gCell: { flex: 1, fontSize: 9, color: C.ink, textAlign: "right", paddingVertical: 7, paddingHorizontal: 4 },
  gCellEmph: { flex: 1, fontSize: 9, color: C.navy, fontWeight: 700, textAlign: "right", paddingVertical: 7, paddingHorizontal: 4 },

  note: { fontSize: 8, color: C.inkSubtle, marginTop: 18, textAlign: "right" },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 42,
    right: 42,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    borderTop: `0.5px solid ${C.line}`,
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: C.inkSubtle, letterSpacing: 0.2 },
})

function fmtDate(d: string): string {
  if (!d) return ""
  const parts = d.split("-")
  if (parts.length !== 3) return d
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

// שם המקור ב-DB הוא לרוב שם מקום (שלוחה). מציגים "מכינת X" אם אין כבר קידומת.
function academyLabel(name: string): string {
  return /^מכינ/.test(name) ? name : `מכינת ${name}`
}

function statusInfo(st: string | null): { label: string; color: string } {
  if (st === "suspended") return { label: "מושעית", color: C.amber }
  if (st === "archived") return { label: "בארכיון", color: C.gray }
  return { label: "פעילה", color: C.green }
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

// השם הוא האיבר האחרון בכל שורה (מופיע מימין ב-row-reverse). נותנים לו עמודה רחבה
// יותר; שאר העמודות (סטטיסטיקות) שוות לשמאלו. wrap=false מונע שבירת שורה בין עמודים.
function GenericTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  const nameFlex = 2.4
  return (
    <View>
      <View style={s.gHead}>
        {head.map((h, i) => (
          <Text key={i} style={[s.gHeadCell, { flex: i === head.length - 1 ? nameFlex : 1 }]}>{h}</Text>
        ))}
      </View>
      {rows.map((r, ri) => (
        <View key={ri} style={ri % 2 === 1 ? s.gRowOdd : s.gRowEven} wrap={false}>
          {r.map((c, ci) => {
            const isName = ci === r.length - 1
            return (
              <Text key={ci} style={[isName ? s.gCellEmph : s.gCell, { flex: isName ? nameFlex : 1 }]}>{String(c)}</Text>
            )
          })}
        </View>
      ))}
    </View>
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
  const titleMap = {
    national: "דוח גיוס ארצי",
    compare: "השוואת מכינות",
    stages: "התקדמות שלבים",
  } as const
  const title = titleMap[kind]

  const periodText = periodFrom || periodTo
    ? { from: fmtDate(periodFrom) || "—", to: fmtDate(periodTo) || "—" }
    : null

  // KPIs לפי סוג הדוח
  const nat = nationalReport(data)
  const statusByName = new Map(data.orgs.map((o) => [o.name, o.status]))
  const academiesInReport = nat.rows.length
  const totalCandidates = nat.total
  const leader = nat.rows[0]
  const avgPerAcademy = academiesInReport ? Math.round(totalCandidates / academiesInReport) : 0
  const maxTotal = Math.max(1, ...nat.rows.map((r) => r.total))

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>{title}</Text>
            {periodText ? (
              <View style={s.periodRow}>
                <Text style={s.periodLabel}>תקופה: מ־</Text>
                <Text style={s.periodVal}>{periodText.from}</Text>
                <Text style={s.periodLabel}>עד</Text>
                <Text style={s.periodVal}>{periodText.to}</Text>
              </View>
            ) : (
              <View style={s.periodRow}>
                <Text style={s.periodLabel}>תקופה: כל הנתונים</Text>
              </View>
            )}
          </View>
          <Image style={s.logo} src={logoDataUrl()} />
        </View>

        {/* KPI card */}
        <View style={s.kpiCard}>
          <View style={s.kpiCellFirst}>
            <Text style={s.kpiLabel}>סך מועמדים</Text>
            <Text style={s.kpiValue}>{totalCandidates.toLocaleString()}</Text>
          </View>
          <View style={s.kpiCell}>
            <Text style={s.kpiLabel}>מכינות בדוח</Text>
            <Text style={s.kpiValue}>{academiesInReport}</Text>
          </View>
          <View style={s.kpiCell}>
            <Text style={s.kpiLabel}>מכינה מובילה</Text>
            {leader ? (
              <>
                <Text style={s.kpiLeaderName}>{academyLabel(leader.orgName)}</Text>
                <Text style={s.kpiLeaderSub}>{leader.total} מועמדים</Text>
              </>
            ) : (
              <Text style={s.kpiValue}>—</Text>
            )}
          </View>
          <View style={s.kpiCell}>
            <Text style={s.kpiLabel}>ממוצע למכינה</Text>
            <Text style={s.kpiValue}>{avgPerAcademy}</Text>
          </View>
        </View>

        {/* תוכן הדוח */}
        {kind === "national" && (
          <Section title="פירוט לפי מכינה">
            <View style={s.tHead}>
              <Text style={[s.tHeadCell, { flex: 2.6 }]}>מכינה</Text>
              <Text style={[s.tHeadCell, { flex: 1.5 }]}>תנועה</Text>
              <Text style={[s.tHeadCell, { flex: 2.4 }]}>מועמדים</Text>
              <Text style={[s.tHeadCell, { flex: 1.3 }]}>סטטוס</Text>
            </View>
            {nat.rows.map((r, i) => {
              const st = statusInfo(statusByName.get(r.orgName) ?? null)
              const pct = Math.round((r.total / maxTotal) * 100)
              return (
                <View key={i} style={s.tRow} wrap={false}>
                  <View style={[s.orgWrap, { flex: 2.6 }]}>
                    <View style={s.rankBadge}><Text style={s.rankText}>{i + 1}</Text></View>
                    <Text style={s.orgName}>{academyLabel(r.orgName)}</Text>
                  </View>
                  <Text style={[s.mvText, { flex: 1.5 }]}>{r.movementName}</Text>
                  <View style={[s.barWrap, { flex: 2.4 }]}>
                    <Text style={s.barNum}>{r.total}</Text>
                    <View style={s.barTrack}><View style={[s.barFill, { width: `${pct}%` }]} /></View>
                  </View>
                  <View style={[s.statusWrap, { flex: 1.3 }]}>
                    <View style={[s.statusDot, { backgroundColor: st.color }]} />
                    <Text style={[s.statusText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>
              )
            })}
          </Section>
        )}

        {kind === "compare" && (() => {
          const r = compareReport(data)
          return (
            <Section title="טבלת השוואה">
              <GenericTable
                head={["סטטוס", "% בנות", "% בנים", "התקדמות", "סה״כ", "מכינה"]}
                rows={r.rows.map((x) => [statusInfo(x.status).label, `${x.femalePct}%`, `${x.malePct}%`, `${x.progressPct}%`, x.total, academyLabel(x.orgName)])}
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
            academyLabel(x.orgName),
          ])
          return (
            <Section title="מטריצת שלבים">
              <GenericTable head={head} rows={rows} />
            </Section>
          )
        })()}

        {/* פילוח לפי תנועה — נתון משלים */}
        {kind === "national" && nat.byMovement.length > 0 && (
          <Section title="פילוח לפי תנועה">
            <GenericTable head={["סה״כ מועמדים", "תנועה"]} rows={nat.byMovement.map((x) => [x.total, x.name])} />
          </Section>
        )}

        <Text style={s.note}>הדוח אגרגטיבי בלבד · אין נתונים פרטניים של מועמדים.</Text>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>מועצת המכינות הקדם-צבאיות</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `עמוד ${pageNumber} מתוך ${totalPages}`} />
          <Text style={s.footerText}>הופק ב-{today}</Text>
        </View>
      </Page>
    </Document>
  )
}
