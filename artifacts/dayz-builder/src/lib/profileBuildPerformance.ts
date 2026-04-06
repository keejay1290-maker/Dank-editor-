import { PipelineContext } from "./pipeline";

/**
 * 🏎️ BUILD PERFORMANCE PROFILER
 * Estimates the overhead of a build on DayZ console hardware.
 */

const PERFORMANCE_COST_MAP: Record<string, number> = {
  // Structural (Low-Mid)
  "Land_ConcreteWall_01_m_4m": 1.0,
  "Land_ConcreteWall_01_m_8m": 1.5,
  "Land_ConcreteWall_01_m_2m": 0.8,
  "Land_Mil_WallHigh_4m": 1.2,
  "Land_Wall_Gate_Mil": 2.0,
  
  // Interactive / Complex (High)
  "Land_Mil_GuardTower": 5.0,
  "Land_Mil_Bunker": 8.0,
  "Land_Mil_Airfield_Light": 3.0,
  "Land_PowerStation_Module": 10.0,
  
  // Props (Systemic)
  "Land_Industrial_OilTank_Small": 2.5,
  "Land_Misc_CargoContainer": 3.5,
  "Land_WoodenPlank": 0.5,
};

export function getObjectPerformanceCost(name: string): number {
  return PERFORMANCE_COST_MAP[name] || 1.2; // Default baseline cost
}

export interface PerformanceProfile {
  cost: number;
  tier: "S" | "A" | "B" | "C" | "D";
  objectCount: number;
}

export function profileBuildPerformance(ctx: PipelineContext): PerformanceProfile {
  const objCount = ctx.objects_final.length;

  let cost = 0;
  ctx.objects_final.forEach(obj => {
    cost += getObjectPerformanceCost(obj.name);
  });

  // Estimate performance tiers
  let tier: PerformanceProfile["tier"] = "S";
  if (cost > 8000 || objCount > 3500) tier = "D";
  else if (cost > 6000 || objCount > 3000) tier = "C";
  else if (cost > 4000 || objCount > 2500) tier = "B";
  else if (cost > 2500 || objCount > 2000) tier = "A";

  return {
    cost,
    tier,
    objectCount: objCount
  };
}
