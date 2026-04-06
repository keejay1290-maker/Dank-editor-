import * as THREE from "three";

export type MimicShape = "box" | "cylinder" | "sphere" | "torus" | "crane" | "ramp" | "scaffold";

export interface MimicDef {
  shape: MimicShape;
  args: any[];
  color?: string;
  rotation?: [number, number, number]; // Euler offset
}

export const SHAPE_MIMICS: Record<string, MimicDef> = {
  // --- Construction ---
  "Land_Construction_Building": { shape: "box", args: [20, 12, 16], color: "#7a7060" },
  "Land_Construction_Crane":    { shape: "crane", args: [4, 30, 4], color: "#e8a020" },
  "Land_Misc_Scaffolding":      { shape: "scaffold", args: [2.5, 6.0, 2.5], color: "#8a8a8a" },
  "Land_Construction_House1":   { shape: "box", args: [8, 4, 6], color: "#9a8a7a" },
  "Land_Construction_House2":   { shape: "box", args: [10, 5, 8], color: "#9a8a7a" },
  "Land_Workshop1":             { shape: "box", args: [12, 6, 10], color: "#6a6a6a" },
  "Land_Shed_M4":               { shape: "box", args: [4, 3, 5], color: "#5a5a5a" },
  "land_container_1bo":         { shape: "box", args: [6, 2.6, 2.4], color: "#4a4a4a" },
  "Land_Mil_Platform_Big":      { shape: "box", args: [20, 0.5, 20], color: "#555" },
  
  // --- Props & Barriers ---
  "Land_HBarrier_5m":           { shape: "box", args: [1.5, 1.8, 4.5], color: "#7a6a4a" },
  "land_prison_wall_large":      { shape: "box", args: [8, 1.2, 0.4], color: "#8a8a8a" },  // legacy — prefer castle_wall3
  "staticobj_castle_wall3":      { shape: "box", args: [8, 2.0, 0.6], color: "#9e8b6c" },
  "barrel_blue":                { shape: "cylinder", args: [0.35, 0.35, 0.9, 12], color: "#2980b9" },
  "barrel_red":                 { shape: "cylinder", args: [0.35, 0.35, 0.9, 12], color: "#c0392b" },
  "barrel_yellow":              { shape: "cylinder", args: [0.35, 0.35, 0.9, 12], color: "#f1c40f" },
  "barrel_green":               { shape: "cylinder", args: [0.35, 0.35, 0.9, 12], color: "#27ae60" },
  
  // --- Racetrack Specials ---
  "Land_WoodenPier_15m":        { shape: "ramp", args: [4, 15, 0.4], color: "#7e5233" },
  
  // --- Wrecks ---
  "Wreck_UH1Y":                 { shape: "box", args: [14, 3, 4], color: "#2c3e50" },
  "Land_Wreck_Volha_Blue":      { shape: "box", args: [4.5, 1.4, 1.8], color: "#34495e" },
  "Land_Wreck_Uaz":             { shape: "box", args: [4, 1.8, 1.8], color: "#2f3640" },
};

export function getMimic(classname: string): MimicDef {
  // Check exact match
  if (SHAPE_MIMICS[classname]) return SHAPE_MIMICS[classname];
  
  // Fuzzy match for common types
  const lower = classname.toLowerCase();
  if (lower.includes("barrel")) return { shape: "cylinder", args: [0.35, 0.35, 0.9, 8], color: "#555" };
  if (lower.includes("wall_concrete")) return { shape: "box", args: [4, 1.2, 0.5], color: "#777" };
  if (lower.includes("container")) return { shape: "box", args: [6, 2.6, 2.4], color: "#3a3a3a" };
  
  if (lower.includes("ugcomplex_")) return { shape: "box", args: [1, 2, 1], color: "#9b59b6" };
  if (lower.includes("underground_stairs")) return { shape: "box", args: [4.5, 4.5, 4.5], color: "#f39c12" };
  if (lower.includes("underground_corridor")) return { shape: "box", args: [4.5, 4.5, 9], color: "#3498db" };
  if (lower.includes("underground_branch")) return { shape: "box", args: [9, 4.5, 4.5], color: "#2980b9" };
  if (lower.includes("underground_waterroom") || lower.includes("underground_room")) return { shape: "box", args: [18, 9, 18], color: "#d4a017" };
  if (lower.includes("underground_entrance")) return { shape: "box", args: [9, 5, 9], color: "#27ae60" };
  if (lower.includes("underground_panel")) return { shape: "box", args: [1, 2, 1], color: "#9b59b6" };
  if (lower.includes("hbarrier")) return { shape: "box", args: [1.5, 1.8, 4.5], color: "#7a6a4a" };
  
  // Default box
  return { shape: "box", args: [1, 1, 1], color: "#444" };
}
