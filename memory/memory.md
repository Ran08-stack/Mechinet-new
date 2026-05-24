# Mechinet — Memory Log

## לוג סשנים

### 2026-05-09 — סשן פתיחה: ולידציה ואסטרטגיה

- רן הציג את הרעיון: פלטפורמת SaaS לניהול מועמדויות במכינות קדם-צבאיות.
- הרקע האישי: רן שלח טפסים ל-~10 מכינות, חלקן לא חזרו בכלל — הוא חושד שהסיבה היא כאוס בניהול.
- המכינה של רן: רעות (תנועת החלוץ, חצי שנתית). תשמש כפיילוט ראשון.
- יעד: MVP מוכן לפני ספטמבר 2026.
- אסטרטגיה: פיילוט ברעות → הצגה למועצת המכינות → כל מכינה יכולה לפתוח חשבון.
- פוקוס MVP: טפסים + dashboard מועמדים + pipeline שלבים + AI summary (לא AI decision).
- נוצרו 3 קבצי זיכרון: context.md, instructions.md, memory.md.
- בוצע ניתוח מוצר מלא (ראה output של הסשן).
- הוחלט: לא לכתוב קוד עדיין, לא לעצב מסכים עדיין.
- הסשן הנוכחי הוא **צ'אט 1 — ולידציה ואסטרטגיה**.

### 2026-05-09 — צ'אט 3: ארכיטקטורה טכנית ותחילת בנייה

- Stack שנבחר: Next.js 14 + Supabase + Vercel + OpenAI API + TypeScript.
- Supabase MCP חובר בהצלחה. פרויקט: Mechinet-new (id: jlliayuelzvmqxvwdihr, region: eu-central-1).
- DB schema נוצר: 3 migrations הועלו בהצלחה.
  - טבלאות: organizations, users, forms, pipeline_stages, candidates.
  - RLS מופעל על כל הטבלאות עם policies לפי organization.
  - Storage bucket "attachments" נוצר (50MB, תומך בתמונות/PDF/וידאו).
  - Trigger אוטומטי: יצירת user record עם signup.
- שדות קבועים ב-candidates: full_name, email, phone, birth_date, city, school, attachments.
- שדות חופשיים: JSONB fields בטבלת forms (סוגים: text/textarea/select/multiselect/date/number/file/video).
- TypeScript types נוצרו אוטומטית מה-DB.
- Folder structure נבנה: app/(auth), app/(dashboard), app/apply/[formId], app/api/ai/summary.
- קבצים שנכתבו: types/database.ts, lib/supabase/client.ts, lib/supabase/server.ts, lib/openai.ts, lib/utils.ts, app/api/ai/summary/route.ts, app/(dashboard)/layout.tsx, app/(dashboard)/candidates/page.tsx, app/apply/[formId]/page.tsx, app/(auth)/login/page.tsx, package.json, next.config.ts, tsconfig.json.
- השלב הבא: npm install + הגדרת .env.local + חיבור GitHub + Vercel לדיפלוי.
- .env.local נוצר עם ערכים אמיתיים מ-Supabase (URL + anon key). חסר רק OPENAI_API_KEY.
- setup.sh נוצר — Claude מריץ אותו בכל סשן. אבל: npm install חייב להיות מורץ פעם ראשונה ידנית (timeout בסביבה).
- כלל: בכל סשן חדש — Claude מריץ את setup.sh. אם npm install נדרש — רן מריץ אותו ידנית בטרמינל.
- משתמש ומכינה נוצרו: rapran333@gmail.com / admin / מכינת רעות (id: 00000000-0000-0000-0000-000000000001).
- Form Builder נבנה: app/(dashboard)/forms/page.tsx + app/(dashboard)/forms/[id]/builder/page.tsx + components/forms/FormBuilder.tsx.
- תמיכה בסוגי שדות: text, textarea, select, multiselect, date, number, file, video.
- השלב הבא: דף הגשה ציבורי (apply) עם שמירה ל-Supabase + AI summary אוטומטי.

### 2026-05-10 — צ'אט 3 המשך: פיצ'רים + Deploy

- דשבורד מועמדים עם חיפוש ופילטר שלב — CandidatesTable (client component).
- פרופיל מועמד — /candidates/[id] עם שינוי שלב, AI summary, הערות, קבצים.
- Pipeline קנבן — /pipeline עם 5 עמודות, כפתורי העברה בין שלבים.
- עמוד הגדרות — /settings עם שם מכינה, לוגו, ניהול שלבי pipeline.
- Deploy ל-Vercel הצליח: https://mechinet-new.vercel.app
- GitHub repo: https://github.com/Ran08-stack/Mechinet-new
- Deploy נעשה דרך Vercel CLI (לא GitHub) בגלל קובץ node_modules כבד (129MB).
- השלב הבא: עיצוב מלא של כל הממשק.

### 2026-05-14 — צ'אט UI: פתיחת Sprint 1 (UI swap)

- נקרא ה-briefing המלא: CLAUDE_CODE_PROMPT.md + HANDOFF.md + memory + database.ts + מבנה app/components.
- תוקן context.md: "חצי שנתית"→"שנתית", נוסף בלוק ארכיטקטורת שני חשבונות + first-run bootstrap, עודכן סטטוס ל-Sprint 1. אושר ע"י רן.
- פער שזוהה: design tokens עדיין לא הועברו לקוד (app/globals.css ריק, tailwind.config.js ריק). הוחלט: diff נפרד להעברת tokens לפני מסך 1.
- פער שזוהה: database.ts מגדיר UserRole = "admin"|"staff" — לא תואם ל-council_admin/org_admin הנדרשים. נושא ל-Sprint 2.
- מבנה בפועל: הקוד יושב ישירות תחת C:\Users\Ran\Desktop\Mechinet\ (לא תת-תיקייה כפולה). העיצוב ב-mechinet - ui/.
- design tokens הועברו לקוד: app/globals.css קיבל את כל 512 שורות mechinet - ui/globals.css (@import גופנים מועבר לראש לפני @tailwind). tailwind.config.js הורחב (colors/fontFamily/borderRadius כ-var()). layout.tsx body קיבל className="font-sans". אומת: tsc נקי, tailwind compile נקי.
- אזהרה סביבתית: ה-bash sandbox לפעמים רואה גרסה חתוכה של קובץ שנכתב דרך Edit tool — לכתוב קבצי config דרך bash heredoc כדי להבטיח סנכרון. npm run build איטי מדי ל-timeout של 45s בסביבה.
- תוקן context.md עם מבנה עולם המכינות האמיתי: מועצה → תנועות → מכינות → שלוחות. רן הולך לראות (חצי שנתית). המוצר ממוקד למועצה ולמכינות שנתיות.
- העדפת תקשורת חדשה של רן: לא לערבב עברית ואנגלית באותה שורה. למקד ולקצר תשובות. (נשמר גם ב-memory הכללי.)
- מסך 1 (תפריט צד) הושלם. קבצים: app/(dashboard)/_components/Sidebar.tsx (חדש), app/(dashboard)/layout.tsx (הוחלף). הותקן lucide-react. תפריט עם 4 פריטים בלבד (מועמדים/פייפליין/טפסים/הגדרות) — לפי החלטת רן, רק ראוטים שעובדים. שם מכינה ומשתמש קבועים זמנית. בדיקת התחברות נשמרה. אומת: tsc נקי. הערה: npm run build לא מסיים ב-timeout של הסביבה — ייבדק בעלייה לאתר.
- החלטת קצב: עובדים מסך-אחר-מסך עם אישור רן לכל אחד.
- 2026-05-14: רן ביקש לרוץ על כל הרשימה. הושלמו כל מסכי חלק א (החלפת עיצוב): 1,2,4,5,6,7,8,9,15. נוצר רכיב משותף StageBadge. כל מסך: tsc נקי. נשמרו כל השאילתות והלוגיקה. הבא: חלק ב (מסכים לבנות מאפס) + חלק ג (פיצ'רים).
- npm run build לא מסיים ב-timeout של הסביבה (44s) — אומת ע"י tsc בלבד. בנייה אמיתית תיבדק בעלייה ל-Vercel.
- צריך: לעלות ל-Vercel כדי שרן יראה את העיצוב החדש. רן ביקש שנעשה את זה ביחד.
- 2026-05-14: ניסיון deploy. תוקן .gitignore (חוסם node_modules/.next/.env). הוסרו node_modules ו-.next ממעקב git. אבל: index.lock תקוע ב-git בסביבה, בעיית הרשאות — אי אפשר להשלים commit מכאן.
- .env.local עדיין ב-git tracking מ-commit ישן — חייב git rm --cached .env.local לפני push.
- החלטה: רן יעלה ידנית בטרמינל. הפקודות: git rm --cached .env.local ; git add -A ; git commit -m "..." ; git push. Vercel מחובר ל-repo ויפרוס לבד.
- רן יצא לכמה שעות. כשחוזר: קודם deploy, אחר כך נמשיך לחלק ב (5 מסכים חדשים).
- 2026-05-14: deploy הצליח. git נתקע (index.lock + repo ישן מלא node_modules) — נזנח. במקום: vercel --prod ישירות מהטרמינל. עבד. כל 9 מסכי חלק א חיים ב-mechinet-new.vercel.app. הבנייה עברה תקין על Vercel.
- מסקנה: ל-deploy עתידי — vercel --prod מהטרמינל, לא git push. ה-git repo נשאר מזוהם, לא תוקן.
- הבא: חלק ב — 5 מסכים חדשים (לוח בקרה, לוח מועצה, יומן, הערכת ראיון, פורטל מועמד).
- 2026-05-14 (המשך): הושלמו 3 מסכים מחלק ב — מסך 3 (לוח בקרה), מסך 12 (יומן), מסך 13 (הערכת ראיון).
- נוצרו 2 טבלאות חדשות ב-Supabase (project jlliayuelzvmqxvwdihr): interviews + interview_evaluations, שתיהן עם RLS לפי organization. ה-DB כבר מעודכן (migrations רצו ישירות).
- types/database.ts עודכן עם Interview + InterviewEvaluation. הקובץ נכתב מחדש דרך bash (היה פגום מ-CRLF + חיתוך של Edit tool).
- נשארו חסומים: מסך 11 (מועצה) + מסך 10 (פורטל מועמד) — דורשים ארכיטקטורת שני/שלושה חשבונות. רן בחר: קודם deploy ובדיקה.
- כל המסכים: tsc נקי. צריך vercel --prod מהטרמינל.
- 2026-05-14: deploy הצליח, הכל עובד. רן: העיצוב לא מדויק מספיק — הוא רוצה התאמה פיקסל-בפיקסל ל-HTML שב-mechinet - ui/. החלטה: לדחות את כל ה-UI/UX לסוף. עכשיו בונים פונקציונליות בלבד.
- כלל חדש: בשלב הזה — פונקציונליות קודם, עיצוב מדויק (כמו ה-HTML) בסוף כשלב נפרד על כל המסכים.
- 2026-05-14 (סוף): הושלם כל חלק ב + ארכיטקטורת שני חשבונות. נבנו: מסך 11 (לוח מועצה, אזור app/(council)/), מסך 10 (פורטל מועמד — קוד מוכן, חסום ב-RLS). middleware.ts לניתוב לפי role.
- נוצרו 2 migrations נוספות ב-Supabase: add_council_role_architecture (role constraint + is_council_admin() + RLS למועצה), council_insert_orgs_and_promote_user (policy ליצירת מכינות + עדכון rapran333@gmail.com ל-council_admin).
- חשוב: המשתמש של רן עכשיו council_admin — הוא יראה את צד המועצה (/council) ולא את צד המכינה. להחזרה: UPDATE users SET role='admin' WHERE email='rapran333@gmail.com'.
- כל הקוד: tsc נקי. צריך vercel --prod. נשאר: שלב עיצוב מדויק על כל המסכים.
- 2026-05-14 (סיום הרשימה): הושלם כל חלק ג שאפשר. נבנו: סוג מכינה בהגדרות (gender_policy + religious_policy), רכיבים חוזרים (EmptyState/LoadingSkeleton/ErrorState ב-components/ui/), היסטוריית פעילות (טבלת candidate_events + lib/events.ts + ActivityTimeline בפרופיל + רישום אירועים מ-StageSelector/NotesEditor/CalendarView).
- נדחו: ציטוטים על AI (מסוכן — שינוי טיפוס שדה ai_summary + AI route, צריך סשן ייעודי), וואטסאפ (מחוץ ל-MVP לפי briefing).
- migrations שרצו: create_interviews_table, create_interview_evaluations_table, add_council_role_architecture, council_insert_orgs_and_promote_user, add_organization_type_fields, create_candidate_events_table.
- כל הרשימה גמורה חוץ משלב העיצוב המדויק (פיקסל-בפיקסל) + ציטוטים AI. כל הקוד tsc נקי. צריך vercel --prod.

### 2026-05-15 — Skills + deploy תקול

- נוספו 6 Skills ב-.claude/skills/ (session-start, screen-port, deploy, supabase-migration, code-rules, memory-update). נשמרו ב-git, נטענים אוטומטית. עודכן context.md עם סעיף Skills.
- deploy נכשל שוב ושוב על שגיאת build: ENOENT page_client-reference-manifest.js ב-app/(council).
- ניסיונות שנכשלו: loading.tsx ל-route groups, vercel --prod --force, ניקוי .next (לא היה קיים).
- הסיבה האמיתית: באג ב-Next.js 14.2.5 — page.tsx ישירות בשורש route group עם סוגריים, לא מייצר manifest.
- התיקון שעבד: העברת app/(council)/page.tsx ל-app/(council)/council/page.tsx (תת-תיקייה, כמו ש-(dashboard) בנוי). עודכן import path. tsc נקי.
- תוקן גם: רגקס שבור ב-slugify של InviteAcademyButton ([^\w֐-׿-] עם מקף שבור) — הוסר slugify לגמרי, slug עכשיו "academy-"+timestamp.
- deploy הצליח (41s בנייה אמיתית). כל הקוד מאתמול + היום חי ב-mechinet-new.vercel.app.
- כלל: route group עם סוגריים — לעולם לא page.tsx ישירות בשורש. תמיד תת-תיקייה.
- 2026-05-15: רן בדק את צד המועצה. עובד — לוח בקרה, הזמן מכינה חדשה (נוסף "רעות" לרשימה).
- בעיה: /council/academies נותן 404 — הקישור בתפריט קיים אבל הדף לא נבנה. בתיקון.
- פאנל עלויות תשתית בלוח המועצה — רן אומר שלא רלוונטי כרגע. להשאיר בינתיים, בהמשך נחליט מה לעשות איתו (אולי להסיר או להעביר למקום אחר).
- 2026-05-15: נבנה דף /council/academies (תיקון ה-404). רשימת כל המכינות + ספירת מועמדים/טפסים/תאריך.
- 2026-05-15: התחיל שלב העיצוב המדויק. רן העלה את 03 Candidates Table.html ואמר "אני רוצה ככה". סדר עבודה: מסך אחד, אישור, הבא.
- מסך 4 (טבלת מועמדים) — עוצב מדויק לפי ה-HTML. ממתין לאישור רן + deploy.
- 2026-05-15: נמצא שורש בעיית ה-deploy. ה-git repo הכיל בהיסטוריה קובץ node_modules של 129MB (next-swc) — חרג ממגבלת GitHub, חסם כל push. לכן Vercel נשאר תקוע על commit ישן והקוד החדש לא עלה.
- הפתרון שעבד: מחיקת .git לגמרי (Remove-Item -Recurse -Force .git), git init נקי, commit חדש (98 קבצים, 278KB בלבד — בלי node_modules), git push --force ל-GitHub.
- מעכשיו ה-git repo נקי. deploy רגיל: git add/commit/push ואז vercel --prod. אין יותר היסטוריה מזוהמת.
- כלל: ה-repo נבנה מחדש מאפס ב-2026-05-15. אם push נדחה — git push origin main --force בטוח (אנחנו מקור האמת).
- 2026-05-15: באג /council/academies = 404. הסיבה: הקובץ היה ב-app/(council)/academies/page.tsx — אבל (council) הוא route group בסוגריים, לא חלק מה-URL. אז ה-route היה /academies ולא /council/academies.
- התיקון: הועבר ל-app/(council)/council/academies/page.tsx. import של _components עודכן ל-../../. אחרי זה: push רגיל עבד (בלי force!) — ה-repo הנקי תקין.
- כלל: route group בסוגריים = לא ב-URL. דף שאמור להיות תחת /council חייב לשבת ב-app/(council)/council/... לא ישירות ב-app/(council)/...
- git push + vercel --prod עובדים סוף-סוף בצורה רגילה. סוף הסאגה של ה-deploy.
- 2026-05-15: דף /council/academies עובד. תוקן באג בסיידבר המועצה — "סקירה ארצית" ו"מכינות" נדלקו ביחד (כי startsWith("/council/") תפס את שניהם). תיקון: "/council" נדלק רק בהתאמה מדויקת.
- אישור רן: עדכון mechinet-deploy SKILL (הרקע הישן על git מזוהם — לא רלוונטי, נכתב מחדש). ממתין לאישור: תוספת כלל route groups ל-mechinet-code-rules.
- 2026-05-15: רן ביקש לחזור לעבוד מסודר לפי התוכנית, בלי קפיצות. זוהה חוסר: אין מעבר בין חשבונות, רן תקוע בצד מועצה.
- נבנה Dev Account Switcher — וידג'ט צף שמחליף role. policy users_update_own_profile כבר קיים (id=auth.uid()) — לא נדרש migration. ממתין ל-deploy + בדיקה.
- אחרי שזה עובד — חוזרים לשלב העיצוב המדויק מסך-אחר-מסך (מסך 4 כבר עוצב, ממתין אישור).
- 2026-05-15: מסך 4 + מסך 5 אושרו ("נראה טוב"). מתג החלפת חשבונות עובד.
- החלטה חשובה של רן: מעכשיו — קודם להפוך את כל המסכים למדויקים ל-HTML, ורק אז לבנות פיצ'רים על העיצוב הנכון. לא בונים פיצ'רים על עיצוב לא מדויק.
- הבא: מסך 6 (פייפליין) — עיצוב מדויק לפי 06 Pipeline.html.
- 2026-05-15: מסכים 6,1,2 עוצבו מדויק. רן ביקש לעבוד ממוקד — מסך אחד עד הסוף (UI + פיצ'רים) לפני שעוברים.
- מסך מועמדים — סבב תיקונים מלא: Topbar (חיפוש בלי ⌘K, פעמון→פאנל), הוסרו עמודת מקור + 3 נקודות, מיון/סינון/תצוגה עובדים, ייצוא CSV עובד, מודאל "מועמד חדש" עובד.
- באג DB שתוקן: city/school/birth_date היו ב-types/database.ts אבל לא ב-DB. migration add_candidate_city_school_birthdate. עכשיו עיר נשמרת.
- migrations עד כה: ...interviews, interview_evaluations, council_role, council_insert_orgs, organization_type_fields, candidate_events, add_candidate_city_school_birthdate.
- מסך 2 (דף התחברות) הושלם. קובץ: app/(auth)/login/page.tsx (הוחלף). עיצוב מפוצל: צד מותג כהה + טופס. נשמרה התחברות אימייל-סיסמה הקיימת + מעבר ל-/candidates. נוסף: הצג/הסתר סיסמה. הושמטו (אין קוד): OAuth, מתג תפקיד, שכחת סיסמה, מתג שפה. סטטיסטיקות צד המותג: דמה, בעתיד יסונכרן עם אתר המועצה, "מועמדים"→"טפסים שהוגשו". אומת: tsc נקי.
- נוצר memory/todo-ui.md — רשימת מה שהושמט מהעיצוב ויצטרך השלמה אחרי Sprint 1.
- 2026-05-14: רן ביקש סדר. נוצר memory/מעקב-מסכים.md — קובץ מרכזי אחד לכל 16 המסכים: מה יש, מה צריך, סטטוס. מתעדכן בכל התקדמות. todo-ui.md הוחלף בהפניה לקובץ החדש.
- מבנה מעקב-מסכים: חלק א = מסכים עם קוד עובד (החלפת עיצוב). חלק ב = מסכים לבנות מאפס. חלק ג = פיצ'רים גדולים (תשתית, לא מסך).
- 2026-05-15: תוקן חלון "ראה עוד" ב-CandidatesTable.tsx — טקסט הערה נמרח בשורה אחת ברצף תווים ארוך. נוסף break-words ל-<p>, ה-div עוטף קיבל max-h-[50vh] overflow-y-auto. עלה לאתר, אומת ע"י רן — עובד.
- אזהרה סביבתית חמורה שחזרה: גם ה-Edit tool, גם ה-bash sandbox וגם ה-Read tool הראו גרסאות לא מסונכרנות של הקובץ. Edit מחק 5 שורות סיום; heredoc הוסיף סיום כפול; הסביבה הראתה 779 שורות תקינות בזמן ש-npm run build של רן ראה סיום משובש. נפתר רק ע"י כתיבת בלוק הסיום מחדש מאפס דרך bash (head -771 + heredoc) ואימות ב-npm run build המקומי של רן.
- כלל מאומת: הסביבה (Edit/Read/bash) לא תמיד מסונכרנת עם הדיסק של רן. המקור האמין היחיד לבדיקת build הוא npm run build המקומי של רן. אחרי כל שינוי קוד לא טריוויאלי — לבקש מרן npm run build לפני deploy.
- 2026-05-15: שיפוץ מסך פרופיל מועמד הושלם — הוסר כפתור "..." מה-hero, הוסרה כפילות פרטים אישיים מה-hero, סיכום AI עבר לטור הצד, נוספו "צפייה בטופס המקורי" (עמוד read-only חדש: app/(dashboard)/candidates/[id]/form/page.tsx) ובלוק "קבצים מצורפים" עם הודעת ריקנות.
- באג שתוקן ב-extraAnswers: הסינון היה לפי id קבוע (full_name/email/...) אבל ה-ids בטפסים אמיתיים הם slugs רנדומליים (kv5idfb). תוקן לסינון לפי label בעברית.
- ApplyForm: נוסף מנגנון העלאת קבצים בפועל. שדות file/video לא היו מחוברים בכלל (אין onChange). נוסף state files, פונקציית setFile, העלאה ל-Supabase Storage bucket "attachments" ושמירה למערך candidates.attachments. ה-bucket היה כבר public עם policy אנונימית.
- DatePicker שדרוג: state פנימי לכל שדה (יום/חודש/שנה) במקום שאיבה מ-value חיצוני. הטווח הורחב מ-10 ל-100 שנים אחורה. הבעיה הייתה שבחירה חלקית לא נשמרה (כי value החיצוני נשאר "" עד שלושה ערכים מלאים).
- AI summary תוקן ל-2 כיוונים: (1) הקוד עכשיו שולח label בעברית במקום id ("שם מלא: עדי בוזגלו" במקום "kv5idfb: עדי בוזגלו"). (2) באג ב-Vercel env: OPENAI_API_KEY הכיל תו לא חוקי בכותרת HTTP (כנראה newline בהדבקה). תוקן ע"י החלפת המפתח. רן אישר: עובד.
- נוצר טופס דוגמה מקיף (b689f108-64a1-467a-8278-e4bffd5848a8) עם 25 שאלות, ו-2 מועמדים בדיקה: עדי בוזגלו (6edf3998-...) — צופים/קרבי/רובוטיקה, ויעל כהן-לוי (a18141ee-...) — פילוסופית/אינטרוורטית/8200. שניהם עם תשובות מלאות וסגנון שונה לחלוטין.
- 2026-05-15: שלבי קבלה דינמיים — הוסר ה-hard-coded של 5 שלבי אנגלית. עכשיו כל מכינה יכולה להגדיר שלבים משלה דרך הגדרות. מה שנעשה:
  - migration dynamic_stages_phase1: הוסר constraint candidates_stage_check, נוספה עמודה is_default ל-pipeline_stages, מועמדים קיימים מופו מאנגלית לעברית (new→שלב הטפסים, review→שלב הטפסים, interview→ראיון אישי, accepted/rejected→מיון פרונטלי), trigger create_default_stages_for_org יוצר אוטומטית 3 שלבים למכינה חדשה (טופס הוגש/ראיון/מיון פרונטלי).
  - הקוד עודכן: lib/stages.ts (helper חדש), StageBadge תומך ב-colorClass dynamic + fallback legacy, CandidatesTable/StageSelector/KanbanBoard/NewCandidateButton/ApplyForm/PipelineStagesEditor כולם מקבלים stages כ-prop ועובדים דינמית, dashboard/candidates/pipeline/profile/portal pages טוענים stages ומעבירים.
  - PipelineStagesEditor: שלב is_default לא ניתן למחיקה (alert + disabled button). מועמד חדש מהטופס הציבורי נכנס אוטומטית לשלב is_default של המכינה.
  - סינון בטבלה: "סינון נוסף" כולל עכשיו גם סינון לפי שלב (לא רק עיר). "נקה את כל הסינונים" אחד שמאפס את שניהם.
  - types/database.ts: נוסף is_default ל-pipeline_stages, CandidateStage הומר ל-string פתוח, נוסף type PipelineStage. deploy עבר חלק, רן אישר: עובד.
- 2026-05-15: נמחק עמוד pipeline + KanbanBoard. לוח הבקרה קיבל משפך אינטראקטיבי (שורות אופקיות, אחוז מתוך סך, קישור ל-/candidates?stage=...). CandidatesTable מקבל initialStage מ-URL.
- 2026-05-15: ב-dashboard: Topbar חדש (רקע surface-2 אותו צבע של sidebar, רציף עם sidebar), ברכת בוקר/צהריים/ערב לפי שעה, שם החשבון בכותרת ה-sidebar (לא ב-Topbar). Topbar קיבל כפתור עזרה (HelpCircle) חוץ מהפעמון.
- 2026-05-15: LiveActivity — רכיב חדש בלוח הבקרה ליד "מועמדים אחרונים". אייקונים צבעוניים לכל סוג אירוע (orange/navy/teal/default), timeline אנכי, שמות מועמד+מבצע מודגשים, "לפני X דקות". טוען עם join ל-actor (users) ול-candidate (candidates).
- logCandidateEvent עכשיו שומר actor_id מ-auth.getUser. נרשמים אירועים: stage_changed (StageSelector + CandidatesTable bulk), note_added (NotesEditor + bulkbar single), ai_summary (api/ai/summary route), form_submitted (ApplyForm), interview_scheduled (CalendarView).
- **תזכורת לעתיד — מסך יומן:** כשנגיע לסידור מסך היומן, לוודא שיבוץ ראיון מ-CalendarView מסונכרן עם LiveActivity (כבר רושם interview_scheduled, אבל הפורמט של description צריך להתאים — עכשיו ה-LiveActivity מציג "X שיבץ ראיון ל-Y"). לבדוק שהשמות מופיעים נכון. גם לבדוק שהאירוע נרשם עם actor_id (כבר תוקן ב-lib/events.ts).

### 2026-05-21 — ת"ז בכל מקום

- פרופיל מועמד: InfoCell ת"ז ראשון בפרטים האישיים.
- ApplyForm: הזרקה אוטומטית של שדה "ת"ז" חובה אחרי "שם מלא" אם לא קיים. ולידציה: ספרות בלבד, 9. נשמר ל-candidates.national_id.
- חיפוש בטבלת מועמדים + QuickSearch גלובלי: כולל גם national_id + phone.
- לוח בקרה "מועמדים אחרונים": עמודות חדשות מועמד | עיר מגורים | טלפון | ת"ז | שלב | תאריך.

### 2026-05-21 — מסך אנשי צוות + תיאור שינוי שלב

- LiveActivity: תיאור stage_changed שופץ ל-"{actor} העביר את {cand} לשלב {stage}".
- מסך /team לניהול אנשי צוות. רק admin של מכינה. UI: רשימת חברים + יצירה + איפוס סיסמה + מחיקה.
- lib/supabase/admin.ts — service_role client (server-side בלבד).
- API: POST /api/team (יצירה), PATCH /api/team/[id] (עדכון/סיסמה), DELETE /api/team/[id]. כל route מאמת auth + role=admin + שייכות לאותו org.
- role חדש: org_staff (כבר היה ב-constraint).
- חסום: SUPABASE_SERVICE_ROLE_KEY חסר ב-Vercel env. בלעדיו ה-API ייכשל. רן צריך להוסיף ע"י: copy מ-Supabase dashboard → vercel env add SUPABASE_SERVICE_ROLE_KEY (Production+Preview+Development) → redeploy.
- LiveActivity + polling fallback (8s): רן אישר שזה עובד ללא F5.

### 2026-05-24 — skill חדש: code-review-excellence

- רן התקין את ה-skill דרך marketplace.
- נוסף ל-CLAUDE.md בלוק "Code Review" — מתי להפעיל את ה-skill (בקשת review, security review, סוף פיצ'ר משמעותי, deploy גדול, שינוי רגיש).

### 2026-05-24 — מסך 11 (לוח בקרה מועצה) עוצב מדויק

- בוצע port מלא מ-`mechinet - ui/11 Council Dashboard.html` ל-`app/(council)/council/page.tsx` (~330 שורות).
- 3 KPIs: ממוצע התקדמות עם progress bar + יעד 90%, סה"כ מכינות, מועמדים רשומים.
- מפת ישראל SVG inline (sketch + 13 dots סטטיים), גרף breakdown (gender×religion) עם נתונים אמיתיים, פאנל עלויות $284 (4 cards), טבלת מכינות עם badges גרדיאנט + policy label עברית + status pill.
- AI insight footer דינמי משתמש ב-totalCandidates/avgProgress.
- skills שהופעלו: `mechinet-skill-router` (אוטו) + `mechinet-screen-port` (תהליך).
- tsc נקי. ממתין ל-deploy + אישור רן.
- חסר תיעד ב-`memory/מעקב-מסכים.md`: contact_person column, status חיבור אמיתי, מפת GeoJSON, AI call חי.

### 2026-05-24 — סדר על אקוסיסטם Skills + תכנון Plugin פומבי

- נסקר skills.sh, מוינו רלוונטיים ל-Mechinet (Next/Supabase/Vercel/SaaS עברית).
- נוסף marketplace `anthropic-agent-skills` (anthropics/skills) דרך `claude plugin marketplace add`.
- נשתלו 33 user-level skills דרך junctions ל-`~/.claude/skills/` (חיסכון דיסק, sync אוטומטי עם git pull עתידי):
  - 8 anthropic: skill-creator, mcp-builder, webapp-testing, canvas-design, web-artifacts-builder, pdf, docx, xlsx
  - 2 vercel-labs: vercel-composition-patterns, vercel-web-design-guidelines
  - 5 mattpocock: diagnose, matt-tdd, triage, write-a-skill, handoff
  - 1 extract-design-system (arvindrk)
  - 4 leonxlnx/taste-skill: taste-skill, redesign-skill, image-to-code-skill, stitch-skill
  - 3 google-labs-code/stitch: code-to-design, extract-design-md, extract-static-html
  - 1 browser-use
  - 9 coreyhaines31/marketing: onboarding, cold-email, copywriting, content-strategy, churn-prevention, pricing, launch, competitors, popups
- שיבוטים נשמרו ב-`~/.claude/_staging/`. למחיקת skill: `Remove-Item junction` + delete מ-_staging.
- כפילות: `frontend-design@claude-plugins-official` עדיין רשום ל-project D:\test (לא הצליח להסיר ע"י CLI — `--project-path` לא קיים). לא משפיע על Mechinet.
- עודכן `.claude/skills/README.md` עם מפת 3 שכבות (Mechinet/User/Plugins) + תוכנית public release.
- **תוכנית פומבית עתידית**: לבנות 3-5 skills שאין בשוק (HR/RTL/forms-jsonb/realtime-feed/screen-audit) ולשחרר ב-skills.sh. שוק חסר תוכן ל-Hebrew/RTL ול-ATS — הזדמנות.

### 2026-05-21 — Realtime על candidate_events

- migration enable_realtime_candidate_events: ALTER PUBLICATION supabase_realtime ADD TABLE candidate_events.
- LiveActivity הומר ל-client component, מאזין INSERT filter=organization_id, מוסיף לראש הרשימה (limit 6). refresh timeAgo כל דקה.
- ActivityTimeline הומר ל-client component, מאזין INSERT filter=candidate_id.
- שני ה-components מקבלים initialEvents מ-server + מתעדכנים live ללא רענון.
- RLS על candidate_events חוסם בין מכינות — realtime לא דולף.

### 2026-05-21 — שדרוג מודאל "מועמד חדש"

- migration add_candidate_national_id_and_gender: נוספו national_id (text) ו-gender (text check male/female/other) ל-candidates.
- types/database.ts עודכן.
- NewCandidateButton שודרג: שם, ת"ז (9 ספרות), תאריך לידה + גיל מחושב, מגדר (כפתורי טוגל), אימייל, טלפון, עיר, בית ספר (היה ב-DB, חסר במודאל), שלב.
- הופק רכיב פנימי Field + computeAge.

### 2026-05-21 — Sidebar + Topbar + font: סינכרון main repo

- בעיה: worktree ו-main repo בשני timelines. הרצתי deploy מ-main repo (עם Topbar + LiveActivity + dashboard greeting אבל בלי שינויי font/sidebar שלי), אח"כ מ-worktree (להפך). שני deploys שברו אחד את השני.
- פתרון: עריכת main repo ישירות — globals.css (font-mono→Rubik), layout.tsx (שליפת org name + logo_url), Sidebar.tsx (קבלת orgName + orgLogoUrl כ-props, הצגת לוגו אם קיים, תווית MECHINET · ACADEMY במקום ADMIN, אימייל אמיתי בתחתית). deploy מ-main repo → הכל ביחד.
- כלל: vercel CLI לוקח קבצים מקומיים, לא git. עבודה תמיד בתיקייה שממנה עושים deploy.

### 2026-05-21 — איפוס נתונים: מכינה יחידה + 20 מועמדים

- נמחקו "מכינת נחשון" (27 מועמדים + forms + events + interviews) ו"מכינת רעות - שלוחת אורנים" הריקה הישנה.
- נוצרה מכינה יחידה: "מכינת רעות שלוחת אורנים", id=11111111-1111-1111-1111-111111111111, slug=reut-oranim.
- רן הומר ל-admin של המכינה החדשה.
- trigger יצר 3 stages אוטומטית (טופס הוגש default / ראיון / מיון פרונטלי).
- נוספו 20 מועמדים מגוונים בעברית, פרוסים על 20 ימים. 10/5/5 בשלבים.
- מעכשיו עובדים על מכינה אחת בלבד.

### 2026-05-21 — Sidebar תווית + אבחון לוגו

- Sidebar של מכינה קיבל תווית "MECHINET · ACADEMY" (uppercase tracking, ב-Rubik אחרי שינוי font-mono). דומה ל-CouncilSidebar בסגנון.
- אבחון "לוגו לא נשמר": בדיקה ישירה ב-DB הראתה שהלוגו **כן נשמר** (logos/00000000-0000-0000-0000-000000000001.png, owner=רן, 2026-05-21 10:03). bucket attachments=public, policies INSERT/SELECT עובדים. עדכון לטבלת organizations עובד (RLS users_update_own_org).
- רן הציג screenshot של CouncilSidebar — שם אין לוגו כי זה צד מועצה, לא מכינה. צריך להיות במצב admin (Account Switcher) כדי לראות את לוגו המכינה ב-Sidebar.
- commit c6e6077. deploy mechinet-kud32y61v.

### 2026-05-21 — פונט גלובלי + Sidebar דינמי

- הוסר JetBrains Mono. `--font-mono` ב-globals.css הפנה אליו ושיבש קריאת עברית בכותרות טבלה, badges, pagination. תוקן ל-Rubik (זהה ל-sans). שינוי שורה אחת — מטפל בכל ה-call sites.
- Sidebar brand היה קשיח: "מכינת ראות" + אות "מ" + "mechinet · admin" + admin@mechinet.app. תוקן: layout שולף org (name, logo_url) + user email מ-DB ומעביר כ-props. לוגו מוצג אם logo_url קיים (העלאה דרך /settings — כבר היה תשתית), אחרת אות ראשונה. תווית "חשבון מכינה". אימייל אמיתי בתחתית.
- commit 7934b10. deploy dpl_6jwnBethNsiigR4L644Y77BhJBXq.

### 2026-05-21 — deploy

- vercel --prod רץ מהסביבה של Claude בהצלחה (42s). dpl_AbBcF15T7EVYq5ByUNqj2DG76axT. אומת ב-mechinet-new.vercel.app.
- HEAD == origin/main, לא נדרש push. ניסיון push ל-main נחסם ע"י classifier (דורש הרשאה מפורשת).

### 2026-05-21 — כלל חדש: Claude מריץ פקודות בטרמינל

- רן הורה: מעכשיו Claude מריץ בעצמו את כל הפקודות (deploy, git push, vercel --prod, npm, migrations). רן לא מריץ ידנית.
- נוסף סעיף "הרצת פקודות בטרמינל" ל-CLAUDE.md. חריגים: פעולות הרסניות (rm -rf, git reset --hard, --force, drop table) דורשים אישור.
- ניסיון לעדכן את mechinet-deploy SKILL.md נחסם חלקית ע"י Auto-Mode classifier (self-modification). רק סעיף "כללים" עודכן; שלב 2 עדיין אומר את הנוסח הישן. צריך תיקון ידני של רן או permission rule ב-settings.

### 2026-05-15 — צ'אט: בניית Skills ייעודיים לפרויקט

- נבנו 6 Skills ייעודיים ל-Mechinet, יושבים ב-`.claude/skills/` (נשמרים ב-git, עובדים בכל סשן בפרויקט).
- הרשימה:
  - `mechinet-session-start` — קריאת זיכרון אוטומטית בתחילת סשן + סיכום מצב.
  - `mechinet-screen-port` — תהליך מובנה להלבשת מסך לפי ה-HTML ב-`mechinet - ui/`.
  - `mechinet-deploy` — תהליך `vercel --prod` שעובד, עוקף את ה-git המזוהם.
  - `mechinet-supabase-migration` — migration + RLS + רענון types/database.ts דרך bash heredoc.
  - `mechinet-code-rules` — אכיפת כללי CLAUDE.md (פשטות, כירורגיה, 200 שורות, הצהרת הנחות).
  - `mechinet-memory-update` — תיעוד מובנה לקובץ הנכון לפי כלל הברזל.
- נוצר `.claude/skills/README.md` — אינדקס הקטגוריה + הסבר הפעלה.
- מקור הרעיונות: הכאבים החוזרים בלוג — סנכרון config, deploy שבור, CRLF ב-types, קריאת זיכרון ידנית.
- ממתין: רן ביקש לעצור בסוף הבנייה ולחכות לסימן שלו כדי להמשיך ולעלות ביחד.
- 2026-05-15: זוהה ש-.gitignore חסם את כל `.claude/` — ה-Skills לא היו נכנסים ל-git. תוקן: השורה `.claude/` הוחלפה ב-`.claude/*` + `!.claude/skills/` + `.claude/settings.local.json`. עכשיו skills/ נכנס, settings.local.json נשאר חסום. אומת ב-git check-ignore.
- 2026-05-15: רן עשה commit מהטרמינל — 6 ה-Skills + .gitignore + memory נשמרו ב-git (commit 4d459b9f).
- 2026-05-15: נוצרו 6 קבצי zip ב-`skills-zips/` להעלאה ידנית דרך חלון Upload skill. החלטה פתוחה: כנראה למחוק אותם — `.claude/skills/` מספיק למטרה (super power לפרויקט), העלאה לחשבון רלוונטית רק לשימוש בפרויקטים אחרים.
- 2026-05-15: נוסף ל-context.md בלוק "Skills של הפרויקט" — תיאור מה כל Skill עושה ומתי נטען.

### 2026-05-13 — צ'אט ראשי: איחוד תמונה + Roadmap

- נסרקה תיקיית stitch_mechinamatch — תוצרי צ'אט עיצוב נפרד.
- Design System מלא קיים: Rubik, Navy/Orange/Teal, RTL, spacing, components.
- 9 מסכים מעוצבים (HTML/PNG): דשבורד, form builder, יומן, תקשורת, טבלת מועמדים, כרטיס מועמד, אישור הגשה, Super-Admin מועצה, טופס מועמד.
- נבנה Roadmap מסודר ל-4 שלבים.
- שלב 1 — הושלם (תשתית + core MVP).
- שלב 2 — עכשיו: UI מלא לפי design system + פיצ'רים חיוניים שעוצבו אבל לא קודדו.
- שלב 3 — יולי-אוגוסט: תקשורת, יומן, WhatsApp, AI מתקדם.
- שלב 4 — ספטמבר+: מועצת המכינות, multi-tenant, scale.
- הצ'אטים: ראשי (מוצר/אסטרטגיה) + פיתוח (קוד/טכני) + צ'אט עיצוב נפרד (Stitch).
