"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  X,
  UserPlus,
  Trash2,
  KeyRound,
  Search,
  Pencil,
  Users,
  Shield,
  UserCheck,
  Mail,
  Phone,
  ChevronDown,
  Check,
  Eye,
  EyeOff,
} from "lucide-react"
import { normalizePhone } from "@/lib/utils"

export type TeamMember = {
  id: string
  email: string
  phone: string | null
  full_name: string | null
  role: string
  role_label: string | null
  created_at: string | null
  last_sign_in_at: string | null
}

const ROLE_LABEL: Record<string, string> = {
  admin: "ראש שלוחה",
  org_admin: "ראש שלוחה",
  org_staff: "איש צוות",
  staff: "איש צוות",
}

function isAdminRole(role: string) {
  return role === "admin" || role === "org_admin"
}

function initials(member: TeamMember): string {
  const src = member.full_name?.trim() || member.email
  const parts = src.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return src.slice(0, 2).toUpperCase()
}

// gradient לפי id — יציב אבל מגוון
const GRADIENTS = [
  "linear-gradient(135deg,#ffb59f,#fe6f42)",
  "linear-gradient(135deg,#b6c7ea,#374765)",
  "linear-gradient(135deg,#44ddc1,#00a58e)",
  "linear-gradient(135deg,#d5c4f7,#7c5cd6)",
  "linear-gradient(135deg,#f4b8a8,#c1583d)",
]
function avatarGradient(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return GRADIENTS[h % GRADIENTS.length]
}

function timeAgo(iso: string | null): string {
  if (!iso) return "מעולם לא"
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "כרגע"
  if (mins < 60) return `לפני ${mins} דק׳`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `לפני ${hours} שעות`
  const days = Math.floor(hours / 24)
  if (days < 7) return `לפני ${days} ימים`
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short" })
}

export function TeamManager({
  currentUserId,
  initialMembers,
  roleLabels = [],
  readOnly = false,
}: {
  currentUserId: string
  initialMembers: TeamMember[]
  roleLabels?: string[]
  readOnly?: boolean
}) {
  const router = useRouter()
  const [openCreate, setOpenCreate] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [resetFor, setResetFor] = useState<TeamMember | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "staff">("all")

  const adminCount = initialMembers.filter((m) => isAdminRole(m.role)).length
  const staffCount = initialMembers.length - adminCount
  const activeCount = initialMembers.filter((m) => m.last_sign_in_at).length

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return initialMembers.filter((m) => {
      const baseRoleHe = isAdminRole(m.role) ? "ראש שלוחה" : "איש צוות"
      const matchQ =
        !q ||
        (m.full_name ?? "").toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone ?? "").includes(q) ||
        (m.role_label ?? "").toLowerCase().includes(q) ||
        baseRoleHe.includes(q)
      const matchR =
        roleFilter === "all"
          ? true
          : roleFilter === "admin"
          ? isAdminRole(m.role)
          : !isAdminRole(m.role)
      return matchQ && matchR
    })
  }, [initialMembers, search, roleFilter])

  return (
    <div className="space-y-4">
      {/* סטטיסטיקות */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="סך משתמשים"
          value={initialMembers.length}
          tone="primary"
        />
        <StatCard icon={Shield} label="ראשי שלוחה" value={adminCount} tone="accent" />
        <StatCard
          icon={UserCheck}
          label="התחברו לפחות פעם"
          value={activeCount}
          tone="ai"
        />
      </div>

      {/* פאנל */}
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {/* טולבר */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line-faint)] px-4 py-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש לפי שם, אימייל, טלפון, תפקיד או רמת הרשאה…"
              className="h-9 w-full rounded-md border border-line bg-surface pe-9 ps-3 text-[13px] outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
            />
          </div>
          <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
            {(["all", "admin", "staff"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setRoleFilter(v)}
                className={`h-7 rounded px-3 text-[12.5px] transition-colors ${
                  roleFilter === v
                    ? "bg-[var(--accent-soft)] font-medium text-[var(--accent-hover)]"
                    : "text-fg-muted hover:bg-[var(--bg-subtle)]"
                }`}
              >
                {v === "all" ? "הכול" : v === "admin" ? "ראשי שלוחה" : "אנשי צוות"}
              </button>
            ))}
          </div>
          <span className="text-[12px] text-fg-subtle">
            {filtered.length} מתוך {initialMembers.length}
          </span>
          {!readOnly && (
            <button
              onClick={() => setOpenCreate(true)}
              className="ms-auto inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-[13px] font-medium text-white hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              הוסף איש צוות
            </button>
          )}
        </div>

        {/* רשימה */}
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--bg-subtle)] text-fg-subtle">
              <Users className="h-5 w-5" />
            </div>
            <p className="m-0 text-[13px] font-medium text-fg">
              {initialMembers.length === 0
                ? "אין משתמשים עדיין"
                : "לא נמצאו תוצאות"}
            </p>
            <p className="mt-1 text-[12px] text-fg-subtle">
              {initialMembers.length === 0
                ? readOnly
                  ? "המנהל עדיין לא הוסיף אנשי צוות."
                  : "הוסף את איש הצוות הראשון."
                : "נסה לשנות חיפוש או סינון."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--line-faint)]">
            {filtered.map((m) => {
              const isMe = m.id === currentUserId
              const admin = isAdminRole(m.role)
              return (
                <li
                  key={m.id}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  {/* avatar */}
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.35)]"
                    style={{ background: avatarGradient(m.id) }}
                  >
                    {initials(m)}
                  </span>

                  {/* identity */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-semibold text-fg">
                        {m.full_name || m.email.split("@")[0]}
                      </span>
                      {isMe && (
                        <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[10.5px] text-fg-subtle">
                          זה אתה
                        </span>
                      )}
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10.5px] ${
                          admin
                            ? "border-[var(--primary-line)] bg-[var(--primary-soft)] text-primary"
                            : "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-hover)]"
                        }`}
                      >
                        {ROLE_LABEL[m.role] ?? m.role}
                      </span>
                      {m.role_label && (
                        <span className="rounded-full border border-line bg-[var(--bg-subtle)] px-2 py-0.5 text-[10.5px] text-fg-muted">
                          {m.role_label}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-fg-subtle">
                      <span className="inline-flex items-center gap-1 [direction:ltr]">
                        <Mail className="h-3 w-3" />
                        {m.email}
                      </span>
                      {m.phone && (
                        <>
                          <span className="text-[var(--fg-faint)]">·</span>
                          <span className="inline-flex items-center gap-1 [direction:ltr]">
                            <Phone className="h-3 w-3" />
                            {m.phone}
                          </span>
                        </>
                      )}
                      <span className="text-[var(--fg-faint)]">·</span>
                      <span>כניסה אחרונה: {timeAgo(m.last_sign_in_at)}</span>
                    </div>
                  </div>

                  {/* פעולות — רק למנהל */}
                  {!readOnly && (
                    <div className="flex items-center gap-1">
                      <ActionButton
                        title="עריכת פרטים"
                        icon={Pencil}
                        onClick={() => setEditing(m)}
                      />
                      <ActionButton
                        title="איפוס סיסמה"
                        icon={KeyRound}
                        onClick={() => setResetFor(m)}
                      />
                      {!isMe && (
                        <DeleteButton
                          id={m.id}
                          disabled={admin}
                          onDone={() => router.refresh()}
                        />
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {openCreate && (
        <CreateModal
          roleLabels={roleLabels}
          onClose={() => setOpenCreate(false)}
          onDone={() => {
            setOpenCreate(false)
            router.refresh()
          }}
        />
      )}
      {editing && (
        <EditModal
          member={editing}
          currentUserId={currentUserId}
          roleLabels={roleLabels}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null)
            router.refresh()
          }}
        />
      )}
      {resetFor && (
        <ResetPasswordModal
          member={resetFor}
          onClose={() => setResetFor(null)}
        />
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users
  label: string
  value: number
  tone: "primary" | "accent" | "ai"
}) {
  const toneClass: Record<typeof tone, string> = {
    primary: "bg-[var(--primary-soft)] text-primary",
    accent: "bg-[var(--accent-soft)] text-[var(--accent-hover)]",
    ai: "bg-[var(--ai-soft)] text-[var(--ai-deep)]",
  }
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4">
      <span className={`grid h-9 w-9 place-items-center rounded-md ${toneClass[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] text-fg-subtle">{label}</span>
        <span className="text-[20px] font-semibold tracking-tight text-primary [font-variant-numeric:tabular-nums]">
          {value}
        </span>
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  title,
  onClick,
}: {
  icon: typeof Pencil
  title: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-grid h-8 w-8 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function DeleteButton({
  id,
  disabled,
  onDone,
}: {
  id: string
  disabled?: boolean
  onDone: () => void
}) {
  const [busy, setBusy] = useState(false)
  async function handle() {
    if (disabled) return
    if (!confirm("למחוק את איש הצוות?")) return
    setBusy(true)
    const res = await fetch(`/api/team/${id}`, { method: "DELETE" })
    setBusy(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error ?? "שגיאה במחיקה")
      return
    }
    onDone()
  }
  return (
    <button
      onClick={handle}
      disabled={busy || disabled}
      title={disabled ? "לא ניתן למחוק מנהל" : "מחק"}
      className="inline-grid h-8 w-8 place-items-center rounded text-[var(--danger)] hover:bg-[var(--danger-soft)] disabled:opacity-30"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}

function CreateModal({
  roleLabels,
  onClose,
  onDone,
}: {
  roleLabels: string[]
  onClose: () => void
  onDone: () => void
}) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "org_staff">("org_staff")
  const [roleLabel, setRoleLabel] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr("")
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password,
        role,
        roleLabel: roleLabel.trim() || null,
      }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setErr(j.error ?? "שגיאה")
      setBusy(false)
      return
    }
    setBusy(false)
    onDone()
  }

  return (
    <Modal title="הוסף איש צוות" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3 p-5">
        <Field label="שם מלא" required>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="שם של איש הצוות"
            className={inputCls}
          />
        </Field>
        <Field label="אימייל" required>
          <input
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@example.com"
            className={inputCls}
          />
        </Field>
        <Field label="טלפון" required>
          <input
            type="tel"
            required
            inputMode="numeric"
            maxLength={10}
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(normalizePhone(e.target.value))}
            placeholder="0500000000"
            className={inputCls}
          />
        </Field>
        <Field label="סיסמה זמנית" required hint="לפחות 6 תווים">
          <PasswordInput value={password} onChange={setPassword} />
        </Field>
        <Field label="רמת הרשאה">
          <div className="flex gap-2">
            {[
              { v: "org_staff" as const, l: "איש צוות" },
              { v: "admin" as const, l: "ראש שלוחה" },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setRole(opt.v)}
                className={`h-9 flex-1 rounded-md border px-3 text-[13px] transition-colors ${
                  role === opt.v
                    ? "border-accent bg-[var(--accent-soft)] font-medium text-[var(--accent-hover)]"
                    : "border-line text-fg-muted hover:bg-[var(--bg-subtle)]"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </Field>
        <Field
          label="תפקיד מותאם"
          hint={
            roleLabels.length
              ? "בחר מהרשימה או הקלד חופשי"
              : 'אפשר להגדיר בהגדרות → "תפקידי צוות מותאמים"'
          }
        >
          <RoleLabelCombobox
            value={roleLabel}
            onChange={setRoleLabel}
            options={roleLabels}
          />
        </Field>
        {err && <p className="text-[12px] text-[var(--danger)]">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            {busy ? "יוצר…" : "צור"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function EditModal({
  member,
  currentUserId,
  roleLabels,
  onClose,
  onDone,
}: {
  member: TeamMember
  currentUserId: string
  roleLabels: string[]
  onClose: () => void
  onDone: () => void
}) {
  const [fullName, setFullName] = useState(member.full_name ?? "")
  const [phone, setPhone] = useState(member.phone ?? "")
  const [role, setRole] = useState(member.role)
  const [roleLabel, setRoleLabel] = useState(member.role_label ?? "")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const isMe = member.id === currentUserId

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr("")
    const res = await fetch(`/api/team/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        phone,
        role,
        roleLabel: roleLabel.trim() || null,
      }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setErr(j.error ?? "שגיאה")
      setBusy(false)
      return
    }
    setBusy(false)
    onDone()
  }

  return (
    <Modal title={`עריכת ${member.full_name || member.email}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3 p-5">
        <Field label="שם מלא">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="טלפון">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(normalizePhone(e.target.value))}
            placeholder="0500000000"
            className={inputCls}
          />
        </Field>
        <Field label="תפקיד" hint={isMe ? "לא ניתן להוריד את התפקיד של עצמך" : undefined}>
          <div className="flex gap-2">
            {[
              { v: "admin", l: "ראש שלוחה" },
              { v: "org_staff", l: "איש צוות" },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                disabled={isMe}
                onClick={() => setRole(opt.v)}
                className={`h-9 flex-1 rounded-md border px-3 text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  role === opt.v
                    ? "border-accent bg-[var(--accent-soft)] font-medium text-[var(--accent-hover)]"
                    : "border-line text-fg-muted hover:bg-[var(--bg-subtle)]"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </Field>
        <Field
          label="תפקיד מותאם"
          hint={
            roleLabels.length
              ? "בחר מהרשימה או הקלד חופשי"
              : 'אפשר להגדיר תפקידים בהגדרות → "תפקידי צוות מותאמים"'
          }
        >
          <RoleLabelCombobox
            value={roleLabel}
            onChange={setRoleLabel}
            options={roleLabels}
          />
        </Field>
        {err && <p className="text-[12px] text-[var(--danger)]">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? "שומר…" : "שמור"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function ResetPasswordModal({
  member,
  onClose,
}: {
  member: TeamMember
  onClose: () => void
}) {
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr("")
    const res = await fetch(`/api/team/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    setBusy(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setErr(j.error ?? "שגיאה")
      return
    }
    setDone(true)
    setTimeout(onClose, 1200)
  }

  return (
    <Modal
      title={`איפוס סיסמה — ${member.full_name || member.email}`}
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex flex-col gap-3 p-5">
        <Field label="סיסמה חדשה" required hint="לפחות 6 תווים">
          <PasswordInput value={password} onChange={setPassword} />
        </Field>
        {err && <p className="text-[12px] text-[var(--danger)]">{err}</p>}
        {done && (
          <p className="text-[12.5px] text-[var(--stage-accepted-fg)]">
            הסיסמה עודכנה
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]"
          >
            סגור
          </button>
          <button
            type="submit"
            disabled={busy || done}
            className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? "מעדכן…" : "עדכן סיסמה"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
          <h2 className="m-0 truncate text-[15px] font-semibold text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const inputCls =
  "h-10 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"

function PasswordInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        required
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " pe-10"}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        title={show ? "הסתר" : "הצג"}
        className="absolute end-2 top-1/2 inline-grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

// בחירת תפקיד — צ'יפים גלויים תמיד + input חופשי. בלי popover שנחתך במודאל.
function RoleLabelCombobox({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='לדוגמה: "מראיין", "רכז"'
        className={inputCls}
      />
      {options.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {options.map((o) => {
            const selected = o === value
            return (
              <button
                key={o}
                type="button"
                onClick={() => onChange(selected ? "" : o)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] transition-colors ${
                  selected
                    ? "border-accent bg-[var(--accent-soft)] font-medium text-[var(--accent-hover)]"
                    : "border-line bg-surface text-fg-muted hover:bg-[var(--bg-subtle)]"
                }`}
              >
                {selected && <Check className="h-3 w-3" />}
                {o}
              </button>
            )
          })}
          {value && !options.includes(value) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-line bg-[var(--bg-subtle)] px-2.5 py-1 text-[11.5px] text-fg-muted">
              חדש: {value}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[13px] font-medium text-fg">
          {label}
          {required && <span className="ms-1 text-[var(--danger)]">*</span>}
        </label>
        {hint && <span className="text-[11.5px] text-fg-subtle">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
