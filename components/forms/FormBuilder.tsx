"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { FormField, Form } from "@/types/database"

const FIELD_TYPES = [
  { value: "text", label: "טקסט קצר" },
  { value: "textarea", label: "טקסט ארוך" },
  { value: "select", label: "בחירה יחידה" },
  { value: "multiselect", label: "בחירה מרובה" },
  { value: "autocomplete", label: "רשימה עם חיפוש" },
  { value: "date", label: "תאריך" },
  { value: "number", label: "מספר" },
  { value: "file", label: "העלאת קובץ" },
  { value: "video", label: "העלאת וידאו" },
] as const

const ISRAEL_CITIES_DEFAULT = [
  "אבו גוש", "אור יהודה", "אור עקיבא", "אילת", "אלעד", "אריאל", "אשדוד", "אשקלון",
  "באקה אל-גרביה", "באר שבע", "בית שאן", "בית שמש", "ביתר עילית", "בני ברק", "בני עי\"ש",
  "בת ים", "גבעת שמואל", "גבעתיים", "גדרה", "דימונה", "הוד השרון", "הרצליה", "חדרה",
  "חולון", "חיפה", "טבריה", "טייבה", "טירה", "טירת כרמל", "טמרה", "יבנה", "יהוד-מונוסון",
  "יקנעם עילית", "ירושלים", "כפר יונה", "כפר סבא", "כפר קאסם", "כרמיאל", "לוד", "מגדל העמק",
  "מודיעין-מכבים-רעות", "מודיעין עילית", "מעלה אדומים", "מעלות-תרשיחא", "נהריה", "נס ציונה",
  "נצרת", "נצרת עילית", "נשר", "נתיבות", "נתניה", "עכו", "עפולה", "ערד", "פתח תקווה",
  "צפת", "קלנסווה", "קריית אונו", "קריית אתא", "קריית ביאליק", "קריית גת", "קריית מוצקין",
  "קריית מלאכי", "קריית שמונה", "ראש העין", "ראשון לציון", "רהט", "רחובות", "רמלה",
  "רמת גן", "רמת השרון", "רעננה", "שדרות", "תל אביב-יפו", "תל מונד",
]

const ISRAEL_SCHOOLS_DEFAULT = [
  // צפון
  "אורט השומרון | אזור השומרון",
  "אורט אמירים | בית שאן",
  "גימנסיה | חדרה",
  "עמל למדעים ואמנויות | חדרה",
  "תיכון חדרה | חדרה",
  "תיכון חדרה בית אליעזר | חדרה",
  "הריאלי העברי | חיפה",
  "ליאו באק | חיפה",
  "עירוני א | חיפה",
  "עירוני ג | חיפה",
  "עירוני ד | חיפה",
  "עירוני ה | חיפה",
  "רעות לאמנויות | חיפה",
  "מקיף ק. חיים | חיפה",
  "אורט טבריה | טבריה",
  "ברנקו וייס | טבריה",
  "עמל נופרים | טבריה",
  "יגאל אלון | יקנעם עילית",
  "אורט בראודה | כרמיאל",
  "אורט כרמים | כרמיאל",
  "אורט פסגות | כרמיאל",
  "מדעים ואמנויות | נהריה",
  "עמל פסגות | נהריה",
  "שחקים | נהריה",
  "אורט שרת | נצרת עילית",
  "יגאל אלון | נצרת עילית",
  "קשת | נצרת עילית",
  "מקיף נשר | נשר",
  "אורט מרום | עכו",
  "כ\"ג יורדי הסירה | עכו",
  "אורט אלון | עפולה",
  "אורט עפולה | עפולה",
  "מקיף משגב | עצמון",
  "בגין | פרדס חנה-כרכור",
  "נופי גולן | קצרין",
  "אורט | קרית ביאליק",
  "אנקורי | קרית ביאליק",
  "אורט | קרית מוצקין",
  "גימנסיה | קרית מוצקין",
  "ברנקו וייס | קרית שמונה",
  "דנציגר | קרית שמונה",
  "אורט שלומי | שלומי",
  // מרכז — תל אביב
  "גימנסיה הרצליה | תל אביב",
  "אורט גאולה | תל אביב",
  "אורט סינגלובסקי | תל אביב",
  "עירוני א לאמנויות | תל אביב",
  "עירוני ד | תל אביב",
  "עירוני ה | תל אביב",
  "עירוני ו | תל אביב",
  "עירוני ט | תל אביב",
  "עירוני יא | תל אביב",
  "שבח מופת | תל אביב",
  "תיכון טכנולוגי נעמ\"ת | תל אביב",
  // מרכז — שאר
  "אורט מיטרני | חולון",
  "אורט למדע וטכנולוגיה | חולון",
  "הרצוג | חולון",
  "יצחק נבון | חולון",
  "קציר | חולון",
  "אורט מלטון | בת ים",
  "עירוני א חשמונאים | בת ים",
  "רמת יוסף | בת ים",
  "שזר | בת ים",
  "אהל שם | רמת גן",
  "אורט אבין | רמת גן",
  "בליך | רמת גן",
  "גימנסיה מודיעים | רמת גן",
  "זומר | רמת גן",
  "אורט טכניקום | גבעתיים",
  "תלמה ילין | גבעתיים",
  "שמעון בן צבי | גבעתיים",
  "קלעי | גבעתיים",
  "יגאל אלון | רמת השרון",
  "הכפר הירוק | רמת השרון",
  "רוטברג | רמת השרון",
  "מרום | רמת השרון",
  "אוסטרובסקי | רעננה",
  "אנקורי | רעננה",
  "מיתרים | רעננה",
  "תיכון אביב | רעננה",
  "גלילי | כפר סבא",
  "כצנלסון | כפר סבא",
  "אורט שפירא | כפר סבא",
  "חיים הרצוג | כפר סבא",
  "יצחק רבין | כפר סבא",
  "הדרים | הוד השרון",
  "מוסינזון | הוד השרון",
  "אילן רמון | הוד השרון",
  "מקיף אריאל | אריאל",
  "אחד העם | פתח תקווה",
  "בן גוריון | פתח תקווה",
  "ברנר | פתח תקווה",
  "יצחק שמיר | פתח תקווה",
  "הגימנסיה העברית | ירושלים",
  "אורט רמות | ירושלים",
  "מקיף גילה | ירושלים",
  "בויאר | ירושלים",
  "עמית טכנולוגי | ירושלים",
  "רעות | ירושלים",
  "גימנסיה | נתניה",
  "אורט גוטמן | נתניה",
  "טשרנחובסקי | נתניה",
  "משה שרת | נתניה",
  "הדרים | באר יעקב",
  "ז'בוטינסקי | באר יעקב",
  "מקיף יהוד | יהוד",
  "תיכון מכבים רעות | מודיעין",
  "עירוני א | מודיעין",
  "ברנקו וייס | מודיעין",
  "אורט מקס שיין | רחובות",
  "דה שליט | רחובות",
  "עמל זיו | רחובות",
  "קציר | רחובות",
  "גימנסיה לילינטל | רמלה",
  "יגאל אלון | רמלה",
  "עמל רמלה | רמלה",
  "בגין | ראש העין",
  "מקיף א | ראשון לציון",
  "גימנסיה ריאלית | ראשון לציון",
  "יגאל אלון | ראשון לציון",
  "אורט לוד | לוד",
  "תיכון טכנולוגי עמל | לוד",
  "הראל | מבשרת ציון",
  "תיכון אזורי | מודיעין עילית",
  "בגין | גדרה",
  "רבין | גן יבנה",
  "תיכון גני תקווה | גני תקווה",
  "הדרים | נס ציונה",
  "אורט למינהל טכני | ראשון לציון",
  // דרום
  "גימנסיה | באר שבע",
  "טוביהו | באר שבע",
  "מקיף א | באר שבע",
  "מקיף ג | באר שבע",
  "מקיף ו | באר שבע",
  "רבין | באר שבע",
  "עמל הנדסה | באר שבע",
  "עמל רמות | באר שבע",
  "רגר | באר שבע",
  "מקיף א | אשדוד",
  "מקיף ג | אשדוד",
  "מקיף ד | אשדוד",
  "מקיף ה | אשדוד",
  "אורט ימי | אשדוד",
  "אנקורי | אשדוד",
  "אורט אדיבי | אשקלון",
  "אורט אפרידר | אשקלון",
  "מקיף א | אשקלון",
  "מקיף ד | אשקלון",
  "אפלמן | דימונה",
  "זילמן | דימונה",
  "עמל אחווה | דימונה",
  "אורט ספיר | ירוחם",
  "אורט טכנולוגי | קרית גת",
  "גרוס | קרית גת",
  "רבין | קרית גת",
  "זאב בוים | קרית גת",
  "גימנסיה דרכא | קרית מלאכי",
  "גוטוירט | שדרות",
  "בגין | אילת",
  "רבין | אילת",
  "גולדווטר | אילת",
  "עתיד | אופקים",
  "דרכא | נתיבות",
  // חינוך מיוחד
  "בית ספר לחינוך מיוחד | כללי",
  "מרכז חינוכי טיפולי | כללי",
  "בית ספר לאוטיזם | כללי",
  "מסגרת לחינוך מיוחד | כללי",
  // ייחודיים
  "בית ספר דמוקרטי | כללי",
  "בית ספר ניסויי | כללי",
  "בית ספר בינלאומי | כללי",
  "ולדורף | כללי",
  "חינוך ביתי | כללי",
]

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function FieldTypeIcon({ type }: { type: FormField["type"] }) {
  const icons: Record<FormField["type"], string> = {
    text: "Aa",
    textarea: "¶",
    select: "◉",
    multiselect: "☑",
    date: "📅",
    number: "#",
    file: "📎",
    video: "▶",
    autocomplete: "🔎",
  }
  return (
    <span className="w-6 text-center font-mono text-xs text-fg-subtle">
      {icons[type]}
    </span>
  )
}

function AutocompleteFieldEditor({
  field,
  onUpdate,
}: {
  field: FormField
  onUpdate: (id: string, updates: Partial<FormField>) => void
}) {
  const [newItem, setNewItem] = useState("")
  const [showAll, setShowAll] = useState(false)

  const baseList =
    field.autocomplete_list === "cities"
      ? ISRAEL_CITIES_DEFAULT
      : field.autocomplete_list === "schools"
      ? ISRAEL_SCHOOLS_DEFAULT
      : []

  // options = תוספות של המשתמש מעבר לרשימה הבסיסית
  const extras = field.options ?? []
  const fullList = [...baseList, ...extras]
  const displayList = showAll ? fullList : fullList.slice(0, 10)

  function addItem() {
    const val = newItem.trim()
    if (!val || fullList.includes(val)) return
    onUpdate(field.id, { options: [...extras, val] })
    setNewItem("")
  }

  function removeExtra(item: string) {
    onUpdate(field.id, { options: extras.filter((e) => e !== item) })
  }

  return (
    <div className="mt-2 space-y-3">
      {/* בחירת רשימה בסיסית */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "cities", label: "ערים בישראל" },
          { value: "schools", label: "בתי ספר" },
          { value: "custom", label: "רשימה מותאמת" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              onUpdate(field.id, {
                autocomplete_list: opt.value as FormField["autocomplete_list"],
                options: [],
              })
            }
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              field.autocomplete_list === opt.value
                ? "border-accent bg-[var(--accent-soft)] font-medium text-[var(--accent-hover)]"
                : "border-line text-fg-muted hover:bg-[var(--bg-subtle)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* הרשימה */}
      {field.autocomplete_list && (
        <div className="space-y-2 rounded-md bg-[var(--bg-subtle)] p-3">
          <div className="flex flex-wrap gap-1.5">
            {displayList.map((item) => {
              const isExtra = extras.includes(item)
              return (
                <span
                  key={item}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
                    isExtra
                      ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-hover)]"
                      : "border-line bg-surface text-fg-muted"
                  }`}
                >
                  {item}
                  {isExtra && (
                    <button
                      type="button"
                      onClick={() => removeExtra(item)}
                      className="leading-none text-[var(--accent-hover)] hover:text-[var(--danger)]"
                    >
                      ×
                    </button>
                  )}
                </span>
              )
            })}
            {fullList.length > 10 && !showAll && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="px-2 py-1 text-xs text-fg-subtle hover:text-accent"
              >
                +{fullList.length - 10} נוספות...
              </button>
            )}
          </div>

          {/* הוספת פריט */}
          <div className="mt-2 flex gap-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
              placeholder={
                field.autocomplete_list === "cities"
                  ? "הוסף עיר שחסרה..."
                  : field.autocomplete_list === "schools"
                  ? "הוסף בית ספר שחסר..."
                  : "הוסף פריט..."
              }
              className="flex-1 rounded-md border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
            />
            <button
              type="button"
              onClick={addItem}
              className="rounded-md bg-accent px-3 py-1.5 text-sm text-white hover:bg-accent-hover"
            >
              הוסף
            </button>
          </div>
        </div>
      )}

      {/* תצוגה מקדימה */}
      <div className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2 text-sm text-[var(--fg-faint)]">
        <span>הקלד לחיפוש...</span>
        <span>▾</span>
      </div>
    </div>
  )
}

function FieldCard({
  field,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  field: FormField
  index: number
  total: number
  onUpdate: (id: string, updates: Partial<FormField>) => void
  onRemove: (id: string) => void
  onMove: (id: string, dir: "up" | "down") => void
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={`rounded-lg border bg-surface transition-all duration-150 ${
        focused
          ? "border-accent shadow-[var(--shadow-md)]"
          : "border-line shadow-[var(--shadow-xs)]"
      }`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {/* סרגל צד */}
      <div className="flex overflow-hidden rounded-lg">
        <div
          className={`w-1 flex-shrink-0 transition-colors ${
            focused ? "bg-accent" : "bg-transparent"
          }`}
        />

        <div className="flex-1 p-6">
          {/* שורה עליונה: שאלה + סוג */}
          <div className="mb-4 flex items-center gap-4">
            <input
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
              placeholder="שאלה"
              className="flex-1 border-b-2 border-transparent bg-transparent pb-1 text-base font-medium text-fg outline-none placeholder:font-normal placeholder:text-[var(--fg-faint)] focus:border-accent"
            />
            <select
              value={field.type}
              onChange={(e) =>
                onUpdate(field.id, {
                  type: e.target.value as FormField["type"],
                  options: undefined,
                })
              }
              className="rounded-md border border-line bg-[var(--bg-subtle)] px-3 py-1.5 text-sm text-fg-muted outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* תצוגה מקדימה של השדה */}
          <div className="mb-4">
            {field.type === "text" && (
              <div className="border-b border-[var(--line-strong)] py-2 text-sm text-[var(--fg-faint)]">
                תשובה קצרה
              </div>
            )}
            {field.type === "textarea" && (
              <div className="border-b border-[var(--line-strong)] py-2 text-sm text-[var(--fg-faint)]">
                תשובה ארוכה
              </div>
            )}
            {field.type === "number" && (
              <div className="border-b border-[var(--line-strong)] py-2 text-sm text-[var(--fg-faint)]">
                0
              </div>
            )}
            {field.type === "date" && (
              <div className="border-b border-[var(--line-strong)] py-2 text-sm text-[var(--fg-faint)]">
                יי/מ/שש
              </div>
            )}
            {(field.type === "file" || field.type === "video") && (
              <div className="rounded-md border border-dashed border-[var(--line-strong)] py-4 text-center text-sm text-[var(--fg-faint)]">
                {field.type === "video" ? "העלה וידאו" : "העלה קובץ"}
              </div>
            )}
            {(field.type === "select" || field.type === "multiselect") && (
              <div className="mt-2 space-y-2">
                {(field.options ?? []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`h-4 w-4 flex-shrink-0 border-2 border-[var(--line-strong)] ${
                        field.type === "select" ? "rounded-full" : "rounded"
                      }`}
                    />
                    <input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...(field.options ?? [])]
                        newOpts[i] = e.target.value
                        onUpdate(field.id, { options: newOpts })
                      }}
                      className="flex-1 border-b border-transparent bg-transparent text-sm text-fg outline-none focus:border-[var(--line-strong)]"
                    />
                    <button
                      onClick={() => {
                        const newOpts = (field.options ?? []).filter((_, j) => j !== i)
                        onUpdate(field.id, { options: newOpts })
                      }}
                      className="text-lg leading-none text-[var(--fg-faint)] hover:text-[var(--danger)]"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    onUpdate(field.id, {
                      options: [...(field.options ?? []), ""],
                    })
                  }
                  className="mt-1 flex items-center gap-3 text-sm text-accent hover:text-accent-hover"
                >
                  <div
                    className={`h-4 w-4 flex-shrink-0 border-2 border-[var(--line-strong)] ${
                      field.type === "select" ? "rounded-full" : "rounded"
                    }`}
                  />
                  הוסף אפשרות
                </button>
              </div>
            )}

            {field.type === "autocomplete" && (
              <AutocompleteFieldEditor field={field} onUpdate={onUpdate} />
            )}
          </div>

          {/* סרגל תחתון: חובה + סדר + מחיקה */}
          <div className="flex items-center justify-between border-t border-[var(--line-faint)] pt-3">
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-fg-muted">
              <div
                onClick={() => onUpdate(field.id, { required: !field.required })}
                className={`relative h-5 w-10 cursor-pointer rounded-full transition-colors ${
                  field.required ? "bg-accent" : "bg-[var(--line-strong)]"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    field.required ? "-translate-x-5" : "-translate-x-1"
                  }`}
                />
              </div>
              חובה
            </label>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onMove(field.id, "up")}
                disabled={index === 0}
                className="rounded p-1.5 text-xs text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg disabled:cursor-not-allowed disabled:opacity-20"
              >
                ▲
              </button>
              <button
                onClick={() => onMove(field.id, "down")}
                disabled={index === total - 1}
                className="rounded p-1.5 text-xs text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg disabled:cursor-not-allowed disabled:opacity-20"
              >
                ▼
              </button>
              <div className="mx-1 h-4 w-px bg-line" />
              <button
                onClick={() => onRemove(field.id)}
                className="rounded p-1.5 text-sm text-fg-subtle hover:bg-[var(--stage-rejected-bg)] hover:text-[var(--danger)]"
              >
                🗑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FormBuilder({
  form,
  organizationId,
}: {
  form: Form | null
  organizationId: string
}) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(form?.name ?? "")
  const DEFAULT_FIELDS: FormField[] = [
    { id: generateId(), type: "text", label: "שם מלא", required: true },
    { id: generateId(), type: "text", label: "אימייל", required: true },
    { id: generateId(), type: "text", label: "טלפון", required: false },
    { id: generateId(), type: "date", label: "תאריך לידה", required: false },
    { id: generateId(), type: "autocomplete", label: "עיר מגורים", required: false, autocomplete_list: "cities" },
    { id: generateId(), type: "autocomplete", label: "בית ספר", required: false, autocomplete_list: "schools" },
  ]

  const [fields, setFields] = useState<FormField[]>(
    form ? ((form.fields as FormField[]) ?? []) : DEFAULT_FIELDS
  )
  const [saving, setSaving] = useState(false)
  const [savedLink, setSavedLink] = useState("")

  function addField() {
    setFields((prev) => [
      ...prev,
      { id: generateId(), type: "text", label: "", required: false },
    ])
  }

  function updateField(id: string, updates: Partial<FormField>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  function moveField(id: string, direction: "up" | "down") {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (direction === "up" && idx === 0) return prev
      if (direction === "down" && idx === prev.length - 1) return prev
      const next = [...prev]
      const swap = direction === "up" ? idx - 1 : idx + 1
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("חובה להכניס שם לטופס")
      return
    }
    setSaving(true)

    if (form) {
      const { error } = await supabase
        .from("forms")
        .update({ name, fields })
        .eq("id", form.id)
      if (error) { alert("שגיאה בשמירה"); setSaving(false); return }
      router.push("/forms")
    } else {
      const { data, error } = await supabase
        .from("forms")
        .insert({ name, fields, organization_id: organizationId })
        .select()
        .single()
      if (error || !data) { alert("שגיאה ביצירת הטופס"); setSaving(false); return }
      setSavedLink(`${window.location.origin}/apply/${data.id}`)
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-bg font-sans" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/forms")}
              className="text-xl leading-none text-fg-subtle hover:text-fg"
            >
              ←
            </button>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם הטופס"
              className="min-w-[200px] border-b-2 border-transparent bg-transparent pb-0.5 text-lg font-semibold text-fg outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? "שומר..." : "שמור טופס"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-6 py-8">
        {/* קישור לאחר שמירה */}
        {savedLink && (
          <div className="rounded-lg border border-[var(--stage-accepted-line)] bg-[var(--stage-accepted-bg)] p-5">
            <p className="mb-3 font-semibold text-[var(--stage-accepted-fg)]">
              הטופס נשמר בהצלחה
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={savedLink}
                dir="ltr"
                className="flex-1 rounded-md border border-[var(--stage-accepted-line)] bg-surface px-3 py-2 text-sm text-fg"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(savedLink)
                  router.push("/forms")
                }}
                className="whitespace-nowrap rounded-md bg-[var(--stage-accepted-dot)] px-4 py-2 text-sm text-white hover:brightness-95"
              >
                העתק וסגור
              </button>
            </div>
          </div>
        )}

        {/* שאלות מותאמות */}
        {fields.map((field, idx) => (
          <FieldCard
            key={field.id}
            field={field}
            index={idx}
            total={fields.length}
            onUpdate={updateField}
            onRemove={removeField}
            onMove={moveField}
          />
        ))}

        {/* הוסף שאלה */}
        <button
          onClick={addField}
          className="w-full rounded-lg border-2 border-dashed border-line bg-surface py-5 text-sm font-medium text-fg-subtle shadow-[var(--shadow-xs)] transition-all hover:border-accent hover:bg-[var(--accent-soft)] hover:text-accent"
        >
          + הוסף שאלה
        </button>
      </div>
    </div>
  )
}
