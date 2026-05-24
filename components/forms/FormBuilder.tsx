"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowRight,
  Check,
  Eye,
  ListTree,
  Share2,
  Plus,
  Users,
  AlertCircle,
  X,
  Copy,
  ExternalLink,
} from "lucide-react"
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { FormField, FormFieldType, Json } from "@/types/database"
import { newField, uid, getTypeMeta } from "./fieldTypes"
import { LibraryPanel, BUNDLES, BundleId } from "./LibraryPanel"
import { CanvasField } from "./CanvasField"
import { PropertiesPanel } from "./PropertiesPanel"
import { PreviewMode } from "./PreviewMode"

type FormRow = {
  id: string
  name: string
  description: string | null
  fields: unknown
  organization_id: string
  is_active: boolean
}

type Mode = "builder" | "preview"

export default function FormBuilder({
  form,
  organizationId,
  submissionCount = 0,
}: {
  form: FormRow | null
  organizationId: string
  submissionCount?: number
}) {
  const router = useRouter()
  const supabase = createClient()

  const initialFields: FormField[] = useMemo(() => {
    if (!form?.fields || !Array.isArray(form.fields)) return defaultFields()
    return form.fields as FormField[]
  }, [form])

  const [title, setTitle] = useState<string>(form?.name ?? "טופס מועמדות חדש")
  const [description, setDescription] = useState<string>(
    form?.description ?? "מילוי הטופס לוקח כ-7 דקות."
  )
  const [fields, setFields] = useState<FormField[]>(initialFields)
  const [selectedId, setSelectedId] = useState<string | null>(
    initialFields.find((f) => f.type !== "section")?.id ?? null
  )
  const [mode, setMode] = useState<Mode>("builder")
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [dirty, setDirty] = useState<boolean>(false)
  const [isActive, setIsActive] = useState<boolean>(form?.is_active ?? false)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  )
  const [shareOpen, setShareOpen] = useState(false)
  const [firstRender, setFirstRender] = useState(true)

  // autosave debounce — 800ms after changes.
  // טופס פעיל לא נשמר אוטומטית — מונע פרסום ביניים של עריכה חצי-גמורה.
  // אדמין חייב ללחוץ "עדכן טופס" במפורש כדי לפרסם את השינויים.
  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }
    setDirty(true)
    if (!form?.id) return
    if (isActive) return // טופס פעיל — מחכה לפרסום ידני
    const t = setTimeout(() => {
      void doSave()
    }, 800)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, fields, isActive])

  async function doSave(opts?: { publish?: boolean }) {
    setSaving(true)
    const payload = {
      name: title,
      description: description || null,
      fields: fields as unknown as Json,
      organization_id: organizationId,
      ...(opts?.publish ? { is_active: true } : {}),
    }
    if (!form?.id) {
      const { data, error } = await supabase
        .from("forms")
        .insert(payload)
        .select("id")
        .single()
      if (!error && data) {
        router.replace(`/forms/${data.id}/builder`)
      }
    } else {
      const { error } = await supabase
        .from("forms")
        .update(payload)
        .eq("id", form.id)
      if (!error) {
        setSavedAt(new Date())
        setDirty(false)
      }
    }
    if (opts?.publish) setIsActive(true)
    setSaving(false)
  }

  const selected = fields.find((f) => f.id === selectedId) ?? null

  function addField(t: FormFieldType) {
    const f = newField(t)
    setFields((prev) => [...prev, f])
    setSelectedId(f.id)
  }
  function addBundle(id: BundleId) {
    const bundle = BUNDLES.find((b) => b.id === id)
    if (!bundle) return
    const newOnes = bundle.build()
    setFields((prev) => [...prev, ...newOnes])
    setSelectedId(newOnes[1]?.id ?? newOnes[0]?.id ?? null)
  }
  function addFieldBefore(beforeId: string, t: FormFieldType) {
    const f = newField(t)
    setFields((prev) => {
      const idx = prev.findIndex((x) => x.id === beforeId)
      const next = [...prev]
      next.splice(idx, 0, f)
      return next
    })
    setSelectedId(f.id)
  }
  function duplicateField(id: string) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (idx < 0) return prev
      const copy: FormField = { ...prev[idx], id: uid() }
      if (copy.options) copy.options = [...copy.options]
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      setSelectedId(copy.id)
      return next
    })
  }
  function deleteField(id: string) {
    setFields((prev) => {
      const next = prev.filter((f) => f.id !== id)
      if (selectedId === id) {
        setSelectedId(next[0]?.id ?? null)
      }
      return next
    })
  }
  function moveField(fromId: string, toId: string) {
    if (fromId === toId) return
    setFields((prev) => {
      const fromIdx = prev.findIndex((f) => f.id === fromId)
      const toIdx = prev.findIndex((f) => f.id === toId)
      if (fromIdx < 0 || toIdx < 0) return prev
      const next = [...prev]
      const [item] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, item)
      return next
    })
  }
  function updateField(id: string, updates: Partial<FormField>) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    )
  }
  function toggleSection(id: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ===== DnD =====
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  )
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  function handleDragStart(e: DragStartEvent) {
    setActiveDragId(String(e.active.id))
  }
  function handleDragEnd(e: DragEndEvent) {
    setActiveDragId(null)
    const activeId = String(e.active.id)
    const overId = e.over ? String(e.over.id) : null
    if (!overId) return

    // ספרייה — שדה חדש
    if (activeId.startsWith("lib:")) {
      const t = activeId.slice(4) as FormFieldType
      if (overId === "canvas-end") {
        addField(t)
      } else {
        addFieldBefore(overId, t)
      }
      return
    }
    // ספרייה — bundle
    if (activeId.startsWith("bundle:")) {
      const id = activeId.slice(7) as BundleId
      addBundle(id)
      return
    }
    // canvas — מיון
    if (activeId === overId) return
    setFields((prev) => {
      const fromIdx = prev.findIndex((f) => f.id === activeId)
      const toIdx = prev.findIndex((f) => f.id === overId)
      if (fromIdx < 0 || toIdx < 0) return prev
      return arrayMove(prev, fromIdx, toIdx)
    })
  }

  const activeDragMeta = (() => {
    if (!activeDragId) return null
    if (activeDragId.startsWith("lib:")) {
      const meta = getTypeMeta(activeDragId.slice(4))
      return { kind: "lib" as const, label: meta.label, icon: meta.icon }
    }
    if (activeDragId.startsWith("bundle:")) {
      const b = BUNDLES.find((x) => x.id === (activeDragId.slice(7) as BundleId))
      return { kind: "bundle" as const, label: b?.label ?? "ערכה" }
    }
    const f = fields.find((x) => x.id === activeDragId)
    if (!f) return null
    return { kind: "field" as const, label: f.label, type: f.type }
  })()

  // חישוב נראות: שדה שמתחת ל-section מקופל = מוסתר
  const visibility = useMemo(() => {
    const vis = new Map<string, boolean>()
    let underCollapsed = false
    for (const f of fields) {
      if (f.type === "section") {
        underCollapsed = collapsedSections.has(f.id)
        vis.set(f.id, true)
      } else {
        vis.set(f.id, !underCollapsed)
      }
    }
    return vis
  }, [fields, collapsedSections])

  return (
    <div className="flex h-screen flex-col bg-bg" dir="rtl">
      {/* TOPBAR */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3.5 border-b border-line bg-surface px-[18px]">
        <button
          onClick={() => router.push("/forms")}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          טפסים
        </button>

        <div className="flex min-w-0 items-center gap-2.5">
          <span className="truncate max-w-[280px] text-[15px] font-semibold text-primary">
            {title || "ללא שם"}
          </span>
          <SaveBadge saving={saving} dirty={dirty} savedAt={savedAt} />
          <StatusPill isActive={isActive} />
          {submissionCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-[var(--bg-subtle)] px-2.5 py-px text-[11.5px] text-fg-muted">
              <Users className="h-3 w-3" />
              {submissionCount} הוגשו
            </span>
          )}
        </div>

        <div className="flex-1" />

        <div className="inline-flex rounded-md border border-line bg-[var(--bg-muted)] p-[3px]">
          {(["builder", "preview"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`inline-flex h-[26px] items-center gap-1.5 rounded-[5px] px-3 text-[13px] font-medium transition-colors ${
                mode === m
                  ? "bg-surface text-fg shadow-[var(--shadow-xs)]"
                  : "text-fg-muted hover:bg-surface/50"
              }`}
            >
              {m === "builder" ? (
                <ListTree className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
              {m === "builder" ? "עורך" : "תצוגה מקדימה"}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShareOpen(true)}
          title="שתף קישור"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-3 text-[13px] font-medium text-fg hover:bg-[var(--bg-subtle)]"
        >
          <Share2 className="h-3 w-3" />
          שתף
        </button>
        <button
          onClick={() => doSave({ publish: true })}
          disabled={saving}
          className="inline-flex h-8 items-center rounded-md bg-[var(--accent)] px-3.5 text-[13px] font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {isActive ? "עדכן טופס" : "פרסם טופס"}
        </button>
      </header>

      {mode === "builder" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragId(null)}
        >
        <main
          className="grid flex-1 overflow-hidden"
          style={{ gridTemplateColumns: "320px 1fr 264px" }}
        >
          <PropertiesPanel
            field={selected}
            onChange={(updates) =>
              selected && updateField(selected.id, updates)
            }
            onDelete={() => selected && deleteField(selected.id)}
          />

          <section className="overflow-y-auto bg-bg px-10 pb-20 pt-8">
            <div className="mx-auto max-w-[720px] overflow-hidden rounded-lg border border-line bg-surface shadow-[0_1px_0_rgba(3,22,49,.03),0_12px_32px_-16px_rgba(3,22,49,.12)]">
              <div
                className="relative border-b border-[var(--line-faint)] px-8 pb-[22px] pt-7"
                style={{
                  background:
                    "radial-gradient(ellipse 600px 200px at 80% -20%, rgba(254,111,66,.06), transparent 60%), var(--surface)",
                }}
              >
                <div
                  className="absolute inset-y-0 start-0 w-1"
                  style={{
                    background:
                      "linear-gradient(180deg, var(--accent) 0%, var(--primary) 100%)",
                  }}
                />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="-mx-2 -mb-[6px] block w-[calc(100%+1rem)] rounded border border-transparent px-2 py-1 text-[24px] font-semibold tracking-[-0.01em] text-primary outline-none hover:bg-[var(--bg-subtle)] focus:border-[var(--accent-line)] focus:bg-surface focus:shadow-[var(--shadow-focus)]"
                />
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="הסבר קצר למועמדים…"
                  className="-mx-2 mt-2 block w-[calc(100%+1rem)] rounded border border-transparent px-2 py-1 text-[15px] text-fg-muted outline-none hover:bg-[var(--bg-subtle)] focus:border-[var(--accent-line)] focus:bg-surface focus:shadow-[var(--shadow-focus)]"
                />
              </div>

              <div className="px-4 pb-6 pt-3">
                {fields.length === 0 && (
                  <div className="py-16 text-center text-[13px] text-fg-subtle">
                    גרור שדה מהרשימה מימין או לחץ עליו כדי להוסיף
                  </div>
                )}
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((f) => {
                    const visible = visibility.get(f.id) ?? true
                    if (!visible) return null
                    return (
                      <CanvasField
                        key={f.id}
                        field={f}
                        selected={selectedId === f.id}
                        collapsed={collapsedSections.has(f.id)}
                        onSelect={() => setSelectedId(f.id)}
                        onDuplicate={() => duplicateField(f.id)}
                        onDelete={() => deleteField(f.id)}
                        onToggleCollapse={
                          f.type === "section"
                            ? () => toggleSection(f.id)
                            : undefined
                        }
                      />
                    )
                  })}
                </SortableContext>
                <CanvasEndDroppable onAdd={() => addField("short_text")} />
              </div>

              <div className="flex items-center gap-2 border-t border-[var(--line-faint)] bg-[var(--bg-subtle)] px-8 pb-7 pt-5">
                <button className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold text-white">
                  שליחת הטופס
                </button>
                <span className="text-[11px] text-fg-subtle">
                  ·  הטופס מאובטח · נתונים מוצפנים
                </span>
              </div>
            </div>
          </section>

          <LibraryPanel onAdd={addField} onAddBundle={addBundle} />
        </main>
        <DragOverlay>
          {activeDragMeta ? (
            <div className="pointer-events-none rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-2 text-[13px] font-medium text-[var(--accent-hover)] shadow-[var(--shadow-lg)]">
              {activeDragMeta.kind === "lib" && "+ "}
              {activeDragMeta.kind === "bundle" && "⊕ "}
              {activeDragMeta.label}
            </div>
          ) : null}
        </DragOverlay>
        </DndContext>
      ) : (
        <main className="flex-1 overflow-hidden">
          <PreviewMode
            title={title}
            description={description}
            fields={fields}
          />
        </main>
      )}

      {shareOpen && (
        <ShareModal
          formId={form?.id ?? null}
          isActive={isActive}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}

function DropLine() {
  return (
    <div className="my-1 h-[2px] rounded bg-[var(--accent)]" />
  )
}

function CanvasEndDroppable({ onAdd }: { onAdd: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-end" })
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onAdd}
      className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border-[1.5px] border-dashed py-3.5 text-[13px] transition-colors ${
        isOver
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--line-strong)] text-fg-muted hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
      }`}
    >
      <Plus className="h-3.5 w-3.5" />
      הוסף שדה
    </button>
  )
}

function SaveBadge({
  saving,
  dirty,
  savedAt,
}: {
  saving: boolean
  dirty: boolean
  savedAt: Date | null
}) {
  if (saving) return <span className="text-[11px] text-fg-subtle">שומר…</span>
  if (dirty)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-fg-subtle">
        <AlertCircle className="h-3 w-3" />
        שינויים לא שמורים
      </span>
    )
  if (savedAt)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--stage-accepted-fg)]">
        <Check className="h-3 w-3" />
        נשמר {timeAgo(savedAt)}
      </span>
    )
  return null
}

function StatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-px text-[11.5px] font-medium"
      style={{
        background: isActive
          ? "var(--stage-accepted-bg)"
          : "var(--stage-review-bg)",
        color: isActive
          ? "var(--stage-accepted-fg)"
          : "var(--stage-review-fg)",
        borderColor: isActive
          ? "var(--stage-accepted-line)"
          : "var(--stage-review-line)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: isActive
            ? "var(--stage-accepted-dot)"
            : "var(--stage-review-dot)",
        }}
      />
      {isActive ? "פעיל" : "טיוטה"}
    </span>
  )
}

function ShareModal({
  formId,
  isActive,
  onClose,
}: {
  formId: string | null
  isActive: boolean
  onClose: () => void
}) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null)

  if (!formId) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: "var(--overlay)" }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm rounded-lg border border-line bg-surface p-5 shadow-[var(--shadow-lg)]"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="m-0 text-[15px] font-semibold text-primary">
            שמור קודם
          </h3>
          <p className="mt-1.5 text-[13px] text-fg-muted">
            לפני שאפשר לשתף — שמור את הטופס.
          </p>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-md bg-primary py-2 text-[13px] font-medium text-white"
          >
            סגור
          </button>
        </div>
      </div>
    )
  }

  const url = `${window.location.origin}/apply/${formId}`
  const embed = `<iframe src="${url}" width="100%" height="800" frameborder="0"></iframe>`

  async function copy(t: "link" | "embed") {
    await navigator.clipboard.writeText(t === "link" ? url : embed)
    setCopied(t)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
          <h2 className="m-0 text-[15px] font-semibold text-primary">
            שתף את הטופס
          </h2>
          <button
            onClick={onClose}
            className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          {!isActive && (
            <div className="rounded-md border-s-[3px] border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2.5 text-[12.5px] text-fg-muted">
              הטופס במצב טיוטה. מועמדים לא יוכלו להגיש עד שפורסם.
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-fg-muted">
              קישור ציבורי
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                dir="ltr"
                className="h-9 flex-1 rounded-md border border-line bg-[var(--bg-subtle)] px-3 text-[12.5px] outline-none"
              />
              <button
                onClick={() => copy("link")}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] hover:bg-[var(--bg-subtle)]"
              >
                {copied === "link" ? (
                  <Check className="h-3.5 w-3.5 text-[var(--stage-accepted-fg)]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                העתק
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] hover:bg-[var(--bg-subtle)]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                פתח
              </a>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-fg-muted">
              קוד הטמעה (iframe)
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={embed}
                dir="ltr"
                className="h-9 flex-1 rounded-md border border-line bg-[var(--bg-subtle)] px-3 text-[11.5px] outline-none"
              />
              <button
                onClick={() => copy("embed")}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] hover:bg-[var(--bg-subtle)]"
              >
                {copied === "embed" ? (
                  <Check className="h-3.5 w-3.5 text-[var(--stage-accepted-fg)]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                העתק
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function timeAgo(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 5) return "כרגע"
  if (diff < 60) return `לפני ${diff} שנ׳`
  const m = Math.floor(diff / 60)
  return `לפני ${m} דק׳`
}

function defaultFields(): FormField[] {
  return [
    {
      id: uid(),
      type: "section",
      label: "פרטים אישיים",
      required: false,
    },
    {
      id: uid(),
      type: "short_text",
      label: "שם מלא",
      help: "שם פרטי + משפחה כפי שמופיע בת.ז",
      required: true,
      placeholder: "ישראל ישראלי",
    },
    {
      id: uid(),
      type: "id_number",
      label: 'ת"ז',
      help: "9 ספרות כולל ספרת ביקורת",
      required: true,
    },
    {
      id: uid(),
      type: "email",
      label: "אימייל",
      required: true,
      placeholder: "name@example.com",
    },
    {
      id: uid(),
      type: "phone",
      label: "טלפון נייד",
      required: true,
      placeholder: "0500000000",
    },
    {
      id: uid(),
      type: "date",
      label: "תאריך לידה",
      required: true,
    },
  ]
}
