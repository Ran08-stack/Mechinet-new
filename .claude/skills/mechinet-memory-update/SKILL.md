---
name: mechinet-memory-update
description: Structured memory updates for the Mechinet project, following the iron rule of real-time documentation. Use when something worth remembering comes up — a decision, result, blocker, new feature direction, new rule, or fact about Ran or the project. Also at end of session.
---

# Mechinet — Memory Update

מטרה: לתעד מידע חדש בזמן אמת לקובץ הנכון, לפי כלל הברזל של הפרויקט.

## כלל הברזל
בכל פעם שמידע חדש עולה בסשן — עדכן את הקובץ הרלוונטי **מיד**. אל תתן לעובדות לברוח.
כלל אצבע: אם יש ספק אם לתעד — תשאל ותתעד.

## לאיזה קובץ — מתי

| סוג מידע | קובץ | אישור? |
|---|---|---|
| אירוע סשן (החלטה, תוצאה, בלוקר, מה נעשה) | `memory/memory.md` | לא — רק append |
| שינוי פרויקט (כיוון חדש, פיצ'ר, עדיפויות) | `memory/context.md` | כן — הצע והמתן |
| כלל חדש או העדפה | `CLAUDE.md` + `memory/instructions.md` | כן — הצע והמתן |
| עובדה על רן או הפרויקט | `memory/context.md` | כן — הצע והמתן |
| התקדמות במסך | `memory/מעקב-מסכים.md` | לא — עדכן ישירות |

## פורמט

### append ל-memory.md
תחת הסעיף של התאריך הנוכחי, bullet בעברית:
```
- 2026-XX-XX: [מה קרה — החלטה / תוצאה / בלוקר, משפט אחד ישיר].
```
אם אין סעיף לתאריך — צור אחד: `### 2026-XX-XX — [נושא הסשן]`.

### הצעת עריכה ל-context.md / CLAUDE.md
- הצג לרן את הניסוח המדויק שתוסיף/תשנה.
- המתן לאישור מפורש.
- אם רן לא אישר — סמן בלוג כ"הצעת עריכה לא אושרה".

## בסיום סשן
1. append bullet אחד מסכם ל-`memory/memory.md` עם תאריך.
2. אם הסשן נגע בכמה נושאים — שקול עדכון `memory/context.md`.
3. סמן כל הצעת עריכה שלא אושרה.

## כללים
- תאריכים תמיד מוחלטים (לא "אתמול" / "יום חמישי").
- עברית בלבד.
- אל תכתוב תוכן זיכרון כפול — בדוק אם יש bullet קיים לעדכן קודם.
- `memory.md` = append בלבד, לא לערוך שורות ישנות.
