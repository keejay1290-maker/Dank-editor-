/**
 * 🛰️ DANKVAULT™ AUTO-SHAPE ANALYZER
 * Ensures every new build is classified, normalized, and generated correctly.
 */

if (!(globalThis as any).__DANKVAULT_SHAPE_ANALYZER__) {
  (globalThis as any).__DANKVAULT_SHAPE_ANALYZER__ = true;

  // Canonical shape vocabulary
  const CANONICAL_SHAPES = [
    "sphere", "ring", "disc", "tower", "spoke_hub", "cross", "grid", 
    "arc", "line", "cluster", "mech_core", "orbital_station"
  ];

  /**
   * 1. BASIC GEOMETRY ANALYSIS HELPERS
   * Infers shape hints from raw object distributions.
   */
  (globalThis as any).analyzeBuildGeometry = function analyzeBuildGeometry(objects: any[]) {
    if (!Array.isArray(objects) || objects.length === 0) {
      return { type: "degenerate", score: 0, hints: [] };
    }

    const positions = objects.map(o => o.pos || o.position || [0, 0, 0]);
    const count = positions.length;

    // Rough radial / ring detection
    const radii = positions.map(([x, , z]) => Math.sqrt(x * x + z * z));
    const avgRadius = radii.reduce((a, b) => a + b, 0) / count;
    const radiusVar = radii.reduce((a, r) => a + Math.abs(r - avgRadius), 0) / count;

    const isRingLike = avgRadius > 5 && radiusVar < avgRadius * 0.25;
    const isClustered = avgRadius < 5;
    const isLineLike = radiusVar < 1 && avgRadius > 2;

    const hints = [];
    if (isRingLike) hints.push("ring");
    if (isClustered) hints.push("cluster");
    if (isLineLike) hints.push("line");

    return {
      type: "analyzed",
      score: count,
      hints,
      avgRadius,
      radiusVar
    };
  };

  /**
   * 2. SHAPE NORMALIZER
   * Maps architectural names or geometric hints to canonical identifiers.
   */
  (globalThis as any).normalizeShapeName = function normalizeShapeName(rawName: string, analysis: any) {
    if (!rawName && analysis.hints.length === 0) return "unknown";

    const name = (rawName || "").toLowerCase().trim();

    // Direct name matches first
    if (name.includes("sphere")) return "sphere";
    if (name.includes("ring") || name.includes("halo")) return "ring";
    if (name.includes("disc") || name.includes("disk")) return "disc";
    if (name.includes("tower") || name.includes("spire")) return "tower";
    if (name.includes("hub") || name.includes("spoke")) return "spoke_hub";
    if (name.includes("cross")) return "cross";
    if (name.includes("grid")) return "grid";
    if (name.includes("arc")) return "arc";
    if (name.includes("mech")) return "mech_core";
    if (name.includes("station") || name.includes("orbital")) return "orbital_station";

    // Fallback to analysis hints
    if (analysis.hints.includes("ring")) return "ring";
    if (analysis.hints.includes("cluster")) return "cluster";
    if (analysis.hints.includes("line")) return "line";

    return "unknown";
  };

  /**
   * 3. AUTO-ANALYZE NEW BUILDS
   * Ties analysis, normalization, and registration together.
   */
  (globalThis as any).autoAnalyzeAndRegisterBuild = function autoAnalyzeAndRegisterBuild(buildDef: any) {
    const objects = buildDef.objects || buildDef.objects_final || buildDef.bakedObjects || [];
    const analysis = (globalThis as any).analyzeBuildGeometry(objects);
    const normalizedShape = (globalThis as any).normalizeShapeName(buildDef.shape || buildDef.name || buildDef.id, analysis);

    const finalShape = normalizedShape === "unknown"
      ? (buildDef.shape || "unknown")
      : normalizedShape;

    const registryEntry = {
      name: buildDef.name || buildDef.id,
      shape: finalShape,
      originalShape: buildDef.shape || null,
      source: buildDef.source || "Discovery",
      analyzed: true,
      analysis,
      objects
    };

    if (!(globalThis as any).SHAPE_REGISTRY_ANALYZED) {
      (globalThis as any).SHAPE_REGISTRY_ANALYZED = {};
    }

    (globalThis as any).SHAPE_REGISTRY_ANALYZED[buildDef.id || buildDef.name] = registryEntry;

    console.log("[AUTO_ANALYZE] Registered build with shape:", {
      name: buildDef.name || buildDef.id,
      finalShape,
      hints: analysis.hints
    });

    return registryEntry;
  };

  console.log("DankVault™ Auto-Shape Analyzer Initialized (Advanced geometric classification Active).");
}

export const autoAnalyzeAndRegisterBuild = (globalThis as any).autoAnalyzeAndRegisterBuild;
