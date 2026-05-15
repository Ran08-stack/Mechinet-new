---
name: mechinet-supabase-migration
description: Process for adding or changing a Supabase table in Mechinet — migration, RLS policy, and refreshing types/database.ts. Use when the user wants to "להוסיף טבלה", "לשנות סכמה", "migration", "טבלה חדשה ב-Supabase", or any change to the database structure.
---

# Mechinet — Supabase Migration

מטרה: להוסיף/לשנות טבלה ב-Supabase בצורה עקבית, כולל RLS ועדכון ה-types — בלי קבצים פגומים.

## רקע
- פרויקט Supabase: Mechinet-new, id `jlliayuelzvmqxvwdihr`, region eu-central-1.
- כל טבלה חייבת RLS מופעל עם policy לפי `organization_id` (כל מכינה רואה רק את שלה).
- חשבון council רואה אגרגציה בלבד — אין drill-down לרשומת מועמד.
- `types/database.ts` נכתב ביד והתקלקל בעבר מ-CRLF + חיתוך של Edit tool.

## סדר הפעולות

1. **הצהר הנחות** — לפני migration, אמור: שם הטבלה, העמודות, היחסים, מי אמור לראות מה.

2. **כתוב את ה-migration** — SQL ל:
   - יצירת הטבלה.
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
   - policies לפי התבנית הקיימת בטבלאות הקודמות (organizations, candidates, interviews) — העתק את הדפוס, אל תמציא.

3. **הרץ את ה-migration** — דרך Supabase MCP על project `jlliayuelzvmqxvwdihr`.

4. **רענן את ה-types** — עדכן `types/database.ts`:
   - **חובה לכתוב דרך bash heredoc**, לא דרך Edit tool. ה-Edit tool גרם בעבר לחיתוך ולקבצים פגומים.
   - ודא line endings תקינים (LF, לא CRLF).
   - הוסף את ה-interface החדש + כל enum נלווה.

5. **אמת** — `npx tsc --noEmit` נקי.

6. **עדכן לוג** — append bullet עם תאריך ל-`memory/memory.md`: איזו טבלה, אילו policies, מה השתנה ב-types.

## כללים
- כל טבלה — RLS חובה. בלי יוצא מן הכלל.
- `types/database.ts` — תמיד דרך bash heredoc, לעולם לא Edit tool.
- אל תוסיף עמודות שלא התבקשו.
- אם לא ברור מי אמור לראות את הנתונים — עצור ושאל, אל תמציא policy.
- עברית בלבד בתקשורת.
