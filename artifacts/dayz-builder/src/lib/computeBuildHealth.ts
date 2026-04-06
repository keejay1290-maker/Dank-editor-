import { PipelineContext } from "./pipeline";

/**
 * 🏥 BUILD HEALTH SCORING ENGINE
 * Evaluates the performance and structural integrity of a build.
 */
export function computeBuildHealth(ctx: PipelineContext): number {
  let score = 100;

  const objectsCount = ctx.objects_final.length;

  // 1. Density Penalties (Console Performance)
  if (objectsCount > 2500) score -= 20;
  if (objectsCount > 3500) score -= 40;

  // 2. Metadata Penalties
  if (!ctx.shape_normalised || ctx.shape_normalised === "invalid_shape") score -= 10;
  if (!ctx.theme) score -= 5;

  // 3. Overlap & Silhouette Warnings
  // Note: These fields should be populated by the perfection engine / pipeline passes
  if (ctx.metadata.overlapWarnings) {
    score -= (ctx.metadata.overlapWarnings as number) * 2;
  }

  if (ctx.metadata.silhouetteWarnings) {
    score -= (ctx.metadata.silhouetteWarnings as number) * 5;
  }

  // 4. Trace-based penalties
  if (ctx.errors && ctx.errors.length > 0) {
    score -= ctx.errors.length * 5;
  }

  // Clamp results
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return score;
}
