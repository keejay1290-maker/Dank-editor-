/**
 * 🛰️ DANKVAULT™ ADVANCED SYSTEMS MODULE
 * - Auto-LOD generator (low-poly previews)
 * - Auto-splitter (console-safe object budgets)
 * - Auto-baker (generate baked JSON for new builds)
 * - Auto-theme clustering (style-based grouping)
 */

if (!(globalThis as any).__DANKVAULT_ADVANCED_SYSTEMS__) {
  (globalThis as any).__DANKVAULT_ADVANCED_SYSTEMS__ = true;

  // ---------------------------------------------
  // 1. AUTO-LOD GENERATOR (LOW-POLY PREVIEWS)
  // ---------------------------------------------
  (globalThis as any).generateLOD = function generateLOD(objects: any[], reduction = 0.35) {
    if (!Array.isArray(objects) || objects.length === 0) return [];

    const targetCount = Math.max(10, Math.floor(objects.length * reduction));
    const lod = [];

    const step = Math.ceil(objects.length / targetCount);
    for (let i = 0; i < objects.length; i += step) {
      lod.push(objects[i]);
    }

    console.log("[LOD] Generated LOD:", lod.length, "from", objects.length);
    return lod;
  };

  // ---------------------------------------------
  // 2. AUTO-SPLITTER (CONSOLE-SAFE OBJECT BUDGETS)
  // ---------------------------------------------
  (globalThis as any).splitBuildForConsole = function splitBuildForConsole(build: any, maxObjects = 1500) {
    if (!build || !Array.isArray(build.objects || build.objects_final)) return [build];
    const objects = build.objects || build.objects_final;

    const chunks = [];
    let current: any[] = [];

    for (const obj of objects) {
      current.push(obj);
      if (current.length >= maxObjects) {
        chunks.push({ ...build, id: `${build.id}_split_${chunks.length}`, objects_final: [...current], objects: [...current] });
        current = [];
      }
    }

    if (current.length > 0) {
      chunks.push({ ...build, id: `${build.id}_split_${chunks.length}`, objects_final: [...current], objects: [...current] });
    }

    console.log("[SPLITTER] Build split into", chunks.length, "parts");
    return chunks;
  };

  // ---------------------------------------------
  // 3. AUTO-BAKER (GENERATE BAKED JSON FOR NEW BUILDS)
  // ---------------------------------------------
  (globalThis as any).autoBakeBuild = function autoBakeBuild(build: any) {
    if (!build || !build.name || !Array.isArray(build.objects || build.objects_final)) return;
    const objects = build.objects || build.objects_final;

    const baked = {
      name: build.name,
      objects: objects.map((o: any) => ({
        name: o.name,
        pos: [...o.pos],
        ypr: [...o.ypr],
        scale: o.scale
      }))
    };

    if (!(globalThis as any).BAKED_PREBUILDS) (globalThis as any).BAKED_PREBUILDS = {};
    (globalThis as any).BAKED_PREBUILDS[build.name.toLowerCase()] = baked;

    console.log("[BAKER] Baked JSON generated for:", build.name);
    return baked;
  };

  // ---------------------------------------------
  // 4. AUTO-THEME CLUSTERING (STYLE-BASED GROUPING)
  // ---------------------------------------------
  (globalThis as any).clusterBuildsByTheme = function clusterBuildsByTheme() {
    const registry = (globalThis as any).SHAPE_REGISTRY || {};

    const groups: Record<string, any[]> = {
      "sci-fi": [],
      "mech": [],
      "alien": [],
      "industrial": [],
      "organic": [],
      "other": []
    };

    for (const key in registry) {
      const build = registry[key];
      if (!build || !build.name) continue;

      const theme = (globalThis as any).detectTheme ? (globalThis as any).detectTheme(build.name) : "other";

      if (!groups[theme]) {
        if (!groups["other"]) groups["other"] = [];
        groups["other"].push(build);
      } else {
        groups[theme].push(build);
      }
    }

    console.log("[THEME_CLUSTER] Builds grouped by theme.");
    return groups;
  };

  console.log("DankVault™ Advanced Systems Module Loaded (LOD, Splitter, Baker, Theme Clustering).");
}

export const generateLOD = (globalThis as any).generateLOD;
export const splitBuildForConsole = (globalThis as any).splitBuildForConsole;
export const autoBakeBuild = (globalThis as any).autoBakeBuild;
export const clusterBuildsByTheme = (globalThis as any).clusterBuildsByTheme;
