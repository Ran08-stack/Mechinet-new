"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PipelineStage } from "@/types/database"
import { useRouter } from "next/navigation"

const COLORS = [
  { label: "אפור", value: "bg-gray-100 text-gray-700" },
  { label: "כחול", value: "bg-blue-100 text-blue-700" },
  { label: "צהוב", value: "bg-yellow-100 text-yellow-700" },
  { label: "ירוק", value: "bg-green-100 text-green-700" },
  { label: "אדום", value: "bg-red-100 text-red-700" },
  { label: "סגול", value: "bg-purple-100 text-purple-700" },
]

export default function PipelineStagesEditor({
  stages,
  organizationId,
}: {
  stages: PipelineStage[]
  organizationId: string
}) {
  const [items, setItems] = useState(stages)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(COLORS[0].value)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function addStage() {
    if (!newName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("pipeline_stages")
      .insert({
        name: newName.trim(),
        color: newColor,
        organization_id: organizationId,
        order_index: items.length,
      })
      .select()
      .single()
    if (!error && data) {
      setItems((prev) => [...prev, data])
      setNewName("")
    }
    setSaving(false)
    router.refresh()
  }

  async function deleteStage(id: string) {
    const supabase = createClient()
    await supabase.from("pipeline_stages").delete().eq("id", id)
    setItems((prev) => prev.filter((s) => s.id !== id))
    router.refresh()
  }

  async function moveStage(id: string, direction: "up" | "down") {
    const idx = items.findIndex((s) => s.id === id)
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === items.length - 1) return
    const newItems = [...items]
    const swap = direction === "up" ? idx - 1 : idx + 1
    ;[newItems[idx], newItems[swap]] = [newItems[swap], newItems[idx]]
    setItems(newItems)

    const supabase = createClient()
    await Promise.all(
      newItems.map((s, i) =>
        supabase.from("pipeline_stages").update({ order_index: i }).eq("id", s.id)
      )
    )
    router.refresh()
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="border-b border-[var(--line-faint)] px-[18px] py-3.5">
        <h2 className="m-0 text-[15px] font-semibold text-primary">שלבי מועמדות</h2>
      </div>
      <div className="p-[18px]">

      <div className="space-y-2 mb-5">
        {items.map((stage, idx) => (
          <div key={stage.id} className="flex items-center gap-2">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${stage.color ?? ""} flex-1`}>
              {stage.name}
            </span>
            <button
              onClick={() => moveStage(stage.id, "up")}
              disabled={idx === 0}
              className="px-1 text-sm text-fg-subtle hover:text-fg disabled:opacity-20"
            >
              ↑
            </button>
            <button
              onClick={() => moveStage(stage.id, "down")}
              disabled={idx === items.length - 1}
              className="px-1 text-sm text-fg-subtle hover:text-fg disabled:opacity-20"
            >
              ↓
            </button>
            <button
              onClick={() => deleteStage(stage.id)}
              className="px-1 text-sm text-[var(--fg-faint)] hover:text-[var(--danger)]"
            >
              ×
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-fg-subtle">אין שלבים מוגדרים</p>
        )}
      </div>

      {/* הוספת שלב */}
      <div className="border-t border-[var(--line-faint)] pt-4">
        <p className="mb-2 text-xs font-medium text-fg-subtle">הוסף שלב</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addStage()}
            placeholder="שם השלב"
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
            dir="rtl"
          />
          <select
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="rounded-md border border-line bg-surface px-2 py-2 text-sm outline-none"
          >
            {COLORS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button
            onClick={addStage}
            disabled={saving || !newName.trim()}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-3)] disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
