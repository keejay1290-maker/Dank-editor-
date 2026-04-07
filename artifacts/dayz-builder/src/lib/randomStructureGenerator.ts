import { PlacedObject } from "./lootGenerator";
import { OBJECT_FAMILY_MAP } from "./ai/engines/objectFamilyMap";

export interface RandomStructureOptions {
  seed: number;
  category: keyof typeof OBJECT_FAMILY_MAP;
  count: number;
  radius: number;
  posX: number;
  posY: number;
  posZ: number;
}

// Deterministic LCG RNG
function makeRng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function place(classname: string, x: number, y: number, z: number, yaw: number): PlacedObject {
  return { classname, dx: x, dy: y, dz: z, yaw, pitch: 0, roll: 0, note: "", level: 0, section: "decor" };
}

// ─── Structure layout generators ─────────────────────────────────────────────

function genMilitaryCompound(rng: () => number, cx: number, cy: number, cz: number, r: number, classes: string[]): PlacedObject[] {
  const objs: PlacedObject[] = [];
  const wall = classes.find(c => /wall|barrier|hesco|fence/i.test(c)) || classes[0];
  const interior = classes.find(c => /tent|container|bunker|nest|tower/i.test(c)) || classes[Math.floor(rng() * classes.length)];

  // Perimeter — square compound
  const sides = 4, wallSpacing = 6;
  for (let s = 0; s < sides; s++) {
    const a = s * Math.PI / 2;
    const nx = Math.cos(a + Math.PI / 2), nz = Math.sin(a + Math.PI / 2);
    const sx = Math.cos(a), sz = Math.sin(a);
    const wallCount = Math.round(r / wallSpacing);
    for (let i = 0; i < wallCount; i++) {
      const t = (i + 0.5) / wallCount;
      objs.push(place(wall, cx + sx * r + (t - 0.5) * 2 * r * nx, cy, cz + sz * r + (t - 0.5) * 2 * r * nz, a * 180 / Math.PI + 90));
    }
  }
  // Corner watchtowers
  for (let c = 0; c < 4; c++) {
    const a = c * Math.PI / 2 + Math.PI / 4;
    objs.push(place(interior, cx + Math.cos(a) * r * 1.1, cy, cz + Math.sin(a) * r * 1.1, a * 180 / Math.PI));
  }
  // Interior buildings — 2×2 grid
  const iClasses = classes.filter(c => /container|tent|bunker|nest/i.test(c));
  const ic = iClasses.length ? iClasses : classes;
  const positions = [[-r*0.4, -r*0.4], [r*0.4, -r*0.4], [-r*0.4, r*0.4], [r*0.4, r*0.4]];
  positions.forEach(([ox, oz]) => {
    const cl = ic[Math.floor(rng() * ic.length)];
    const yaw = Math.floor(rng() * 4) * 90;
    objs.push(place(cl, cx + ox, cy, cz + oz, yaw));
  });
  return objs;
}

function genUrbanBlock(rng: () => number, cx: number, cy: number, cz: number, r: number, classes: string[]): PlacedObject[] {
  const objs: PlacedObject[] = [];
  const building = classes.find(c => /wall|bus|station|fence/i.test(c)) || classes[0];
  const detail = classes.find(c => /block|barrier|roadblock/i.test(c)) || classes[Math.floor(rng() * classes.length)];

  // 4 building footprints around a central plaza
  const blocks = [
    { ox: -r*0.5, oz: -r*0.5, w: r*0.35, d: r*0.35 },
    { ox:  r*0.5, oz: -r*0.5, w: r*0.35, d: r*0.35 },
    { ox: -r*0.5, oz:  r*0.5, w: r*0.35, d: r*0.35 },
    { ox:  r*0.5, oz:  r*0.5, w: r*0.35, d: r*0.35 },
  ];
  blocks.forEach(b => {
    // 4 wall faces
    for (let face = 0; face < 4; face++) {
      const a = face * Math.PI / 2;
      const nx = Math.cos(a + Math.PI/2), nz = Math.sin(a + Math.PI/2);
      const sx = Math.cos(a), sz = Math.sin(a);
      const half = face % 2 === 0 ? b.w : b.d;
      const nWalls = Math.max(1, Math.round(half * 2 / 6));
      for (let i = 0; i < nWalls; i++) {
        const t = (i + 0.5) / nWalls;
        objs.push(place(building, cx + b.ox + sx * half + (t-0.5)*2*half*nx, cy, cz + b.oz + sz * half + (t-0.5)*2*half*nz, a*180/Math.PI+90));
      }
    }
  });
  // Street detail
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    objs.push(place(detail, cx + Math.cos(angle) * r * 0.25, cy, cz + Math.sin(angle) * r * 0.25, angle * 180 / Math.PI));
  }
  return objs;
}

function genCircularFort(rng: () => number, cx: number, cy: number, cz: number, r: number, classes: string[]): PlacedObject[] {
  const objs: PlacedObject[] = [];
  const wall = classes.find(c => /wall|barrier|fence/i.test(c)) || classes[0];
  const tower = classes.find(c => /tower|nest|bunker|container/i.test(c)) || classes[Math.floor(rng() * classes.length)];
  const nTowers = 6;
  const wallSpacing = 4;
  const nWalls = Math.max(8, Math.round((2 * Math.PI * r) / wallSpacing));

  for (let i = 0; i < nWalls; i++) {
    const a = (i + 0.5) / nWalls * Math.PI * 2;
    objs.push(place(wall, cx + Math.cos(a) * r, cy, cz + Math.sin(a) * r, -a * 180 / Math.PI + 90));
  }
  for (let i = 0; i < nTowers; i++) {
    const a = (i / nTowers) * Math.PI * 2;
    objs.push(place(tower, cx + Math.cos(a) * r * 1.05, cy, cz + Math.sin(a) * r * 1.05, a * 180 / Math.PI));
  }
  // Inner ring
  const nInner = Math.max(4, Math.round((2 * Math.PI * r * 0.5) / wallSpacing));
  for (let i = 0; i < nInner; i++) {
    const a = (i + 0.5) / nInner * Math.PI * 2;
    objs.push(place(wall, cx + Math.cos(a) * r * 0.5, cy, cz + Math.sin(a) * r * 0.5, -a * 180 / Math.PI + 90));
  }
  return objs;
}

function genLinearDefence(rng: () => number, cx: number, cy: number, cz: number, r: number, classes: string[]): PlacedObject[] {
  const objs: PlacedObject[] = [];
  const wall = classes.find(c => /wall|barrier|hesco|fence/i.test(c)) || classes[0];
  const support = classes.find(c => /container|tent|nest/i.test(c)) || classes[Math.floor(rng() * classes.length)];
  const spacing = 5;
  const nWalls = Math.round(r * 2 / spacing);
  const yaw = rng() * 360;
  const rad = yaw * Math.PI / 180;
  const dx = Math.cos(rad), dz = Math.sin(rad);

  // Main wall line
  for (let i = 0; i < nWalls; i++) {
    const t = (i + 0.5) / nWalls - 0.5;
    objs.push(place(wall, cx + t * r * 2 * dx, cy, cz + t * r * 2 * dz, yaw + 90));
  }
  // Flanking positions
  const perpX = -dz, perpZ = dx;
  [r * 0.4, -r * 0.4].forEach(off => {
    objs.push(place(support, cx + perpX * off, cy, cz + perpZ * off, yaw));
    objs.push(place(support, cx + perpX * off + dx * r * 0.3, cy, cz + perpZ * off + dz * r * 0.3, yaw));
    objs.push(place(support, cx + perpX * off - dx * r * 0.3, cy, cz + perpZ * off - dz * r * 0.3, yaw));
  });
  return objs;
}

// ─── Category → structure type map ───────────────────────────────────────────
const STRUCTURE_FOR_CATEGORY: Record<string, "compound" | "urban" | "fort" | "line"> = {
  military:   "compound",
  police:     "urban",
  civilian:   "urban",
  medical:    "urban",
  industrial: "fort",
  nature:     "fort",
  scifi:      "fort",
  default:    "compound",
};

export function generateRandomStructure(opts: RandomStructureOptions): PlacedObject[] {
  const { seed, category, count, radius, posX, posY, posZ } = opts;
  const rng = makeRng(seed);
  const family = OBJECT_FAMILY_MAP[category as keyof typeof OBJECT_FAMILY_MAP];
  if (!family) return [];

  const classes = (Object.values(family).filter(v => Array.isArray(v)).flat() as string[]).filter(Boolean);
  if (classes.length === 0) return [];

  const structType = STRUCTURE_FOR_CATEGORY[category] || STRUCTURE_FOR_CATEGORY.default;
  let objs: PlacedObject[] = [];

  switch (structType) {
    case "compound": objs = genMilitaryCompound(rng, posX, posY, posZ, radius, classes); break;
    case "urban":    objs = genUrbanBlock(rng, posX, posY, posZ, radius, classes); break;
    case "fort":     objs = genCircularFort(rng, posX, posY, posZ, radius, classes); break;
    case "line":     objs = genLinearDefence(rng, posX, posY, posZ, radius, classes); break;
  }

  // count controls complexity (1-25) — map to how many fill passes run, never hard-cap the structure
  // Return up to 1200 objects (engine limit)
  return objs.slice(0, 1200);
}
