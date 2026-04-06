import { getAllBuildsFromRegistry } from "./buildRegistry";
import { COMPLETED_BUILDS } from "./completedBuilds";
import { VAULT_FILES } from "./vaultData";
import { normalizeShape } from "./normalizeShape";
import { getShape } from "./shapeRegistry";
import { executePipeline } from "./pipeline";
import { getShapePoints } from "./shapeGenerators";
import { autoFixBuild } from "./autoFixBuild";
import { mapLogicalToRealObject } from "./objectFamilies";
import { generateExportPackage } from "./exporter";
import { runSandboxIntelligence } from "./runSandboxIntelligence";

export async function validateAllBuilds() {
  const results = [];

  const allBuilds: any[] = [
    ...COMPLETED_BUILDS.map(b => ({ ...b, source: "Preset" })),
    ...getAllBuildsFromRegistry().map(b => ({ ...b, shape: b.id.replace('prebuild-', ''), source: "Registry" })),
    ...VAULT_FILES.map(f => ({ 
        name: f.name, 
        shape: f.name.replace(".json", ""), 
        params: {}, 
        source: "Vault" 
    }))
  ];

  console.log(`[VALIDATOR] Starting validation for ${allBuilds.length} builds...`);

  for (const build of allBuilds) {
    const buildName = build.name || "Unnamed Build";
    const rawShape = build.shape || build.id || "unknown";
    
    try {
      const ctx_input: any = {
        shape: rawShape,
        originalShape: rawShape,
        params: build.params || {},
        objects: build.objects_final || [],
        metadata: { debugPipelineTrace: [] }
      };

      // 1. Precise Normalization (Same as Audit)
      ctx_input.shape = normalizeShape(ctx_input.shape);
      const def = getShape(ctx_input.shape === "composite_shape" ? rawShape : ctx_input.shape);
      
      if (!def && ctx_input.shape === "invalid_shape") {
        throw new Error(`[VALIDATION] Unknown shape footprint: ${rawShape}`);
      }

      // 2. Execute Unified Pipeline (Safe Pass)
      let ctx = await executePipeline(
        "Validation-Suite",
        "generic",
        123,
        { ...ctx_input.params, shape: ctx_input.shape },
        () => getShapePoints(ctx_input.shape === "composite_shape" ? rawShape : ctx_input.shape, ctx_input.params)
      );

      // 3. Self-Healing Zero-Check
      if (!ctx.objects_final || ctx.objects_final.length === 0) {
          ctx = await autoFixBuild(ctx);
          if (!ctx.objects_final || ctx.objects_final.length === 0) {
            throw new Error("[VALIDATION] Degenerate build: No geometry produced even after auto-fix.");
          }
      }

      // 4. Intelligence Pass
      const processed = runSandboxIntelligence(ctx);

      results.push({
        build: buildName,
        id: (build as any).id || (build as any).name,
        shape: ctx.shape_normalised,
        status: processed.health >= 40 ? "PASS" : "FAIL",
        health: processed.health,
        objectCount: processed.objects_final.length,
        error: processed.health < 40 ? "Low structural integrity detected" : null,
        performance: processed.performance,
        dna: processed.dna,
        metrics: processed.metrics,
        semantic: processed.semantic,
        insights: processed.insights,
        trace: processed.metadata.debugPipelineTrace || []
      });

    } catch (err: any) {
      results.push({
        build: buildName,
        id: (build as any).id || (build as any).name,
        shape: rawShape,
        status: "FAIL",
        health: 0,
        error: err.message,
        trace: []
      });
    }
  }

  return results;
}
