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

export function generateRandomStructure(opts: RandomStructureOptions): PlacedObject[] {
  const { seed, category, count, radius, posX, posY, posZ } = opts;
  const objects: PlacedObject[] = [];
  const family = OBJECT_FAMILY_MAP[category];
  
  if (!family) return [];

  const classes = Object.values(family).filter(v => Array.isArray(v)).flat() as string[];
  if (classes.length === 0) return [];

  function seededRandom(s: number) {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  }

  for (let i = 0; i < count; i++) {
    const r = radius * Math.sqrt(seededRandom(seed + i));
    const theta = seededRandom(seed + i * 1.5 + 100) * 2 * Math.PI;
    
    const dx = r * Math.cos(theta);
    const dz = r * Math.sin(theta);
    const dy = seededRandom(seed + i * 2.1 + 200) * (radius * 0.15);
    const yaw = seededRandom(seed + i * 0.8 + 300) * 360;
    
    const classname = classes[Math.floor(seededRandom(seed + i * 1.2 + 400) * classes.length)];
    
    objects.push({
      classname,
      dx: posX + dx,
      dy: posY + dy,
      dz: posZ + dz,
      yaw,
      pitch: 0,
      roll: 0,
      note: `Random ${category} ${i}`,
      level: 0,
      section: "decor"
    });
  }
  
  return objects;
}
