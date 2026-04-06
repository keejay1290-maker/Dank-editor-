# Dank's Dayz Studio — Loot System, Interior Builds, Race Track Fix & Full Classname DB

## Problem Statement

Four areas of work:

1. **Preset builds loot + interior** — No loot or interior decoration exists for preset builds. Builds with accessible interiors (open structures, enterable buildings) need a "Add Loot & Interior" option that generates interior walls, decorative props (shelves, racks, posters), and random loot items placed on the floor/surfaces. Loot changes when the Randomise button is pressed.

2. **Race track death race height bug** — All death race hazard objects (barrels, barriers, tank traps, wrecks, lights) are generated at `posY` (world ground level), which is the same Y as the floor tiles. This causes two problems: (a) in the 3D preview they appear floating because the preview renders floor tiles at a fixed `y=0.15` but hazards at `y=posY` (e.g. 10); (b) in the exported init.c/JSON the hazards are embedded inside the floor tiles. Both the preview and the export need fixing.

3. **Full DayZ classname database** — The app has ~60 loot items in `vehicleData.ts` and 81 entries in `DankClassnameSearch`. The user wants the full DayZ vanilla `types.xml` classname set (~500+ items) available for quick reference and for use in loot placement.

4. **Interior decoration objects** — `dayzObjects.ts` is missing many interior/decorative classnames (posters, racking, additional furniture). These need to be added so the interior generator can use them.

---

## Loot Placement Format

The app correctly uses `init.c SpawnObject` calls for custom static builds. `mapgrouppos.xml` / `mapgroupproto.xml` are the DayZ Central Economy system for vanilla map loot respawning — not relevant for custom spawner builds. Loot will be exported as `SpawnObject` calls bundled into the same init.c/JSON file as the build objects.

The user referenced mapgrouppos/mapgroupproto only to understand how DayZ positions loot internally — the placement logic (grid offsets, floor height `y+0.1`) already used in `constructionZoneData.ts` is the correct approach and will be reused.

---

## Section 1 — Preset Builds: Loot & Interior Option

### 1.1 Which builds get the option

All preset builds get an "Add Interior & Loot" toggle. The generator uses common sense:

- **Open/accessible structures** (Stonehenge, Colosseum, Celtic Ring, Pyramid, Giant Skull, Volcano, Star Fort, Prison Tower, PVP Arena, Arena Colosseum, Arena Fort, Arena Maze, Arena Siege, Arena Compound, PVP Castle, PVP Colosseum Heavy) — loot placed on the ground inside the structure perimeter. No interior walls generated (they're already open).
- **Enterable buildings** (Treehouse, Checkpoint, Farmstead, Survivor Camp, Bunker Line, Guard Post, Watchtower Triangle, Fuel Depot, Sniper Nest, Power Relay, Radio Outpost, Tank Trap Line, and all Sci-Fi/Space/Monument builds that use building shells) — full interior generated: walls subdividing space + decorative props + loot.
- **Pure barrier/wall structures** (Death Star, Halo Ring, Borg Cube, etc.) — loot placed at structure centre/floor level only, no interior walls.

The flag is determined by a new `interiorType` field on `CompletedBuild`:
```ts
interiorType?: "open" | "building" | "structure"
```
- `"open"` = accessible open structure (Stonehenge etc.) → loot only, no walls
- `"building"` = enterable building shell → full interior (walls + props + loot)
- `"structure"` = pure barrier/abstract → loot at centre only
- `undefined` = no loot option (pure decorative, e.g. text builds)

### 1.2 Interior generation

For `interiorType: "building"` builds, the interior generator (new `buildInterior(seed, build)` function in `completedBuilds.ts` or a new `buildInteriorData.ts`) produces:

**Walls** (using `Land_Wall_Concrete_4m_DE` or `Land_Wall_Brick_4m_DE`):
- 1–2 interior partition walls dividing the space into 2–3 rooms
- Placed at `posY` with `pitch=0` (upright), not clustered near doorways
- Max 4 wall segments per build to keep object count low and entrances clear

**Decorative props** (seeded random selection from):
- `StaticObj_Furniture_shelf_DZ` — shelf unit (wall-aligned)
- `StaticObj_Furniture_rack_*` — racking (wall-aligned, if classname confirmed)
- `StaticObj_Poster_*` — posters on walls (if classnames confirmed in DayZ)
- `WoodenCrate`, `WoodenCrateSmall`, `PalletBox_DE` — floor storage
- `Barrel_Blue/Green/Red/Yellow` — scattered barrels
- `StaticObj_ammoboxes_single` — ammo box on shelf/floor
- `StaticObj_Lamp_Ind` — lighting
- `Land_BusStation_wall_bench` — bench along wall

**Placement rules:**
- Wall-aligned props placed 0.3m from wall, facing inward
- Floor props scattered with seeded jitter, min 0.8m spacing
- No prop placed within 1.5m of a doorway/entrance axis
- Max 8–12 decorative props per build

### 1.3 Loot placement

Loot items placed as `SpawnObject` calls at `posY + 0.1` (floor level, same as `constructionZoneData.ts`).

**Loot pool** — drawn from the expanded `LOOT_ITEMS` database (Section 3). Categorised by build type:
- Military builds → weapons, ammo, military gear, medical
- Civilian builds → food, tools, clothing, medical
- Industrial builds → tools, vehicle parts, food, gear
- Open/monument builds → mixed random

**Loot count per build:**
- Small (< 10 objects): 3–5 loot items
- Medium (10–30 objects): 5–10 loot items
- Large (30+ objects): 8–15 loot items

**Randomise:** loot selection is seeded. Pressing Randomise in the builds tab re-seeds loot selection independently from the build shape.

### 1.4 UI changes (App.tsx builds tab)

- Add "🎲 Add Interior & Loot" toggle checkbox in the build detail panel (only shown when `build.interiorType` is set)
- Add "🔀 Randomise Loot" button (separate seed from build shape)
- Download buttons include interior + loot objects in the same file
- Preview panel shows loot item count: "12 loot items · 6 props · 3 walls"

---

## Section 2 — Race Track Death Race Height Fix

### Root cause

Two separate bugs:

**Bug A — 3D Preview floating:**
`generateDeathRace()` returns objects with `y: posY` (e.g. `y: 10`). The `Track3D.tsx` preview renders floor tiles at hardcoded `y: 0.15` but hazard objects at their raw `obj.y` value. Since `posY=10` >> `0.15`, hazards appear floating 10m above the floor in the preview.

**Fix A:** In `RaceTrackMaker.tsx`, before passing `deathRaceObjs` to `<TrackPreview3D>`, subtract `posY` from each object's `y`:
```ts
const hazardsForPreview = deathRaceObjs.map(o => ({ ...o, y: o.y - posY }));
```

**Bug B — Export embedded in floor:**
In the exported init.c/JSON, floor tiles are at `posY` (flat, pitch=90). The floor tile object (`Land_Wall_Concrete_4m_DE`) is 0.3m thick when laid flat — its top surface is at `posY + 0.15`. Hazard objects at `posY` are embedded halfway into the floor.

**Fix B:** In `generateDeathRace()`, add `FLOOR_THICKNESS = 0.3` constant. All hazard objects use `y: posY + FLOOR_THICKNESS`:
- Ground-level objects (barriers, tank traps, wrecks, lights, ramps): `posY + 0.3`
- Stacked barrel second row: `posY + 0.3 + 1.0` = `posY + 1.3`

---

## Section 3 — Full DayZ Classname Database

### 3.1 New file: `src/lib/dayzLootDB.ts`

Replace the 60-item `LOOT_ITEMS` in `vehicleData.ts` with a comprehensive database covering all vanilla DayZ 1.25 types.xml classnames. Sourced from the official Bohemia/DayZ GitHub (`DayZ-Central-Economy` repo, `db/types.xml`).

**Categories and approximate counts:**
| Category | Items |
|----------|-------|
| Weapons — Rifles | ~25 |
| Weapons — Pistols | ~12 |
| Weapons — Shotguns | ~8 |
| Weapons — SMGs | ~6 |
| Weapons — Sniper | ~8 |
| Magazines | ~40 |
| Ammo (loose) | ~20 |
| Attachments | ~35 |
| Clothing — Jackets | ~30 |
| Clothing — Pants | ~20 |
| Clothing — Boots | ~15 |
| Clothing — Headgear | ~25 |
| Clothing — Vests | ~15 |
| Clothing — Gloves | ~10 |
| Backpacks | ~12 |
| Food — Canned | ~15 |
| Food — Dry/Fresh | ~20 |
| Drinks | ~10 |
| Medical | ~25 |
| Tools | ~30 |
| Base Building | ~20 |
| Vehicle Parts | ~25 |
| Electronics | ~10 |
| Navigation | ~8 |
| Explosives | ~8 |
| Misc / Crafting | ~20 |

**Interface:**
```ts
export interface DayzLootEntry {
  classname: string;
  displayName: string;
  category: string;
  subcategory: string;
  tags: string[];
  // From types.xml:
  nominal?: number;   // default spawn count
  lifetime?: number;  // seconds
  usage?: string[];   // spawn zone tags (Military, Medic, Farm, etc.)
}
```

### 3.2 Update DankClassnameSearch

Replace the 81-item inline `DB` array with an import from `dayzLootDB.ts`. The UI already supports search/filter — no UI changes needed beyond the data swap.

### 3.3 Update LOOT_ITEMS

`vehicleData.ts` `LOOT_ITEMS` updated to import from `dayzLootDB.ts` (filtered to items suitable for vehicle/build loot — no vehicle parts, no base building materials).

---

## Section 4 — Interior Decoration Objects in dayzObjects.ts

Add the following verified DayZ classnames to `dayzObjects.ts` under a new `"Interior & Decor"` group:

```
StaticObj_Furniture_shelf_DZ        (already exists in Misc Props — move to new group)
StaticObj_Furniture_rack_DZ         (if exists in DayZ)
StaticObj_Furniture_table_DZ        (if exists)
StaticObj_Furniture_chair_DZ        (if exists)
Land_BusStation_wall_bench          (bench — already in randomStructureData.ts)
StaticObj_Furniture_fireplace_grill (already in StaticObj Decor)
StaticObj_ammoboxes_single          (already in StaticObj Decor)
StaticObj_Lamp_Ind                  (already in Misc Props)
```

Note: DayZ's `StaticObj_Poster_*` classnames need verification against the DayZ GitHub before inclusion. If confirmed, add ~5 poster variants.

---

## Acceptance Criteria

- [ ] All preset builds with `interiorType` set show "Add Interior & Loot" toggle
- [ ] Toggling loot on adds interior walls, props, and loot items to the downloaded file
- [ ] Randomise Loot button changes loot selection without changing build shape
- [ ] Loot items placed at `posY + 0.1` (floor level)
- [ ] Interior walls do not block doorways/entrances
- [ ] Death race 3D preview: hazards sit on top of floor tiles (no floating)
- [ ] Death race export: hazards at `posY + 0.3` (on top of floor tiles)
- [ ] Stacked barrel second row at `posY + 1.3`
- [ ] `dayzLootDB.ts` contains 400+ classnames across all categories
- [ ] `DankClassnameSearch` uses the new database
- [ ] `LOOT_ITEMS` in `vehicleData.ts` updated from new database
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npm run build` — 0 errors

---

## Implementation Order

1. Fix race track death race height — `RaceTrackMaker.tsx` + `generateDeathRace()` (quick win, isolated)
2. Create `src/lib/dayzLootDB.ts` — full classname database
3. Update `DankClassnameSearch.tsx` to use new database
4. Update `vehicleData.ts` `LOOT_ITEMS` from new database
5. Add `interiorType` field to `CompletedBuild` interface and tag all 55 builds
6. Create `src/lib/buildInteriorData.ts` — interior/loot generator function
7. Add interior decoration classnames to `dayzObjects.ts`
8. Wire up UI in `App.tsx` builds tab — toggle, randomise loot button, preview label
9. TypeScript check + build smoke test
