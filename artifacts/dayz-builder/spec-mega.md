# DankDayz Builder — Mega Overhaul Spec

## Problem Statement

Six areas of work, combined from previous spec-overhaul.md plus new requests:

1. **Theme redesign** — Current amber/gold palette replaced with a sharp dark-green multi-accent design
2. **Tool renaming** — All tools get "Dank" prefix branding
3. **Bug fixes** — Live object count in BUILDS, extraFrame floating, weapon yOffset
4. **Shape accuracy** — All 60+ presets cross-referenced and fixed; Iron Throne backrest fan; Azkaban rewrite; 3 teleporter presets added
5. **New TELEPORT tab** — `TeleportMaker.tsx` added to top nav bar after CONZONE, with a shape generator producing 3 creative teleporter variants with randomise button
6. **Hub page + 11 new tools** — Home screen, wouter routing, all tools offline-capable

---

## Part 1 — Theme Redesign

### T1: Colour System (`index.css` + `App.tsx`)

**Design direction:** Dark military-tech aesthetic. Deep near-black green background, bright green primary, each tab keeps its own accent colour. Multi-colour tab bar stays. Clean, sharp, readable.

**New CSS variables (`index.css`):**
```css
--background: 150 15% 4%;        /* #080f09 — very dark green-black */
--foreground: 120 20% 78%;       /* #b8d4b8 — soft green-white text */
--border: 140 20% 12%;           /* #182418 — dark green border */
--input: 140 15% 8%;             /* #0e160e */
--ring: 142 60% 40%;             /* #27ae60 — green ring */
--card: 145 18% 7%;              /* #0c1510 */
--card-foreground: 120 20% 78%;
--primary: 142 60% 40%;          /* #27ae60 green */
--primary-foreground: 150 15% 4%;
--muted: 140 15% 10%;
--muted-foreground: 130 15% 42%;
--gold: 142 60% 40%;             /* repurpose gold slot → green */
--gold-dim: 142 40% 25%;
```

**Inline colour replacements in `App.tsx`:**
- `#0a0804` → `#080f09` (main bg)
- `#12100a` → `#0c1510` (header bg)
- `#0e0c08` → `#0a1209` (sidebar bg)
- `#2e2518` → `#1a2e1a` (borders)
- `#1e1a10` → `#162016` (subtle borders)
- `#c8b99a` → `#b8d4b8` (body text)
- `#d4a017` → `#27ae60` (primary accent — gold → green)
- `#9a8858` → `#5a8a5a` (dim text)
- `#6a5a3a` → `#3a6a3a` (very dim)
- `#1a1408` → `#0e1a0e` (hover bg)
- `#1a1208` → `#0e180e` (count badge bg)
- `#2a1206` → `#0a1a0a` (warning bg)
- `#e07a20` → `#e07a20` (keep orange for warnings)
- `#c0392b` → `#c0392b` (keep red for DAYZ logo)
- `#8b1a1a` → `#8b1a1a` (keep red border)

**Tab bar accent colours** — keep each tab's unique colour (green, orange, blue, purple, red, teal, amber) for visual distinction. Only the BUILD and TEXT tabs change from gold → green.

**Header branding:** "DANK" stays gold-ish (`#d4a017`), "DAYZ" stays red (`#c0392b`). Badge changes to green border.

---

## Part 2 — Tool Renaming ("Dank" prefix)

All tool labels, titles, and component display names get "Dank" prefix:

| Current | Renamed |
|---|---|
| DankDayz Editor (BUILD tab) | DankDayz Builder |
| TEXT tab | DankText Maker |
| BUILDS tab | DankBuilds Library |
| WEAPONS tab | DankWeapon Builder |
| BUNKER tab | DankBunker Maker |
| MAZE tab | DankMaze Maker |
| RACE tab | DankRace Maker |
| RANDOM tab | DankRandom Maker |
| CONZONE tab | DankConZone Maker |
| New TELEPORT tab | DankTeleport Maker |
| Types.xml Editor | DankTypes Editor |
| Loadout Builder | DankLoadout Builder |
| Weather Generator | DankWeather Generator |
| Globals Generator | DankGlobals Generator |
| Gameplay Config | DankGameplay Config |
| Coordinate Tool | DankCoords Tool |
| Player Spawn Maker | DankSpawn Maker |
| JSON Relocator | DankRelocator |
| JSON Splitter/Merger | DankSplitter |
| XML Validator | DankValidator |

Tab bar labels stay short (BUNKER, MAZE, etc.) but tooltips/headers show full Dank names.

---

## Part 3 — Bug Fixes

### B1: Live object count in BUILDS mode

Replace hardcoded `b.frameCount` display with a `useMemo` computed from `getShapePoints(b.shape, b.params).length * (1 + extraCount)`. Update both the detail panel green box (~line 1251) and the builds list card badge (~line 2104).

### B2: extraFrame floating placement

In `downloadBuild` (App.tsx ~line 930), change `wy + ei + 1` → `wy` for all extraFrame placements in both init.c and JSON output. Extras are co-located with the frame object, not stacked vertically.

### B3: Weapon yOffset in RANDOM

In `randomStructureData.ts`, change all weapon/loot `yOffset` from `0.8` → `0.05`. Rifles, pistols, and all loot items should lie at floor level (0.05m above ground prevents z-fighting).

---

## Part 4 — Shape Accuracy (All 60+ Presets)

### S1: Iron Throne — backrest fan fix

**Problem:** The spike lean factor `(t-0.5)*j*0.4*s` is too subtle. The backrest looks like vertical spikes, not the iconic wide fan/crown shape.

**Fix in `gen_iron_throne`:**
- Increase lean multiplier from `0.4` → `1.8` so edge spikes splay dramatically outward
- Add horizontal spread: spike base X positions spread wider at top (`x + lean * 1.5` at apex)
- Cross-swords fan angle: increase from `±81°` → `±95°` for more dramatic spread
- Add a second row of cross-swords at a lower height for density

### S2: Azkaban — complete rewrite

**Real Azkaban** (films + Pottermore): Single massive dark fortress on a rocky North Sea island. One enormous keep, thick curtain walls, wall-mounted turrets, flat crenellated battlements, NO freestanding tower ring, NO conical roofs.

**New `gen_azkaban_tower`:**
- Central keep: tall rectangular mass (w=r, d=r*0.8), irregular floor rings at every h/8
- Asymmetric heights: one wing taller (h), opposite wing shorter (h*0.7)
- Curtain wall: rectangular perimeter at r*1.8, height=h*0.35, battlements on top
- Wall turrets: 6 small circular turrets projecting from curtain wall (not freestanding), height=h*0.5
- No conical roofs — flat crenellation rings on all towers
- Gate arch on south face of curtain wall

### S3: Systematic preset audit

Cross-reference all presets against reference images. Fixes needed:

| Preset | Fix Required |
|---|---|
| **Colosseum** | Verify oval shape — should be elliptical not circular. Add inner arena floor ring. |
| **Stonehenge** | Verify outer sarsen ring + inner trilithon horseshoe. Lintels must be horizontal. |
| **AT-AT Walker** | Legs too thin relative to body. Increase leg radius. Body should be longer than wide. |
| **Millennium Falcon** | Cockpit offset direction: should be to PORT (left when facing forward = negative X). Mandibles face forward (+Z). Verify. |
| **Dragon** | Wings need more span — current wingspan too narrow. Add membrane ribs. |
| **Eye of Sauron** | Verify tower base + flaming eye ring at top. Should have Barad-dûr tower below. |
| **Minas Tirith** | Verify 7 concentric rings ascending, citadel spire at top. Already rewritten — verify params. |
| **Star Destroyer** | Verify triangular hull profile from above. Bridge tower on dorsal ridge. Already rewritten — verify. |
| **T-800 Endoskeleton** | Verify humanoid proportions: skull, ribcage, pelvis, arms, legs. |
| **Mordor Gate** | Should be two massive towers with a gate arch between them (Black Gate). |
| **Avengers Tower** | Should be a skyscraper with distinctive A-shaped top section. |
| **The Wall (GoT)** | Should be a long straight wall, very tall, with castle at one end. |
| **Pyramid Aztec** | Verify stepped pyramid with flat top (not pointed). |
| **Skull Giant** | Verify skull proportions: eye sockets, nasal cavity, jaw. |
| **Volcano** | Verify cone shape with crater opening at top. |
| **Rib Cage** | Verify curved ribs, spine column, sternum. |
| **Humanoid** | Verify bipedal proportions. |
| **Crashed UFO** | Verify saucer tilted into ground with debris scatter. |
| **Alien Mothership** | Verify large disc with emitter array underneath. |
| **Reactor Core** | Verify cylindrical core with ring emitters. |
| **DNA Helix** | Verify double helix with rungs. |
| **Halo Ring** | Verify large torus with correct major/minor ratio. |
| **Prison Tower** | Verify circular tiers with walkway rings. |
| **Star Fort** | Verify 5-point star bastion with correct geometry. |
| **Celtic Ring** | Verify standing stones in ring with arch pairs. |
| **Bastion Round** | Verify circular fort with corner towers. |
| **Bastion Square** | Verify square fort with corner towers. |
| **Skyscraper** | Verify tapering floors + antenna spire. |
| **Sci-Fi Gate** | Verify arch gate with side pylons. |
| **Black Hole** | Verify accretion disc + event horizon ring. |
| **Saturn** | Verify sphere body + tilted ring system. |
| **Crown** | Verify base band + spike points. |
| **Submarine** | Verify hull + conning tower + dive planes. |
| **Aircraft Carrier** | Verify flat deck + island superstructure + angled flight deck. |
| **Helicarrier** | Verify carrier hull + rotor pods. |
| **Vault Door** | Verify circular door with locking bolts. |
| **Destroyer** | Verify naval hull + gun turrets + bridge. |
| **Gothic Arch** | Verify pointed arch arcade. |
| **Bridge Truss** | Verify Warren truss geometry. |
| **Amphitheater** | Verify semicircular seating tiers. |
| **Log Cabin** | Verify log walls + pitched roof. |
| **Freeway Curve** | Verify banked curve road section. |
| **Olympic Rings** | Verify 5 interlocking rings at correct overlap. |
| **Pirate Ship** | Verify hull + masts + rigging. |
| **Treehouse** | Verify platform + ladder + railings. |
| **Checkpoint** | Verify barrier layout + guard positions. |
| **Watchtower** | Verify tower + platform + ladder. |
| **Fuel Depot** | Verify tanks + pipes + barriers. |
| **Sniper Nest** | Verify elevated position + cover. |
| **Farmstead** | Verify building cluster + fence. |
| **Survivor Camp** | Verify tent/shelter cluster. |
| **Bunker Line** | Verify defensive line layout. |
| **Power Relay** | Verify transformer + pylons. |
| **Radio Outpost** | Verify antenna + building. |
| **Transformers** (all 7) | Verify bipedal robot proportions for each character. |
| **Iron Throne** | Fixed in S1 above. |
| **Azkaban** | Fixed in S2 above. |

For each preset: if the generator output matches reference images → no change. If wrong → fix the generator function and/or params.

---

## Part 5 — DankTeleport Maker (New Tab)

### TM1: Tab addition

Add `"teleport"` to `EditorMode` type and tab bar in `App.tsx`, after CONZONE:
- Key: `"teleport"`, emoji: `⚡`, label: `TELEPORT`
- Active colour: `bg-[#8e44ad] text-white` (deep purple — energy/sci-fi)
- Inactive: `text-[#5a2a7a] hover:text-[#8e44ad]`

### TM2: `TeleportMaker.tsx` component

Full-panel takeover (same pattern as RACE, RANDOM, CONZONE). Features:

**Controls panel (left):**
- Seed input + 🎲 Randomise button (generates new seed → new layout)
- Style selector: `Sci-Fi Pad`, `Transporter Pad`, `Stargate Portal`
- World position: X, Y, Z inputs
- Scale slider (0.5× – 2×)
- Format toggle: init.c / JSON
- Generate button
- Download button

**3D preview (right):** Uses `ZonePreview3D` component

**Output panel (bottom):** init.c or JSON code

### TM3: Three teleporter shape generators in `shapeGenerators.ts`

#### `gen_teleporter_scifi` — Sci-Fi Pad + Energy Ring
Console objects used: `Land_GasTank_Cylindrical`, `Land_BarrierConcrete_01_DE`, `StaticObj_Lamp_Ind`, `Land_Tisy_RadarB_Antenna`, `Spotlight`

Structure:
- Circular raised platform (ring of barriers, 8-point)
- 4 vertical energy columns (gas tanks) at cardinal points, height = scale*4m
- Overhead ring emitter (torus of lamp objects at height = scale*6m)
- Central power core (single large gas tank, scale*2m tall)
- Ground marker lights (PAPI lights in cross pattern)
- Randomise: varies column count (4–8), ring radius, column height

#### `gen_teleporter_transporter` — Star Trek Transporter Pad
Console objects used: `Land_BarrierConcrete_01_DE`, `Land_GasTank_Cylindrical`, `Land_Tisy_RadarPlatform_Top`, `StaticObj_Lamp_Ind`, `Land_Airfield_Radar_Tall`

Structure:
- Hexagonal raised platform (6 barriers in hex)
- 6 emitter columns (cylindrical tanks) at hex vertices, height = scale*5m
- Overhead arch (3 radar platforms forming arch)
- Control console (transformer building offset to side)
- Beam effect: vertical line of lamp objects above platform center
- Randomise: varies hex size, column height, arch style

#### `gen_teleporter_stargate` — Stargate Portal
Console objects used: `Land_Castle_Gate_DE`, `Land_GasTank_Big`, `Land_Tisy_RadarB_Antenna`, `StaticObj_Lamp_Ind`, `Land_Power_Transformer_Build`

Structure:
- Standing ring/arch (castle gate + gas tank spheres forming circle, 12-point)
- Inner portal plane (lamp objects filling the ring interior)
- Emitter array: 8 antenna objects around ring perimeter
- DHD (dialling device): transformer building 3m in front
- Ground ramp: staircase of barriers leading up to gate
- Randomise: varies ring diameter, emitter count, ramp length

### TM4: `teleporter_scifi`, `teleporter_transporter`, `teleporter_stargate` in `shapeParams.ts`

Each gets params: `scale`, `radius`, `columnCount` (scifi/transporter), `ringDiameter` (stargate)

### TM5: Three QUICK_PRESETS entries

```ts
{ category: "⚡ Teleporters", label: "Sci-Fi Pad",       shape: "teleporter_scifi",       params: { scale:1, radius:8, columnCount:4 }, suggestedClass: "Land_GasTank_Cylindrical" },
{ category: "⚡ Teleporters", label: "Transporter Pad",   shape: "teleporter_transporter", params: { scale:1, radius:6, columnCount:6 }, suggestedClass: "Land_BarrierConcrete_01_DE" },
{ category: "⚡ Teleporters", label: "Stargate Portal",   shape: "teleporter_stargate",    params: { scale:1, ringDiameter:12 },         suggestedClass: "Land_Castle_Gate_DE" },
```

---

## Part 6 — Hub Page & 11 New Tools

*(Carried forward from spec-overhaul.md — unchanged)*

### H1: Home screen (`HomePage.tsx`)

App opens to `/`. Uses `wouter` (already installed). Dark green themed, DankDayz branding. Tool cards in responsive grid with sections:

1. **🏗 DankDayz Makers** — DankDayz Builder, DankText Maker, DankBuilds Library, DankWeapon Builder, DankBunker Maker, DankMaze Maker, DankRace Maker, DankRandom Maker, DankConZone Maker, DankTeleport Maker
2. **⚙️ Server Tools** — DankTypes Editor, DankLoadout Builder, DankWeather Generator, DankGlobals Generator, DankGameplay Config
3. **🗺 Map Tools** — DankCoords Tool, DankSpawn Maker
4. **🔧 File Utilities** — DankRelocator, DankSplitter, DankValidator

Routes:
- `/` → HomePage
- `/editor` → existing App.tsx
- `/types` → DankTypes Editor
- `/loadout` → DankLoadout Builder
- `/weather` → DankWeather Generator
- `/globals` → DankGlobals Generator
- `/gameplay` → DankGameplay Config
- `/coords` → DankCoords Tool
- `/spawns` → DankSpawn Maker
- `/relocator` → DankRelocator
- `/splitter` → DankSplitter
- `/validator` → DankValidator

### T1: DankTypes Editor
Paste/upload types.xml → table view → filter/search → bulk edit nominal/min/lifetime → per-item inline edit → export modified types.xml. All client-side.

### T2: DankLoadout Builder
Slot-by-slot loadout builder. Loadout name, spawn weight, character selection. Body slots with item classname (searchable from DAYZ_OBJECTS), chance, quantity. Child items (attachments/contents). Item Finder panel. Live cfgspawnabletypes JSON preview. Export/import JSON.

### T3: DankWeather Generator
Sliders: fog, rain, wind, overcast, storm frequency. Presets: Clear/Overcast/Stormy/Foggy/Blizzard. Export cfgweather.xml.

### T4: DankGlobals Generator
Inputs for all globals.xml values. Presets: Vanilla/PvP/PvE/Hardcore. Export globals.xml.

### T5: DankGameplay Config
Toggles/inputs for all cfggameplay.json fields. Presets: Vanilla/PvP/PvE/Roleplay. Export cfggameplay.json.

### T6: DankCoords Tool
Map selector: Chernarus, Livonia, Sakhal. Bundled map images in `public/maps/`. Click map → X/Z coords. Input coords → marker on map. Named location lookup. Copy button. Fully offline.

### T7: DankSpawn Maker
Add spawn points (X, Y, Z, radius). Map preview. Export cfgplayerspawnpoints.xml.

### T8: DankRelocator
Paste DayZ objects JSON → offset X/Y/Z → rotate around pivot → preview table → export.

### T9: DankSplitter
Split large JSON into N chunks, or merge multiple JSONs into one. Export.

### T10: DankValidator
Paste XML → validate well-formedness + field ranges → show errors with line numbers → auto-fix → export.

---

## Acceptance Criteria

- [ ] Theme: dark green background, green primary accent, all amber/gold replaced
- [ ] All tools display "Dank" prefix in headers/titles
- [ ] BUILDS mode shows live object count (not hardcoded `frameCount`)
- [ ] `extraFrame` objects at `wy + 0` (not `wy + ei + 1`)
- [ ] Weapon `yOffset` = `0.05` in RANDOM
- [ ] Iron Throne backrest spikes fan out dramatically (lean multiplier ≥ 1.8)
- [ ] Azkaban is a single rectangular fortress with curtain walls, no tower ring, no conical roofs
- [ ] All 60+ presets audited; inaccurate ones fixed
- [ ] TELEPORT tab appears after CONZONE in nav bar
- [ ] All 3 teleporter presets generate distinct creative structures using console-valid objects
- [ ] Randomise button on TeleportMaker produces different layouts
- [ ] App opens to hub home screen at `/`
- [ ] All 10 new tool pages implemented and accessible from home
- [ ] All tools work offline (no external API calls)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Every function tested: object count updates, downloads work, 3D previews render

---

## Implementation Order

1. **Theme** — `index.css` CSS variables + `App.tsx` inline colour sweep
2. **B1** — Live object count in BUILDS mode
3. **B2** — Fix extraFrame Y offset
4. **B3** — Fix weapon yOffset in RANDOM
5. **S1** — Iron Throne backrest fan fix
6. **S2** — Azkaban rewrite
7. **S3** — Systematic audit of all other presets (fix generators as needed)
8. **TM1–TM5** — TeleportMaker tab + 3 shape generators + shapeParams + QUICK_PRESETS
9. **H1** — wouter routing + HomePage.tsx
10. **T1** — DankTypes Editor
11. **T2** — DankLoadout Builder
12. **T3** — DankWeather Generator
13. **T4** — DankGlobals Generator
14. **T5** — DankGameplay Config
15. **T6** — DankCoords Tool (+ bundle map images)
16. **T7** — DankSpawn Maker
17. **T8** — DankRelocator
18. **T9** — DankSplitter
19. **T10** — DankValidator
20. **Tool renames** — Update all display names/headers to Dank prefix
21. **Final** — Full TypeScript check + smoke test every function
