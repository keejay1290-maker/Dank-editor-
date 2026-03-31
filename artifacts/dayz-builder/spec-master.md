# Master Spec: All Pending Tasks — DankDayz Editor

This consolidates every outstanding task from all previous specs into a single ordered implementation list.

---

## SECTION A — Quick Fixes (from spec-cleanup-features.md)

### A1. Remove Dead Fill UI
Remove all traces of the disconnected FILL mode from `App.tsx`:
- Delete `type FillMode = "frame" | "fill"`
- Delete `fillMode` and `fillDensity` state
- Delete all props passing `fillMode` / `fillDensity` / `setFillMode` / `setFillDensity`
- Delete the FRAME / FILL toggle button group in `ArchitectSidebar`
- Delete the Fill Density slider
- Delete `fillMode` reference in the object count warning message and info bar display

### A2. Download Link Visible on Mobile
In `App.tsx` header, change `"hidden sm:flex"` → `"flex"` on the `⬇ Download App` anchor.

---

## SECTION B — Race Maker Fixes (from spec-race-fixes.md)

### B1. 3D Hazard Object Rendering
**`RaceTrackMaker.tsx`:**
- Ensure `deathRaceObjects` positions are stored as local track-space offsets (subtract `posX`/`posZ`). World offset only applied at init.c export.
- Pass `hazardObjects={deathRace ? deathRaceObjects : []}` to `<TrackPreview3D>`

**`Track3D.tsx`:**
- Add `hazardObjects?: SpawnObj[]` prop to `TrackPreview3D` and `Track3DScene`
- Add `HazardObjects` component with instanced meshes:

| Hazard match | Shape | Color |
|---|---|---|
| `Barrel_*` | Cylinder r=0.3 h=0.9 | `#e8b82a` yellow |
| `Land_Pier_Long_DE` | Box 6×0.6×1.5 | `#e07a20` orange |
| `StaticObj_Wall_CncBarrier*` | Box 6×0.8×0.7 | `#c0392b` red |
| `Land_TankTrap_DE` | Box 1×1×1 | `#555` grey |
| `CivilianSedan*`/`Hatchback*`/`Offroad*` | Box 4×1.2×1.8 | `#7a4a2a` rust |
| `StaticObj_Airfield_Light*`/`Strobe*` | Cylinder r=0.15 h=2 + emissive sphere | `#9b59b6` magenta |

### B2. Download Button on MAP Tab
Add `⬇ Download` button to the MAP tab preview toolbar (right side, after object count badge). Reuses existing `download()` function and `format` state.

---

## SECTION C — New Tabs (from spec-cleanup-features.md + spec-download-mobile.md)

### C1. Random Structure Generator

**New files:**
- `src/lib/randomStructureData.ts` — shell pool (12 enterable buildings with footprint + anchor zones), base prop pool, extras pool
- `src/RandomStructureMaker.tsx` — full UI + logic

**Shell pool** (12 enterable DayZ buildings):
- Military: `Land_Mil_Barracks1`, `Land_Mil_Barracks2`, `Land_Mil_Barracks3`, `Land_Mil_Barracks_HQ_DE`, `Land_Mil_Guardhouse1`, `Land_Mil_Guardhouse2`
- Civilian: `Land_House_1W02`, `Land_House_2W02`, `Land_Shed_W1`, `Land_Shed_W2`
- Industrial: `Land_Ind_Workshop01`, `Land_Ind_Shed_Ind2`

**Base props (always):** crates, barrels (2–4 random colours), shelf, lamp, sandbag nest, ammo box

**Extras (toggle):** M4A1/AK74/MP5K/Glock19 at Y+0.8, bench, fireplace, wall markers (armbands), camo net

**Controls:** Seed + Re-roll, World X/Y/Z, Add Extras toggle, Generate

**Output:** 2D SVG top-down preview + init.c / JSON download

**3D Preview:** Use the same `BunkerPreview3D` pattern — `Canvas` + `InstancedMesh` boxes. Each prop type gets a colour-coded box (shell = grey outline, crates = brown, barrels = yellow, weapons = red, furniture = teal). Auto-orbit, auto-fit camera. This gives a proper 3D spatial view of the structure interior.

**App.tsx:** Add `"random"` to `EditorMode`, add tab `{ key: "random", emoji: "🎲", label: "RANDOM", active: "bg-[#e91e8c] text-[#0a0804]", ... }`

### C2. Construction Zone Maker

**New files:**
- `src/lib/constructionZoneData.ts` — structural prop pool + loot manifest
- `src/ConstructionZoneMaker.tsx` — full UI + logic

**Structural props (static objects):**
- Crate stacks: `StaticObj_Misc_WoodenCrate_5x`, `StaticObj_Misc_WoodenCrate_3x`
- Pallets: `StaticObj_Misc_Pallet`
- Wood piles: `StaticObj_Misc_WoodPile_Forest1`, `_Forest2`
- Brick walls (partial): `Land_Wall_Brick_4m_DE`, `Land_Wall_Brick_8m_DE`
- Jersey barriers: `Land_BarrierConcrete_01_DE`
- Hazard barrels: `Barrel_Yellow`, `Barrel_Red`
- Sandbags: `Land_Sandbag_Wall_DE`
- Site lamps: `StaticObj_Lamp_Ind`
- General crates: `WoodenCrate`, `PalletBox_DE`

**Supply station loot (per station, separate init.c section):**
`PlankPile` ×1, `WoodenLog` ×15, `MetalPlate` ×15, `Nail` ×4, `BarbedWire` ×2, `Hatchet`, `Pickaxe`, `HandSaw`, `Hammer`, `Shovel`, `Rope` ×2, `WireCoil`, `Duct_Tape` ×2, `WhiteFlag` ×2, `CombatKnife`, `Torch`

**Controls:** Seed + Re-roll, World X/Y/Z, Zone radius (20/30/40m), Supply stations (2/3), Generate

**3D Preview:** Same `BunkerPreview3D` pattern. Colour scheme:
- Structural props = amber `#d4a017` boxes (sized to approximate real object footprint)
- Supply station base = bright green `#27ae60`
- Brick walls = grey `#7f8c8d` tall boxes
- Barrels = yellow/red small cylinders
- Lamps = thin white columns

**Output:** 2D SVG preview + sectioned init.c (structural block + per-station loot block) + JSON download

**App.tsx:** Add `"conzone"` to `EditorMode`, add tab `{ key: "conzone", emoji: "🚧", label: "CONZONE", active: "bg-[#ff9800] text-[#0a0804]", ... }`

**`dayzObjects.ts`:** Add "Base Building" group with all loot classnames above.

---

## SECTION D — Preset Accuracy Audit (from user request)

After deep study of all 55 presets and their shape generators, here is the accuracy audit:

### D1. Issues Found

**Minas Tirith** (`id: "minas_tirith"`) — uses `azkaban_tower` shape (Azkaban prison). Minas Tirith is a 7-tiered concentric city on a mountain, not a ring of towers. Needs a dedicated `gen_minas_tirith` shape: 7 concentric rings of decreasing radius stacked at increasing heights, with a central citadel spire.

**Star Destroyer** (`id: "star_destroyer"`) — uses `pyramid_stepped` (flat stepped pyramid). A Star Destroyer is a triangular wedge viewed from above with a raised superstructure ridge. Needs a dedicated `gen_star_destroyer` shape: triangular hull outline with raised dorsal ridge, bridge tower, and engine nacelles at the rear.

**Stonehenge** — shape is good but `outerCount: 30` places 30 uprights. Real Stonehenge has 30 sarsen uprights in the outer circle — ✅ correct. However `trilithonCount: 5` is correct (5 trilithon pairs in horseshoe) ✅. The `archCount` param exists in the preset but the shape doesn't use it — dead param. Remove it from the preset params.

**Colosseum** — shape is good. Params `radius: 35, height: 24, tiers: 3, arches: 20` — real Colosseum is elliptical (~83×48m), 4 tiers, 80 arches. Update params: `radius: 42, height: 32, tiers: 4, arches: 80`. The shape uses a circle not ellipse — acceptable approximation.

**Bumblebee** — shape generator is detailed and accurate (Camaro proportions, door wings, shoulder wheel arches, visor helm, antennae). `frameObj: "Barrel_Yellow"` — yellow barrels are perfect for Bumblebee's yellow colour ✅. Scale 1 = 12m tall — good for DayZ scale ✅.

**Optimus Prime** — shape has bucket helm, smoke stacks, grille, fuel tanks, windshield plate ✅. `frameObj: "StaticObj_Container_1D"` — blue/grey containers match Optimus's colour scheme ✅.

**AT-AT Walker** — shape has 4 legs, elevated box body, neck, boxy head, twin chin cannons, viewport strip ✅. `frameObj: "Land_Wreck_BTR"` — BTR wreck chunks are chunky/armoured looking ✅. Good accuracy.

**Eye of Sauron** — shape has Barad-dûr spire with buttress fins, spire needle, platform rings, oval eye with iris/pupil slit, eyelid arcs, flame corona ✅. Very accurate.

**Dragon** — shape has serpentine body, neck, head with horns, swept wing ribs with membrane, tail spiral, legs with claws ✅. Good.

**Pirate Ship** — need to verify shape has hull, masts, sails, bowsprit. Check below.

**Death Star** — sphere with dish indent ✅. Params `radius: 50` — good scale.

**Millennium Falcon** — shape has saucer hull, offset cockpit, forward mandibles, gun turrets, engine nacelles ✅. Very accurate.

**Mushroom Cloud** — stem, cap, shock ring, debris cloud ✅. `frameObj: "Barrel_Yellow"` — yellow barrels for nuclear hazard ✅.

**Volcano** — wide base, curved sides, crater rim ✅.

**T-800** — skull, ribcage, spine, limbs via `gen_t800_endoskeleton` ✅.

**Pyramid (Aztec)** — stepped pyramid ✅. Params reasonable.

**Celtic Ring** — double ring with altar stones ✅.

**Giant Skull** — skull with eye sockets and jaw ✅.

### D2. Fixes Required

**Fix 1: Minas Tirith** — new `gen_minas_tirith` shape replacing `azkaban_tower`:
- 7 concentric rings at heights: y=0 (base, widest), y=8, y=16, y=24, y=32, y=40, y=48 (citadel)
- Each ring radius: 35, 30, 25, 20, 15, 10, 5m
- Each ring has battlements (crenellations) at top
- Central citadel spire: thin cylinder rising from y=48 to y=90
- Gate arch at south face of each ring
- Update preset params: `{ rings: 7, baseRadius: 35, height: 90, battlements: 12 }`

**Fix 2: Star Destroyer** — new `gen_star_destroyer` shape replacing `pyramid_stepped`:
- Triangular hull outline (isoceles triangle, ~200m long, 120m wide at rear)
- Hull has 3 elevation levels (stepped wedge profile when viewed from side)
- Dorsal superstructure ridge running bow to stern
- Bridge tower at rear-centre (tall box)
- 3 engine nacelles at rear (circles)
- Turbolaser turrets along hull edges (small cylinders)
- Update preset params: `{ length: 200, width: 120, height: 30, turrets: 8 }`

**Fix 3: Colosseum params** — update `completedBuilds.ts`:
- `radius: 35 → 42, height: 24 → 32, tiers: 3 → 4, arches: 20 → 80`

**Fix 4: Stonehenge dead param** — remove `archCount: 5` from preset params (shape ignores it).

**Fix 5: Pirate Ship verification** — check `gen_pirate_ship` has bowsprit, hull ribs, masts with crow's nests, sail outlines. If missing, add them.

---

## SECTION E — 3D Preview Architecture for New Tabs

Both `RandomStructureMaker` and `ConstructionZoneMaker` use the same 3D preview pattern as `BunkerPreview3D`:

```
ZonePreview3D({ objects: ZoneObject[] })
  └─ Canvas (Three.js via @react-three/fiber)
       └─ Scene
            ├─ InstancedMesh per object type (colour-coded boxes)
            ├─ Ground plane
            ├─ OrbitControls (auto-rotate, damping)
            └─ Auto-fit camera
```

`ZoneObject` type:
```ts
interface ZoneObject {
  type: string;       // classname or category key
  x: number;         // local offset
  y: number;
  z: number;
  yaw: number;
  w: number;         // box width for 3D
  h: number;         // box height
  d: number;         // box depth
  color: string;     // hex
}
```

This is reusable for both makers. Create `src/ZonePreview3D.tsx` as a shared component.

---

## Acceptance Criteria

1. No FILL/FRAME toggle visible anywhere — TypeScript clean
2. `⬇ Download App` visible on mobile
3. Race 3D view shows coloured hazard geometry at correct positions
4. `⬇ Download` button on Race MAP tab toolbar
5. RANDOM tab renders with 3D preview, Generate works, Re-roll changes layout, same seed = same layout
6. Add Extras toggle adds/removes firearms and furniture
7. CONZONE tab renders with 3D preview, Generate works, init.c has structural + per-station loot sections
8. Each loot section has all required items (15 logs, 15 metal plates, all tools, white flags)
9. Both new tabs appear in the tab strip after RACE
10. `gen_minas_tirith` produces 7 concentric rings + citadel spire
11. `gen_star_destroyer` produces triangular wedge hull with superstructure
12. Colosseum preset uses updated params (4 tiers, 80 arches)
13. Stonehenge preset has no dead `archCount` param
14. `npx tsc --noEmit` passes clean

---

## Implementation Order

1. **A1** — Remove fill UI from `App.tsx`
2. **A2** — Fix Download App link visibility
3. **B1** — Race 3D hazards: local-space positions + `HazardObjects` component in `Track3D.tsx`
4. **B2** — Race MAP tab download button
5. **D2 Fix 4** — Remove dead `archCount` from Stonehenge preset
6. **D2 Fix 3** — Update Colosseum params
7. **D2 Fix 5** — Verify/fix Pirate Ship shape
8. **D2 Fix 1** — Add `gen_minas_tirith` to `shapeGenerators.ts`, update preset
9. **D2 Fix 2** — Add `gen_star_destroyer` to `shapeGenerators.ts`, update preset
10. **E** — Create `src/ZonePreview3D.tsx` shared 3D preview component
11. **C1a** — Create `src/lib/randomStructureData.ts`
12. **C1b** — Create `src/RandomStructureMaker.tsx` with 3D preview
13. **C2a** — Add base-building classnames to `dayzObjects.ts`
14. **C2b** — Create `src/lib/constructionZoneData.ts`
15. **C2c** — Create `src/ConstructionZoneMaker.tsx` with 3D preview
16. **App.tsx** — Add `"random"` + `"conzone"` to `EditorMode`, add both tabs, render components
17. TypeScript check + smoke test all tabs
