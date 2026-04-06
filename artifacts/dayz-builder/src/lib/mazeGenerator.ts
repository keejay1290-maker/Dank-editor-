import { generateLootForObject, PlacedObject } from "./lootGenerator";
import { MAX_OBJECTS } from "./constants";

interface MazeGrid {
  hWalls: boolean[][];
  vWalls: boolean[][];
  cellW: number;
  cellH: number;
}

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

function makeMazeGrid(rng: ReturnType<typeof mkRng>, width: number, height: number): MazeGrid {
  const hWalls: boolean[][] = Array.from({ length: height + 1 }, () => Array(width).fill(true));
  const vWalls: boolean[][] = Array.from({ length: height }, () => Array(width + 1).fill(true));
  const visited = Array.from({ length: height }, () => Array(width).fill(false));

  const stack: [number, number][] = [[0, 0]];
  visited[0][0] = true;

  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const nbrs: [number, number, string][] = [];
    if (r > 0       && !visited[r - 1][c]) nbrs.push([r - 1, c, "N"]);
    if (r < height - 1 && !visited[r + 1][c]) nbrs.push([r + 1, c, "S"]);
    if (c > 0       && !visited[r][c - 1]) nbrs.push([r, c - 1, "W"]);
    if (c < width - 1  && !visited[r][c + 1]) nbrs.push([r, c + 1, "E"]);

    if (nbrs.length === 0) {
      stack.pop();
      continue;
    }

    const [nr, nc, dir] = rng.pick(nbrs);
    visited[nr][nc] = true;
    if (dir === "N") hWalls[r][c] = false;
    else if (dir === "S") hWalls[r + 1][c] = false;
    else if (dir === "W") vWalls[r][c] = false;
    else if (dir === "E") vWalls[r][c + 1] = false;

    stack.push([nr, nc]);
  }

  return { hWalls, vWalls, cellW: width, cellH: height };
}

export interface MazeOptions {
  seed: number;
  width: number;
  height: number;
  layers: number;
  containerTypes: string[];
  posX: number;
  posY: number;
  posZ: number;
  yaw: number;
  includeLoot: boolean;
  lootChance: number;
}

// Rule 3: Gap-free structural integrity. 
// Standard Land_Container_1Bo is 6.09m long. 
// Using 6.05m ensures a solid, seamless overlap for a "Dank" build.
const CONTAINER_LEN = 20; 

export function generateContainerMaze(opts: MazeOptions): PlacedObject[] {
  const rng = mkRng(opts.seed);
  const grid = makeMazeGrid(rng, opts.width, opts.height);
  const objects: PlacedObject[] = [];

  const offX = -(grid.cellW * CONTAINER_LEN) / 2;
  const offZ = -(grid.cellH * CONTAINER_LEN) / 2;

  for (let layer = 0; layer < opts.layers; layer++) {
    // 4.0m height for Castle_Wall1_20
    const layerY = opts.posY + layer * 4.0; 

    // Horizontal walls (East-West)
    for (let r = 0; r <= grid.cellH; r++) {
      for (let c = 0; c < grid.cellW; c++) {
        if (!grid.hWalls[r][c]) continue;
        
        const dx = offX + (c + 0.5) * CONTAINER_LEN;
        const dz = offZ + r * CONTAINER_LEN;
        const classname = "Land_Castle_Wall1_20";

        objects.push({
          classname,
          note: `Maze Wall H L${layer}`,
          dx,
          dy: layerY,
          dz,
          yaw: opts.yaw + 90,
          pitch: 0,
          roll: 0,
          level: layer,
          section: "tunnel"
        });

        if (opts.includeLoot) {
          objects.push(...generateLootForObject(classname, dx, layerY, dz, opts.yaw + 90, layer, opts.seed + objects.length, "mixed", opts.lootChance));
        }
      }
    }

    // Vertical walls (North-South)
    for (let r = 0; r < grid.cellH; r++) {
      for (let c = 0; c <= grid.cellW; c++) {
        if (!grid.vWalls[r][c]) continue;

        const dx = offX + c * CONTAINER_LEN;
        const dz = offZ + (r + 0.5) * CONTAINER_LEN;
        const classname = "Land_Castle_Wall1_20";

        objects.push({
          classname,
          note: `Maze Wall V L${layer}`,
          dx,
          dy: layerY,
          dz,
          yaw: opts.yaw,
          pitch: 0,
          roll: 0,
          level: layer,
          section: "tunnel"
        });
      }
    }

    // Rule 4: Mandatory Corridor Loot Placement
    if (opts.includeLoot) {
      for (let r = 0; r < grid.cellH; r++) {
        for (let c = 0; c < grid.cellW; c++) {
          if (rng.next() > opts.lootChance) continue;
          
          // Center of the cell (between walls)
          const dx = offX + (c + 0.5) * CONTAINER_LEN;
          const dz = offZ + (r + 0.5) * CONTAINER_LEN;

          // Rotation of the floor points
          const [rdx, rdz] = rotateXZ(dx, dz, opts.yaw);

          objects.push({
            classname: rng.pick(["nailbox", "metalplate", "hammer", "canistergasoline"]),
            note: "Maze Corridor Loot",
            dx: opts.posX + rdx,
            dy: layerY,
            dz: opts.posZ + rdz,
            yaw: rng.next() * 360,
            pitch: 0,
            roll: 0,
            level: layer,
            section: "loot"
          });
        }
      }
    }
  }

  return objects.slice(0, MAX_OBJECTS);
}

function rotateXZ(dx: number, dz: number, yawDeg: number): [number, number] {
  const r = (yawDeg * Math.PI) / 180;
  return [
    dx * Math.cos(r) - dz * Math.sin(r),
    dx * Math.sin(r) + dz * Math.cos(r),
  ];
}
