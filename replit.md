# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## DankDayZ Ultimate Builder (artifacts/dayz-builder)

React + Vite pure-frontend app for generating DayZ console object spawns.

- **65+ shape generators** across groups: Sci-Fi, Mechs & Robots, Tunnels, Structures, Fortifications, Body Parts, Primitives, Epic/Unique, ⚡ Lightweight, 🤖 Transformers, 🦄 Fantasy & Mythic, 🏴‍☠️ Nautical, ⚔ Arenas
- **6 Arena generators**: pvp_arena (ring), arena_colosseum (Roman oval), arena_fort (square castle), arena_maze (procedural labyrinth), arena_siege (asymmetric attacker/defender), arena_compound (military grid) — all with Lightweight/Medium/Heavy detail levels
- **Detail levels (1/2/3)** on all arena generators: Lightweight = perimeter only; Medium = + staircase ramp access, interior cover clusters (pallets, crates, barricades), wall-top walkway access points; Heavy = + barbed wire cap, full perimeter walkway, loot barrel rings, elevated platform elements
- **New object groups in selector**: "⚔ Arena & Castle Walls" (castle stone walls, HESCO, concrete, brick, palisade, barbed wire), "🪵 Crates & Storage" (wooden crates, pallets, garbage containers, barrels), "🪜 Steps & Access" (pier ladders, concrete stairs, military platforms, watchtowers)
- **Best wall recommendations**: Castle Stone Wall 3m (★ best medieval arena), HESCO 5m (★ best military), Concrete Wall 4m (★ best modern) — all console-safe Xbox/PS5
- **3 featured PvP builds** in Completed Builds: ⭐ HESCO Combat Ring (lightweight, 280 obj), ⭐ Castle Fortress (medium, 520 obj), ⭐ Grand Roman Colosseum (heavy, 900 obj)
- **Arena Maker panel**: ROLL RANDOM ARENA button + 6 type tiles + "Randomize This Type Again"
- **7 Transformer mechs**: Bumblebee, Optimus Prime, Ironhide, Jazz, Ratchet, Megatron, Starscream — built via shared `_buildMechPts(TFConfig)` helper
- **Real-time 3D canvas**: `useMemo` computes points, `useEffect` debounces 60ms, auto-rotate with requestAnimationFrame
- **Live dimensions**: bounding box W×D×H in metres displayed in info bar and stats panel
- **Famous Locations picker**: 25 Chernarus landmarks (NWAF, NEAF, Tisy, Cherno, etc.) fill X/Y/Z instantly
- **Position Jitter slider**: 0–15m random scatter per object (applied at generate time, perfect for organic-looking builds)
- **🎲 Surprise Me button**: loads a random preset from the full list
- **Full YPR sliders**: Yaw/Pitch/Roll all live — Yaw applied to world coords, Pitch/Roll shown in 3D preview
- **Fill Mode** with density slider (1–6 interior layers)
- **Quick Presets** (60+) with searchable filter and category tabs (All, Sci-Fi, Mechs, Arenas, etc.)
- **Completed Builds gallery**: 35+ themed builds with object notes and download
- **Text Maker**: renders A–Z, 0–9, punctuation in 3D with configurable extrusion depth, rings, scale
- **Output**: init.c (with SpawnObject() helper) or JSON Spawner format
- **Extra objects**: stack multiple object classes per spawn point with Y offset
- All objects console-safe (Xbox/PS5 vanilla DayZ)
- No backend — pure frontend

Key files:
- `src/App.tsx` — main app, 3D renderer hook, sidebar components
- `src/lib/shapeGenerators.ts` — all shape generation functions + `getShapePoints()` switch
- `src/lib/shapeParams.ts` — SHAPE_DEFS with param sliders per shape + SHAPE_GROUPS
- `src/lib/dayzObjects.ts` — DayZ object classnames + formatInitC + HELPER_FUNC

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
