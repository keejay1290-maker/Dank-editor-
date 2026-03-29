
// ─── DankDayZ Bunker Maker — Random Generator ────────────────────────────────

import {
  PlacedObject, BunkerStyle, BunkerSize,
  STYLES, SIZES, DECOR_PROPS, WRECK_PROPS,
  PIECE_ENTRANCE_MAIN, PIECE_ENTRANCE_SMALL, PIECE_GUARDHOUSE,
  PIECE_STAIRS_CONCRETE, PIECE_LADDER, PIECE_PLATFORM,
  PIECE_FLOOR_10, PIECE_FLOOR_5,
  PIECE_WALL_CONCRETE_4, PIECE_WALL_CONCRETE_8,
  PIECE_HBARRIER_5, PIECE_HBARRIER_10, PIECE_HBARRIER_CORNER, PIECE_SANDBAG_WALL,
  PIECE_WALL_CASTLE_3, PIECE_WALL_CASTLE_6,
  PIECE_PANEL_EXTERIOR, PIECE_PANEL_INTERIOR, PIECE_PANEL_FALLBACK,
  PIECE_CONCRETE_STEP, DecorProp,
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

// Each spine segment is CELL_LEN metres along the Z axis.
const CELL_LEN   = 6.5;   // container length + small gap
const CELL_W     = 5.0;   // corridor width (two containers side-by-side)
const BRANCH_OFF = 8.0;   // lateral offset of branch corridor from spine axis
const ROOM_OFF   = 16.0;  // total lateral offset of room centre from spine axis

// Depth (Y offset) per level, metres below surface
const LEVEL_DEPTH: Record<number, number> = {
  0: 0,     // surface
  1: -5,    // Level 1
  2: -11,   // Level 2
  3: -18,   // Level 3
};

// Stairwell Y heights relative to upper level
const STAIR_Y_OFFSETS = [0.0, 2.0, 4.0];

// ─── Generator Options ───────────────────────────────────────────────────────

export interface BunkerOptions {
  seed: number;
  levels: 1 | 2 | 3;
  size: BunkerSize;
  style: BunkerStyle;
  spineAxis: 'NS' | 'EW';     // spine runs N-S (Z) or E-W (X)
  encaseExterior: boolean;     // wrap surface footprint in walls
  includeConvoy: boolean;      // vehicle wrecks in main corridor
  includeDecor: boolean;       // scatter decorative props
  decorDensity: 'sparse' | 'normal' | 'heavy';
  includeFloors: boolean;      // concrete floor slabs under rooms
  useSakhalPanels: boolean;    // use Sakhal-specific keypad objects
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

// Rotate an (dx, dz) vector around Y by yaw degrees
function rotateXZ(dx: number, dz: number, yawDeg: number): [number, number] {
  const r = (yawDeg * Math.PI) / 180;
  return [
    dx * Math.cos(r) - dz * Math.sin(r),
    dx * Math.sin(r) + dz * Math.cos(r),
  ];
}

// ─── Main Generator ──────────────────────────────────────────────────────────

export interface BunkerLayout {
  objects: PlacedObject[];
  stats: {
    totalObjects: number;
    levels: number;
    rooms: number;
    corridorSegments: number;
    decorObjects: number;
    footprintRadius: number; // approximate half-width of layout
  };
  seed: number;
}

export function generateBunker(opts: BunkerOptions): BunkerLayout {
  const rng = mkRng(opts.seed);
  const objects: PlacedObject[] = [];
  const style = STYLES[opts.style];
  const size  = SIZES[opts.size];

  let rooms = 0;
  let corridorCount = 0;
  let decorCount = 0;

  // Yaw of entire bunker layout (spineAxis determines base orientation)
  const baseYaw = opts.spineAxis === 'NS' ? 0 : 90;

  // Helper: add a placed object (rotates dx/dz by baseYaw automatically)
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

  // ── Spine length per level ──────────────────────────────────────────────────
  const spineLengths: number[] = [];
  for (let lv = 0; lv < opts.levels; lv++) {
    const base = lv === 0 ? size.spineMin : Math.max(2, size.spineMin - lv);
    const max  = lv === 0 ? size.spineMax : Math.max(2, size.spineMax - lv);
    spineLengths.push(rng.int(base, max));
  }

  // ── Stairwell spine positions (where level transitions happen) ──────────────
  // Stairwell for level N→N+1 is placed at a random segment of level N's spine
  const stairPositions: number[] = [];
  for (let lv = 0; lv < opts.levels - 1; lv++) {
    stairPositions.push(rng.int(1, spineLengths[lv] - 1));
  }

  // ── EXIT position — always far end of level 1 spine ────────────────────────
  const exitSpinePos = spineLengths[0] + 1;

  // ─────────────────────────────────────────────────────────────────────────────
  // SURFACE LEVEL — Entrance & Exit
  // ─────────────────────────────────────────────────────────────────────────────

  // Main entrance — at spine position -1 (just before spine start), surface
  place(PIECE_ENTRANCE_MAIN.classname, '🚪 Main Entrance', 0, 0, -CELL_LEN, 0, 0, 'entrance');

  // Exterior punchcard panel — beside entrance
  const panelExtClass = opts.useSakhalPanels ? PIECE_PANEL_EXTERIOR.classname : PIECE_PANEL_FALLBACK.classname;
  const panelExtNote  = opts.useSakhalPanels ? '🔲 Entry Keypad Panel (Sakhal)' : '🔲 Entry Panel (Fallback shelf)';
  place(panelExtClass, panelExtNote, 4.5, 0.5, -CELL_LEN + 1, 90, 0, 'panel');

  // Guard house beside entrance (random placement: left or right)
  if (rng.bool(0.6)) {
    const side = rng.bool() ? 5 : -5;
    place(PIECE_GUARDHOUSE.classname, '🪖 Surface Guard Post', side, 0, -CELL_LEN, rng.bool() ? 90 : 270, 0, 'entrance');
  }

  // Emergency exit — at far end of surface spine
  place(PIECE_ENTRANCE_SMALL.classname, '🚪 Emergency Exit', 0, 0, exitSpinePos * CELL_LEN + CELL_LEN, 180, 0, 'exit');

  // Interior exit panel (at base of exit stairwell, underground)
  const panelIntClass = opts.useSakhalPanels ? PIECE_PANEL_INTERIOR.classname : PIECE_PANEL_FALLBACK.classname;
  place(panelIntClass, '🔲 Interior Exit Panel', 4, LEVEL_DEPTH[1] + 0.5, exitSpinePos * CELL_LEN, 270, 1, 'panel');

  // ─────────────────────────────────────────────────────────────────────────────
  // UNDERGROUND LEVELS
  // ─────────────────────────────────────────────────────────────────────────────

  for (let lv = 1; lv <= opts.levels; lv++) {
    const spineLen = spineLengths[lv - 1];
    const dy       = LEVEL_DEPTH[lv];
    const stairPos = stairPositions[lv - 1]; // stairwell toward next level (undefined if last level)

    // ── Spine corridor ──────────────────────────────────────────────────────
    for (let seg = 0; seg < spineLen; seg++) {
      const dz = seg * CELL_LEN + 0.5;

      // Two containers side-by-side form the corridor
      const contA = seg % 2 === 0 ? style.corridorA : style.corridorB;
      const contB = seg % 2 === 0 ? style.corridorB : style.corridorA;
      place(contA.classname, `L${lv} Spine Corridor Seg${seg+1}A`, -1.3, dy, dz, 0, lv, 'spine');
      place(contB.classname, `L${lv} Spine Corridor Seg${seg+1}B`, +1.3, dy, dz, 0, lv, 'spine');
      corridorCount += 2;

      // Floor slabs under corridor
      if (opts.includeFloors && seg % 2 === 0) {
        place(PIECE_FLOOR_5.classname, `L${lv} Floor Slab`, 0, dy - 0.15, dz, 0, lv, 'spine');
      }
    }

    // ── Stairwell going DOWN to next level ──────────────────────────────────
    if (lv < opts.levels && stairPos !== undefined) {
      const sdz = stairPos * CELL_LEN;
      const sdx = rng.bool() ? BRANCH_OFF + 2 : -(BRANCH_OFF + 2);
      const nextDy = LEVEL_DEPTH[lv + 1];
      const depthDiff = Math.abs(nextDy - dy);
      const numFlights = Math.ceil(depthDiff / 2);

      for (let f = 0; f < numFlights; f++) {
        const stairY = dy - f * 2;
        place(PIECE_STAIRS_CONCRETE.classname, `L${lv}→L${lv+1} Stair Flight ${f+1}`, sdx, stairY, sdz + f * 2, sdx > 0 ? 270 : 90, lv, 'stair');
      }
      // Ladder for the full drop
      place(PIECE_LADDER.classname, `L${lv}→L${lv+1} Descent Ladder`, sdx + (sdx > 0 ? 1.5 : -1.5), dy, sdz, 0, lv, 'stair');
      place(PIECE_PLATFORM.classname, `L${lv}→L${lv+1} Landing Platform`, sdx, nextDy + 0.5, sdz, 0, lv + 1, 'stair');

      // Corridor connecting stairwell base to next level spine
      place(style.corridorA.classname, `L${lv+1} Stair Access Corr A`, sdx > 0 ? BRANCH_OFF * 0.5 : -BRANCH_OFF * 0.5, nextDy, sdz, sdx > 0 ? 270 : 90, lv + 1, 'stair');
    }

    // ── Exit stairwell (from level 1 to surface exit bunker) ────────────────
    if (lv === 1) {
      const ez = exitSpinePos * CELL_LEN;
      const numFlights = Math.ceil(Math.abs(dy) / 2);
      for (let f = 0; f < numFlights; f++) {
        place(PIECE_STAIRS_CONCRETE.classname, `Exit Stair Flight ${f+1}`, 0, dy + f * 2, ez + f * 2, 0, lv, 'stair');
      }
      place(PIECE_LADDER.classname, 'Exit Ladder', 2, dy, ez, 0, lv, 'stair');
    }

    // ── Branch rooms off the spine ──────────────────────────────────────────
    const numBranches = rng.int(size.branchMin, size.branchMax);
    const usedSegs = new Set<number>();

    for (let b = 0; b < numBranches; b++) {
      // Pick a spine segment that hasn't had a branch yet
      let branchSeg: number;
      let attempts = 0;
      do {
        branchSeg = rng.int(0, spineLen - 1);
        attempts++;
      } while (usedSegs.has(branchSeg) && attempts < 20);
      usedSegs.add(branchSeg);

      const branchZ = branchSeg * CELL_LEN + CELL_LEN * 0.5;
      const side = b % 2 === 0 ? 1 : -1; // alternate sides for balance
      const branchLen = rng.int(1, 2); // 1-2 corridor segments before room

      // Branch corridor segments (run in X direction)
      for (let bc = 0; bc < branchLen; bc++) {
        const bx = side * (BRANCH_OFF * 0.5 + bc * CELL_LEN);
        place(style.corridorA.classname, `L${lv} Branch${b+1} Seg${bc+1}A`, bx, dy, branchZ - 1.3, 90, lv, 'branch');
        place(style.corridorB.classname, `L${lv} Branch${b+1} Seg${bc+1}B`, bx, dy, branchZ + 1.3, 90, lv, 'branch');
        corridorCount += 2;
      }

      // Room at the end of the branch
      const roomX = side * (BRANCH_OFF + branchLen * CELL_LEN + 3);
      const roomDef = rng.bool(0.4) ? style.primaryRoom : style.altRoom;
      const roomYaw = rng.bool(0.5) ? 0 : 90; // random orientation
      place(roomDef.classname, `L${lv} Room ${b+1} (${roomDef.label})`, roomX, dy, branchZ, roomYaw, lv, 'room');
      rooms++;

      // Floor under room
      if (opts.includeFloors) {
        place(PIECE_FLOOR_10.classname, `L${lv} Room ${b+1} Floor`, roomX, dy - 0.15, branchZ, roomYaw, lv, 'room');
      }

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
          const oy = opts.decorDensity === 'heavy' && i >= numDecor - 2
            ? dy + 0.8 // stacked on top
            : dy;
          place(prop.classname, `Decor: ${prop.label}`, ox, oy, oz, rng.int(0, 3) * 90, lv, 'decor');
          decorCount++;
        }

        // Pile of garbage/barrels near room entrance
        if (rng.bool(0.5)) {
          const garbagePile = rng.bool() ? DECOR_PROPS.find(d => d.classname === 'GarbageContainer_Yellow_DE')! : DECOR_PROPS.find(d => d.classname === 'Barrel_Blue')!;
          for (let g = 0; g < rng.int(2, 4); g++) {
            place(garbagePile.classname, 'Pile of debris', roomX + rng.next() * 2 - 1, dy, branchZ + side * 4 + rng.next() * 2, rng.int(0, 3) * 90, lv, 'decor');
            decorCount++;
          }
        }
      }
    }

    // ── Extra rooms along spine (for large/mega) ─────────────────────────────
    if (size.extraRooms > 0 && rng.bool(0.6)) {
      const extraZ = rng.int(1, spineLen - 1) * CELL_LEN;
      const extraSide = rng.bool() ? 1 : -1;
      const extraRoom = rng.bool(0.5) ? style.primaryRoom : style.altRoom;
      place(extraRoom.classname, `L${lv} Extra Room`, extraSide * ROOM_OFF, dy, extraZ, 90, lv, 'room');
      rooms++;

      // Sandbag guard positions at extra room entrance
      if (opts.includeDecor) {
        for (let sg = 0; sg < 3; sg++) {
          place(PIECE_SANDBAG_WALL.classname, 'Guard Sandbags', extraSide * (BRANCH_OFF + sg * 0.8), dy, extraZ + (sg - 1) * 0.5, extraSide > 0 ? 0 : 180, lv, 'decor');
          decorCount++;
        }
      }
    }

    // ── Vehicle convoy in spine corridor ────────────────────────────────────
    if (lv === 1 && opts.includeConvoy) {
      const convoyStart = rng.int(0, Math.max(0, spineLen - 3));
      const convoyLen = rng.int(1, Math.min(3, spineLen - convoyStart));
      const mainWreck = rng.pick(WRECK_PROPS);
      const trailWreck = WRECK_PROPS.find(w => w.classname === 'Land_Wreck_Trailer_Closed_DE') ?? WRECK_PROPS[1];
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

    // ── Scattered corridor decor ─────────────────────────────────────────────
    if (opts.includeDecor) {
      const corridorDecorCount = opts.decorDensity === 'sparse' ? 2
        : opts.decorDensity === 'normal' ? Math.floor(spineLen * 1.5)
        : spineLen * 2;
      const biasPool = DECOR_PROPS.filter(d => style.decorBias.includes(d.category));
      const pool = biasPool.length >= 2 ? biasPool : DECOR_PROPS;
      for (let i = 0; i < corridorDecorCount; i++) {
        const prop = rng.weightedPick(pool);
        const seg = rng.int(0, spineLen - 1);
        const sdz = seg * CELL_LEN + rng.next() * CELL_LEN * 0.5;
        const sdx = (rng.bool() ? 2.8 : -2.8) + rng.next() * 0.4 - 0.2;
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
    const footprintL = (maxSpine + 3) * CELL_LEN; // total length of spine + buffers
    const footprintW = ROOM_OFF + 10;              // total width (rooms + buffer)
    const wallObj = style.exteriorWall;
    const wallLen = wallObj.d; // wall segment length
    const numWallsLong = Math.ceil(footprintL / wallLen);
    const numWallsWide = Math.ceil(footprintW / wallLen);
    const wallY = 0.5;

    // North wall (dz = footprintL)
    for (let i = 0; i < numWallsLong; i++) {
      place(wallObj.classname, 'Exterior Wall N', (-footprintW / 2) + i * wallLen + wallLen * 0.5, wallY, footprintL, 90, 0, 'exterior');
    }
    // South wall (dz = -CELL_LEN * 2)
    for (let i = 0; i < numWallsLong; i++) {
      place(wallObj.classname, 'Exterior Wall S', (-footprintW / 2) + i * wallLen + wallLen * 0.5, wallY, -CELL_LEN * 2, 90, 0, 'exterior');
    }
    // East wall (dx = footprintW/2)
    for (let i = 0; i < numWallsWide; i++) {
      place(wallObj.classname, 'Exterior Wall E', footprintW / 2, wallY, (-CELL_LEN * 2) + i * wallLen + wallLen * 0.5, 0, 0, 'exterior');
    }
    // West wall (dx = -footprintW/2)
    for (let i = 0; i < numWallsWide; i++) {
      place(wallObj.classname, 'Exterior Wall W', -footprintW / 2, wallY, (-CELL_LEN * 2) + i * wallLen + wallLen * 0.5, 0, 0, 'exterior');
    }

    // HESCO corner reinforcements
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
  // SURFACE PERIMETER PROPS (outside bunker)
  // ─────────────────────────────────────────────────────────────────────────────

  if (opts.includeDecor) {
    // Sandbag guard positions around entrance
    const sbPositions = [[-4, 0, -CELL_LEN + 2], [4, 0, -CELL_LEN + 2], [-5, 0, 0], [5, 0, 0]] as [number, number, number][];
    for (const [sx, sy, sz] of sbPositions) {
      if (rng.bool(0.65)) {
        place(PIECE_SANDBAG_WALL.classname, 'Entrance Sandbags', sx, sy, sz, rng.int(0, 3) * 90, 0, 'entrance');
      }
    }

    // Surface garbage / debris
    for (let i = 0; i < rng.int(3, 7); i++) {
      const prop = rng.weightedPick(DECOR_PROPS.filter(d => d.category === 'garbage' || d.category === 'barrel'));
      place(prop.classname, `Surface Debris: ${prop.label}`, rng.next() * 16 - 8, 0, rng.next() * 8 - 2, rng.int(0, 3) * 90, 0, 'decor');
      decorCount++;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────────────────────────────────────
  const footprintRadius = (Math.max(...spineLengths) * CELL_LEN) / 2 + ROOM_OFF + 5;

  return {
    objects,
    stats: {
      totalObjects: objects.length,
      levels: opts.levels,
      rooms,
      corridorSegments: corridorCount,
      decorObjects: decorCount,
      footprintRadius: Math.round(footprintRadius),
    },
    seed: opts.seed,
  };
}

// ─── Code Export Helpers ─────────────────────────────────────────────────────

const SPAWN_HELPER = `// SpawnObject helper — paste ONCE into your init.c (skip if already present)
ref Object SpawnObject(string type, string pos, string ori, float scale) {
    vector vPos = pos.ToVector();
    vector vOri = ori.ToVector();
    Object obj = GetGame().CreateObjectEx(type, vPos, ECE_SETUP | ECE_UPDATEPATHGRAPH | ECE_CREATEPHYSICS);
    if (obj) { obj.SetOrientation(vOri); obj.SetScale(scale); }
    return obj;
}

`;

export function exportBunkerInitC(
  layout: BunkerLayout,
  worldX: number,
  worldY: number,
  worldZ: number,
): string {
  const sections: PlacedObject['section'][] = ['entrance', 'exit', 'panel', 'exterior', 'stair', 'spine', 'branch', 'room', 'decor'];
  const sectionHeaders: Partial<Record<PlacedObject['section'], string>> = {
    entrance: `// ── SURFACE STRUCTURES ─────────────────────────────────────────────────────`,
    exit:     `// ── EXIT STRUCTURES ────────────────────────────────────────────────────────`,
    panel:    `// ── KEYPAD / ACCESS PANELS ────────────────────────────────────────────────`,
    exterior: `// ── EXTERIOR ENCLOSURE WALLS ──────────────────────────────────────────────`,
    stair:    `// ── STAIRWELLS & LEVEL TRANSITIONS ───────────────────────────────────────`,
    spine:    `// ── UNDERGROUND CORRIDOR (SPINE) ──────────────────────────────────────────`,
    branch:   `// ── BRANCH CORRIDORS ────────────────────────────────────────────────────`,
    room:     `// ── UNDERGROUND ROOMS ──────────────────────────────────────────────────────`,
    decor:    `// ── DECORATIVE PROPS & ATMOSPHERE ─────────────────────────────────────────`,
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
    `// ════════════════════════════════════════════════════════`,
    `// DankDayZ Ultimate Builder — BUNKER MAKER`,
    `// Seed: ${layout.seed} | Levels: ${layout.stats.levels} | Rooms: ${layout.stats.rooms}`,
    `// Objects: ${layout.stats.totalObjects} | Footprint: ~${layout.stats.footprintRadius * 2}m wide`,
    `// Origin: X=${worldX.toFixed(1)} Y=${worldY.toFixed(1)} Z=${worldZ.toFixed(1)}`,
    `//`,
    `// HOW TO USE:`,
    `// 1. Set World Y to your terrain height at the bunker location.`,
    `// 2. Underground levels auto-sink below Y (L1 = -5m, L2 = -11m, L3 = -18m).`,
    `// 3. If terrain slopes, adjust individual Y values after spawning.`,
    `// 4. Sakhal panels (Land_UGComplex_*) require DayZ 1.25+.`,
    `//    Toggle off "Sakhal Panels" in the tool if they don't appear.`,
    `// 5. Re-roll the seed for a completely different bunker layout.`,
    `// ════════════════════════════════════════════════════════`,
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
    const x = (worldX + obj.dx).toFixed(3);
    const y = (worldY + obj.dy).toFixed(3);
    const z = (worldZ + obj.dz).toFixed(3);
    const lv = obj.level > 0 ? ` [L${obj.level}]` : ' [Surface]';
    lines.push(`SpawnObject("${obj.classname}", "${x} ${y} ${z}", "${obj.pitch.toFixed(3)} ${obj.yaw.toFixed(3)} ${obj.roll.toFixed(3)}", 1.00); // ${obj.note}${lv}`);
  }

  return lines.join('\n');
}

export function exportBunkerJSON(
  layout: BunkerLayout,
  worldX: number,
  worldY: number,
  worldZ: number,
): string {
  const arr = layout.objects.map(obj => ({
    classname: obj.classname,
    pos: [
      parseFloat((worldX + obj.dx).toFixed(3)),
      parseFloat((worldY + obj.dy).toFixed(3)),
      parseFloat((worldZ + obj.dz).toFixed(3)),
    ],
    ypr: [obj.yaw, obj.pitch, obj.roll],
    _note: obj.note,
    _level: obj.level,
    _section: obj.section,
  }));
  return JSON.stringify(arr, null, 2);
}
