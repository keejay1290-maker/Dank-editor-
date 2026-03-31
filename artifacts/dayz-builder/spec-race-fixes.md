# Spec: Race Maker — 3D Hazard Objects + Download Button Visibility

## Problem Statement

Two bugs in `RaceTrackMaker.tsx` / `Track3D.tsx`:

1. **Death Race hazard objects are invisible in 3D view.** `TrackPreview3D` only renders floor tiles, barriers, center dashes, and start/finish gantries. The `deathRaceObjects` array (barrels, ramps, roadblocks, tank traps, wrecks, rave lights) is computed but never passed to the 3D component — it has no props for hazards and no geometry for them.

2. **Download button is hard to find.** On mobile it only appears on the CODE tab. On desktop it's a small low-contrast button in the code panel header. The screenshot shows the user is on the MAP tab with no visible download action.

---

## Fix 1: 3D Hazard Object Rendering

### Root cause
`TrackPreview3D` / `Track3DScene` accept only:
```ts
{ waypoints, trackWidth, addBarriers, addText, barrierLen }
```
`deathRaceObjects` (type `SpawnObj[]`) is never passed in. The 3D scene has no geometry for any hazard type.

### Solution

**A. Extend `TrackPreview3D` props** to accept `hazardObjects?: SpawnObj[]`

**B. Add geometry components in `Track3D.tsx` for each hazard type:**

| Hazard | Classname match | 3D representation |
|--------|----------------|-------------------|
| Ramp | `Land_Pier_Long_DE` | Wedge box (6m × 0.8m tall, angled) — orange |
| Barrel | `Barrel_*` | Cylinder (r=0.3, h=0.9) — yellow |
| Roadblock | `StaticObj_Wall_CncBarrier_4Block` | Box (6m × 1.0m × 0.7m) — red |
| Tank Trap | `Land_TankTrap_DE` | X-crossed box pair — dark grey |
| Wreck | `CivilianSedan*` / `Hatchback*` / `Offroad*` | Flat box (4m × 1.2m × 1.8m) — rust brown |
| Rave Light | `StaticObj_Airfield_Light_PAPI1` / `Strobe` | Thin cylinder + emissive sphere — magenta |

**C. `HazardObjects` component** in `Track3D.tsx`:
- Receives `SpawnObj[]` (each has `name`, `x`, `y`, `z`, `yaw`)
- Groups by type, renders each group as an `InstancedMesh` for performance
- Positions are relative to world origin (same as floor tiles — subtract `posX/posZ` offset if needed, or pass raw dx/dz offsets)

**D. Coordinate system note:**
`deathRaceObjects` positions are stored as world coords (`x = pt.x + posX`). The 3D scene renders in local space (waypoints are centred around 0,0). Fix: pass `posX`, `posZ` to `TrackPreview3D` and subtract them when positioning hazards, OR store hazard positions as local offsets (preferred — simpler).

**Preferred approach:** Change `generateDeathRace()` to return positions as local offsets (relative to track centre, same coordinate space as `waypoints`). The world offset (`posX/posY/posZ`) is only applied at init.c export time, not in the preview.

### Changes to `Track3D.tsx`
- Add `HazardObjects` component with instanced meshes per hazard type
- Add `hazardObjects` prop to `Track3DScene` and `TrackPreview3D`
- Render `<HazardObjects objects={hazardObjects} />` inside `Track3DScene`

### Changes to `RaceTrackMaker.tsx`
- Pass `hazardObjects={deathRace ? deathRaceObjects : []}` to `<TrackPreview3D>`
- Ensure `deathRaceObjects` positions are in local track space (adjust `generateDeathRace` if currently adding `posX/posZ`)

---

## Fix 2: Download Button Visibility

### Root cause
- Download is only in the CODE panel header — invisible on MAP tab (mobile) and easy to miss on desktop
- Button styling: `px-3 py-1 text-[10px]` — small, low contrast against dark background

### Solution

**A. Add a prominent Download button to the MAP tab toolbar** (the bar with "Preview", "3D/2D toggle", object count badge):
- Place it on the right side of that bar, after the object count badge
- Style: `bg-[#e74c3c] text-white font-bold` — matches the race theme, clearly visible
- Label: `⬇ Download` with format shown (`init.c` or `JSON`)
- On mobile this appears on the MAP tab where users spend most time

**B. Make the CODE panel download button larger:**
- Increase to `px-4 py-1.5 text-[11px]`
- Keep `bg-[#e74c3c]` styling but ensure it's not clipped on small screens

**C. No new state needed** — reuse existing `download()` function and `format` state.

---

## Acceptance Criteria

1. With Death Race mode ON and any hazard type enabled, the 3D view shows coloured geometry at hazard positions
2. Barrels appear as yellow cylinders, ramps as orange wedges, roadblocks as red blocks, wrecks as brown boxes, rave lights as magenta emissive spheres
3. Hazard positions in 3D match their positions in the 2D preview
4. A `⬇ Download` button is visible on the MAP tab toolbar (both mobile and desktop)
5. Clicking the MAP-tab download button downloads the correct file (same as CODE panel button)
6. TypeScript compiles clean
7. No existing 3D rendering (floor, barriers, gantries) is broken

---

## Implementation Order

1. Refactor `generateDeathRace()` in `RaceTrackMaker.tsx` to store positions as local offsets (subtract `posX/posZ` from x/z, keep y as local height)
2. Add `HazardObjects` component to `Track3D.tsx` with instanced meshes for all 6 hazard types
3. Extend `Track3DScene` and `TrackPreview3D` props to accept `hazardObjects?: SpawnObj[]`
4. Pass `hazardObjects` from `RaceTrackMaker.tsx` to `<TrackPreview3D>`
5. Add `⬇ Download` button to the MAP tab preview toolbar in `RaceTrackMaker.tsx`
6. Increase CODE panel download button size
7. Run `npx tsc --noEmit` — fix any type errors
8. Verify in browser: hazards visible in 3D, download button visible on MAP tab
