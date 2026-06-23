import type { Metadata } from "next"
import Link from "next/link"
import { Accessibility, Mail, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "הצהרת נגישות · מכינט",
  description: "הצהרת נגישות לפי תקנות שוויון זכויות לאנשים עם מוגבלות",
}

// פרטים שרן ימלא בהמשך — מורשה נגישות + תאריך עדכון.
// המבנה תואם תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע"ג-2013.

const CONTACT_EMAIL = "support@mechinet.app"
const LAST_UPDATED = "יוני 2026"
const STANDARD = 'WCAG 2.1 רמה AA (ת"י 5568)'

export default function AccessibilityPage() {
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
          האתר נבנה בשאיפה לעמוד בדרישות תקן <b>{STANDARD}</b> ובהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות
          (התאמות נגישות לשירות), תשע&quot;ג-2013.
        </p>
      </Section>

      <Section title="מה זמין באתר">
        <ul className="m-0 flex list-disc flex-col gap-1.5 ps-5">
          <li>תפריט נגישות בפינה השמאלית-תחתונה — לחיצה על כפתור הנגישות פותחת את התפריט.</li>
          <li>שלוש רמות גודל טקסט (רגיל / גדול / גדול מאוד).</li>
          <li>מצב ניגודיות גבוהה לקריאה נוחה יותר.</li>
          <li>הדגשת כל הקישורים באתר בקו תחתון.</li>
          <li>ביטול אנימציות ומעברים — נוח למי שרגיש לתנועה.</li>
          <li>ניווט מלא ב-Tab וב-Escape, כולל מצבי focus נראים.</li>
          <li>תמיכה בקוראי מסך, תיוג ARIA לרכיבים אינטראקטיביים.</li>
          <li>טקסט חלופי לתמונות משמעותיות.</li>
          <li>תמיכה בעברית מלאה (RTL).</li>
        </ul>
      </Section>

      <Section title="התאמות שלא הושלמו עדיין">
        <p className="m-0">
          חלקים מסוימים באתר עשויים להיות לא נגישים במלואם בשלב זה, וביניהם:
          תוכן ויזואלי דינמי (מפות, גרפים), טפסים חיצוניים, וקבצי PDF המופקים מהמערכת.
          אנו פועלים לשפר את הנגישות באופן שוטף.
        </p>
      </Section>

      <Section title="פנייה למורשה נגישות">
        <p className="m-0">
          נתקלתם בקושי בנגישות? יש לכם הצעה לשיפור? נשמח לשמוע — נטפל בפנייה במהירות.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-line bg-[var(--bg-subtle)] px-4 py-2.5 text-[13.5px]">
          <Mail className="h-4 w-4 text-[#1463c7]" />
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline" dir="ltr">
            {CONTACT_EMAIL}
          </a>
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
