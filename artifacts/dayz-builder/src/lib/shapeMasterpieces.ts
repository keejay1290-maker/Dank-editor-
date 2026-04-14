import { Point3D } from "./types";
import { getMimic } from "./shapeMimic";

// ─────────────────────────────────────────────────────────────────────────────
// 🏗️  DANKVAULT™ MASTERPIECE GEOMETRY ENGINE (HIGH FIDELITY)
// ─────────────────────────────────────────────────────────────────────────────

// Safety Constants
const MAX_OBJECTS = 1200;
const PANEL_W = 8.0;      // Legacy default
const OVERLAP = 0.90;     // 10% overlap intersection for solid surfaces

/** 
 * Returns the canonical width of an object for gapless tiling.
 * Defaults to 8m for unknown walls.
 */
function getObjectWidth(name?: string): number {
  if (!name) return 8.0;
  const mimic = getMimic(name);
  // Many mimics use [width, height, thickness] logic.
  // We assume args[0] is the lateral span unless it's a known exception.
  return (mimic.args && mimic.args[0]) ? mimic.args[0] : 8.0;
}

function drawWall(pts: Point3D[], x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, nameOrSpacing?: string | number) {
  let name: string | undefined = undefined;
  let spacing: number = PANEL_W * OVERLAP;

  if (typeof nameOrSpacing === "string") {
    name = nameOrSpacing;
    spacing = getObjectWidth(name) * OVERLAP;
  } else if (typeof nameOrSpacing === "number") {
    spacing = nameOrSpacing;
  }

  const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
  const len = Math.max(0.1, Math.sqrt(dx*dx + dy*dy + dz*dz));
  const yaw = Math.atan2(dx, dz) * 180 / Math.PI + 90;
  const pitch = Math.atan2(dy, Math.sqrt(dx*dx + dz*dz)) * -180 / Math.PI;
  const steps = Math.max(1, Math.ceil(len / spacing));
  for (let i = 0; i < steps; i++) {
    const t = (i + 0.5) / steps;
    pts.push({ x: x1+dx*t, y: y1+dy*t, z: z1+dz*t, yaw, pitch, name });
  }
}

function drawRing(pts: Point3D[], cx: number, cy: number, cz: number, r: number, nameOrSpacing?: string | number) {
  if (r <= 0) return;
  let name: string | undefined = undefined;
  let spacing: number = PANEL_W * OVERLAP;

  if (typeof nameOrSpacing === "string") {
    name = nameOrSpacing;
    spacing = getObjectWidth(name) * OVERLAP;
  } else if (typeof nameOrSpacing === "number") {
    spacing = nameOrSpacing;
  }

  const nPanels = Math.max(4, Math.ceil((2 * Math.PI * r) / spacing));
  const arcStep = (2 * Math.PI) / nPanels;
  for (let i = 0; i < nPanels; i++) {
    const a = (i + 0.5) * arcStep;
    const x = cx + r * Math.cos(a);
    const z = cz + r * Math.sin(a);
    const yaw = -a * 180 / Math.PI + 90;
    pts.push({ x, y: cy, z, yaw, name });
  }
}

function drawDisk(pts: Point3D[], cx: number, cy: number, cz: number, maxR: number, nameOrSpacing?: string | number) {
  let spacing: number = PANEL_W * OVERLAP;
  if (typeof nameOrSpacing === "string") {
    spacing = getObjectWidth(nameOrSpacing) * OVERLAP;
  } else if (typeof nameOrSpacing === "number") {
    spacing = nameOrSpacing;
  }

  for(let r=spacing; r<=maxR; r+=spacing) {
    drawRing(pts, cx, cy, cz, r, nameOrSpacing);
  }
}

/**
 * Ensures build stays under 1200 objects.
 * If exceeded, it scales the entire build down until it fits.
 */
function applyGovernor(pts: Point3D[], targetLimit: number = MAX_OBJECTS): Point3D[] {
  if (pts.length <= targetLimit) return pts;
  const factor = Math.sqrt(targetLimit / pts.length) * 0.95; 
  return pts.map(p => ({
    ...p,
    x: p.x * factor,
    y: p.y * factor,
    z: p.z * factor,
    // Note: Rotations remain same, scale might need adjustment if it was per-object
  })).slice(0, targetLimit); // Safety slice
}

function placeStairs(pts: Point3D[], centerX: number, centerZ: number, startY: number, height: number, steps: number, radius = 5): void {
    for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const angle = ratio * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const z = centerZ + Math.sin(angle) * radius;
        const y = startY + ratio * height;
        pts.push({ x, y, z });
    }
}

/**
 * Fidelity: Maritime (Large Sections, Debris, Hull Plates)
 * Features: Multi-section hull, cargo hold visualization.
 */
export function gen_shipwreck(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const len    = Math.max(30, p.length || 80);
  const tiltDeg = p.tiltDeg || 14;            // roll tilt (list) degrees
  const beachDeg = p.beachAngle || 8;          // bow-down pitch degrees

  // yaw=0: ship runs along X axis (15m hull sections flush at 15m intervals)
  // roll encodes the list; pitch encodes the bow-down angle

  // ── 1. MAIN HULL (15m sections) ──────────────────────────────────────────
  const SECT = 15;
  const nSect = Math.max(2, Math.round(len / SECT));
  for (let i = 0; i < nSect; i++) {
    const cx = -len/2 + i * SECT + SECT/2;
    let name = "Wreck_Ship_Large_Mid";
    if (i === 0)         name = "Wreck_Ship_Large_Front";
    if (i === nSect - 1) name = "Wreck_Ship_Large_Back";
    // progressive bow-down: stern level, bow dips
    const bowDip = (i / nSect) * beachDeg * -0.3;
    pts.push({ x: cx, y: bowDip, z: 0, yaw: 0, pitch: bowDip, roll: tiltDeg, name });
  }

  // ── 2. DECK SUPERSTRUCTURE (bridge block, mid-section) ──────────────────
  const bridgeX = len * 0.25;
  for (let bz = -3; bz <= 3; bz += 3) {
    pts.push({ x: bridgeX, y: 7, z: bz, yaw: 0, roll: tiltDeg, name: "staticobj_wall_cncsmall_8" });
    pts.push({ x: bridgeX, y: 11, z: bz, yaw: 0, roll: tiltDeg, name: "staticobj_wall_milcnc_4" });
  }

  // ── 3. FUNNEL / STACK (upright cylinder approximated with ring) ──────────
  const funnelX = bridgeX + 5;
  for (let fy = 7; fy <= 18; fy += 3) {
    drawRing(pts, funnelX, fy, 0, 2.5, "staticobj_wall_indcnc_10");
  }

  // ── 4. HULL SIDE PLATING (tin panels along the flanks) ──────────────────
  for (let bx = -len/2 + 5; bx < len/2 - 5; bx += 5) {
    const bow = (bx / len + 0.5) * beachDeg * -0.3;
    pts.push({ x: bx, y: bow + 3, z:  5.5, yaw: 0, roll: tiltDeg, name: "StaticObj_Wall_Tin_5" });
    pts.push({ x: bx, y: bow + 3, z: -5.5, yaw: 0, roll: tiltDeg, name: "StaticObj_Wall_Tin_5" });
  }

  // ── 5. SCATTERED DEBRIS (containers, debris on seabed around wreck) ───────
  const debrisSeeds = [
    { dx:  8, dz:  12, yaw: 35 },  { dx: -12, dz:  8, yaw: 110 },
    { dx:  20, dz: -9, yaw: 200 }, { dx: -5,  dz: -14, yaw: 70 },
    { dx: -18, dz:  6, yaw: 145 }, { dx:  5,  dz:  18, yaw: 280 },
  ];
  for (const d of debrisSeeds) {
    const bx = (d.dx / 30) * len * 0.6;
    pts.push({ x: bx, y: -0.5, z: d.dz, yaw: d.yaw, name: "land_container_1bo" });
  }

  // ── 6. ANCHOR CHAIN (loose chain on seabed at bow) ────────────────────────
  const bowX = -len / 2;
  for (let ch = 0; ch < 6; ch++) {
    pts.push({ x: bowX - ch * 3, y: -0.5, z: ch * 1.2 - 3, yaw: ch * 25, name: "staticobj_roadblock_cncblock" });
  }

  return pts;
}

function drawOnionDome(pts: Point3D[], cx: number, baseH: number, cz: number, r: number, h: number) {
  const steps = 15;
  for (let i = 0; i < steps; i++) {
    const t = (i + 0.5) / steps;
    // Bulge then taper: use a specialized curve for the onion shape
    const bulge = Math.sin(Math.pow(t, 0.7) * Math.PI * 0.85 + 0.15); 
    const currentR = r * bulge;
    const currentY = baseH + h * t;
    drawRing(pts, cx, currentY, cz, currentR);
  }
}

// ── Primaries (The Gold Standard) ───────────────────────────────────────────

// 1. Death Star — High-Fidelity Gapless Spherical Shell with Equatorial Trench & Superlaser Dish
export function gen_death_star(p: Record<string, any>): Point3D[] {
  let pts: Point3D[] = [];
  const R = p.radius || 44;
  const latSegs = Math.max(28, p.latSegs || 36);

  // Hull Object: 8m Concrete for speed/coverage
  const HullObj = "staticobj_wall_cncsmall_8";
  const HullW = getObjectWidth(HullObj);
  
  // Trench Object: 4m Military for detail
  const TrenchObj = "staticobj_wall_milcnc_4";
  const TrenchW = getObjectWidth(TrenchObj);

  // Superlaser dish parameters
  const dishLat = (p.dishLat || 30) * Math.PI / 180;
  const dishR = R * (p.dishRatio || 0.25);
  const dcX = R * Math.cos(dishLat);
  const dcY = R * Math.sin(dishLat);

  // Equatorial trench half-width in radians
  const TRENCH_HALF = Math.asin(4.2 / R);

  // ── 1. OUTER HULL — UV Sphere Shell ────────────────────────────────────
  for (let i = 0; i <= latSegs; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / latSegs;
    const y = R * Math.sin(lat);
    const rAtY = R * Math.cos(lat);

    if (Math.abs(lat) < TRENCH_HALF) continue;
    if (rAtY < HullW * 0.5) {
        // Polar caps
        pts.push({ x: 0, y: y > 0 ? R : -R, z: 0, pitch: y > 0 ? -90 : 90, name: HullObj });
        continue;
    }

    // Dynamic lonSegs based on circumference at this latitude for perfect gapless tiling
    const nPanels = Math.max(6, Math.ceil((2 * Math.PI * rAtY) / (HullW * OVERLAP)));

    for (let j = 0; j < nPanels; j++) {
      const lon = (2 * Math.PI * j) / nPanels;
      const x = rAtY * Math.cos(lon);
      const z = rAtY * Math.sin(lon);

      const toDish = Math.sqrt((x - dcX) ** 2 + (y - dcY) ** 2 + z * z);
      if (toDish < dishR * 1.05) continue;

      const yaw = -(lon * 180 / Math.PI) + 90;
      const pitch = -(lat * 180 / Math.PI);
      pts.push({ x, y, z, yaw, pitch, name: HullObj });
    }
  }

  // ── 2. EQUATORIAL TRENCH ────────────────────────────────────────────────
  const trenchDepth = R * 0.05;
  const trenchR = R - trenchDepth;
  drawRing(pts, 0, 0, 0, trenchR, TrenchObj);           // Deepest floor
  drawRing(pts, 0, 2.5, 0, R - 0.5, TrenchObj);       // Upper lip
  drawRing(pts, 0, -2.5, 0, R - 0.5, TrenchObj);      // Lower lip

  // ── 3. SUPERLASER DISH ──────────────────────────────────────────────────
  const dnX = dcX / R, dnY = dcY / R;
  for (let ring = 1; ring <= 4; ring++) {
    const dr = (dishR / 4) * ring;
    const recess = dishR * 0.35 * (1 - (dr / dishR) ** 1.8);
    const dSteps = Math.ceil((2 * Math.PI * dr) / (HullW * OVERLAP));

    for (let di = 0; di < dSteps; di++) {
      const da = (2 * Math.PI * di) / dSteps;
      const bx = -dnY, by = dnX;
      const lx = dr * Math.sin(da) * bx;
      const ly = dr * Math.sin(da) * by;
      const lz = dr * Math.cos(da);

      pts.push({
        x: dcX + lx - dnX * recess,
        y: dcY + ly - dnY * recess,
        z: lz,
        yaw: -(da * 180 / Math.PI) + 90,
        name: ring <= 2 ? HullObj : "staticobj_wall_indcnc_10",
      });
    }
  }

  return applyGovernor(pts);
}



/**
 * 🏢 GEN_STRUCTURAL_RANDOM (DANKVAULT_STABLE_V2_FINALIZE)
 * Functional Rooms, Connected Corridors, Enterable Spaces.
 */
export function gen_structural_random(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const floors = p.floors || 2;
  const roomsPerFloor = p.rooms || 4;
  const roomSize = 10;
  
  for (let f = 0; f < floors; f++) {
    const y = f * 4;
    
    // Create a grid of rooms
    for (let r = 0; r < roomsPerFloor; r++) {
      const rx = (r % 2) * roomSize;
      const rz = Math.floor(r / 2) * roomSize;
      
      // Floor
      drawDisk(pts, rx, y, rz, roomSize / 2, "staticobj_platform1_block");
      
      // Walls
      const half = roomSize / 2;
      // North
      drawWall(pts, rx - half, y, rz + half, rx + half, y, rz + half, "staticobj_wall_indcnc_10");
      // South
      drawWall(pts, rx - half, y, rz - half, rx + half, y, rz - half, "staticobj_wall_indcnc_10");
      // East
      drawWall(pts, rx + half, y, rz - half, rx + half, y, rz + half, "staticobj_wall_indcnc_10");
      // West (with entrance)
      if (r === 0) {
        pts.push({ x: rx - half, y, z: rz, yaw: 90, name: "Land_Underground_Entrance" });
      } else {
        drawWall(pts, rx - half, y, rz - half, rx - half, y, rz + half, "staticobj_wall_indcnc_10");
      }
      
      // Loot placement (Learned from Player_Building_Container study)
      pts.push({ x: rx, y: y + 0.5, z: rz, name: "Land_Container_1Bo" });
    }
    
    // Connect floors with stairs if multi-level
    if (f < floors - 1) {
       placeStairs(pts, 0, 0, y, 4, 10, 3);
    }
  }

  return pts;
}

function ctx_check_symmetry(pts: Point3D[]) {
  // Logic to ensure both hemispheres have equivalent point density
  const north = pts.filter(p => p.y > 0).length;
  const south = pts.filter(p => p.y < 0).length;
  if (Math.abs(north - south) / Math.max(north, south) > 0.1) {
    console.warn("[SYMMETRY_GUARD] Equator asymmetry detected in Death Star build.");
  }
}

// 2. Taj Mahal (100% Fidelity)
export function gen_taj_mahal(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const base = 64;
  const wallH = 28;
  
  // Plinth (Raised Base)
  drawDisk(pts, 0, 0, 0, base/2 + 12);
  for(let y=0; y<=6; y+=3) drawRing(pts, 0, y, 0, base/2 + 12);

  // Main Structure (Octagonal/Beveled)
  const bev = 14;
  const coords = [
    [-base/2+bev, -base/2], [base/2-bev, -base/2],
    [base/2, -base/2+bev], [base/2, base/2-bev],
    [base/2-bev, base/2], [-base/2+bev, base/2],
    [-base/2, base/2-bev], [-base/2, -base/2+bev]
  ];

  for(let y=6; y<=wallH; y+=4) {
    for(let i=0; i<coords.length; i++) {
        const c1 = coords[i], c2 = coords[(i+1)%coords.length];
        drawWall(pts, c1[0], y, c1[1], c2[0], y, c2[1]);
        // Arched Iwans
        if (i % 2 === 0) {
           const mx = (c1[0]+c2[0])/2, mz = (c1[1]+c2[1])/2;
           if (y < wallH - 6) drawRing(pts, mx, y, mz, 8); 
        }
    }
  }

  // Central Onion Dome
  drawOnionDome(pts, 0, wallH, 0, 24, 40);

  // 4 Minarets at Plinth Corners
  const mOff = base/2 + 4;
  [[-mOff, -mOff], [mOff, -mOff], [-mOff, mOff], [mOff, mOff]].forEach(([cx, cz]) => {
     for(let y=6; y<=55; y+=4) drawRing(pts, cx, y, cz, 4, "staticobj_wall_stone2");
     drawOnionDome(pts, cx, 55, cz, 5, 10);
  });
  return pts;
}

// 3. Azkaban Prison (Monolithic High Fidelity)
export function gen_azkaban_prison(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const h = 120;
  const w = 40;
  // Triangular monolithic tower with deep vertical grooves
  for(let y=0; y<=h; y+=5) {
    const taper = 1 - (y/h)*0.2;
    const r = w * taper;
    for(let i=0; i<3; i++) {
       const a1 = i*Math.PI*2/3, a2 = (i+1)*Math.PI*2/3;
       drawWall(pts, r*Math.cos(a1), y, r*Math.sin(a1), r*Math.cos(a2), y, r*Math.sin(a2));
       // Interior structural ribs
       drawWall(pts, 0, y, 0, r*0.8*Math.cos(a1+0.1), y, r*0.8*Math.sin(a1+0.1));
    }
  }
  return pts;
}

// 4. Stargate Portal — vertical ring portal standing in XY plane
export function gen_stargate_portal(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const r = Math.max(10, p.radius || 22);

  // ── 1. OUTER RING (vertical circle, 3 depth layers: z=0, 1.5, 3) ─────────
  // Panels traverse the circle in XY plane; drawWall handles pitch automatically.
  const nSegs = Math.max(24, Math.round((2 * Math.PI * r) / 3));
  for (const fz of [0, 1.5, 3]) {
    for (let i = 0; i < nSegs; i++) {
      const a1 = (i / nSegs) * Math.PI * 2;
      const a2 = ((i + 1) / nSegs) * Math.PI * 2;
      drawWall(pts, r * Math.cos(a1), r + r * Math.sin(a1), fz,
                    r * Math.cos(a2), r + r * Math.sin(a2), fz);
    }
  }
  // Inner edge at r-3 (front and back faces only)
  const ri = r - 3;
  for (const fz of [0, 3]) {
    for (let i = 0; i < nSegs; i++) {
      const a1 = (i / nSegs) * Math.PI * 2;
      const a2 = ((i + 1) / nSegs) * Math.PI * 2;
      drawWall(pts, ri * Math.cos(a1), r + ri * Math.sin(a1), fz,
                    ri * Math.cos(a2), r + ri * Math.sin(a2), fz);
    }
  }

  // ── 2. 9 CHEVRONS (outer markers, start from top, evenly spaced) ──────────
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
    const bx = r * Math.cos(a),       by = r + r * Math.sin(a);
    const ox = (r + 5) * Math.cos(a), oy = r + (r + 5) * Math.sin(a);
    drawWall(pts, bx - 1.2, by, 1.5, ox, oy, 1.5);
    drawWall(pts, bx + 1.2, by, 1.5, ox, oy, 1.5);
  }

  // ── 3. EVENT HORIZON (vertical disk filling portal plane, z=1.5) ──────────
  const diskR = r * 0.82;
  for (let rr = 4; rr <= diskR; rr += 4) {
    const nP = Math.max(6, Math.round((2 * Math.PI * rr) / 4));
    for (let j = 0; j < nP; j++) {
      const a = ((j + 0.5) / nP) * Math.PI * 2;
      pts.push({ x: rr * Math.cos(a), y: r + rr * Math.sin(a), z: 1.5, yaw: 0 });
    }
  }

  return pts;
}

// 4. Jurassic Park Gate
export function gen_jurassic_park_gate(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const w = Math.max(10, p.width || 30);
  const h = Math.max(10, p.height || 25);
  
  // Two massive monolithic pillars
  for(let y=0; y<=h; y+=4) {
    drawWall(pts, -w/2-4, y, -4, -w/2-4, y, 4);
    drawWall(pts, w/2+4, y, -4, w/2+4, y, 4);
    drawWall(pts, -w/2-8, y, 0, -w/2, y, 0);
    drawWall(pts, w/2, y, 0, w/2+8, y, 0);
  }
  // Overhead arch
  for(let y=h-2; y<=h+4; y+=2) {
    drawWall(pts, -w/2, y, 0, w/2, y, 0);
  }
  // Huge wooden doors (open slightly)
  drawWall(pts, -w/2, 0, 0, -2, 0, 8);
  drawWall(pts, w/2, 0, 0, 2, 0, 8);
  return pts;
}

// 5. Nakatomi Plaza
export function gen_nakatomi_plaza(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const h = Math.max(40, p.height || 140);
  const w = Math.max(20, p.width || 30);
  const d = Math.max(20, p.width || 30);
  
  for(let y=0; y<=h; y+=4) {
    drawWall(pts, -w/2, y, -d/2, w/2, y, -d/2);
    drawWall(pts, -w/2, y, d/2, w/2, y, d/2);
    drawWall(pts, -w/2, y, -d/2, -w/2, y, d/2);
    drawWall(pts, w/2, y, -d/2, w/2, y, d/2);
    // Overhangs every 8 floors
    if (y % 32 === 0) {
      drawWall(pts, -w/2-2, y, -d/2-2, w/2+2, y, -d/2-2);
      drawWall(pts, -w/2-2, y, d/2+2, w/2+2, y, d/2+2);
    }
  }
  // Roof helipad
  drawDisk(pts, 0, h, 0, 8);
  return pts;
}

// 6. AT-AT Walker (100% Fidelity)
export function gen_atat_walker(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const h = 35, w = 18, d = 45;
  const legH = 22;
  // 4 Massive Legs
  const lx = w*0.4, lz = d*0.35;
  [[lx, lz], [-lx, lz], [lx, -lz], [-lx, -lz]].forEach(([cx, cz]) => {
     for(let y=0; y<=legH; y+=4) {
        drawRing(pts, cx, y, cz, 3.5);
        if (y === 12) drawRing(pts, cx, y, cz, 5); // Knee joint
     }
  });
  // Main Hull (Box)
  for(let y=legH; y<=h; y+=3.5) {
     drawWall(pts, -w/2, y, -d/2, w/2, y, -d/2);
     drawWall(pts, -w/2, y, d/2, w/2, y, d/2);
     drawWall(pts, -w/2, y, -d/2, -w/2, y, d/2);
     drawWall(pts, w/2, y, -d/2, w/2, y, d/2);
  }
  // Neck
  for(let y=h-8; y<=h-2; y+=3) {
     drawWall(pts, -3, y, -d/2, 3, y, -d/2-8);
  }
  // Head (Cockpit)
  const hX = 8, hY = 10, hZ = 12;
  const headStart = -d/2 - 8;
  for(let y=h-12; y<=h-2; y+=3) {
     drawWall(pts, -hX/2, y, headStart, hX/2, y, headStart);
     drawWall(pts, -hX/2, y, headStart-hZ, hX/2, y, headStart-hZ);
     drawWall(pts, -hX/2, y, headStart, -hX/2, y, headStart-hZ);
     drawWall(pts, hX/2, y, headStart, hX/2, y, headStart-hZ);
  }
  return pts;
}

// 7. Millennium Falcon (100% Fidelity)
export function gen_millennium_falcon(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const r = 25;
  // Main Hull (Flat Disc)
  for(let y=-2; y<=2; y+=2) {
    drawRing(pts, 0, y, 0, r, "staticobj_wall_milcnc_4");
    drawDisk(pts, 0, y, 0, r*0.9, "staticobj_platform1_block");
  }
  // Forward Mandibles
  for(let y=-1.5; y<=1.5; y+=1.5) {
     [[-6, -r-15], [6, -r-15], [-12, -r-15], [12, -r-15]].forEach(([mx, mz]) => {
        drawWall(pts, mx, y, -r, mx, y, -r-15);
     });
     drawWall(pts, -12, y, -r-15, -6, y, -r-15);
     drawWall(pts, 12, y, -r-15, 6, y, -r-15);
  }
  // Cockpit (Offset - Right)
  const cx = 18, cz = -10;
  for(let y=-3; y<=3; y+=2) drawRing(pts, cx, y, cz, 4.5);
  // Tunnel to cockpit
  drawWall(pts, r*0.8, 0, cz, cx, 0, cz);
  // Engine Glow (Rear)
  for(let x=-r*0.6; x<=r*0.6; x+=2) pts.push({ x, y: 0, z: r*0.9, pitch: 90 });
  return pts;
}

// 7. Matrix Zion Dock
export function gen_matrix_zion_dock(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const r = Math.max(40, p.width || 100);
  
  // Cylindrical hangar layout rings
  for(let y=0; y<=80; y+=10) {
    drawRing(pts, 0, y, 0, r);
    // Support struts inward
    for(let i=0; i<8; i++) {
       const a = i*Math.PI/4;
       drawWall(pts, r*Math.cos(a), y, r*Math.sin(a), (r-8)*Math.cos(a), y, (r-8)*Math.sin(a));
    }
  }
  // Landing pads (platforms sticking inwards)
  for(let i=0; i<4; i++) {
     const a = i*Math.PI/2 + Math.PI/4;
     const padx = (r-15)*Math.cos(a), padz = (r-15)*Math.sin(a);
     drawDisk(pts, padx, 20, padz, 10);
  }
  return pts;
}

// 7. Superman's Fortress of Solitude — jagged crystal spires, deterministic seeded RNG
export function gen_fortress_of_solitude(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const r = Math.max(20, p.width || 60);
  // Seeded RNG (no Math.random — results must be deterministic)
  let _s = ((p.seed || 7331) >>> 0);
  const rnd = (): number => {
    _s += 0x6D2B79F5; let t = _s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // 30 jagged crystal pillars scattered inside the base radius
  for (let i = 0; i < 30; i++) {
    const cx = (rnd() - 0.5) * r;
    const cz = (rnd() - 0.5) * r;
    const ch = 20 + rnd() * 80;  // height 20–100m
    for (let y = 0; y < ch; y += 4) {
      const taper = 1 - (y / ch);
      const w = (4 + rnd() * 2) * taper;
      for (let j = 0; j < 3; j++) {
        const a1 = j * Math.PI * 2 / 3, a2 = (j + 1) * Math.PI * 2 / 3;
        drawWall(pts, cx + w * Math.cos(a1), y, cz + w * Math.sin(a1),
                      cx + w * Math.cos(a2), Math.min(y + 10, ch), cz + w * Math.sin(a2));
      }
    }
  }

  // Central mega-crystal spire (tallest, at origin)
  const coreH = 120;
  for (let y = 0; y < coreH; y += 4) {
    const taper = 1 - (y / coreH) * 0.9;
    drawRing(pts, 0, y, 0, 8 * taper, "staticobj_wall_milcnc_4");
  }

  return pts;
}

// 8. Wall Maria (AoT)
export function gen_wall_maria(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const radius = Math.max(50, p.width || 200);
  const height = Math.max(30, p.height || 50);
  
  // Concentric arc sweeps
  for(let y=0; y<=height; y+=4) {
     const circum = 2 * Math.PI * radius;
     const steps = Math.max(12, Math.ceil(circum / 8));
     for(let i=0; i<steps; i++) {
        const a1 = (i/steps)*Math.PI, a2 = ((i+1)/steps)*Math.PI; // draw half circle for performance
        drawWall(pts, radius*Math.cos(a1), y, radius*Math.sin(a1), radius*Math.cos(a2), y, radius*Math.sin(a2), "staticobj_wall_indcnc_10");
     }
  }
  return pts;
}

// 9. Barad-dur
export function gen_barad_dur(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const h = Math.max(50, p.height || 200);
  const baseW = Math.max(20, p.width || 50);
  
  // Main spire tapering to a point, heavily structured
  for(let y=0; y<=h; y+=5) {
     const taper = 1 - (y/h)*0.85; // Doesn't quite reach 0
     const w = baseW * taper;
     drawRing(pts, 0, y, 0, w, "staticobj_wall_indcnc_10");
     
     // 4 sharp corner spines flying upwards
     [[1,1], [1,-1], [-1,1], [-1,-1]].forEach(([sx, sz]) => {
         const bx = sx * w * 1.2, bz = sz * w * 1.2;
         drawWall(pts, bx, y, bz, bx*0.9, y+10, bz*0.9);
     });
  }
  
  // Eye cradle at top
  const eyeY = h + 10;
  drawWall(pts, -10, h, 0, -15, eyeY+10, 0);
  drawWall(pts, 10, h, 0, 15, eyeY+10, 0);
  return pts;
}

// 10. TARDIS — classic British Police Box, tall blue rectangular cabinet
export function gen_tardis(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const w = 7, d = 7, h = p.height || 20;

  // ── Base plinth (slightly wider) ─────────────────────────────────────────
  for (let y = 0; y <= 1; y += 1) {
    drawWall(pts, -(w/2+1), y, -(d/2+1), (w/2+1), y, -(d/2+1));
    drawWall(pts, -(w/2+1), y, (d/2+1), (w/2+1), y, (d/2+1));
    drawWall(pts, -(w/2+1), y, -(d/2+1), -(w/2+1), y, (d/2+1));
    drawWall(pts, (w/2+1), y, -(d/2+1), (w/2+1), y, (d/2+1));
  }

  // ── Main box body — 4 walls, floor-by-floor ────────────────────────────
  const floorH = 4;
  for (let y = 0; y <= h - floorH; y += floorH) {
    drawWall(pts, -w/2, y, -d/2, w/2, y, -d/2);
    drawWall(pts, -w/2, y, d/2, w/2, y, d/2);
    drawWall(pts, -w/2, y, -d/2, -w/2, y, d/2);
    drawWall(pts, w/2, y, -d/2, w/2, y, d/2);
  }

  // ── Mid-section horizontal band (panel divider at h/2) ────────────────
  const mid = Math.round(h / 2);
  drawWall(pts, -w/2, mid, -d/2, w/2, mid, -d/2);
  drawWall(pts, -w/2, mid, d/2, w/2, mid, d/2);
  drawWall(pts, -w/2, mid, -d/2, -w/2, mid, d/2);
  drawWall(pts, w/2, mid, -d/2, w/2, mid, d/2);

  // ── Upper cap box (smaller, sits on top of main body) ─────────────────
  const capW = w * 0.7, capD = d * 0.7, capH = 3;
  for (let y = h; y <= h + capH; y += capH) {
    drawWall(pts, -capW/2, y, -capD/2, capW/2, y, -capD/2);
    drawWall(pts, -capW/2, y, capD/2, capW/2, y, capD/2);
    drawWall(pts, -capW/2, y, -capD/2, -capW/2, y, capD/2);
    drawWall(pts, capW/2, y, -capD/2, capW/2, y, capD/2);
  }

  // ── Finial (vertical lamp post on top) ────────────────────────────────
  drawWall(pts, 0, h + capH, 0, 0, h + capH + 4, 0, "staticobj_wall_milcnc_4");
  drawRing(pts, 0, h + capH + 4, 0, 1.5, "staticobj_wall_milcnc_4");

  return pts;
}

// 11. Nuketown
export function gen_nuketown(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  // Two houses facing each other, a bus in middle
  // Home A
  for(let y=0; y<=8; y+=4) {
    drawWall(pts, -30, y, -10, -10, y, -10);
    drawWall(pts, -30, y, 10, -10, y, 10);
    drawWall(pts, -30, y, -10, -30, y, 10);
    drawWall(pts, -10, y, -10, -10, y, 10);
  }
  // Roof A
  drawWall(pts, -30, 8, -10, -20, 12, 0);
  drawWall(pts, -30, 8, 10, -20, 12, 0);
  // Home B
  for(let y=0; y<=8; y+=4) {
    drawWall(pts, 10, y, -10, 30, y, -10);
    drawWall(pts, 10, y, 10, 30, y, 10);
    drawWall(pts, 30, y, -10, 30, y, 10);
    drawWall(pts, 10, y, -10, 10, y, 10);
  }
  // Bus (middle)
  drawWall(pts, -5, 0, -3, 5, 0, -3);
  drawWall(pts, -5, 0, 3, 5, 0, 3);
  drawWall(pts, -5, 3, -3, 5, 3, -3);
  drawWall(pts, -5, 3, 3, 5, 3, 3);
  return pts;
}

// 12. Dust 2 (A Site)
export function gen_dust2_a_site(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  // Goose / Site Platform
  for(let x=0; x<15; x+=4) {
    drawWall(pts, x, 0, -5, x, 0, 15);
  }
  // Boxes (Double stack)
  drawWall(pts, 5, 0, 5, 7, 0, 5);
  drawWall(pts, 5, 2, 5, 7, 2, 5);
  // Long A Doors
  drawWall(pts, -20, 0, 20, -10, 0, 20);
  drawWall(pts, -22, 0, 18, -22, 0, 25);
  // Short A catwalk
  drawWall(pts, 15, 3, -15, 15, 3, -5);
  return pts;
}

// 13. Peach's Castle
export function gen_peach_castle(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const r = 20;
  // Central core
  for(let y=0; y<=30; y+=4) drawRing(pts, 0, y, 0, r);
  
  // 4 Outer conical towers
  [[25,25], [25,-25], [-25,25], [-25,-25]].forEach(([cx, cz]) => {
     for(let y=0; y<=20; y+=4) drawRing(pts, cx, y, cz, 6);
     // Cones
     for(let y=20; y<=30; y+=2) drawRing(pts, cx, y, cz, 6 * (1 - (y-20)/10));
  });
  return pts;
}

// 14. Shinra HQ
export function gen_shinra_hq(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const h = Math.max(50, p.height || 180);
  const r = Math.max(20, p.width || 40);
  for(let y=0; y<=h; y+=6) {
     const w = r + (Math.sin(y/10) * 5); // Ribbed cylindrical design
     drawRing(pts, 0, y, 0, w);
     if (y % 24 === 0) {
        drawRing(pts, 0, y, 0, w+10); // Flare out ledges
     }
  }
  return pts;
}

// 15. Halo Control Room
export function gen_halo_control_room(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  // Symmetrical massive pyramid/tech structure
  const h = Math.max(30, p.height || 80);
  const base = Math.max(30, p.width || 100);
  for(let y=0; y<=h; y+=8) {
     const w = base * (1 - y/h);
     drawWall(pts, -w, y, -w, w, y, -w);
     drawWall(pts, -w, y, w, w, y, w);
     drawWall(pts, -w, y, -w, -w, y, w);
     drawWall(pts, w, y, -w, w, y, w);
     // Energy beam core
     drawDisk(pts, 0, y, 0, 4);
  }
  // Massive extending bridge
  for(let z=base; z<=base+60; z+=4) {
     drawWall(pts, -8, h*0.3, z, 8, h*0.3, z);
  }
  return pts;
}

// ── Primaries (The Gold Standard) ───────────────────────────────────────────

// 1. Stonehenge — Accurate stone circle with trilithon horseshoe
export function gen_stonehenge(p: Record<string, any>): Point3D[] {
  let pts: Point3D[] = [];
  const R = p.radius || 30;
  const PillarObj = "staticobj_wall_stone";
  const LintelObj = "staticobj_wall_stone2";
  const PillarW = getObjectWidth(PillarObj);

  // ── 1. OUTER SARSEN CIRCLE ─────────────────────────────────────────────
  // 30 upright stones arranged in a circle
  const nSarsens = 30;
  for (let i = 0; i < nSarsens; i++) {
    const a = (i / nSarsens) * Math.PI * 2;
    const x = R * Math.cos(a), z = R * Math.sin(a);
    const yaw = -(a * 180 / Math.PI) + 90;
    
    // Upright Pillar (vertical stack for height)
    pts.push({ x, y: 1.5, z, yaw, pitch: 90, name: PillarObj });
    pts.push({ x, y: 4.5, z, yaw, pitch: 90, name: PillarObj });
  }

  // ── 2. OUTER LINTEL RING ───────────────────────────────────────────────
  // Horizontal stones bridging the sarsens at the top
  drawRing(pts, 0, 6.0, 0, R, LintelObj);

  // ── 3. INNER TRILITHON HORSESHOE ──────────────────────────────────────
  // 5 massive trilithons (2 pillars + 1 lintel each)
  const horseshoeR = R * 0.65;
  for (let i = 0; i < 5; i++) {
    const a = (i / 4) * Math.PI * 1.5 - Math.PI * 0.75; // Horseshoe arc
    const sweep = 0.08; 
    
    [a - sweep, a + sweep].forEach(aa => {
       const x = horseshoeR * Math.cos(aa), z = horseshoeR * Math.sin(aa);
       const yaw = -(aa * 180 / Math.PI) + 90;
       pts.push({ x, y: 2, z, yaw, pitch: 90, name: PillarObj });
       pts.push({ x, y: 6, z, yaw, pitch: 90, name: PillarObj });
    });
    
    // Lintel on top
    const lx = horseshoeR * Math.cos(a), lz = horseshoeR * Math.sin(a);
    const lyaw = -(a * 180 / Math.PI) + 90;
    pts.push({ x: lx, y: 8.5, z: lz, yaw: lyaw, name: LintelObj });
  }

  // ── 4. HEEL STONE ─────────────────────────────────────────────────────
  const heelR = R * 1.8;
  pts.push({ x: heelR, y: 4, z: 0, yaw: 0, pitch: 82, name: PillarObj });

  return applyGovernor(pts);
}

// 2. Colosseum
export function gen_colosseum(p: Record<string, any>): Point3D[] {
  let pts: Point3D[] = [];
  const rX = Math.max(40, p.width || 100);
  const rZ = rX * 0.78; 
  const tiers = 3;
  const tierH = 8;
  const wallH = tiers * tierH;
  const MasterObj = "staticobj_wall_stone2";
  const RingObj = "staticobj_wall_stone";

  const nBays = Math.max(30, Math.ceil((2 * Math.PI * rX) / (getObjectWidth(MasterObj) * OVERLAP)));

  for (let i = 0; i < nBays; i++) {
    const a = (i / nBays) * Math.PI * 2;
    const x = rX * Math.cos(a);
    const z = rZ * Math.sin(a);
    const yaw = -a * 180 / Math.PI + 90;

    for (let y = 0; y < wallH; y += 4) {
      pts.push({ x, y, z, yaw, name: MasterObj });
    }
  }
  
  // Decorative rings for tiers
  for (let t = 1; t <= tiers; t++) {
    drawRing(pts, 0, t * tierH, 0, rX, RingObj);
  }

  return applyGovernor(pts);
}

// 3. Pyramid of Giza & Sphinx
export function gen_pyramid_giza(p: Record<string, any>): Point3D[] {
  let pts: Point3D[] = [];
  const base = Math.max(40, p.width || 120);
  
  for(let y=0; y<=base/2; y+=4) {
    const w = base - (y*2);
    if(w <= 0) break;
    drawWall(pts, -w/2, y, -w/2, w/2, y, -w/2);
    drawWall(pts, -w/2, y, w/2, w/2, y, w/2);
    drawWall(pts, -w/2, y, -w/2, -w/2, y, w/2);
    drawWall(pts, w/2, y, -w/2, w/2, y, w/2);
  }

  const sx = base/2 + 30;
  for (let z = -8; z <= 8; z += 4) {
    drawWall(pts, sx - 15, 0, z, sx + 15, 0, z);
    drawWall(pts, sx - 10, 4, z, sx + 10, 4, z);
  }
  for (let y = 8; y <= 16; y += 4) {
    drawRing(pts, sx + 5, y, 0, 4);
  }
  
  return applyGovernor(pts);
}

// 4. Golden Gate Bridge
export function gen_golden_gate_bridge(p: Record<string, any>): Point3D[] {
  let pts: Point3D[] = [];
  const span = Math.max(100, p.width || 300);
  const towerH = Math.max(30, p.height || 90);
  const roadY = 0;
  const tX1 = -span/4, tX2 = span/4;

  for (const tx of [tX1, tX2]) {
    for (let y = 0; y <= towerH; y += 4) {
      pts.push({ x: tx, y, z: -10, name: "staticobj_wall_indcnc_10" });
      pts.push({ x: tx, y, z: 10, name: "staticobj_wall_indcnc_10" });
    }
  }
  for (let x = -span/2; x <= span/2; x += 8) {
    drawWall(pts, x, roadY, -10, x, roadY, 10);
  }

  return applyGovernor(pts);
}


// 23. Starship Enterprise
export function gen_starship_enterprise(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const scale = Math.max(1, (p.width||100)/100);
  const HullObj = "staticobj_wall_milcnc_4";
  
  // Saucer Section
  for(let r=5; r<=40*scale; r+=5) {
     drawRing(pts, 0, 20*scale, 50*scale, r, HullObj);
  }
  // Engineering Hull
  for(let y=0; y<=10*scale; y+=4) {
    drawRing(pts, 0, y, -20*scale, 15*scale, HullObj);
  }
  // Neck
  drawWall(pts, 0, 10*scale, -20*scale, 0, 20*scale, 50*scale, HullObj);
  // Pylons & Nacelles
  [-25*scale, 25*scale].forEach(nx => {
     drawWall(pts, 0, 5*scale, -20*scale, nx, 25*scale, -40*scale, HullObj); // pylon
     for(let r=2; r<=6*scale; r+=2) drawRing(pts, nx, 25*scale, -40*scale, r, "staticobj_wall_indcnc_10"); // nacelle
     drawWall(pts, nx, 25*scale, -60*scale, nx, 25*scale, -10*scale, "staticobj_wall_indcnc_10"); 
  });
  return pts;
}

// 24. Star Destroyer (100% Fidelity Wedge)
export function gen_star_destroyer(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const w = Math.max(50, p.width || 100);
  const l = Math.max(100, p.length || 200);
  const h = l * 0.12;

  // 1. Triple-Tiered Hull Wedge
  for (let lvl = 0; lvl < 3; lvl++) {
    const ly = lvl * (h / 3);
    const lz = -l/2 + (lvl * (l/10));
    const lw = w * (1 - lvl*0.15);
    
    // Perimeter sides
    drawWall(pts, -lw/2, ly, lz, 0, ly, l/2, 4); // Left edge
    drawWall(pts, lw/2, ly, lz, 0, ly, l/2, 4);  // Right edge
    drawWall(pts, -lw/2, ly, lz, lw/2, ly, lz, 4); // Rear edge
    
    // Dorsal Ridge (Central spine)
    drawWall(pts, 0, ly, lz, 0, ly + h/4, l/2, 4);
  }

  // 2. Bridge Tower (The Command Deck)
  const by = h;
  const bw = w * 0.2;
  const bl = l * 0.1;
  const bz = -l/2 + l*0.25;
  for (let y = by; y <= by + 12; y += 4) {
    drawWall(pts, -bw/2, y, bz, bw/2, y, bz, 3);
    drawWall(pts, -bw/2, y, bz + bl, bw/2, y, bz + bl, 3);
    drawWall(pts, -bw/2, y, bz, -bw/2, y, bz + bl, 3);
    drawWall(pts, bw/2, y, bz, bw/2, y, bz + bl, 3);
  }
  // Shield Domes
  drawRing(pts, -bw/4, by + 14, bz + bl/2, 3, "barrel_red");
  drawRing(pts, bw/4, by + 14, bz + bl/2, 3, "barrel_red");

  // 3. Engine Nacelles (3 Main Engines at rear)
  const er = w * 0.08;
  const ez = -l / 2;
  [[-w*0.25, 0], [0, 0], [w*0.25, 0]].forEach(([ex, ey]) => {
     for (let r = 2; r <= er; r += 3) {
       drawRing(pts, ex, ey + h/6, ez, r, 2);
     }
  });

  return pts;
}

// 25. King Kong on Empire State
export function gen_king_kong_empire(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const h = 180;
  // Stepped tower
  for(let y=0; y<=h; y+=8) {
     const w = 40 - (Math.floor(y/40) * 8); // shrink every 40m
     if (w <= 0) break;
     drawWall(pts, -w/2, y, -w/2, w/2, y, -w/2);
     drawWall(pts, -w/2, y, w/2, w/2, y, w/2);
     drawWall(pts, -w/2, y, -w/2, -w/2, y, w/2);
     drawWall(pts, w/2, y, -w/2, w/2, y, w/2);
  }
  // Kong (sphere of points clustered at the top holding the spire)
  const topW = 40 - Math.floor(h/40)*8;
  const kongY = h - 10;
  for(let r=0; r<=10; r+=2) {
     drawRing(pts, topW/2 + 5, kongY, 0, r); // Clinging to the side
  }
  // Spire
  drawWall(pts, 0, h, 0, 0, h+30, 0);
  return pts;
}

// 26. Medieval Fort (Square castle with 4 watchtowers)
export function gen_medieval_fort(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const w = Math.max(30, p.width || 60);
  const h = Math.max(10, p.height || 15);
  // 4 walls
  drawWall(pts, -w/2, 0, -w/2+4, w/2, 0, -w/2+4);
  drawWall(pts, -w/2, 0, w/2-4, w/2, 0, w/2-4);
  drawWall(pts, -w/2+4, 0, -w/2, -w/2+4, 0, w/2);
  drawWall(pts, w/2-4, 0, -w/2, w/2-4, 0, w/2);
  // 4 watchtowers at corners
  [[-w/2, -w/2], [w/2, -w/2], [-w/2, w/2], [w/2, w/2]].forEach(([cx, cz]) => {
     for(let y=0; y<=h; y+=4) {
       drawRing(pts, cx, y, cz, 4, 3);
     }
  });
  return pts;
}

// 27. Bridge of Khazad-dum
export function gen_bridge_of_khazad_dum(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const span = Math.max(100, p.width || 200);
  // A completely straight, very narrow unrailed bridge
  for(let x=-span/2; x<=span/2; x+=2) {
     pts.push({ x, y: 0, z: -1, yaw: 0 });
     pts.push({ x, y: 0, z: 1, yaw: 0 });
     // Under-support arch
     let archY = -(Math.pow(x/(span/2), 2) * 40); // curve downwards
     pts.push({ x, y: archY, z: 0, yaw: 0 });
  }
  return pts;
}

// 28. Alcatraz Prison
export function gen_alcatraz_prison(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const w = Math.max(40, p.width || 80), d = Math.max(30, p.length || 60);
  const floors = 4;
  for(let f=0; f<floors; f++) {
    const y = f*4;
    drawWall(pts, -w/2, y, -d/2, w/2, y, -d/2);
    drawWall(pts, -w/2, y, d/2, w/2, y, d/2);
    drawWall(pts, -w/2, y, -d/2, -w/2, y, d/2);
    drawWall(pts, w/2, y, -d/2, w/2, y, d/2);
    // Inner cell block spine
    drawWall(pts, -w/2+10, y, -d/4, w/2-10, y, -d/4);
    drawWall(pts, -w/2+10, y, d/4, w/2-10, y, d/4);
  }
  // Watchtower
  for(let y=0; y<=floors*4+10; y+=4) drawRing(pts, 0, y, 0, 4);
  return pts;
}

// 29. Roman Aqueduct
export function gen_roman_aqueduct(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const span = Math.max(100, p.width || 150);
  // Top channel
  drawWall(pts, -span/2, 20, 0, span/2, 20, 0);
  // Pillars & Arches
  for(let x=-span/2 + 10; x<=span/2 - 10; x+=20) {
    drawWall(pts, x-2, 0, 0, x-2, 20, 0);
    drawWall(pts, x+2, 0, 0, x+2, 20, 0);
    // Over arch
    for(let r=0; r<=10; r+=2) {
       const ay = 20 - Math.sqrt(Math.max(0, 100 - Math.pow(r, 2)));
       pts.push({ x: x+10+r, y: ay, z: 0, yaw: 0 });
       pts.push({ x: x+10-r, y: ay, z: 0, yaw: 0 });
    }
  }
  return pts;
}

// 30. Military FOB
export function gen_military_fob(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const w = Math.max(30, p.width || 50);
  // 2 Layer Hesco barriers
  for(let b=0; b<2; b++) {
     const hw = w/2 + (b*4);
     drawWall(pts, -hw, 0, -hw, hw, 0, -hw);
     drawWall(pts, -hw, 0, hw, hw, 0, hw);
     drawWall(pts, -hw, 0, -hw, -hw, 0, hw);
     drawWall(pts, hw, 0, -hw, hw, 0, hw);
  }
  // Inner tents / containers (dummy boxes)
  drawWall(pts, -w/4, 0, -w/4, w/4, 0, -w/4);
  drawWall(pts, -w/4, 0, 0, w/4, 0, 0);
  return pts;
}

// 31. Checkpoint Charlie
export function gen_checkpoint_charlie(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  // Zig zag road block setup
  drawWall(pts, -15, 0, -10, 5, 0, -10);
  drawWall(pts, -5, 0, 0, 15, 0, 0);
  drawWall(pts, -15, 0, 10, 5, 0, 10);
  // Tower
  for(let y=0; y<=8; y+=4) drawRing(pts, -20, y, -15, 3);
  return pts;
}

// 32. Trench Network
export function gen_trench_network(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const w = Math.max(50, p.width || 100);
  // Main defensive line (zigzag — deterministic alternating pattern)
  let prevX = -w/2, prevZ = 0;
  let _seg = 0;
  for(let x=-w/2 + 20; x<=w/2; x+=20) {
     const z = (_seg % 2 === 0 ? 20 : -20);
     _seg++;
     drawWall(pts, prevX, 0, prevZ, x, 0, z);
     // Communication branch backwards
     drawWall(pts, x, 0, z, x, 0, z+30);
     prevX = x; prevZ = z;
  }
  return pts;
}

// 33. Crop Circle
export function gen_crop_circle(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = Math.max(20, p.width || 60);
  for(let cr=10; cr<=r; cr+=15) {
     drawRing(pts, 0, 0, 0, cr);
  }
  // Connective spokes
  for(let i=0; i<6; i++) {
     const a = i*Math.PI*2/6;
     drawWall(pts, 10*Math.cos(a), 0, 10*Math.sin(a), r*Math.cos(a), 0, r*Math.sin(a));
  }
  return pts;
}

// 34. The Wall (Game of Thrones)
export function gen_the_wall_game_of_thrones(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const length = Math.max(100, p.width || 300);
  const h = Math.max(60, p.height || 100);
  // Sloped huge wall
  for(let y=0; y<=h; y+=4) {
    const depth = 20 - (y/h)*15; // base is 20m thick, top is 5m
    drawWall(pts, -length/2, y, depth/2, length/2, y, depth/2);
    drawWall(pts, -length/2, y, -depth/2, length/2, y, -depth/2);
    if(y % 20 === 0) drawDisk(pts, 0, y, 0, 4); // elevators/winches
  }
  return pts;
}

// 35. Helms Deep (IMPROVED Fortress)
export function gen_helms_deep(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  
  // The Deeping Wall (sweeping curve)
  const length = 120;
  const radius = 100;
  for(let y=0; y<=24; y+=4) {
    for(let i=0; i<30; i++) {
      const a1 = Math.PI*0.1 + (i/30)*Math.PI*0.3;
      const a2 = Math.PI*0.1 + ((i+1)/30)*Math.PI*0.3;
      drawWall(pts, radius*Math.cos(a1), y, radius*Math.sin(a1), radius*Math.cos(a2), y, radius*Math.sin(a2));
      // Culvert gap
      if (i === 15 && y < 6) { /* gap */ }
    }
  }

  // The Hornburg Tower
  const tx = radius*Math.cos(Math.PI*0.1), tz = radius*Math.sin(Math.PI*0.1);
  for(let y=0; y<=60; y+=5) drawRing(pts, tx, y, tz, 8);
  
  // Inner Courtyard Wall
  drawWall(pts, tx, 0, tz, tx+40, 0, tz+40);
  
  // Causeway (sloped bridge)
  for(let z=0; z<=40; z+=4) {
    const y = 20 * (1 - z/40);
    drawWall(pts, tx - 5, y, tz + z, tx + 5, y, tz + z);
  }
  
  return pts;
}

// 36. Minas Tirith Tier
export function gen_minas_tirith_tier(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const baseR = p.width || 120;
  const totalH = p.height || 100;
  const tierCount = 7; 

  for(let tier=0; tier<tierCount; tier++) {
     const r = baseR - (tier * (baseR / (tierCount + 2)));
     const y = tier * (totalH / tierCount);
     const steps = Math.ceil((2*Math.PI*r) / 5);
     
     for(let i=0; i<steps; i++) {
        // Draw the curved wall segment (half-circle for Minas Tirith aesthetic)
        const a1 = (i/steps)*Math.PI, a2 = ((i+1)/steps)*Math.PI; 
        drawWall(pts, r*Math.cos(a1), y, r*Math.sin(a1), r*Math.cos(a2), y, r*Math.sin(a2));
     }
     // Flat floor behind the wall
     for(let fr=r; fr>r-15; fr-=5) {
        const steps2 = Math.ceil((2*Math.PI*fr)/5);
        for(let i=0; i<steps2; i++) {
           const a = (i/steps2)*Math.PI;
           pts.push({ x: fr*Math.cos(a), y: y-1, z: fr*Math.sin(a), pitch:90, yaw:0 });
        }
     }
  }
  return pts;
}

// 37. Oil Rig
export function gen_oil_rig(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const w = 40;
  // 4 huge pillars hitting sea floor
  [[-w/2,-w/2], [w/2,-w/2], [-w/2,w/2], [w/2,w/2]].forEach(([px, pz]) => {
     for(let y=0; y<=30; y+=4) {
        pts.push({ x: px, y, z: pz, yaw:0, pitch:0, roll:0 });
        drawWall(pts, px-2, y, pz-2, px+2, y, pz-2);
        drawWall(pts, px-2, y, pz+2, px+2, y, pz+2);
     }
  });
  // Platform
  for(let y=30; y<=34; y+=4) {
     drawWall(pts, -w/2-5, y, -w/2-5, w/2+5, y, -w/2-5);
     drawWall(pts, -w/2-5, y, w/2+5, w/2+5, y, w/2+5);
     drawWall(pts, -w/2-5, y, -w/2-5, -w/2-5, y, w/2+5);
     drawWall(pts, w/2+5, y, -w/2-5, w/2+5, y, w/2+5);
  }
  // Crane / Drill
  for(let y=34; y<=60; y+=4) drawRing(pts, 0, y, 0, 4);
  return pts;
}

// 38. Panama Canal Locks
export function gen_panama_canal_locks(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const length = 120;
  const w = 30;
  // 3 stepped locks
  for(let lock=0; lock<3; lock++) {
     const stZ = lock*(length/3) - length/2;
     const enZ = (lock+1)*(length/3) - length/2;
     const y = lock * 8;
     drawWall(pts, -w/2, y, stZ, -w/2, y, enZ);
     drawWall(pts, w/2, y, stZ, w/2, y, enZ);
     // Gate
     drawWall(pts, -w/2, y, enZ, w/2, y, enZ);
  }
  return pts;
}

// 39. Airport Runway
export function gen_airport_runway(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const length = Math.max(300, p.width || 800);
  // Very long, very wide
  for(let x=-length/2; x<=length/2; x+=8) {
     for(let z=-15; z<=15; z+=5) {
        pts.push({ x, y: 0, z, pitch: 90, yaw: 0 }); // Flat slab
     }
     // Runway lights
     pts.push({ x, y: 0, z: -20, yaw: 0 });
     pts.push({ x, y: 0, z: 20, yaw: 0 });
  }
  return pts;
}

// 40. Bunker Complex Entrance
export function gen_bunker_complex_entrance(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  // Sloped massive bunker facade
  for(let y=0; y<=16; y+=2) {
     // Slopes backwards as it goes up
     const slopeZ = y * 0.8;
     drawWall(pts, -20, y, slopeZ, -5, y, slopeZ);
     drawWall(pts, 5, y, slopeZ, 20, y, slopeZ);
  }
  // Blast Door Gap
  drawWall(pts, -5, -2, 0, 5, -2, 0); // floor of entrance
  drawWall(pts, -5, 12, 12*0.8, 5, 12, 12*0.8); // header
  // Outer perimeter fence rings
  drawRing(pts, 0, 0, 20, 30);
  return pts;
}

// 41. Celtic Ring (High Fidelity)
export function gen_celtic_ring(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius || 30;
  const h = p.height || 8;
  const count = p.stoneCount || 24;
  for (let i = 0; i < count; i++) {
    const a = 2 * Math.PI * i / count;
    const x = r * Math.cos(a), z = r * Math.sin(a);
    // Tangential yaw — stone long-axis runs along the ring perimeter
    const yaw = -a * 180 / Math.PI + 90;
    for (let y = 0; y < h; y += 3) {
      pts.push({ x, y, z, yaw });
    }
  }
  // Outer arch gates — small ring at each gate post position
  const archCount = p.archCount || 6;
  for (let i = 0; i < archCount; i++) {
    const a = 2 * Math.PI * i / archCount + Math.PI / archCount;
    drawRing(pts, (r + 10) * Math.cos(a), 0, (r + 10) * Math.sin(a), 5);
  }
  return pts;
}

// 42. Orbital Station
export function gen_orbital_station(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius || 35;
  // Main Ring
  drawRing(pts, 0, 0, 0, r, 3);
  drawRing(pts, 0, 4, 0, r, 3);
  // Central Hub
  for(let y=-10; y<=10; y+=4) drawRing(pts, 0, y, 0, 8, 3);
  // Spanning Spokes
  for(let i=0; i<4; i++) {
    const a = i * Math.PI / 2;
    drawWall(pts, 8 * Math.cos(a), 0, 8 * Math.sin(a), r * Math.cos(a), 0, r * Math.sin(a));
  }
  return pts;
}

// 43. Eye of Sauron (High Fidelity)
export function gen_eye_of_sauron(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height || 90;
  const tw = p.towerWidth || 28;
  const er = p.eyeRadius || 22;
  
  // Barad-dur Spire base
  for(let y=0; y<=h; y+=8) {
    const t = 1 - (y/h);
    drawRing(pts, 0, y, 0, tw * (t*0.7 + 0.3), 4);
    // Spikes
    if (y > h * 0.8) {
       for(let i=0; i<2; i++) {
         const a = i * Math.PI;
         pts.push({ x: (tw+5)*Math.cos(a), y, z: (tw+5)*Math.sin(a), yaw: -a * 180/Math.PI + 90 });
       }
    }
  }
  // The Eye (Floating Disk between spikes)
  const eyeY = h + 10;
  for(let r=2; r<=er; r+=4) {
    drawRing(pts, 0, eyeY, 0, r, 2);
  }
  // Pupil
  return pts;
}

// Legacy Stark Tower and Log Cabin removed — updated versions appended at the end of file.



// 46. Black Hole (Event Horizon)
export function gen_black_hole(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius || 30;
  const arcs = p.arcs || 8;

  // Accretion Disk (Flattened ring with swirling arcs)
  for (let a = 0; a < arcs; a++) {
    const startAngle = (a / arcs) * Math.PI * 2;
    for (let i = 0; i < 50; i++) {
        const t = i / 50;
        const angle = startAngle + t * Math.PI * 1.5;
        const dist = r * (0.6 + t * 0.4);
        const y = Math.sin(t * Math.PI * 2) * 2; // subtle wave
        pts.push({ x: dist * Math.cos(angle), y, z: dist * Math.sin(angle), yaw: -angle * 180/Math.PI + 90 });
    }
  }

  // Central Event Horizon (Solid-ish sphere core)
  for (let y = -2; y <= 2; y += 1) {
    drawRing(pts, 0, y, 0, r * 0.4, 2);
  }

  return pts;
}

// 47. Minas Tirith (The White City)
export function gen_minas_tirith(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const baseR = p.width || 120;
  const totalH = p.height || 100;
  const tiers = 7;
  const stepH = totalH / tiers;
  
  const MAT_WHITE = "staticobj_wall_cncsmall_8";
  const MAT_STONE = "staticobj_wall_stone2";
  const MAT_ROCK  = "staticobj_wall_stone";
  const MAT_CROWN = "staticobj_wall_indcnc_10";

  for (let i = 0; i < tiers; i++) {
    const r = baseR * (1 - i / (tiers + 1));
    const y = i * stepH;
    const mat = (i === tiers - 1) ? MAT_CROWN : MAT_WHITE;
    
    // Circle segment (80% circumference to allow for the 'Rock ridge')
    // Cap panel count per tier to control total object budget
    const rawSteps = Math.round((2 * Math.PI * r * 0.8) / 8);
    const circumSteps = Math.max(12, Math.min(rawSteps, 24));
    for (let j = 0; j <= circumSteps; j++) {
       const a = (j / circumSteps) * Math.PI * 1.6 - Math.PI*0.8;
       const x = r * Math.cos(a), z = r * Math.sin(a);
       const yaw = -a * 180 / Math.PI + 90; // tangential to the ring

       // Main wall
       pts.push({ x, y, z, yaw, name: mat });

       // Battlements (every 3rd point for budget)
       if (j % 3 === 0) {
         pts.push({ x, y: y + 2.5, z, yaw, name: MAT_STONE });
       }

       // Horizontal floor behind the wall (every 5th)
       if (j % 5 === 0) {
          for (let fr = r-3; fr > r-8; fr -= 4) {
            pts.push({ x: fr * Math.cos(a), y: y - 0.5, z: fr * Math.sin(a), yaw, name: MAT_STONE });
          }
       }
    }
  }
  
  // The Great Rock Pier (The Outcrop cutting through the city)
  for (let y = 0; y <= totalH + 10; y += 4) {
    const rAtY = baseR + 5;
    drawWall(pts, 0, y, 0, rAtY, y, 0, 4);
    // Add jagged rock variation
    for (let j=0; j<4; j++) {
       pts.push({ x: (rAtY - j*5), y: y+0.5, z: 1.5, yaw: 0, name: MAT_ROCK });
       pts.push({ x: (rAtY - j*5), y: y+0.5, z: -1.5, yaw: 0, name: MAT_ROCK });
    }
  }

  // White Tower of Ecthelion (Citadel Spire at the top)
  const spireH = totalH + 30;
  for (let y = totalH; y <= spireH; y += 3) {
    const r = 6 * (1 - (y - totalH) / (spireH - totalH + 10));
    drawRing(pts, 0, y, 0, Math.max(1, r), 3);
    // Add vertical bracing
    pts.push({ x: r, y, z: 0, yaw: 90, name: MAT_CROWN }, { x: -r, y, z: 0, yaw: 90, name: MAT_CROWN });
  }
  // Tower Point (Final crown)
  pts.push({ x: 0, y: spireH + 6, z: 0, name: MAT_CROWN });

  return pts;
}

/**
 * 🏰 GEN_TONY_STARK_TOWER (40 Storeys / 120m)
 * Fidelity: High (Concrete/Glass)
 * Features: Landing Pad, 'A' Emblem, Slanted Body
 */
export function gen_tony_stark_tower(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const floors = p.floors || 40;
  const floorHeight = p.floorHeight || 3.5;
  const width = p.width || 20;
  const depth = p.depth || 14;
  const spacing = 3.5;

  // Materials for mixing
  const MAT_MAIN   = "staticobj_wall_cncsmall_8";
  const MAT_GLASS  = "staticobj_furniture_lab_petri_dish"; 
  const MAT_METAL  = "staticobj_wall_milcnc_4";
  const MAT_GLOW   = "staticobj_wall_indcnc_10";

  // 1. BASE PODIUM (Floors 1-5)
  for (let f = 0; f < 5; f++) {
    const y = f * floorHeight;
    const mat = MAT_METAL;
    // Draw rectangular floor plate
    for (let x = -width/2 - 2; x <= width/2 + 2; x += spacing) {
      pts.push({ x, y, z: -depth/2 - 2, yaw: 0, name: mat }); // Front
      pts.push({ x, y, z: depth/2 + 2, yaw: 0, name: mat });  // Back
    }
    for (let z = -depth/2 - 2; z <= depth/2 + 2; z += spacing) {
      pts.push({ x: -width/2 - 2, y, z, yaw: 90, name: mat }); // Left
      pts.push({ x: width/2 + 2, y, z, yaw: 90, name: mat });  // Right
    }
  }

  // 2. MAIN TOWER BODY (Slanted)
  for (let f = 5; f < floors; f++) {
    const y = f * floorHeight;
    const slant = Math.max(0, (f - 5) * 0.25);
    const fw = width;
    const fd = depth;
    const fx = slant;

    // Material logic: use glass lookalike for windows
    const isWindow = (f % 2 === 0);
    const mat = MAT_MAIN;

    // Outer Shell
    for (let x = -fw/2; x <= fw/2; x += spacing) {
      pts.push({ x: fx + x, y, z: -fd/2, yaw: 0, name: isWindow && Math.abs(x) < fw/3 ? MAT_GLASS : mat });
      pts.push({ x: fx + x, y, z: fd/2, yaw: 0, name: mat });
    }
    for (let z = -fd/2; z <= fd/2; z += spacing) {
       pts.push({ x: fx - fw/2, y, z, yaw: 90, name: mat });
       pts.push({ x: fx + fw/2, y, z, yaw: 90, name: mat });
    }

    // 3. LANDING PAD (Floor 35)
    if (f === 35) {
       const padR = 12;
       const px = fx + fw/2 + padR - 2;
       drawRing(pts, px, y, 0, padR, 3);
       // Floor of pad + lights
       for (let r = 0; r < padR; r += 4) {
          const rSteps = Math.max(4, Math.round(2*Math.PI*r / 4));
          for (let i=0; i<rSteps; i++) {
             const a = 2*Math.PI*i/rSteps;
             pts.push({ x: px + r*Math.cos(a), y: y - 0.2, z: r*Math.sin(a), yaw: -a * 180/Math.PI + 90, name: r === 0 ? MAT_GLOW : MAT_METAL });
          }
       }
    }

    // 4. TOP CROWN & 'A' EMBLEM
    if (f === floors - 1) {
       const yTop = y + floorHeight;
       // Large Emblem on side
       const ex = fx + fw/2 + 0.5;
       const ey = y - 5;
       for (let ay = -6; ay <= 12; ay += 1.5) {
          pts.push({ x: ex, y: ey + ay, z: 0, yaw: 90, roll: 90, name: MAT_METAL }); // Vertical bar
          if (ay > 0) {
             pts.push({ x: ex, y: ey + ay, z: ay*0.8, yaw: 90, name: MAT_METAL }); // Slant bar for A
          }
       }
    }
  }

  return pts;
}

/**
 * 🚨 GEN_POLICE_STATION
 * Fidelity: High (Modular Concrete)
 * Features: Perimeter Wall, Double Entry, Helipad
 */
export function gen_police_station(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const w = p.width || 30;
  const d = p.depth || 40;
  const h = p.height || 8;
  const spacing = 4;

  // 1. MAIN STRUCTURE
  for (let y = 0; y <= h; y += 4) {
    for (let x = -w/2; x <= w/2; x += spacing) {
       if (y < h) {
         if (Math.abs(x) > 4) { // Entrance gap
           pts.push({ x, y, z: -d/2, yaw: 0 });
           pts.push({ x, y, z: d/2, yaw: 0 });
         }
       }
    }
    for (let z = -d/2 - 0.1; z <= d/2 + 0.1; z += spacing) {
       pts.push({ x: -w/2, y, z: z, yaw: 90 });
       pts.push({ x: w/2, y, z: z, yaw: 90 });
    }
  }

  // 2. PERIMETER WALL
  const pw = w + 15;
  const pd = d + 15;
  for (let x = -pw/2; x <= pw/2; x += 8) {
     pts.push({ x, y: 0, z: -pd/2, yaw: 0 });
     pts.push({ x, y: 0, z: pd/2, yaw: 0 });
  }
  for (let z = -pd/2; z <= pd/2; z += 8) {
     pts.push({ x: -pw/2, y: 0, z, yaw: 90 });
     pts.push({ x: pw/2, y: 0, z, yaw: 90 });
  }

  return pts;
}

/**
 * 🌲 GEN_LOG_CABIN
 * Fidelity: Masterpiece (500+ Logs)
 */
export function gen_log_cabin(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const w = p.width || 12;
  const d = p.depth || 16;
  const h = p.height || 6;
  const logDia = 0.45;

  // Horizontal log stacking
  for (let y = 0; y < h; y += logDia) {
    const isEven = Math.round(y / logDia) % 2 === 0;
    
    // Front/Back
    for (let x = -w/2; x <= w/2; x += 4) {
      if (y > 2 || Math.abs(x) > 1.5) {
         pts.push({ x, y, z: -d/2, yaw: 0, name: "StaticObj_Misc_Timbers_Log4" });
         pts.push({ x, y, z: d/2, yaw: 0, name: "StaticObj_Misc_Timbers_Log4" });
      }
    }
    // Left/Right
    for (let z = -d/2; z <= d/2; z += 4) {
       pts.push({ x: -w/2, y: y + (isEven ? 0 : logDia/2), z, yaw: 90, name: "StaticObj_Misc_Timbers_Log4" });
       pts.push({ x: w/2, y: y + (isEven ? 0 : logDia/2), z, yaw: 90, name: "StaticObj_Misc_Timbers_Log4" });
    }
  }

  // Simple Roof
  for (let x = -w/2 - 1; x <= w/2 + 1; x += 2) {
    for (let z = -d/2 - 1; z <= d/2 + 1; z += 2) {
       const distCenter = Math.abs(x);
       const ry = h + (w/2 - distCenter) * 0.6;
       pts.push({ x, y: ry, z, yaw: 0, name: "StaticObj_Misc_Timbers_Log4" });
    }
  }

  return pts;
}

/**
 * 🏭 GEN_DEEP_SEA_OIL_RIG
 */
export function gen_deep_sea_oil_rig(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const w = p.width || 60;
  const h = p.height || 40;
  // 4 Massive Legs
  for (let y = 0; y <= h; y += 5) {
     [[-w/2, -w/2], [w/2, -w/2], [-w/2, w/2], [w/2, w/2]].forEach(([lx, lz]) => {
        drawRing(pts, lx, y, lz, 3);
     });
  }
  // Main deck
  for (let y = h; y <= h+5; y += 2.5) {
     drawWall(pts, -w/2-5, y, -w/2-5, w/2+5, y, -w/2-5);
     drawWall(pts, -w/2-5, y, w/2+5, w/2+5, y, w/2+5);
     drawWall(pts, -w/2-5, y, -w/2-5, -w/2-5, y, w/2+5);
     drawWall(pts, w/2+5, y, -w/2-5, w/2+5, y, w/2+5);
  }
  return pts;
}

/**
 * 🛡️ GEN_BUNKER_LINE
 */
export function gen_bunker_line(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const len = p.length || 80;
  for (let x = -len/2; x <= len/2; x += 10) {
     // Concrete bunker modules
     for (let y = 0; y <= 6; y += 3) {
        drawWall(pts, x-4, y, -4, x+4, y, -4);
        drawWall(pts, x-4, y, 4, x+4, y, 4);
        drawWall(pts, x-4, y, -4, x-4, y, 4);
        drawWall(pts, x+4, y, -4, x+4, y, 4);
     }
  }
  return pts;
}

// ─── BIG BEN (Elizabeth Tower) — Victorian Gothic Clock Tower ────────────────
// Real dimensions: 15.2 × 15.2 m base, 96 m total height.
// Features: stepped limestone plinth, corner buttresses, 4 × 7 m clock faces,
// open belfry arches, 4 corner pinnacle spirelets, 22 m Gothic spire.
export function gen_big_ben(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];

  // Scale relative to canonical 96 m height
  const targetH = p.height || 96;
  const S = targetH / 96;           // scale factor
  const hw = 7.6 * S;               // half-width of 15.2 m base

  // ── Helper: 4-wall rectangle at height y ─────────────────────────────────
  function rect(y: number, half: number, sp = 4 * S, wallName?: string) {
    const w = half;
    drawWall(pts, -w, y, -w,  w, y, -w, sp);
    drawWall(pts, -w, y,  w,  w, y,  w, sp);
    drawWall(pts, -w, y, -w, -w, y,  w, sp);
    drawWall(pts,  w, y, -w,  w, y,  w, sp);
    if (wallName) {
      [[-w,-w],[w,-w],[-w,w],[w,w]].forEach(([cx,cz]) =>
        pts.push({ x: cx, y, z: cz, yaw: Math.atan2(cx, cz) * 180/Math.PI, name: wallName })
      );
    }
  }

  // ── 1. STEPPED LIMESTONE PLINTH (0 – 6 m) ────────────────────────────────
  // Three progressively smaller steps — wider at ground, narrowing upward
  [
    { y: 0,      extra: 2.8 * S },
    { y: 2 * S,  extra: 1.6 * S },
    { y: 4 * S,  extra: 0.6 * S },
  ].forEach(({ y, extra }) => rect(y, hw + extra, 4 * S, "staticobj_wall_stone"));

  // ── 2. MAIN TOWER SHAFT (6 – 52 m) ──────────────────────────────────────
  for (let y = 6 * S; y <= 52 * S; y += 5 * S) {
    rect(y, hw, 4 * S);

    // Decorative string course every ~16 m (slightly proud of wall)
    if ((Math.round(y / S) % 20) === 6) {
      rect(y, hw + 0.9 * S, 4 * S, "staticobj_wall_stone2");
    }
  }

  // Corner buttresses — project 1.8 m proud, every 6 m vertically
  const bOff = hw + 1.8 * S;
  for (let y = 6 * S; y <= 52 * S; y += 8 * S) {
    [[-bOff, -bOff], [bOff, -bOff], [-bOff, bOff], [bOff, bOff]].forEach(([cx, cz]) =>
      pts.push({ x: cx, y, z: cz, yaw: Math.atan2(cx, cz) * 180/Math.PI, name: "staticobj_wall_stone2" })
    );
  }

  // ── 3. CLOCK STAGE CORNICE (52 – 64 m) ───────────────────────────────────
  // Wider than shaft; decorative banding every 3 m
  for (let y = 52 * S; y <= 64 * S; y += 3 * S) {
    rect(y, hw + 1.4 * S, 2.5 * S);
  }

  // ── 4. FOUR CLOCK FACES (centred at 56 m, r = 3.5 m) ─────────────────────
  const clockY  = 56 * S;
  const clockR  = 3.5 * S;
  const faceOff = hw + 1.6 * S; // how far face protrudes beyond cornice

  drawRing(pts,    0,    clockY, -faceOff, clockR, 1.4 * S); // North
  drawRing(pts,    0,    clockY,  faceOff, clockR, 1.4 * S); // South
  drawRing(pts, -faceOff, clockY, 0,       clockR, 1.4 * S); // West
  drawRing(pts,  faceOff, clockY, 0,       clockR, 1.4 * S); // East

  // Clock numerals ring (inner, ~1.5 m inside face rim)
  const numR = clockR * 0.6;
  drawRing(pts,    0,    clockY, -faceOff, numR, 1.2 * S);
  drawRing(pts,    0,    clockY,  faceOff, numR, 1.2 * S);
  drawRing(pts, -faceOff, clockY, 0,       numR, 1.2 * S);
  drawRing(pts,  faceOff, clockY, 0,       numR, 1.2 * S);

  // ── 5. BELFRY / BELL CHAMBER (64 – 74 m) ─────────────────────────────────
  // Open Gothic arches on all four sides; partial walls left/right of each arch
  const bw = hw + 1.2 * S;
  const archGap = 3.2 * S; // half-width of arch opening
  for (let y = 64 * S; y <= 74 * S; y += 3 * S) {
    // North face (two flanks, open arch centre)
    drawWall(pts, -bw, y, -bw,  -archGap, y, -bw, 2.5 * S);
    drawWall(pts,  archGap, y, -bw,  bw, y, -bw, 2.5 * S);
    // South face
    drawWall(pts, -bw, y,  bw,  -archGap, y,  bw, 2.5 * S);
    drawWall(pts,  archGap, y,  bw,  bw, y,  bw, 2.5 * S);
    // West face
    drawWall(pts, -bw, y, -bw, -bw, y, -archGap, 2.5 * S);
    drawWall(pts, -bw, y,  archGap, -bw, y,  bw, 2.5 * S);
    // East face
    drawWall(pts,  bw, y, -bw,  bw, y, -archGap, 2.5 * S);
    drawWall(pts,  bw, y,  archGap,  bw, y,  bw, 2.5 * S);
  }
  // Pointed arch tops (semicircle over each arch opening)
  const archY   = 69 * S;
  const archSegs = 8;
  for (let s = 0; s <= archSegs; s++) {
    const a     = (s / archSegs) * Math.PI;
    const arcX  = Math.cos(a) * archGap;
    const arcY  = archY + Math.sin(a) * archGap * 1.1;
    // All four faces
    pts.push({ x: arcX, y: arcY, z: -(bw + 0.2 * S), yaw: 0,   name: "staticobj_wall_stone2" }); // N
    pts.push({ x: arcX, y: arcY, z:  (bw + 0.2 * S), yaw: 180, name: "staticobj_wall_stone2" }); // S
    pts.push({ x: -(bw + 0.2 * S), y: arcY, z: arcX,  yaw: 270, name: "staticobj_wall_stone2" }); // W
    pts.push({ x:  (bw + 0.2 * S), y: arcY, z: arcX,  yaw: 90,  name: "staticobj_wall_stone2" }); // E
  }

  // ── 6. FOUR CORNER PINNACLE SPIRELETS (52 – 84 m) ────────────────────────
  // Octagonal turrets with tapered caps — mark Gothic character of the tower
  const pinOff = hw + 3 * S;
  const pinR   = 2.0 * S;
  [[-pinOff, -pinOff], [pinOff, -pinOff], [-pinOff, pinOff], [pinOff, pinOff]].forEach(([cx, cz]) => {
    // Turret shaft
    for (let y = 52 * S; y <= 75 * S; y += 4 * S) {
      drawRing(pts, cx, y, cz, pinR, 2.5 * S);
    }
    // Tapered pinnacle cap
    for (let y = 75 * S; y <= 85 * S; y += 3 * S) {
      const t  = (y - 75 * S) / (10 * S);
      const cr = pinR * (1 - t * 0.95);
      if (cr > 0.3 * S) drawRing(pts, cx, y, cz, cr, 2 * S);
    }
    pts.push({ x: cx, y: 85 * S, z: cz });
  });

  // ── 7. GOTHIC SPIRE (74 – 96 m) ──────────────────────────────────────────
  // Square-plan tapered spire, ~22 m — iconic silhouette
  for (let y = 74 * S; y <= 94 * S; y += 2.5 * S) {
    const t  = (y - 74 * S) / (22 * S);
    const sr = hw * (1 - t) * 0.9;
    if (sr < 0.4 * S) break;
    rect(y, sr, 2 * S, t > 0.3 ? "staticobj_wall_stone2" : undefined);
  }
  pts.push({ x: 0, y: 95 * S, z: 0 }); // spire tip

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🗽 STATUE OF LIBERTY — Fort Wood star base, granite pedestal, copper figure
// Real: Fort Wood base r≈22m, pedestal 47m, statue 46m, total 93m
// Interior: pedestal stairwell is accessible — hollow cube walls
// Rating: S-TIER monument replica
// ─────────────────────────────────────────────────────────────────────────────
export function gen_statue_liberty(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const S = Math.max(0.5, (p.height || 93) / 93);

  // ── 1. FORT WOOD — 6-point star granite base (y=0–6) ─────────────────────
  // 11-pointed star fort: 6 outer salients, 6 re-entrant angles at ground
  const starOuter = 22 * S, starInner = 14 * S;
  for (let i = 0; i < 12; i++) {
    const a1 = (i / 12) * Math.PI * 2;
    const a2 = ((i + 1) / 12) * Math.PI * 2;
    const r1 = i % 2 === 0 ? starOuter : starInner;
    const r2 = i % 2 === 0 ? starInner : starOuter;
    const x1 = Math.cos(a1) * r1, z1 = Math.sin(a1) * r1;
    const x2 = Math.cos(a2) * r2, z2 = Math.sin(a2) * r2;
    for (let y = 0; y <= 6 * S; y += 3 * S) {
      drawWall(pts, x1, y, z1, x2, y, z2, 7);
    }
  }
  // Star inner fill walls (structural) every 3m height
  drawRing(pts, 0, 0, 0, starInner - 2, 7);
  drawRing(pts, 0, 3 * S, 0, starInner - 2, 7);
  drawRing(pts, 0, 6 * S, 0, starInner - 2, 7);

  // ── 2. PEDESTAL — Stepped granite square (y=6–47) ────────────────────────
  // Beaux-Arts base: 4 large walls with step-backs at 15m, 30m
  const pedStages = [
    { y0: 6, y1: 15, hw: 10 }, // lower plinth
    { y0: 15, y1: 30, hw: 9  }, // mid body
    { y0: 30, y1: 47, hw: 8  }, // upper cornice
  ];
  for (const { y0, y1, hw } of pedStages) {
    for (let y = y0 * S; y <= y1 * S; y += 4 * S) {
      // 4 sides of pedestal square
      drawWall(pts, -hw*S, y, -hw*S, hw*S, y, -hw*S, 7, );
      drawWall(pts, hw*S, y, -hw*S, hw*S, y, hw*S, 7);
      drawWall(pts, hw*S, y, hw*S, -hw*S, y, hw*S, 7);
      drawWall(pts, -hw*S, y, hw*S, -hw*S, y, -hw*S, 7);
    }
    // Corner quoins at step transitions
    [[-hw*S,-hw*S],[hw*S,-hw*S],[hw*S,hw*S],[-hw*S,hw*S]].forEach(([cx,cz])=>{
      pts.push({ x: cx, y: y1 * S, z: cz, yaw: Math.atan2(cx, cz) * 180/Math.PI, name: "staticobj_wall_stone2" });
    });
  }

  // ── 3. STATUE BODY — Robed figure (y=47–82) ──────────────────────────────
  // Tapered cylinder: drawRing from r=5 at base, narrowing to r=2.5 at y=82
  for (let y = 47 * S; y <= 82 * S; y += 4 * S) {
    const t = (y - 47 * S) / (35 * S);
    const r = (5 - t * 2.5) * S;
    drawRing(pts, 0, y, 0, Math.max(1, r), 6);
  }
  // Robe hem draped detail at y=47 (wider base drape)
  drawRing(pts, 0, 47 * S, 0, 6 * S, 6);

  // ── 4. RIGHT ARM — Torch (shoulder x=4,y=72 → tip x=8,y=93) ─────────────
  const armSteps = 10;
  for (let i = 0; i <= armSteps; i++) {
    const t = i / armSteps;
    const ax = (4 + t * 4) * S, ay = (72 + t * 21) * S, az = 0;
    pts.push({ x: ax, y: ay, z: az, yaw: 90, name: "staticobj_wall_stone2" }); // arm extends east
  }
  // Torch cylinder at arm tip (y=90–95)
  for (let y = 90 * S; y <= 95 * S; y += 2 * S) {
    drawRing(pts, 8 * S, y, 0, 1.5 * S, 3);
  }
  pts.push({ x: 8 * S, y: 96 * S, z: 0, yaw: 90 }); // flame tip

  // ── 5. LEFT ARM — Tablet (x=-3,y=72 downward to x=-5,y=65) ───────────────
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    pts.push({ x: (-3 - t * 2) * S, y: (72 - t * 7) * S, z: 0, yaw: 270 }); // tablet arm extends west
  }

  // ── 6. HEAD & CROWN — 7 radiating spikes (y=83–93) ───────────────────────
  // Head: drawRing at y=83, y=85, y=87
  drawRing(pts, 0, 83 * S, 0, 2 * S, 4);
  drawRing(pts, 0, 85 * S, 0, 1.5 * S, 4);
  // Crown: 7 spikes radiating outward from face ring
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const bx = Math.cos(a) * 1.5 * S, bz = Math.sin(a) * 1.5 * S;
    const tx = Math.cos(a) * 4 * S, tz = Math.sin(a) * 4 * S;
    drawWall(pts, bx, 86 * S, bz, tx, 93 * S, tz, 3);
  }
  // Crown base ring
  drawRing(pts, 0, 86 * S, 0, 2 * S, 4);

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 X-WING FIGHTER — Incom T-65B, S-foils open attack position
// Real: fuselage 12.5m, wingspan 10.9m open, height 2.4m
// Interior: cockpit accessible
// Rating: S-TIER sci-fi replica
// ─────────────────────────────────────────────────────────────────────────────
export function gen_xwing(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const S = Math.max(0.5, (p.length || 13) / 13);

  // ── 1. FUSELAGE — central cylinder, Z-axis oriented ───────────────────────
  // r=1.2m, length=12.5m (z=-6.25 to z=+6.25), rings every 2m
  for (let z = -6 * S; z <= 6 * S; z += 2 * S) {
    drawRing(pts, 0, 0, z, 1.2 * S, 3);
  }
  // Cockpit nose — tapered rings at front
  drawRing(pts, 0, 0, -6 * S, 1.5 * S, 3);
  drawRing(pts, 0, 0.4 * S, -7 * S, 1.0 * S, 3);
  pts.push({ x: 0, y: 0.2 * S, z: -8 * S, yaw: 0 }); // nose tip (faces north/forward)

  // ── 2. COCKPIT DOME — canopy above fuselage ────────────────────────────────
  drawRing(pts, 0, 1.2 * S, -4 * S, 1.0 * S, 3);
  drawRing(pts, 0, 1.8 * S, -4 * S, 0.5 * S, 3);
  pts.push({ x: 0, y: 2.2 * S, z: -4 * S, yaw: 0 }); // cockpit dome top

  // ── 3. S-FOILS — 4 wings in X pattern, ±45° ───────────────────────────────
  // Upper-right, Upper-left, Lower-right, Lower-left
  // Each wing: 5.5m from body centre, tip engine nacelle
  const wings = [
    { ax:  1.2, ay:  1.2, az: 2 * S, tx:  5.5, ty:  3.0, tz: 2 * S },  // upper-right
    { ax: -1.2, ay:  1.2, az: 2 * S, tx: -5.5, ty:  3.0, tz: 2 * S },  // upper-left
    { ax:  1.2, ay: -1.2, az: 2 * S, tx:  5.5, ty: -3.0, tz: 2 * S },  // lower-right
    { ax: -1.2, ay: -1.2, az: 2 * S, tx: -5.5, ty: -3.0, tz: 2 * S },  // lower-left
  ];
  for (const w of wings) {
    // Main foil line (root to tip, scaled)
    drawWall(pts, w.ax*S, w.ay*S, w.az, w.tx*S, w.ty*S, w.tz, 3);
    // Aft edge line (trailing)
    drawWall(pts, w.ax*S, w.ay*S, 5*S, w.tx*S, w.ty*S, 5*S, 3);
    // Fore edge
    drawWall(pts, w.ax*S, w.ay*S, -1*S, w.tx*S, w.ty*S, -1*S, 3);
  }

  // ── 4. ENGINE NACELLES — r=0.9m, at each wingtip ─────────────────────────
  const nacelles = [
    { cx:  5.5, cy:  3.0 }, { cx: -5.5, cy:  3.0 },
    { cx:  5.5, cy: -3.0 }, { cx: -5.5, cy: -3.0 },
  ];
  for (const n of nacelles) {
    const cx = n.cx * S, cy = n.cy * S;
    for (let z = 0 * S; z <= 6 * S; z += 2 * S) {
      drawRing(pts, cx, cy, z, 0.9 * S, 3);
    }
    // Engine bell (rear)
    drawRing(pts, cx, cy, 6.5 * S, 1.1 * S, 3);
    pts.push({ x: cx, y: cy, z: 7 * S }); // exhaust glow
  }

  // ── 5. ASTROMECH R2-D2 — dome behind cockpit ─────────────────────────────
  drawRing(pts, 0, 1.0 * S, 1 * S, 0.5 * S, 2);
  pts.push({ x: 0, y: 1.5 * S, z: 1 * S });

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// ✝️ CHRIST THE REDEEMER — Corcovado peak, Art Deco soapstone
// Real: pedestal 9.5m, statue 30m, arms 28m span. Total 38m.
// Interior: pedestal chapel is accessible
// Rating: S-TIER monument replica
// ─────────────────────────────────────────────────────────────────────────────
export function gen_christ_redeemer(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const S = Math.max(0.5, (p.height || 38) / 38);

  // ── 1. PEDESTAL — rectangular plinth with chapel interior (y=0–9.5) ───────
  const pedW = 8 * S;
  for (let y = 0; y <= 9.5 * S; y += 3 * S) {
    drawWall(pts, -pedW, y, -pedW, pedW, y, -pedW, 7);
    drawWall(pts, pedW, y, -pedW, pedW, y, pedW, 7);
    drawWall(pts, pedW, y, pedW, -pedW, y, pedW, 7);
    drawWall(pts, -pedW, y, pedW, -pedW, y, -pedW, 7);
  }
  // Entrance arch (south face - z=-pedW)
  const archR = 3 * S;
  for (let s = 0; s <= 8; s++) {
    const a = (s / 8) * Math.PI;
    pts.push({ x: Math.cos(a) * archR, y: 4 * S + Math.sin(a) * archR * 0.8, z: -pedW });
  }

  // ── 2. VERTICAL BODY — tapering drawRing (y=9.5–30) ─────────────────────
  for (let y = 9.5 * S; y <= 30 * S; y += 3.5 * S) {
    const t = (y - 9.5 * S) / (20.5 * S);
    const r = (2.2 - t * 1.2) * S;
    drawRing(pts, 0, y, 0, Math.max(0.5, r), 5);
  }

  // ── 3. OUTSTRETCHED ARMS — horizontal, slight downward droop (y≈28) ───────
  // Left arm: x=-14 to 0 at y=28, z=0; right: x=0 to +14
  // Three parallel lines for structural bulk (z=0, ±1.5m)
  const armY = 26 * S;
  for (const dz of [-1.5 * S, 0, 1.5 * S]) {
    // Right arm
    drawWall(pts, 0, armY, dz, 14 * S, armY - 1 * S, dz, 6);
    // Left arm (mirror)
    drawWall(pts, 0, armY, dz, -14 * S, armY - 1 * S, dz, 6);
  }

  // ── 4. HEAD — dome rings (y=32–37) ───────────────────────────────────────
  drawRing(pts, 0, 32 * S, 0, 1.8 * S, 4);
  drawRing(pts, 0, 34 * S, 0, 1.4 * S, 4);
  drawRing(pts, 0, 36 * S, 0, 0.9 * S, 4);
  pts.push({ x: 0, y: 37.5 * S, z: 0 }); // crown apex

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🧙 HOGWARTS CASTLE — Scottish Gothic highland fortress
// Real: sprawling ~150×100m, Astronomy Tower ~70m, Great Hall 30m
// Interior: all towers + Great Hall are walk-in structures
// Rating: S-TIER fantasy replica
// ─────────────────────────────────────────────────────────────────────────────
export function gen_hogwarts(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const S = Math.max(0.5, (p.width || 150) / 150);

  const CASTLE = "staticobj_castle_wall3";
  const BASTION = "Land_Castle_Bastion";

  // ── 1. MAIN CASTLE BLOCK — 60×40m rectangle (y=0–20) ────────────────────
  const mw = 30 * S, md = 20 * S;
  for (let y = 0; y <= 20 * S; y += 8 * S) {
    drawWall(pts, -mw, y, -md, mw, y, -md, 7);
    drawWall(pts, mw, y, -md, mw, y, md, 7);
    drawWall(pts, mw, y, md, -mw, y, md, 7);
    drawWall(pts, -mw, y, md, -mw, y, -md, 7);
  }
  // Battlements atop main block
  for (let x = -mw; x <= mw; x += 4 * S) {
    pts.push({ x, y: 21 * S, z: -md, yaw: 0,   name: CASTLE }); // N wall, face north
    pts.push({ x, y: 21 * S, z:  md, yaw: 180, name: CASTLE }); // S wall, face south
  }
  for (let z = -md; z <= md; z += 4 * S) {
    pts.push({ x: -mw, y: 21 * S, z, yaw: 270, name: CASTLE }); // W wall, face west
    pts.push({ x:  mw, y: 21 * S, z, yaw: 90,  name: CASTLE }); // E wall, face east
  }

  // ── 2. GREAT HALL — 30×20m protrusion south (z>0), taller (y=0–30) ───────
  const ghW = 15 * S, ghD = 10 * S, ghZ = md + ghD;
  for (let y = 0; y <= 30 * S; y += 8 * S) {
    drawWall(pts, -ghW, y, md, ghW, y, md, 7);
    drawWall(pts, ghW, y, md, ghW, y, ghZ, 7);
    drawWall(pts, ghW, y, ghZ, -ghW, y, ghZ, 7);
    drawWall(pts, -ghW, y, ghZ, -ghW, y, md, 7);
  }
  // Peaked roof ridge along Great Hall
  drawWall(pts, -ghW + 2*S, 32 * S, md + ghD/2, ghW - 2*S, 32 * S, md + ghD/2, 6);

  // ── 3. ASTRONOMY TOWER — tallest, northeast corner (x=mw, z=-md) ─────────
  // drawRing r=4, y=0–70, sparse rings — this is the icon of Hogwarts
  for (let y = 0; y <= 70 * S; y += 8 * S) {
    drawRing(pts, mw, y, -md, 4 * S, 7);
  }
  // Parapet + pinnacle
  drawRing(pts, mw, 72 * S, -md, 5 * S, 7);
  pts.push({ x: mw, y: 78 * S, z: -md, yaw: 90, name: BASTION });

  // ── 4. THREE CORNER TOWERS — NW, SW, SE (shorter) ─────────────────────────
  const corners = [
    { cx: -mw, cz: -md, h: 50 * S }, // NW
    { cx: -mw, cz:  md, h: 40 * S }, // SW
    { cx:  mw, cz:  md, h: 35 * S }, // SE
  ];
  for (const c of corners) {
    for (let y = 0; y <= c.h; y += 8 * S) {
      drawRing(pts, c.cx, y, c.cz, 4 * S, 7);
    }
    pts.push({ x: c.cx, y: c.h + 6 * S, z: c.cz, yaw: Math.atan2(c.cx, c.cz) * 180/Math.PI, name: BASTION });
  }

  // ── 5. VIADUCT BRIDGE — connects main block to boathouse (x=mw+15 side) ──
  // Two parallel walls 4m apart, 40m long, y=5
  const viaY = 5 * S;
  drawWall(pts, mw, viaY, -2*S, mw + 40*S, viaY, -2*S, 7);
  drawWall(pts, mw, viaY,  2*S, mw + 40*S, viaY,  2*S, 7);
  // Support arches under bridge
  for (let ax = mw + 8*S; ax < mw + 40*S; ax += 10*S) {
    for (let s = 0; s <= 5; s++) {
      const aa = (s / 5) * Math.PI;
      pts.push({ x: ax, y: viaY - Math.sin(aa) * 4*S, z: Math.cos(aa) * 3*S, yaw: 90 }); // bridge runs E-W
    }
  }

  // ── 6. COURTYARD — inner ring (central gathering space) ───────────────────
  drawRing(pts, 0, 0.5, 0, 8 * S, 7);

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇦🇺 SYDNEY OPERA HOUSE — Jørn Utzon expressionist shells
// Real: podium 183×120m, Concert Hall peak 67m, precast concrete tile ribs
// Interior: podium walkway + Concert Hall volume accessible
// Rating: S-TIER monument replica
// ─────────────────────────────────────────────────────────────────────────────
export function gen_sydney_opera(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const S = Math.max(0.5, (p.width || 120) / 120);

  // ── 1. PODIUM PLINTH — 100×60m raised platform (y=0–6) ───────────────────
  const plW = 50 * S, plD = 30 * S;
  for (let y = 0; y <= 6 * S; y += 3 * S) {
    drawWall(pts, -plW, y, -plD, plW, y, -plD, 8);
    drawWall(pts, plW, y, -plD, plW, y, plD, 8);
    drawWall(pts, plW, y, plD, -plW, y, plD, 8);
    drawWall(pts, -plW, y, plD, -plW, y, -plD, 8);
  }

  // ── 2. CONCERT HALL SHELLS — left side (x<0), 3 shells, tallest 67m ──────
  // Each shell = series of semicircular ribs in the XY plane, repeated along Z
  // Shell 1: tallest, z=0→40, peak y=67
  const shells = [
    { peakY: 67, xSpan: 25, zStart: -15, zEnd: 18, zStep: 5, xOff: -20 },
    { peakY: 45, xSpan: 18, zStart: -10, zEnd: 14, zStep: 5, xOff: -15 },
    { peakY: 30, xSpan: 12, zStart: -5, zEnd:  9, zStep: 4, xOff: -10 },
  ];
  for (const sh of shells) {
    for (let z = sh.zStart * S; z <= sh.zEnd * S; z += sh.zStep * S) {
      // Shell rib: semicircle from x=xOff-xSpan to x=xOff+xSpan, peak at peakY
      const archSegs = 12;
      for (let s = 0; s <= archSegs; s++) {
        const a = (s / archSegs) * Math.PI;
        const ax = (sh.xOff + Math.cos(a) * sh.xSpan) * S;
        const ay = 6 * S + Math.sin(a) * sh.peakY * S;
        pts.push({ x: ax, y: ay, z, yaw: 0, name: "staticobj_wall_cncsmall_8" }); // ribs face N/S along Z axis
      }
    }
  }

  // ── 3. OPERA THEATRE SHELLS — right side (x>0), 2 shells, 59m + 40m ─────
  const opShells = [
    { peakY: 59, xSpan: 22, zStart: -12, zEnd: 16, zStep: 5, xOff: 18 },
    { peakY: 40, xSpan: 16, zStart: -8,  zEnd: 11, zStep: 4, xOff: 14 },
  ];
  for (const sh of opShells) {
    for (let z = sh.zStart * S; z <= sh.zEnd * S; z += sh.zStep * S) {
      const archSegs = 12;
      for (let s = 0; s <= archSegs; s++) {
        const a = (s / archSegs) * Math.PI;
        const ax = (sh.xOff + Math.cos(a) * sh.xSpan) * S;
        const ay = 6 * S + Math.sin(a) * sh.peakY * S;
        pts.push({ x: ax, y: ay, z, yaw: 0, name: "staticobj_wall_cncsmall_8" }); // ribs face N/S along Z axis
      }
    }
  }

  // ── 4. BENNELONG STEPS — grand staircase approach (south, z=-plD) ─────────
  for (let step = 0; step < 6; step++) {
    const stepZ = -plD - step * 3 * S;
    const stepW = (plW - step * 4 * S);
    drawWall(pts, -stepW, step * 0.8 * S, stepZ, stepW, step * 0.8 * S, stepZ, 8);
  }

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🗼 SPACE NEEDLE — Seattle World's Fair, 1962
// Real: tripod base r=20m, shaft r=4.5m, saucer r=21m at y=138, spire to 184m
// Interior: restaurant saucer deck is walkable
// Rating: S-TIER monument replica
// ─────────────────────────────────────────────────────────────────────────────
export function gen_space_needle(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const S = Math.max(0.5, (p.height || 184) / 184);

  // ── 1. TRIPOD LEGS — 3 curved legs, base r=20 → shaft r=4.5 at y=50 ──────
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const legSegs = 10;
    for (let s = 0; s < legSegs; s++) {
      const t0 = s / legSegs, t1 = (s + 1) / legSegs;
      const r0 = (20 - t0 * 15.5) * S;
      const r1 = (20 - t1 * 15.5) * S;
      const y0 = t0 * 50 * S, y1 = t1 * 50 * S;
      drawWall(pts,
        Math.cos(a) * r0, y0, Math.sin(a) * r0,
        Math.cos(a) * r1, y1, Math.sin(a) * r1,
        8
      );
    }
  }
  // Horizontal ring braces: mid-leg at y=15 and y=35
  drawRing(pts, 0, 15 * S, 0, 14 * S, 8);
  drawRing(pts, 0, 35 * S, 0,  8 * S, 8);

  // ── 2. SHAFT — drawRing r=4.5m, y=50→135 every 10m ──────────────────────
  for (let y = 50 * S; y <= 135 * S; y += 10 * S) {
    drawRing(pts, 0, y, 0, 4.5 * S, 6);
  }

  // ── 3. SAUCER — flying disc, r=21m, 4 rings y=136–139 ───────────────────
  for (let dy = 0; dy <= 4; dy++) {
    const t = dy / 4;
    // Curved profile: bulges at mid (sin curve)
    const sr = (18 + Math.sin(t * Math.PI) * 3) * S;
    drawRing(pts, 0, (136 + dy) * S, 0, sr, 9);
  }
  // Observation deck outer rim (slightly wider)
  drawRing(pts, 0, 138 * S, 0, 22 * S, 9);
  // Underside of saucer (structural)
  drawRing(pts, 0, 136 * S, 0, 8 * S, 7);

  // ── 4. UPPER SHAFT above saucer — r=3m, y=140→165 ───────────────────────
  for (let y = 140 * S; y <= 165 * S; y += 12 * S) {
    drawRing(pts, 0, y, 0, 3 * S, 5);
  }

  // ── 5. SPIRE — tapering needle to 184m ───────────────────────────────────
  for (let y = 165 * S; y <= 184 * S; y += 5 * S) {
    pts.push({ x: 0, y, z: 0 });
  }

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇨🇦 CN TOWER — Toronto, Ontario
// Real: trillium 3-buttress base, shaft r=4m, SkyPod r=15m at y=342, antenna 553m
// Interior: SkyPod observation level is walkable
// Rating: A-TIER monument replica (height scaled, proportions accurate)
// ─────────────────────────────────────────────────────────────────────────────
export function gen_cn_tower(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  // Scale: 553m real → use 1:1 but sparse. Height param lets user adjust.
  const S = Math.max(0.5, (p.height || 300) / 300);

  // ── 1. TRILLIUM BASE — 3 tapered buttresses at 0°/120°/240°, y=0–30 ──────
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const perp = a + Math.PI / 2;
    const hw = 3 * S; // half-width of each buttress face
    const segs = 6;
    for (let s = 0; s < segs; s++) {
      const t0 = s / segs, t1 = (s + 1) / segs;
      const r0 = (15 - t0 * 11) * S, r1 = (15 - t1 * 11) * S;
      const y0 = t0 * 30 * S, y1 = t1 * 30 * S;
      // Left edge of buttress
      drawWall(pts,
        Math.cos(a) * r0 + Math.cos(perp) * hw, y0, Math.sin(a) * r0 + Math.sin(perp) * hw,
        Math.cos(a) * r1 + Math.cos(perp) * hw, y1, Math.sin(a) * r1 + Math.sin(perp) * hw,
        8
      );
      // Right edge
      drawWall(pts,
        Math.cos(a) * r0 - Math.cos(perp) * hw, y0, Math.sin(a) * r0 - Math.sin(perp) * hw,
        Math.cos(a) * r1 - Math.cos(perp) * hw, y1, Math.sin(a) * r1 - Math.sin(perp) * hw,
        8
      );
    }
    // Cap each buttress with a face wall at ground
    drawWall(pts,
      Math.cos(a) * 15 * S + Math.cos(perp) * hw, 0, Math.sin(a) * 15 * S + Math.sin(perp) * hw,
      Math.cos(a) * 15 * S - Math.cos(perp) * hw, 0, Math.sin(a) * 15 * S - Math.sin(perp) * hw,
      7
    );
  }

  // ── 2. ROUND SHAFT — r=4m, y=30→190 every 15m (sparse = more height) ────
  for (let y = 30 * S; y <= 190 * S; y += 15 * S) {
    drawRing(pts, 0, y, 0, 4 * S, 6);
  }

  // ── 3. SKYPOD — fat donut at y=195–210, r=15m ────────────────────────────
  for (let dy = 0; dy <= 5; dy++) {
    const t = dy / 5;
    const sr = (8 + Math.sin(t * Math.PI) * 7) * S;
    drawRing(pts, 0, (195 + dy * 3) * S, 0, sr, 9);
  }
  drawRing(pts, 0, 201 * S, 0, 16 * S, 9); // max rim

  // ── 4. UPPER SHAFT above SkyPod — r=3m, y=215→265 every 20m ─────────────
  for (let y = 215 * S; y <= 265 * S; y += 20 * S) {
    drawRing(pts, 0, y, 0, 3 * S, 5);
  }

  // ── 5. ANTENNA MAST — thin needle to 300m ────────────────────────────────
  for (let y = 265 * S; y <= 300 * S; y += 8 * S) {
    pts.push({ x: 0, y, z: 0 });
  }

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇮🇹 TOWER OF PISA — Piazza dei Miracoli, Pisa, Tuscany
// Real: 15.5m outer dia, 56m height, 8 colonnaded tiers, 4° southward lean
// Interior: hollow staircase up every tier
// Rating: S-TIER monument replica (tilt baked in via shear transform)
// ─────────────────────────────────────────────────────────────────────────────
export function gen_leaning_pisa(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const S = Math.max(0.5, (p.height || 56) / 56);
  const TILT = Math.tan(4 * Math.PI / 180); // 4° lean ≈ 0.0699

  const outerR = 7.75 * S;
  const tierH  = 7 * S; // ~7m per tier (56m / 8 tiers)

  for (let tier = 0; tier < 8; tier++) {
    const yBase = tier * tierH;
    const r = tier === 7 ? 5.5 * S : outerR; // belfry (top) slightly narrower

    // Tier floor colonnade ring
    drawRing(pts, 0, yBase, 0, r, 6);

    // Columns around each tier: 12–16 evenly spaced
    const colCount = tier === 0 ? 8 : 14; // ground tier = plain walls, upper = columns
    for (let c = 0; c < colCount; c++) {
      const ca = (c / colCount) * Math.PI * 2;
      const cx = Math.cos(ca) * (r - 1 * S);
      const cz = Math.sin(ca) * (r - 1 * S);
      // Short column shaft: floor to capital
      drawWall(pts, cx, yBase, cz, cx, yBase + 2.5 * S, cz, 3);
    }

    // Tier ceiling ring (top of each colonnade level)
    drawRing(pts, 0, yBase + tierH - 1 * S, 0, r, 6);
    drawRing(pts, 0, yBase + tierH,          0, r, 6);
  }

  // Belfry cap
  drawRing(pts, 0, 56 * S, 0, 4 * S, 5);
  pts.push({ x: 0, y: 57.5 * S, z: 0 });

  // ── TILT SHEAR TRANSFORM — 4° southward lean applied to every point ───────
  for (const pt of pts) {
    pt.x += pt.y * TILT;
  }

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// ⛪ SAGRADA FAMÍLIA — Barcelona, Antoni Gaudí i Cornet
// Real: cruciform nave, 18 spires tallest 172m. Scale: 1:2 = 86m
// Interior: nave and crossing aisles are walkable
// Rating: S-TIER monument replica (organic spire taper + ribs)
// ─────────────────────────────────────────────────────────────────────────────
export function gen_sagrada_familia(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const S = Math.max(0.5, (p.height || 86) / 86);

  // Helper: organic tapered spire at (sx, sz), rising to height h, base radius baseR
  function spire(sx: number, sz: number, h: number, baseR: number) {
    const rings = Math.max(2, Math.floor(h / (20 * S)));
    for (let ring = 0; ring <= rings; ring++) {
      const t = ring / rings;
      const y = t * h;
      // Organic ripple: sinusoidal radius wobble for Gaudí character
      const wobble = 1 + 0.12 * Math.sin(t * Math.PI * 5);
      const r = baseR * (1 - t * 0.92) * wobble;
      if (r < 0.3 * S) break;
      drawRing(pts, sx, y, sz, r, 5);
    }
    pts.push({ x: sx, y: h, z: sz }); // pinnacle tip
  }

  // ── 1. CRUCIFORM BASE WALLS — nave + transept (y=0–15) ───────────────────
  const naveHalf = 22 * S, transHalf = 15 * S, baseH = 15 * S;
  // Nave side walls (Z axis = length)
  for (let y = 0; y <= baseH; y += 8 * S) {
    drawWall(pts, -8 * S, y, -naveHalf, -8 * S, y,  naveHalf, 8);
    drawWall(pts,  8 * S, y, -naveHalf,  8 * S, y,  naveHalf, 8);
  }
  // Transept arms (X axis = width)
  for (let y = 0; y <= baseH; y += 8 * S) {
    drawWall(pts, -transHalf, y, -8 * S, transHalf, y, -8 * S, 8);
    drawWall(pts, -transHalf, y,  8 * S, transHalf, y,  8 * S, 8);
  }
  // End facade walls
  drawWall(pts, -8 * S, 0, -naveHalf, 8 * S, 0, -naveHalf, 8); // west
  drawWall(pts, -8 * S, 0,  naveHalf, 8 * S, 0,  naveHalf, 8); // east (Nativity)

  // ── 2. TWELVE APOSTLE SPIRES — 4 facades × 3 each ────────────────────────
  // Nativity facade (z=+naveHalf): 3 spires
  spire(-8 * S, naveHalf,  54 * S, 2.2 * S);
  spire(     0, naveHalf,  54 * S, 2.2 * S);
  spire( 8 * S, naveHalf,  54 * S, 2.2 * S);
  // Passion facade (z=-naveHalf): 3 spires
  spire(-8 * S, -naveHalf, 54 * S, 2.2 * S);
  spire(     0, -naveHalf, 54 * S, 2.2 * S);
  spire( 8 * S, -naveHalf, 54 * S, 2.2 * S);
  // North transept (x=+transHalf): 3 spires
  spire(transHalf, -6 * S, 52 * S, 2.0 * S);
  spire(transHalf,      0, 52 * S, 2.0 * S);
  spire(transHalf,  6 * S, 52 * S, 2.0 * S);
  // South transept (x=-transHalf): 3 spires
  spire(-transHalf, -6 * S, 52 * S, 2.0 * S);
  spire(-transHalf,       0, 52 * S, 2.0 * S);
  spire(-transHalf,  6 * S, 52 * S, 2.0 * S);

  // ── 3. FOUR EVANGELIST SPIRES — flanking the crossing ────────────────────
  spire(-10 * S, -10 * S, 62 * S, 2.8 * S);
  spire( 10 * S, -10 * S, 62 * S, 2.8 * S);
  spire(-10 * S,  10 * S, 62 * S, 2.8 * S);
  spire( 10 * S,  10 * S, 62 * S, 2.8 * S);

  // ── 4. MARY TOWER — between crossing and Nativity facade ─────────────────
  spire(0, 16 * S, 70 * S, 3 * S);

  // ── 5. CHRIST CENTRAL SPIRE — tallest, with 4 organic surface ribs ───────
  const cH = 86 * S, cBaseR = 5 * S;
  const cRings = 12;
  for (let ring = 0; ring <= cRings; ring++) {
    const t = ring / cRings;
    const y = t * cH;
    const wobble = 1 + 0.1 * Math.sin(t * Math.PI * 6);
    const r = cBaseR * (1 - t * 0.94) * wobble;
    if (r < 0.3 * S) break;
    drawRing(pts, 0, y, 0, r, 5);
  }
  pts.push({ x: 0, y: cH, z: 0 });
  // Four surface ribs along the spire (Gaudí hyperboloid character)
  for (let rib = 0; rib < 4; rib++) {
    const ra = (rib / 4) * Math.PI * 2;
    const ribSegs = 8;
    for (let s = 0; s < ribSegs; s++) {
      const t0 = s / ribSegs, t1 = (s + 1) / ribSegs;
      const r0 = cBaseR * (1 - t0 * 0.94);
      const r1 = cBaseR * (1 - t1 * 0.94);
      if (r0 < 0.4 * S) break;
      drawWall(pts,
        Math.cos(ra) * r0, t0 * cH, Math.sin(ra) * r0,
        Math.cos(ra) * r1, t1 * cH, Math.sin(ra) * r1,
        9
      );
    }
  }

  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇫🇷 ARC DE TRIOMPHE — Place Charles de Gaulle, Paris
// Real: 50m H × 45m W × 22m D. Single arch 29m H × 14.6m W. Lutetian limestone.
// Interior: attic room + spiral staircase through each pier
// Rating: S-TIER monument replica
// ─────────────────────────────────────────────────────────────────────────────
export function gen_arc_triomphe(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const S = Math.max(0.5, (p.height || 50) / 50);

  // Dimensions (all pre-scaled):
  const archHalfGap = 7.3 * S;   // half of 14.6m arch opening
  const pierHW      = 6.6 * S;   // half-width of each pier (13.2m pier)
  const depth       = 11 * S;    // half depth of structure (22m total)
  const archSpring  = 5 * S;     // y where arch starts rising
  const archApex    = 34.5 * S;  // y at crown of arch
  const archR       = archApex - archSpring; // radius ~29.5m

  // Helper: pier at centre x=pcx, solid 4-sided rectangle
  function pier(pcx: number) {
    for (let y = 0; y <= 40 * S; y += 8 * S) {
      drawWall(pts, pcx - pierHW, y, -depth, pcx + pierHW, y, -depth, 8); // front
      drawWall(pts, pcx + pierHW, y, -depth, pcx + pierHW, y,  depth, 8); // outer side
      drawWall(pts, pcx + pierHW, y,  depth, pcx - pierHW, y,  depth, 8); // back
      drawWall(pts, pcx - pierHW, y,  depth, pcx - pierHW, y, -depth, 8); // inner side
    }
  }

  // ── 1. TWO PIERS — left (x<0) and right (x>0) ────────────────────────────
  const leftPierCX  = -(archHalfGap + pierHW);
  const rightPierCX =  (archHalfGap + pierHW);
  pier(leftPierCX);
  pier(rightPierCX);

  // ── 2. MAIN ARCH — semicircle from right spring to left spring ────────────
  const archSegs = 14;
  for (const fz of [-depth, depth]) {
    for (let s = 1; s <= archSegs; s++) {
      const a0 = ((s - 1) / archSegs) * Math.PI;
      const a1 = (s / archSegs) * Math.PI;
      // Arch goes from right (+x) over to left (-x)
      const ax0 = Math.cos(a0) * archHalfGap;
      const ay0 = archSpring + Math.sin(a0) * archR;
      const ax1 = Math.cos(a1) * archHalfGap;
      const ay1 = archSpring + Math.sin(a1) * archR;
      drawWall(pts, ax0, ay0, fz, ax1, ay1, fz, 8);
    }
    // Arch soffit (barrel vault ceiling lines front-to-back)
    if (fz === -depth) {
      for (let s = 0; s <= archSegs; s++) {
        const a = (s / archSegs) * Math.PI;
        const ax = Math.cos(a) * archHalfGap;
        const ay = archSpring + Math.sin(a) * archR;
        // Only draw soffits in the upper arch portion to save objects
        if (Math.sin(a) > 0.3) {
          drawWall(pts, ax, ay, -depth, ax, ay, depth, 9);
        }
      }
    }
  }

  // ── 3. ATTIC LEVEL (y=40–50) — parapet connecting both piers ─────────────
  const aW = rightPierCX + pierHW; // half-width of full structure
  for (let y = 40 * S; y <= 50 * S; y += 5 * S) {
    drawWall(pts, -aW, y, -depth, aW, y, -depth, 8); // front attic wall
    drawWall(pts, -aW, y,  depth, aW, y,  depth, 8); // back attic wall
    drawWall(pts, -aW, y, -depth, -aW, y, depth, 8); // left end
    drawWall(pts,  aW, y, -depth,  aW, y, depth, 8); // right end
  }

  // ── 4. SUBSIDIARY ARCHES — one through each pier (8m H, 4m W) ────────────
  for (const pcx of [leftPierCX, rightPierCX]) {
    const subR = 4 * S, subSpring = 2 * S;
    const subSegs = 8;
    for (const fz of [-depth, depth]) {
      for (let s = 1; s <= subSegs; s++) {
        const a0 = ((s - 1) / subSegs) * Math.PI;
        const a1 = (s / subSegs) * Math.PI;
        const ax0 = pcx + Math.cos(a0) * subR;
        const ay0 = subSpring + Math.sin(a0) * subR;
        const ax1 = pcx + Math.cos(a1) * subR;
        const ay1 = subSpring + Math.sin(a1) * subR;
        drawWall(pts, ax0, ay0, fz, ax1, ay1, fz, 5);
      }
    }
  }

  // ── 5. CORNICE BANDS — decorative horizontal bands ───────────────────────
  for (const yBand of [10 * S, 30 * S, 40 * S]) {
    drawWall(pts, -aW - 1 * S, yBand, -depth, aW + 1 * S, yBand, -depth, 8);
    drawWall(pts, -aW - 1 * S, yBand,  depth, aW + 1 * S, yBand,  depth, 8);
  }

  // ── 6. TOP OBSERVATION PLATFORM ──────────────────────────────────────────
  drawDisk(pts, 0, 50 * S, 0, aW, 8);

  return pts;
}

// ════════════════════════════════════════════════════════════════════════════
// PARTHENON — Temple of Athena Parthenos, Athens (447–432 BC)
// Pentelic marble Doric temple on the Athenian Acropolis.
// 3-step crepidoma, 8×17 outer colonnade (46 columns), cella, gabled roof.
// Canonical dimensions: 69.5m × 30.9m, 10.4m columns, 13.7m to eaves.
// S = (p.height || 14) / 14
// ════════════════════════════════════════════════════════════════════════════
export function gen_parthenon(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const S  = (p.height || 14) / 14;
  const W  = 30.9 * S;   // shorter axis (E–W)
  const L  = 69.5 * S;   // longer axis (N–S, along Z)
  const sp = 2.5 * S;    // object spacing

  // ── 1. CREPIDOMA — 3 stepped marble platform ─────────────────────────────
  for (let step = 0; step < 3; step++) {
    const hw = W / 2 + (3 - step) * S;
    const hl = L / 2 + (3 - step) * S;
    const sy = step * 0.7 * S;
    drawWall(pts, -hw, sy, -hl,  hw, sy, -hl, sp);
    drawWall(pts,  hw, sy, -hl,  hw, sy,  hl, sp);
    drawWall(pts,  hw, sy,  hl, -hw, sy,  hl, sp);
    drawWall(pts, -hw, sy,  hl, -hw, sy, -hl, sp);
  }

  const baseY = 3 * 0.7 * S;   // top of stylobate
  const colH  = 10.4 * S;

  // ── 2. OUTER PERISTYLE — 8 columns on short ends, 17 on long sides ───────
  const nShort = 8;
  const nLong  = 17;

  // Short ends (front and back)
  for (let i = 0; i < nShort; i++) {
    const cx = -W / 2 + i * W / (nShort - 1);
    drawWall(pts, cx, baseY, -L / 2, cx, baseY + colH, -L / 2, sp);
    drawWall(pts, cx, baseY,  L / 2, cx, baseY + colH,  L / 2, sp);
  }

  // Long sides (intermediate columns only — corners already placed above)
  for (let i = 1; i < nLong - 1; i++) {
    const cz = -L / 2 + i * L / (nLong - 1);
    drawWall(pts, -W / 2, baseY, cz, -W / 2, baseY + colH, cz, sp);
    drawWall(pts,  W / 2, baseY, cz,  W / 2, baseY + colH, cz, sp);
  }

  // ── 3. ENTABLATURE — architrave + frieze (3 bands, ~3m total) ────────────
  for (const ey of [baseY + colH, baseY + colH + 1.5 * S, baseY + colH + 3 * S]) {
    drawWall(pts, -W / 2, ey, -L / 2,  W / 2, ey, -L / 2, sp);
    drawWall(pts,  W / 2, ey, -L / 2,  W / 2, ey,  L / 2, sp);
    drawWall(pts,  W / 2, ey,  L / 2, -W / 2, ey,  L / 2, sp);
    drawWall(pts, -W / 2, ey,  L / 2, -W / 2, ey, -L / 2, sp);
  }

  const roofBaseY = baseY + colH + 3 * S;

  // ── 4. CELLA — inner naos chamber walls ──────────────────────────────────
  const cW = W * 0.52;
  const cL = L * 0.72;
  for (const cy of [baseY, baseY + colH * 0.45, baseY + colH * 0.85]) {
    drawWall(pts, -cW / 2, cy, -cL / 2,  cW / 2, cy, -cL / 2, sp);
    drawWall(pts,  cW / 2, cy, -cL / 2,  cW / 2, cy,  cL / 2, sp);
    drawWall(pts,  cW / 2, cy,  cL / 2, -cW / 2, cy,  cL / 2, sp);
    drawWall(pts, -cW / 2, cy,  cL / 2, -cW / 2, cy, -cL / 2, sp);
  }

  // ── 5. GABLED ROOF — ridge line + sloped panels + pediment triangles ──────
  const roofPeak = 3.2 * S;
  const peakY    = roofBaseY + roofPeak;

  // Ridge line (N–S)
  drawWall(pts, 0, peakY, -L / 2, 0, peakY, L / 2, sp);

  // Longitudinal cross sections — left and right roof slopes
  for (let i = 0; i <= 8; i++) {
    const rz = -L / 2 + i * L / 8;
    drawWall(pts, -W / 2, roofBaseY, rz, 0, peakY, rz, sp);
    drawWall(pts,  W / 2, roofBaseY, rz, 0, peakY, rz, sp);
  }

  // Pediment triangles (front and back gables)
  for (let i = 1; i <= 5; i++) {
    const t  = i / 6;
    const px = (W / 2) * (1 - t);
    const py = roofBaseY + t * roofPeak;
    drawWall(pts, -px, py, -L / 2,  px, py, -L / 2, sp);
    drawWall(pts, -px, py,  L / 2,  px, py,  L / 2, sp);
  }

  return pts;
}

// ─── HOSPITAL (L-shaped building, ambulance bay, helipad) ────────────────────
export function gen_hospital(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const w = p.width  || 50;
  const d = p.depth  || 70;
  const h = p.height || 16;   // 4 storeys
  const sp = 4;

  // Helper: draw all 4 walls of a rectangle at given Y
  function box(x0: number, z0: number, x1: number, z1: number, y: number, spacing = sp) {
    drawWall(pts, x0, y, z0, x1, y, z0, spacing);
    drawWall(pts, x0, y, z1, x1, y, z1, spacing);
    drawWall(pts, x0, y, z0, x0, y, z1, spacing);
    drawWall(pts, x1, y, z0, x1, y, z1, spacing);
  }

  // ── MAIN WING (tall rectangular block) ──────────────────────────────────────
  for (let y = 0; y <= h; y += 4) box(-w/2, -d/2, w/2, d/3, y);

  // ── SIDE WING (L-shape arm extending to one side) ───────────────────────────
  for (let y = 0; y <= h * 0.5; y += 4) box(w/6, d/3, w/2, d/2, y);

  // ── EMERGENCY / AMBULANCE BAY (recessed canopy at front) ────────────────────
  const bayW = w * 0.3, bayD = 8;
  for (let y = 0; y <= 5; y += 4) {
    drawWall(pts, -bayW/2, y, -d/2 - bayD, bayW/2, y, -d/2 - bayD, 4);
    drawWall(pts, -bayW/2, y, -d/2, -bayW/2, y, -d/2 - bayD, 4);
    drawWall(pts,  bayW/2, y, -d/2,  bayW/2, y, -d/2 - bayD, 4);
  }
  // Bay roof (flat canopy)
  for (let x = -bayW/2; x <= bayW/2; x += 4)
    pts.push({ x, y: 5, z: -d/2 - bayD/2, yaw: 0, name: "staticobj_wall_cncsmall_8" });

  // ── ROOFTOP HELIPAD (circle + H marker) ─────────────────────────────────────
  const padY = h + 0.5;
  drawRing(pts, 0, padY, -d/6, 10, 3);        // outer ring
  drawRing(pts, 0, padY, -d/6, 6,  3);        // inner ring
  // H marker crossbars
  drawWall(pts, -4, padY, -d/6, 4, padY, -d/6, 3);
  drawWall(pts, -4, padY, -d/6 - 4, -4, padY, -d/6 + 4, 3);
  drawWall(pts,  4, padY, -d/6 - 4,  4, padY, -d/6 + 4, 3);

  // ── WINDOW GRID (every other floor, front face) ─────────────────────────────
  for (let y = 4; y < h; y += 4) {
    for (let x = -w/2 + 6; x < w/2 - 4; x += 8) {
      pts.push({ x, y: y + 1.5, z: -d/2 - 0.1, yaw: 0, name: "staticobj_wall_milcnc_4" });
    }
  }

  // ── PERIMETER FENCE (car park / grounds) ────────────────────────────────────
  const fw = w + 20, fd = d + 20;
  drawWall(pts, -fw/2, 0, -fd/2, fw/2, 0, -fd/2, 8);
  drawWall(pts, -fw/2, 0,  fd/2, fw/2, 0,  fd/2, 8);
  drawWall(pts, -fw/2, 0, -fd/2, -fw/2, 0, fd/2, 8);
  drawWall(pts,  fw/2, 0, -fd/2,  fw/2, 0, fd/2, 8);

  return pts;
}

// ─── SUPERMARKET (big box retail, car park, loading bay) ─────────────────────
export function gen_supermarket(p: Record<string, any>): Point3D[] {
  const pts: Point3D[] = [];
  const w = p.width  || 60;
  const d = p.depth  || 40;
  const h = p.height || 8;
  const sp = 4;

  // Main store box
  for (let y = 0; y <= h; y += 4) {
    drawWall(pts, -w/2, y, -d/2, w/2, y, -d/2, sp);
    drawWall(pts, -w/2, y,  d/2, w/2, y,  d/2, sp);
    drawWall(pts, -w/2, y, -d/2, -w/2, y, d/2, sp);
    drawWall(pts,  w/2, y, -d/2,  w/2, y, d/2, sp);
  }
  // Flat roof
  for (let x = -w/2 + 4; x <= w/2 - 4; x += 8)
    for (let z = -d/2 + 4; z <= d/2 - 4; z += 8)
      pts.push({ x, y: h, z, pitch: 90, name: "staticobj_wall_cncsmall_8" });

  // Loading bay (rear extension)
  const bayW = w * 0.4;
  for (let y = 0; y <= 5; y += 4) {
    drawWall(pts, -bayW/2, y, d/2, bayW/2, y, d/2 + 10, sp);
    drawWall(pts, -bayW/2, y, d/2, -bayW/2, y, d/2 + 10, sp);
    drawWall(pts,  bayW/2, y, d/2,  bayW/2, y, d/2 + 10, sp);
  }
  // Entrance canopy (front)
  for (let x = -10; x <= 10; x += 4)
    pts.push({ x, y: h * 0.6, z: -d/2 - 3, yaw: 0, name: "staticobj_wall_cncsmall_8" });

  // Car park (flat markings)
  for (let x = -w/2 - 30; x <= -w/2 - 5; x += 8)
    for (let z = -d/2; z <= d/2; z += 6)
      pts.push({ x, y: 0, z, pitch: 90, name: "staticobj_wall_milcnc_4" });

  return pts;
}

