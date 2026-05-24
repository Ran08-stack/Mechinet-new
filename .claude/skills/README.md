# Mechinet — Skills Index

מפת הסקילים הזמינים לפרויקט. נחלקת ל-3 שכבות:
1. **Mechinet** (project) — ייעודיים לפרויקט, ב-`.claude/skills/`
2. **User** (global) — הותקנו ב-`~/.claude/skills/` מ-skills.sh
3. **Plugins** — מ-marketplaces (Vercel, Supabase, Superpowers, Caveman, Code-Review, Frontend-Design)

---

## שכבה 1 — Mechinet (ייעודיים)

| Skill | מתי |
|---|---|
| `mechinet-session-start` | תחילת סשן / "מאיפה עצרנו" |
| `mechinet-screen-port` | הלבשת מסך לפי HTML ב-`mechinet - ui/` |
| `mechinet-deploy` | `vercel --prod` |
| `mechinet-supabase-migration` | טבלה/סכמה/RLS חדשה |
| `mechinet-code-rules` | אכיפת כללי CLAUDE.md |
| `mechinet-memory-update` | תיעוד החלטה/תוצאה |

---

## שכבה 2 — User skills (חדש)

### עיצוב / UI-from-HTML (שלב נוכחי)
| Skill | תפקיד |
|---|---|
| `extract-design-system` | חילוץ tokens מ-HTML/אתר → tokens.json |
| `taste-skill` | סטנדרט senior UI/UX |
| `redesign-skill` | שדרוג קוד קיים לאיכות פרימיום |
| `image-to-code-skill` | תמונה/mockup → קוד |
| `stitch-skill` | DESIGN.md בסגנון Google Stitch |
| `stitch-code-to-design` | קוד → Stitch design |
| `stitch-extract-design-md` | DESIGN.md מקוד קיים |
| `stitch-extract-static-html` | inline CSS/images לסטטי |
| `vercel-web-design-guidelines` | audit UI לפי WIG |
| `vercel-composition-patterns` | React composition (compound, render-props) |
| `canvas-design` | פוסטרים/ויזואל סטטי |
| `web-artifacts-builder` | HTML artifacts מורכבים |

### בנייה של Skills/Plugins (לבניית sources לשחרור בעתיד)
| Skill | תפקיד |
|---|---|
| `skill-creator` | יצירת/עריכת/eval של skills |
| `write-a-skill` | סגנון Matt Pocock לכתיבה |
| `mcp-builder` | בניית MCP server |

### Debug/Test
| Skill | תפקיד |
|---|---|
| `diagnose` | debug loop ממוקד |
| `triage` | state machine לטריאז' issues |
| `matt-tdd` | red-green-refactor |
| `webapp-testing` | Playwright לאתר חי |
| `browser-use` | אוטומציית דפדפן + screenshots |

### Productivity
| Skill | תפקיד |
|---|---|
| `handoff` | דחיסת שיחה למסמך handoff |

### מסמכים
| Skill | תפקיד |
|---|---|
| `pdf` / `docx` / `xlsx` | ייצוא/ייבוא קבצי office |

### Marketing/CRO (כשעולים לאוויר)
| Skill | מתי |
|---|---|
| `marketing-onboarding` | אקטיבציה למכינות חדשות |
| `marketing-cold-email` | פנייה למכינות |
| `marketing-copywriting` | landing/pricing/features |
| `marketing-content-strategy` | תוכן + topic clusters |
| `marketing-churn-prevention` | שימור מכינות |
| `marketing-pricing` | tiers + packaging |
| `marketing-launch` | Product Hunt + beta |
| `marketing-competitors` | דפי "vs ATS X" |
| `marketing-popups` | לכידת leads |

---

## שכבה 3 — Plugins (ממשיכים לעבוד)

- `vercel:*` — deploy, env, nextjs, supabase, shadcn, ai-sdk וכו'
- `supabase:*` — DB + RLS + postgres best practices
- `superpowers:*` — brainstorming, TDD, debug, plans, writing-skills
- `caveman:*` — מצב קצר
- `code-review:code-review` — סקירת PR
- `frontend-design:frontend-design` — UI generation

---

## תוכנית עתידית — Mechinet Plugin Public Release

לבנות 3-5 skills חדשים שיכולים לעניין גם מחוץ לפרויקט:
- `hebrew-rtl-nextjs` — RTL + Rubik + ולידציה ת"ז/טלפון IL
- `supabase-rls-multitenant` — תבניות RLS לפי organization_id
- `supabase-realtime-feed` — דפוס LiveActivity (INSERT subscribe)
- `nextjs-form-builder-jsonb` — טפסים דינמיים JSONB ב-Postgres
- `screen-audit-vs-mockup` — השוואת מסך חי ל-HTML מקור (browser-use)

אחרי בנייה → publish ב-skills.sh.
