"use client"

import { useState, useRef } from "react"
import { FormField } from "@/types/database"
import { createClient } from "@/lib/supabase/client"

const ISRAEL_CITIES = [
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

const ISRAEL_SCHOOLS = [
  "אורט השומרון | אזור השומרון",
  "אורט אמירים | בית שאן",
  "גימנסיה | חדרה",
  "עמל למדעים ואמנויות | חדרה",
  "תיכון חדרה | חדרה",
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
  "בגין | גדרה",
  "רבין | גן יבנה",
  "תיכון גני תקווה | גני תקווה",
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
  "בית ספר לחינוך מיוחד | כללי",
  "מרכז חינוכי טיפולי | כללי",
  "בית ספר לאוטיזם | כללי",
  "מסגרת לחינוך מיוחד | כללי",
  "בית ספר דמוקרטי | כללי",
  "בית ספר ניסויי | כללי",
  "בית ספר בינלאומי | כללי",
  "ולדורף | כללי",
  "חינוך ביתי | כללי",
]

function DatePicker({
  value,
  onChange,
  required,
}: {
  value: string
  onChange: (val: string) => void
  required?: boolean
}) {
  const parts = value ? value.split("-") : ["", "", ""]
  const year = parts[0] ?? ""
  const month = parts[1] ?? ""
  const day = parts[2] ?? ""

  function update(y: string, m: string, d: string) {
    if (y && m && d) onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`)
    else onChange("")
  }

  const months = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 15 - i)

  return (
    <div className="flex gap-2">
      <select
        value={day}
        onChange={(e) => update(year, month, e.target.value)}
        required={required}
        className="flex-1 rounded-md border border-line bg-surface px-2 py-2 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
      >
        <option value="">יום</option>
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={String(d)}>{d}</option>
        ))}
      </select>
      <select
        value={month}
        onChange={(e) => update(year, e.target.value, day)}
        required={required}
        className="flex-1 rounded-md border border-line bg-surface px-2 py-2 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
      >
        <option value="">חודש</option>
        {months.map((m, i) => (
          <option key={i} value={String(i + 1)}>{m}</option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => update(e.target.value, month, day)}
        required={required}
        className="flex-1 rounded-md border border-line bg-surface px-2 py-2 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
      >
        <option value="">שנה</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>{y}</option>
        ))}
      </select>
    </div>
  )
}

function AutocompleteInput({
  field,
  value,
  onChange,
}: {
  field: FormField
  value: string
  onChange: (val: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const baseList =
    field.autocomplete_list === "cities"
      ? ISRAEL_CITIES
      : field.autocomplete_list === "schools"
      ? ISRAEL_SCHOOLS
      : []

  const list = [...baseList, ...(field.options ?? [])]

  const filtered = query.length > 0
    ? list.filter((item) => item.includes(query))
    : list

  return (
    <div className="relative" ref={ref}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="הקלד לחיפוש..."
        required={field.required}
        className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-line bg-surface shadow-[var(--shadow-lg)]">
          {filtered.map((item) => (
            <button
              key={item}
              type="button"
              onMouseDown={() => {
                setQuery(item)
                onChange(item)
                setOpen(false)
              }}
              className="w-full px-4 py-2 text-right text-sm text-fg hover:bg-[var(--accent-soft)] hover:text-[var(--accent-hover)]"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ApplyForm({
  formId,
  organizationId,
  fields,
}: {
  formId: string
  organizationId: string
  fields: FormField[]
}) {
  const supabase = createClient()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  function setAnswer(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    // חיפוש שדות מיוחדים
    const nameField = fields.find((f) => f.label === "שם מלא")
    const emailField = fields.find((f) => f.label === "אימייל")
    const phoneField = fields.find((f) => f.label === "טלפון")

    const fullName = nameField ? answers[nameField.id] ?? "" : ""
    const email = emailField ? answers[emailField.id] ?? "" : ""
    const phone = phoneField ? answers[phoneField.id] ?? "" : ""

    const { error } = await supabase.from("candidates").insert({
      form_id: formId,
      organization_id: organizationId,
      full_name: fullName,
      email: email,
      phone: phone || null,
      answers,
    })

    if (error) {
      setError("שגיאה בשליחת הטופס. נסה שוב.")
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 grid h-14 w-14 mx-auto place-items-center rounded-full bg-[var(--stage-accepted-bg)] text-2xl text-[var(--stage-accepted-fg)]">✓</div>
        <h2 className="mb-2 text-xl font-semibold text-primary">הטופס נשלח בהצלחה</h2>
        <p className="text-fg-muted">נחזור אליך בהקדם.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="mb-1.5 block text-sm font-medium text-fg">
            {field.label}
            {field.required && <span className="me-1 text-[var(--danger)]">*</span>}
          </label>

          {field.type === "text" && (
            <input
              value={answers[field.id] ?? ""}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              required={field.required}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
            />
          )}

          {field.type === "textarea" && (
            <textarea
              value={answers[field.id] ?? ""}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              required={field.required}
              rows={4}
              className="w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
            />
          )}

          {field.type === "number" && (
            <input
              type="number"
              value={answers[field.id] ?? ""}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              required={field.required}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
            />
          )}

          {field.type === "date" && (
            <DatePicker
              value={answers[field.id] ?? ""}
              onChange={(val) => setAnswer(field.id, val)}
              required={field.required}
            />
          )}

          {field.type === "select" && (
            <select
              value={answers[field.id] ?? ""}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              required={field.required}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
            >
              <option value="">בחר...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {field.type === "multiselect" && (
            <div className="space-y-2">
              {field.options?.map((opt) => (
                <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                  <input
                    type="checkbox"
                    checked={(answers[field.id] ?? "").split(",").filter(Boolean).includes(opt)}
                    onChange={(e) => {
                      const current = (answers[field.id] ?? "").split(",").filter(Boolean)
                      const next = e.target.checked
                        ? [...current, opt]
                        : current.filter((v) => v !== opt)
                      setAnswer(field.id, next.join(","))
                    }}
                    className="rounded"
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {field.type === "autocomplete" && (
            <AutocompleteInput
              field={field}
              value={answers[field.id] ?? ""}
              onChange={(val) => setAnswer(field.id, val)}
            />
          )}

          {(field.type === "file" || field.type === "video") && (
            <input
              type="file"
              accept={field.type === "video" ? "video/*" : "*"}
              required={field.required}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm"
            />
          )}
        </div>
      ))}

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-md bg-accent py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {submitting ? "שולח..." : "שלח מועמדות"}
      </button>
    </form>
  )
}
