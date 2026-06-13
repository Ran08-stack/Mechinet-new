"use client"

import { ReactNode, useState, useEffect } from "react"
import { Bell, HelpCircle, X } from "lucide-react"
import { QuickSearch } from "./QuickSearch"
import { createClient } from "@/lib/supabase/client"

// Topbar עליון — מופיע בכל מסכי המכינה.
// crumb משתנה לפי המסך. orgName/action אופציונליים.
// כשמועברים rightLabel — מוצג מימין במקום ה-breadcrumb (משמש בלוח הבקרה כשם המכינה).
// פעמון ההתראות טוען הודעות מועצה שמכוונות לשלוחה (RLS) ושלא נקראו, ומסמן כנקרא בפתיחה.

type Announcement = { id: string; title: string; body: string; created_at: string }

export function Topbar({
  crumb,
  action,
  rightLabel,
}: {
  crumb?: string
  action?: ReactNode
  rightLabel?: { title: string; subtitle?: string }
}) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [unread, setUnread] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let active = true
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const uid = session?.user?.id
      if (!uid || !active) return
      setUserId(uid)
      // הודעות שמכוונות לשלוחה (RLS מסנן) פחות אלו שכבר נקראו ע"י המשתמש.
      const [{ data: anns }, { data: reads }] = await Promise.all([
        supabase
          .from("announcements")
          .select("id, title, body, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("announcement_reads").select("announcement_id"),
      ])
      if (!active) return
      const readSet = new Set((reads ?? []).map((r) => r.announcement_id))
      const items = (anns ?? [])
        .filter((a) => !readSet.has(a.id))
        .slice(0, 20)
        .map((a) => ({ id: a.id, title: a.title, body: a.body, created_at: a.created_at }))
      setAnnouncements(items)
      setUnread(items.length)
    })()
    return () => {
      active = false
    }
  }, [])

  async function toggleNotif() {
    const opening = !notifOpen
    setNotifOpen(opening)
    if (opening && unread > 0 && userId && announcements.length > 0) {
      setUnread(0)
      const supabase = createClient()
      await supabase
        .from("announcement_reads")
        .upsert(
          announcements.map((a) => ({ announcement_id: a.id, user_id: userId })),
          { onConflict: "announcement_id,user_id" }
        )
    }
  }

  return (
    <div className="relative flex h-[60px] flex-shrink-0 items-center gap-2 border-b border-line bg-[var(--surface-2)] px-3 md:gap-3.5 md:px-7">
      {/* צד ימין */}
      {rightLabel ? (
        <div className="flex min-w-0 flex-col items-end text-end leading-tight">
          <b className="truncate text-[14px] font-semibold text-primary">
            {rightLabel.title}
          </b>
          {rightLabel.subtitle && (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
              {rightLabel.subtitle}
            </span>
          )}
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-2 text-[13px] text-fg-subtle">
          <span>ניווט</span>
          <span className="text-[var(--fg-faint)]">/</span>
          <span className="font-medium text-fg">{crumb}</span>
        </div>
      )}

      {/* אמצע — חיפוש מהיר */}
      <div className="mx-auto hidden md:block">
        <QuickSearch />
      </div>

      {/* צד שמאל */}
      <div className="ms-auto md:ms-0 flex items-center gap-2">
        {/* עזרה */}
        <div className="relative">
          <button
            onClick={() => setHelpOpen((v) => !v)}
            aria-label="עזרה"
            className="inline-grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
          {helpOpen && (
            <div className="fixed end-3 top-14 z-50 max-w-[calc(100vw-1.5rem)] md:absolute md:end-0 md:top-9 w-[280px] overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]">
              <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-4 py-3">
                <span className="text-[13px] font-semibold text-primary">
                  עזרה
                </span>
                <button
                  onClick={() => setHelpOpen(false)}
                  className="inline-grid h-6 w-6 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-2 px-4 py-3 text-[12.5px] text-fg-muted">
                <p className="m-0">
                  Mechinet — מערכת לניהול מועמדויות במכינות קדם-צבאיות.
                </p>
                <p className="m-0">
                  לשאלות ותמיכה: <a href="mailto:support@mechinet.app" className="text-accent">support@mechinet.app</a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* התראות */}
        <div className="relative">
          <button
            onClick={toggleNotif}
            aria-label="התראות"
            className="relative inline-grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
          >
            <Bell className="h-3.5 w-3.5" />
            {unread > 0 && (
              <span className="absolute -end-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="fixed end-3 top-14 z-50 max-w-[calc(100vw-1.5rem)] md:absolute md:end-0 md:top-9 w-[300px] overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]">
              <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-4 py-3">
                <span className="text-[13px] font-semibold text-primary">
                  התראות
                </span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="inline-grid h-6 w-6 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {announcements.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[12.5px] text-fg-subtle">
                    אין התראות חדשות
                  </div>
                ) : (
                  announcements.map((a) => (
                    <div
                      key={a.id}
                      className="border-b border-[var(--line-faint)] px-4 py-3 last:border-b-0"
                    >
                      <div className="text-[13px] font-medium text-fg">{a.title}</div>
                      <div className="mt-0.5 whitespace-pre-line text-[12px] leading-relaxed text-fg-muted">
                        {a.body}
                      </div>
                      <div className="mt-1 font-mono text-[10.5px] text-fg-subtle">
                        {new Date(a.created_at).toLocaleDateString("he-IL")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {action}
      </div>
    </div>
  )
}
