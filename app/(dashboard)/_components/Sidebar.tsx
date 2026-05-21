"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Columns3,
  FileText,
  Settings,
  Calendar,
  ChevronsUpDown,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  {
    group: "ניווט",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "לוח בקרה" },
      { href: "/candidates", icon: Users, label: "מועמדים" },
      { href: "/pipeline", icon: Columns3, label: "פייפליין" },
      { href: "/calendar", icon: Calendar, label: "יומן" },
      { href: "/forms", icon: FileText, label: "טפסים" },
    ],
  },
  {
    group: "ארגון",
    items: [{ href: "/settings", icon: Settings, label: "הגדרות" }],
  },
]

type SidebarProps = {
  orgName: string
  orgLogoUrl: string | null
  userEmail: string
}

export function Sidebar({ orgName, orgLogoUrl, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const initial = orgName.trim().charAt(0) || "מ"
  const userInitials = userEmail.charAt(0).toUpperCase() || "מ"

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] flex-col border-s border-line bg-[var(--surface-2)]">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
        {orgLogoUrl ? (
          <img
            src={orgLogoUrl}
            alt={orgName}
            className="h-7 w-7 shrink-0 rounded-md object-cover shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          />
        ) : (
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent text-[13px] font-bold text-[var(--fg-on-accent)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            {initial}
          </div>
        )}
        <div className="flex min-w-0 flex-col leading-tight">
          <b className="truncate text-[15px] font-semibold tracking-tight">
            {orgName}
          </b>
          <span className="text-[11px] text-fg-subtle">חשבון מכינה</span>
        </div>
        <button className="ms-auto grid h-6 w-6 place-items-center rounded text-[var(--fg-faint)] hover:bg-[var(--bg-muted)] hover:text-fg-muted">
          <ChevronsUpDown className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3.5">
        {nav.map((g, gi) => (
          <div key={g.group} className={gi ? "mt-4" : ""}>
            <div className="px-2.5 pb-2 text-[11px] font-medium text-fg-subtle">
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

      {/* User */}
      <div className="border-t border-line p-2.5">
        <button className="flex w-full items-center gap-2.5 rounded-md p-2 hover:bg-[var(--bg-subtle)]">
          <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ffb59f] to-[#fe6f42] text-[12px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.4)]">
            {userInitials}
          </span>
          <span className="flex min-w-0 flex-col leading-tight text-start">
            <b className="truncate text-[13px] font-semibold">מנהל מכינה</b>
            <span className="truncate text-[11px] text-fg-subtle [direction:ltr]">
              {userEmail}
            </span>
          </span>
          <MoreHorizontal className="ms-auto h-4 w-4 text-[var(--fg-faint)]" />
        </button>
      </div>
    </aside>
  )
}
