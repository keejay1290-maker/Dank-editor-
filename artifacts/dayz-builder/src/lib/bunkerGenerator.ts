
// ─── Dank's Dayz Studio — Bunker Maker Random Generator ─────────────────────

import {
  PlacedObject, BunkerStyle, BunkerSize,
  STYLES, SIZES, DECOR_PROPS, WRECK_PROPS,
  PIECE_ENTRANCE_MAIN, PIECE_ENTRANCE_SMALL,
  PIECE_TUNNEL_SINGLE, PIECE_TUNNEL_LEFT, PIECE_TUNNEL_RIGHT,
  PIECE_CORRIDOR_BOTH, PIECE_CORRIDOR_LEFT, PIECE_CORRIDOR_RIGHT,
  PIECE_CONNECTOR,
  PIECE_STAIRS_START, PIECE_STAIRS_BLOCK, PIECE_STAIRS_TERMINATOR, PIECE_STAIRS_EXIT,
  PIECE_STAIRS_COLLAPSED,
  PIECE_FLOOR_CREW, PIECE_FLOOR_COMMS,
  PIECE_PANEL, PIECE_PANEL_EXTERIOR, PIECE_PANEL_INTERIOR, PIECE_PANEL_FALLBACK,
  PIECE_GATE_L, PIECE_GATE_R,
  PIECE_HBARRIER_5, PIECE_HBARRIER_10, PIECE_HBARRIER_CORNER,
  PIECE_WALL_CASTLE_3, PIECE_WALL_CASTLE_6,
  PIECE_WALL_CONCRETE_4, PIECE_WALL_CONCRETE_8,
  PIECE_SANDBAG_WALL,
  DecorProp,
} from './bunkerData';

// ─── Seeded RNG (Mulberry32) ─────────────────────────────────────────────────

function mkRng(seed: number) {
  let s = seed >>> 0;
  return {
    next(): number {
      s += 0x6D2B79F5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)];
    },
    bool(prob = 0.5): boolean {
      return this.next() < prob;
    },
    weightedPick<T extends { weight: number }>(arr: T[]): T {
      const total = arr.reduce((s, x) => s + x.weight, 0);
      let r = this.next() * total;
      for (const item of arr) {
        r -= item.weight;
        if (r <= 0) return item;
      }
      return arr[arr.length - 1];
    },
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

// Spacing between tunnel segment centres (~9m based on in-game measurements)
const CELL_LEN   = 9.0;
// Lateral offset from spine axis to branch tunnel centre
const BRANCH_OFF = 11.0;
// Total lateral offset from spine to room centre
const ROOM_OFF   = 22.0;

// Y depth per underground level (metres below surface)
const LEVEL_DEPTH: Record<number, number> = {
  0: 0,
  1: -5,
  2: -11,
  3: -18,
};

// Stair block height (~4m per block, stacked from top down)
const STAIR_BLOCK_H = 4.0;

// ─── Generator Options ───────────────────────────────────────────────────────

export interface BunkerOptions {
  seed: number;
  levels: 1 | 2 | 3;
  size: BunkerSize;
  style: BunkerStyle;
  spineAxis: 'NS' | 'EW';
  encaseExterior: boolean;
  includeConvoy: boolean;
  includeDecor: boolean;
  decorDensity: 'sparse' | 'normal' | 'heavy';
  includeFloors: boolean;
  useSakhalPanels: boolean;
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function rotateXZ(dx: number, dz: number, yawDeg: number): [number, number] {
  const r = (yawDeg * Math.PI) / 180;
  return [
    dx * Math.cos(r) - dz * Math.sin(r),
    dx * Math.sin(r) + dz * Math.cos(r),
  ];
}

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface BunkerLayout {
  objects: PlacedObject[];
  stats: {
    totalObjects: number;
    levels: number;
    rooms: number;
    tunnelSegments: number;
    decorObjects: number;
    footprintRadius: number;
  };
  seed: number;
}

// ─── Main Generator ──────────────────────────────────────────────────────────

export function generateBunker(opts: BunkerOptions): BunkerLayout {
  const rng = mkRng(opts.seed);
  const objects: PlacedObject[] = [];
  const style = STYLES[opts.style];
  const size  = SIZES[opts.size];

  let rooms = 0;
  let tunnelCount = 0;
  let decorCount = 0;

  const baseYaw = opts.spineAxis === 'NS' ? 0 : 90;

  // Helper: place an object with auto yaw rotation based on spine axis
  function place(
    classname: string,
    note: string,
    rawDx: number,
    dy: number,
    rawDz: number,
    yaw: number,
    level: number,
    section: PlacedObject['section'],
    pitch = 0,
    roll = 0,
  ): void {
    const [dx, dz] = rotateXZ(rawDx, rawDz, baseYaw);
    objects.push({ classname, note, dx, dy, dz, yaw: (yaw + baseYaw) % 360, pitch, roll, level, section });
  }

  // ── Per-level spine lengths ─────────────────────────────────────────────────
  const spineLengths: number[] = [];
  for (let lv = 0; lv < opts.levels; lv++) {
    const base = lv === 0 ? size.spineMin : Math.max(2, size.spineMin - lv);
    const max  = lv === 0 ? size.spineMax : Math.max(2, size.spineMax - lv);
    spineLengths.push(rng.int(base, max));
  }

  // ── Stairwell spine positions ───────────────────────────────────────────────
  const stairPositions: number[] = [];
  for (let lv = 0; lv < opts.levels - 1; lv++) {
    stairPositions.push(rng.int(1, spineLengths[lv] - 1));
  }

  // EXIT position — immediately after the last level-1 spine segment
  const exitSpinePos = spineLengths[0];

  // ─────────────────────────────────────────────────────────────────────────────
  // SURFACE LEVEL — Entrance & Exit
  // ─────────────────────────────────────────────────────────────────────────────

  // Main entrance
  place(PIECE_ENTRANCE_MAIN.classname, 'Main Entrance', 0, 0, -CELL_LEN, 0, 0, 'entrance');

  // Entry panel beside entrance
  if (opts.useSakhalPanels) {
    place(PIECE_PANEL_EXTERIOR.classname, 'Entry Keypad Panel (Sakhal)', 4.5, 0.5, -CELL_LEN + 1, 90, 0, 'panel');
  } else {
    place(PIECE_PANEL_FALLBACK.classname, 'Entry Panel', 4.5, 0.5, -CELL_LEN + 1, 90, 0, 'panel');
  }

  // Gate pieces at entrance
  if (rng.bool(0.7)) {
    place(PIECE_GATE_L.classname, 'Entrance Gate Left', -2, 0, -CELL_LEN + 5.5, 0, 0, 'entrance');
    place(PIECE_GATE_R.classname, 'Entrance Gate Right', 2, 0, -CELL_LEN + 5.5, 0, 0, 'entrance');
  }

  // Emergency exit — surface hatch aligned with exit stairwell centre
  const exitZ = exitSpinePos * CELL_LEN + CELL_LEN * 0.5;
  place(PIECE_ENTRANCE_SMALL.classname, 'Emergency Exit', 0, 0, exitZ, 180, 0, 'exit');

  // Interior exit panel (underground, beside exit stairwell)
  if (opts.useSakhalPanels) {
    place(PIECE_PANEL_INTERIOR.classname, 'Interior Exit Panel (Sakhal)', 4, LEVEL_DEPTH[1] + 0.5, exitZ - CELL_LEN * 0.4, 270, 1, 'panel');
  } else {
    place(PIECE_PANEL.classname, 'Interior Exit Panel', 4, LEVEL_DEPTH[1] + 0.5, exitZ - CELL_LEN * 0.4, 270, 1, 'panel');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UNDERGROUND LEVELS
  // ─────────────────────────────────────────────────────────────────────────────

  for (let lv = 1; lv <= opts.levels; lv++) {
    const spineLen = spineLengths[lv - 1];
    const dy       = LEVEL_DEPTH[lv];
    const stairPos = stairPositions[lv - 1];

    // ── Spine tunnel corridor ─────────────────────────────────────────────────
    // Determine which segments are branch points
    const branchSegs = new Set<number>();
    const numBranches = rng.int(size.branchMin, size.branchMax);
    const usedSegs = new Set<number>();
    for (let b = 0; b < numBranches; b++) {
      let branchSeg: number;
      let attempts = 0;
      do {
        branchSeg = rng.int(1, spineLen - 2);
        attempts++;
      } while (usedSegs.has(branchSeg) && attempts < 20);
      usedSegs.add(branchSeg);
      branchSegs.add(branchSeg);
    }

    for (let seg = 0; seg < spineLen; seg++) {
      const dz = seg * CELL_LEN + CELL_LEN * 0.5;
      if (branchSegs.has(seg)) {
        // Use a junction piece at branch points
        const side = [...branchSegs].indexOf(seg) % 2;
        const junctionPiece = side === 0 ? style.tunnelBranch : PIECE_CORRIDOR_RIGHT;
        place(junctionPiece.classname, `L${lv} Junction Seg${seg + 1}`, 0, dy, dz, 0, lv, 'tunnel');
      } else {
        place(style.tunnelStraight.classname, `L${lv} Tunnel Seg${seg + 1}`, 0, dy, dz, 0, lv, 'tunnel');
      }
      tunnelCount++;

      // Floor slabs
      if (opts.includeFloors && seg % 2 === 0) {
        const floorPiece = rng.bool(0.5) ? PIECE_FLOOR_CREW : PIECE_FLOOR_COMMS;
        place(floorPiece.classname, `L${lv} Floor`, 0, dy - 0.15, dz, 0, lv, 'tunnel');
      }
    }

    // Connector at entrance to tunnel level
    place(PIECE_CONNECTOR.classname, `L${lv} Entry Connector`, 0, dy, 0, 0, lv, 'tunnel');

    // ── Stairwell down to next level ──────────────────────────────────────────
    if (lv < opts.levels && stairPos !== undefined) {
      const sdz = stairPos * CELL_LEN + CELL_LEN * 0.5;
      const sdx = rng.bool() ? BRANCH_OFF * 0.6 : -(BRANCH_OFF * 0.6);
      const nextDy = LEVEL_DEPTH[lv + 1];
      const depthDiff = Math.abs(nextDy - dy);
      const numBlocks = Math.ceil(depthDiff / STAIR_BLOCK_H);

      // Top stair — placed at current level floor
      place(PIECE_STAIRS_START.classname, `L${lv} to L${lv + 1} Stairs Top`, sdx, dy, sdz, sdx > 0 ? 270 : 90, lv, 'stair');
      // Mid blocks — evenly interpolated between dy and nextDy
      for (let f = 1; f < numBlocks; f++) {
        const t = f / numBlocks;
        const stairY = dy + (nextDy - dy) * t;
        place(PIECE_STAIRS_BLOCK.classname, `L${lv} to L${lv + 1} Stairs Block ${f}`, sdx, stairY, sdz, sdx > 0 ? 270 : 90, lv, 'stair');
      }
      // Bottom terminator — placed at next level floor
      place(PIECE_STAIRS_TERMINATOR.classname, `L${lv} to L${lv + 1} Stairs Bottom`, sdx, nextDy, sdz, sdx > 0 ? 270 : 90, lv + 1, 'stair');

      // Connector linking stairwell base to next level spine
      place(PIECE_CONNECTOR.classname, `L${lv + 1} Stair Connector`, sdx > 0 ? BRANCH_OFF * 0.3 : -BRANCH_OFF * 0.3, nextDy, sdz, sdx > 0 ? 270 : 90, lv + 1, 'stair');
    }

    // ── Exit stairwell (Level 1 to surface exit) ──────────────────────────────
    if (lv === 1) {
      // Connecting tunnel piece — bridges the gap from spine end to exit stairwell
      place(style.tunnelStraight.classname, 'Exit Approach Tunnel', 0, dy, exitZ, 0, lv, 'tunnel');
      tunnelCount++;
      // Stair blocks rising from underground to surface — evenly spaced between dy and 0
      const numExitBlocks = Math.ceil(Math.abs(dy) / STAIR_BLOCK_H);
      for (let f = 0; f < numExitBlocks; f++) {
        const t = (f + 1) / (numExitBlocks + 1);
        const stairY = dy + (0 - dy) * t;
        place(PIECE_STAIRS_BLOCK.classname, `Exit Stair Block ${f + 1}`, 0, stairY, exitZ, 0, lv, 'stair');
      }
      place(PIECE_STAIRS_EXIT.classname, 'Exit Stair Top', 0, 0, exitZ, 0, 0, 'exit');
    }

    // ── Branch rooms off the spine ────────────────────────────────────────────
    let branchIdx = 0;
    for (const branchSeg of branchSegs) {
      const branchZ = branchSeg * CELL_LEN + CELL_LEN * 0.5;
      const side = branchIdx % 2 === 0 ? 1 : -1;
      branchIdx++;

      // Tunnel leading to room (perpendicular to spine)
      // Each tunnel piece is 9m long (d=9), centred at bx, running along X at yaw=90°
      const branchLen = rng.int(1, 2);
      const tunnelHalfD = PIECE_TUNNEL_SINGLE.d * 0.5; // 4.5m
      for (let bc = 0; bc < branchLen; bc++) {
        const bx = side * (tunnelHalfD + bc * PIECE_TUNNEL_SINGLE.d);
        place(PIECE_TUNNEL_SINGLE.classname, `L${lv} Branch${branchIdx} Seg${bc + 1}`, bx, dy, branchZ, side > 0 ? 90 : 270, lv, 'branch');
        tunnelCount++;
      }

      // Room placed immediately after the last tunnel piece's far edge
      const lastTunnelFarEdge = tunnelHalfD + branchLen * PIECE_TUNNEL_SINGLE.d;
      const roomX = side * (lastTunnelFarEdge + 1.5);
      const roomDef = rng.bool(0.4) ? style.primaryRoom : style.altRoom;
      const roomYaw = rng.bool(0.5) ? 0 : 90;
      place(roomDef.classname, `L${lv} Room ${branchIdx} (${roomDef.label})`, roomX, dy, branchZ, roomYaw, lv, 'room');
      rooms++;

      // Decorate inside room
      if (opts.includeDecor) {
        const numDecor = rng.int(
          opts.decorDensity === 'sparse' ? 2 : opts.decorDensity === 'normal' ? 3 : 5,
          opts.decorDensity === 'sparse' ? 4 : opts.decorDensity === 'normal' ? 7 : 12,
        );
        const biasedDecor = DECOR_PROPS.filter(d => style.decorBias.includes(d.category));
        const decorPool = biasedDecor.length >= 3 ? biasedDecor : DECOR_PROPS;

        for (let i = 0; i < numDecor; i++) {
          const prop = rng.weightedPick(decorPool);
          const ox = roomX + rng.next() * 6 - 3;
          const oz = branchZ + rng.next() * 6 - 3;
          const oy = opts.decorDensity === 'heavy' && i >= numDecor - 2 ? dy + 0.8 : dy;
          place(prop.classname, `Decor: ${prop.label}`, ox, oy, oz, rng.int(0, 3) * 90, lv, 'decor');
          decorCount++;
        }

        if (rng.bool(0.5)) {
          const pile = rng.bool()
            ? DECOR_PROPS.find(d => d.classname === 'GarbageContainer_Yellow_DE')!
            : DECOR_PROPS.find(d => d.classname === 'Barrel_Blue')!;
          for (let g = 0; g < rng.int(2, 4); g++) {
            place(pile.classname, 'Debris pile', roomX + rng.next() * 2 - 1, dy, branchZ + side * 4 + rng.next() * 2, rng.int(0, 3) * 90, lv, 'decor');
            decorCount++;
          }
        }
      }
    }

    // ── Extra rooms along spine (large/mega) ──────────────────────────────────
    if (size.extraRooms > 0 && rng.bool(0.6)) {
      const extraZ = rng.int(1, spineLen - 1) * CELL_LEN;
      const extraSide = rng.bool() ? 1 : -1;
      const extraRoom = rng.bool(0.5) ? style.primaryRoom : style.altRoom;
      place(extraRoom.classname, `L${lv} Extra Room`, extraSide * ROOM_OFF, dy, extraZ, 90, lv, 'room');
      rooms++;

      if (opts.includeDecor) {
        for (let sg = 0; sg < 3; sg++) {
          place(PIECE_SANDBAG_WALL.classname, 'Guard Sandbags', extraSide * (BRANCH_OFF + sg * 0.8), dy, extraZ + (sg - 1) * 0.5, extraSide > 0 ? 0 : 180, lv, 'decor');
          decorCount++;
        }
      }
    }

    // ── Collapsed passage atmospheric prop (abandoned/horror) ─────────────────
    if ((opts.style === 'abandoned' || opts.style === 'horror') && rng.bool(0.35)) {
      const colSeg = rng.int(0, spineLen - 1);
      place(PIECE_STAIRS_COLLAPSED.classname, `L${lv} Collapsed Passage`, rng.next() * 4 - 2, dy, colSeg * CELL_LEN + 2, rng.int(0, 3) * 90, lv, 'decor');
    }

    // ── Vehicle convoy ────────────────────────────────────────────────────────
    if (lv === 1 && opts.includeConvoy) {
      const convoyStart = rng.int(0, Math.max(0, spineLen - 3));
      const convoyLen   = rng.int(1, Math.min(3, spineLen - convoyStart));
      const mainWreck   = rng.pick(WRECK_PROPS);
      const trailWreck  = WRECK_PROPS.find(w => w.classname === 'Land_Wreck_Trailer_Closed_DE') ?? WRECK_PROPS[1];
      const wrecksInConvoy: DecorProp[] = [mainWreck];
      for (let c = 1; c < convoyLen; c++) {
        wrecksInConvoy.push(rng.bool(0.5) ? mainWreck : trailWreck);
      }
      let convoyDz = convoyStart * CELL_LEN + 1;
      for (const wreck of wrecksInConvoy) {
        place(wreck.classname, `Convoy: ${wreck.label}`, rng.next() * 0.8 - 0.4, dy, convoyDz, rng.bool(0.8) ? 0 : 180, lv, 'decor');
        convoyDz += wreck.d + 1.5;
        decorCount++;
      }
    }

    // ── Scattered corridor decor ──────────────────────────────────────────────
    if (opts.includeDecor) {
      const corridorDecorCount = opts.decorDensity === 'sparse' ? 2
        : opts.decorDensity === 'normal' ? Math.floor(spineLen * 1.5)
        : spineLen * 2;
      const biasPool = DECOR_PROPS.filter(d => style.decorBias.includes(d.category));
      const pool = biasPool.length >= 2 ? biasPool : DECOR_PROPS;
      for (let i = 0; i < corridorDecorCount; i++) {
        const prop = rng.weightedPick(pool);
        const seg  = rng.int(0, spineLen - 1);
        const sdz  = seg * CELL_LEN + rng.next() * CELL_LEN * 0.5;
        const sdx  = (rng.bool() ? 2.0 : -2.0) + rng.next() * 0.4 - 0.2;
        place(prop.classname, `Corridor Decor: ${prop.label}`, sdx, dy, sdz, rng.int(0, 3) * 90, lv, 'decor');
        decorCount++;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EXTERIOR WALL ENCLOSURE (optional)
  // ─────────────────────────────────────────────────────────────────────────────

  if (opts.encaseExterior) {
    const maxSpine = Math.max(...spineLengths);
    const footprintL = (maxSpine + 3) * CELL_LEN;
    const footprintW = ROOM_OFF + 10;
    const wallObj    = STYLES[opts.style].exteriorWall;
    const wallLen    = wallObj.d;
    const numWallsLong = Math.ceil(footprintL / wallLen);
    const numWallsWide = Math.ceil(footprintW / wallLen);
    const wallY = 0.5;

    for (let i = 0; i < numWallsLong; i++) {
      place(wallObj.classname, 'Exterior Wall N', (-footprintW / 2) + i * wallLen + wallLen * 0.5, wallY, footprintL, 90, 0, 'exterior');
      place(wallObj.classname, 'Exterior Wall S', (-footprintW / 2) + i * wallLen + wallLen * 0.5, wallY, -CELL_LEN * 2, 90, 0, 'exterior');
    }
    for (let i = 0; i < numWallsWide; i++) {
      place(wallObj.classname, 'Exterior Wall E', footprintW / 2, wallY, (-CELL_LEN * 2) + i * wallLen + wallLen * 0.5, 0, 0, 'exterior');
      place(wallObj.classname, 'Exterior Wall W', -footprintW / 2, wallY, (-CELL_LEN * 2) + i * wallLen + wallLen * 0.5, 0, 0, 'exterior');
    }

    const corners: [number, number, number][] = [
      [footprintW / 2, wallY, footprintL],
      [-footprintW / 2, wallY, footprintL],
      [footprintW / 2, wallY, -CELL_LEN * 2],
      [-footprintW / 2, wallY, -CELL_LEN * 2],
    ];
    for (const [cx, cy, cz] of corners) {
      if (wallObj.classname.includes('HBarrier')) {
        place(PIECE_HBARRIER_CORNER.classname, 'Exterior Corner', cx, cy, cz, 0, 0, 'exterior');
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SURFACE PERIMETER PROPS
  // ─────────────────────────────────────────────────────────────────────────────

  if (opts.includeDecor) {
    const sbPositions: [number, number, number][] = [[-4, 0, -CELL_LEN + 2], [4, 0, -CELL_LEN + 2], [-5, 0, 0], [5, 0, 0]];
    for (const [sx, sy, sz] of sbPositions) {
      if (rng.bool(0.65)) {
        place(PIECE_SANDBAG_WALL.classname, 'Entrance Sandbags', sx, sy, sz, rng.int(0, 3) * 90, 0, 'entrance');
      }
    }
    for (let i = 0; i < rng.int(3, 7); i++) {
      const prop = rng.weightedPick(DECOR_PROPS.filter(d => d.category === 'garbage' || d.category === 'barrel'));
      place(prop.classname, `Surface Debris: ${prop.label}`, rng.next() * 16 - 8, 0, rng.next() * 8 - 2, rng.int(0, 3) * 90, 0, 'decor');
      decorCount++;
    }
  }

  const footprintRadius = (Math.max(...spineLengths) * CELL_LEN) / 2 + ROOM_OFF + 5;

  return {
    objects,
    stats: {
      totalObjects: objects.length,
      levels: opts.levels,
      rooms,
      tunnelSegments: tunnelCount,
      decorObjects: decorCount,
      footprintRadius: Math.round(footprintRadius),
    },
    seed: opts.seed,
  };
}

// ─── Code Export Helpers ─────────────────────────────────────────────────────

const SPAWN_HELPER = `// SpawnObject helper -- paste ONCE into your init.c (skip if already present)
ref Object SpawnObject(string type, string pos, string ori, float scale) {
    vector vPos = pos.ToVector();
    vector vOri = ori.ToVector();
    Object obj = GetGame().CreateObjectEx(type, vPos, ECE_SETUP | ECE_UPDATEPATHGRAPH | ECE_CREATEPHYSICS);
    if (obj) { obj.SetOrientation(vOri); obj.SetScale(scale); }
    return obj;
}

`;

// Strip any emoji or non-ASCII characters from comment strings
function sanitizeComment(s: string): string {
  return s.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, ' ').trim();
}

export function exportBunkerInitC(
  layout: BunkerLayout,
  worldX: number,
  worldY: number,
  worldZ: number,
): string {
  const sections: PlacedObject['section'][] = ['entrance', 'exit', 'panel', 'exterior', 'stair', 'tunnel', 'branch', 'room', 'decor'];
  const sectionHeaders: Partial<Record<PlacedObject['section'], string>> = {
    entrance: `// -- SURFACE STRUCTURES -------------------------------------------------------`,
    exit:     `// -- EXIT STRUCTURES ----------------------------------------------------------`,
    panel:    `// -- ACCESS PANELS ------------------------------------------------------------`,
    exterior: `// -- EXTERIOR ENCLOSURE WALLS -------------------------------------------------`,
    stair:    `// -- STAIRWELLS & LEVEL TRANSITIONS -------------------------------------------`,
    tunnel:   `// -- UNDERGROUND TUNNEL CORRIDORS ---------------------------------------------`,
    branch:   `// -- BRANCH CORRIDORS ---------------------------------------------------------`,
    room:     `// -- UNDERGROUND ROOMS --------------------------------------------------------`,
    decor:    `// -- DECORATIVE PROPS ---------------------------------------------------------`,
  };

  let currentSection = '' as PlacedObject['section'] | '';
  const sorted = [...layout.objects].sort((a, b) => {
    const si = sections.indexOf(a.section);
    const sj = sections.indexOf(b.section);
    if (si !== sj) return si - sj;
    return a.level - b.level;
  });

  const lines: string[] = [];
  lines.push(
    SPAWN_HELPER,
    `// ============================================================`,
    `// Dank's Dayz Studio -- BUNKER MAKER`,
    `// Seed: ${layout.seed} | Levels: ${layout.stats.levels} | Rooms: ${layout.stats.rooms}`,
    `// Objects: ${layout.stats.totalObjects} | Footprint: ~${layout.stats.footprintRadius * 2}m wide`,
    `// Origin: X=${worldX.toFixed(1)} Y=${worldY.toFixed(1)} Z=${worldZ.toFixed(1)}`,
    `//`,
    `// HOW TO USE:`,
    `// 1. Set World Y to your terrain height at the bunker centre.`,
    `// 2. Underground levels auto-sink below Y (L1=-5m, L2=-11m, L3=-18m).`,
    `// 3. If terrain slopes, adjust individual object Y values after spawning.`,
    `// 4. Sakhal panels (Land_UGComplex_*) require DayZ 1.25+.`,
    `// 5. Re-roll the seed for a completely different layout.`,
    `// ============================================================`,
    ``,
  );

  for (const obj of sorted) {
    if (obj.section !== currentSection) {
      currentSection = obj.section;
      if (sectionHeaders[currentSection]) {
        lines.push('');
        lines.push(sectionHeaders[currentSection]!);
      }
    }
    const x  = (worldX + obj.dx).toFixed(3);
    const y  = (worldY + obj.dy).toFixed(3);
    const z  = (worldZ + obj.dz).toFixed(3);
    const lv = obj.level > 0 ? ` [L${obj.level}]` : ' [Surface]';
    const comment = sanitizeComment(obj.note);
    lines.push(`SpawnObject("${obj.classname}", "${x} ${y} ${z}", "${obj.pitch.toFixed(3)} ${obj.yaw.toFixed(3)} ${obj.roll.toFixed(3)}", 1.00); // ${comment}${lv}`);
  }

  return lines.join('\n');
}

export function exportBunkerJSON(
  layout: BunkerLayout,
  worldX: number,
  worldY: number,
  worldZ: number,
): string {
  const objects = layout.objects.map(obj => ({
    name: obj.classname,
    pos: [
      parseFloat((worldX + obj.dx).toFixed(3)),
      parseFloat((worldY + obj.dy).toFixed(3)),
      parseFloat((worldZ + obj.dz).toFixed(3)),
    ],
    ypr: [
      parseFloat(obj.pitch.toFixed(4)),
      parseFloat(obj.yaw.toFixed(4)),
      parseFloat(obj.roll.toFixed(4)),
    ],
    scale: 1.0,
    enableCEPersistency: 0,
    customString: "",
  }));
  return JSON.stringify({ Objects: objects }, null, 2);
}
