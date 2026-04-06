import { generateLootForObject, PlacedObject } from "./lootGenerator";
import { STRUCTURAL_POOL } from "./constructionZoneData";
import { MAX_OBJECTS } from "./constants";

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
    }
  };
}

export interface ConstructionZoneOptions {
  seed: number;
  radius: number;
  posX: number;
  posY: number;
  posZ: number;
  yaw: number;
  includeLoot: boolean;
  lootChance: number;
}

export function generateConstructionZone(opts: ConstructionZoneOptions): PlacedObject[] {
  const rng = mkRng(opts.seed);
  const objects: PlacedObject[] = [];
  const placed: { x: number; z: number; r: number }[] = [];

  function tooClose(x: number, z: number, r: number): boolean {
    return placed.some(p => Math.hypot(p.x - x, p.z - z) < (p.r + r));
  }

  // 1. Place major structures first (Buildings & Cranes)
  for (const prop of STRUCTURAL_POOL) {
    // Only process major structures here
    if (prop.w < 5) continue; 

    const count = rng.int(prop.count[0], prop.count[1]);
    for (let i = 0; i < count; i++) {
      let found = false;
      for (let attempt = 0; attempt < 50; attempt++) {
        const ang = rng.next() * Math.PI * 2;
        const dist = rng.next() * opts.radius * 0.7;
        const x = Math.cos(ang) * dist;
        const z = Math.sin(ang) * dist;
        const r = Math.max(prop.w, prop.d) / 2 + 2;

        if (!tooClose(x, z, r)) {
          const yaw = rng.int(0, 3) * 90 + opts.yaw;
          const worldX = opts.posX + x;
          const worldZ = opts.posZ + z;
          
          objects.push({
            classname: prop.classname,
            note: prop.label,
            dx: worldX,
            dy: opts.posY,
            dz: worldZ,
            yaw,
            pitch: 0,
            roll: 0,
            level: 0,
            section: "exterior"
          });

          if (opts.includeLoot) {
             objects.push(...generateLootForObject(prop.classname, worldX, opts.posY, worldZ, yaw, 0, opts.seed + objects.length, "industrial", opts.lootChance));
          }

          placed.push({ x, z, r });
          found = true;
          break;
        }
      }
    }
  }

  // 2. Place minor props (Jersey barriers, scaffolding, wrecks)
  for (const prop of STRUCTURAL_POOL) {
    if (prop.w >= 5) continue;

    const count = rng.int(prop.count[0], prop.count[1]);
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 30; attempt++) {
        const ang = rng.next() * Math.PI * 2;
        const dist = rng.next() * opts.radius * 0.9;
        const x = Math.cos(ang) * dist;
        const z = Math.sin(ang) * dist;
        const r = Math.max(prop.w, prop.d) / 2 + 0.5;

        if (!tooClose(x, z, r)) {
          const yaw = (prop.wallSnap ? rng.int(0, 3) * 90 : rng.next() * 360) + opts.yaw;
          const worldX = opts.posX + x;
          const worldZ = opts.posZ + z;

          objects.push({
            classname: prop.classname,
            note: prop.label,
            dx: worldX,
            dy: opts.posY,
            dz: worldZ,
            yaw,
            pitch: 0,
            roll: 0,
            level: 0,
            section: "decor"
          });

          if (opts.includeLoot) {
             objects.push(...generateLootForObject(prop.classname, worldX, opts.posY, worldZ, yaw, 0, opts.seed + objects.length, "industrial", opts.lootChance));
          }

          placed.push({ x, z, r });
          break;
        }
      }
    }
  }

  // 3. Mandatory Rule 4 Construction Loot
  if (opts.includeLoot) {
    const loot: { classname: string; count: number; note: string }[] = [
      { classname: "NailBox",          count: 10, note: "Weight: 50" },
      { classname: "MetalPlate",       count: 5,  note: "Weight: 30" },
      { classname: "Wrench",           count: 3,  note: "Weight: 20" },
      { classname: "Hammer",           count: 3,  note: "Weight: 20" },
      { classname: "CanisterGasoline", count: 2,  note: "Weight: 10" },
      { classname: "HandSaw",          count: 2,  note: "Weight: 10" },
      { classname: "Pliers",           count: 2,  note: "Weight: 10" },
    ];

    for (const item of loot) {
      for (let i = 0; i < item.count; i++) {
        for (let attempt = 0; attempt < 100; attempt++) {
          const ang = rng.next() * Math.PI * 2;
          const dist = rng.next() * opts.radius * 0.5; // Place toward the center
          const x = Math.cos(ang) * dist;
          const z = Math.sin(ang) * dist;
          const r = 0.5;

          if (!tooClose(x, z, r)) {
            objects.push({
              classname: item.classname,
              note: item.note,
              dx: opts.posX + x,
              dy: opts.posY,
              dz: opts.posZ + z,
              yaw: rng.next() * 360,
              pitch: 0,
              roll: 0,
              level: 0,
              section: "loot"
            });
            placed.push({ x, z, r });
            break;
          }
        }
      }
    }
  }

  return objects.slice(0, MAX_OBJECTS);
}
