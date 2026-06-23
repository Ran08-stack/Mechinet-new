"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Accessibility,
  X,
  Type,
  Contrast,
  Link2,
  WandSparkles,
  RotateCcw,
  FileText,
} from "lucide-react"

// תפריט נגישות אחיד לכל האתר — נטען ב-root layout, מופיע בכל הדפים.
// ההגדרות נשמרות ב-localStorage (אותו מפתח לכל הצדדים) ומוחלות כ-classes על <html>.
// הצהרת הנגישות נמצאת ב-/accessibility.

const STORAGE_KEY = "mechinet-a11y-v1"

type TextSize = "default" | "large" | "xlarge"
type Settings = {
  textSize: TextSize
  highContrast: boolean
  emphasizeLinks: boolean
  noMotion: boolean
}

const DEFAULT: Settings = {
  textSize: "default",
  highContrast: false,
  emphasizeLinks: false,
  noMotion: false,
}

function applySettings(s: Settings) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.classList.toggle("a11y-text-large", s.textSize === "large")
  root.classList.toggle("a11y-text-xlarge", s.textSize === "xlarge")
  root.classList.toggle("a11y-high-contrast", s.highContrast)
  root.classList.toggle("a11y-emphasize-links", s.emphasizeLinks)
  root.classList.toggle("a11y-no-motion", s.noMotion)
}

export function AccessibilityMenu() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>(DEFAULT)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  // טעינה ראשונית מ-localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = { ...DEFAULT, ...(JSON.parse(raw) as Partial<Settings>) }
        setSettings(parsed)
        applySettings(parsed)
      }
    } catch {}
    setMounted(true)
  }, [])

  // עדכון storage + classes בכל שינוי
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {}
    applySettings(settings)
  }, [settings, mounted])

  // Escape לסגירה + סגירה בלחיצה מחוץ
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onClick(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node) && e.target !== buttonRef.current) {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [open])

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }))
  }
  function reset() {
    setSettings(DEFAULT)
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="פתח תפריט נגישות"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="fixed bottom-4 end-4 z-[100] grid h-12 w-12 place-items-center rounded-full bg-[#1463c7] text-white shadow-[0_8px_24px_-6px_rgba(20,99,199,0.5)] outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#1463c7]/40"
      >
        <Accessibility className="h-6 w-6" />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-labelledby="a11y-title"
          dir="rtl"
          className="fixed bottom-20 end-4 z-[100] w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-surface shadow-[0_20px_50px_-12px_rgba(15,20,35,0.35)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--line-faint)] bg-[#1463c7] px-4 py-3 text-white">
            <h2 id="a11y-title" className="m-0 inline-flex items-center gap-2 text-[14px] font-semibold">
              <Accessibility className="h-4 w-4" />
              נגישות באתר
            </h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="סגור"
              className="inline-grid h-7 w-7 place-items-center rounded text-white/85 hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4 p-4">
            <fieldset className="flex flex-col gap-1.5 border-0 p-0">
              <legend className="mb-1 inline-flex items-center gap-1.5 text-[12px] font-semibold text-fg-muted">
                <Type className="h-3.5 w-3.5" />
                גודל טקסט
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { v: "default", label: "רגיל" },
                    { v: "large", label: "גדול" },
                    { v: "xlarge", label: "גדול מאוד" },
                  ] as const
                ).map((opt) => {
                  const active = settings.textSize === opt.v
                  return (
                    <button
                      key={opt.v}
                      onClick={() => update("textSize", opt.v)}
                      aria-pressed={active}
                      className={`h-9 rounded-md border text-[12.5px] font-medium transition-colors ${
                        active
                          ? "border-[#1463c7] bg-[#1463c7] text-white"
                          : "border-line bg-surface text-fg-muted hover:bg-[var(--bg-subtle)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <Toggle
              icon={<Contrast className="h-3.5 w-3.5" />}
              label="ניגודיות גבוהה"
              checked={settings.highContrast}
              onChange={(v) => update("highContrast", v)}
            />
            <Toggle
              icon={<Link2 className="h-3.5 w-3.5" />}
              label="הדגשת קישורים"
              checked={settings.emphasizeLinks}
              onChange={(v) => update("emphasizeLinks", v)}
            />
            <Toggle
              icon={<WandSparkles className="h-3.5 w-3.5" />}
              label="ביטול אנימציות"
              checked={settings.noMotion}
              onChange={(v) => update("noMotion", v)}
            />

            <div className="flex items-center justify-between gap-2 border-t border-[var(--line-faint)] pt-3">
              <button
                onClick={reset}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] text-fg-muted hover:bg-[var(--bg-subtle)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                איפוס
              </button>
              <Link
                href="/accessibility"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--bg-subtle)] px-3 text-[12.5px] font-medium text-primary hover:bg-[var(--bg-muted)]"
                onClick={() => setOpen(false)}
              >
                <FileText className="h-3.5 w-3.5" />
                הצהרת נגישות
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Toggle({
  icon, label, checked, onChange,
}: {
  icon: React.ReactNode
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2.5 text-start hover:bg-[var(--bg-subtle)]"
    >
      <span className="inline-flex items-center gap-2 text-[13px] text-fg">
        <span className="text-fg-muted">{icon}</span>
        {label}
      </span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-[#1463c7]" : "bg-[var(--bg-muted)]"}`}
      >
        <span
          className={`absolute top-[2px] grid h-4 w-4 place-items-center rounded-full bg-white shadow transition-[inset-inline-end] ${
            checked ? "end-[2px]" : "end-[18px]"
          }`}
        />
      </span>
    </button>
  )
}
