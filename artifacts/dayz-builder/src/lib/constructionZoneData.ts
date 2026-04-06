// ─── Structural prop pool — Strictly Construction Themed ─────────────────────
// Base assets for generating a construction zone
export interface StructProp {
  classname: string;
  label: string;
  color: string;
  w: number; h: number; d: number;
  count: [number, number]; // [min, max] per generation
  wallSnap?: boolean;
}

export const STRUCTURAL_POOL: StructProp[] = [
  { classname: "Land_Container_1Aoh",            label: "Main Hub Container",    color: "#7a7060", w: 20,  h: 12,  d: 16, count: [2, 4] },
  { classname: "Land_Construction_Crane",        label: "Construction Crane",    color: "#e8a020", w: 4,   h: 30,  d: 4,  count: [1, 2] },
  { classname: "Land_Misc_Scaffolding",          label: "Scaffolding",           color: "#8a8a8a", w: 2.5, h: 6.0, d: 2.5, count: [4, 8] },
  { classname: "Land_Container_1Bo",             label: "Storage Container (Dark)", color: "#4a4a4a", w: 6,   h: 2.6, d: 2.4, count: [4, 8] },
  { classname: "Land_Container_1Moh",            label: "Working Open-top Cont", color: "#6a6a6a", w: 12,  h: 6,   d: 10, count: [1, 3] },
  { classname: "Land_Prison_Wall_Large",         label: "Boundary Barrier",      color: "#5a5a5a", w: 4,   h: 3,   d: 5,  count: [2, 4] },
  { classname: "Land_HBarrier_5m",               label: "Defense Barrier",       color: "#4a4a4a", w: 6,   h: 2.6, d: 2.4, count: [3, 6] },
  { classname: "StaticObj_Wall_CncBarrier",      label: "Jersey Barrier",        color: "#8a8a8a", w: 3,   h: 1,   d: 0.6, count: [8, 16], wallSnap: true },
  { classname: "Wreck_UH1Y",                     label: "Wrecked Helicopter",    color: "#2a2a2a", w: 14,  h: 4,   d: 4,  count: [0, 1] },
  { classname: "Land_Wreck_offroad02_aban1",     label: "Wrecked Humvee",        color: "#3a3a3a", w: 5,   h: 2,   d: 2,  count: [1, 3] },
];

export interface LootItem { 
  classname: string; 
  label: string; 
  count: number; 
}

// These are for the "Loot Stations" (legacy UI), but we'll prioritize mapgroupproto logic
export const STATION_LOOT: LootItem[] = [
  { classname: "Nails", label: "Nails", count: 5 },
  { classname: "Hammer", label: "Hammer", count: 2 },
  { classname: "Shovel", label: "Shovel", count: 2 },
  { classname: "Wrench", label: "Wrench", count: 2 },
  { classname: "Pipe", label: "Pipe", count: 3 },
  { classname: "MetalPlate", label: "Metal Plate", count: 2 },
  { classname: "ConstructionHelmet_Yellow", label: "Hard Hat", count: 1 },
];
