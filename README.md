# Aether — Autonomous Campus Operating System

> "Above the chaos of campus — Aether."

A modular, role-based Campus Operating System unifying academic, administrative, and social workflows into a single mobile-first platform.

## Architecture

- **Mobile App** — React Native (Expo Go SDK 50, Expo Router v3)
- **Backend API** — Node.js 20 LTS, Express 4, TypeScript 5
- **Database** — Neon PostgreSQL with Drizzle ORM
- **Real-time** — Socket.IO for live approvals, heatmaps, notifications

## Project Structure

```
aether/
├── apps/
│   ├── mobile/        ← React Native (Expo Go)
│   ├── backend/       ← Node.js Express API
│   └── super-app/     ← Plugin Host Shell (Web)
├── packages/
│   └── shared-types/  ← Shared TypeScript interfaces
├── docs/              ← Architecture, wireframes, specs
└── scripts/           ← Startup scripts (.sh / .bat)
```

## Quick Start

```bash
# Install all dependencies (from root)
npm install

# Start backend only
./scripts/backend.sh        # Mac/Linux
scripts\backend.bat          # Windows

# Start everything (backend + mobile)
./scripts/start.sh           # Mac/Linux
scripts\start.bat            # Windows
```

## Team

| Member | Role | Owns |
|--------|------|------|
| **Sid** | Infrastructure Lead | Root configs, shared-types, backend scaffold, auth, users, dashboard, DB schema |
| **Dev** | Backend Lead | Workflow, copilot, notices, calendar, analytics, karma modules |
| **Het** | Full-Stack | Issues, finance, attendance, PYQ, plugins, super-app |
| **Avani** | Mobile Lead | All React Native screens and components |

## Environment Setup

1. Copy `.env.example` files in `apps/backend/` and `apps/mobile/`
2. Fill in your API keys (see `docs/project-context.md` §8 for free-tier setup)
3. Run `npm install` at root
4. Run `npx drizzle-kit push` in `apps/backend/` to create tables
5. Run `npm run seed` in `apps/backend/` to load demo data

## License

MIT
