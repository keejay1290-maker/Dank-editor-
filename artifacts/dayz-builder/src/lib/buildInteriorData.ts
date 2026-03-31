// ─── Build Interior & Loot Generator ─────────────────────────────────────────
// Generates interior walls, decorative props, and random loot for preset builds.
// All objects exported as SpawnObject entries (same format as the build itself).

import type { CompletedBuild } from "./completedBuilds";
import { LOOT_BY_TYPE } from "./dayzLootDB";

export interface SpawnEntry {
  classname: string;
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  roll: number;
  scale: number;
  label: string; // human-readable for preview
}

// ── Seeded RNG (same mulberry32 used elsewhere in the app) ────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Interior decoration objects (verified DayZ classnames) ───────────────────
const WALL_PROPS = [
  { classname: "StaticObj_Furniture_shelf_DZ",    label: "Shelf Unit",        w: 1.0, h: 1.8, d: 0.4 },
  { classname: "StaticObj_ammoboxes_single",       label: "Ammo Box",          w: 0.6, h: 0.4, d: 0.4 },
  { classname: "Land_BusStation_wall_bench",       label: "Bench",             w: 2.0, h: 0.5, d: 0.5 },
];

const FLOOR_PROPS = [
  { classname: "WoodenCrate",                      label: "Wooden Crate",      w: 0.8, h: 0.6, d: 0.8 },
  { classname: "WoodenCrateSmall",                 label: "Wooden Crate (S)",  w: 0.5, h: 0.4, d: 0.5 },
  { classname: "Barrel_Blue",                      label: "Barrel (Blue)",     w: 0.6, h: 1.0, d: 0.6 },
  { classname: "Barrel_Green",                     label: "Barrel (Green)",    w: 0.6, h: 1.0, d: 0.6 },
  { classname: "Barrel_Red",                       label: "Barrel (Red)",      w: 0.6, h: 1.0, d: 0.6 },
  { classname: "PalletBox_DE",                     label: "Pallet Box",        w: 1.2, h: 0.2, d: 0.8 },
  { classname: "StaticObj_Lamp_Ind",               label: "Industrial Lamp",   w: 0.3, h: 3.0, d: 0.3 },
];

const WALL_CLASSNAMES = [
  "Land_Wall_Concrete_4m_DE",
  "Land_Wall_Brick_4m_DE",
];

// ── Loot count by build size ──────────────────────────────────────────────────
function lootCount(build: CompletedBuild): number {
  const total = (build.frameCount ?? 10) + (build.fillCount ?? 10);
  if (total < 10)  return 3 + Math.floor(Math.random() * 3);  // 3–5
  if (total < 30)  return 5 + Math.floor(Math.random() * 6);  // 5–10
  return 8 + Math.floor(Math.random() * 8);                    // 8–15
}

// ── Main generator ────────────────────────────────────────────────────────────
export function generateBuildInterior(
  build: CompletedBuild,
  lootSeed: number,
): SpawnEntry[] {
  if (!build.interiorType) return [];

  const rng = mulberry32(lootSeed);
  const entries: SpawnEntry[] = [];
  const { posX, posY, posZ, interiorType, lootTheme = "mixed" } = build;

  // Approximate build radius from shape params
  const radius = Math.max(
    build.params.radius ?? build.params.radiusX ?? build.params.size ?? 8,
    4,
  );

  // ── Interior walls (building type only) ──────────────────────────────────
  if (interiorType === "building") {
    const wallClass = WALL_CLASSNAMES[Math.floor(rng() * WALL_CLASSNAMES.length)];
    const wallCount = 2 + Math.floor(rng() * 3); // 2–4 walls
    for (let i = 0; i < wallCount; i++) {
      const angle = (rng() * Math.PI * 2);
      const dist  = radius * 0.3 + rng() * radius * 0.3; // 30–60% of radius
      const wx = posX + Math.cos(angle) * dist;
      const wz = posZ + Math.sin(angle) * dist;
      const yaw = (angle * 180 / Math.PI) + (rng() > 0.5 ? 0 : 90);
      entries.push({
        classname: wallClass,
        x: wx, y: posY, z: wz,
        pitch: 0, yaw, roll: 0, scale: 1,
        label: "Interior Wall",
      });
    }
  }

  // ── Decorative props ──────────────────────────────────────────────────────
  const propCount = interiorType === "building" ? 6 + Math.floor(rng() * 7)  // 6–12
                  : interiorType === "open"     ? 3 + Math.floor(rng() * 4)  // 3–6
                  : 2 + Math.floor(rng() * 3);                                // 2–4

  const placed: { x: number; z: number }[] = [];

  for (let i = 0; i < propCount; i++) {
    const isWallProp = interiorType === "building" && rng() > 0.5;
    const pool = isWallProp ? WALL_PROPS : FLOOR_PROPS;
    const prop = pool[Math.floor(rng() * pool.length)];

    // Place within the build perimeter, min 0.8m from other props
    let px = 0, pz = 0, attempts = 0;
    do {
      const angle = rng() * Math.PI * 2;
      const dist  = rng() * radius * 0.7;
      px = posX + Math.cos(angle) * dist;
      pz = posZ + Math.sin(angle) * dist;
      attempts++;
    } while (
      attempts < 20 &&
      placed.some(p => Math.hypot(p.x - px, p.z - pz) < 0.8)
    );

    placed.push({ x: px, z: pz });
    const yaw = rng() * 360;

    entries.push({
      classname: prop.classname,
      x: px, y: posY + 0.05, z: pz,
      pitch: 0, yaw, roll: 0, scale: 1,
      label: prop.label,
    });
  }

  // ── Loot items ────────────────────────────────────────────────────────────
  const pool = LOOT_BY_TYPE[lootTheme] ?? LOOT_BY_TYPE.mixed;
  const count = lootCount(build);

  // Seeded shuffle of pool, pick `count` items
  const shuffled = [...pool].sort(() => rng() - 0.5);
  const picks = shuffled.slice(0, Math.min(count, shuffled.length));

  for (const item of picks) {
    let lx = 0, lz = 0, attempts = 0;
    do {
      const angle = rng() * Math.PI * 2;
      const dist  = rng() * radius * 0.65;
      lx = posX + Math.cos(angle) * dist;
      lz = posZ + Math.sin(angle) * dist;
      attempts++;
    } while (
      attempts < 20 &&
      placed.some(p => Math.hypot(p.x - lx, p.z - lz) < 0.5)
    );

    placed.push({ x: lx, z: lz });

    entries.push({
      classname: item.classname,
      x: lx, y: posY + 0.1, z: lz,
      pitch: 0, yaw: rng() * 360, roll: 0, scale: 1,
      label: item.displayName,
    });
  }

  return entries;
}

// ── Serialise to init.c SpawnObject calls ─────────────────────────────────────
export function interiorToInitC(entries: SpawnEntry[]): string {
  if (entries.length === 0) return "";
  const lines = [
    `// ── Interior & Loot — ${entries.length} objects ──`,
    ...entries.map(e =>
      `SpawnObject("${e.classname}", "${e.x.toFixed(3)} ${e.y.toFixed(3)} ${e.z.toFixed(3)}", "${e.pitch.toFixed(2)} ${e.yaw.toFixed(2)} ${e.roll.toFixed(2)}", ${e.scale.toFixed(2)}); // ${e.label}`
    ),
  ];
  return lines.join("\n");
}

// ── Serialise to objectSpawnersArr JSON entries ───────────────────────────────
export function interiorToJSON(entries: SpawnEntry[]): object[] {
  return entries.map(e => ({
    name: e.classname,
    pos: [+e.x.toFixed(6), +e.y.toFixed(6), +e.z.toFixed(6)],
    ypr: [+e.pitch.toFixed(4), +e.yaw.toFixed(4), +e.roll.toFixed(4)],
    scale: +e.scale.toFixed(4),
    enableCEPersistency: 0,
    customString: "",
  }));
}
