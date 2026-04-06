
import { profileBuildPerformance } from "./profileBuildPerformance";
import { computeBuildHealth } from "./computeBuildHealth";
import { computeBuildDNA } from "./buildDNA";
import { analyzeGeometry } from "./geometryIntrospection";
import { buildSpatialIndex } from "./spatialQueries";
import { computeBuildMetrics } from "./buildMetrics";
import { classifyBuild } from "./semanticUnderstanding";
import { annotateBuild } from "./annotateBuild";
import { generateBuildInsights } from "./sandboxAssistant";

/**
 * 🧠 CORE SANDBOX INTELLIGENCE ENGINE
 * Runs after the unified pipeline to provide deep structural audits.
 */
export function runSandboxIntelligence(ctx: any) {
  // 1. Performance & Health (Existing)
  ctx.performance = profileBuildPerformance(ctx);
  ctx.health      = computeBuildHealth(ctx);
  
  // 2. DNA & Introspection
  ctx.dna         = computeBuildDNA(ctx);
  ctx.introspection = analyzeGeometry(ctx);
  
  // 3. Spatial Query Indexing
  ctx.spatialIndex  = buildSpatialIndex(ctx.objects_final || []);
  
  // 4. Metrics & Semantics
  ctx.metrics       = computeBuildMetrics(ctx);
  ctx.semantic      = { type: classifyBuild(ctx) };
  
  // 5. Annotations & AI Insights
  ctx.annotations   = annotateBuild(ctx);
  ctx.insights      = generateBuildInsights(ctx);
  
  return ctx;
}
