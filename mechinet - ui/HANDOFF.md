# Mechinet — Developer Handoff

> **For your developer / Claude Code session.** This document explains what's been designed, what works today, what needs to be built, and how to take this design forward.
>
> Last updated: 13 May 2026
> Designer: Claude · Project owner: Mechinet team

---

## 1. Project at a glance

**What it is:** A SaaS for managing the application & screening process for Israeli pre-military academies (מכינות קדם־צבאיות).

**Tech stack (confirmed from your repo):**
- Next.js 14 (App Router)
- Supabase (Postgres + Auth + Storage)
- Tailwind CSS + TypeScript
- Deployed on Vercel
- OpenAI for AI features (already wired for AI summary)

**User hierarchy:**
1. **Council of Academies (Super-admin)** — one master account. Cross-academy oversight, manages templates, monitors infrastructure costs.
2. **Individual Academy (Org-admin)** — each academy logs in to manage its own candidates.
3. **Candidate** — applicant filling out the public form. May also have a personal portal to track applications across academies.

**Design language:** Navy primary (#031631) + Orange action (#FE6F42) + Teal AI accent (#44DDC1). Rubik font. RTL Hebrew first.

---

## 2. What you're getting

### File structure
```
mechinet/
├── globals.css                          ← Design tokens + shared components
├── 01 Design Tokens.html                ← Visual showcase of the design system
├── 02 Sidebar Layout.html               ← Sidebar component spec
├── 03 Candidates Table.html             ← Candidates list view
├── 04 Candidate Profile.html            ← Original profile (Heebo / older direction)
├── 04 Candidate Profile v2.html         ← ★ Current profile with AI citations + voting
├── 05 Dashboard.html                    ← Academy admin home (KPIs + actions)
├── 06 Pipeline.html                     ← Kanban board with 5 stages
├── 07 Forms List.html                   ← Forms management grid
├── 08 Form Builder.html                 ← Form editor (Google-Forms style)
├── 09 Apply Form.html                   ← Public applicant form (mobile-first)
├── 10 Candidate Portal.html             ← Mobile portal for the candidate
├── 11 Council Dashboard.html            ← Super-admin national view
├── 12 Calendar.html                     ← Interview scheduling (week view)
├── 13 Interview Evaluation.html         ← In-interview evaluation form
├── 14 Login.html                        ← Login (split-screen + role toggle)
├── 15 Settings.html                     ← Academy settings (org info, stages, AI)
└── HANDOFF.md                           ← This file
```

### Two design eras in this folder
- Files **01–04 (original)** use Heebo + ink-blue accent. Design approved at the time.
- Files **04 v2, 05–15** use the **MechinaFlow** system (Rubik, Navy + Orange + Teal).
- The new system extends `globals.css` so files 01–03 mostly inherit the updates automatically. The sidebar layout pattern in 01–04 differs slightly from 05–15 — keep in mind when re-implementing.

---

## 3. Important corrections from the latest review

These are **decisions made today** that override anything in the mockups:

1. **No half-year (חצי שנתית) academies.** Only annual. Academy types are now a combination of:
   - Gender: מעורב בנים-בנות / רק בנים / רק בנות
   - Religious orientation: דתי / חילוני / מעורב דתי+חילוני

   Already updated in `15 Settings.html` and `11 Council Dashboard.html`.

2. **No billing tab for individual academy.** Academies don't pay through the app. Removed from `15 Settings.html`.

3. **Council pays infrastructure centrally.** Supabase + Vercel + email service costs are shown only on the Council Dashboard (added a panel for this). Roughly $284/month for the current scale (~$4.50 per academy).

4. **AI should be a small, practical helper — not central.** The first pass had too much AI prominence. Scale back:
   - Keep: AI summary on candidate profile (with citations), suggested interview questions, text-polish helpers on note fields, smart "auto-schedule" as a small option (not a hero CTA).
   - Reduce: AI fit scores as default chips, big "AI insights" tables, bias warnings as default banners.
   - Style: when AI shows up, it should look like a *tool the user reaches for*, not an *autopilot*.
   - **This tone-down is partially done — the Dashboard sub-copy is softer, the "AI insights" panel relabeled to "candidates needing attention". A follow-up pass on Pipeline / Calendar prominence is recommended.**

---

## 4. What's already functional in your codebase

| Feature | Status | File in repo |
|---|---|---|
| Auth (login / signup) | ✅ Works | `app/(auth)/login/page.tsx` |
| Candidates list with filters | ✅ Works | `app/(dashboard)/candidates/page.tsx` + `components/candidates/CandidatesTable.tsx` |
| Candidate profile (basic) | ✅ Works | `app/(dashboard)/candidates/[id]/page.tsx` |
| Stage selector with optimistic update | ✅ Works | `components/candidates/StageSelector.tsx` |
| AI summary generation | ✅ Works (basic) | `components/candidates/AISummaryButton.tsx` + `app/api/ai/summary/route.ts` |
| Manual notes | ✅ Works | `components/candidates/NotesEditor.tsx` |
| Forms list, copy link, delete | ✅ Works | `app/(dashboard)/forms/page.tsx` |
| Form builder | ✅ Works | `components/forms/FormBuilder.tsx` |
| Public application form | ✅ Works | `app/apply/[formId]/page.tsx` |
| Pipeline kanban | ✅ Works (basic) | `app/(dashboard)/pipeline/page.tsx` + `components/pipeline/KanbanBoard.tsx` |
| Settings (org name, logo, stages) | ✅ Works | `app/(dashboard)/settings/page.tsx` |

**Database schema (from `types/database.ts`):**
- `organizations`, `users`, `candidates`, `forms`, `pipeline_stages` — all good.
- Candidate has: `ai_summary` (text), `answers` (jsonb), `attachments` (jsonb), `notes` (text), `stage` (text), and the standard fields.

This means: **the daily workflow for one academy admin already works end-to-end today.** What we designed is mostly **(a) visual polish** and **(b) new features**.

---

## 5. What needs to be built

### 🟢 Tier 1 — UI swap on existing functionality (easy)
Just take the new HTML/CSS and re-implement the corresponding Next.js page/component. No backend changes.

| Screen | Action |
|---|---|
| 02 Sidebar Layout | New `Sidebar` component for `app/(dashboard)/layout.tsx` |
| 03 Candidates Table | Restyle `CandidatesTable.tsx` |
| 04 v2 Candidate Profile | Restyle `[id]/page.tsx` + child components. Hero, stage strip, two-column body. |
| 06 Pipeline | Restyle `KanbanBoard.tsx`. Add drag-and-drop persistence to Supabase. |
| 07 Forms List | Restyle `forms/page.tsx` — add stats per form (just `count(*)` from candidates table). |
| 08 Form Builder | Restyle `FormBuilder.tsx`. Keep existing field-type logic. |
| 09 Apply Form | Restyle `apply/[formId]/page.tsx`. |
| 14 Login | Restyle `(auth)/login/page.tsx`. |
| 15 Settings | Restyle `settings/page.tsx`. Update academy type field. |

### 🟡 Tier 2 — Small additions to schema or API (medium)
Each requires a small migration + new component.

| Feature | Needs |
|---|---|
| **AI citations on candidate profile** | Change `ai_summary` from `text` to `jsonb` like `{ insights: [{text, sources: [{form_field_id, quote}]}] }`. Modify `/api/ai/summary` to return structured output. |
| **AI insight voting (V/X)** | New table `ai_insight_votes (insight_id, user_id, verdict)` for learning + audit. |
| **Form statistics on the list page** | Aggregation query: completion %, response count, avg time. |
| **Dashboard KPIs** | Simple queries: count by stage, recent activity. |
| **Activity timeline on profile** | New table `candidate_events (candidate_id, type, payload, actor_id, created_at)` + write events from existing actions. |
| **Stuck candidates panel** | Query: candidates whose `updated_at` > 5 days in non-terminal stage. |
| **"שפר טקסט" / polish helper on notes** | Small API endpoint that takes text + returns polished version. |

### 🟠 Tier 3 — New features (big)
| Feature | Notes |
|---|---|
| **Calendar / interview scheduling (12)** | New `interviews` table + week view UI. CRUD + reminder logic. WhatsApp/email sends. |
| **Interview evaluation form (13)** | New `interview_evaluations` table (tags, scale, notes). UI from mockup. |
| **WhatsApp integration** | WhatsApp Business API account + webhook handler + message templates. |
| **Candidate Portal (10)** | A second user type (the applicant). Passwordless email magic-link auth. New RLS rules. Multi-academy view. |
| **Council Super-admin (11)** | New role on `users` table. RLS that grants cross-org access. Aggregation queries. Infrastructure cost panel (manual entry or API integration with Supabase/Vercel billing). |
| **AI-suggested interview questions (in 13)** | API that takes candidate context and returns 3 questions with source citations. Use Claude or GPT-4o. |
| **Document signing (in candidate portal)** | Optional. Use a third-party (e.g. SignWell) or build minimal flow. |
| **AI fit score** | Skip unless you decide it's needed. The user has explicitly asked for less AI-as-decision-maker. |

---

## 6. Suggested implementation order

**Sprint 1 (1–2 weeks): polish existing**
1. Tier 1 UI swap on the 9 functional screens. This gives you a polished v1.
2. Drag-and-drop persistence on Pipeline.
3. Form stats on the list page.

**Sprint 2 (1–2 weeks): structured AI + activity**
4. Migrate `ai_summary` to structured JSON + add citations UI.
5. Activity timeline (small audit-log table + writes from existing actions).
6. Dashboard KPI cards + "stuck candidates" panel.
7. Notes "polish text" helper.

**Sprint 3 (3–4 weeks): scheduling + evaluation**
8. Interviews schema + Calendar UI.
9. Interview evaluation form.
10. WhatsApp integration (this is the longest dependency).

**Sprint 4 (3–4 weeks): council + candidate portal**
11. Council super-admin (role + RLS + dashboard).
12. Candidate portal (new auth flow + multi-academy view).

---

## 7. Schema changes recommended

```sql
-- AI summary as structured JSON instead of text
ALTER TABLE candidates
  ALTER COLUMN ai_summary TYPE jsonb
  USING jsonb_build_object('legacy_text', ai_summary);

-- Activity audit log
CREATE TABLE candidate_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  type text NOT NULL,                  -- 'stage_changed' | 'note_added' | 'ai_summary' | 'form_submitted' | ...
  payload jsonb,
  actor_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON candidate_events(candidate_id, created_at DESC);

-- AI insight votes (transparency / model improvement)
CREATE TABLE ai_insight_votes (
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  insight_index int NOT NULL,
  user_id uuid REFERENCES users(id),
  verdict text NOT NULL CHECK (verdict IN ('confirmed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (candidate_id, insight_index, user_id)
);

-- Interviews
CREATE TABLE interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interviewer_id uuid REFERENCES users(id),
  scheduled_at timestamptz NOT NULL,
  duration_minutes int DEFAULT 55,
  location text,
  meeting_url text,
  status text NOT NULL DEFAULT 'scheduled', -- scheduled | completed | cancelled | no_show
  created_at timestamptz DEFAULT now()
);

-- Interview evaluations
CREATE TABLE interview_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  evaluator_id uuid REFERENCES users(id),
  tags text[] NOT NULL DEFAULT '{}',     -- ['leadership','initiative',...]
  scale int CHECK (scale BETWEEN 1 AND 4),  -- 1 = not fit, 4 = strong fit
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Update organizations for type attributes (replaces "half-year" etc.)
ALTER TABLE organizations
  ADD COLUMN gender_policy text DEFAULT 'mixed',    -- mixed | boys_only | girls_only
  ADD COLUMN religious_policy text DEFAULT 'mixed'; -- religious | secular | mixed

-- For Council super-admin
ALTER TABLE users
  ALTER COLUMN role TYPE text,           -- already text in your schema
  ADD CONSTRAINT users_role_check
    CHECK (role IN ('council_admin', 'org_admin', 'org_staff', 'candidate'));
```

---

## 8. How to take this to Claude Code

### Option A — Use this whole folder as design reference
1. Download the project folder (or zip it up).
2. Place `mechinet/` next to your repo, or copy it into `docs/design/`.
3. Open Claude Code with both directories visible.
4. Use prompts like:
   ```
   Look at mechinet/05 Dashboard.html. Re-implement
   app/(dashboard)/page.tsx to match the design.
   Keep all the data-fetching from Supabase that I already have —
   only update the JSX structure and styles.
   Use Tailwind classes. Extract reusable pieces into components.
   ```

### Option B — Move tokens into the actual codebase first
1. Copy `globals.css` content into `app/globals.css` (replace what's there).
2. Update `tailwind.config.js` to extend the theme with the new tokens (colors, fonts, radius, shadow). Use CSS variables: `colors: { primary: 'var(--primary)', accent: 'var(--accent)', … }`.
3. Add `<link>` for Rubik & JetBrains Mono in `app/layout.tsx`.
4. Then go screen by screen and re-implement.

### Suggested prompt template
```
I have a Next.js 14 + Supabase + Tailwind project at <path>.
The current implementation of <screen name> is at <file path>.
I want to redesign it to match the mockup at
mechinet/<NN ScreenName>.html.

Constraints:
- Keep all existing data-fetching logic.
- Use the design tokens (colors, spacing, radii) defined in
  app/globals.css.
- Use only Tailwind utilities + shadcn primitives.
- Preserve TypeScript types.

Show me a diff, then apply it.
```

### Things to NOT skip when implementing
- **RTL support.** All layouts assume `dir="rtl"`. Use `inset-inline-start` etc., not `left/right`. Tailwind v3.3+ has logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`).
- **Mobile breakpoints.** The Apply Form (09) and Candidate Portal (10) are designed mobile-first. The admin screens are desktop-first but should remain usable on tablet.
- **Hebrew typography.** Rubik handles Hebrew well. Don't substitute Heebo / system fonts without testing.

---

## 9. What you're **not** getting (so you don't expect it)

These are explicitly **out of scope** of the design work:
- Working CRUD for new tables (interviews, evaluations, citations) — the JSX shows the state, but you need to wire the backend.
- WhatsApp Business API connection — design only.
- Email templates (transactional emails to candidates) — design only.
- Actual map data on the Council Dashboard — the map is a hand-drawn SVG placeholder. Replace with a real map library (react-simple-maps or Mapbox) if you want it interactive.
- File-upload UX with progress bars — only static mockups.
- Print/PDF views — not designed.
- Dark mode — not designed (out of scope for v1).

---

## 10. Open questions / decisions still needed

1. **Candidate authentication method** — magic link, password, or SSO? (Recommendation: magic link via Supabase Auth.)
2. **WhatsApp provider** — official Business API (Cloud API) or third-party gateway? Cost and approval timelines differ a lot.
3. **AI cost budget** — each candidate summary + 3 suggested questions is roughly 4–6k tokens. At GPT-4o pricing, ~$0.02 per candidate. For 12k candidates a year across the network, that's ~$240/year — negligible.
4. **Multi-organization candidates** — should a single applicant's data be shared across academies (with consent), or duplicated? Important privacy decision.
5. **Council intervention rights** — can the council read individual candidate data, or only aggregate? Important for trust & privacy.

---

## 11. Quick reference — file → status

| File | Tier | Notes |
|---|---|---|
| 02 Sidebar | 🟢 swap | Replace sidebar in dashboard layout |
| 03 Candidates Table | 🟢 swap | Restyle existing component |
| 04 v2 Candidate Profile | 🟡 + structured AI | Citations need schema change |
| 05 Dashboard | 🟡 | KPI queries + stuck-candidates query |
| 06 Pipeline | 🟢 swap + 🟡 persist DnD | Drag-drop already works visually |
| 07 Forms List | 🟢 swap + 🟡 stats | Aggregations are easy |
| 08 Form Builder | 🟢 swap | Existing builder works |
| 09 Apply Form | 🟢 swap | AI helper button is optional |
| 10 Candidate Portal | 🟠 new | New auth + multi-org |
| 11 Council Dashboard | 🟠 new | New role + RLS |
| 12 Calendar | 🟠 new | New tables + week view |
| 13 Interview Evaluation | 🟠 new | New table |
| 14 Login | 🟢 swap | Restyle |
| 15 Settings | 🟢 swap | Update academy type field |

---

**That's it. Good luck.** Ping me with the prompt template above and a specific screen and I'll help you migrate it.
