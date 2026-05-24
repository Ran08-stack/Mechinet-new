---
name: mechinet-skill-router
description: Use ALWAYS at start of any Mechinet task and before any non-trivial action. Maps Hebrew user phrases and project-specific contexts to the correct skill from the 90+ available skills (Mechinet/User/Plugins). Prevents wrong skill selection when user writes in Hebrew or references mechinet-specific files like "מסך X" or "mechinet - ui/*.html". Triggers on: any Hebrew sentence about UI/קוד/עיצוב/DB/deploy/טופס/RTL/מועמד/מכינה, any reference to files in "mechinet - ui/", any task requiring tokens/colors extraction, any screen audit/comparison, any marketing/landing/copy task in Hebrew.
metadata:
  type: router
---

# Mechinet Skill Router

ראוטר חובה: כל בקשה בעברית או הקשר Mechinet — בדוק כאן קודם איזה skill מתאים, ואז הפעל אותו.

## כלל ברזל

לפני כל פעולה לא טריוויאלית בפרויקט Mechinet:
1. סרוק טבלת המיפוי למטה
2. אם יש התאמה → הפעל את ה-skill דרך `Skill tool`
3. אם 2+ skills מתאימים → הפעל את הספציפי יותר, או שאל את רן

## טבלת מיפוי — עברית → Skill

### עיצוב / UI / מסכים

| המשתמש כותב/מתכוון | Skill | הערה |
|---|---|---|
| "תוציא tokens / צבעים / גופן מ-HTML" | `extract-design-system` | רץ על קבצי `mechinet - ui/*.html` |
| "תקרא את `mechinet - ui/NN file.html` ותוציא X" | `extract-design-system` | זיהוי לפי path |
| "להלביש מסך" / "לעצב מסך X" / "להתאים ל-HTML" | `mechinet-screen-port` | תהליך מסך מ-HTML |
| "audit UI" / "סקור עיצוב" / "WIG" / "accessibility" | `vercel-web-design-guidelines` | |
| "שדרג עיצוב קיים" / "תעיף את הריח של AI" / "premium" | `redesign-skill` | |
| "תמונה/mockup → קוד" | `image-to-code-skill` | |
| "compound component" / "render prop" / "refactor props" | `vercel-composition-patterns` | |
| "DESIGN.md" / "Stitch design system" | `stitch-skill` או `stitch-extract-design-md` | extract מקוד קיים = השני |
| "תרשום HTML סטטי מהאתר החי" | `stitch-extract-static-html` | inline CSS+images |
| "תעלה את הקוד שלי כ-design ב-Stitch" | `stitch-code-to-design` | |
| "בנה landing / poster / artifact מורכב" | `web-artifacts-builder` או `canvas-design` | canvas=סטטי, artifacts=React |
| "תבנה UI יפה / רכיב חדש" כללי | `frontend-design` | ברירת מחדל |

### קוד / Stack

| המשתמש כותב | Skill |
|---|---|
| כל כתיבת/עריכת קוד | `mechinet-code-rules` (חובה תמיד) |
| "טבלה חדשה" / "migration" / "RLS" / "סכמה" | `mechinet-supabase-migration` |
| כל שאלת Supabase (auth, realtime, queries, RLS debug) | `supabase:supabase` |
| אופטימיזציית Postgres / query slow | `supabase:supabase-postgres-best-practices` |
| "תפרוס" / "deploy" / "להעלות לאתר" / "vercel --prod" | `mechinet-deploy` |
| Next.js routing/SSR/cache/Server Components | `vercel:nextjs` |
| TSX best practices / hooks audit | `vercel:react-best-practices` |
| env vars / `.env` issues | `vercel:env-vars` |
| middleware/proxy | `vercel:routing-middleware` |
| Functions/timeouts/cron | `vercel:vercel-functions` |
| shadcn install/theming | `vercel:shadcn` |
| AI features / OpenAI / streaming | `vercel:ai-sdk` או `vercel:ai-gateway` |

### Debug / Test / Verify

| המשתמש כותב | Skill |
|---|---|
| "באג" / "לא עובד" / "throwing" / "regression" | `diagnose` ואז `superpowers:systematic-debugging` |
| "תפתח issue" / "triage" | `triage` |
| "כתוב טסטים / TDD / red-green" | `matt-tdd` |
| "תבדוק שהמסך עובד" / "תוודא ש-X" / "PR וריפיקציה" | `verify` או `webapp-testing` |
| "צלם מסך / סקרין שוט / השווה ל-HTML" | `browser-use` |
| "תאמת שהקוד תקין לפני commit" | `superpowers:verification-before-completion` |

### Memory / Plan / Session

| המשתמש כותב | Skill |
|---|---|
| "מאיפה עצרנו" / "התחל סשן" / "סשן חדש" | `mechinet-session-start` |
| "תזכור ש-" / החלטה חדשה / בלוקר / כלל חדש | `mechinet-memory-update` |
| "תכנן לפני שתבנה" / multi-step / סקיצה | `superpowers:writing-plans` |
| "סיעור מוחות" / רעיון פיצ'ר חדש | `superpowers:brainstorming` |
| "צ'אט חדש — תכין handoff" | `handoff` |

### Skill/Plugin building (לקראת שחרור פומבי)

| המשתמש כותב | Skill |
|---|---|
| "תבנה skill חדש" / "תייצר plugin" | `skill-creator` |
| "כתוב skill בסגנון Matt Pocock" | `write-a-skill` |
| "תכין MCP server" | `mcp-builder` |
| "תבדוק את ה-skill בלחץ" / pressure test | `superpowers:writing-skills` |

### Marketing / מוצר / Landing

| המשתמש כותב | Skill |
|---|---|
| "אונבורדינג" / "activation" / "first-run" | `marketing-onboarding` |
| "קופי" / "תכתוב landing/pricing/features" | `marketing-copywriting` |
| "אסטרטגיית תוכן" / "topic clusters" / "מה לכתוב בבלוג" | `marketing-content-strategy` |
| "אימייל קר" / "outreach למכינות" | `marketing-cold-email` |
| "churn" / "שימור" / "save offer" | `marketing-churn-prevention` |
| "תמחור" / "tiers" / "freemium" | `marketing-pricing` |
| "Product Hunt" / "השקה" / "GTM" | `marketing-launch` |
| "VS ATS אחר" / "comparison page" | `marketing-competitors` |
| "popup" / "exit intent" / "לכידת מייל" | `marketing-popups` |

### Office docs

| המשתמש כותב | Skill |
|---|---|
| "ייצוא מועמדים ל-PDF" / "קרא PDF טופס מועמד" | `pdf` |
| "Word / docx / חוזה קבלה" | `docx` |
| "Excel / xlsx / csv מועמדים" | `xlsx` |

## דו-משמעות — איך לבחור

**שני skills מתאימים?** דרג לפי:
1. **ספציפי לפני כללי** — `mechinet-deploy` > `vercel:deploy`
2. **פרויקט לפני user-level** — `mechinet-*` > `extract-design-system`
3. **task-specific לפני general** — `extract-design-system` > `frontend-design` כשמדובר ב-tokens מ-HTML
4. **דוגמה:** "בנה UI מ-HTML של מסך 7" → `mechinet-screen-port` (לא `frontend-design`, לא `extract-design-system`).

## מתי **לא** להשתמש בראוטר

- בקשה טריוויאלית (שאלה כללית, שיחה)
- כשהמשתמש ציין שם skill מפורש ("תפעיל extract-design-system")
- כשכבר הפעלת skill בתור הזה
