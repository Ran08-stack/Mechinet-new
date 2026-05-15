---
name: mechinet-session-start
description: Start-of-session ritual for the Mechinet project. Reads the 3 memory files plus the screen tracker, summarizes where work stopped, and surfaces the next item. Use at the beginning of any Mechinet chat, or when the user says "מאיפה עצרנו", "התחל סשן", "סשן חדש", "קרא זיכרון".
---

# Mechinet — Session Start

מטרה: לפתוח כל סשן Mechinet עם תמונת מצב מלאה, בלי שרן יצטרך לבקש.

## מתי להפעיל
- בתחילת כל צ'אט חדש בפרויקט Mechinet.
- כשרן כותב "מאיפה עצרנו" / "התחל סשן" / "קרא זיכרון" / "סשן חדש".

## סדר הפעולות

1. קרא את הקבצים האלה לפי הסדר:
   - `CLAUDE.md` (שורש הפרויקט) — כללי עבודה.
   - `memory/instructions.md` — כללי סשן.
   - `memory/context.md` — מי רן, מה הפרויקט, מה הוחלט.
   - `memory/memory.md` — לוג אירועי סשן.
   - `memory/מעקב-מסכים.md` — סטטוס כל 16 המסכים.

2. הצג סיכום קצר בעברית בלבד, במבנה הזה:

   ```
   ## מצב Mechinet — [תאריך]

   סטטוס כללי: [Sprint נוכחי + משפט אחד]

   הושלם לאחרונה: [2-3 bullets מהלוג האחרון]

   הבא בתור: [המסך/פיצ'ר הבא לפי מעקב-מסכים.md]

   חסום: [אם יש — מה תלוי במה]
   ```

3. שאל את רן: "ממשיכים מ-[הבא בתור], או נושא אחר?"

## כללים
- עברית בלבד. ישיר, בלי מלל מיותר.
- אל תתחיל לעבוד לפני שרן אישר את הנושא.
- אם קובץ זיכרון חסר — אמור זאת, אל תמציא.
- זה skill של קריאה בלבד — אל תיגע בקוד או בקבצים בשלב הזה.
