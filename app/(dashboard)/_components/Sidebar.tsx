"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Calendar,
  LogOut,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const nav = [
  {
    group: "ניווט",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "לוח בקרה" },
      { href: "/candidates", icon: Users, label: "מועמדים" },
      { href: "/calendar", icon: Calendar, label: "יומן" },
      { href: "/forms", icon: FileText, label: "טפסים" },
    ],
  },
  {
    group: "ארגון",
    items: [
      { href: "/team", icon: Building2, label: "אנשי צוות" },
      { href: "/settings", icon: Settings, label: "הגדרות" },
    ],
  },
]

export function Sidebar({
  accountName,
  roleLabel,
  orgName,
  branchName,
  orgLogoUrl,
}: {
  accountName?: string
  roleLabel?: string
  orgName?: string | null
  branchName?: string | null
  orgLogoUrl?: string | null
}) {
  const pathname = usePathname()
  const displayName = orgName?.trim() || accountName || "משתמש"
  const initial = displayName.charAt(0) || "מ"
  const subLabel = branchName?.trim() || "MECHINET · ACADEMY"

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-[248px] flex-col border-s border-line bg-[var(--surface-2)]">
      {/* Header — לוגו + שם המכינה, באותה גובה של ה-Topbar */}
      <div className="flex h-[60px] flex-shrink-0 items-center gap-2.5 border-b border-line px-4">
        {orgLogoUrl ? (
          <img
            src={orgLogoUrl}
            alt={displayName}
            className="h-8 w-8 shrink-0 rounded-md object-cover shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          />
        ) : (
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-[14px] font-bold text-[var(--fg-on-accent)]">
            {initial}
          </div>
        )}
        <div className="flex min-w-0 flex-col leading-tight">
          <b className="truncate text-[14px] font-semibold text-primary">
            {displayName}
          </b>
          <span
            className={`truncate text-[10.5px] text-fg-subtle ${
              branchName ? "" : "uppercase tracking-[0.06em]"
            }`}
          >
            {subLabel}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3.5">
        {nav.map((g, gi) => (
          <div key={g.group} className={gi ? "mt-4" : ""}>
            <div className="px-2.5 pb-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
              {g.group}
            </div>
            {g.items.map(({ href, icon: Icon, label }) => {
              const active =
                pathname === href || pathname?.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group relative flex h-8 items-center gap-2.5 rounded-md border border-transparent px-2.5 text-[13px] font-medium transition-colors",
                    active
                      ? "border-line bg-surface text-fg shadow-[var(--shadow-xs)]"
                      : "text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-fg"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-accent opacity-100" : "opacity-90"
                    )}
                  />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <UserBlock accountName={accountName ?? ""} roleLabel={roleLabel} />
    </aside>
  )
}

function UserBlock({
  accountName,
  roleLabel,
}: {
  accountName: string
  roleLabel?: string
}) {
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="border-t border-line p-2.5">
      <div className="flex w-full items-center gap-2.5 rounded-md p-2">
        <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ffb59f] to-[#fe6f42] text-[12px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.4)]">
          {(accountName || "מ").charAt(0).toUpperCase()}
        </span>
        <span className="flex min-w-0 flex-col leading-tight text-start">
          <b className="truncate text-[13px] font-semibold">
            {roleLabel ?? "משתמש"}
          </b>
          <span className="truncate text-[11px] text-fg-subtle">
            {accountName || ""}
          </span>
        </span>
        <button
          onClick={logout}
          title="התנתקות"
          className="ms-auto inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-[var(--danger)]"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
