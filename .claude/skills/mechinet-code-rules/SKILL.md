---
name: mechinet-code-rules
description: Enforces the Mechinet code-writing rules from CLAUDE.md — simplicity, surgical changes, declaring assumptions, the 200-line limit, Hebrew-only communication. Use whenever writing or editing code in the Mechinet project, or planning a multi-step coding task.
---

# Mechinet — Code Rules

מטרה: לאכוף את כללי כתיבת הקוד של Mechinet בכל שינוי קוד. אלה הכללים מ-`CLAUDE.md`.

## מתי להפעיל
- בכל פעם שכותבים או עורכים קוד בפרויקט Mechinet.
- לפני כל task מרובה שלבים.

## הכללים

### פשטות
- מינימום קוד שפותר את הבעיה. אין פיצ'רים שלא התבקשו.
- אם כתבת 200 שורות ואפשר 50 — כתוב מחדש.

### כירורגיה
- נגע רק במה שנדרש.
- אל תשפר קוד סמוך.
- אל תמחק dead code שלא שלך.

### הנחות
- הצהר הנחות לפני שמתחיל לכתוב.
- אם יש כמה פרשנויות — הצג אותן, אל תבחר בשקט.

### עצור כשלא ברור
- שם מה מבלבל ושאל.
- אל תמציא — לא נתונים, לא APIs, לא לוגיקה.

### לפני task מרובה שלבים
הצג תוכנית קצרה לפני שמתחילים:
```
1. [שלב] → verify: [בדיקה]
2. [שלב] → verify: [בדיקה]
```

### אימות
- `npx tsc --noEmit` חייב לעבור נקי אחרי כל שינוי.
- `npm run build` נופל ב-timeout בסביבה — לא אינדיקציה אמינה.

## תקשורת
- עברית בלבד.
- ישיר, ללא מלל מיותר, ללא אימוג'ים.
- Bullets על פני פרוזה ארוכה.
- לא לערבב עברית ואנגלית באותה שורה.
- ללא ניסוחי AI גנריים ("בואו נצלול", "חשוב לציין").
