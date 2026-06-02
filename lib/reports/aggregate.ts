// אגרגציות לדוחות המועצה. ה-RLS כבר חוסם נתונים פרטניים — כאן נעשה רק סכומים.
// אסור להחזיר רשימת מועמדים פרטנית מקבצים שמייצאים.

import { createClient } from "@/lib/supabase/server"

export type ReportKind = "national" | "compare" | "stages"

export type ReportFilters = {
  from: string | null // YYYY-MM-DD
  to: string | null
  orgIds: string[] // ריק = כל המכינות
}

export type OrgRow = {
  id: string
  name: string
  status: string | null
  gender_policy: string | null
  movement_id: string | null
}

export type MovementRow = { id: string; name: string }
export type StageRow = { id: string; name: string; organization_id: string; is_default: boolean; order_index: number }
export type CandidateMini = { organization_id: string; stage: string; gender: string | null; created_at: string | null }

export type ReportData = {
  filters: ReportFilters
  orgs: OrgRow[]
  movements: MovementRow[]
  stages: StageRow[]
  candidates: CandidateMini[]
}

export async function loadReportData(filters: ReportFilters): Promise<ReportData> {
  const supabase = await createClient()

  let candidatesQ = supabase
    .from("candidates")
    .select("organization_id, stage, gender, created_at")
  if (filters.from) candidatesQ = candidatesQ.gte("created_at", filters.from)
  if (filters.to) candidatesQ = candidatesQ.lte("created_at", filters.to + "T23:59:59")
  if (filters.orgIds.length > 0) candidatesQ = candidatesQ.in("organization_id", filters.orgIds)

  const [{ data: orgs }, { data: movements }, { data: stages }, { data: candidates }] = await Promise.all([
    supabase.from("organizations").select("id, name, status, gender_policy, movement_id").order("name"),
    supabase.from("movements").select("id, name").order("name"),
    supabase.from("pipeline_stages").select("id, name, organization_id, is_default, order_index"),
    candidatesQ,
  ])

  return {
    filters,
    orgs: (orgs ?? []) as OrgRow[],
    movements: (movements ?? []) as MovementRow[],
    stages: (stages ?? []) as StageRow[],
    candidates: (candidates ?? []) as CandidateMini[],
  }
}

// === דוח גיוס ארצי ===
export type NationalRow = { orgName: string; total: number; movementName: string }
export function nationalReport(d: ReportData): {
  rows: NationalRow[]
  byMovement: { name: string; total: number }[]
  total: number
} {
  const orgsToShow = d.filters.orgIds.length ? d.orgs.filter((o) => d.filters.orgIds.includes(o.id)) : d.orgs
  const movementById = new Map(d.movements.map((m) => [m.id, m.name]))
  const countByOrg = new Map<string, number>()
  for (const c of d.candidates) countByOrg.set(c.organization_id, (countByOrg.get(c.organization_id) ?? 0) + 1)

  const rows: NationalRow[] = orgsToShow.map((o) => ({
    orgName: o.name,
    total: countByOrg.get(o.id) ?? 0,
    movementName: (o.movement_id && movementById.get(o.movement_id)) || "ללא תנועה",
  }))
  rows.sort((a, b) => b.total - a.total)

  const moveMap = new Map<string, number>()
  for (const r of rows) moveMap.set(r.movementName, (moveMap.get(r.movementName) ?? 0) + r.total)
  const byMovement = Array.from(moveMap.entries()).map(([name, total]) => ({ name, total }))
  byMovement.sort((a, b) => b.total - a.total)

  return { rows, byMovement, total: rows.reduce((s, r) => s + r.total, 0) }
}

// === השוואת מכינות ===
export type CompareRow = {
  orgName: string
  total: number
  progressPct: number
  malePct: number
  femalePct: number
  status: string
}
export function compareReport(d: ReportData): { rows: CompareRow[] } {
  const orgsToShow = d.filters.orgIds.length ? d.orgs.filter((o) => d.filters.orgIds.includes(o.id)) : d.orgs
  const defaultStageByOrg = new Map<string, string>()
  for (const s of d.stages) if (s.is_default) defaultStageByOrg.set(s.organization_id, s.name)

  const rows: CompareRow[] = orgsToShow.map((o) => {
    const list = d.candidates.filter((c) => c.organization_id === o.id)
    const total = list.length
    const def = defaultStageByOrg.get(o.id)
    const progressed = def ? list.filter((c) => c.stage !== def).length : 0
    const male = list.filter((c) => c.gender === "male" || c.gender === "זכר").length
    const female = list.filter((c) => c.gender === "female" || c.gender === "נקבה").length
    return {
      orgName: o.name,
      total,
      progressPct: total ? Math.round((progressed / total) * 100) : 0,
      malePct: total ? Math.round((male / total) * 100) : 0,
      femalePct: total ? Math.round((female / total) * 100) : 0,
      status: o.status ?? "—",
    }
  })
  rows.sort((a, b) => b.total - a.total)
  return { rows }
}

// === התקדמות שלבים (matrix) ===
export type StagesMatrix = {
  stageNames: string[]
  rows: { orgName: string; counts: Record<string, number>; total: number }[]
}
export function stagesReport(d: ReportData): StagesMatrix {
  const orgsToShow = d.filters.orgIds.length ? d.orgs.filter((o) => d.filters.orgIds.includes(o.id)) : d.orgs

  // שמות שלבים — איגוד על פני כל המכינות שמוצגות, מסודרים לפי order_index ממוצע.
  const stageOrder = new Map<string, number>()
  const stageCount = new Map<string, number>()
  for (const s of d.stages) {
    if (orgsToShow.find((o) => o.id === s.organization_id)) {
      stageOrder.set(s.name, (stageOrder.get(s.name) ?? 0) + s.order_index)
      stageCount.set(s.name, (stageCount.get(s.name) ?? 0) + 1)
    }
  }
  const stageNames = Array.from(stageOrder.keys()).sort((a, b) => {
    const aAvg = (stageOrder.get(a) ?? 0) / (stageCount.get(a) ?? 1)
    const bAvg = (stageOrder.get(b) ?? 0) / (stageCount.get(b) ?? 1)
    return aAvg - bAvg
  })

  const rows = orgsToShow.map((o) => {
    const counts: Record<string, number> = {}
    for (const n of stageNames) counts[n] = 0
    let total = 0
    for (const c of d.candidates) {
      if (c.organization_id !== o.id) continue
      total++
      if (c.stage in counts) counts[c.stage]++
    }
    return { orgName: o.name, counts, total }
  })
  return { stageNames, rows }
}
