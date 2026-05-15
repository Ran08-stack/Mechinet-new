# Mechinet — Instructions

## כללי עבודה ראשיים
נמצאים ב-`CLAUDE.md` בשורש הפרויקט. קרא אותו תחילה.

## מבנה קבצי זיכרון
- `memory/context.md` — מי רן, מה הפרויקט, מה הוחלט.
- `memory/instructions.md` — הקובץ הזה (הפניה ל-CLAUDE.md).
- `memory/memory.md` — לוג סשנים (append-only).

## סדר קריאה בתחילת כל סשן
1. `CLAUDE.md` (שורש)
2. `memory/context.md`
3. `memory/memory.md`
4. המשך מהמקום שנעצרנו.

## עדכון זיכרון
- אירועי סשן → append ל-`memory.md` ללא אישור.
- שינוי פרויקט / כלל חדש → הצע + המתן לאישור רן.
- ספק? תשאל ותתעד.

## פרויקטים פעילים
- `Mechinet/` — MechinaFlow, SaaS למכינות קדם-צבאיות.
