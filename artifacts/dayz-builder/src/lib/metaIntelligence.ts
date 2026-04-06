/**
 * 🛰️ DANKVAULT™ SAFE META-INTELLIGENCE MODULE
 * - Object Family Palette (theme + size)
 * - Anchor Point Detection (metadata only)
 * - Animation Paths (preview-only math)
 * - Hierarchy LOD (safe object reduction)
 * - Generator Fusion Engine
 * - Silhouette Detection
 */

if (!(globalThis as any).__DANKVAULT_SAFE_META__) {
  (globalThis as any).__DANKVAULT_SAFE_META__ = true;

  // ---------------------------------------------
  // 1. SILHOUETTE DETECTOR (SAFE)
  // ---------------------------------------------
  (globalThis as any).detectSilhouette = function detectSilhouette(objects: any[]) {
    if (!Array.isArray(objects) || objects.length === 0) return "cluster";

    const positions = objects.map(o => o.pos || [0,0,0]);
    const xs = positions.map(p => p[0]);
    const ys = positions.map(p => p[1]);
    const zs = positions.map(p => p[2]);

    const xRange = Math.max(...xs) - Math.min(...xs);
    const yRange = Math.max(...ys) - Math.min(...ys);
    const zRange = Math.max(...zs) - Math.min(...zs);

    if (yRange > xRange * 2 && yRange > zRange * 2) return "tower";
    if (xRange > yRange * 2 && zRange > yRange * 2) return "disc";

    const radii = positions.map(([x, , z]) => Math.sqrt(x*x + z*z));
    const avg = radii.length > 0 ? radii.reduce((a,b)=>a+b,0)/radii.length : 0;
    const varr = radii.length > 0 ? radii.reduce((a,r)=>a+Math.abs(r-avg),0)/radii.length : 0;

    if (avg > 5 && varr < avg * 0.25) return "ring";
    if (yRange > 5 && varr < avg * 0.5) return "helix";

    return "cluster";
  };

  // ---------------------------------------------
  // 2. OBJECT FAMILY PALETTE (SAFE)
  // ---------------------------------------------
  const OBJECT_FAMILIES: Record<string, Record<string, string>> = {
    "sci-fi": {
      small:  "Land_LampStreet",
      medium: "Land_Tank_Big",
      large:  "Land_Radar_Tall"
    },
    "mech": {
      small:  "Land_Wreck_Uaz",
      medium: "Land_Wreck_Mi8",
      large:  "Land_Wreck_Tank"
    },
    "alien": {
      small:  "Land_Rock_01",
      medium: "Land_Rock_02",
      large:  "Land_Rock_03"
    },
    "industrial": {
      small:  "Land_Container_1Mo",
      medium: "Land_Container_2Mo",
      large:  "Land_Container_3Mo"
    },
    "organic": {
      small:  "Land_Bush_Large",
      medium: "Land_Tree_Hardwood1f",
      large:  "Land_Tree_Hardwood2f"
    },
    "other": {
      small:  "Land_Wall_Concrete_4m",
      medium: "Land_Wall_Concrete_8m",
      large:  "Land_Wall_Concrete_8m"
    }
  };

  function pickSizeBucket(scale: number) {
    if (scale <= 0.75) return "small";
    if (scale <= 1.5)  return "medium";
    return "large";
  }

  (globalThis as any).applyObjectPalette = function applyObjectPalette(build: any) {
    const theme = build.theme || "sci-fi";
    const family = OBJECT_FAMILIES[theme] || OBJECT_FAMILIES["other"];
    const objects = build.objects_final || build.objects;

    if (Array.isArray(objects)) {
      const updated = objects.map((o: any) => {
        const bucket = pickSizeBucket(o.scale || 1);
        return { ...o, name: family[bucket] };
      });
      
      if (build.objects_final) build.objects_final = updated;
      if (build.objects) build.objects = updated;
    }

    console.log(`[OBJECT_PALETTE] Applied object family mapping for theme: ${theme} to ${build.name || "unknown"}`);
    return build;
  };

  // ---------------------------------------------
  // 3. ANCHOR POINT DETECTION (SAFE METADATA)
  // ---------------------------------------------
  (globalThis as any).detectAnchorPoints = function detectAnchorPoints(build: any) {
    const objects = build.objects_final || build.objects;
    const anchors: any[] = [];
    if (!Array.isArray(objects)) return build;

    for (const obj of objects) {
      const [x, y, z] = obj.pos || [0,0,0];
      const dist = Math.sqrt(x*x + z*z);

      if (dist < 2) anchors.push({ type: "core", pos: [x,y,z] });
      if (dist > 5) anchors.push({ type: "edge", pos: [x,y,z] });
      if (y > 3)    anchors.push({ type: "top",  pos: [x,y,z] });
    }

    build.anchors = anchors;
    return build;
  };

  // ---------------------------------------------
  // 4. ANIMATION PATHS (PREVIEW ONLY)
  // ---------------------------------------------
  (globalThis as any).generateAnimationPaths = function generateAnimationPaths(build: any) {
    const silhouette = build.silhouette || "cluster";

    const PATHS: Record<string, { type: string; speed: number }> = {
      ring:   { type: "orbit", speed: 0.5 },
      disc:   { type: "spin", speed: 1.0 },
      tower:  { type: "vertical_oscillation", speed: 0.25 },
      helix:  { type: "spiral", speed: 0.75 },
      cluster:{ type: "pulse", speed: 0.2 }
    };

    build.animation = PATHS[silhouette] || PATHS["cluster"];
    return build;
  };

  // ---------------------------------------------
  // 5. HIERARCHY LOD (SAFE)
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
      core:  h.children[0] ? reduce(h.children[0].objects, 0.5) : [],
      mid:   h.children[1] ? reduce(h.children[1].objects, 0.35) : [],
      outer: h.children[2] ? reduce(h.children[2].objects, 0.2) : []
    };

    return build;
  };

  // ---------------------------------------------
  // 6. GENERATOR FUSION ENGINE (SAFE)
  // ---------------------------------------------
  (globalThis as any).fuseGenerators = function fuseGenerators(shape: string, silhouette: string) {
    const s = (shape || "").toLowerCase();
    const si = (silhouette || "").toLowerCase();

    if (s.includes("helix") && si === "tower") return ["helixGenerator", "towerGenerator"];
    if (s.includes("ring")  && si === "disc")  return ["ringGenerator", "discGenerator"];
    if (s.includes("mech")  && si === "cluster") return ["mechCoreGenerator", "clusterGenerator"];
    if (s.includes("orbital") && si === "ring") return ["orbitalStationGenerator", "ringGenerator"];

    const base = (globalThis as any).selectGeneratorForShape ? (globalThis as any).selectGeneratorForShape(shape) : "clusterGenerator";
    return [base];
  };

  // ---------------------------------------------
  // 7. PIPELINE HOOK — APPLY EVERYTHING SAFELY
  // ---------------------------------------------
  if ((globalThis as any).runUnifiedPipeline) {
    (globalThis as any).runUnifiedPipeline = (original => async function patchedPipeline(ctx: any) {
      ctx = await original(ctx);

      ctx.silhouette = (globalThis as any).detectSilhouette(ctx.objects_final);
      ctx = (globalThis as any).applyObjectPalette(ctx);
      ctx = (globalThis as any).detectAnchorPoints(ctx);
      ctx = (globalThis as any).generateAnimationPaths(ctx);
      ctx = (globalThis as any).generateHierarchyLOD(ctx);
      ctx.generatorFusion = (globalThis as any).fuseGenerators(ctx.shape_normalised || ctx.shape || "Generic", ctx.silhouette || "cluster");

      console.log(`[SAFE_META] Applied safe meta-intelligence to: ${ctx.id || ctx.name || ctx.shape_normalised}`);
      return ctx;
    })((globalThis as any).runUnifiedPipeline);
  }

  console.log("DANKVAULT™ SAFE Meta-Intelligence Module Loaded.");
}
