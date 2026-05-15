# Mechinet — Skills

קטגוריה אחת של Skills ייעודיים לפרויקט Mechinet. כל Skill בתיקייה נפרדת.
Claude מזהה אותם אוטומטית בכל סשן שרץ בתוך הפרויקט (`C:\Users\Ran\Desktop\Mechinet`).

## הרשימה

| Skill | מתי נכנס לפעולה |
|---|---|
| `mechinet-session-start` | בתחילת כל צ'אט / "מאיפה עצרנו" — קורא זיכרון, מסכם מצב |
| `mechinet-screen-port` | "להלביש מסך" / "לעצב מסך X" — תהליך התאמה ל-HTML המקור |
| `mechinet-deploy` | "להעלות לאתר" / "deploy" — תהליך vercel --prod שעובד |
| `mechinet-supabase-migration` | "טבלה חדשה" / "migration" — schema + RLS + types |
| `mechinet-code-rules` | בכל כתיבת קוד — אוכף את כללי CLAUDE.md |
| `mechinet-memory-update` | מידע חדש שעולה / סוף סשן — תיעוד לקובץ הנכון |

## איך להפעיל

הפעלה אוטומטית: Claude טוען את ה-Skills האלה לבד כשהתיאור תואם למה שמבקשים.
אין צורך לעשות כלום — כל עוד הסשן רץ בתוך תיקיית Mechinet.

הפעלה ידנית (אם רוצים לכפות): כתוב את שם ה-Skill, למשל:
`תפעיל mechinet-session-start`

## איך זה מתחבר לפרויקט

ה-Skills יושבים ב-`.claude/skills/` — תיקייה שמגיעה עם הפרויקט.
הם נשמרים ב-git ועובדים בכל מחשב/סשן שפותח את הפרויקט.
