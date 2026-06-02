---
name: mechinet-deploy
description: The working deploy process for Mechinet to Vercel. Use when the user asks to "להעלות לאתר", "deploy", "לעלות ל-Vercel", "לפרוס", or wants the live site updated.
---

# Mechinet — Deploy

מטרה: לפרוס את Mechinet ל-Vercel בצורה שעובדת.

## רקע (עודכן 2026-06-02)

- Vercel מחובר ל-GitHub (Ran08-stack/Mechinet-new). **push ל-main מדליק build+deploy אוטומטי** (~50 שניות).
- ה-git מסונכרן: working tree == origin/main == GitHub. `.env*` ב-.gitignore (אסור ל-commit).
- **תהליך ברירת מחדל: commit → push → GitHub בונה ומפרסם.** לא `vercel --prod` מקומי.
  - `vercel --prod` מקומי מעלה קבצים מקומיים ו**עוקף את git** → גורם לסחף בין הקוד החי ל-GitHub. להשתמש רק כ-fallback חירום, ולסנכרן git מיד אחרי.

## סדר הפעולות

1. **ודא שהקוד מוכן** — `npx tsc --noEmit` נקי. אפשר גם `npm run build` (עובר בסביבה, exit 0).

2. **commit ממוקד** — Claude מריץ בעצמו. **stage קבצים ספציפיים, לא `git add -A`** (להימנע מ-.env / artifacts):
   ```
   git add <קבצי הפיצ'ר> memory/memory.md
   git commit -m "תיאור השינוי

   Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
   git push origin main
   ```

3. **אם push נדחה** ("non-fast-forward") — ה-remote התקדם. **לא `--force`** (מוחק commits של ה-remote).
   במקום: `git fetch origin` → בדוק `git log HEAD..origin/main` → `git rebase origin/main` → פתור קונפליקטים → push רגיל.

4. **אם git index פגום** ("unknown index entry format" / index.lock תקוע):
   `rm -f .git/index.lock` (מסיר נעילה תקועה בלבד). אם צריך: `del .git\index; git reset`.

5. **אמת את ה-build** — דרך Vercel MCP (`list_deployments` / `get_deployment` / `get_deployment_build_logs`)
   או בקש מרן לאמת ב-https://mechinet-new.vercel.app (רענון קשיח Ctrl+Shift+R). אם 404 — בדוק route + שהקוד ב-git.

6. **עדכן לוג** — append bullet עם תאריך ל-`memory/memory.md`: מה נפרס + deployment id/url.

## כללים

- ברירת מחדל = push ל-main, לא vercel --prod מקומי.
- Claude מריץ את כל הפקודות בעצמו. רן לא מריץ ידנית.
- אסור `git add -A` עיוור ואסור לחלוטין commit ל-`.env*` (סודות).
- `--force` / פעולות הרסניות — דורש אישור רן מראש.
- עברית בלבד בתקשורת.
