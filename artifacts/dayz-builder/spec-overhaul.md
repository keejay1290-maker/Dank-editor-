# DankDayz Builder — Full Overhaul Spec

## Problem Statement

Four distinct areas need work:

1. **Auto-generate count bug** — In BUILDS mode, clicking a preset shows a hardcoded `b.frameCount` instead of the live computed object count. The info bar updates live but the builds panel card does not.
2. **Shape accuracy** — Azkaban uses a 5-tower ring layout (wrong). Real Azkaban is a single massive fortress on a sea island. Several other presets need accuracy review.
3. **Loot/object placement bugs** — `downloadBuild` stacks `extraFrame` objects at `wy + ei + 1` (floating 1m, 2m above frame). Weapons in RANDOM have `yOffset: 0.8` (floating at waist height, should be `0.05`).
4. **App overhaul** — No landing/hub page. All tools are in one tab bar. Need: home screen with tool cards, new offline tools (types.xml editor, loadout builder, weather/globals/gameplay generators, JSON utilities, coordinate tool, teleport maker, player spawn maker), all working offline in Electron + Capacitor.

---

## Part 1 — Bug Fixes

### B1: Auto-generate object count in BUILDS mode

**Problem:** `b.frameCount` is a hardcoded integer in `completedBuilds.ts`. When a user clicks a different build, the card still shows the old static number.

**Fix:** In the builds detail panel (`App.tsx` ~line 1251), replace `b.frameCount` with a live computed value:
```ts
const liveCount = useMemo(() => {
  if (!selectedBuildId) return 0;
  const b = COMPLETED_BUILDS.find(x => x.id === selectedBuildId);
  if (!b) return 0;
  const pts = getShapePoints(b.shape, b.params);
  const extras = (b.extraFrame || "").split(",").filter(Boolean).length;
  return pts.length * (1 + extras);
}, [selectedBuildId]);
```
Show `liveCount` in the green "OBJECTS TOTAL" box. Also show it in the builds list card badge (line ~2104).

---

### B2: extraFrame floating placement

**Problem:** In `downloadBuild`, extras are placed at `wy + ei + 1` — meaning the first extra is 1m above the frame, second is 2m above, etc. All `extraFrame` objects should be co-located with the frame object at `wy + 0`.

**Fix:** Change `wy + ei + 1` → `wy` for all extraFrame placements in both init.c and JSON output.

---

### B3: Weapon yOffset in RANDOM structure

**Problem:** `EXTRAS_PROPS` weapons have `yOffset: 0.8`, placing them 0.8m above floor (floating at waist height).

**Fix:** Change all weapon/item `yOffset` values in `randomStructureData.ts`:
- Rifles (M4A1, AK74, AKM, MP5K): `yOffset: 0.05`
- Pistols (Glock19): `yOffset: 0.05`
- All other loot items: `yOffset: 0.05`

---

## Part 2 — Shape Accuracy

### S1: Azkaban — complete rewrite of `gen_azkaban_tower`

**Real Azkaban** (Harry Potter films + Pottermore): Single massive dark fortress on a rocky North Sea island. NOT a ring of 5 towers. Key features:
- One enormous central keep — very tall, irregular, multi-level
- Thick outer curtain walls forming a rough rectangle/pentagon
- Multiple small turrets projecting from the curtain walls (not freestanding)
- Jagged, asymmetric silhouette — different heights on each side
- No conical roofs — flat crenellated battlements throughout
- Sea-level base with no surrounding towers at distance

**New generator approach:**
- Central keep: tall rectangular mass (not circular), w≈r, d≈r*0.8, height=h, with irregular floor rings
- Curtain wall: rectangular perimeter at r*1.8 from center, height=h*0.35, with battlements
- Wall turrets: 4–6 small circular turrets projecting from curtain wall corners/midpoints, height=h*0.5
- No conical roofs anywhere — flat tops with crenellation rings
- Asymmetric heights: one side of keep taller than other

**Params:** `baseRadius`, `height`, `wallTurrets` (default 6)

---

### S2: Other preset accuracy checks

Based on research, these shapes need parameter/generator review:

| Preset | Issue | Fix |
|---|---|---|
| **Colosseum** | Already fixed (radius:42, tiers:4, arches:80) | Verify output looks like oval amphitheatre |
| **Minas Tirith** | Already fixed with gen_minas_tirith | Verify 7 rings + citadel spire |
| **Star Destroyer** | Already fixed with gen_star_destroyer | Verify triangular hull profile |
| **Stonehenge** | Already fixed (archCount removed) | Verify outer ring + trilithon horseshoe |
| **Prison Tower** | Looks correct — circular tiers | No change needed |
| **Star Fort** | Looks correct — 5-point star bastion | No change needed |
| **AT-AT Walker** | Check leg proportions | Verify 4 legs + body + neck + head |
| **Millennium Falcon** | Check saucer + cockpit offset | Verify disc + offset cockpit pod |
| **Dragon** | Check wing span vs body | Verify wings extend correctly |

---

## Part 3 — Hub Page & App Overhaul

### H1: Home screen (new `HomePage.tsx`)

The app opens to a hub/dashboard. Clicking a tool card navigates to it. Uses `wouter` (already installed).

**Layout:** Dark themed, DankDayz branding at top. Tool cards in a responsive grid. Each card has: icon, name, short description, "OPEN →" button.

**Tool sections:**
1. **🏗 Builder Tools** — DankDayz Editor, Sci-Fi Architect, Race Track Maker, Bunker Maker, Maze Maker, Random Structure, Construction Zone
2. **⚙️ Server Tools** — Types.xml Editor, Loadout Builder, Weather Generator, Globals Generator, Gameplay Config Generator
3. **🗺 Map Tools** — Coordinate Lookup, Teleport Maker, Player Spawn Maker
4. **🔧 File Utilities** — JSON Relocator, JSON Splitter/Merger, XML Validator

**Navigation:** `wouter` `<Router>` wraps the app. Routes:
- `/` → HomePage
- `/editor` → existing App.tsx (full editor)
- `/types` → TypesEditor
- `/loadout` → LoadoutBuilder
- `/weather` → WeatherGenerator
- `/globals` → GlobalsGenerator
- `/gameplay` → GameplayGenerator
- `/coords` → CoordinateTool
- `/teleport` → TeleportMaker
- `/spawns` → PlayerSpawnMaker
- `/relocator` → JsonRelocator
- `/splitter` → JsonSplitter
- `/validator` → XmlValidator

All routes work offline (no external API calls). Back button on each tool returns to `/`.

---

## Part 4 — New Tools (all offline, all in-app)

### T1: Types.xml Editor (`TypesEditor.tsx`)

Inspired by: dayzfiletoolbox, dayzboosterz, GitHub types editors.

**Features:**
- Paste/upload a `types.xml` file
- Table view: classname, nominal, lifetime, restock, min, quantmin, quantmax, usage tags, category
- Filter by usage tag (Industrial, Military, Medical, etc.), category, search by name
- Bulk edit: select multiple items → set nominal/min/lifetime for all
- Per-item edit: click row → inline edit all fields
- Export: download modified `types.xml`
- All client-side, no server

---

### T2: Loadout Builder (`LoadoutBuilder.tsx`)

Inspired by: stellasdayztools loadout builder.

**Features:**
- Loadout name + spawn weight
- Character selection (SurvivorM_*, SurvivorF_*, or All)
- Body slots: slot type (Headgear, Body, Legs, Feet, Gloves, Back, Vest, Melee, Handgun, Primary, Secondary)
- Each slot: item classname (searchable dropdown from DAYZ_OBJECTS), chance (0–100), quantity
- Child items: each slot can have child items (attachments, contents) with their own chance/quantity
- Item Finder panel: search all DAYZ_OBJECTS, click to insert into focused field
- Live JSON preview (cfgspawnabletypes format)
- Export: download `.json` file
- Import: paste existing JSON to edit

---

### T3: Weather Generator (`WeatherGenerator.tsx`)

Inspired by: dayzfiletoolbox cfgweather editor.

**Features:**
- Visual sliders for: fog density, rain intensity, wind speed, overcast, storm frequency
- Time-of-day presets: Dawn, Day, Dusk, Night
- Weather presets: Clear, Overcast, Stormy, Foggy, Blizzard
- Live preview: text description of conditions
- Export: download `cfgweather.xml`

---

### T4: Globals Generator (`GlobalsGenerator.tsx`)

**Features:**
- Sliders/inputs for all key globals.xml values: ZombieMaxCount, AnimalMaxCount, ItemCleanupLifetime, RespawnAttempt, TimeAcceleration, NightTimeAcceleration, etc.
- Presets: Vanilla, PvP Server, PvE Server, Hardcore
- Export: download `globals.xml`

---

### T5: Gameplay Config Generator (`GameplayGenerator.tsx`)

**Features:**
- Toggle/input for all cfggameplay.json fields: thirdPersonView, crosshair, friendlyFire, baseBuilding, stamina, etc.
- Presets: Vanilla, PvP, PvE, Roleplay
- Export: download `cfggameplay.json`

---

### T6: Coordinate Tool (`CoordinateTool.tsx`)

Inspired by: dayz.ginfo.gg map.

**Features:**
- Map selector: Chernarus, Livonia, Sakhal (console-available maps only)
- Input X/Z coordinates → show on a static map image (pre-bundled map images)
- Click on map → show X/Z coordinates
- Named location lookup: type a place name → jump to coordinates
- Copy coordinates button
- Works fully offline with bundled map images

---

### T7: Teleport Maker (`TeleportMaker.tsx`)

**Features:**
- Add multiple teleport points: name, X, Y, Z
- Drag to reorder
- Generate init.c snippet using `setPos` / `createObject` pattern
- Export as init.c or JSON
- Import from JSON

---

### T8: Player Spawn Maker (`PlayerSpawnMaker.tsx`)

**Features:**
- Add spawn points: X, Y, Z, radius
- Map preview (same static map as Coordinate Tool)
- Generate `cfgplayerspawnpoints.xml`
- Export XML

---

### T9: JSON Relocator (`JsonRelocator.tsx`)

**Features:**
- Paste/upload a DayZ objects JSON
- Offset all objects: delta X, delta Y, delta Z
- Rotate all objects around a pivot: pivot X/Z, rotation degrees
- Preview: table of before/after positions
- Export modified JSON

---

### T10: JSON Splitter/Merger (`JsonSplitter.tsx`)

**Features:**
- **Split**: paste large objects JSON → split into N chunks by object count
- **Merge**: paste multiple JSON files → merge into one
- Export each chunk as separate download

---

### T11: XML Validator (`XmlValidator.tsx`)

**Features:**
- Paste XML (types.xml, events.xml, etc.)
- Validate: check well-formedness, required fields, value ranges
- Show errors with line numbers
- Auto-fix common issues (missing closing tags, invalid nominals)
- Export fixed XML

---

## Acceptance Criteria

- [ ] Clicking a build in BUILDS mode shows live object count (not hardcoded `frameCount`)
- [ ] `extraFrame` objects placed at `wy + 0` (not `wy + ei + 1`)
- [ ] Weapon `yOffset` in RANDOM is `0.05` (not `0.8`)
- [ ] `gen_azkaban_tower` produces a single rectangular fortress with curtain walls + wall turrets, no conical roofs, no freestanding tower ring
- [ ] App opens to a hub home screen at `/`
- [ ] All existing tools accessible from home screen
- [ ] All 11 new tools implemented and accessible from home screen
- [ ] All tools work offline (no external API calls)
- [ ] Electron build includes all new tools
- [ ] `npx tsc --noEmit` passes with zero errors

---

## Implementation Order

1. **B1** — Fix live object count in BUILDS mode (`App.tsx`)
2. **B2** — Fix extraFrame Y offset in `downloadBuild` (`App.tsx`)
3. **B3** — Fix weapon yOffset in `randomStructureData.ts`
4. **S1** — Rewrite `gen_azkaban_tower` in `shapeGenerators.ts`
5. **S2** — Audit/verify other preset shapes (no code change if correct)
6. **H1** — Add `wouter` routing, create `HomePage.tsx`, wrap `App.tsx` as `/editor` route
7. **T1** — `TypesEditor.tsx`
8. **T2** — `LoadoutBuilder.tsx`
9. **T3** — `WeatherGenerator.tsx`
10. **T4** — `GlobalsGenerator.tsx`
11. **T5** — `GameplayGenerator.tsx`
12. **T6** — `CoordinateTool.tsx` (with bundled map images)
13. **T7** — `TeleportMaker.tsx`
14. **T8** — `PlayerSpawnMaker.tsx`
15. **T9** — `JsonRelocator.tsx`
16. **T10** — `JsonSplitter.tsx`
17. **T11** — `XmlValidator.tsx`
18. **Final** — TypeScript check, verify all routes, verify Electron build
