import type { Metadata } from "next"
import Link from "next/link"
import { Accessibility, Mail, Phone, User, ArrowRight, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: "הצהרת נגישות · מכינט",
  description: "הצהרת נגישות לפי תקנות שוויון זכויות לאנשים עם מוגבלות",
}

// פרטי רכז נגישות — TODO: לעדכן עם שם, טלפון ומייל אמיתי לפני שהאתר עולה לציבור.
// סעיף 35ה לתקנות 2013 דורש פרטי רכז נגישות (שם + ערוצי יצירת קשר).
const ACCESSIBILITY_OFFICER = {
  name: "[יש לעדכן: שם רכז נגישות]",
  email: "support@mechinet.app",
  phone: "[יש לעדכן: טלפון]",
}
const LAST_UPDATED = "יוני 2026"
const STANDARD = 'WCAG 2.0 רמה AA (ת"י 5568)'

export default function AccessibilityPage() {
  const officerIncomplete =
    ACCESSIBILITY_OFFICER.name.startsWith("[") || ACCESSIBILITY_OFFICER.phone.startsWith("[")

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14" dir="rtl">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg"
      >
        <ArrowRight className="h-3.5 w-3.5 -scale-x-100" />
        חזרה לאתר
      </Link>

      <h1 className="m-0 inline-flex items-center gap-3 text-[28px] font-bold tracking-[-0.01em] text-primary md:text-[34px]">
        <Accessibility className="h-7 w-7 text-[#1463c7]" />
        הצהרת נגישות
      </h1>
      <p className="mt-3 max-w-[65ch] text-[14px] leading-relaxed text-fg-muted">
        אנו רואים בנגישות האתר ערך עליון ופועלים לאפשר שימוש שוויוני לכל המשתמשים.
        עודכן: <b className="text-fg">{LAST_UPDATED}</b>
      </p>

      <Section title="רמת הנגישות">
        <p className="m-0">
          האתר נבנה בשאיפה לעמוד בדרישות תקן <b>{STANDARD}</b>, בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות
          (התאמות נגישות לשירות), תשע&quot;ג-2013, ולחוק שוויון זכויות לאנשים עם מוגבלות, התשנ&quot;ח-1998.
        </p>
      </Section>

      <Section title="התאמות הנגישות באתר">
        <p className="m-0 mb-2">
          תפריט הנגישות נמצא בפינה השמאלית-תחתונה של המסך. ניתן לפתוח אותו בלחיצה על אייקון
          הנגישות (כסא גלגלים) ולהפעיל מתוכו:
        </p>
        <ul className="m-0 flex list-disc flex-col gap-1.5 ps-5">
          <li>שלוש רמות גודל טקסט (רגיל / גדול / גדול מאוד).</li>
          <li>ניגודיות גבוהה לקריאה נוחה יותר.</li>
          <li>הדגשת קישורים בקו תחתון.</li>
          <li>ביטול אנימציות ומעברים.</li>
          <li>מרווחי טקסט מוגדלים.</li>
          <li>גופן ידידותי לדיסלקציה (Atkinson Hyperlegible).</li>
          <li>סמן עכבר גדול ומנוגד.</li>
          <li>איפוס מלא של כל ההגדרות לברירת המחדל.</li>
        </ul>
        <p className="m-0 mt-3">
          בנוסף, באתר תמיכה מובנית: ניווט מקלדת וסגירת חלונות ב-Tab/Escape, מצבי focus נראים,
          תיוג ARIA ברכיבים אינטראקטיביים מרכזיים, ותמיכה מלאה בעברית (RTL).
        </p>
      </Section>

      <Section title="מה עדיין לא נגיש במלואו">
        <p className="m-0">
          חלקים מסוימים באתר עשויים להיות לא נגישים במלואם בשלב זה, וביניהם:
          תוכן ויזואלי דינמי (מפות, גרפים), קבצי PDF המופקים מהמערכת, וטפסים חיצוניים.
          אנו פועלים לשפר את הנגישות באופן שוטף ושמחים לקבל פניות על קשיים שנתקלתם בהם.
        </p>
      </Section>

      <Section title="פנייה לרכז הנגישות">
        <p className="m-0">
          נתקלתם בקושי בנגישות באתר? יש לכם הצעה לשיפור? נשמח לשמוע ולטפל בפנייה.
        </p>

        {officerIncomplete && (
          <div className="mt-3 inline-flex items-start gap-2 rounded-md border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] px-4 py-2.5 text-[12.5px] text-[var(--warning)]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <b>הערה למפעיל האתר:</b> פרטי רכז הנגישות לא הושלמו. סעיף 35ה לתקנות 2013 מחייב
              הצהרת נגישות עם שם וערוצי קשר של רכז נגישות. יש לעדכן את הפרטים בקובץ
              <code className="mx-1 rounded bg-[var(--bg-muted)] px-1 py-0.5 text-[11.5px]">app/accessibility/page.tsx</code>
              לפני העלאת האתר לציבור.
            </span>
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2 rounded-md border border-line bg-[var(--bg-subtle)] p-4 text-[13.5px]">
          <div className="inline-flex items-center gap-2">
            <User className="h-4 w-4 text-[#1463c7]" />
            <span className="text-fg-muted">שם:</span>
            <b className="text-primary">{ACCESSIBILITY_OFFICER.name}</b>
          </div>
          <div className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#1463c7]" />
            <span className="text-fg-muted">אימייל:</span>
            <a
              href={`mailto:${ACCESSIBILITY_OFFICER.email}`}
              className="font-medium text-primary hover:underline"
              dir="ltr"
            >
              {ACCESSIBILITY_OFFICER.email}
            </a>
          </div>
          <div className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 text-[#1463c7]" />
            <span className="text-fg-muted">טלפון:</span>
            <b className="text-primary" dir="ltr">
              {ACCESSIBILITY_OFFICER.phone}
            </b>
          </div>
        </div>
        <p className="m-0 mt-4 text-[12.5px] text-fg-subtle">
          זמן מענה ראשוני: עד 7 ימי עסקים.
        </p>
      </Section>

      <p className="mt-10 text-[12px] text-fg-subtle">
        הצהרה זו עודכנה לאחרונה ב{LAST_UPDATED}.
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="m-0 text-[17px] font-semibold text-primary">{title}</h2>
      <div className="mt-2 text-[14px] leading-relaxed text-fg-muted">{children}</div>
    </section>
  )
}
