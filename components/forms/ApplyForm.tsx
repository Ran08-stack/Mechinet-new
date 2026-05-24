"use client"

import { useState, useRef } from "react"
import { FormField } from "@/types/database"
import { createClient } from "@/lib/supabase/client"
import { normalizePhone } from "@/lib/utils"
import { normalizeType } from "./fieldTypes"
import { getDataset } from "./datasets"

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
  const initial = value ? value.split("-") : ["", "", ""]
  const [year, setYear] = useState(initial[0] ?? "")
  const [month, setMonth] = useState(initial[1] ?? "")
  const [day, setDay] = useState(initial[2] ?? "")

  function emit(y: string, m: string, d: string) {
    if (y && m && d) onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`)
    else onChange("")
  }

  const months = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
  ]

  const currentYear = new Date().getFullYear()
  // טווח שנים: מ-100 שנה אחורה ועד השנה הנוכחית
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  return (
    <div className="flex gap-2">
      <select
        value={day}
        onChange={(e) => { setDay(e.target.value); emit(year, month, e.target.value) }}
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
        onChange={(e) => { setMonth(e.target.value); emit(year, e.target.value, day) }}
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
        onChange={(e) => { setYear(e.target.value); emit(e.target.value, month, day) }}
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
  fields: rawFields,
  defaultStage,
}: {
  formId: string
  organizationId: string
  fields: FormField[]
  defaultStage: string | null
}) {
  // הוספה אוטומטית של שדה ת"ז חובה, אם לא קיים בטופס
  const fields: FormField[] = (() => {
    const hasNationalId = rawFields.some(
      (f) => f.label === 'ת"ז' || f.label === "תעודת זהות"
    )
    if (hasNationalId) return rawFields
    const nationalIdField: FormField = {
      id: "national_id",
      label: 'ת"ז',
      type: "text",
      required: true,
    } as FormField
    // ממוקם אחרי שם מלא אם קיים
    const nameIdx = rawFields.findIndex((f) => f.label === "שם מלא")
    if (nameIdx >= 0) {
      return [
        ...rawFields.slice(0, nameIdx + 1),
        nationalIdField,
        ...rawFields.slice(nameIdx + 1),
      ]
    }
    return [nationalIdField, ...rawFields]
  })()
  const supabase = createClient()
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [files, setFiles] = useState<Record<string, File>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  function setAnswer(fieldId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
  }
  function getStringAnswer(fieldId: string): string {
    const v = answers[fieldId]
    return typeof v === "string" ? v : ""
  }
  function getArrayAnswer(fieldId: string): string[] {
    const v = answers[fieldId]
    return Array.isArray(v) ? (v as string[]) : []
  }

  function setFile(fieldId: string, file: File | null) {
    setFiles((prev) => {
      const next = { ...prev }
      if (file) next[fieldId] = file
      else delete next[fieldId]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    // חיפוש שדות מיוחדים — נשמרים לעמודות ייעודיות, לא רק ל-answers
    const nameField = fields.find((f) => f.label === "שם מלא")
    const emailField = fields.find((f) => f.label === "אימייל")
    const phoneField = fields.find((f) => f.label === "טלפון")
    const cityField = fields.find((f) => f.label === "עיר מגורים")
    const schoolField = fields.find((f) => f.label === "בית ספר")
    const birthField = fields.find((f) => f.label === "תאריך לידה")
    const nationalIdField = fields.find(
      (f) => f.label === 'ת"ז' || f.label === "תעודת זהות"
    )

    const fullName = nameField ? getStringAnswer(nameField.id) : ""
    const email = emailField ? getStringAnswer(emailField.id) : ""
    const phone = phoneField ? getStringAnswer(phoneField.id) : ""
    const city = cityField ? getStringAnswer(cityField.id) : ""
    const school = schoolField ? getStringAnswer(schoolField.id) : ""
    const birthDate = birthField ? getStringAnswer(birthField.id) : ""
    const nationalId = nationalIdField
      ? String(getStringAnswer(nationalIdField.id)).replace(/\D/g, "")
      : ""

    // העלאת קבצים ל-Supabase Storage
    const attachments: { file_name: string; file_url: string; file_type: string; uploaded_at: string }[] = []
    for (const [fieldId, file] of Object.entries(files)) {
      const ext = file.name.split(".").pop() || "bin"
      const path = `${organizationId}/${Date.now()}-${fieldId}.${ext}`
      const { error: upErr } = await supabase.storage.from("attachments").upload(path, file)
      if (upErr) {
        setError("שגיאה בהעלאת קובץ. נסה שוב.")
        setSubmitting(false)
        return
      }
      const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(path)
      attachments.push({
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type || ext,
        uploaded_at: new Date().toISOString(),
      })
    }

    const { data: newCandidate, error: insertError } = await supabase
      .from("candidates")
      .insert({
        form_id: formId,
        organization_id: organizationId,
        full_name: fullName,
        email: email,
        phone: phone || null,
        city: city || null,
        school: school || null,
        birth_date: birthDate || null,
        national_id: nationalId || null,
        answers: answers as Record<string, unknown> as never,
        attachments,
        ...(defaultStage ? { stage: defaultStage } : {}),
      })
      .select("id")
      .single()

    if (insertError || !newCandidate) {
      setError("שגיאה בשליחת הטופס. נסה שוב.")
      setSubmitting(false)
      return
    }

    // רישום אירוע — טופס הוגש (ללא actor — anonymous מהאתר)
    await supabase.from("candidate_events").insert({
      candidate_id: newCandidate.id,
      organization_id: organizationId,
      type: "form_submitted",
      description: "טופס מועמדות הוגש",
    })

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

  const inputCls =
    "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => {
        const t = normalizeType(field.type)

        // מבנה — section / info: בלי input
        if (t === "section") {
          return (
            <div key={field.id} className="relative border-t-2 border-primary pt-2 mt-4">
              <span className="absolute -top-2.5 start-0 bg-surface pe-2 text-[11px] uppercase tracking-[0.06em] text-primary">
                {field.label}
              </span>
            </div>
          )
        }
        if (t === "info") {
          return (
            <div
              key={field.id}
              className="rounded-md border-s-[3px] border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-3 text-sm text-fg-muted"
            >
              {field.help || field.label}
            </div>
          )
        }

        return (
          <div key={field.id}>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              {field.label}
              {field.required && <span className="me-1 text-[var(--danger)]">*</span>}
            </label>
            {field.help && (
              <p className="-mt-1 mb-1.5 text-[11.5px] text-fg-subtle">{field.help}</p>
            )}

            {/* טקסט קצר + סוגי טקסט מיוחדים */}
            {(t === "short_text" || t === "url") && (
              <input
                type={t === "url" ? "url" : "text"}
                value={getStringAnswer(field.id)}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                required={field.required}
                placeholder={field.placeholder || ""}
                dir={t === "url" ? "ltr" : undefined}
                className={inputCls}
              />
            )}

            {t === "email" && (
              <input
                type="email"
                dir="ltr"
                value={getStringAnswer(field.id)}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                required={field.required}
                placeholder={field.placeholder || "name@example.com"}
                className={inputCls}
              />
            )}

            {t === "phone" && (
              <input
                type="tel"
                dir="ltr"
                inputMode="numeric"
                maxLength={10}
                value={getStringAnswer(field.id)}
                onChange={(e) =>
                  setAnswer(field.id, normalizePhone(e.target.value))
                }
                required={field.required}
                placeholder={field.placeholder || "0500000000"}
                className={inputCls}
              />
            )}

            {t === "id_number" && (
              <input
                type="text"
                dir="ltr"
                inputMode="numeric"
                maxLength={9}
                value={getStringAnswer(field.id)}
                onChange={(e) =>
                  setAnswer(
                    field.id,
                    e.target.value.replace(/\D/g, "").slice(0, 9)
                  )
                }
                required={field.required}
                placeholder={field.placeholder || "9 ספרות"}
                className={inputCls}
              />
            )}

            {t === "long_text" && (
              <textarea
                value={getStringAnswer(field.id)}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                required={field.required}
                rows={4}
                placeholder={field.placeholder || ""}
                className={inputCls + " resize-y min-h-[96px]"}
              />
            )}

            {t === "number" && (
              <input
                type="number"
                min={field.min as number | undefined}
                max={field.max as number | undefined}
                value={getStringAnswer(field.id)}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                required={field.required}
                placeholder={field.placeholder || ""}
                className={inputCls}
              />
            )}

            {t === "date" && (
              <DatePicker
                value={getStringAnswer(field.id)}
                onChange={(val) => setAnswer(field.id, val)}
                required={field.required}
              />
            )}

            {t === "dropdown" && (
              <select
                value={getStringAnswer(field.id)}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                required={field.required}
                className={inputCls}
              >
                <option value="">בחר…</option>
                {mergeOpts(field).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {t === "radio" && (
              <div className="flex flex-col gap-2">
                {mergeOpts(field).map((opt) => (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line px-3 py-2.5 text-sm transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--bg-subtle)]"
                  >
                    <input
                      type="radio"
                      name={field.id}
                      checked={(getStringAnswer(field.id)) === opt}
                      onChange={() => setAnswer(field.id, opt)}
                      required={field.required}
                      className="accent-[var(--accent)]"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {t === "checkbox" && (
              <div className="flex flex-col gap-2">
                {mergeOpts(field).map((opt) => {
                  const current = getArrayAnswer(field.id)
                  const checked = current.includes(opt)
                  return (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line px-3 py-2.5 text-sm transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--bg-subtle)]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...current, opt]
                            : current.filter((v) => v !== opt)
                          // נשמר כ-array ב-JSONB (ולא CSV string) — מאפשר אופציות עם פסיק
                          setAnswer(field.id, next)
                        }}
                        className="accent-[var(--accent)]"
                      />
                      {opt}
                    </label>
                  )
                })}
              </div>
            )}

            {t === "rating" && (
              <RatingInput
                max={Number(field.max) || 5}
                value={parseInt(getStringAnswer(field.id) || "0") || 0}
                onChange={(v) => setAnswer(field.id, String(v))}
              />
            )}

            {t === "file" && (
              <input
                type="file"
                accept={parseAcceptAttr(field.accept)}
                required={field.required}
                onChange={(e) => setFile(field.id, e.target.files?.[0] ?? null)}
                className={inputCls}
              />
            )}

            {t === "signature" && (
              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border-[1.5px] border-dashed border-[var(--line-strong)] bg-[var(--bg-subtle)] px-3.5 py-3 text-sm transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]">
                <input
                  type="checkbox"
                  required={field.required}
                  checked={getStringAnswer(field.id) === "signed"}
                  onChange={(e) =>
                    setAnswer(field.id, e.target.checked ? "signed" : "")
                  }
                  className="mt-0.5 accent-[var(--accent)]"
                />
                <span className="text-fg-muted">
                  {field.help || "אני מאשר/ת שכל הפרטים שמילאתי נכונים"}
                </span>
              </label>
            )}

            {field.type === "autocomplete" && (
              <AutocompleteInput
                field={field}
                value={getStringAnswer(field.id)}
                onChange={(val) => setAnswer(field.id, val)}
              />
            )}
          </div>
        )
      })}

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

function mergeOpts(field: FormField): string[] {
  const builtin = getDataset(field.dataset)
  const custom = field.options ?? []
  return [...custom, ...builtin]
}

// פירוש טקסט "accept" של אדמין ל-attribute שדפדפן מבין.
// תומך בסיומות נפוצות + שמות כלליים בעברית/אנגלית.
function parseAcceptAttr(text?: string): string {
  if (!text) return "*"
  const t = text.toLowerCase()
  const out: string[] = []
  const map: Record<string, string[]> = {
    pdf: [".pdf"],
    jpg: [".jpg", ".jpeg"],
    jpeg: [".jpg", ".jpeg"],
    png: [".png"],
    gif: [".gif"],
    webp: [".webp"],
    heic: [".heic"],
    doc: [".doc"],
    docx: [".docx"],
    תמונה: ["image/*"],
    image: ["image/*"],
    video: ["video/*"],
    וידאו: ["video/*"],
    סרטון: ["video/*"],
  }
  for (const [k, v] of Object.entries(map)) {
    if (t.includes(k)) out.push(...v)
  }
  // dedupe
  const dedup = Array.from(new Set(out))
  return dedup.length > 0 ? dedup.join(",") : "*"
}

function RatingInput({
  max,
  value,
  onChange,
}: {
  max: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={
              filled
                ? "text-[var(--accent)]"
                : "text-[var(--fg-faint)] hover:text-[var(--accent)]"
            }
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15 9 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 9 12 2" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
