---
name: mechinet-deploy
description: The working deploy process for Mechinet to Vercel. Use when the user asks to "להעלות לאתר", "deploy", "לעלות ל-Vercel", "לפרוס", or wants the live site updated.
---

# Mechinet — Deploy

מטרה: לפרוס את Mechinet ל-Vercel בצורה שעובדת.

## רקע
- ה-git repo נבנה מחדש מאפס ב-15.05.2026 — נקי, בלי node_modules בהיסטוריה.
- מאז: git push + vercel --prod עובדים בצורה רגילה.
- Vercel מחובר ל-GitHub — הוא בונה את מה שיש ב-GitHub, לא את הקבצים המקומיים.
  לכן חובה לדחוף ל-GitHub לפני deploy.

## סדר הפעולות

1. **ודא שהקוד מוכן** — הרץ `npx tsc --noEmit`, חייב לעבור נקי.
   (`npm run build` נופל ב-timeout בסביבה — לא אינדיקציה. Vercel יבנה בענן.)

2. **תן לרן את הפקודות** — Claude לא יכול להריץ git/deploy מהסביבה. רן מריץ בטרמינל:
   ```
   git add -A
   git commit -m "תיאור השינוי"
   git push origin main
   vercel --prod
   ```

3. **אם git index פגום** ("unknown index entry format" / index.lock תקוע):
   ```
   del .git\index
   git reset
   ```
   ואז להמשיך מ-add. (מוחק רק את ה-index הפנימי, לא קבצים.)

4. **אם push נדחה** ("non-fast-forward"):
   ```
   git push origin main --force
   ```
   בטוח — המחשב של רן הוא מקור האמת.

5. **אחרי deploy** — בקש מרן לאמת ב-https://mechinet-new.vercel.app שהשינוי עלה.
   רענון קשיח (Ctrl+Shift+R). אם 404 — לבדוק שהקוד באמת ב-git ושה-route נכון.

6. **עדכן לוג** — append bullet עם תאריך ל-`memory/memory.md`: מה נפרס.

## כללים
- חובה git push לפני vercel --prod — Vercel בונה מ-GitHub.
- אם push נדחה — --force בטוח.
- אל תנסה להריץ deploy מהסביבה — Claude לא יכול. רק רן בטרמינל.
- עברית בלבד בתקשורת.
