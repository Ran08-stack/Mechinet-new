---
name: mechinet-screen-port
description: Structured process for porting a Mechinet screen design from the HTML mockups in "mechinet - ui/" into the live Next.js code. Use when the user asks to "להלביש מסך", "לעצב מסך X", "להתאים את המסך ל-HTML", "screen port", or wants a screen to match its mockup pixel-by-pixel.
---

# Mechinet — Screen Port

מטרה: להלביש מסך קוד קיים בעיצוב מתוך `mechinet - ui/`, בצורה כירורגית, בלי לשבור לוגיקה.

## רקע
- 16 מסכי עיצוב מוכנים בתיקייה `mechinet - ui/` (HTML, Navy/Orange/Teal, Rubik, RTL).
- design tokens כבר בקוד: `app/globals.css` + `tailwind.config.js`.
- רן רוצה התאמה מדויקת ל-HTML המקור — לא "בהשראת".
- מעקב הסטטוס: `memory/מעקב-מסכים.md`.

## סדר הפעולות

1. **זהה את המסך** — מצא את קובץ ה-HTML המתאים ב-`mechinet - ui/` (לפי המספר/שם) ואת קובצי הקוד הקיימים (`app/...` + `components/...`).

2. **קרא את שניהם** — ה-HTML המקור והקוד הקיים. מפה: אילו אלמנטים ויזואליים יש ב-HTML, ומה כבר קיים בקוד.

3. **הצהר הנחות** — לפני שינוי, אמור בקצרה:
   - אילו className/מבנה ישתנו.
   - מה מ-HTML *לא* ייושם כי אין לו קוד תומך (פיצ'ר חסר תשתית) — אלה הולכים ל`memory/מעקב-מסכים.md` תחת "חסר".

4. **שנה כירורגית** — החלף className ומבנה JSX בלבד. **אל תיגע** ב:
   - שאילתות Supabase.
   - לוגיקת state / handlers.
   - רשימות נתונים (ערים, בתי ספר וכו').

5. **אמת** — הרץ `npx tsc --noEmit`. חייב לעבור נקי.
   - הערה: `npm run build` נופל ב-timeout בסביבה — אל תסתמך עליו. אימות אמיתי קורה ב-deploy.

6. **עדכן מעקב** — ב-`memory/מעקב-מסכים.md`, עדכן את הסעיף של המסך: סטטוס, מה נעשה, קבצים, מה נשאר חסר.

7. **עדכן לוג** — append bullet עם תאריך ל-`memory/memory.md`.

## כללים
- שינוי כירורגי בלבד. אל תשפר קוד סמוך. אל תמחק dead code שלא שלך.
- אם כתבת מעל 200 שורות ואפשר 50 — כתוב מחדש.
- עברית בלבד בתקשורת.
- אם משהו ב-HTML לא ברור איך לתרגם לקוד — עצור ושאל, אל תמציא.
- מסך אחד בכל פעם, עם אישור רן לכל אחד (אלא אם רן ביקש לרוץ על רשימה).
