"use client"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toaster"

type Row = Record<string, string>

const TARGET_FIELDS = [
  { key: "full_name", label: "שם מלא" },
  { key: "email", label: "אימייל" },
  { key: "phone", label: "טלפון" },
  { key: "city", label: "עיר" },
  { key: "national_id", label: "תעודת זהות" },
] as const

// פרסר CSV פשוט: תומך במרכאות כפולות ובפסיקים בתוך שדות. ללא תלות חיצונית.
function parseCSV(text: string): { headers: string[]; rows: Row[] } {
  const clean = text.replace(/^﻿/, "").replace(/\r\n/g, "\n")
  const lines: string[] = []
  let cur = ""
  let inQuotes = false
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]
    if (ch === '"') {
      if (inQuotes && clean[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === "\n" && !inQuotes) {
      lines.push(cur)
      cur = ""
    } else {
      cur += ch
    }
  }
  if (cur.length > 0) lines.push(cur)

  function splitLine(line: string): string[] {
    const out: string[] = []
    let v = ""
    let q = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          v += '"'
          i++
        } else q = !q
      } else if (ch === "," && !q) {
        out.push(v)
        v = ""
      } else {
        v += ch
      }
    }
    out.push(v)
    return out.map((s) => s.trim())
  }

  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = splitLine(lines[0])
  const rows: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const vals = splitLine(lines[i])
    const row: Row = {}
    headers.forEach((h, j) => {
      row[h] = vals[j] ?? ""
    })
    rows.push(row)
  }
  return { headers, rows }
}

// ניחוש mapping אוטומטי לפי שם העמודה (עברית/אנגלית)
function guessMapping(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  const dict: Record<string, string[]> = {
    full_name: ["שם", "שם מלא", "name", "full_name", "fullname"],
    email: ["אימייל", "מייל", "email", "e-mail"],
    phone: ["טלפון", "נייד", "phone", "mobile"],
    city: ["עיר", "מגורים", "city"],
    national_id: ["תז", 'ת"ז', "תעודת זהות", "national_id", "id"],
  }
  for (const target of TARGET_FIELDS) {
    const hit = headers.find((h) =>
      dict[target.key].some((k) => h.toLowerCase().includes(k.toLowerCase()))
    )
    if (hit) map[target.key] = hit
  }
  return map
}

export default function ImportCSVModal({
  organizationId,
  defaultStage,
  onClose,
}: {
  organizationId: string
  defaultStage: string
  onClose: () => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    const parsed = parseCSV(text)
    setHeaders(parsed.headers)
    setRows(parsed.rows)
    setMapping(guessMapping(parsed.headers))
  }

  async function doImport() {
    if (!mapping.full_name || !mapping.email) {
      alert("חובה למפות לפחות שם מלא ואימייל")
      return
    }
    setBusy(true)
    const supabase = createClient()
    const inserts = rows
      .map((r) => ({
        organization_id: organizationId,
        full_name: r[mapping.full_name] ?? "",
        email: r[mapping.email] ?? "",
        phone: mapping.phone ? r[mapping.phone] || null : null,
        city: mapping.city ? r[mapping.city] || null : null,
        national_id: mapping.national_id
          ? r[mapping.national_id] || null
          : null,
        stage: defaultStage,
      }))
      .filter((r) => r.full_name && r.email)

    const { error, count } = await supabase
      .from("candidates")
      .insert(inserts, { count: "exact" })

    setBusy(false)
    if (error) {
      toast({ message: `ייבוא נכשל: ${error.message}` })
    } else {
      toast({ message: `יובאו ${count ?? inserts.length} מועמדים` })
      router.refresh()
      onClose()
    }
  }

  const preview = rows.slice(0, 5)

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
          <h2 className="m-0 text-[15px] font-semibold text-primary">
            ייבוא מועמדים מ-CSV
          </h2>
          <button
            onClick={onClose}
            className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {rows.length === 0 ? (
            <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-line text-[13px] text-fg-muted hover:border-accent">
              <Upload className="h-6 w-6" />
              בחר קובץ CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={onFile}
                className="hidden"
              />
            </label>
          ) : (
            <>
              <div className="mb-3 text-[12px] text-fg-muted">
                נמצאו {rows.length} שורות. מפה עמודות:
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2">
                {TARGET_FIELDS.map((tf) => (
                  <label key={tf.key} className="flex flex-col gap-1">
                    <span className="text-[11.5px] text-fg-subtle">
                      {tf.label}
                      {(tf.key === "full_name" || tf.key === "email") && (
                        <span className="text-[var(--danger)]"> *</span>
                      )}
                    </span>
                    <select
                      value={mapping[tf.key] ?? ""}
                      onChange={(e) =>
                        setMapping((m) => ({ ...m, [tf.key]: e.target.value }))
                      }
                      className="h-8 rounded-md border border-line bg-surface px-2 text-[13px] outline-none focus:border-accent"
                    >
                      <option value="">— אל תייבא —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <div className="mb-2 text-[11.5px] text-fg-subtle">
                תצוגה מקדימה (5 שורות):
              </div>
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full text-[12px]">
                  <thead className="bg-[var(--bg-subtle)]">
                    <tr>
                      {TARGET_FIELDS.map((tf) => (
                        <th
                          key={tf.key}
                          className="px-2 py-1.5 text-start font-medium text-fg-subtle"
                        >
                          {tf.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-t border-[var(--line-faint)]">
                        {TARGET_FIELDS.map((tf) => (
                          <td key={tf.key} className="px-2 py-1.5 text-fg">
                            {mapping[tf.key] ? r[mapping[tf.key]] || "—" : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--line-faint)] px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]"
          >
            ביטול
          </button>
          <button
            onClick={doImport}
            disabled={busy || rows.length === 0}
            className="rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {busy ? "מייבא…" : `ייבא ${rows.length} מועמדים`}
          </button>
        </div>
      </div>
    </div>
  )
}
