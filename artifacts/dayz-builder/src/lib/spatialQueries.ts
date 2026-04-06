
import { Point3D } from "./shapeGenerators";

export interface SpatialIndex {
  grid: Map<string, any[]>;
  cellSize: number;
}

export function buildSpatialIndex(objects: any[]): SpatialIndex {
  const cellSize = 10;
  const grid = new Map<string, any[]>();
  
  for (const obj of objects) {
    const gx = Math.floor(obj.x / cellSize);
    const gy = Math.floor(obj.y / cellSize);
    const gz = Math.floor(obj.z / cellSize);
    const key = `${gx},${gy},${gz}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(obj);
  }
  
  return { grid, cellSize };
}

export function queryNearbyObjects(index: SpatialIndex, point: { x: number; y: number; z: number }, radius: number) {
  const { grid, cellSize } = index;
  const rCells = Math.ceil(radius / cellSize);
  const px = Math.floor(point.x / cellSize);
  const py = Math.floor(point.y / cellSize);
  const pz = Math.floor(point.z / cellSize);
  
  const results: any[] = [];
  for (let ix = -rCells; ix <= rCells; ix++) {
    for (let iy = -rCells; iy <= rCells; iy++) {
      for (let iz = -rCells; iz <= rCells; iz++) {
        const key = `${px + ix},${py + iy},${pz + iz}`;
        const cell = grid.get(key);
        if (cell) {
          for (const obj of cell) {
            const dx = obj.x - point.x;
            const dy = obj.y - point.y;
            const dz = obj.z - point.z;
            if (dx * dx + dy * dy + dz * dz <= radius * radius) {
              results.push(obj);
            }
          }
        }
      }
    }
  }
  return results;
}

export function findNearestObject(index: SpatialIndex, point: { x: number; y: number; z: number }, filterFn?: (o: any) => boolean) {
  const nearby = queryNearbyObjects(index, point, index.cellSize * 2);
  let best = null;
  let minDist = Infinity;
  
  for (const o of nearby) {
    if (filterFn && !filterFn(o)) continue;
    const d = (o.x - point.x) ** 2 + (o.y - point.y) ** 2 + (o.z - point.z) ** 2;
    if (d < minDist) {
      minDist = d;
      best = o;
    }
  }
  return best;
}

export function isAreaEnclosed(index: SpatialIndex, region: { x: number; y: number; z: number; w: number; h: number; d: number }) {
  // Checks if region has walls/floors on all sides
  return false; // Placeholder
}

export function isCorridorWalkable(index: SpatialIndex, start: Point3D, end: Point3D, width: number, height: number) {
  // Simple check for obstructions in a corridor segment
  const samples = 4;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const pt = { 
      x: start.x + (end.x - start.x) * t, 
      y: start.y + (end.y - start.y) * t, 
      z: start.z + (end.z - start.z) * t 
    };
    const blockers = queryNearbyObjects(index, pt, width);
    if (blockers.length > 0) return false;
  }
  return true;
}
