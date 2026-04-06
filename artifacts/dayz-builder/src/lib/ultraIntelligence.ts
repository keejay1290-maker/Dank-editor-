/**
 * 🛰️ DANKVAULT™ ULTRA-INTELLIGENCE MODULE
 * - Auto-Material Palette Mapper
 * - Auto-LOD per hierarchy
 * - Auto-Generator Fusion Engine
 */

if (!(globalThis as any).__DANKVAULT_ULTRA_INTELLIGENCE__) {
  (globalThis as any).__DANKVAULT_ULTRA_INTELLIGENCE__ = true;

  // ---------------------------------------------
  // 1. AUTO-MATERIAL PALETTE MAPPER
  // ---------------------------------------------
  (globalThis as any).applyMaterialPalette = function applyMaterialPalette(build: any) {
    const theme = build.theme || "sci-fi";

    const PALETTES: Record<string, string[]> = {
      "sci-fi": ["metal_brushed", "metal_white", "metal_dark"],
      "mech": ["metal_dark", "metal_riveted", "metal_oil"],
      "alien": ["bio_glow", "bio_vein", "bio_shell"],
      "industrial": ["rusted_steel", "oxidized_iron", "dirty_metal"],
      "organic": ["flesh_growth", "bone_plate", "tissue_cluster"],
      "other": ["default_metal"]
    };

    const palette = PALETTES[theme] || PALETTES["other"];
    const objects = build.objects_final || build.objects;

    if (Array.isArray(objects)) {
      const updated = objects.map((o: any, i: number) => ({
        ...o,
        material: palette[i % palette.length]
      }));
      
      if (build.objects_final) build.objects_final = updated;
      if (build.objects) build.objects = updated;
    }

    console.log(`[PALETTE] Applied palette: ${palette} to ${build.name || "unknown"}`);
    return build;
  };

  // ---------------------------------------------
  // 2. AUTO-LOD PER HIERARCHY LAYER
  // ---------------------------------------------
  (globalThis as any).generateHierarchyLOD = function generateHierarchyLOD(build: any) {
    if (!build.hierarchy || !Array.isArray(build.hierarchy.children)) return build;

    function reduce(objects: any[], factor: number) {
      if (!Array.isArray(objects) || objects.length === 0) return [];
      const target = Math.max(5, Math.floor(objects.length * factor));
      const out = [];
      const step = Math.ceil(objects.length / target);
      for (let i = 0; i < objects.length; i += step) {
        out.push(objects[i]);
      }
      return out;
    }

    const h = build.hierarchy;

    build.LOD_HIERARCHY = {
      core: h.children[0] ? reduce(h.children[0].objects, 0.5) : [],
      mid: h.children[1] ? reduce(h.children[1].objects, 0.35) : [],
      outer: h.children[2] ? reduce(h.children[2].objects, 0.2) : []
    };

    console.log(`[LOD_HIERARCHY] Ultra-LOD generated for: ${build.name || "unknown"}`);
    return build;
  };

  // ---------------------------------------------
  // 3. AUTO-GENERATOR FUSION ENGINE
  // ---------------------------------------------
  (globalThis as any).fuseGenerators = function fuseGenerators(shape: string, silhouette: string) {
    const s = (shape || "").toLowerCase();
    const si = (silhouette || "").toLowerCase();

    // Hybrid logic
    if (s.includes("helix") && si === "tower") return ["helixGenerator", "towerGenerator"];
    if (s.includes("ring") && si === "disc") return ["ringGenerator", "discGenerator"];
    if (s.includes("mech") && si === "cluster") return ["mechCoreGenerator", "clusterGenerator"];
    if (s.includes("organic") && si === "cluster") return ["organicClusterGenerator", "clusterGenerator"];
    if (s.includes("orbital") && si === "ring") return ["orbitalStationGenerator", "ringGenerator"];

    // Default: single generator from intelligent engine
    const base = (globalThis as any).selectGeneratorForShape ? (globalThis as any).selectGeneratorForShape(shape) : "clusterGenerator";
    return [base];
  };

  // ---------------------------------------------
  // 4. PIPELINE HOOK — APPLY ALL ULTRA SYSTEMS
  // ---------------------------------------------
  if ((globalThis as any).runUnifiedPipeline) {
    (globalThis as any).runUnifiedPipeline = (original => async function patchedPipeline(ctx: any) {
      ctx = await original(ctx);

      // Material palette
      ctx = (globalThis as any).applyMaterialPalette(ctx);

      // Hierarchy LOD
      ctx = (globalThis as any).generateHierarchyLOD(ctx);

      // Generator fusion
      ctx.generatorFusion = (globalThis as any).fuseGenerators(ctx.shape_normalised || ctx.shape || "Generic", ctx.silhouette || "cluster");

      console.log(`[ULTRA_ENGINE] Applied palette, hierarchy LOD, generator fusion to: ${ctx.id || ctx.name || ctx.shape_normalised}`);
      return ctx;
    })((globalThis as any).runUnifiedPipeline);
  }

  console.log("DANKVAULT™ Ultra-Intelligence Module Loaded.");
}

export const applyMaterialPalette = (globalThis as any).applyMaterialPalette;
export const generateHierarchyLOD = (globalThis as any).generateHierarchyLOD;
export const fuseGenerators = (globalThis as any).fuseGenerators;
