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
