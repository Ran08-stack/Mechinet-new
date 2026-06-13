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

### 2026-05-27 — שלב 2 council dashboard: חיבור נתונים אמיתיים

- migrations: `city_coords` (32 ערים seed), `council_settings` (key/value, seed infra_costs), `users.last_login_at` (היה חסר בפועל).
- IsraelMap עודכן: מקבל lat/lng+region ישירות מ-cityPoints (במקום מילון hard-coded).
- ConnectionStatusPill חדש תחת `app/(council)/_components/`: ירוק <7 ימים, כתום 7-30, אדום >30/null.
- middleware: עדכון last_login_at fire-and-forget עם throttle in-memory (שעה לכל user).
- CouncilInsight server component עם unstable_cache (revalidate 21600s), fallback מקומי אם OPENAI_API_KEY חסר.
- ראוט POST `app/api/ai/council-insight/route.ts` (חלופה לקריאה client-side, לא בשימוש בלוח עכשיו).
- טבלת המכינות בלוח: עמודות איש קשר + טלפון (read-only) + סטטוס חיבור אמיתי לפי last_login_at של admin המכינה.
- עלויות תשתית: 4 כרטיסיות + סה"כ, נטענות מ-council_settings, fallback למספרים סטטיים.

### 2026-05-28 — שכבת מכינה/שלוחה (שלב 1 מתוך 3) + brainstorming

- הותקן skill superpowers:brainstorming. כלל חדש בזיכרון הכללי: מעכשיו תמיד מפעילים אותו לפני עבודה יצירתית/פיצ'ר.
- בירור מפת המועצה התגלגל לשינוי מודל נתונים. הוחלט (אופציה 1): כל שלוחה = חשבון נפרד שמנהל מועמדים משלו; "מכינה" = קטגוריה מקבצת שהמועצה יוצרת. מבנה: תנועה → מכינה → שלוחה(organizations) → מועמדים.
- הפיצ'ר פורק ל-3 תתי-פרויקטים: (1) מודל נתונים, (2) onboarding+מיקום+סינון, (3) מפה. spec: docs/superpowers/specs/2026-05-28-council-academies-model-design.md.
- **שלב 1 בוצע** (migration create_academies_grouping_layer):
  - טבלה חדשה academies (name, movement_id nullable→movements, program_type annual/half_year nullable, created_at). RLS: council_admin מלא + org member קריאה של המכינה שלו.
  - organizations קיבלה academy_id (FK→academies, nullable) + index.
  - seed: רעות→"מכינת רעות"(movement), נחשון→"מכינת נחשון". כל org קיים משויך.
  - types/database.ts: נוסף academy_id ל-organizations + טבלת academies + export type Academy. tsc נקי.
  - organizations.movement_id נשאר deprecated (התנועה נגזרת דרך המכינה), לא נמחק.
- לא נעשה UI, לא deploy עדיין. הבא: שלב 2 (onboarding + מיקום: עיר מול קואורדינטות).

### 2026-05-28 — שלב 2: onboarding שלוחה + עיר + סינון (גישה A)

- migration add_organization_city: עמודת city (text, nullable) ל-organizations. types עודכן (city ב-Row/Insert/Update).
- InviteAcademyButton שוכתב: "הזמן מכינה"→"הוסף שלוחה". מודאל: בחירת מכינה קיימת או יצירת מכינה חדשה inline + שם שלוחה + עיר (dropdown מ-city_coords, 32 ערים). יוצר academy אם צריך, ואז organization עם academy_id+city. slug "branch-".
- דף council/academies: רכיב חדש AcademiesTable (client) עם סינון לפי מכינה (dropdown). עמודות: שלוחה|מכינה|עיר|מועמדים|טפסים|הצטרפה. כותרת "מכינות ושלוחות", subtitle "N שלוחות ב-M מכינות".
- דף הפרטים [id]: AcademyActionsCard קיבל שדה עיר (dropdown city_coords) + prop cities. PATCH /api/council/organizations/[id]: city נוסף ל-TEXT_FIELDS + ל-before select (נשמר ב-audit_log כמו שאר השדות). כך אפשר להגדיר עיר גם לשלוחות קיימות (רעות/נחשון עדיין בלי עיר).
- גישה A: רשימה שטוחה של שלוחות + סינון, לא restructure לשתי רמות. רק עיר בינתיים (לא קואורדינטות מדויקות).
- tsc נקי. לא deploy עדיין. הבא: שלב 3 — המפה מציגה שלוחות אמיתיות לפי city→coords, לחיצה→drill.

### 2026-05-29 — שלב 3: מפת שלוחות + deploy + allowlist

- IsraelMap.tsx: CityPoint קיבל id (ייחודי) + href. ניווט בלחיצה (router.push), הבחנה גרירה/קליק (movedRef, סף 3px). תוויות שונו "ערים"→"שלוחות". hover/key לפי id.
- council/page.tsx: מקור נתוני המפה הוחלף — במקום אגרגציית ערי-מועמדים, עכשיו branchPoints: כל org עם city שיש לו קואורדינטות ב-city_coords → נקודה. גודל לפי מס' מועמדים, צבע לפי % קבלה (per-org), href ל-/council/academies/{id}. כותרת המפה: "N שלוחות על המפה". (תיקון tsc: map((o): CityPoint | null).
- seed דמו: רעות→חיפה, נחשון→מודיעין (כדי שהמפה לא ריקה; רן יכול לשנות דרך דף הפרטים).
- tsc נקי. deploy הצליח: dpl_8GLG9u7k2JTcdtPJqCnLkpRNMzR4, חי ב-mechinet-new.vercel.app. כל 3 השלבים עלו ביחד.
- תקלת תשתית במהלך הסשן: הקלסיפייר של auto-mode נפל לסירוגין וחסם Bash/MCP/Edit לפרקים. חולף לבד.
- רן ביקש להריץ דברים בלי אישור ידני. עודכן .claude/settings.local.json allow: נוסף apply_migration, Bash(vercel *), Bash(git add/commit/push *), Bash(npm run build *). (execute_sql + npx tsc כבר היו.) כדי שהכללים יתפסו — להריץ פקודות בלי קידומת "cd ... &&".
- מצב הפיצ'ר: 3/3 השלבים הושלמו ועלו. עתידי: צבע pin לפי מגדר (הצעת Leaflet), drill שמראה מקור מועמדים של השלוחה, שכבת תנועה במפה.

### 2026-05-29 — מפת Leaflet אמיתית + איתור מקום חופשי

- רן: מפת ה-SVG הלבנה לא ברורה. ביקש מפה אמיתית (כמו ב-HTML proposals/מפה-בהיקף-גדול.html) + שדה מקום חופשי (עיר/קיבוץ/יישוב) שמאותר אוטומטית. בחר באופציה החינמית (Leaflet+OSM, בלי מפתח/חיוב).
- הותקן leaflet + react-leaflet@4 + @types/leaflet.
- migration add_organization_latlng: lat/lng (double precision) ל-organizations. types עודכן.
- ראוט חדש GET /api/council/geocode — Nominatim (countrycodes=il, accept-language=he), council_admin בלבד, User-Agent מותאם. מחזיר {lat,lng,display_name}.
- components/council/BranchMap.tsx (react-leaflet): MapContainer + OSM tiles, maxBounds לישראל, CircleMarker צבוע לפי % קבלה, גודל לפי מס' מועמדים, Tooltip, לחיצה→router.push לדף השלוחה. + BranchMapClient.tsx (dynamic ssr:false, כי Leaflet לא תומך SSR).
- council/page.tsx: הוסר IsraelMap + תלות city_coords. branchPoints נבנה מ-org.lat/lng. type BranchPoint.
- InviteAcademyButton + AcademyActionsCard: dropdown העיר הוחלף בשדה טקסט חופשי "מיקום". בשמירה — קריאה ל-geocode, שמירת city(טקסט)+lat+lng. PATCH route מקבל lat/lng numeric.
- IsraelMap.tsx הישן נשאר בקוד אך לא בשימוש (אפשר למחוק בעתיד).
- seed: רעות→חיפה, נחשון→מודיעין, נתניה (שרן יצר) → קואורדינטות אמיתיות. 3 שלוחות על המפה.
- tsc נקי + npm run build עבר (exit 0, /council heavy leaflet ב-chunk דינמי). deploy הצליח ל-prod.
- הערה: Nominatim חינמי, מתאים לנפח נמוך; אם יגדל — לשקול geocoder בתשלום.

### 2026-05-29 — מפה חתוכה לישראל בלבד (מסכת לבן)

- רן: המפה נתקעת למעלה + רואים את שאר העולם. רצה רק ישראל חתוכה ולבן מסביב.
- הורד גבול ישראל מ-Nominatim (polygon_geojson), פושט ב-Douglas-Peucker מ-9735→330 נק' (7.9KB), נשמר ב-components/council/israel-border.json בסדר [lat,lng] + bounds.
- BranchMap.tsx: נוספה מסכת לבן (Polygon: טבעת עולם חיצונית + ישראל כחור, fillOpacity 1 לבן) → כל מה שמחוץ לישראל לבן. קו גבול ישראל דק. LockToIsrael (useMap): fitBounds לישראל + setMaxBounds(pad 0.08) + minZoom=getZoom → לא נתקע/לא בורח. maxBoundsViscosity 1.
- tsc + build עברו. deploy dpl_9njghbDaH3KvjVj2WYMGDpzFuTVu (READY).

### 2026-05-29 — port נאמן של מפת ה-HTML (proposals/מפה-בהיקף-גדול.html)

- רן: המסכה הלבנה כעורה. אהב את ה-HTML המקורי — רוצה אותו as-is (מפה מלאה, עיגולי clustering, סינונים, רשימה לפי אזור, popup). אמר אולי לקחת את ה-HTML לכל המערכת (כיוון עתידי, לא בוצע).
- הותקן react-leaflet-cluster@2.
- BranchMap.tsx שוכתב כ-port מלא של ה-HTML: מפה מלאה (בלי מסכה, שכנים נראים), MarkerClusterGroup (iconCreateFunction = עיגול navy עם מספר), pins divIcon צבועים לפי מגדר (בנים navy / בנות אדום / מעורבת כתום). chips סינון (הכל/בנים/בנות/מעורבת + דתי/חילוני/מעורב + נקה). aside "רשימת מכינות לפי אזור" (צפון≥32.5/מרכז≥31.5/דרום, קיבוץ לפי שם מכינה, קליק→flyTo+openPopup). popup: שם מכינה | שלוחה, עיר, מגדר·דתי, כפתורי "פתח דשבורד"(→דף שלוחה)/"צור קשר"(tel אם יש). סטטיסטיקה "מציג X מכינות · Y שלוחות".
- המסכה (israel-border.json) ננטשה (הקובץ נשאר, לא בשימוש).
- page.tsx: branchPoints עשיר — academyName (מטבלת academies), branchName, gender_policy→gender, religious_policy→rel, multi (אם למכינה >1 שלוחה), contactPhone. נוסף fetch academies.
- האזור נגזר אוטומטית מ-lat (כמו ב-HTML), אין שדה אזור נפרד. שלוחה חדשה מופיעה ברשימה+מפה אוטומטית.
- tsc+build עברו. deploy dpl mechinet-9ol1b4rnh (READY).
- TODO עתידי שרן העלה: לאמץ את שפת העיצוב של ה-HTML לכל המערכת.

### 2026-05-29 — הזנת 97 שלוחות אמיתיות + תיקון מגדר/z-index

- agent סרק את כל 70 הדפים האישיים ב-mechinot.org.il, חילץ כתובות ושלוחות, ו-geocode דרך Nominatim. תוצר: 105 שלוחות, מתוכן 97 עם קואורדינטות מדויקות (8 אזור-בלבד הושמטו). שמור ב-jobs/.../academies.json.
- migration seed_council_academies_from_mechinot_list: 62 מכינות (academies) + 97 organizations (שלוחות) עם academy_id, city, lat, lng, gender_policy, religious_policy, branch_name, status=active. CTE בלי hardcoded ids. ה-3 הדמו (רעות/נחשון/נתניה) נשארו.
- באג שהתגלה ותוקן: ה-DB דורש gender_policy ∈ {boys_only, girls_only, mixed} אבל BranchMap.tsx + page.tsx ציפו ל-{boys, girls, mixed}. תיקון: page.tsx ממפה boys_only→boys / girls_only→girls בבניית branchPoints, וגם ב-breakdown chart (שהיה שבור מאז ומתמיד). BranchMap נשאר.
- באג z-index: המודאל "שלוחה חדשה" (InviteAcademyButton, z-50) הוסתר ע"י מפת Leaflet (controls z-1000). תוקן ל-z-[2000].
- tsc נקי. deploy: mechinet-im6wnksv3 (READY), חי. המפה עכשיו מציגה ~100 שלוחות אמיתיות עם צבע לפי מגדר.
- הערה: שלוחה שמתווספת ידנית דרך המודאל עדיין לא מגדירה gender_policy (תישאר אפורה) — שיפור עתידי אפשרי.

## 2026-05-30 — חיבור Linear לניהול הפרויקט
- Linear MCP חובר. ה-transport הישן (sse) חסם כתיבה — הוחלף ל-http מול https://mcp.linear.app/mcp (ב-~/.claude.json דרך `claude mcp add --transport http -s user`). דרש אתחול + re-auth.
- נוצר project "Mechinet" בצוות Ran (workspace ran08). URL: https://linear.app/ran08/project/mechinet-7439c4777268
- נוצרו 7 issues = מה שנותר לפי מעקב-מסכים.md (לא שוכפלו ה-Done; ה-tracker בrepo נשאר ההיסטוריה המלאה):
  RAN-5 עיצוב מדויק פיקסל-בפיקסל (High), RAN-6 התאמה למובייל, RAN-7 ציטוטים על AI (Backlog),
  RAN-8 פיד פעילות בלוח בקרה, RAN-9 אימייל בקביעת ראיון, RAN-10 החלפת empty states, RAN-11 פורטל מועמד חסום RLS (Backlog).
- זרימת עבודה: issue → סטטוס (Todo→In Progress→Done) → branch (Linear נותן gitBranchName) → commit/PR. אני מנהל את ה-issues מהצ'אט.
- צד המועצה נוסף ל-Linear (לפי תוכנית-מועצה.md, 6 שלבים): RAN-18 שלב0 יסודות (Done), RAN-12 מודל נתונים+מפת Leaflet (Done), RAN-13 שלב1 דף מכינה drill-down (In Progress), RAN-14 שלב2 נתונים אמיתיים בדשבורד (In Progress, נשאר AI insight חי), RAN-15 שלב3 דוחות PDF/CSV (Todo), RAN-16 שלב4 הודעות+Audit UI (Todo), RAN-17 שלב5 טפסים ארצי+הגדרות מועצה (Todo). סה"כ ב-project Mechinet: 14 issues (7 מכינה + 7 מועצה).

## 2026-06-02 — סיום עמוד "סקירה ארצית" (/council) דרך /goal
- רן הכיר את פקודת /goal (פיצ'ר Claude Code, v2.1.139+, Stop hook עם תנאי סיום שמוערך ע"י Haiku). הוחלט: לבנות ידנית, /goal רק להתכנסות מכנית. הופעל goal "finish the סקירה ארצית PAGE".
- בדיקת דאטה (SQL): 100 שלוחות — כולן lat/lng+מגדר+דת+status, אבל רק 1/100 עם contact_person/phone. הטבלה מציגה "—" כי הדאטה ריקה, לא באג. לא הומצאו נתונים.
- מצב לפני: העמוד כבר היה עשיר (מפת Leaflet אמיתית, KPI, status, AI insight חי), אבל כפתורי toolbar (סוג/מיקום/סינון/ייצוא) + כפתורי AI insight (דוח/רענן/אשר) היו disabled/מתים.
- נעשה: (1) AcademiesOverviewTable.tsx (client) — סינון מגדר + אזור (נגזר מ-lat: צפון≥32.5/מרכז≥31.5/דרום) + חיפוש שם + ייצוא CSV (BOM). הטבלה הוצאה מ-page.tsx לרכיב. (2) CouncilInsightActions.tsx (client) + council-actions.ts (server action refreshCouncilInsight=revalidateTag). דוח→ניווט ל-/council/reports (מסך דוחות קיים), רענן→action+router.refresh, אשר→אישור ויזואלי בסשן (ללא persistence). (3) CouncilInsight: נוסף tag "council-insight" ל-cache. (4) הוסר כפתור "לפי אזור" מת בכותרת המפה.
- tsc נקי. build exit 0. קבצים: page.tsx, CouncilInsight.tsx (שונו) + 3 חדשים.
- deploy: vercel --prod (מקומי) הצליח — dpl_4tFQhVvc2i3EjK9LUU9gMnQvyyVP READY, חי ב-mechinet-new.vercel.app.
- חוב טכני שהתגלה: git push ל-main נחסם (remote התפצל — 2 commits Sidebar/פונט שאין מקומית; --force היה מוחק אותם, לא בוצע). בנוסף קבצים untracked שהקוד תלוי בהם (ConnectionStatusPill, components/council/, council/reports/) לא ב-git → build מ-GitHub היה נכשל. vercel --prod עוקף כי מעלה קבצים מקומיים. לסדר git בסשן נפרד.

### 2026-06-02 — סקירה ארצית: חיפוש טופבר + avgProgress משוקלל + רה-דיזיין טבלה
- רן ביקש 3 דברים על /council (אותו מסך):
- (1) חיפוש בטופבר כמו בצד מכינה: נוצר CouncilQuickSearch.tsx (client) — טוען organizations+academies פעם אחת, מסנן לפי שם/עיר/שם מכינה, dropdown תחת ה-input, ⌘K/Ctrl+K, קליק→/council/academies/[id]. לא מחפש מועמדים (RLS אוסר drill-down). הוחלף ה-input המת ב-CouncilTopbar.
- (2) avgProgress: שונה מממוצע פשוט של אחוזי שלוחות ל-**משוקלל לפי כמות מתמיינים** — totalAccepted/totalCandidates ארצי. orgRates נשאר (לספירת "מעל היעד"/"מתחת לממוצע").
- (3) רה-דיזיין toolbar בטבלה (AcademiesOverviewTable): כותרת "ניהול מכינות" מימין, פקדים ב-ms-auto נדחפים שמאלה, ייצוא אחרון. נוסף בורר כמות שורות PAGE_SIZES=[12,24,32,64,100] (ברירת מחדל 24) + עימוד מלא (pageNumbers helper, חצים ChevronRight/Left ל-RTL, מספרי עמוד). footer "מציג A–B מתוך N".
- tsc נקי + build exit 0. deploy: vercel --prod (מקומי) READY — mechinet-baymf8fx4, חי ב-mechinet-new.vercel.app.
- חוסך לעתיד: persistence לאישור תובנה + "דוח לדירקטוריון" אמיתי תלויים ב-RAN-15 (מסך דוחות). הזנת contact_person/phone לשלוחות = דאטה ידנית דרך דף השלוחה.

### 2026-06-02 — סנכרון git ל-GitHub (סגירת החוב הטכני)
- בעיה: main מקומי ו-remote התפצלו (2 ahead / 2 behind), קבצי מועצה untracked שהקוד תלוי בהם לא ב-git, ו-.env.production/.env.vercel חשופים (gitignore חסם רק .env.local).
- תיקון .gitignore: נוסף `.env*` (חוסם את שני קבצי הסוד שהיו חשופים) + graphify-out/, .agents/, deploy/tsc logs, council-map-prototype.html, skills-lock.json. אומת ב-git check-ignore.
- subagent (Explore, read-only) גיווס את כל ה-untracked → TRACK/IGNORE/SECRET. junctions של .claude/skills/* זוהו ולא נכנסו ל-git.
- staging כירורגי: `git add -u` + נתיבי TRACK מפורשים בלבד (לא `-A`), כדי שה-junctions והסודות לא ייכנסו. commit bce65f5.
- rebase origin/main: קונפליקטים ב-Sidebar.tsx + layout.tsx (dashboard) — הגרסה המקומית (a642d6b: accountName/roleLabel/branchName + UserBlock עם logout + יישור Topbar) בולעת פונקציונלית את 2 commits ה-remote (7934b10 font+Sidebar דינמי, c6e6077 תווית). נלקח הצד המקומי, אין אובדן. שינוי הפונט ב-globals.css לא התנגש.
- 2 commits ה-remote נשמרו בהיסטוריה (לא --force). tsc נקי + npm run build exit 0. push fast-forward רגיל (c6e6077..bce65f5).
- אומת: Vercel הדליק deployment מבוסס-GitHub (dpl_9sb1MFTBZJsBNrDjZuB4b8zEymSu, ללא gitDirty — בניגוד לכל הקודמים) → "Build Completed [49s]" → "Deployment completed". 19 ראוטים כולל כל המועצה.
- מעכשיו: working tree == origin/main == GitHub. אפשר לחזור ל-git push רגיל; vercel --prod כבר לא חובה לעקיפת git מזוהם.

### 2026-06-02 — תהליך deploy חדש (skill) + תיקוני מפת מועצה
- **skill mechinet-deploy עודכן** (אישור רן): ברירת מחדל מהיום = commit→push→GitHub בונה ומפרסם אוטומטית (~50ש'). לא vercel --prod מקומי (עוקף git וגרם לסחף). push נדחה→rebase לא --force. stage ממוקד, אסור add -A / commit ל-.env. push 271cf61.
- תיקוני BranchMap.tsx (תלונת רן: המפה משכפלת את העולם אופקית): (1) TileLayer noWrap + maxBounds עולמי [[-90,-180],[90,180]] + maxBoundsViscosity=1 → עולם אחד. (2) minZoom=3. (3) כפתורי זום מותאמים — zoomControl=false + כפתורי Plus/Minus מעוצבים בטוקנים (leaflet-top-left). (4) attributionControl=false → הוסר קרדיט "Leaflet | OpenStreetMap". 
- tsc נקי + build exit 0. push 95de197 (GitHub auto-build).

## 2026-06-02 — תכנית הרשמת מכינות + Phase 0 (בייסליין RLS)
- נכתבה תכנית מלאה ל-onboarding מכינות בסקייל (מסמך ב-~/.claude/plans/harmonic-booping-cook.md). החלטות שננעלו עם רן: טננט=שלוחה (org_admin ראש + org_staff צוות); הרשמה עצמית בטופס (מכינה + N שלוחות) → אישור מועצה; אימות = לינק הזמנה→קביעת סיסמה→כניסה רגילה (reuse); 100 השלוחות נשארות directory לתצוגה; חשבון נפרד לכל שלוחה (בלי multi-org בהשקה); מייל=Resend; יעד ספטמבר 2026, השקה דרך המועצה.
- ממצא קריטי: 33 migrations ב-remote, 1 ב-git (drift). ה-RLS לבידוד שלוחות כבר תקין (candidates_org_access וכו') אבל לא מגורסן.
- **Phase 0 בוצע:** חולצו verbatim מה-DB החי (jlliayuelzvmqxvwdihr) 3 פונקציות (get_user_organization_id, is_council_admin, handle_new_user STABLE/SECURITY DEFINER), trigger on_auth_user_created, ו-44 RLS policies. נכתב supabase/migrations/20260601000000_baseline_rls_and_helpers.sql עם guards IF NOT EXISTS (no-op על prod). הוחל דרך apply_migration — אומת: 44 policies לפני ואחרי (זהה), trigger=1. בייסליין האבטחה מגורסן עכשיו.
- נדחה ל-המשך: רענון types/database.ts (חסר org_roles) — לא בוצע כדי לא לדרוס טיפוסים בעבודת יד; לעשות בזהירות.
- **החלטת מייל (מעדכנת — מבטלת את Resend):** רן אין דומיין ולא משלם. סוכם: (1) **הזמנות הצטרפות** (~100-300 סה"כ) → Supabase built-in `inviteUserByEmail` — חינם, בלי דומיין, בלי Resend. תבנית נערכת ב-Supabase Dashboard. להשקה אופציונלי SMTP של המועצה. (2) **מיילים למתמיינים** (18 אלף+) → **לא** נשלחים ע"י המערכת; mailto עם תבניות ממולאות-מראש, המכינה שולחת מהמייל שלה (אפס עלות). פיצ'ר נפרד אחרי onboarding. (3) לבנות שרת מייל עצמי = נפסל (deliverability). Phase 1 **לא חסום יותר** — אין תלות חיצונית. המסמך עודכן בהתאם.

### 2026-06-02 — Phase 1 (תשתית הזמנה/auth) — קוד נכתב
- migration invitations (20260602120000): טבלה + 3 אינדקסים + RLS (council read / org_admin read own). הוחל ב-apply_migration (success).
- types/database.ts: נוסף טיפוס invitations ל-Database (ידני, לא regenerate), + export Invitation + InvitationStatus + OrgStatus הורחב ל-directory|pending|active|suspended|archived.
- lib/provisioning/provisionOrgAdmin.ts: helper — inviteUserByEmail (יוצר user+שולח מייל) → upsert public.users (org+role) עם rollback deleteUser → פנקס invitations. SITE_URL מ-NEXT_PUBLIC_SITE_URL (fallback mechinet-new.vercel.app).
- app/(auth)/welcome/page.tsx: client — getSession/onAuthStateChange, טופס קביעת סיסמה (min 8), updateUser → POST /api/invitations/accept → /candidates. מצב "הזמנה לא תקפה" אם אין session.
- app/api/invitations/accept/route.ts: מסמן invitation accepted + org pending→active.
- app/api/dev/invite/route.ts: route זמני council-only לבדיקת קצה-לקצה (יוחלף ב-Phase 2).
- tsc נקי. build exit 0. push eedd80f.

### 2026-06-02 — Phase 2 (הרשמה עצמית + תור אישור) — נבנה ב-2 subagents במקביל
- migration registration_requests (20260603090000): טבלה (academy_name, movement_id, existing_academy_id, contact_*, branches jsonb, status pending/approved/rejected, reviewed_*) + index + RLS (council read+update; insert רק דרך service-role route). הוחל.
- types: registration_requests ב-Database + types/registration.ts (RegistrationRequest, RequestedBranch, RegistrationStatus).
- subagent A (הרשמה ציבורית): app/(auth)/register/page.tsx (טופס: מכינה+תנועה+קישור-לקיימת, שלוחות דינמיות, איש קשר) + app/api/register/route.ts (POST ציבורי, ולידציה, rate-limit שעה לפי email, insert service-role) + לינק "מכינה חדשה? הירשמו כאן" ב-login.
- subagent B (תור מועצה): app/(council)/council/registrations/page.tsx (server, pending) + RegistrationQueue.tsx (אשר/דחה, מתרחב לשלוחות) + app/api/council/registrations/[id]/route.ts (PATCH: guard council, 409 idempotency, אישור=academy+orgs(pending)+provisionOrgAdmin על השלוחה הראשית+audit; דחייה=reason) + פריט "בקשות רישום" ב-CouncilSidebar.
- ה-routes הרגישים נבדקו ידנית (register ציבורי, approve). tsc נקי + build exit 0 (כל הראוטים נבנו).
- **חסם בדיקה (Phase 1+2):** רן צריך לערוך תבנית "Invite user" ב-Supabase Dashboard (Auth→Email Templates) לעברית + לוודא Site URL/redirect ל-/welcome. ואז בדיקת קצה-לקצה: /register → אישור בתור → מייל → /welcome → סיסמה → /candidates.
- הערה: backfill של 99 שלוחות ל-status='directory' לא בוצע (נדחה — לוודא קודם שאין שאילתה שמסננת status). העמודה נשארת free-text (בלי CHECK).

### 2026-06-02 — תיקון כיוון: המודל הוא המועצה-יוצרת-ומזמינה (לא self-service)
- רן הבהיר: המודל הנכון (כפי שרשום ב-context.md + בכפתור "הוסף שלוחה") = **המועצה יוצרת מכינה/שלוחה מהמשתמש שלה ושולחת הזמנה. אין הרשמה עצמית ידנית.** ה-self-service של Phase 2 היה טעות בכיוון.
- רן בחר: **למחוק לגמרי** את ה-self-service.
- נמחק (git rm): app/(auth)/register/page.tsx, app/api/register/route.ts, app/(council)/council/registrations/page.tsx, RegistrationQueue.tsx, app/api/council/registrations/[id]/route.ts, app/api/dev/invite/route.ts (temp), types/registration.ts, migration registration_requests. הוסר הלינק "הירשמו כאן" מ-login + פריט "בקשות רישום" מ-CouncilSidebar + טיפוס registration_requests מ-database.ts. **DROP TABLE registration_requests** (היה ריק).
- **נשמר (תשתית, רלוונטי לשני המודלים):** טבלת invitations, provisionOrgAdmin, /welcome, /api/invitations/accept, הגדרות Supabase email.
- **המודל החדש מומש:** כפתור "הוסף שלוחה" (InviteAcademyButton) קיבל שדות "שם/מייל ראש השלוחה" — בשמירה, אם הוזן מייל, נקרא /api/council/invite-admin → provisionOrgAdmin שולח הזמנה + org status='pending'. route חדש app/api/council/invite-admin/route.ts (council guard).
- רן עשה בלוח Supabase: Site URL + Redirect /welcome + תבנית Invite user בעברית. מוכן לבדיקה.

### 2026-06-02 — בדיקה עברה + תיקוני דף מכינה + Phase 3 (תיחום דשבורד)
- רן בדק קצה-לקצה: יצירת שלוחה→הזמנה→מייל→/welcome→סיסמה→כניסה. **עובד.**
- תיקון דף מכינה (פרטי ראש/מיקום לא הופיעו): (1) invite-admin שומר שם הראש ל-org.contact_person. (2) hero מציג org.city (היה מציג org.region הריק). (3) כרטיס חדש "חשבון השלוחה" בדף [id] — שולף users של השלוחה (RLS council_read_all_users), מציג שם+מייל+סטטוס "פעיל"(last_login_at) / "הוזמן · טרם הופעל". push c613bd0. אומת בצילום מסך.
- הערה: org.status נשאר 'active' (ברירת מחדל) גם כשהחשבון טרם הופעל — סטטוס שלוחה (ניהולי) וסטטוס חשבון (התחברות) נפרדים בכוונה. 'pending' לא מיוצג ב-UI הסטטוס.
- **Phase 3 — תיחום דשבורד המועצה (סקייל):** migration council_dashboard_stats_and_indexes — פונקציה council_dashboard_stats() (plpgsql, SECURITY DEFINER, guard is_council_admin, מחזירה per-org total+accepted) + אינדקסים candidates(org,stage)/organizations(status)/organizations(academy_id). page.tsx: הוחלף supabase.from("candidates").select(כל המועמדים בארץ) ב-supabase.rpc("council_dashboard_stats") → countByOrg/acceptedByOrg/totalCandidates מהאגרגציה. הוסרו isAcceptedStage+ACCEPTED_STAGE_NAMES (עברו ל-SQL). פלט זהה, עומס מינימלי. type נוסף ל-Database Functions. אומת: האגרגציה הגולמית מחזירה רעות=20/accepted=0.
- **Phase 3 — שליחה חוזרת של הזמנה:** route app/api/council/invite-admin/resend (council guard; לחשבון last_login_at=null: deleteUser+ניקוי invitations/users+provisionOrgAdmin מחדש → מייל טרי). רכיב ResendInviteButton (client) בכרטיס "חשבון השלוחה" בדף [id], מופיע רק לחשבונות שטרם הופעלו. accounts query קיבל id.
- נשאר ב-Phase 3 (אופציונלי, לא קריטי): types regen ל-org_roles (לא בוצע — סיכון לדרוס טיפוסים בעבודת יד, לא חוסם), backfill directory (נדחה — לוודא שאין שאילתת status filter), load test (לא בר-הרצה בסביבה). הליבה של Phase 3 (תיחום דשבורד + resend) בוצעה.

### 2026-06-02 — תיקוני UI מועצה + אבטחת resend (אחרי בדיקת רן)
- הוסר פריט "תנועות" מ-CouncilSidebar. כפתור "ניהול" ב-AcademiesOverviewTable → /council/academies/[id] (היה רשימה מסוננת).
- **באג מסוכן שתוקן:** rapran333 (council_admin) הופיע כ"ראש השלוחה" בדף מכינה (ה-organization_id שלו לא אופס בהמרה ל-council). לחיצת "שלח שוב" עליו הייתה מוחקת את חשבון המועצה. תוקן: (1) דף [id] מסנן role!=council_admin מהכרטיס. (2) סטטוס "טרם הופעל" + כפתור resend מבוססים עכשיו על טבלת invitations (status='sent'), לא על last_login_at הלא-אמין. (3) resend route מאובטח: דוחה council_admin + דורש הזמנה ממתינה (sent) — כך לא נמחק חשבון פעיל/עם דאטה (FK). הדאטה של rapran333 לא שונתה (Dev Switcher עשוי להסתמך עליה) — רק סינון בתצוגה.
- הערה: last_login_at כנראה לא מתעדכן אמין — לכן עברנו לבסס פעיל/ממתין על invitations. לבדוק בעתיד אם middleware מעדכן last_login_at.

### 2026-06-02 — תקרית: רן ננעל בחוץ (נפתר)
- רן לא הצליח להיכנס עם אף משתמש. אבחון דרך auth logs: "400: Invalid login credentials" (סיסמה לא תואמת) — **לא** קריסה/מחיקה. כל החשבונות שלמים עם סיסמאות (אומת ב-SQL join של public.users↔auth.users).
- סיבה: כנראה ניסיון כניסה עם חשבונות בדיקה שהוזמנו ולא הופעלו (אין סיסמה) או סיסמה שגויה ל-rapran333.
- פתרון: אופסה סיסמת rapran333@gmail.com דרך SQL (extensions.crypt+gen_salt('bf') על auth.users) לערך זמני שנמסר לרן (לא נשמר כאן). רן נכנס בהצלחה. role=admin כרגע (org 11111111) → נוחת /dashboard, משתמש ב-Dev Account Switcher לצד מועצה.
- TODO אם רן יבקש: להחזיר rapran333 ל-council_admin קבוע; שרן יחליף את הסיסמה הזמנית.
- לקח: ה-resend הישן (לפני b47b51f) היה מסוכן — תוקן (מבוסס invitations + דוחה council). הבעיה הזו לא נגרמה מ-resend (החשבונות לא נמחקו), אלא מסיסמה.

## 2026-06-07 — תיקון מצב צד מועצה (הזיכרון היה מיושן)
- ביקורת קוד בפועל גילתה שצד המועצה מתקדם הרבה מעבר למתועד. עודכנו סטטוסי Linear בהתאם:
- שלב 1 (RAN-13, drill-down /council/academies/[id]): כמעט גמור — Hero, KPIs, פילוח שלבים, יחס מגדר, פעילות אחרונה, חשבון שלוחה+resend, AcademyActionsCard (עריכה+השהיה+שינוי תנועה+עיר). נשאר רק: איפוס סיסמת admin + מחיקה רכה. (נשאר In Progress)
- שלב 2 (RAN-14): הושלם → Done. CouncilInsight מחובר ל-OpenAI אמיתי (gpt-4o-mini, cache 6ש', fallback) ומוצג בדשבורד.
- שלב 3 (RAN-15): הושלם → Done. /council/reports — 3 דוחות + טבלאות + גרפים + סינון + ייצוא CSV/PDF (ראוט export/[fmt]). נשאר ניקיון: להסיר כפתור "PDF בדיקה (זמני)".
- לא נבנו עדיין: שלב 4 (RAN-16, הודעות ארציות + Audit log UI — אין announcements/ או audit/) ושלב 5 (RAN-17, /council/forms + /council/settings).
- הצעד הבא לפי סדר ה-roadmap: שלב 4 (RAN-16).

## 2026-06-07 — צד מועצה: איש קשר לבחירה + מדיניות מכינה
- דף מכינה (AcademyActionsCard): "איש קשר" שונה משדה חופשי ל-dropdown מתוך חשבונות השלוחה (ראש/צוות). אם הערך הקיים לא תואם חשבון — נשמר כאופציה נוספת. טלפון נשאר ידני (אין טלפון ב-users).
- נוספו בוררי "הרכב מגדרי" (מעורבת/רק בנים/רק בנות→mixed/boys_only/girls_only) ו"אופי דתי" (דתי/חילוני/מעורב→religious/secular/mixed) גם בכרטיס העריכה וגם במודאל "שלוחה חדשה" (InviteAcademyButton).
- PATCH /api/council/organizations/[id]: נוסף ENUM_FIELDS עם ולידציה ל-gender_policy/religious_policy (רק ערך תקין נכתב, נרשם ב-audit_log).
- הערה: types מגדירים את העמודות כ-string (non-null) → ביצירה שולחים undefined כשריק, "לא הוגדר" בעריכה לא מנקה ערך קיים.
- תוקן: GENDER_LABEL בדף המכינה — נוספו boys_only/girls_only (קודם הציג ערך גולמי ב-KPI "מדיניות המכינה").
- tsc נקי. טרם deploy. פתוח: "חשבון השלוחה" — רן אמר שנראה מוזר, ממתין להבהרה מה בדיוק.
- פאנל "חשבון השלוחה" עוצב מחדש (רן: "לא מובן מה זה, נראה מוזר"): כותרת "חשבונות כניסה" + subtitle "מי שיכול להיכנס ולנהל את המועמדים של השלוחה". כל חשבון: אווטאר עם אות, שם + תווית תפקיד (ראש השלוחה/צוות), מייל, סטטוס עם נקודה (פעיל/הוזמן). מיון: ראש לפני צוות. קובץ: app/(council)/council/academies/[id]/page.tsx. tsc + build נקיים.
- deploy (2026-06-07): commit f7d7be2 → push main → Vercel build READY (~43ש'). dpl_CoaEWiJZUwENJvxx8rmtU8inWU32, חי על mechinet-new.vercel.app. כולל: איש קשר dropdown, בוררי מגדר/דתי (מודאל+עריכה+route), עיצוב מחדש פאנל חשבונות כניסה.

## 2026-06-08 — תיקוני צד מועצה (תוך כדי בניית הודעות)
- תווית boys_only/girls_only גולמית: subagent תיקן את policyLabel ב-app/(council)/council/page.tsx (genderMap קיבל boys_only→"רק בנים", girls_only→"רק בנות"). זה הזין את עמודת "סוג" בטבלת ניהול המכינות. שאר המקומות אומתו תקינים (GENDER_LABEL בדף הפרטים, GENDER_OPTIONS בכרטיס — כבר נכונים).
- מודאל "שלוחה חדשה" (InviteAcademyButton): הוסר הטקסט "המיקום יאותר אוטומטית... אפשר להשאיר ריק". כל השדות חובה עכשיו (מיקום, מגדר, דתי, שם+מייל ראש השלוחה) — כדי שתמיד ייווצר משתמש לראש המכינה ותישלח הזמנה. בוררי מגדר/דתי קיבלו placeholder disabled "בחר...".

## 2026-06-08 — פיצ'ר הודעות ארציות (שלב 4, חלק א) — נבנה
- מתוכנן דרך workflow (4 readers + סינתזה) שמיפה פעמון/RLS/types/דפוסי יצירה. ultracode.
- migration announcements_tables_and_rls (הוחל ב-Supabase + קובץ מקומי 20260608120000_announcements.sql): 3 טבלאות — announcements (title/body/target_type all|movement|selected/target_movement_id/created_by), announcement_targets (למקרה selected), announcement_reads (קבלות קריאה per-user). RLS: announcements_council_all (is_council_admin) + announcements_member_read (target_type=all / movement תואם / selected ב-targets, דרך get_user_organization_id), announcement_reads_own (auth.uid).
- types/database.ts: 3 בלוקי טבלה + Announcement/AnnouncementTarget/AnnouncementRead + AnnouncementTargetType.
- API: app/api/council/announcements/route.ts (POST, guard council_admin, insert + targets + audit_log action=announcement.create). שימוש ב-server client רגיל (RLS מאמת), לא admin client.
- צד מועצה: app/(council)/council/announcements/page.tsx (רשימה + AnnouncementCreateButton — מודאל כותרת/תוכן/יעד: כל/תנועה/נבחרות). קישור "הודעות" בתפריט כבר היה קיים.
- צד מכינה: Topbar.tsx — הפעמון טוען הודעות לא-נקראו (2 שאילתות: announcements ∖ announcement_reads, client-side, אמין יותר מ-embedded null filter), תג מספר, פתיחה מסמנת כנקרא (upsert announcement_reads). getSession (לא getUser) למזהה.
- tsc + build נקיים. נשאר: deploy + בדיקה חיה (שליחה מהמועצה → פעמון אצל מכינה ממוקדת).
- deploy (2026-06-08): commit 5da7519 → Vercel READY (dpl_9b56aSGmhL3bnqwWZWvAzi99FpFW), חי. get_advisors security: רק אזהרות קיימות מראש (search_path בהלפרים, candidates_public_insert, leaked-password) — שום אזהרה על הטבלאות החדשות, RLS תקין. נשאר: בדיקה חיה end-to-end (מועצה שולחת → פעמון אצל מכינה ממוקדת).
- עיצוב התראת הפעמון (Topbar): כל הודעה מציגה כעת attribution "מועצת המכינות" עם אייקון Megaphone בעיגול primary, כותרת bold, תוכן, ותאריך עם אייקון שעון (subtle, לא כתום). נראה מקצועי/רשמי.
- הבהרה לרן (לא שינוי קוד): כרטיס "TEST · 0" בלוח הבקרה = אחד מ-3 כרטיסי המדדים שמציגים שמות שלבי קבלה (אמצעי/אחרון). יש שלב פייפליין בשם "TEST" עם 0 מועמדים. להסרה: הגדרות → ניהול שלבים.
- מחיקת data (לבקשת רן): נמחק שלב פייפליין "TEST" (id adb60f7a..., org מכינת רעות 1111..., 0 מועמדים) שהופיע ככרטיס מדד בלוח הבקרה. נשארו: טופס הוגש/סינון/מיון פרונטלי. ללא שינוי קוד/deploy — הלוח קורא מ-DB.

## 2026-06-08 — יומן פעולות (Audit, שלב 4 חלק ב') — נבנה
- רן בחר עיצוב "ציר זמן מקובץ" (מתוך 3 אופציות עם previews) כדי שלא יהיה עמוס.
- מסך /council/audit: app/(council)/council/audit/page.tsx (server) הופך audit_log גולמי למשפטים קריאים — actor (embed users), org name (map), movement name (map). פעולות: announcement.create→"שלח הודעה «...»", org.update/status_change/movement_change→"עדכן/שינה את {מכינה}". labels עבריים לשדות+ערכים (status/gender/religious/movement). dayHeader+time מחושבים בשרת לפי Asia/Jerusalem (נמנע hydration mismatch).
- רכיב AuditTimeline (client): שורה אחת לכל פעולה + אייקון, קיבוץ לפי יום (היום/אתמול/תאריך), סינון (כל/הודעות/עדכוני מכינות), "טען עוד" (30), ופרטים (לפני→אחרי) נפתחים בלחיצה. אנטי-עומס.
- תפריט המועצה: "Audit"→"יומן פעולות" (עברית).
- tsc + build נקיים.

## 2026-06-08 — ליטושים נוספים בצד מועצה
- כפתורי סינון יומן פעולות: מצב נבחר עדין (primary-soft) במקום שחור מלא.
- דוחות מועצה (ReportsControls): בורר מכינות קיבל "בחר הכל"/"נקה הכל" + קו מפריד מעל הרשימה.
- אותו "בחר הכל" נוסף גם במודאל ההודעה החדשה (AnnouncementCreateButton) — עקביות.
- הוסר כפתור "PDF בדיקה (זמני)" מהדוחות (סוגר את זנב RAN-15).

## 2026-06-08 — עיצוב מחדש של PDF דוחות המועצה (אופציה 3)
- רן ביקש 3 אופציות עיצוב כ-HTML. נוצר mechinet - ui/pdf-design/index.html (3 עמודי A4). בחר אופציה 3 — דשבורד מודרני.
- lib/reports/pdf.tsx נכתב מחדש (@react-pdf): לוגו מועצת המכינות למעלה (data-URI מ-lib/reports/council-logo.png), תקופה ברורה "מ־DD/MM/YYYY עד DD/MM/YYYY" (היה מבלבל), KPI card 4 תאים (סך מועמדים/מכינות בדוח/מובילה/ממוצע), טבלת national עשירה: דירוג 1-N + שם + תנועה + פס-נתונים כחול (יחסי למוביל) + סטטוס צבעוני. footer בעברית ("מועצת המכינות"/עמוד X מתוך Y/הופק) — תוקן overlap ע"י paddingBottom ברמת Page (היה padding:0 → תוכן נכנס מתחת ל-footer הקבוע).
- compare/stages: אותו header/KPI/footer + GenericTable. פלטה עברה מ-orange ל-blue (מהלוגו).
- אומת: smoke-test רינדר PDF אמיתי (font+logo+bars+RTL) → נקרא ויזואלית, הלוגו והפריסה תקינים. הוסר "←" (Rubik חסר גליף → נקודה).
- לוגו הועתק ל-lib/reports/council-logo.png (נארז כמו הפונטים) + public/council-logo.png.
- tsc + build נקיים.
- תיקוני PDF (לבקשת רן): (1) KPI "מכינה מובילה" נשבר (שם ארוך בפונט 21) → שם ב-13px + "X מועמדים" מתחת. (2) academyLabel — שמות שהם רק מקום (אופקים) מוצגים "מכינת אופקים" (אם אין כבר קידומת מכינ). הוחל בטבלאות national/compare/stages + ב-KPI. (3) מכינת רעות הייתה status=archived (מבדיקות) → הוחזרה ל-active ב-DB. אומת ב-smoke render.
