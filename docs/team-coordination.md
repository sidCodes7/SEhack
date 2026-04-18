# 🎯 Aether — Team Coordination & Push/Pull Schedule

> **4 collaborators, 1 branch (`main`), zero merge conflicts.**

---

## Team Roster & File Ownership

| Member | Role | Owns |
|--------|------|------|
| **Sid** | Infrastructure Lead | Root config, `packages/shared-types/`, `apps/backend/src/shared/`, `apps/backend/src/modules/{auth,users,dashboard}`, DB schema, seed data, scripts |
| **Dev** | Backend — Intelligence Layer | `apps/backend/src/modules/{workflow,copilot,notices,calendar,analytics,karma}` |
| **Het** | Backend — Ops & Platform | `apps/backend/src/modules/{issues,finance,attendance,pyq,plugins}`, `apps/super-app/`, `libs/aether-bridge/`, `apps/canteen-tracker/`, `docs/developer-portal.md` |
| **Avani** | Mobile Frontend | `apps/mobile/` (everything) |

> 🔒 **Golden Rule:** Never edit a file that belongs to another team member. If you need a change in someone else's file, message them on the group chat.

---

## Push/Pull Timeline (Dependency Graph)

```
TIME ──────────────────────────────────────────────────────────►

SID   ║══ S0: Scaffold ═══╗══ S1: Auth API ═╗══ S2: Seed Data ═╗══ S3: Glue ═══║
      ║                   ║                 ║                  ║               ║
      ║    PUSH ──────────╬── PUSH ─────────╬── PUSH ──────────╬── ongoing     ║
      ║         │         ║       │         ║       │          ║               ║
      ║         ▼         ║       ▼         ║       ▼          ║               ║
DEV   ║     pull main     ║  (no dep)       ║   pull main      ║               ║
      ║  ══ D1: Workflow ═╬════════════════ D2: Copilot ═══════╬═ D3 ═══ D4 ══║
      ║         │         ║                     │              ║   │      │    ║
      ║         │  PUSH ──╬──────────── PUSH ───╬──────────────╬── PUSH  PUSH ║
      ║         │         ║                     │              ║               ║
HET   ║     pull main     ║  (no dep)       ║   pull main      ║               ║
      ║  ══ H1: Issues ═══╬═══════════════ H2: Finance+PYQ ═══╬══ H3: Super ══║
      ║         │         ║                     │              ║       │       ║
      ║         │  PUSH ──╬──────────── PUSH ───╬──────────────╬────── PUSH    ║
      ║         │         ║                     │              ║               ║
AVANI ║     pull main     ║   pull Sid S1   ║                  ║               ║
      ║  ══ A0: Scaffold ═╬═ A1: Auth+Dash ═╬══ A2: Workflow ═╬═ A3 ═══ A4 ══║
      ║                   ║                 ║   (after D1,D2)  ║ (after H1,H2)║
```

---

## Push Checkpoint Quick Reference

| Checkpoint | Who | What | Who Should Pull After |
|------------|-----|------|-----------------------|
| **S0** | Sid | Scaffold + shared-types + shared infra + all stub routes | **Everyone** (mandatory) |
| **S1** | Sid | Auth + users + dashboard modules | **Avani** (to wire login) |
| **S2** | Sid | DB migrations + seed data | **Dev, Het** (tables exist now) |
| **A0** | Avani | Expo scaffold + design system + common components | Nobody (isolated) |
| **D1** | Dev | Workflow engine + notices module | **Avani** (to wire booking/approvals) |
| **H1** | Het | Issues + heatmap + attendance modules | **Avani** (to wire issue reporting) |
| **D2** | Dev | AI Copilot (Grok direct API) | **Avani** (to wire copilot chat) |
| **H2** | Het | Finance + Razorpay + PYQ | **Avani** (to wire payment flow) |
| **A1** | Avani | Auth screens + dashboards | Nobody (isolated) |
| **D3** | Dev | Calendar + clash detection | **Avani** (to wire calendar) |
| **A2** | Avani | Workflow + copilot screens | Nobody (isolated) |
| **D4** | Dev | Analytics + karma | **Avani, Het** (Avani for screens, Het for karma import) |
| **H3** | Het | Plugins + Super App + aether-bridge + canteen tracker | **Sid** (to update seed data with canteen URL) |
| **A3** | Avani | Issues + heatmap + calendar + finance + PYQ screens | Nobody (isolated) |
| **S3** | Sid | .env with real keys + final integration verify | **Everyone** (final pull) |
| **A4** | Avani | Faculty workspace + admin analytics + polish | Nobody (final) |

---

## Conflict Hotspots & Mitigations

| File | Risk | Mitigation |
|------|------|------------|
| `apps/backend/src/app.ts` | Multiple devs adding route imports | **Sid pre-wires ALL routes in S0.** Nobody else edits this file. |
| Root `package.json` | Het adding `apps/super-app` workspace | **Het messages Sid** to add it, or adds ONLY the workspace entry (coordinate via chat). |
| `packages/shared-types/*` | Someone needs a new type | **Only Sid edits shared-types.** Others request new types via chat. |
| `apps/backend/package.json` | Multiple people adding deps | **Sid installs ALL backend deps in S0.** If someone needs a new one, message Sid. |

---

## Communication Protocol

1. **Before pushing:** `git pull origin main` first to catch any new commits
2. **After pushing:** Post in team chat: `"Pushed [checkpoint]. [Who] can now pull for [what API/feature]."`
3. **If you need a file changed that you don't own:** Message the owner on chat. Never edit it yourself.
4. **If you hit a type error from shared-types:** Message Sid with the interface change needed.

---

## Individual TODO Files

- [Sid's TODO](./todo-sid.md) — Foundation, Auth, Infrastructure
- [Dev's TODO](./todo-dev.md) — Workflow, Copilot, Notices, Calendar, Analytics, Karma
- [Het's TODO](./todo-het.md) — Issues, Finance, Attendance, PYQ, Plugins, Super App
- [Avani's TODO](./todo-avani.md) — Full Mobile Frontend
