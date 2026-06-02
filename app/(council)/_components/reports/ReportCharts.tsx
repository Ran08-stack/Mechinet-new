"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts"

const COLORS = ["#374765", "#c1583d", "#00a58e", "#7c5cd6", "#e5a228", "#3b82f6", "#ec4899", "#10b981"]

export function NationalCharts({
  rows, byMovement,
}: {
  rows: { orgName: string; total: number }[]
  byMovement: { name: string; total: number }[]
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-line bg-surface p-4">
        <div className="mb-2 text-[13px] font-semibold text-primary">מועמדים לפי מכינה</div>
        <div style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={rows.slice(0, 12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="orgName" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#374765" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <div className="mb-2 text-[13px] font-semibold text-primary">פילוח לפי תנועה</div>
        <div style={{ height: 320 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={byMovement} dataKey="total" nameKey="name" outerRadius={110} label>
                {byMovement.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function StagesChart({
  stageNames, rows,
}: {
  stageNames: string[]
  rows: { orgName: string; counts: Record<string, number> }[]
}) {
  const data = rows.map((r) => ({ orgName: r.orgName, ...r.counts }))
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="mb-2 text-[13px] font-semibold text-primary">התפלגות מועמדים לפי שלב · per מכינה</div>
      <div style={{ height: 380 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="orgName" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {stageNames.map((s, i) => (
              <Bar key={s} dataKey={s} stackId="a" fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
