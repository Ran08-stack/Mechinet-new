"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ChevronLeft, GraduationCap } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("אימייל או סיסמה שגויים")
      setLoading(false)
      return
    }

    router.push("/candidates")
  }

  return (
    <div className="grid min-h-screen font-sans lg:grid-cols-2" dir="rtl">
      {/* Brand pane */}
      <div className="relative hidden flex-col overflow-hidden bg-gradient-to-br from-[#0d2543] via-[#1a2b47] to-[#2d3f60] px-12 pb-9 pt-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 85% 12%, rgba(254,111,66,0.22), transparent 50%), radial-gradient(circle at -5% 110%, rgba(68,221,193,0.14), transparent 55%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03), transparent 60%)",
          }}
        />

        {/* brand head */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-white shadow-[0_6px_14px_rgba(254,111,66,0.35)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="text-[15px] font-semibold leading-tight tracking-[-0.005em]">
            Mechinet
            <span className="mt-0.5 block font-mono text-[10.5px] uppercase tracking-[0.06em] text-white/55">
              ניהול מיונים למכינות קדם־צבאיות
            </span>
          </div>
        </div>

        {/* brand hero */}
        <div className="relative z-10 flex max-w-[480px] flex-1 flex-col justify-center py-8">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-[rgba(68,221,193,0.32)] bg-[rgba(68,221,193,0.10)] px-3 py-[5px] font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--ai-bright)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ai-bright)] shadow-[0_0_0_3px_rgba(68,221,193,0.22)]" />
            מחזור תשפ"ז · רישום פתוח
          </span>

          <h1 className="m-0 mt-[18px] text-[42px] font-bold leading-[1.15] tracking-[-0.02em]">
            סדר<span className="text-accent">.</span>
            <br />
            שקיפות<span className="text-accent">.</span>
            <br />
            החלטות טובות יותר<span className="text-accent">.</span>
          </h1>
          <p className="mt-[18px] text-[17px] leading-[1.6] text-white/[0.78]">
            פלטפורמה אחת שמרכזת את הגיוס שלכם — מהטופס ועד הקבלה. כל מועמד, כל
            הערה, כל החלטה — במקום אחד.
          </p>

          <div className="mt-9 grid grid-cols-3 gap-3">
            {[
              { v: "64", k: "מכינות פעילות" },
              { v: "12,450", k: "טפסים שהוגשו" },
              { v: "78%", k: "השלמת גיוס" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-md border border-white/[0.12] bg-white/[0.06] p-4 backdrop-blur-sm"
              >
                <div className="text-[24px] font-bold tracking-[-0.01em] [font-variant-numeric:tabular-nums]">
                  {s.v}
                </div>
                <div className="mt-0.5 text-[11.5px] text-white/55">{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* testimonial */}
        <div className="relative z-10 mt-auto flex max-w-[480px] items-start gap-3.5 border-t border-white/10 pt-9">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ffb59f] to-[#fe6f42] text-[13px] font-semibold text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.35)]">
            י.ב
          </span>
          <div>
            <blockquote className="m-0 text-[13.5px] italic leading-[1.6] text-white/85">
              &quot;במחזור הראשון עם Mechinet חסכנו 40 שעות בשבוע על תיאומים.
              סוף סוף אנחנו מתעסקים במועמדים — לא בגיליונות אקסל.&quot;
            </blockquote>
            <cite className="mt-1.5 block font-mono text-[11.5px] not-italic text-white/55">
              — יואב ברגר · מנהל מכינה · 2026
            </cite>
          </div>
        </div>
      </div>

      {/* Form pane */}
      <div className="flex flex-col bg-bg p-8 sm:p-12">
        <div className="m-auto flex w-full max-w-[420px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[32px] font-semibold leading-[1.15] tracking-[-0.015em] text-primary">
              ברוכים השבים
            </h1>
            <p className="m-0 text-[15px] leading-[1.55] text-fg-muted">
              היכנסו כדי להמשיך בניהול מחזור הגיוס שלכם.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="em" className="text-[13px] font-medium text-fg">
                אימייל ארגוני
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                <input
                  id="em"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mechina.org.il"
                  className="h-[46px] w-full rounded-md border border-line bg-surface ps-10 pe-3.5 text-[14px] text-fg outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-accent focus:shadow-[var(--shadow-focus)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pw" className="text-[13px] font-medium text-fg">
                סיסמה
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                <input
                  id="pw"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-[46px] w-full rounded-md border border-line bg-surface ps-10 pe-11 text-[14px] text-fg outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-accent focus:shadow-[var(--shadow-focus)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "הסתר סיסמה" : "הצג סיסמה"}
                  className="absolute end-3 top-1/2 -translate-y-1/2 rounded p-1 text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="m-0 text-[13px] text-[var(--danger)]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-md bg-accent text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(254,111,66,0.25)] transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "נכנס..." : "כניסה למערכת"}
              {!loading && <ChevronLeft className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
