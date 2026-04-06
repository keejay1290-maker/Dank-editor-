
import { BuildMetrics } from "./buildMetrics";
import { computeBuildDNA } from "./buildDNA";

export interface SemanticResult {
  type: string;
  isInteriorHeavy: boolean;
  isCombatReady: boolean;
}

export function classifyBuild(ctx: any): string {
  const dna = ctx.dna || computeBuildDNA(ctx);
  const metrics = ctx.metrics || ({} as BuildMetrics);
  
  const height = dna.height || 0;
  const vol = metrics.enclosedVolume || 0;
  const walk = metrics.walkableArea || 0;
  const chokes = metrics.chokePoints || 0;
  const layers = metrics.verticalLayers || 1;
  const curv = dna.curvature || 0;
  
  // High-fidelity classification heuristics
  if (height > 40 && layers > 3) return "tower";
  if (vol > walk && chokes > 5) return "bunker";
  if (curv > 0.7 && dna.silhouetteComplexity > 0.6) return "mech";
  if (curv > 0.8 && (ctx.params?.shape?.includes("ring") || ctx.params?.shape?.includes("circle"))) return "ring";
  if (walk > 2000 && vol < walk) return "arena";
  if (layers > 2 && walk > 500) return "fortress";
  
  return "generic_structure";
}
