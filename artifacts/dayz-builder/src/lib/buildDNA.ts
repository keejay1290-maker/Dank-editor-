import { PipelineContext } from "./pipeline";
import { profileBuildPerformance, PerformanceProfile } from "./profileBuildPerformance";

/**
 * 🧬 BUILD DNA SYSTEM
 * Generates an architectural fingerprint for builds, allowing for comparison and evolution.
 */

export interface BuildDNA {
  shape: string;
  objectCount: number;
  avgDensity: number;
  curvature: number;
  silhouetteComplexity: number;
  objectFamilies: string[];
  performanceTier: string | null;
  health: number | null;
}

export function computeBuildDNA(ctx: PipelineContext): BuildDNA {
  const p = profileBuildPerformance(ctx);
  
  return {
    shape: ctx.shape_normalised || ctx.params.shape || "unknown",
    objectCount: ctx.objects_final.length,
    avgDensity: ctx.params.density || (ctx.objects_final.length / 100), // simplistic estimate
    curvature: ctx.metadata.curvature_critical ? 1.0 : 0.0,
    silhouetteComplexity: ctx.metadata.silhouette_locked ? 1.0 : 0.0,
    objectFamilies: [ctx.theme === "death_star" ? "sci_fi_structural" : "neutral_structural"],
    performanceTier: p.tier,
    health: (ctx as any).health || 100
  };
}

export function encodeDNA(dna: BuildDNA): string {
  return btoa(JSON.stringify(dna));
}

export function decodeDNA(str: string): BuildDNA {
  try {
    return JSON.parse(atob(str));
  } catch (e) {
    throw new Error("Invalid Build DNA string.");
  }
}
