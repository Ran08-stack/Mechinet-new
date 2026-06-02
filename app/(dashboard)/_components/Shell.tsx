"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Sidebar } from "./Sidebar"

export function Shell({
  accountName,
  roleLabel,
  orgName,
  branchName,
  orgLogoUrl,
  children,
}: {
  accountName: string
  roleLabel: string
  orgName: string | null
  branchName: string | null
  orgLogoUrl: string | null
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div
      className="grid min-h-screen grid-cols-1 md:grid-cols-[248px_1fr] bg-bg font-sans text-fg"
      dir="rtl"
    >
      <div
        className={`fixed inset-y-0 start-0 z-50 transition-transform shadow-2xl md:shadow-none md:static md:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar
          accountName={accountName}
          roleLabel={roleLabel}
          orgName={orgName}
          branchName={branchName}
          orgLogoUrl={orgLogoUrl}
        />
      </div>

      {open && (
        <button
          aria-label="סגור תפריט"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="פתח תפריט"
          className="fixed start-2 top-2.5 z-[60] inline-flex h-11 max-w-[60vw] items-center gap-2 rounded-md border border-line bg-surface px-2 text-fg shadow-sm md:hidden"
        >
          {orgLogoUrl ? (
            <img
              src={orgLogoUrl}
              alt={orgName ?? ""}
              className="h-7 w-7 shrink-0 rounded object-cover"
            />
          ) : (
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded bg-accent text-[12px] font-bold text-white">
              {(orgName ?? accountName ?? "מ").charAt(0)}
            </div>
          )}
          <span className="truncate text-[13px] font-semibold text-primary">
            {orgName ?? accountName}
          </span>
          <Menu className="h-4 w-4 shrink-0 text-fg-muted" />
        </button>
      )}

      {open && (
        <button
          onClick={() => setOpen(false)}
          aria-label="סגור תפריט"
          className="fixed start-3 top-3 z-[60] inline-grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-fg shadow-sm md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <main className="flex min-h-screen flex-col overflow-auto">
        {children}
      </main>
    </div>
  )
}
