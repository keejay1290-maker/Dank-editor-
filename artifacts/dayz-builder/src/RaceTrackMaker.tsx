import React, { useState, useMemo, useCallback, Suspense } from "react";
import TrackPreview3D from "./Track3D";
import { formatInitC, HELPER_FUNC } from "@/lib/dayzObjects";
import { MAX_OBJECTS } from "@/lib/constants";
import { executePipeline, PipelineContext } from "@/lib/pipeline";
import { Point3D } from "@/lib/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Pt { x: number; z: number; }
interface SpawnObj { name: string; x: number; y: number; z: number; pitch: number; yaw: number; roll: number; scale: number; }

// ─── PIXEL FONT — 3-wide × 5-tall dot matrix ─────────────────────────────────
// Each array = 5 rows (top→bottom); each row = 3 booleans (left→right)
const FONT: Record<string, number[][]> = {
  ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
  'S': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'R': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  'F': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'N': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
};
const LETTER_W = 3;   // columns per letter
const PIXEL_SP = 0.8; // metres between pixel centres
const LETTER_GAP = 0.6; // metres between letters

// ─── TRACK PRESETS ────────────────────────────────────────────────────────────
type PresetKey = "oval" | "rectangle" | "diamond" | "triangle" | "figure8" | "lshape" | "touge" | "nwaf_oval";

const PRESETS: Record<PresetKey, { label: string; icon: string; desc: string; }> = {
  oval:      { label: "Oval",         icon: "⭕", desc: "Classic elliptical circuit — smooth turns" },
  rectangle: { label: "Rectangle",   icon: "⬜", desc: "Square corners — chicane straights" },
  diamond:   { label: "Diamond",     icon: "🔷", desc: "4-corner diamond — sharp hairpins" },
  triangle:  { label: "Triangle",    icon: "🔺", desc: "3-corner triangular track" },
  figure8:   { label: "Figure-8",    icon: "∞",  desc: "Crossing 8 — requires elevated start/finish" },
  lshape:    { label: "L-Shape",     icon: "📐", desc: "L-shaped drift track" },
  touge:     { label: "Touge",       icon: "🏔", desc: "Mountain-pass hairpin series — based on local touge22 layout" },
  nwaf_oval: { label: "NWAF Oval",   icon: "📡", desc: "Oval pre-centred at NWAF airfield (4413, 10323)" },
};

function buildPresetWaypoints(key: PresetKey, rx: number, rz: number): Pt[] {
  const hw = rx, hd = rz;
  switch (key) {
    case "oval": {
      const N = 24;
      return Array.from({ length: N }, (_, i) => {
        const a = (2 * Math.PI * i) / N - Math.PI / 2;
        return { x: hw * Math.cos(a), z: hd * Math.sin(a) };
      });
    }
    case "rectangle":
      return [
        { x: -hw, z: -hd }, { x:  hw, z: -hd },
        { x:  hw, z:  hd }, { x: -hw, z:  hd },
      ];
    case "diamond":
      return [
        { x:   0, z: -hd }, { x:  hw, z:   0 },
        { x:   0, z:  hd }, { x: -hw, z:   0 },
      ];
    case "triangle":
      return [
        { x:    0, z: -hd },
        { x:  hw,  z:  hd * 0.6 },
        { x: -hw,  z:  hd * 0.6 },
      ];
    case "figure8": {
      const N = 12;
      const top: Pt[] = Array.from({ length: N }, (_, i) => {
        const a = (2 * Math.PI * i) / N - Math.PI / 2;
        return { x: hw * 0.55 * Math.cos(a), z: -hd * 0.45 + hd * 0.45 * Math.sin(a) };
      });
      const bot: Pt[] = Array.from({ length: N }, (_, i) => {
        const a = -(2 * Math.PI * i) / N + Math.PI / 2;
        return { x: hw * 0.55 * Math.cos(a), z:  hd * 0.45 + hd * 0.45 * Math.sin(a) };
      });
      return [...top, ...bot];
    }
    case "lshape":
      return [
        { x: -hw,     z: -hd },
        { x:  hw,     z: -hd },
        { x:  hw,     z:  0  },
        { x:  0,      z:  0  },
        { x:  0,      z:  hd },
        { x: -hw,     z:  hd },
      ];
    // Touge: tight hairpin mountain-pass series (based on touge22.json curve data)
    // Tight right-left-right pattern with progressive hairpin radii
    case "touge": {
      const sections: Pt[] = [];
      const straight = hw * 0.9;
      const hpin = hd * 0.35;
      // Approach straight
      for (let i = 0; i <= 3; i++) sections.push({ x: -straight + (straight * 2 * i / 3), z: -hd });
      // Hard right hairpin
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI + (Math.PI * i / 8);
        sections.push({ x: hw * 0.5 + hpin * Math.cos(a), z: -hd * 0.3 + hpin * Math.sin(a) });
      }
      // Mid straight
      for (let i = 0; i <= 3; i++) sections.push({ x: hw * 0.5 - (hw * i / 3), z: hd * 0.15 });
      // Left hairpin
      for (let i = 0; i <= 8; i++) {
        const a = -(Math.PI * i / 8);
        sections.push({ x: -hw * 0.5 + hpin * Math.cos(a), z: hd * 0.15 + hpin * Math.sin(a) });
      }
      // Final back straight
      for (let i = 0; i <= 2; i++) sections.push({ x: -hw * 0.5 + (hw * 0.5 * i / 2), z: hd * 0.6 });
      return sections;
    }
    // NWAF Oval: standard oval — posX/Z preset should be set to NWAF coords in the UI
    case "nwaf_oval": {
      const N = 24;
      return Array.from({ length: N }, (_, i) => {
        const a = (2 * Math.PI * i) / N - Math.PI / 2;
        return { x: hw * Math.cos(a), z: hd * Math.sin(a) };
      });
    }
  }
}

// ─── DEATH RACE ───────────────────────────────────────────────────────────────

// Mulberry32 seeded PRNG — same pattern as MazeMaker
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return {
    next(): number {
      s += 0x6D2B79F5;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(lo: number, hi: number): number {
      return lo + Math.floor(this.next() * (hi - lo + 1));
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)];
    },
  };
}

interface DeathRaceOpts {
  seed: number;
  density: 1 | 2 | 3;
  waypoints: Pt[];
  posX: number; posY: number; posZ: number;
  trackWidth: number;
  enableRamps: boolean;
  enableBarrels: boolean;
  enableRoadblocks: boolean;
  enableWrecks: boolean;
  enableLights: boolean;
}

const BARREL_CLASSES = ["barrel_blue", "barrel_red", "barrel_yellow", "barrel_green"] as const;

// Thickness of a flat floor tile (staticobj_castle_wall3 laid at pitch=90).
// Hazard objects must sit on top of the floor, not embedded inside it.
const FLOOR_THICKNESS = 0.4;

function generateDeathRace(opts: DeathRaceOpts): SpawnObj[] {
  const { seed, density, waypoints, posX, posY, posZ, trackWidth } = opts;
  const floorY = posY + FLOOR_THICKNESS; // top surface of floor tiles
  const rng = mulberry32(seed);
  const objs: SpawnObj[] = [];
  const n = waypoints.length;
  if (n < 2) return objs;

  // Scale counts by density
  const scale = density; // 1=light, 2=medium, 3=chaos

  // Build segment list with geometry
  const segments: Array<ReturnType<typeof segmentDir> & { p1: Pt; p2: Pt; midX: number; midZ: number }> = [];
  for (let i = 0; i < n; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[(i + 1) % n];
    const geo = segmentDir(p1, p2);
    if (geo.len < 2) continue;
    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.z + p2.z) / 2;
    segments.push({ ...geo, p1, p2, midX, midZ });
  }
  if (segments.length === 0) return objs;

  const halfW = trackWidth / 2;
  const BARRIER_EDGE = halfW + 0.35;

  // Pick random segments without repeating too close together
  function pickSegments(count: number): typeof segments {
    const shuffled = [...segments].sort(() => rng.next() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // ── RAMPS (Land_WoodenPier_15m, pitch=-20°, 1-2 side by side to ensure drivable gaps) ──────────────
  if (opts.enableRamps) {
    const rampCount = rng.int(2, 2 + scale);
    const rampSegs = pickSegments(rampCount);
    for (const seg of rampSegs) {
      // 1 or 2 ramps so we never block the whole track width (usually 8-12m)
      const numSideBySide = rng.int(1, 2);
      const offsetAlong = rng.next() * seg.len * 0.4 + seg.len * 0.3;
      const cx = seg.p1.x + offsetAlong * seg.fwdX;
      const cz = seg.p1.z + offsetAlong * seg.fwdZ;
      // Randomly bias the ramps to the left, center, or right of the track
      const lateralBiasOptions = [-halfW * 0.5, 0, halfW * 0.5];
      const bias = rng.pick(lateralBiasOptions);

      for (let r = 0; r < numSideBySide; r++) {
        // WoodenPier is ~3-4m wide. 
        const k = bias + (r - (numSideBySide - 1) / 2) * 4;
        
        // Ensure strictly inside the track bounds
        const clampedK = Math.max(-halfW + 2, Math.min(halfW - 2, k));

        objs.push({
          name: "land_woodenpier_15m",
          x: posX + cx + clampedK * seg.rightX,
          y: floorY,
          z: posZ + cz + clampedK * seg.rightZ,
          pitch: -20, yaw: seg.yaw, roll: 0, scale: 1,
        });
      }
    }
  }

  // ── BARREL WALLS (stacked 2 high, 4-6 wide across track) ─────────────────
  if (opts.enableBarrels) {
    const wallCount = rng.int(3, 3 + scale * 2);
    const wallSegs = pickSegments(wallCount);
    for (const seg of wallSegs) {
      const barrelClass = rng.pick([...BARREL_CLASSES]);
      const numBarrels = rng.int(4, 6);
      const offsetAlong = rng.next() * seg.len * 0.5 + seg.len * 0.25;
      const cx = seg.p1.x + offsetAlong * seg.fwdX;
      const cz = seg.p1.z + offsetAlong * seg.fwdZ;
      for (let b = 0; b < numBarrels; b++) {
        const k = -halfW + (b + 0.5) * (trackWidth / numBarrels);
        // Ground row
        objs.push({
          name: barrelClass,
          x: posX + cx + k * seg.rightX,
          y: floorY,
          z: posZ + cz + k * seg.rightZ,
          pitch: 0, yaw: seg.yaw + rng.int(-45, 45), roll: 0, scale: 1,
        });
        // Stacked row
        objs.push({
          name: barrelClass,
          x: posX + cx + k * seg.rightX,
          y: floorY + 1.0,
          z: posZ + cz + k * seg.rightZ,
          pitch: 0, yaw: seg.yaw + rng.int(-45, 45), roll: 0, scale: 1,
        });
      }
    }
  }

  // ── WOODEN CRATES (Scattered loosely so cars can weave through) ────────────
  if (opts.enableBarrels) {
    const crateCount = rng.int(3, 4 + scale);
    const crateSegs = pickSegments(crateCount);
    for (const seg of crateSegs) {
       const offsetAlong = rng.next() * seg.len * 0.6 + seg.len * 0.2;
       const cx = seg.p1.x + offsetAlong * seg.fwdX;
       const cz = seg.p1.z + offsetAlong * seg.fwdZ;
       const numCrates = rng.int(2, 4);
       for (let i = 0; i < numCrates; i++) {
          const k = -halfW + 1.5 + rng.next() * (trackWidth - 3);
          objs.push({
            name: "land_woodencrate",
            x: posX + cx + k * seg.rightX,
            y: floorY,
            z: posZ + cz + k * seg.rightZ,
            pitch: 0, yaw: seg.yaw + rng.int(-45, 45), roll: 0, scale: 1,
          });
       }
    }
  }

  // ── ROADBLOCKS (jersey barriers diagonal, one-sided gap) ─────────────────
  if (opts.enableRoadblocks) {
    const blockCount = rng.int(2, 2 + scale);
    const blockSegs = pickSegments(blockCount);
    let gapSide = 1; // alternates left/right
    for (const seg of blockSegs) {
      const diagYaw = seg.yaw + rng.int(25, 35) * (rng.next() > 0.5 ? 1 : -1);
      const offsetAlong = rng.next() * seg.len * 0.4 + seg.len * 0.3;
      const cx = seg.p1.x + offsetAlong * seg.fwdX;
      const cz = seg.p1.z + offsetAlong * seg.fwdZ;
      // Place 2 barriers — leave gap on one side
      const positions = [-halfW * 0.5, halfW * 0.5];
      for (let pi = 0; pi < positions.length; pi++) {
        if (pi === (gapSide > 0 ? 1 : 0)) continue; // skip gap side
        const k = positions[pi];
        objs.push({
          name: "staticobj_castle_wall3",
          x: posX + cx + k * seg.rightX,
          y: floorY,
          z: posZ + cz + k * seg.rightZ,
          pitch: 0, yaw: diagYaw, roll: 0, scale: 1,
        });
      }
      gapSide *= -1;
    }
  }

  // ── TANK TRAPS (on track edges) ───────────────────────────────────────────
  if (opts.enableRoadblocks) {
    const trapCount = rng.int(4, 4 + scale * 2);
    const trapSegs = pickSegments(trapCount);
    for (const seg of trapSegs) {
      const side = rng.next() > 0.5 ? 1 : -1;
      const k = side * (halfW - 1.5);
      const offsetAlong = rng.next() * seg.len * 0.6 + seg.len * 0.2;
      const cx = seg.p1.x + offsetAlong * seg.fwdX;
      const cz = seg.p1.z + offsetAlong * seg.fwdZ;
      objs.push({
        name: "land_mil_fortified_nest_small",
        x: posX + cx + k * seg.rightX,
        y: floorY,
        z: posZ + cz + k * seg.rightZ,
        pitch: 0, yaw: seg.yaw + rng.int(-45, 45), roll: 0, scale: 1,
      });
    }
  }

  // ── WRECKS (on track, off-centre) ─────────────────────────────────────────
  if (opts.enableWrecks) {
    const wreckCount = rng.int(1, 1 + Math.floor(scale / 2));
    const wreckClasses = ["land_wreck_volha_blue", "land_wreck_uaz"];
    const wreckSegs = pickSegments(wreckCount);
    for (const seg of wreckSegs) {
      const k = (rng.next() - 0.5) * halfW * 0.6; // off-centre
      const offsetAlong = rng.next() * seg.len * 0.4 + seg.len * 0.3;
      const cx = seg.p1.x + offsetAlong * seg.fwdX;
      const cz = seg.p1.z + offsetAlong * seg.fwdZ;
      objs.push({
        name: rng.pick(wreckClasses),
        x: posX + cx + k * seg.rightX,
        y: floorY,
        z: posZ + cz + k * seg.rightZ,
        pitch: 0, yaw: seg.yaw + rng.int(-45, 45), roll: 0, scale: 1,
      });
    }
  }

  // ── RAVE LIGHTS (around perimeter, outside barriers) ─────────────────────
  if (opts.enableLights) {
    const papiCount = rng.int(8, 8 + scale * 4);
    const strobeCount = rng.int(4, 4 + scale * 2);
    const lightOffset = BARRIER_EDGE + 3 + rng.next() * 2;

    for (let i = 0; i < papiCount; i++) {
      const seg = rng.pick(segments);
      const t = rng.next() * seg.len;
      const side = rng.next() > 0.5 ? 1 : -1;
      objs.push({
        name: "staticobj_airfield_light_papi1",
        x: posX + seg.p1.x + t * seg.fwdX + side * lightOffset * seg.rightX,
        y: floorY,
        z: posZ + seg.p1.z + t * seg.fwdZ + side * lightOffset * seg.rightZ,
        pitch: 0, yaw: rng.int(0, 359), roll: 0, scale: 1,
      });
    }
    for (let i = 0; i < strobeCount; i++) {
      const seg = rng.pick(segments);
      const t = rng.next() * seg.len;
      const side = rng.next() > 0.5 ? 1 : -1;
      objs.push({
        name: "staticobj_airfield_light_strobe_01",
        x: posX + seg.p1.x + t * seg.fwdX + side * (lightOffset + 1) * seg.rightX,
        y: floorY,
        z: posZ + seg.p1.z + t * seg.fwdZ + side * (lightOffset + 1) * seg.rightZ,
        pitch: 0, yaw: rng.int(0, 359), roll: 0, scale: 1,
      });
    }
  }

  return objs;
}

// ─── SEGMENT GEOMETRY ─────────────────────────────────────────────────────────
function segmentDir(p1: Pt, p2: Pt) {
  const dx = p2.x - p1.x, dz = p2.z - p1.z;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.001) return { fwdX: 0, fwdZ: 1, rightX: 1, rightZ: 0, len: 0, yaw: 0 };
  const fwdX = dx / len, fwdZ = dz / len;
  // DayZ yaw: 0° = +Z, 90° = +X → yaw = atan2(fwdX, fwdZ)
  const yaw = Math.atan2(fwdX, fwdZ) * 180 / Math.PI;
  // right = fwd rotated 90° clockwise (facing right when looking fwd)
  const rightX = fwdZ, rightZ = -fwdX;
  return { fwdX, fwdZ, rightX, rightZ, len, yaw };
}

// ─── TRACK GENERATOR ─────────────────────────────────────────────────────────
interface TrackOpts {
  waypoints: Pt[];
  posX: number; posY: number; posZ: number;
  trackWidth: number;       // metres
  floorObj: string;         // classname for floor panels
  barrierObj: string;       // classname for barriers
  floorPitch: number;       // rotation pitch for floor (90 = lying flat)
  barrierLen: number;       // metres per barrier object
  barrierYawOffset: number; // yaw rotation correction
  addFloor: boolean;
  addBarriers: boolean;
  addText: boolean;
  textScale: number;        // pixel spacing multiplier
}

function generateTrack(opts: TrackOpts): SpawnObj[] {
  const { waypoints, posX, posY, posZ, trackWidth, floorObj, barrierObj,
    floorPitch, barrierLen, barrierYawOffset, addFloor, addBarriers, addText, textScale } = opts;
  const objs: SpawnObj[] = [];
  const n = waypoints.length;
  if (n < 2) return objs;

  // Floor tile geometry when pitch=floorPitch (90° = flat)
  // At pitch=90: 4m runs ACROSS track (perpendicular to yaw), 3m runs ALONG track
  const TILE_ALONG = 3;    // metres per tile along track
  const TILE_ACROSS = 4;   // metres per tile across track
  const N_ACROSS = Math.ceil(trackWidth / TILE_ACROSS);
  const halfW = (N_ACROSS * TILE_ACROSS) / 2;
  const BARRIER_EDGE = halfW + 0.35; // barrier centre = just outside floor edge

  for (let i = 0; i < n; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[(i + 1) % n];
    const { fwdX, fwdZ, rightX, rightZ, len, yaw } = segmentDir(p1, p2);
    if (len < 0.1) continue;

    // ── Floor tiles ──────────────────────────────────────────────────────────
    if (addFloor) {
      const nAlong = Math.ceil(len / TILE_ALONG);
      for (let a = 0; a < nAlong; a++) {
        const t = a * TILE_ALONG + TILE_ALONG / 2;
        const cx = p1.x + t * fwdX;
        const cz = p1.z + t * fwdZ;
        for (let ac = 0; ac < N_ACROSS; ac++) {
          // Tile centres: from -halfW+tileHalf to +halfW-tileHalf
          const k = -halfW + TILE_ACROSS / 2 + ac * TILE_ACROSS;
          objs.push({
            name: floorObj,
            x: posX + cx + k * rightX,
            y: posY,
            z: posZ + cz + k * rightZ,
            pitch: floorPitch, yaw, roll: 0, scale: 1,
          });
        }
      }
    }

    // ── Barriers ─────────────────────────────────────────────────────────────
    if (addBarriers) {
      // Improved chaining logic: Place barriers so they connect at segment joints without huge gaps or overshoot
      const OVERLAP = 0.45; 
      const effectiveLen = barrierLen - OVERLAP;
      const nBarriers = Math.max(1, Math.round(len / effectiveLen));
      const actualStep = len / nBarriers;

      for (let b = 0; b < nBarriers; b++) {
        const t = b * actualStep + actualStep / 2;
        const cx = p1.x + t * fwdX;
        const cz = p1.z + t * fwdZ;

        // Corrected orientation based on block type
        const correctedYaw = (yaw + barrierYawOffset) % 360;

        // Left barrier
        objs.push({
          name: barrierObj,
          x: posX + cx + BARRIER_EDGE * rightX,
          y: posY,
          z: posZ + cz + BARRIER_EDGE * rightZ,
          pitch: 0, yaw: correctedYaw, roll: 0, scale: 1,
        });
        // Right barrier
        objs.push({
          name: barrierObj,
          x: posX + cx - BARRIER_EDGE * rightX,
          y: posY,
          z: posZ + cz - BARRIER_EDGE * rightZ,
          pitch: 0, yaw: correctedYaw, roll: 0, scale: 1,
        });
      }
    }
  }

  // ── START text (at waypoint 0) & FINISH text (at midpoint waypoint) ────────
  if (addText && n >= 2) {
    const sp = textScale * PIXEL_SP;
    const sg = textScale * LETTER_GAP;
    const tileW = LETTER_W * sp + sg;

    const placeText = (text: string, origin: Pt, segIdx: number, side: 1 | -1) => {
      // side: +1 = place toward right of track, -1 = left
      // Text runs ACROSS track (perpendicular to travel direction)
      const p2 = waypoints[(segIdx + 1) % n];
      const { fwdX, fwdZ, rightX, rightZ, yaw } = segmentDir(waypoints[segIdx], p2);
      const totalW = text.length * tileW - sg;
      // Start position: centre the text across the track
      const startR = -totalW / 2; // along right direction

      for (let li = 0; li < text.length; li++) {
        const ch = text[li].toUpperCase();
        const grid = FONT[ch] ?? FONT[' '];
        const letterStartR = startR + li * tileW;
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < (grid[row]?.length ?? 0); col++) {
            if (!grid[row][col]) continue;
            // col runs across track (right direction), row runs along track (fwd direction, offset to side)
            const rOffset = letterStartR + col * sp;
            // Offset along track: 1.5m per row, placed on the side of the line
            const fOffset = side * (row * sp + 1.5);
            objs.push({
            name: "staticobj_airfield_light_papi1",
            x: posX + origin.x + rOffset * rightX + fOffset * fwdX,
            y: posY + 0.05,
            z: posZ + origin.z + rOffset * rightZ + fOffset * fwdZ,
            pitch: 0, yaw: yaw + 90, roll: 0, scale: 1,
            });
          }
        }
      }
    };

    // START at waypoint 0
    placeText("START", waypoints[0], 0, -1);
    // FINISH at the halfway waypoint
    const midIdx = Math.floor(n / 2);
    placeText("FINISH", waypoints[midIdx], midIdx, +1);
  }

  return objs;
}

// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────
function toInitC(objs: SpawnObj[], comment: string): string {
  return [
    HELPER_FUNC,
    ``,
    `// ${'='.repeat(58)}`,
    `// ${comment}`,
    `// Generated by Dank's Dayz Studio`,
    `// ${'='.repeat(58)}`,
    `// Objects: ${objs.length}`,
    ``,
    ...objs.map(o =>
      formatInitC(o.name, +o.x.toFixed(3), +o.y.toFixed(3), +o.z.toFixed(3),
        +o.pitch.toFixed(1), +o.yaw.toFixed(3), +o.roll.toFixed(1), +o.scale.toFixed(2))
    ),
  ].join("\n");
}

function toJSON(objs: SpawnObj[]): string {
  return JSON.stringify({
    Objects: objs.map(o => ({
      name: o.name,
      pos: [+o.x.toFixed(6), +o.y.toFixed(6), +o.z.toFixed(6)],
      ypr: [+o.pitch.toFixed(6), +o.yaw.toFixed(6), +o.roll.toFixed(6)],
      scale: +o.scale.toFixed(4),
      enableCEPersistency: 0,
      customString: "",
    })),
  }, null, 2);
}

// ─── HAZARD DOT CONFIG ────────────────────────────────────────────────────────
const HAZARD_STYLE: Array<{ match: (n: string) => boolean; color: string; label: string }> = [
  { match: n => n === "land_woodenpier_15m",                color: "#f39c12", label: "Ramp" },
  { match: n => n.startsWith("barrel_"),                    color: "#f1c40f", label: "Barrels" },
  { match: n => n === "staticobj_castle_wall3",             color: "#e74c3c", label: "Castle Wall (Sub)" },
  { match: n => n === "land_mil_fortified_nest_small",      color: "#c0392b", label: "Bunker" },
  { match: n => n.startsWith("Land_Wreck_"),                color: "#ecf0f1", label: "Wreck" },
  { match: n => n.startsWith("StaticObj_Airfield_"),        color: "#9b59b6", label: "Rave Light" },
];

function hazardColor(name: string): string {
  return HAZARD_STYLE.find(h => h.match(name))?.color ?? "#ffffff";
}

// ─── SVG PREVIEW ─────────────────────────────────────────────────────────────
function TrackPreview({ waypoints, trackWidth, addText, addBarriers, hazardObjects, posX, posZ }: {
  waypoints: Pt[]; trackWidth: number; addText: boolean; addBarriers: boolean;
  hazardObjects?: SpawnObj[]; posX?: number; posZ?: number;
}) {
  if (waypoints.length < 2) return null;
  const PAD = 24;
  const W = 420, H = 310;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  waypoints.forEach(p => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
  });
  const bw = trackWidth;
  minX -= bw; maxX += bw; minZ -= bw; maxZ += bw;
  const rangeX = Math.max(maxX - minX, 1);
  const rangeZ = Math.max(maxZ - minZ, 1);
  const sc = Math.min((W - PAD * 2) / rangeX, (H - PAD * 2) / rangeZ);
  const toSVG = (p: Pt) => ({
    x: PAD + (p.x - minX) * sc,
    y: PAD + (p.z - minZ) * sc,
  });

  const n = waypoints.length;
  const segments: React.ReactElement[] = [];
  for (let i = 0; i < n; i++) {
    const p1 = toSVG(waypoints[i]);
    const p2 = toSVG(waypoints[(i + 1) % n]);
    const { rightX, rightZ } = segmentDir(waypoints[i], waypoints[(i + 1) % n]);
    const hw = (trackWidth / 2) * sc;
    const brw = (trackWidth / 2 + 0.6) * sc;
    // Left edge
    segments.push(<line key={`Le${i}`}
      x1={p1.x + rightX * hw} y1={p1.y + rightZ * hw}
      x2={p2.x + rightX * hw} y2={p2.y + rightZ * hw}
      stroke="#4a3820" strokeWidth="1" />);
    // Right edge
    segments.push(<line key={`Re${i}`}
      x1={p1.x - rightX * hw} y1={p1.y - rightZ * hw}
      x2={p2.x - rightX * hw} y2={p2.y - rightZ * hw}
      stroke="#4a3820" strokeWidth="1" />);
    // Track fill
    const pts = [
      [p1.x + rightX * hw, p1.y + rightZ * hw],
      [p2.x + rightX * hw, p2.y + rightZ * hw],
      [p2.x - rightX * hw, p2.y - rightZ * hw],
      [p1.x - rightX * hw, p1.y - rightZ * hw],
    ].map(p => p.join(",")).join(" ");
    segments.push(<polygon key={`Tf${i}`} points={pts} fill="#1a1810" stroke="none" />);
    // Centerline dashes
    segments.push(<line key={`CL${i}`}
      x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
      stroke="#3a3020" strokeWidth="0.8" strokeDasharray="4,4" />);
    // Barriers
    if (addBarriers) {
      segments.push(<line key={`BrL${i}`}
        x1={p1.x + rightX * brw} y1={p1.y + rightZ * brw}
        x2={p2.x + rightX * brw} y2={p2.y + rightZ * brw}
        stroke="#e74c3c" strokeWidth="1.5" />);
      segments.push(<line key={`BrR${i}`}
        x1={p1.x - rightX * brw} y1={p1.y - rightZ * brw}
        x2={p2.x - rightX * brw} y2={p2.y - rightZ * brw}
        stroke="#e74c3c" strokeWidth="1.5" />);
    }
  }

  // Start/finish line
  const sf1 = toSVG(waypoints[0]);
  const { rightX: sfRX, rightZ: sfRZ } = segmentDir(waypoints[0], waypoints[1 % n]);
  const sfW = (trackWidth / 2) * sc;
  const midIdx = Math.floor(n / 2);
  const fm1 = toSVG(waypoints[midIdx]);
  const { rightX: fRX, rightZ: fRZ } = segmentDir(waypoints[midIdx], waypoints[(midIdx + 1) % n]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ background: "#080f09" }}>
      <rect width={W} height={H} fill="#080f09" />
      {segments}
      {/* Start line */}
      <line x1={sf1.x + sfRX * sfW} y1={sf1.y + sfRZ * sfW}
        x2={sf1.x - sfRX * sfW} y2={sf1.y - sfRZ * sfW}
        stroke="#27ae60" strokeWidth="2.5" />
      {/* Finish line */}
      <line x1={fm1.x + fRX * sfW} y1={fm1.y + fRZ * sfW}
        x2={fm1.x - fRX * sfW} y2={fm1.y - fRZ * sfW}
        stroke="#e74c3c" strokeWidth="2.5" strokeDasharray="4,2" />
      {/* Waypoints */}
      {waypoints.map((p, i) => {
        const s = toSVG(p);
        return <circle key={i} cx={s.x} cy={s.y} r={3}
          fill={i === 0 ? '#27ae60' : i === midIdx ? '#e74c3c' : '#5a4820'}
          stroke="#27ae60" strokeWidth="0.5" />;
      })}
      {addText && (
        <>
          <text x={sf1.x} y={sf1.y - 6} textAnchor="middle" fontSize="7" fill="#27ae60" fontWeight="bold">START</text>
          <text x={fm1.x} y={fm1.y - 6} textAnchor="middle" fontSize="7" fill="#e74c3c" fontWeight="bold">FINISH</text>
        </>
      )}
      {/* Death Race hazard dots */}
      {hazardObjects && hazardObjects.map((obj, i) => {
        const wx = obj.x - (posX ?? 0);
        const wz = obj.z - (posZ ?? 0);
        const sx = PAD + (wx - minX) * sc;
        const sy = PAD + (wz - minZ) * sc;
        const color = hazardColor(obj.name);
        return (
          <circle key={`hz${i}`} cx={sx} cy={sy} r={3.5}
            fill={color} fillOpacity={0.85} stroke="#000" strokeWidth="0.5">
            <title>{obj.name}</title>
          </circle>
        );
      })}
      {/* Legend */}
      <line x1={10} y1={H - 18} x2={20} y2={H - 18} stroke="#27ae60" strokeWidth="2" />
      <text x={23} y={H - 14} fontSize="7" fill="#3a6a3a">Start</text>
      <line x1={45} y1={H - 18} x2={55} y2={H - 18} stroke="#e74c3c" strokeWidth="2" strokeDasharray="3,2" />
      <text x={58} y={H - 14} fontSize="7" fill="#3a6a3a">Finish</text>
      {addBarriers && <>
        <line x1={80} y1={H - 18} x2={90} y2={H - 18} stroke="#e74c3c" strokeWidth="1.5" />
        <text x={93} y={H - 14} fontSize="7" fill="#3a6a3a">Barriers</text>
      </>}
    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const FLOOR_OBJECTS = [
  { value: "staticobj_castle_wall3",     label: "Castle Wall 8m ★ Recommended" },
  { value: "land_container_1bo",       label: "Shipping Container 6m" },
];

// yawOffset = 90: wall default spans LOCAL-X (E-W at yaw=0).
// segmentDir.yaw gives the forward heading; +90° rotates the wall to run PARALLEL to the track.
const BARRIER_OBJECTS = [
  { value: "staticobj_castle_wall3",         label: "Castle Wall 8m", len: 8, yawOffset: 90 },
  { value: "land_container_1mo",             label: "Shipping Container 6m", len: 6, yawOffset: 90 },
  { value: "land_mil_fortified_nest_small",  label: "Fortified Nest 3m", len: 3, yawOffset: 90 },
];

export default function RaceTrackMaker() {
  const [preset,      setPreset]      = useState<PresetKey>("oval");
  const [radiusX,     setRadiusX]     = useState(80);
  const [radiusZ,     setRadiusZ]     = useState(50);
  const [trackWidth,  setTrackWidth]  = useState(12);
  const [floorObj,    setFloorObj]    = useState("staticobj_castle_wall3");
  const [barrierKey,  setBarrierKey]  = useState(0);
  const [posX,        setPosX]        = useState(0);
  const [posY,        setPosY]        = useState(10);
  const [posZ,        setPosZ]        = useState(0);

  // When switching to NWAF Oval, auto-snap position to NWAF target coordinates
  const handlePresetChange = (p: PresetKey) => {
    setPreset(p);
    if (p === 'nwaf_oval') { setPosX(4413.29); setPosY(383.5); setPosZ(10323.60); }
  };
  const [addFloor,    setAddFloor]    = useState(true);
  const [addBarriers, setAddBarriers] = useState(true);
  const [addText,     setAddText]     = useState(true);
  const [textScale,   setTextScale]   = useState(1.2);
  const [format,      setFormat]      = useState<"initc"|"json">("initc");
  const [toast,       setToast]       = useState("");
  const [mobileTab,   setMobileTab]   = useState<"options"|"map"|"code">("options");
  const [pipelineCtx, setPipelineCtx] = useState<PipelineContext | null>(null);
  const [previewMode, setPreviewMode] = useState<"3D"|"2D">("3D");

  // ── Death Race state ──────────────────────────────────────────────────────
  const [deathRace,       setDeathRace]       = useState(false);
  const [drSeed,          setDrSeed]          = useState(1337);
  const [drDensity,       setDrDensity]       = useState<1|2|3>(2);
  const [drRamps,         setDrRamps]         = useState(true);
  const [drBarrels,       setDrBarrels]       = useState(true);
  const [drRoadblocks,    setDrRoadblocks]    = useState(true);
  const [drWrecks,        setDrWrecks]        = useState(true);
  const [drLights,        setDrLights]        = useState(true);

  const barrierDef = BARRIER_OBJECTS[barrierKey];

  const waypoints = useMemo(() =>
    buildPresetWaypoints(preset, radiusX, radiusZ),
  [preset, radiusX, radiusZ]);

  const trackObjects = useMemo(() => generateTrack({
    waypoints,
    posX, posY, posZ,
    trackWidth,
    floorObj,
    barrierObj: barrierDef.value,
    floorPitch: 90,
    barrierLen: barrierDef.len,
    barrierYawOffset: barrierDef.yawOffset,
    addFloor, addBarriers, addText,
    textScale: textScale,
  }), [waypoints, posX, posY, posZ, trackWidth, floorObj, barrierDef, addFloor, addBarriers, addText, textScale]);

  const deathRaceObjects = useMemo(() => {
    if (!deathRace) return [];
    return generateDeathRace({
      seed: drSeed, density: drDensity,
      waypoints, posX, posY, posZ, trackWidth,
      enableRamps: drRamps, enableBarrels: drBarrels,
      enableRoadblocks: drRoadblocks, enableWrecks: drWrecks,
      enableLights: drLights,
    });
  }, [deathRace, drSeed, drDensity, waypoints, posX, posY, posZ, trackWidth,
      drRamps, drBarrels, drRoadblocks, drWrecks, drLights]);

  // For the 3D/2D preview, coords must be relative to the track origin (posX/Y/Z = 0).
  // generateDeathRace adds posX/Y/Z to all coords; subtract them back for preview.
  const deathRaceObjectsForPreview = useMemo(
    () => deathRaceObjects.map(o => ({ ...o, x: o.x - posX, y: o.y - posY, z: o.z - posZ })),
    [deathRaceObjects, posX, posY, posZ],
  );

  const downloadOutput = () => {
    const ext = format === "json" ? "json" : "c";
    const name = pipelineCtx?.metadata.filename || `track_${radiusX}x${radiusZ}_seed${drSeed}`;
    const blob = new Blob([output], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `${name}.${ext}`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`✓ Downloaded ${objects.length} objects`);
  };

  const objects = useMemo(() => [...trackObjects, ...deathRaceObjects].slice(0, MAX_OBJECTS),
    [trackObjects, deathRaceObjects]);

  // V2 Pipeline Execution
  useMemo(() => {
    executePipeline(
      "RaceTrackMaker",
      "generic", 
      drSeed,
      { preset, radiusX, radiusZ, trackWidth, posX, posY, posZ },
      () => {
        // Combined generator for track + death race
        const trk = generateTrack({
          waypoints, posX: 0, posY: 0, posZ: 0, trackWidth, floorObj,
          barrierObj: barrierDef.value, floorPitch: 90, barrierLen: barrierDef.len,
          barrierYawOffset: barrierDef.yawOffset,
          addFloor, addBarriers, addText, textScale,
        });
        const dr = deathRace ? generateDeathRace({
          seed: drSeed, density: drDensity, waypoints, posX: 0, posY: 0, posZ: 0, trackWidth,
          enableRamps: drRamps, enableBarrels: drBarrels, enableRoadblocks: drRoadblocks,
          enableWrecks: drWrecks, enableLights: drLights,
        }) : [];
        
        return [...trk, ...dr].map(obj => ({
          x: obj.x, y: obj.y, z: obj.z,
          yaw: obj.yaw, pitch: obj.pitch, roll: obj.roll,
          name: obj.name, scale: obj.scale
        }));
      }
    ).then(setPipelineCtx).catch(console.error);
  }, [preset, radiusX, radiusZ, trackWidth, posX, posY, posZ, drSeed, waypoints, floorObj, barrierDef, addFloor, addBarriers, addText, textScale, deathRace, drDensity, drRamps, drBarrels, drRoadblocks, drWrecks, drLights]);

  const output = useMemo(() => {
    const comment = `RACE TRACK — ${PRESETS[preset].label}  ${radiusX}×${radiusZ}m  Width: ${trackWidth}m${deathRace ? "  💀 DEATH RACE" : ""}`;
    return format === "initc" ? toInitC(objects, comment) : toJSON(objects);
  }, [objects, format, preset, radiusX, radiusZ, trackWidth, deathRace]);

  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(""), 2200);
  }, []);

  const copy = () => navigator.clipboard.writeText(output).then(() => showToast("✓ Copied!"));
  const download = () => {
    const ext = format === "json" ? "json" : "c";
    const blob = new Blob([output], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `racetrack_${preset}_${radiusX}x${radiusZ}.${ext}`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast(`✓ Downloaded ${objects.length} objects`);
  };

  const Slider = ({ label, value, onChange, min, max, step, unit = "", badge }: {
    label: string; value: number; onChange: (v: number) => void;
    min: number; max: number; step: number; unit?: string; badge?: string;
  }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[#5a8a5a] text-[10px]">{label}</span>
        <div className="flex items-center gap-1">
          {badge && <span className="bg-[#1a2e1a] text-[#3a6a3a] text-[8px] px-1.5 py-0.5 rounded-sm">{badge}</span>}
          <span className="text-[#27ae60] text-[10px] font-bold">{value}{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 bg-[#1a2e1a] rounded-full appearance-none cursor-pointer accent-[#27ae60]" />
    </div>
  );

  const objectCounts = useMemo(() => {
    const floor    = trackObjects.filter(o => o.name === floorObj).length;
    const barriers = trackObjects.filter(o => o.name === barrierDef.value).length;
    const lights   = trackObjects.filter(o => o.name === "StaticObj_Airfield_Light_PAPI1").length;
    const hazards  = deathRaceObjects.length;
    return { floor, barriers, lights, hazards, total: objects.length };
  }, [trackObjects, deathRaceObjects, objects, floorObj, barrierDef.value]);

  return (
    <div className="flex flex-1 overflow-hidden bg-[#080f09] relative">

      {/* Toast */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#27ae60] text-white text-[11px] font-bold px-4 py-2 rounded-sm shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      {/* Mobile tabs */}
      <div className="md:hidden absolute top-0 left-0 right-0 flex border-b border-[#1a2e1a] bg-[#0a1209] z-10">
        {(["options","map","code"] as const).map(t => (
          <button key={t} onClick={() => setMobileTab(t)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${mobileTab === t ? "text-[#e74c3c] border-b-2 border-[#e74c3c]" : "text-[#3a6a3a]"}`}>
            {t === "options" ? "⚙ Options" : t === "map" ? "🗺 Map" : "📋 Code"}
          </button>
        ))}
      </div>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────────── */}
      <div className={`${mobileTab !== "options" ? "hidden md:flex" : "flex"} w-full md:w-72 shrink-0 bg-[#0a1209] border-r border-[#1a2e1a] overflow-y-auto flex-col md:mt-0 mt-9`}>
        <div className="px-3 py-3 border-b border-[#1a2e1a] shrink-0">
          <div className="text-[9px] text-[#3a6a3a] font-bold tracking-widest">DANK'S DAYZ STUDIO</div>
          <div className="text-[#e74c3c] font-bold text-[13px]">🏁 RACE TRACK MAKER</div>
          <div className="text-[#3a6a3a] text-[9px] mt-0.5">Floating track · walls as floor · barriers on sides · START/FINISH lights</div>
          {objects.length >= MAX_OBJECTS && (
            <div className="text-[#e74c3c] text-[10px] font-bold animate-pulse mt-0.5">⚠ LIMIT REACHED (1200)</div>
          )}
        </div>

        <div className="p-3 space-y-4 overflow-y-auto">

          {/* Preset shape */}
          <div>
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">🔁 Track Shape</div>
            <div className="grid grid-cols-2 gap-1">
              {(Object.entries(PRESETS) as [PresetKey, typeof PRESETS[PresetKey]][]).map(([k, p]) => (
                <button key={k} onClick={() => setPreset(k)}
                  className={`text-left px-2 py-1.5 rounded-sm border transition-all ${preset === k ? "bg-[#e74c3c]/20 border-[#e74c3c] text-[#e74c3c]" : "border-[#1a2e1a] text-[#b09a6a] hover:border-[#6a5820]"}`}>
                  <div className="text-[10px] font-bold">{p.icon} {p.label}</div>
                  <div className="text-[7.5px] opacity-60 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">📐 Track Dimensions</div>
            <Slider label="Radius X (East-West)" value={radiusX} onChange={setRadiusX}
              min={20} max={300} step={5} unit="m"
              badge={`${(radiusX * 2).toFixed(0)}m span`} />
            <Slider label="Radius Z (North-South)" value={radiusZ} onChange={setRadiusZ}
              min={20} max={300} step={5} unit="m"
              badge={`${(radiusZ * 2).toFixed(0)}m span`} />
            <Slider label="Track Width" value={trackWidth} onChange={setTrackWidth}
              min={8} max={24} step={4} unit="m"
              badge={`${Math.ceil(trackWidth / 4)} floor tiles wide`} />
          </div>

          {/* Options toggles */}
          <div>
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">⚙ Components</div>
            {[
              { label: "🏗 Floor Panels (walls rotated flat)", val: addFloor, set: setAddFloor,
                note: "Concrete walls placed with pitch=90° to create driveable surface" },
              { label: "🚧 Side Barriers", val: addBarriers, set: setAddBarriers,
                note: "Jersey barriers on both sides of the track to keep cars in" },
              { label: "💡 START / FINISH lights", val: addText, set: setAddText,
                note: "Airfield PAPI lights spell START & FINISH at start/finish lines" },
            ].map(opt => (
              <div key={opt.label} className="mb-2">
                <button onClick={() => opt.set(!opt.val)}
                  className={`flex items-center gap-2 w-full text-left text-[10px] py-1 transition-all ${opt.val ? "text-[#e74c3c]" : "text-[#3a6a3a]"}`}>
                  <span className={`w-3 h-3 border rounded-sm flex items-center justify-center shrink-0 ${opt.val ? "border-[#e74c3c] bg-[#e74c3c]/30" : "border-[#3a3020]"}`}>
                    {opt.val && <span className="text-[8px] text-[#e74c3c]">✓</span>}
                  </span>
                  <span className="font-bold">{opt.label}</span>
                </button>
                <div className="text-[7px] text-[#4a3820] ml-5 leading-relaxed">{opt.note}</div>
              </div>
            ))}
          </div>

          {/* Floor object */}
          {addFloor && (
            <div>
              <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">🏗 Floor Object</div>
              <select value={floorObj} onChange={e => setFloorObj(e.target.value)}
                className="w-full bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[#e74c3c] mb-1">
                {FLOOR_OBJECTS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <div className="text-[7.5px] text-[#4a3820] font-mono">{floorObj}</div>
              <div className="text-[7px] text-[#5a4820] mt-0.5 leading-relaxed">
                Placed with pitch=90° — wall lies flat as a driving surface. Each panel is 4m across × 3m long.
              </div>
            </div>
          )}

          {/* Barrier object */}
          {addBarriers && (
            <div>
              <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">🚧 Barrier Object</div>
              <select value={barrierKey} onChange={e => setBarrierKey(Number(e.target.value))}
                className="w-full bg-[#1a1610] border border-[#1a2e1a] text-[#b8d4b8] text-[10px] px-2 py-1.5 rounded-sm focus:outline-none focus:border-[#e74c3c] mb-1">
                {BARRIER_OBJECTS.map((b, i) => (
                  <option key={b.value} value={i}>{b.label}</option>
                ))}
              </select>
              <div className="text-[7.5px] text-[#4a3820] font-mono">{barrierDef.value}</div>
            </div>
          )}

          {/* Text scale */}
          {addText && (
            <div>
              <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">💡 Light Text Scale</div>
              <Slider label="Pixel Spacing" value={textScale} onChange={setTextScale}
                min={0.6} max={2.5} step={0.1} unit="×" badge={`${(PIXEL_SP * textScale).toFixed(1)}m/pixel`} />
              <div className="text-[7px] text-[#5a4820] leading-relaxed">
                Larger scale = bigger letters. "START" is 5 letters × 3 pixels wide.
              </div>
            </div>
          )}

          {/* World position */}
          <div>
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">📍 World Origin</div>
            <div className="text-[7px] text-[#5a4820] mb-1.5 leading-relaxed">
              Set Y to the height you want the track to float at. Track tiles extend horizontally at this height.
            </div>
            {([["X", posX, setPosX], ["Y (float height)", posY, setPosY], ["Z", posZ, setPosZ]] as [string, number, (v: number) => void][]).map(([lbl, val, set]) => (
              <div key={lbl} className="flex items-center gap-2 mb-1">
                <span className="text-[8px] text-[#8a7840] w-16 shrink-0 truncate">{lbl}</span>
                <input type="number" step="0.5" value={val} onChange={e => set(Number(e.target.value))}
                  className="flex-1 bg-[#0c1510] border border-[#1a2e1a] rounded-sm px-2 py-0.5 text-[10px] text-[#b8d4b8] focus:outline-none focus:border-[#e74c3c] min-w-0" />
              </div>
            ))}
          </div>

          {/* Format */}
          <div>
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">📄 Export Format</div>
            <div className="flex gap-1">
              {(["initc", "json"] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-sm border transition-colors ${format === f ? "bg-[#e74c3c] text-white border-[#e74c3c]" : "border-[#1a2e1a] text-[#3a6a3a] hover:border-[#e74c3c] hover:text-[#e74c3c]"}`}>
                  {f === "initc" ? "init.c" : "JSON"}
                </button>
              ))}
            </div>
          </div>

          {/* ── DEATH RACE MODE ─────────────────────────────────────────── */}
          <div className={`border rounded-sm p-2 ${deathRace ? "border-[#e74c3c] bg-[#1a0808]" : "border-[#1a2e1a] bg-[#0a1209]"}`}>
            <button onClick={() => setDeathRace(v => !v)}
              className="flex items-center gap-2 w-full text-left">
              <span className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center shrink-0 transition-all ${deathRace ? "border-[#e74c3c] bg-[#e74c3c]/30" : "border-[#3a3020]"}`}>
                {deathRace && <span className="text-[9px] text-[#e74c3c] font-black">✓</span>}
              </span>
              <span className={`font-black text-[11px] tracking-wider ${deathRace ? "text-[#e74c3c]" : "text-[#3a6a3a]"}`}>
                💀 DEATH RACE MODE
              </span>
            </button>
            <div className="text-[7px] text-[#5a4820] ml-6 mt-0.5 leading-relaxed">
              Scatter ramps, barrel walls, roadblocks, wrecks and rave lights on the track
            </div>

            {deathRace && (
              <div className="mt-3 space-y-3">
                {/* Seed */}
                <div>
                  <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1">🎲 Seed</div>
                  <div className="flex gap-1">
                    <input type="number" value={drSeed} onChange={e => setDrSeed(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 bg-[#0c1510] border border-[#3a2018] rounded-sm px-2 py-1 text-[10px] text-[#b8d4b8] focus:outline-none focus:border-[#e74c3c] min-w-0" />
                    <button onClick={() => setDrSeed(Math.floor(Math.random() * 99999) + 1)}
                      className="px-2 py-1 bg-[#2a1208] border border-[#5a2a18] text-[#e74c3c] text-[11px] rounded-sm hover:bg-[#3a1a0a] transition-all"
                      title="Roll random seed">🎲</button>
                  </div>
                  <div className="text-[7px] text-[#4a3820] mt-0.5">Same seed = same hazard layout</div>
                </div>

                {/* Density */}
                <div>
                  <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1">💥 Hazard Density</div>
                  <div className="flex gap-1">
                    {([1, 2, 3] as const).map(d => (
                      <button key={d} onClick={() => setDrDensity(d)}
                        className={`flex-1 py-1.5 text-[10px] font-bold border rounded-sm transition-all ${drDensity === d ? "bg-[#e74c3c] text-white border-[#e74c3c]" : "text-[#3a6a3a] border-[#1a2e1a] hover:border-[#e74c3c]"}`}>
                        {d === 1 ? "Light" : d === 2 ? "Medium" : "CHAOS"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hazard toggles */}
                <div>
                  <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-1.5">☑ Hazard Types</div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: "🏗 Ramps",        val: drRamps,      set: setDrRamps,      note: "Angled jump ramps" },
                      { label: "🛢 Barrel Walls",  val: drBarrels,    set: setDrBarrels,    note: "Drive-through stacks" },
                      { label: "🚧 Roadblocks",    val: drRoadblocks, set: setDrRoadblocks, note: "Barriers + tank traps" },
                      { label: "🚗 Wrecks",        val: drWrecks,     set: setDrWrecks,     note: "Abandoned vehicles" },
                      { label: "💡 Rave Lights",   val: drLights,     set: setDrLights,     note: "PAPI + strobes" },
                    ].map(opt => (
                      <button key={opt.label} onClick={() => opt.set(v => !v)}
                        title={opt.note}
                        className={`flex items-center gap-1.5 px-2 py-1.5 text-left text-[9px] border rounded-sm transition-all ${opt.val ? "border-[#e74c3c]/60 text-[#e74c3c] bg-[#e74c3c]/10" : "border-[#1a2e1a] text-[#5a4a2a] hover:border-[#4a2a1a]"}`}>
                        <span className={`w-2.5 h-2.5 border rounded-sm flex items-center justify-center shrink-0 ${opt.val ? "border-[#e74c3c] bg-[#e74c3c]/40" : "border-[#3a3020]"}`}>
                          {opt.val && <span className="text-[7px] leading-none">✓</span>}
                        </span>
                        <span className="font-bold leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hazard count */}
                <div className="flex justify-between text-[9px] border-t border-[#3a1a0a] pt-2">
                  <span className="text-[#3a6a3a]">💀 Hazard objects</span>
                  <span className="text-[#e74c3c] font-bold">{objectCounts.hazards}</span>
                </div>
              </div>
            )}
          </div>

          {/* Object count summary */}
          <div className="border border-[#1a2e1a] rounded-sm p-2 bg-[#0a1209]">
            <div className="text-[#5a8a5a] text-[9px] uppercase tracking-wider mb-2">📊 Object Count</div>
            <div className="space-y-1">
              {addFloor && <div className="flex justify-between text-[9px]">
                <span className="text-[#3a6a3a]">🏗 Floor panels</span>
                <span className="text-[#27ae60] font-bold">{objectCounts.floor}</span>
              </div>}
              {addBarriers && <div className="flex justify-between text-[9px]">
                <span className="text-[#3a6a3a]">🚧 Barriers</span>
                <span className="text-[#e74c3c] font-bold">{objectCounts.barriers}</span>
              </div>}
              {addText && <div className="flex justify-between text-[9px]">
                <span className="text-[#3a6a3a]">💡 PAPI lights</span>
                <span className="text-[#3498db] font-bold">{objectCounts.lights}</span>
              </div>}
              {deathRace && <div className="flex justify-between text-[9px]">
                <span className="text-[#e74c3c]">💀 Death Race hazards</span>
                <span className="text-[#e74c3c] font-bold">{objectCounts.hazards}</span>
              </div>}
              <div className="border-t border-[#1a2e1a] pt-1 flex justify-between text-[10px]">
                <span className="text-[#5a8a5a]">Total</span>
                <span className={`font-bold ${objectCounts.total > 1500 ? "text-[#e67e22]" : "text-[#27ae60]"}`}>
                  {objectCounts.total}
                </span>
              </div>
              {objectCounts.total > 1500 && (
                <div className="text-[7.5px] text-[#e67e22] leading-relaxed">
                  ⚠ Large track — may approach spawn limits. Consider reducing size or disabling floor panels.
                </div>
              )}
            </div>
            <div className="text-[7px] text-[#4a3820] mt-2 leading-relaxed">
              Tip: Align Y to terrain then tune down ~0.5m so tiles sit flat. Jersey barriers auto-align to terrain in DayZ.
            </div>
          </div>
        </div>
      </div>

      {/* ── CENTER: 3D / 2D PREVIEW ──────────────────────────────────────────── */}
      <div className={`${mobileTab !== "map" ? "hidden md:flex" : "flex"} flex-col flex-1 min-w-0 overflow-hidden border-r border-[#1a2e1a] md:mt-0 mt-9`}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1a2e1a] shrink-0">
          <span className="text-[#5a8a5a] text-[10px] uppercase tracking-wider">Preview</span>
          <span className="text-[#4a3a1a] text-[9px]">— {PRESETS[preset].label} · {radiusX}×{radiusZ}m · {trackWidth}m wide</span>
          <div className="ml-auto flex gap-1">
            {(["3D","2D"] as const).map(v => (
              <button key={v} onClick={() => setPreviewMode(v)}
                className={`px-2 py-0.5 text-[8px] font-bold border rounded-sm transition-all ${previewMode === v ? "bg-[#27ae60] text-[#080f09] border-[#27ae60]" : "text-[#3a6a3a] border-[#1a2e1a] hover:border-[#4a3820]"}`}>
                {v}
              </button>
            ))}
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${objectCounts.total > 1500 ? "bg-[#e67e22]/20 text-[#e67e22]" : "bg-[#27ae60]/20 text-[#27ae60]"}`}>
            {objectCounts.total} objects
          </span>
          <button onClick={download}
            className="ml-auto px-3 py-1 text-[9px] font-bold bg-[#c0392b] text-white rounded-sm hover:bg-[#e74c3c] transition-all shrink-0">
            ⬇ {format === "initc" ? "init.c" : "JSON"}
          </button>
        </div>
        <div className="flex-1 min-h-0 relative">
          {previewMode === "3D" ? (
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-[#080c14]">
                <span className="text-[#4a3820] text-[11px] tracking-widest animate-pulse">LOADING 3D...</span>
              </div>
            }>
              <TrackPreview3D
                waypoints={waypoints}
                trackWidth={trackWidth}
                addText={addText}
                addBarriers={addBarriers}
                barrierLen={barrierDef.len}
                hazardObjects={deathRace ? deathRaceObjectsForPreview : []}
                posX={posX}
                posZ={posZ}
              />
            </Suspense>
          ) : (
            <div className="w-full h-full bg-[#060402] overflow-auto">
              <TrackPreview
                waypoints={waypoints}
                trackWidth={trackWidth}
                addText={addText}
                addBarriers={addBarriers}
                hazardObjects={deathRace ? deathRaceObjectsForPreview : []}
                posX={posX}
                posZ={posZ}
              />
            </div>
          )}
          {/* Interaction hint overlay */}
          {previewMode === "3D" && (
            <div className="absolute bottom-2 right-2 pointer-events-none">
              <div className="text-[7.5px] text-[#3a3020] bg-[#080f09]/80 px-2 py-1 rounded-sm backdrop-blur-sm border border-[#1a2e1a]">
                Drag to orbit · Scroll to zoom · Right-drag to pan
              </div>
            </div>
          )}
        </div>
        {/* Death Race hazard legend */}
        {deathRace && deathRaceObjects.length > 0 && (
          <div className="shrink-0 border-t border-[#3a1a0a] bg-[#0e0804] px-3 py-1.5">
            <div className="text-[7.5px] text-[#9a5a3a] uppercase tracking-wider mb-1 font-bold">💀 Death Race Hazards</div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {HAZARD_STYLE.map(h => {
                const count = deathRaceObjects.filter(o => h.match(o.name)).length;
                if (count === 0) return null;
                return (
                  <span key={h.label} className="flex items-center gap-1 text-[7.5px]">
                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: h.color }} />
                    <span style={{ color: h.color }}>{h.label}</span>
                    <span className="text-[#4a3820]">×{count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {/* Legend strip */}
        <div className="shrink-0 border-t border-[#1a2e1a] bg-[#0a1209] px-3 py-2">
          <div className="text-[8px] text-[#3a6a3a] leading-relaxed flex flex-wrap gap-x-3 gap-y-0.5">
            <span><span className="text-[#27ae60] font-bold">━</span> Start line (green gantry)</span>
            <span><span className="text-[#e74c3c] font-bold">━</span> Finish line (checker)</span>
            <span><span className="text-[#c0bab2] font-bold">█</span> Jersey barriers</span>
            <span><span className="text-[#787878] font-bold">█</span> Concrete floor tiles</span>
          </div>
          <div className="text-[7.5px] text-[#4a3820] mt-1">
            Floor: {Math.ceil(trackWidth/4)} rows of {floorObj} laid flat (pitch=90°).
            Barriers: {barrierDef.label}, {barrierDef.len}m per block, each side.
          </div>
        </div>
      </div>

      {/* ── RIGHT: CODE OUTPUT ────────────────────────────────────────────────── */}
      <div className={`${mobileTab !== "code" ? "hidden md:flex" : "flex"} flex-col w-full md:w-[420px] shrink-0 min-h-0 md:mt-0 mt-9`}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1a2e1a] shrink-0 flex-wrap">
          {(["initc", "json"] as const).map(f => (
            <button key={f} onClick={() => setFormat(f)}
              className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-colors ${format === f ? "bg-[#e74c3c] text-white" : "text-[#3a6a3a] border border-[#1a2e1a] hover:border-[#e74c3c]"}`}>
              {f === "initc" ? "init.c" : "JSON"}
            </button>
          ))}
          <span className="text-[#5a4a2a] text-[10px]">{objectCounts.total} objects</span>
          <div className="ml-auto flex gap-1.5">
            <button onClick={copy}
              className="px-3 py-1 bg-[#1a1610] border border-[#1a2e1a] text-[#b09a6a] text-[10px] rounded-sm hover:border-[#e74c3c] hover:text-[#e74c3c] transition-colors">
              Copy
            </button>
            <button onClick={download}
              className="px-3 py-1 bg-[#e74c3c] text-white text-[10px] font-bold rounded-sm hover:bg-[#c0392b] transition-colors">
              Download
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto p-3 text-[10px] leading-relaxed font-mono text-[#7a9a5a] whitespace-pre-wrap min-h-0">
          {output.slice(0, 12000)}{output.length > 12000 ? `\n\n// ... ${output.length - 12000} more characters — Download for full output` : ""}
        </pre>
      </div>

    </div>
  );
}
