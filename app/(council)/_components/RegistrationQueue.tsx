"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
} from "lucide-react"
import type { RequestedBranch } from "@/types/registration"

export type PendingRequest = {
  id: string
  academyName: string
  contactName: string
  contactEmail: string
  contactPhone: string | null
  notes: string | null
  createdAt: string
  branches: RequestedBranch[]
}

type ApproveResult = {
  ok: boolean
  orgsCreated?: number
  orgsLinked?: number
  invitesSent?: number
  invitesFailed?: number
  error?: string
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export function RegistrationQueue({ requests }: { requests: PendingRequest[] }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  async function callApi(id: string, action: "approve" | "reject", body?: { reason?: string }) {
    setBusy(id)
    setToast(null)
    try {
      const res = await fetch(`/api/council/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      })
      const data: ApproveResult = await res.json().catch(() => ({ ok: false }))
      if (!res.ok || !data.ok) {
        setToast({ kind: "err", text: data.error || "אירעה שגיאה. נסה שוב." })
        return
      }
      if (action === "approve") {
        const total = (data.orgsCreated ?? 0) + (data.orgsLinked ?? 0)
        const inviteMsg = data.invitesFailed
          ? `ההזמנה למנהל נכשלה (${data.error ?? ""})`
          : "נשלחה הזמנה למנהל"
        setToast({
          kind: data.invitesFailed ? "err" : "ok",
          text: `הוקמו ${total} שלוחות · ${inviteMsg}`,
        })
      } else {
        setToast({ kind: "ok", text: "הבקשה נדחתה" })
      }
      setRejecting(null)
      setReason("")
      router.refresh()
    } catch {
      setToast({ kind: "err", text: "אירעה שגיאה. נסה שוב." })
    } finally {
      setBusy(null)
    }
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface px-8 py-12 text-center text-[13px] text-fg-muted">
        אין בקשות רישום ממתינות
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div
          className={`rounded-md border px-4 py-2.5 text-[13px] ${
            toast.kind === "ok"
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-hover)]"
              : "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="m-0 text-[15px] font-semibold text-primary">
            ממתינות לאישור · {requests.length}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["מכינה", "איש קשר", "אימייל", "שלוחות", "תאריך", ""].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-start font-mono text-[11px] font-medium uppercase tracking-[var(--tracking-caps)] text-fg-subtle"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const isOpen = expanded === r.id
                const isBusy = busy === r.id
                const isRejecting = rejecting === r.id
                return (
                  <RegistrationRow
                    key={r.id}
                    r={r}
                    isOpen={isOpen}
                    isBusy={isBusy}
                    isRejecting={isRejecting}
                    reason={reason}
                    onToggle={() => setExpanded(isOpen ? null : r.id)}
                    onApprove={() => callApi(r.id, "approve")}
                    onStartReject={() => {
                      setRejecting(r.id)
                      setReason("")
                    }}
                    onCancelReject={() => setRejecting(null)}
                    onReasonChange={setReason}
                    onConfirmReject={() => callApi(r.id, "reject", { reason })}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RegistrationRow({
  r,
  isOpen,
  isBusy,
  isRejecting,
  reason,
  onToggle,
  onApprove,
  onStartReject,
  onCancelReject,
  onReasonChange,
  onConfirmReject,
}: {
  r: PendingRequest
  isOpen: boolean
  isBusy: boolean
  isRejecting: boolean
  reason: string
  onToggle: () => void
  onApprove: () => void
  onStartReject: () => void
  onCancelReject: () => void
  onReasonChange: (v: string) => void
  onConfirmReject: () => void
}) {
  return (
    <>
      <tr className="border-b border-[var(--line-faint)] hover:bg-[var(--bg-subtle)]">
        <td className="px-4 py-3.5">
          <button onClick={onToggle} className="flex items-center gap-2 text-start">
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-fg-faint" />
            ) : (
              <ChevronDown className="h-4 w-4 text-fg-faint" />
            )}
            <b className="text-[13.5px] font-semibold leading-tight text-fg">{r.academyName}</b>
          </button>
        </td>
        <td className="px-4 py-3.5 text-fg-muted">{r.contactName}</td>
        <td className="px-4 py-3.5 font-mono text-[12px] text-fg-muted [direction:ltr] text-start">
          {r.contactEmail}
        </td>
        <td className="px-4 py-3.5 font-mono text-[14px] font-semibold text-primary [font-variant-numeric:tabular-nums]">
          {r.branches.length}
        </td>
        <td className="px-4 py-3.5 font-mono text-[12px] text-fg-muted [font-variant-numeric:tabular-nums]">
          {formatDate(r.createdAt)}
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onApprove}
              disabled={isBusy}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-[12px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              {isBusy ? "מקים..." : "אשר והקם חשבונות"}
            </button>
            <button
              onClick={onStartReject}
              disabled={isBusy}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)] disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
              דחה
            </button>
          </div>
        </td>
      </tr>

      {isRejecting && (
        <tr className="border-b border-[var(--line-faint)] bg-[var(--bg-subtle)]">
          <td colSpan={6} className="px-4 py-3.5">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <input
                type="text"
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="סיבת הדחייה (אופציונלי)"
                className="h-9 min-w-[240px] flex-1 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
              />
              <button
                onClick={onCancelReject}
                disabled={isBusy}
                className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-surface disabled:opacity-60"
              >
                ביטול
              </button>
              <button
                onClick={onConfirmReject}
                disabled={isBusy}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--danger)] px-4 text-[13px] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
              >
                {isBusy ? "דוחה..." : "אשר דחייה"}
              </button>
            </div>
          </td>
        </tr>
      )}

      {isOpen && (
        <tr className="border-b border-[var(--line-faint)] bg-[var(--bg-subtle)]">
          <td colSpan={6} className="px-4 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[12.5px] text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-fg-faint" />
                  <span className="font-mono [direction:ltr]">{r.contactEmail}</span>
                </span>
                {r.contactPhone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-fg-faint" />
                    <span className="font-mono [direction:ltr]">{r.contactPhone}</span>
                  </span>
                )}
              </div>

              {r.notes && (
                <p className="m-0 rounded-md bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-fg-muted">
                  {r.notes}
                </p>
              )}

              <div className="font-mono text-[10.5px] uppercase tracking-[var(--tracking-caps)] text-fg-subtle">
                שלוחות מבוקשות · {r.branches.length}
              </div>
              <div className="flex flex-col gap-1.5">
                {r.branches.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2 text-[12.5px]"
                  >
                    <Building2 className="h-3.5 w-3.5 text-fg-faint" />
                    <b className="font-semibold text-fg">{b.branch_name}</b>
                    {b.city && (
                      <span className="inline-flex items-center gap-1 text-fg-muted">
                        <MapPin className="h-3 w-3 text-fg-faint" />
                        {b.city}
                      </span>
                    )}
                    {b.link_org_id && (
                      <span className="ms-auto rounded-full border border-[var(--primary-line)] bg-[var(--primary-soft)] px-2 py-0.5 font-mono text-[10.5px] text-primary">
                        קישור לשלוחה קיימת
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
