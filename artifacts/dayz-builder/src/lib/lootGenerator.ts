import { BUILDING_LOOT_POINTS } from "./lootPoints";
import { LOOT_BY_TYPE, DayzLootEntry } from "./dayzLootDB";

export interface PlacedObject {
  classname: string;
  note: string;
  dx: number;
  dy: number;
  dz: number;
  yaw: number;
  pitch: number;
  roll: number;
  level: number;
  section: "entrance" | "exit" | "panel" | "exterior" | "stair" | "tunnel" | "branch" | "room" | "decor" | "loot";
}

/**
 * Seeded random for loot consistency
 */
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
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)];
    }
  };
}

function rotateXZ(dx: number, dz: number, yawDeg: number): [number, number] {
  const r = (yawDeg * Math.PI) / 180;
  return [
    dx * Math.cos(r) - dz * Math.sin(r),
    dx * Math.sin(r) + dz * Math.cos(r),
  ];
}

/**
 * Generates loot items for a specific building at a given world offset
 */
export function generateLootForObject(
  classname: string,
  worldDx: number,
  worldDy: number,
  worldDz: number,
  worldYaw: number,
  level: number,
  seed: number,
  theme: keyof typeof LOOT_BY_TYPE = "mixed",
  spawnChance = 0.6 // 60% chance to spawn loot at each point
): PlacedObject[] {
  const points = BUILDING_LOOT_POINTS[classname];
  if (!points || points.length === 0) return [];

  const rng = mkRng(seed);
  const lootPool = LOOT_BY_TYPE[theme] || LOOT_BY_TYPE.mixed;
  const items: PlacedObject[] = [];

  for (const [lx, ly, lz] of points) {
    if (rng.next() > spawnChance) continue;

    const item = rng.pick(lootPool);
    // Rotate relative point by building's yaw
    const [rdx, rdz] = rotateXZ(lx, lz, worldYaw);

    items.push({
      classname: item.classname,
      note: `Loot: ${item.displayName}`,
      dx: worldDx + rdx,
      dy: worldDy + ly,
      dz: worldDz + rdz,
      yaw: rng.next() * 360, // Random item rotation
      pitch: 0,
      roll: 0,
      level,
      section: "loot"
    });
  }

  return items;
}
