# Spec: Fill Cleanup + Download Link + Race 3D Hazards + Random Structure + Construction Zone

## Problem Statement

Five distinct improvements to the DankDayz Editor:

1. **Remove dead fill UI** — FILL mode buttons and density slider are visible but do nothing (fill was disconnected). Remove them cleanly.
2. **Download link visible on mobile** — the `⬇ Download App` header link is hidden on small screens (`hidden sm:flex`). Make it visible everywhere.
3. **Race maker 3D hazards** — Death Race objects (barrels, ramps, roadblocks, tank traps, wrecks, rave lights) are computed but never rendered in the 3D view. Fix this.
4. **Random Structure Generator** — new RANDOM tab: picks a random enterable building shell + fills interior with props. "Add Extras" toggle adds firearms, furniture, posters.
5. **Construction Zone Maker** — new CONZONE tab: randomised construction site with structural props + per-station loot section (planks, logs, metal plates, tools, flags).

---

## Fix 1: Remove Dead Fill UI

### What to remove from `App.tsx` / `ArchitectSidebar`
- `type FillMode` declaration
- `fillMode` and `fillDensity` state variables
- All props passing `fillMode` / `fillDensity` / `setFillMode` / `setFillDensity`
- The FRAME / FILL toggle button group (lines ~1700–1710)
- The Fill Density slider (shown when `fillMode === "fill"`)
- The `fillMode` reference in the object count warning message
- The `fillMode` display in the info bar (`p.fillMode{p.fillMode === "fill" ? ...}`)
- The comment `// All shapes render as hollow frames — displayPoints is always the raw frame points`

### What to keep
- `displayPoints = rawPoints` — this is correct, just remove the comment
- All frame-mode rendering logic (unchanged)

---

## Fix 2: Download Link Visible on Mobile

### Change in `App.tsx`
Single class change on the `⬇ Download App` anchor:
- `"hidden sm:flex"` → `"flex"`

---

## Fix 3: Race Maker 3D Hazard Rendering

### Root cause (from spec-race-fixes.md)
`deathRaceObjects` positions are stored as world coords. `TrackPreview3D` has no prop for hazards and `Track3D.tsx` has no geometry for them.

### Changes to `RaceTrackMaker.tsx`
- Ensure `deathRaceObjects` positions are stored as **local track-space offsets** (subtract `posX`/`posZ` from x/z). World offset only applied at init.c export time.
- Pass `hazardObjects={deathRace ? deathRaceObjects : []}` to `<TrackPreview3D>`

### Changes to `Track3D.tsx`
- Add `SpawnObj` type import (or inline the type: `{ name: string; x: number; y: number; z: number; yaw: number }`)
- Add `hazardObjects?: SpawnObj[]` prop to `TrackPreview3D` and `Track3DScene`
- Add `HazardObjects` component using instanced meshes:

| Hazard match | Shape | Color |
|---|---|---|
| `Barrel_*` | Cylinder r=0.3 h=0.9 | `#e8b82a` (yellow) |
| `Land_Pier_Long_DE` (ramp) | Box 6×0.6×1.5 | `#e07a20` (orange) |
| `StaticObj_Wall_CncBarrier*` | Box 6×0.8×0.7 | `#c0392b` (red) |
| `Land_TankTrap_DE` | Box 1×1×1 | `#555` (grey) |
| `CivilianSedan*`/`Hatchback*`/`Offroad*` | Box 4×1.2×1.8 | `#7a4a2a` (rust) |
| `StaticObj_Airfield_Light*`/`Strobe*` | Cylinder r=0.15 h=2 + sphere r=0.3 emissive | `#9b59b6` (magenta) |

- Render `<HazardObjects objects={hazardObjects} />` inside `Track3DScene`

### Also fix: Download button visible on MAP tab
- Add `⬇ Download` button to the MAP tab preview toolbar (right side, after object count badge)
- Reuses existing `download()` function and `format` state

---

## Feature 4: Random Structure Generator (`RandomStructureMaker.tsx`)

### New file: `src/lib/randomStructureData.ts`
Defines:
- `SHELL_POOL` — 12 enterable buildings with interior footprint (w×d) and anchor zones
- `BASE_PROP_POOL` — always-spawned interior props (crates, barrels, shelves, sandbags, ammo boxes)
- `EXTRAS_POOL` — optional props (firearms, furniture, wall markers, camo net)

### New file: `src/RandomStructureMaker.tsx`
**Controls (left panel):**
- Seed input + Re-roll button
- World position X / Y / Z
- "Add Extras" checkbox (firearms, furniture, posters)
- Generate button

**Logic:**
- Seeded XOR-shift RNG (same pattern as MazeMaker)
- Pick random shell from `SHELL_POOL`
- Place base props at anchor zones with ±0.5m jitter and random yaw
- If extras enabled: add firearms at Y+0.8, furniture, wall markers
- All positions in local space; world offset applied at export

**Output:**
- 2D SVG top-down preview (shell footprint outline + colour-coded prop dots)
- Object count badge
- Download init.c / JSON buttons
- init.c: `HELPER_FUNC` + shell spawn + all interior props

### App.tsx changes
- Add `"random"` to `EditorMode` type
- Add RANDOM tab to tab strip (`🎲 RANDOM`, pink/magenta active colour)
- Render `<RandomStructureMaker />` when `mode === "random"`

---

## Feature 5: Construction Zone Maker (`ConstructionZoneMaker.tsx`)

### New file: `src/lib/constructionZoneData.ts`
Defines:
- `STRUCTURAL_POOL` — static Land_/StaticObj_ props (crates, pallets, brick walls, barriers, barrels, sandbags, lamps)
- `LOOT_MANIFEST` — per-station inventory items (PlankPile, WoodenLog×15, MetalPlate×15, Nails×4, Hatchet, Pickaxe, HandSaw, Hammer, Shovel, Rope×2, WireCoil, Duct_Tape×2, WhiteFlag×2, CombatKnife, Torch)

### New file: `src/ConstructionZoneMaker.tsx`
**Controls (left panel):**
- Seed input + Re-roll button
- World position X / Y / Z
- Zone radius: 20 / 30 / 40m (radio)
- Supply stations: 2 / 3 (toggle)
- Generate button

**Logic:**
- Seeded RNG
- Scatter structural props within zone radius (min 2m spacing)
- Place 2–3 supply station clusters (crate stack + pallet)
- Random yaw for loose props, 0/90/180/270 for walls/barriers

**Output:**
- 2D SVG preview (structural props in amber, supply stations in green)
- Object count + loot item count shown separately
- Download init.c / JSON
- init.c structure:
  ```
  HELPER_FUNC
  // ═══ STRUCTURAL OBJECTS ═══
  SpawnObject(...)
  
  // ═══ SUPPLY STATION 1 — LOOT ═══
  SpawnObject("PlankPile", ...)
  SpawnObject("WoodenLog", ...)
  ...
  ```

### App.tsx changes
- Add `"conzone"` to `EditorMode` type
- Add CONZONE tab (`🚧 CONZONE`, amber/orange active colour)
- Render `<ConstructionZoneMaker />` when `mode === "conzone"`

### `dayzObjects.ts` additions
Add new "Base Building" group with console-verified classnames:
`PlankPile`, `WoodenLog`, `MetalPlate`, `Nail`, `Hatchet`, `Pickaxe`, `HandSaw`, `Hammer`, `Shovel`, `Rope`, `WireCoil`, `Duct_Tape`, `WhiteFlag`, `CombatKnife`, `Torch`

---

## Acceptance Criteria

1. No FILL/FRAME toggle visible anywhere in the app — TypeScript compiles clean with no `fillMode`/`fillDensity` references
2. `⬇ Download App` link visible on all screen sizes including mobile
3. With Death Race ON and any hazard enabled, 3D view shows coloured geometry at hazard positions
4. `⬇ Download` button visible on the MAP tab toolbar in Race maker
5. RANDOM tab renders; Generate produces valid init.c with ≥1 shell + ≥5 interior props
6. Re-roll produces different layout; same seed produces identical layout
7. Add Extras toggle adds/removes firearms and furniture from output
8. CONZONE tab renders; Generate produces init.c with structural section + per-station loot sections
9. Each loot section contains PlankPile, 15× WoodenLog, 15× MetalPlate, all tools, WhiteFlag
10. Both new tabs show 2D SVG preview + working download buttons
11. `npx tsc --noEmit` passes clean

---

## Implementation Order

1. Remove fill UI from `App.tsx` (dead code cleanup)
2. Fix Download App link visibility (one-line change)
3. Fix Race maker: local-space hazard positions in `RaceTrackMaker.tsx`
4. Add `HazardObjects` component + props to `Track3D.tsx`
5. Add MAP-tab download button to `RaceTrackMaker.tsx`
6. Add base-building classnames to `dayzObjects.ts`
7. Create `src/lib/randomStructureData.ts`
8. Create `src/RandomStructureMaker.tsx`
9. Create `src/lib/constructionZoneData.ts`
10. Create `src/ConstructionZoneMaker.tsx`
11. Update `App.tsx` — add RANDOM + CONZONE tabs
12. TypeScript check + smoke test
