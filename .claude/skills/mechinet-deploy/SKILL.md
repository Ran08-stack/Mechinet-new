---
name: mechinet-deploy
description: The working deploy process for Mechinet to Vercel. Use when the user asks to "להעלות לאתר", "deploy", "לעלות ל-Vercel", "לפרוס", or wants the live site updated. Documents why git push does NOT work for this project and what to do instead.
---

# Mechinet — Deploy

מטרה: לפרוס את Mechinet ל-Vercel בצורה שעובדת, בלי להיתקע ב-git המזוהם.

## רקע — למה לא git push
- ה-git repo מזוהם: היסטוריה ישנה מלאה ב-`node_modules` (129MB), `index.lock` נתקע, בעיות הרשאות בסביבה.
- ניסיונות commit/push מהסביבה נכשלו שוב ושוב.
- **הפתרון שעובד:** `vercel --prod` ישירות מהטרמינל של רן. Vercel בונה בענן, הבנייה עוברת תקין שם.

## סדר הפעולות

1. **ודא שהקוד מוכן** — הרץ `npx tsc --noEmit`, חייב לעבור נקי.
   (`npm run build` נופל ב-timeout בסביבה — לא אינדיקציה. Vercel יבנה בענן.)

2. **תן לרן את הפקודה** — Claude לא יכול להריץ deploy מהסביבה. רן מריץ בטרמינל שלו:
   ```
   cd C:\Users\Ran\Desktop\Mechinet
   vercel --prod
   ```

3. **אם רן מתעקש לתקן git קודם** — לפני push חובה:
   ```
   git rm --cached .env.local
   ```
   (`.env.local` עדיין tracked מ-commit ישן — push בלעדי זה ידלוף סודות.)
   אבל בפועל: עדיף לדלג על git ולהשתמש ב-`vercel --prod`.

4. **אחרי deploy** — בקש מרן לאמת ב-https://mechinet-new.vercel.app שהשינוי עלה.

5. **עדכן לוג** — append bullet עם תאריך ל-`memory/memory.md`: מה נפרס.

## כללים
- אל תנסה להריץ git push מהסביבה — זה ייכשל, מבזבז זמן.
- אל תנסה "לתקן" את ה-git repo המזוהם — הוחלט לזנוח אותו.
- `vercel --prod` מהטרמינל = הדרך היחידה שעובדת.
- עברית בלבד בתקשורת.
