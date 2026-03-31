import type { ZoneObject } from "@/ZonePreview3D";
import { makeRng } from "@/lib/randomStructureData";

// ─── Structural prop pool ─────────────────────────────────────────────────────
interface StructProp {
  classname: string;
  label: string;
  color: string;
  w: number; h: number; d: number;
  count: [number, number]; // [min, max] per generation
  wallSnap?: boolean;
}

export const STRUCTURAL_POOL: StructProp[] = [
  { classname: "StaticObj_Misc_WoodenCrate_5x", label: "Crate Stack 5x",       color: "#7a5a2a", w: 1.2, h: 2.5, d: 1.2, count: [3, 5] },
  { classname: "StaticObj_Misc_WoodenCrate_3x", label: "Crate Stack 3x",       color: "#8a6a3a", w: 1.2, h: 1.5, d: 1.2, count: [2, 4] },
  { classname: "StaticObj_Misc_Pallet",          label: "Pallet",               color: "#6a4a1a", w: 1.2, h: 0.2, d: 1.0, count: [4, 6] },
  { classname: "StaticObj_Misc_WoodPile_Forest1",label: "Wood Pile",            color: "#5a3a1a", w: 2.0, h: 1.0, d: 1.0, count: [2, 4] },
  { classname: "Land_Wall_Brick_4m_DE",          label: "Brick Wall 4m",        color: "#7f6a5a", w: 4.0, h: 2.5, d: 0.4, count: [2, 4], wallSnap: true },
  { classname: "Land_Wall_Brick_8m_DE",          label: "Brick Wall 8m",        color: "#7f6a5a", w: 8.0, h: 2.5, d: 0.4, count: [1, 2], wallSnap: true },
  { classname: "Land_BarrierConcrete_01_DE",     label: "Jersey Barrier",       color: "#8a8a8a", w: 3.0, h: 1.0, d: 0.6, count: [4, 8], wallSnap: true },
  { classname: "Barrel_Yellow",                  label: "Hazard Barrel",        color: "#c8a020", w: 0.6, h: 0.9, d: 0.6, count: [2, 4] },
  { classname: "Barrel_Red",                     label: "Red Barrel",           color: "#8a1a1a", w: 0.6, h: 0.9, d: 0.6, count: [2, 3] },
  { classname: "Barrel_Blue",                    label: "Blue Barrel",          color: "#1a4a8a", w: 0.6, h: 0.9, d: 0.6, count: [1, 3] },
  { classname: "Barrel_Green",                   label: "Green Barrel",         color: "#1a6a2a", w: 0.6, h: 0.9, d: 0.6, count: [1, 3] },
  { classname: "Land_Sandbag_Wall_DE",           label: "Sandbag Wall",         color: "#8a7a5a", w: 3.0, h: 0.8, d: 0.6, count: [2, 3], wallSnap: true },
  { classname: "StaticObj_Lamp_Ind",             label: "Site Lamp",            color: "#d4c080", w: 0.3, h: 4.0, d: 0.3, count: [2, 3] },
  { classname: "PalletBox_DE",                   label: "Pallet Box",           color: "#6a4a1a", w: 1.2, h: 1.0, d: 1.0, count: [2, 4] },
  // Optional secondary construction buildings (0-1 each, seeded)
  { classname: "Land_Construction_House1",       label: "Construction House 1", color: "#9a8a7a", w: 12,  h: 8,   d: 10,  count: [0, 1] },
  { classname: "Land_Construction_House2",       label: "Construction House 2", color: "#9a8a7a", w: 14,  h: 9,   d: 12,  count: [0, 1] },
];

// ─── Loot manifest ────────────────────────────────────────────────────────────
// All classnames verified against DayZ types.xml Industrial usage tag (nominal > 0)
export interface LootItem { classname: string; label: string; count: number; }

// Core tools — count = 5 each
const CORE_TOOLS: LootItem[] = [
  { classname: "NailBox",            label: "Nail Box",        count: 5 },
  { classname: "MetalWire",          label: "Metal Wire",      count: 5 },
  { classname: "PileOfWoodenPlanks", label: "Plank Pile",      count: 5 },
  { classname: "Rope",               label: "Rope",            count: 5 },
  { classname: "DuctTape",           label: "Duct Tape",       count: 5 },
  { classname: "Hammer",             label: "Hammer",          count: 5 },
  { classname: "HandSaw",            label: "Hand Saw",        count: 5 },
  { classname: "Hacksaw",            label: "Hacksaw",         count: 5 },
  { classname: "Crowbar",            label: "Crowbar",         count: 5 },
  { classname: "Shovel",             label: "Shovel",          count: 5 },
  { classname: "Pickaxe",            label: "Pickaxe",         count: 5 },
  { classname: "Screwdriver",        label: "Screwdriver",     count: 5 },
  { classname: "Wrench",             label: "Wrench",          count: 5 },
  { classname: "PipeWrench",         label: "Pipe Wrench",     count: 5 },
  { classname: "Blowtorch",          label: "Blowtorch",       count: 5 },
  { classname: "SledgeHammer",       label: "Sledge Hammer",   count: 5 },
  { classname: "WoodAxe",            label: "Wood Axe",        count: 5 },
  { classname: "Pliers",             label: "Pliers",          count: 5 },
  { classname: "MetalPlate",         label: "Metal Plate",     count: 5 },
  { classname: "Pipe",               label: "Pipe",            count: 5 },
  { classname: "BarbedWire",         label: "Barbed Wire",     count: 5 },
  { classname: "CableReel",          label: "Cable Reel",      count: 5 },
  { classname: "EpoxyPutty",         label: "Epoxy Putty",     count: 5 },
];

// Rare / clothing — count = 1 each
const RARE_ITEMS: LootItem[] = [
  { classname: "PowerGenerator",           label: "Power Generator",        count: 1 },
  { classname: "Spotlight",                label: "Spotlight",              count: 1 },
  { classname: "WeldingMask",              label: "Welding Mask",           count: 1 },
  { classname: "ConstructionHelmet_Orange",label: "Hard Hat (Orange)",      count: 1 },
  { classname: "ConstructionHelmet_Yellow",label: "Hard Hat (Yellow)",      count: 1 },
  { classname: "ConstructionHelmet_White", label: "Hard Hat (White)",       count: 1 },
  { classname: "JumpsuitJacket_Blue",      label: "Jumpsuit Jacket (Blue)", count: 1 },
  { classname: "JumpsuitJacket_Green",     label: "Jumpsuit Jacket (Green)",count: 1 },
  { classname: "WorkingBoots_Yellow",      label: "Working Boots (Yellow)", count: 1 },
  { classname: "WorkingGloves_Yellow",     label: "Working Gloves (Yellow)",count: 1 },
  { classname: "NioshFaceMask",            label: "Dust Mask",              count: 1 },
  { classname: "SmallProtectorCase",       label: "Small Protector Case",   count: 1 },
];

export const STATION_LOOT: LootItem[] = [...CORE_TOOLS, ...RARE_ITEMS];

// ─── Zone generation ──────────────────────────────────────────────────────────
export interface PlacedProp {
  classname: string;
  label: string;
  x: number; y: number; z: number;
  yaw: number;
  isStation: boolean;
  stationIndex?: number;
}

export interface ZoneResult {
  structural:     PlacedProp[];
  stations:       { x: number; z: number; index: number }[];
  buildings:      { x: number; z: number }[];
  cranes:         { x: number; z: number }[];
  objects3D:      ZoneObject[];
  totalLootItems: number;
}

function snapYaw(rng: ReturnType<typeof makeRng>, wallSnap?: boolean): number {
  return wallSnap ? rng.int(0, 3) * 90 : rng.next() * 360;
}

function tooClose(x: number, z: number, placed: { x: number; z: number }[], minDist: number): boolean {
  return placed.some(p => Math.hypot(p.x - x, p.z - z) < minDist);
}

export function generateZone(seed: number, radius: number, stationCount: number): ZoneResult {
  const rng       = makeRng(seed);
  const structural: PlacedProp[] = [];
  const objects3D:  ZoneObject[] = [];
  const placed:     { x: number; z: number }[] = [];
  const buildings:  { x: number; z: number }[] = [];
  const cranes:     { x: number; z: number }[] = [];

  // ── 1. Guaranteed construction buildings (1–2) ─────────────────────────────
  const buildingCount = rng.int(1, 2);
  for (let i = 0; i < buildingCount; i++) {
    const ang  = (i / buildingCount) * Math.PI * 2 + rng.next() * 0.5;
    const dist = radius * (0.45 + rng.next() * 0.2);
    const x    = Math.cos(ang) * dist;
    const z    = Math.sin(ang) * dist;
    const yaw  = rng.int(0, 3) * 90;
    placed.push({ x, z });
    buildings.push({ x, z });
    structural.push({ classname: "Land_Construction_Building", label: "Construction Building", x, y: 0, z, yaw, isStation: false });
    objects3D.push({ type: "Land_Construction_Building", x, y: 0, z, yaw, w: 20, h: 12, d: 16, color: "#7a7060" });
  }

  // ── 2. Guaranteed cranes (1–2), each offset from a building ───────────────
  const craneCount = rng.int(1, 2);
  for (let i = 0; i < craneCount; i++) {
    const anchor     = buildings[i % buildings.length];
    const offsetAng  = rng.next() * Math.PI * 2;
    const x          = anchor.x + Math.cos(offsetAng) * 12;
    const z          = anchor.z + Math.sin(offsetAng) * 12;
    const yaw        = rng.next() * 360;
    placed.push({ x, z });
    cranes.push({ x, z });
    structural.push({ classname: "Land_Construction_Crane", label: "Construction Crane", x, y: 0, z, yaw, isStation: false });
    objects3D.push({ type: "Land_Construction_Crane", x, y: 0, z, yaw, w: 3, h: 30, d: 3, color: "#e8a020" });
  }

  // ── 3. Supply stations ─────────────────────────────────────────────────────
  const stations: ZoneResult["stations"] = [];
  for (let i = 0; i < stationCount; i++) {
    const ang  = (i / stationCount) * Math.PI * 2 + rng.next() * 0.4;
    const dist = radius * (0.3 + rng.next() * 0.25);
    const x    = Math.cos(ang) * dist;
    const z    = Math.sin(ang) * dist;
    placed.push({ x, z });
    stations.push({ x, z, index: i });
    structural.push({ classname: "StaticObj_Misc_WoodenCrate_5x", label: "Supply Station Base", x, y: 0, z, yaw: rng.int(0,3)*90, isStation: true, stationIndex: i });
    objects3D.push({ type: "station", x, y: 0, z, yaw: 0, w: 2.5, h: 2.5, d: 2.5, color: "#27ae60" });
  }

  // ── 4. Scatter structural props ────────────────────────────────────────────
  function tryPlace(
    classname: string, label: string, color: string,
    w: number, h: number, d: number, wallSnap: boolean | undefined
  ): boolean {
    for (let attempt = 0; attempt < 30; attempt++) {
      const ang  = rng.next() * Math.PI * 2;
      const dist = rng.next() * radius * 0.88;
      const x    = Math.cos(ang) * dist;
      const z    = Math.sin(ang) * dist;
      const minD = Math.max(w, d) * 0.6 + 1.5;
      if (tooClose(x, z, placed, minD)) continue;
      const yaw = snapYaw(rng, wallSnap);
      placed.push({ x, z });
      structural.push({ classname, label, x, y: 0, z, yaw, isStation: false });
      objects3D.push({ type: classname, x, y: 0, z, yaw, w, h, d, color });
      return true;
    }
    return false;
  }

  for (const prop of STRUCTURAL_POOL) {
    const count = rng.int(prop.count[0], prop.count[1]);
    for (let i = 0; i < count; i++) {
      tryPlace(prop.classname, prop.label, prop.color, prop.w, prop.h, prop.d, prop.wallSnap);
    }
  }

  const totalLootItems = stationCount * STATION_LOOT.reduce((s, l) => s + l.count, 0);
  return { structural, stations, buildings, cranes, objects3D, totalLootItems };
}

// ─── Loot placement helper ────────────────────────────────────────────────────
// Splits loot 60% near building interior, 40% near crane base.
export interface LootPlacement {
  classname: string;
  label:     string;
  x: number; y: number; z: number;
}

export function getLootPlacements(
  stationIndex: number,
  worldX: number, worldY: number, worldZ: number,
  buildings: { x: number; z: number }[],
  cranes:    { x: number; z: number }[]
): LootPlacement[] {
  const bAnchor  = buildings[stationIndex % buildings.length];
  const cAnchor  = cranes[stationIndex % cranes.length];
  const splitAt  = Math.ceil(STATION_LOOT.length * 0.6);
  const result:  LootPlacement[] = [];
  let n = 0;

  for (let li = 0; li < STATION_LOOT.length; li++) {
    const loot        = STATION_LOOT[li];
    const nearBuilding = li < splitAt;
    const anchor      = nearBuilding ? bAnchor : cAnchor;
    const spread      = nearBuilding ? { x: 8, z: 6 } : { x: 2, z: 2 };

    for (let c = 0; c < loot.count; c++) {
      const col = n % 5;
      const row = Math.floor(n / 5);
      const ox  = (col - 2) * (spread.x / 4);
      const oz  = (row - 2) * (spread.z / 4);
      result.push({
        classname: loot.classname,
        label:     loot.label,
        x: worldX + anchor.x + ox,
        y: worldY + 0.1,
        z: worldZ + anchor.z + oz,
      });
      n++;
    }
  }
  return result;
}
