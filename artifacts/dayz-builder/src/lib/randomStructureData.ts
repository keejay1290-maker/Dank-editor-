import type { ZoneObject } from "@/ZonePreview3D";

// ─── Shell definitions ────────────────────────────────────────────────────────
export interface ShellDef {
  classname: string;
  label: string;
  w: number;   // interior footprint width (m)
  d: number;   // interior footprint depth (m)
  h: number;   // interior height (m)
  type: "military" | "civilian" | "industrial" | "medieval";
}

export const SHELL_POOL: ShellDef[] = [
  { classname: "Land_Container_1Bo",            label: "Red Container Block",     w:6,  d:2.9, h:2.9, type:"industrial" },
  { classname: "Land_ContainerLocked_Blue_DE",  label: "Blue Container",          w:6,  d:2.9, h:2.9, type:"military"   },
  { classname: "Land_Container_1Mo",            label: "Olive Container",         w:6,  d:2.9, h:2.9, type:"military"   },
  { classname: "StaticObj_BusStation_wall",     label: "Bus Station Wall",        w:8,  d:0.3, h:3.5, type:"civilian"   },
  { classname: "Land_Castle_Wall1_20",          label: "Castle Wall Section",     w:20, d:0.5, h:4.0, type:"medieval"   },
  { classname: "StaticObj_Mil_HBarrier_Big",    label: "HESCO Compound",         w:4,  d:1.0, h:3.0, type:"military"   },
  { classname: "StaticObj_Roadblock_CncBlock",  label: "Concrete Bunker",        w:3,  d:1.5, h:1.2, type:"military"   },
  { classname: "Land_Mil_Barracks1",            label: "Military Barracks",      w:14, d:8,   h:4,   type:"military"   },
  { classname: "Land_Mil_Barracks2",            label: "Large Barracks",         w:18, d:10,  h:4,   type:"military"   },
  { classname: "Land_Shed_W1",                  label: "Wooden Shed",            w:8,  d:6,   h:3,   type:"civilian"   },
  { classname: "Land_Shed_W2",                  label: "Large Shed",             w:12, d:8,   h:4,   type:"civilian"   },
];

// ─── Prop definitions ─────────────────────────────────────────────────────────
export interface PropDef {
  classname: string;
  label: string;
  color: string;
  w: number; h: number; d: number;
  yOffset?: number;   // spawn height offset
  wallAlign?: boolean; // prefer wall placement
  extras?: boolean;    // only when Add Extras is on
}

export const BASE_PROPS: PropDef[] = [
  // Crates & storage
  { classname: "WoodenCrate",                  label: "Wooden Crate",        color: "#7a5a2a", w: 1.2, h: 0.8, d: 0.8, wallAlign: true  },
  { classname: "WoodenCrateSmall",             label: "Small Crate",         color: "#8a6a3a", w: 0.8, h: 0.6, d: 0.6, wallAlign: true  },
  { classname: "WoodenCrate",                  label: "Pallet Box",          color: "#6a4a1a", w: 1.2, h: 1.0, d: 1.0, wallAlign: true  },
  // Barrels (colour randomised at generation time)
  { classname: "Barrel_Blue",                  label: "Blue Barrel",         color: "#1a4a8a", w: 0.6, h: 0.9, d: 0.6  },
  { classname: "Barrel_Green",                 label: "Green Barrel",        color: "#1a6a2a", w: 0.6, h: 0.9, d: 0.6  },
  { classname: "Barrel_Red",                   label: "Red Barrel",          color: "#8a1a1a", w: 0.6, h: 0.9, d: 0.6  },
  { classname: "Barrel_Yellow",                label: "Yellow Barrel",       color: "#c8a020", w: 0.6, h: 0.9, d: 0.6  },
  // Sandbags & fortification
  { classname: "Land_Mil_Fortified_Nest_Small",  label: "Sandbag Nest",        color: "#8a7a5a", w: 3.0, h: 1.0, d: 1.5, wallAlign: true  },
  // Ammo / military
  { classname: "StaticObj_ammoboxes_single",   label: "Ammo Box",            color: "#3a4a2a", w: 0.8, h: 0.5, d: 0.5, wallAlign: true  },
  // Lighting
  { classname: "StaticObj_Lamp_Ind",           label: "Industrial Lamp",     color: "#d4c080", w: 0.3, h: 3.0, d: 0.3, yOffset: 0       },
];

export const EXTRAS_PROPS: PropDef[] = [
  // Firearms (placed at bench/crate height Y+0.8)
  { classname: "M4A1",        label: "M4A1",        color: "#2a2a2a", w: 0.9, h: 0.1, d: 0.1, yOffset: 0.05, extras: true },
  { classname: "M4A1_Black",  label: "M4A1 Black",  color: "#1a1a1a", w: 0.9, h: 0.1, d: 0.1, yOffset: 0.05, extras: true },
  { classname: "AK74",        label: "AK74",         color: "#3a2a1a", w: 0.9, h: 0.1, d: 0.1, yOffset: 0.05, extras: true },
  { classname: "AKM",         label: "AKM",          color: "#2a1a0a", w: 0.9, h: 0.1, d: 0.1, yOffset: 0.05, extras: true },
  { classname: "MP5K",        label: "MP5K",         color: "#2a2a2a", w: 0.6, h: 0.1, d: 0.1, yOffset: 0.05, extras: true },
  { classname: "Glock19",     label: "Glock 19",     color: "#1a1a1a", w: 0.2, h: 0.1, d: 0.1, yOffset: 0.05, extras: true },
  // Furniture
  { classname: "Land_BusStation_wall_bench",         label: "Bench",       color: "#5a4a2a", w: 2.0, h: 0.5, d: 0.5, wallAlign: true, extras: true },
  { classname: "StaticObj_Furniture_fireplace_grill", label: "Fireplace",  color: "#4a2a1a", w: 1.2, h: 1.0, d: 1.2, extras: true },
  // Wall markers (armbands used as coloured wall decor)
  { classname: "ArmBandRed",    label: "Red Marker",    color: "#8a1a1a", w: 0.3, h: 0.3, d: 0.05, wallAlign: true, extras: true },
  { classname: "ArmBandBlack",  label: "Black Marker",  color: "#1a1a1a", w: 0.3, h: 0.3, d: 0.05, wallAlign: true, extras: true },
  { classname: "ArmBandYellow", label: "Yellow Marker", color: "#c8a020", w: 0.3, h: 0.3, d: 0.05, wallAlign: true, extras: true },
  // Camo net over entrance
  { classname: "StaticObj_Mil_CamoNet_Big_nato", label: "Camo Net", color: "#3a5a2a", w: 8.0, h: 0.3, d: 4.0, extras: true },
];

// ─── Seeded RNG (XOR-shift) ───────────────────────────────────────────────────
export function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return {
    next(): number {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) / 0xFFFFFFFF);
    },
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)];
    },
    jitter(range: number): number {
      return (this.next() - 0.5) * 2 * range;
    },
  };
}

// ─── Structure generation ─────────────────────────────────────────────────────
export interface StructureResult {
  shell: ShellDef;
  props: Array<{ def: PropDef; x: number; y: number; z: number; yaw: number }>;
  objects3D: ZoneObject[];
}

export function generateStructure(seed: number, addExtras: boolean): StructureResult {
  const rng = makeRng(seed);

  // Pick shell
  const shell = rng.pick(SHELL_POOL);
  const hw = shell.w / 2 - 1.5;  // half-width with wall margin
  const hd = shell.d / 2 - 1.5;  // half-depth with wall margin

  const props: StructureResult["props"] = [];
  const objects3D: ZoneObject[] = [];

  // Shell 3D representation — 4 walls with a door gap on the south face (+Z)
  const wallT = 0.6; // visual wall thickness
  const doorW = Math.min(shell.w * 0.25, 3.0); // door opening width
  const doorH = Math.min(shell.h * 0.6, 2.5);  // door opening height
  const shHW = shell.w / 2, shHD = shell.d / 2;
  // North wall (full)
  objects3D.push({ type: "shell_wall", x: 0, y: 0, z: -shHD, yaw: 0, w: shell.w, h: shell.h, d: wallT, color: "#2a3a2a" });
  // East wall (full)
  objects3D.push({ type: "shell_wall", x: shHW, y: 0, z: 0, yaw: 0, w: wallT, h: shell.h, d: shell.d, color: "#2a3a2a" });
  // West wall (full)
  objects3D.push({ type: "shell_wall", x: -shHW, y: 0, z: 0, yaw: 0, w: wallT, h: shell.h, d: shell.d, color: "#2a3a2a" });
  // South wall — two sections with door gap in centre
  const sideW = (shell.w - doorW) / 2;
  objects3D.push({ type: "shell_wall", x: -(sideW / 2 + doorW / 2), y: 0, z: shHD, yaw: 0, w: sideW, h: shell.h, d: wallT, color: "#2a3a2a" });
  objects3D.push({ type: "shell_wall", x:  (sideW / 2 + doorW / 2), y: 0, z: shHD, yaw: 0, w: sideW, h: shell.h, d: wallT, color: "#2a3a2a" });
  // South wall — lintel above door
  objects3D.push({ type: "shell_wall", x: 0, y: doorH, z: shHD, yaw: 0, w: doorW, h: shell.h - doorH, d: wallT, color: "#2a3a2a" });
  // Floor
  objects3D.push({ type: "shell_floor", x: 0, y: -0.1, z: 0, yaw: 0, w: shell.w, h: 0.2, d: shell.d, color: "#1a2a1a" });

  // Helper: place a prop
  function placeProp(def: PropDef, x: number, z: number, yaw: number) {
    const y = def.yOffset ?? 0;
    props.push({ def, x, y, z, yaw });
    objects3D.push({ type: def.classname, x, y, z, yaw, w: def.w, h: def.h, d: def.d, color: def.color });
  }

  // ── Base props ──────────────────────────────────────────────────────────────
  // Crate cluster along back wall
  const crateCount = rng.int(2, 4);
  for (let i = 0; i < crateCount; i++) {
    const x = -hw * 0.6 + i * 1.4 + rng.jitter(0.3);
    placeProp(rng.pick([BASE_PROPS[0], BASE_PROPS[1], BASE_PROPS[2]]), x, -hd + 0.6, rng.int(0, 3) * 90);
  }

  // Barrel cluster
  const barrelColors = [BASE_PROPS[3], BASE_PROPS[4], BASE_PROPS[5], BASE_PROPS[6]];
  const barrelCount = rng.int(2, 4);
  for (let i = 0; i < barrelCount; i++) {
    const x = hw * 0.5 + rng.jitter(0.8);
    const z = rng.jitter(hd * 0.6);
    placeProp(rng.pick(barrelColors), x, z, rng.next() * 360);
  }

  // Sandbag nest near entrance (front wall)
  placeProp(BASE_PROPS[7], rng.jitter(hw * 0.4), hd - 1.5, rng.int(0, 3) * 90);

  // Ammo box
  placeProp(BASE_PROPS[8], -hw + 0.8 + rng.jitter(0.3), rng.jitter(hd * 0.5), rng.int(0, 3) * 90);

  // Lamp (centre-ish, tall)
  placeProp(BASE_PROPS[9], rng.jitter(hw * 0.3), rng.jitter(hd * 0.3), 0);

  // ── Extras ──────────────────────────────────────────────────────────────────
  if (addExtras) {
    // 2–4 firearms on crates/benches
    const gunCount = rng.int(2, 4);
    const guns = EXTRAS_PROPS.filter(p => ["M4A1","M4A1_Black","AK74","AKM","MP5K","Glock19"].includes(p.classname));
    for (let i = 0; i < gunCount; i++) {
      const x = -hw * 0.5 + i * 1.2 + rng.jitter(0.2);
      const z = -hd * 0.5 + rng.jitter(0.5);
      placeProp(rng.pick(guns), x, z, rng.next() * 360);
    }

    // Bench along side wall
    const bench = EXTRAS_PROPS.find(p => p.classname === "Land_BusStation_wall_bench")!;
    placeProp(bench, -hw + 1.2, rng.jitter(hd * 0.4), 90);

    // Fireplace
    const fp = EXTRAS_PROPS.find(p => p.classname === "StaticObj_Furniture_fireplace_grill")!;
    placeProp(fp, rng.jitter(hw * 0.3), rng.jitter(hd * 0.3), rng.int(0, 3) * 90);

    // Wall markers (2–3)
    const markers = EXTRAS_PROPS.filter(p => p.classname.startsWith("ArmBand"));
    const markerCount = rng.int(2, 3);
    for (let i = 0; i < markerCount; i++) {
      const side = rng.int(0, 1) === 0 ? -hw + 0.1 : hw - 0.1;
      placeProp(rng.pick(markers), side, rng.jitter(hd * 0.6), rng.int(0, 3) * 90);
    }

    // Camo net over entrance
    const net = EXTRAS_PROPS.find(p => p.classname === "StaticObj_Mil_CamoNet_Big_nato")!;
    placeProp(net, 0, hd + 2, 0);
  }

  return { shell, props, objects3D };
}
