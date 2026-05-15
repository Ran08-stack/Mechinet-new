# Mechinet — Master Prompt ל־Claude Code

> העתק את הבלוק הזה כולו לתוך השיחה הראשונה עם Claude Code.
> זה ה־briefing המלא. אחרי זה תעבדו מסך אחר מסך.

---

## Context (קרא קודם — קריטי)

יש לי שתי תיקיות במחשב:

```
C:\Users\Ran\Desktop\Mechinet\Mechinet\         ← הקוד (Next.js 14)
C:\Users\Ran\Desktop\Mechinet\mechinet - ui\    ← עיצוב (16 HTML + HANDOFF.md + globals.css)
```

**לפני שאתה כותב שורת קוד אחת — קרא הכל. בלי קיצורי דרך.**

קבצים חובה, בסדר הזה:

1. `..\mechinet - ui\HANDOFF.md` — מסמך ההעברה המלא.
2. `..\mechinet - ui\globals.css` — design tokens.
3. `..\mechinet - ui\01 Design Tokens.html` — תצוגה ויזואלית של המערכת.
4. `CLAUDE.md` בשורש הקוד.
5. `memory/instructions.md`, `memory/context.md`, `memory/memory.md`.
6. `types/database.ts` — schema נוכחי.
7. `package.json` — תלויות (dependencies).
8. `tailwind.config.js` ו־`app/globals.css` — האם tokens כבר הועברו?
9. `app/layout.tsx` ו־`app/(dashboard)/layout.tsx` — מבנה.
10. רפרוף על כל קובץ ב־`app/(dashboard)/` וב־`components/` כדי לדעת מה קיים.

**רק אחרי שכל זה נקרא** — חזור אלי עם סיכום ושאלות.

אם משהו לא ברור או סותר — **עצור ושאל**. אל תניח. אל תמציא. הפרויקט שלם רק כשהקוד, העיצוב, ו־memory מתואמים.

**Stack:** Next.js 14 (App Router) · Supabase · Tailwind · TypeScript · RTL Hebrew first · Rubik font · Vercel.

**Design tokens (מתוך `mechinet - ui\globals.css`):**
- Navy `#031631` primary
- Orange `#FE6F42` action
- Teal `#44DDC1` AI accent (לשימוש *רק* על אלמנטים שמייצרים AI)

---

## כללי עבודה

- **עברית בלבד** בתקשורת איתי. קוד באנגלית.
- **diff לפני apply.** תמיד.
- **שמור את כל ה־Supabase queries הקיימים** כשעושים UI swap.
- **כירורגיה:** נגע רק במה שצריך. אל תשפר קוד סמוך.
- **RTL:** השתמש ב־`ms-*`/`me-*`/`ps-*`/`pe-*` של Tailwind. לא `left/right`.
- **בלי המצאות:** אם משהו לא ברור — שאל. אל תנחש.

---

## ⭐ ארכיטקטורת משתמשים — שני סוגי חשבונות נפרדים

**זה הדבר החשוב ביותר במסמך הזה. קרא פעמיים.**

המערכת מפרידה לחלוטין בין שני סוגי משתמשים — בקוד, ב־DB, וב־UI:

### חשבון 1: מועצת המכינות (Council)
- **חשבון אחד יחיד בכל המערכת.** Master account. גישה מלאה לכל הנתונים האגרגטיביים.
- נכנס דרך אותו `/login` אבל מנותב ל־`/council` (route group נפרד: `app/(council)/`).
- רואה: מסך 11 (Council Dashboard), ניהול חשבונות, נתוני תשתית.
- **יכול ליצור חשבונות חדשים למכינות** — דרך כפתור "הזמן מכינה חדשה" במסך המועצה. שולח magic link לאימייל המכינה.
- **לא רואה נתוני מועמדים אישיים.** רק אגרגציה. (RLS אוכפת.)
- `users.role = 'council_admin'`

### חשבון 2: מכינה (Academy)
- חשבון לכל מכינה. נוצר ע"י המועצה.
- נכנס דרך `/login` ומנותב ל־`/dashboard` (route group: `app/(dashboard)/`).
- רואה: מסכים 02–09, 15 — כל הניהול היומיומי של המכינה שלו.
- רואה **רק** את הנתונים של המכינה שלו (`organization_id` filter ב־RLS).
- `users.role = 'org_admin'` (או `'org_staff'` למשתמשי משנה בעתיד).

### הפרדה טכנית
- שתי route groups נפרדות: `app/(council)/` ו־`app/(dashboard)/`.
- ה־`middleware.ts` בודק את `role` של המשתמש ומנתב נכון אחרי login.
- אם `org_admin` מנסה לגשת ל־`/council/*` → 403 redirect ל־`/dashboard`. וגם הפוך.
- שני layouts נפרדים. שני sidebars נפרדים. שני dashboards נפרדים.

### candidate (מועמד) — לא קיים עכשיו
פורטל המועמד (מסך 10) הוא סוג משתמש שלישי שיתווסף ב־Sprint 4. **התעלם ממנו לעת עתה.**

---

## First-run bootstrap — אין חשבונות בהתחלה

**מצב התחלתי: ה־DB ריק. אין משתמשים. אין מכינות.**

יצירת חשבון המועצה הראשון (שלי, רן, לטסטים) נעשית **ידנית פעם אחת**, לא דרך UI:

1. צור קובץ `scripts/bootstrap-council.ts`. הוא מקבל מאיפהשהוא (env var או prompt) אימייל ויוצר:
   - שורה ב־`auth.users` (דרך Supabase Admin API).
   - שורה ב־`public.users` עם `role = 'council_admin'` ו־`organization_id = null`.
2. הרץ אותו פעם אחת:
   ```bash
   COUNCIL_EMAIL=rapran333@gmail.com npx tsx scripts/bootstrap-council.ts
   ```
3. הסקריפט מדפיס magic link ל־console (כי אין עדיין email setup).
4. אני לוחץ — נכנס כ־`council_admin`.
5. מתוך מסך המועצה אני יוצר את חשבון המכינה הראשון (רעות) — דרך כפתור "הזמן מכינה חדשה".
6. חשבון המכינה נוצר עם אימייל **שונה** (אני אתן לך — לטסטים נשתמש באימייל המייל שני שלי).

**מסך login לא צריך טופס הרשמה.** רק כניסה עם magic link. הרשמה מתבצעת רק דרך:
- bootstrap script (Council)
- הזמנה ממסך המועצה (Academy)

---

## ⭐ Dev Account Switcher — כלי טסטים שלי

**צריך עכשיו. בלעדיו אני לא יכול לבדוק את שני הצדדים.**

בנה widget צף בצד המסך (קצה שמאל תחתון, כי RTL — או ימני, מה שלא מסתיר תוכן):

### מאפיינים
- **רק במצב development** — `if (process.env.NODE_ENV !== 'development') return null`. **לא עולה לפרודקשן.**
- **מצב סגור:** עיגול קטן (40×40px) עם איקון של משתמש + נקודה צבעונית שמראה את התפקיד הנוכחי (סגול = council, כתום = academy).
- **לחיצה פותחת panel מהצד** עם:
  - שני קלפים: "מועצת המכינות" + "מכינה (רעות)" — כל אחד עם האימייל המוצמד.
  - כפתור "החלף לחשבון הזה" לכל אחד.
  - תיבת קלט קטנה להוסיף עוד אימיילים בעתיד (שמירה ב־`localStorage`).
  - תווית בולטת: "DEV ONLY — לא יופיע בפרודקשן".

### לוגיקת ההחלפה
- לחיצה על "החלף" → `supabase.auth.signOut()` → קריאה ל־`/api/dev/magic-link?email=...` → API endpoint שעובד **רק ב־development** ויוצר magic link דרך Admin API → redirect מיידי לקישור.
- שניות, לא דקות. לא צריך לפתוח אימייל.

### קבצים
- `components/dev/AccountSwitcher.tsx` — ה־widget עצמו.
- `app/api/dev/magic-link/route.ts` — ה־endpoint. **חובה לבדוק `NODE_ENV` ולהחזיר 404 בפרוד.**
- mount ב־`app/layout.tsx` כך שזמין בכל מסך.

### האימיילים שלי לטסטים
- Council: `rapran333@gmail.com` (האימייל הראשי שלי).
- Academy: אני אספק אימייל שני בנפרד. **שאל אותי לפני שאתה כותב את הסקריפט.**

---

## Sprint 1 — UI swap על מה שכבר עובד (1–2 שבועות)

**עובדים מסך אחר מסך. אל תיגע ביותר ממסך אחד בכל הודעה.**

| # | מסך עיצוב | קובץ בקוד | שינויי schema? |
|---|---|---|---|
| 1 | `02 Sidebar Layout.html` | `app/(dashboard)/layout.tsx` | לא |
| 2 | `14 Login.html` | `app/(auth)/login/page.tsx` | לא |
| 3 | `05 Dashboard.html` | `app/(dashboard)/page.tsx` | לא (queries בלבד) |
| 4 | `03 Candidates Table.html` | `app/(dashboard)/candidates/page.tsx` + `components/candidates/CandidatesTable.tsx` | לא |
| 5 | `04 Candidate Profile v2.html` | `app/(dashboard)/candidates/[id]/page.tsx` | לא (AI citations בהמשך) |
| 6 | `06 Pipeline.html` | `app/(dashboard)/pipeline/page.tsx` + `components/pipeline/KanbanBoard.tsx` | לא |
| 7 | `07 Forms List.html` | `app/(dashboard)/forms/page.tsx` | לא |
| 8 | `08 Form Builder.html` | `components/forms/FormBuilder.tsx` | לא |
| 9 | `09 Apply Form.html` | `app/apply/[formId]/page.tsx` | לא |
| 10 | `15 Settings.html` | `app/(dashboard)/settings/page.tsx` | כן — gender_policy + religious_policy ב־organizations |

**הערה:** ב־Sprint 1 כל המסכים האלה הם של **חשבון מכינה**. עוד אין council UI.

---

## Sprint 2 — ארכיטקטורת שני חשבונות + Council + Calendar (2–3 שבועות)

**מטרה:** עד סוף Sprint 2, אני יכול להחליף בין חשבון מועצה לחשבון מכינה בקליק, ולהשתמש בשניהם.

### סדר עבודה ב־Sprint 2

| שלב | מה | תלוי ב |
|---|---|---|
| 1 | Migration ראשון: `users.role` constraint, `organizations.gender_policy + religious_policy`, RLS לכל הטבלאות | — |
| 2 | Bootstrap script + יצירת חשבון council ראשון | שלב 1 |
| 3 | Dev Account Switcher widget + `/api/dev/magic-link` | שלב 2 |
| 4 | `middleware.ts` — ניתוב לפי role | שלב 2 |
| 5 | `app/(council)/layout.tsx` — sidebar + chrome של council | שלב 4 |
| 6 | מסך 11 — Council Dashboard, `app/(council)/page.tsx` | שלב 5 |
| 7 | "הזמן מכינה חדשה" — endpoint + UI במסך 11 | שלב 6 |
| 8 | Migration שני: `interviews` table + RLS | — |
| 9 | מסך 12 — Calendar, `app/(dashboard)/calendar/page.tsx` + components | שלב 8 |
| 10 | API: יצירה / עדכון / ביטול ראיון + שליחת אימייל בסיסי | שלב 9 |

### Council Dashboard (מסך 11) — מה כן, מה לא
- ✅ KPIs אגרגטיביים: סה"כ מכינות, מועמדים, אחוז קבלה.
- ✅ מפת ישראל (placeholder SVG כרגע — לא מחליף ל־Mapbox עדיין).
- ✅ פאנל עלויות תשתית (טבלה קשיחה — לא live data).
- ✅ רשימת מכינות עם kpi מהיר לכל אחת + כפתור "הזמן מכינה חדשה".
- ❌ Drill-down לרשומת מועמד. לא קיים. RLS חוסמת.

### Calendar (מסך 12) — מה כן, מה לא
- ✅ תצוגת שבוע + תצוגת רשימה.
- ✅ CRUD על `interviews`.
- ✅ שליחת אימייל בסיסי למועמד כשנקבע ראיון (template פשוט inline, לא דורש שירות חיצוני עדיין).
- ❌ תצוגת חודש — אחר כך.
- ❌ WhatsApp — לא ב־Sprint 2.
- ❌ טופס הערכה (מסך 13) — לא ב־Sprint 2.

---

## Sprint 3+ — לא עכשיו

- AI citations (`ai_summary` → jsonb)
- Activity timeline
- מסך 13 (Interview Evaluation)
- מסך 10 (Candidate Portal) + auth למועמדים
- WhatsApp integration
- תבניות אימייל מתקדמות
- תצוגת חודש ב־Calendar
- AI insight votes

אם נתקעת בחוסר במסך כלשהו — תן לי list קצרה של מה שחסר, ואני אחליט אם לעצב או לדחות.

---

## Tone של AI במוצר

AI הוא **עוזר קטן, לא מנוע מרכזי**. כשהוא מופיע:
- ✅ סיכום מועמד עם ציטוטים מהטפסים
- ✅ הצעת 3 שאלות לראיון
- ✅ "שפר ניסוח" על הערות
- ❌ ציוני AI כברירת מחדל
- ❌ באנרים של "AI insights"
- ❌ קבלת החלטות אוטומטית

---

## החלטות מוצר שנסגרו (לא לערער)

| נושא | החלטה |
|---|---|
| Auth מועמדים | Magic link דרך Supabase Auth |
| WhatsApp | לא ב־MVP. אימייל בלבד. Cloud API ב־Sprint 3+. |
| מודל AI | `gpt-4o` עם cap של קריאה אחת למועמד לשבוע |
| שיתוף בין מכינות | דופליקציה פר־מכינה. אין profile משותף ב־MVP. |
| הרשאות מועצה | אגרגציה בלבד. אין drill-down לרשומה אישית. |
| מחיקת מועמד | ארכוב בלבד (`is_archived`). מחיקה רק ידנית של admin. |
| סוג מכינה | רק שנתית. שני צירים: gender × religious. אין "חצי שנתית". |
| תשלום | מכינה לא משלמת באפליקציה. מועצה משלמת תשתית מרכזית. אין billing tab. |
| חשבונות בהתחלה | ריק. council נוצר ידנית פעם אחת. academy נוצר ע"י council. |

---

## פרומפט פר־מסך (תבנית — שלח את זה לכל מסך)

```
מסך הבא: <NN ScreenName.html>

קרא את הקובץ בעיצוב.
קרא את הקבצים בקוד שצריכים להשתנות.
תן לי:
1. רשימת הקבצים שיושפעו.
2. שאלות פתוחות, אם יש.
3. diff מלא.

אל תיישם עד שאני אומר "go".
```

---

## אלמנטים גלובליים שצריך לבנות תוך כדי

תפגוש אותם שוב ושוב. אל תיצור 5 גרסאות שונות:

- `<EmptyState />` — לכל טבלה/grid ריקים.
- `<LoadingSkeleton />` — בזמן fetch מ־Supabase.
- `<ErrorState />` — נפילת query.
- `<Toast />` — הצלחה/שגיאה אחרי action. (השתמש ב־`sonner` אם אין כלום.)
- `<StageBadge stage="..." />` — צבע + תווית פר־שלב.

בנה כל אחד פעם ראשונה שצריך אותו, ותשתמש שוב מאז.

---

## עדכון זיכרון — חובה תוך כדי עבודה

CLAUDE.md בקוד מגדיר 3 קבצי memory. **אל תשכח לעדכן אותם.**

- **כל החלטה שמתקבלת או שלב שמסתיים** → append ל־`memory/memory.md`. לא דורש אישור.
- **שינוי כיוון מוצרי / פיצ'ר חדש** → הצע עריכה ל־`memory/context.md` והמתן לאישור שלי.
- **כלל עבודה חדש** → הצע עריכה ל־`CLAUDE.md` והמתן לאישור.

**זיכרון מיושן שמחכה לתיקון:**
- `memory/context.md` כותב "מכינה חצי שנתית" — לא נכון יותר. רעות שנתית.
- `memory/context.md` כותב "לא כתבנו קוד עדיין" — לא נכון. יש קוד שעובד.
- הצע diff מתוקן ל־`context.md` בהודעה הראשונה שלך, לפני שאתה מתחיל מסך 1.
- הוסף ל־`context.md` את כל מה שכתוב כאן ב"ארכיטקטורת משתמשים" — שני סוגי חשבונות, bootstrap, switcher.

**עיקרון:** אל תשאיר פערים. אם החלטת משהו בצ'אט הזה — שיהיה כתוב ב־memory לפני שאתה ממשיך הלאה.

---

## Deployment — רק אחרי שכל Sprint מאושר

**לא ב־commits באמצע. רק כשכל המסכים של ה־Sprint הנוכחי מאושרים.**

### Sprint 1 deploy
1. הרץ `npm run build` מקומית. ודא שאין errors.
2. ודא ש־`.env.local` לא נכנס ל־git (`.gitignore`).
3. ודא ש־environment variables מוגדרים ב־Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
4. אם יש migrations חדשים — הרץ על ה־Supabase production project לפני ה־deploy.
5. `git add . && git commit -m "Sprint 1 — UI refresh"`.
6. `git push` — Vercel יפרוס אוטומטית מ־main.
7. בדוק את `https://mechinet-new.vercel.app` — כל מסך עובד, RTL תקין, אין שגיאות.
8. דווח לי "Sprint 1 deployed" עם רשימת מה שעלה.

### Sprint 2 deploy — שים לב
- **Dev Account Switcher לא צריך לעלות לפרוד.** ודא שה־`process.env.NODE_ENV !== 'development'` guard עובד לפני deploy.
- **`/api/dev/*` endpoints — חובה לחזיר 404 בפרוד.** בדוק ידנית עם curl אחרי deploy.
- Bootstrap script לא נדרש על production כי החשבון כבר קיים — אבל ודא שהוא לא רץ אוטומטית.

אם משהו נשבר ב־production שלא נשבר מקומית — תחזור עם logs, אל תנסה לתקן עיוור.

---

## איך מתחילים עכשיו

ההודעה הראשונה שלך אחרי שקראת הכל:

> קראתי הכל. סיכום: <2–3 משפטים על מה הבנת>.
> diff מוצע ל־`memory/context.md` (תיקון "חצי שנתית" + "אין קוד" + הוספת ארכיטקטורת שני חשבונות).
> מתחיל מסך 1 (Sidebar). שלח לי "go" ואני קורא את `02 Sidebar Layout.html`
> ואת `app/(dashboard)/layout.tsx`.

אחרי "go" — תחזור עם diff. אני מאשר או מתקן. אם מאשרתי — apply.
אחרי כל מסך — append ל־`memory/memory.md` שורה אחת ("מסך X הושלם, קבצים שהושפעו: ...").

זה הכל. בהצלחה.
