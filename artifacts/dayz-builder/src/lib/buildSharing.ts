import { PipelineContext, executePipeline } from "./pipeline";
import { getShapePoints } from "./shapeGenerators";
import { BuildDNA, computeBuildDNA } from "./buildDNA";
import { PerformanceProfile, profileBuildPerformance } from "./profileBuildPerformance";

/**
 * 📦 BUILD SHARING / IMPORT SYSTEM
 * Canonical .dankbuild format for multi-platform redistribution.
 */

export interface DankBuildPackage {
  version: number;
  name: string;
  shape: string;
  params: any;
  objects: any[];
  tags: string[];
  metadata: any;
  health: number;
  performance: PerformanceProfile;
  dna: string;
}

export function exportDankBuild(ctx: PipelineContext): string {
  const p = profileBuildPerformance(ctx);
  const dna = computeBuildDNA(ctx);
  
  const pkg: DankBuildPackage = {
    version: 1,
    name: ctx.params.buildName || "DankMasterpiece",
    shape: ctx.shape_normalised || ctx.params.shape || "raw",
    params: ctx.params,
    objects: ctx.objects_final,
    tags: ctx.metadata.tags || [],
    metadata: ctx.metadata,
    health: (ctx as any).health || 100,
    performance: p,
    dna: btoa(JSON.stringify(dna))
  };

  return JSON.stringify(pkg, null, 2);
}

export async function importDankBuild(json: string): Promise<PipelineContext> {
  const pkg: DankBuildPackage = JSON.parse(json);
  
  if (pkg.version !== 1) throw new Error("Unsupported .dankbuild version.");

  // REBUILD CONTEXT
  const ctx = await executePipeline(
      pkg.name,
      pkg.metadata?.theme || "generic",
      0,
      { ...pkg.params, preloadedObjects: pkg.objects },
      () => getShapePoints(pkg.shape, pkg.params)
  );

  (ctx as any).health = pkg.health;
  (ctx as any).performance = pkg.performance;
  (ctx as any).tags = pkg.tags;

  return ctx;
}
