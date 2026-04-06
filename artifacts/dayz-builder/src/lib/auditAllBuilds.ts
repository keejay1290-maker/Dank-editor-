import { COMPLETED_BUILDS } from "./completedBuilds";
import { VAULT_FILES } from "./vaultData";
import { getAllBuildsFromRegistry } from "./buildRegistry";
import { normalizeShape } from "./normalizeShape";
import { getShape } from "./shapeRegistry";
import { executePipeline } from "./pipeline";
import { getShapePoints } from "./shapeGenerators";
import { gen_composite_shape } from "./generators/gen_composite_shape";

/**
 * 🕵️ FULL ARCHITECTURAL COMPLIANCE AUDIT
 * Sweeps all build sources and validates them against the current pipeline rules.
 * Reports any anomalies in shape normalization, geometry generation, or object mapping.
 */
export async function auditAllBuilds() {
  const safeCall = (fn: any) => {
    try { return (typeof fn === "function") ? fn() : []; }
    catch (e) { console.error("[AUDIT] Source failed:", e); return []; }
  };

  const allBuilds = [
    ...(Array.isArray(COMPLETED_BUILDS) ? COMPLETED_BUILDS.map(b => ({ ...b, source_type: "Masterpiece" })) : []),
    ...(Array.isArray(VAULT_FILES) ? VAULT_FILES.map(f => ({ 
        name: f.name, 
        shape: f.name.replace(".json", ""), 
        params: {}, 
        source_type: "Vault" 
    })) : []),
    ...(safeCall(getAllBuildsFromRegistry).map((b: any) => ({ ...b, source_type: "Registry" })))
  ];

  console.log(`[BUILD_AUDIT] Starting compliance sweep for ${allBuilds.length} builds...`);

  const report = [];

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

      // 1. Normalization Check
      ctx_input.shape = normalizeShape(ctx_input.shape);
      const def = getShape(ctx_input.shape === "composite_shape" ? rawShape : ctx_input.shape);

      // 2. Pre-generation check (Composite or Primitive Generator)
      if (ctx_input.shape === "composite_shape") {
        await gen_composite_shape(ctx_input);
      } else if (def?.generator) {
        // Many generators are functions in shapeRegistry, but some are defined in pointGenerator
      }

      // 3. Execute Unified Pipeline
      const ctx = await executePipeline(
        "Compliance-Auditor",
        "generic",
        0,
        { ...ctx_input.params, shape: ctx_input.shape },
        () => getShapePoints(ctx_input.shape === "composite_shape" ? rawShape : ctx_input.shape, ctx_input.params)
      );

      // 4. Geometry Verification
      const hasFinal = Array.isArray(ctx.objects_final) && ctx.objects_final.length > 0;
      const isComplianceValid = hasFinal && ctx.shape_normalised !== "invalid_shape";

      report.push({
        name: buildName,
        source: build.source_type,
        rawShape: rawShape,
        normalizedShape: ctx.shape_normalised,
        objectCount: ctx.objects_final?.length || 0,
        fidelity: ctx.fidelityScore,
        status: isComplianceValid ? "OK" : "FAIL",
        error: isComplianceValid ? null : (ctx.shape_normalised === "invalid_shape" ? "Registry Mismatch" : "Zero Geometry Generated")
      });

    } catch (err: any) {
      report.push({
        name: buildName,
        source: build.source_type,
        rawShape: rawShape,
        normalizedShape: "CRASH",
        status: "ERROR",
        error: err?.message || "Execution exception in pipeline pass"
      });
    }
  }

  // Aggregate results
  const summary = {
      total: report.length,
      passed: report.filter(r => r.status === "OK").length,
      failed: report.filter(r => r.status === "FAIL").length,
      errored: report.filter(r => r.status === "ERROR").length
  };

  console.table(summary);
  console.log("[BUILD_AUDIT_REPORT]", report);

  return { summary, report };
}
