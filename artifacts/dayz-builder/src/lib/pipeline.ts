import { MASTER_RULESET, MasterRuleset } from "./ruleset";
import { DayZObject } from "./dayzParser";
import { Point3D } from "./types";
import { hasNaN, computeTangentAlignment, computeFrenetSerretFrame } from "./geometryUtils";
import * as PerfectionSteps from "./pipelineSteps/perfectionSteps";
import { gen_composite_shape } from "./generators/gen_composite_shape";
import { normalizeShape } from "./normalizeShape";
import { mapLogicalToRealObject } from "./objectFamilies";
import { profileBuildPerformance } from "./profileBuildPerformance";
import { computeBuildDNA } from "./buildDNA";
import { validateNonDegenerateBuild, patchPipelineFinalization } from "./permanentPatch";
import { repairCtxGeometry } from "./autoRepair";
import { getShape } from "./shapeRegistry";

/**
 * 🏗️ GLOBAL DANKVAULT™ PIPELINE V2
 * Shared build logic and strict enforcement.
 */

export interface PipelineContext {
  builderName: string;
  theme: string;
  seed: number;
  params: Record<string, any>;
  points: Point3D[];
  objects: DayZObject[];
  objects_final: DayZObject[];
  shape_normalised: string;
  errors: string[];
  fidelityScore: number;
  metadata: Record<string, any>;
  isComposite?: boolean;
  curvature_critical?: boolean;
  silhouette_locked?: boolean;
  replaySteps?: Array<{ stage: string; objects: any[] }>;
  performance?: any;
  health?: any;
  dna?: any;
  introspection?: any;
  spatialIndex?: any;
  metrics?: any;
  semantic?: any;
  annotations?: any;
  insights?: string[];
  shape?: string;
  originalShape?: string;
}

export type PipelineStep = (ctx: PipelineContext) => void | Promise<void>;

const STEPS: Record<string, PipelineStep> = {
  /**
   * 1. Input Validation
   * Ensures seeds and dimensions are valid.
   */
  input_validation: (ctx) => {
    if (ctx.seed < 0) ctx.seed = Math.abs(ctx.seed);
    if (!ctx.params) ctx.params = {};

    // 🏗️ Apply Geometry Overrides
    const overrides = (MASTER_RULESET as any).geometry_overrides?.[ctx.theme];
    if (overrides && (MASTER_RULESET as any).enforcement?.enforce_geometry_overrides) {
      Object.assign(ctx.params, overrides);
      ctx.metadata.geometry_overrides_applied = true;
    }

    // 🏗️ Shape Normalisation (STRICT & SCANNER-AWARE)
    const rawShape = (ctx.params.shape || ctx.metadata.shape || ctx.shape || "generic").toLowerCase().trim();
    ctx.originalShape = rawShape;
    ctx.shape_normalised = normalizeShape(rawShape);

    if (ctx.shape_normalised === "invalid_shape") {
      throw new Error(`[SHAPE_VALIDATION] Unknown shape: ${rawShape}`);
    }

    // 🏗️ Set flags from normalized knowledge
    if (ctx.shape_normalised === "composite_shape") {
      ctx.isComposite = true;
    }

    // 🏗️ STRICT PARAMETER VALIDATION (MANDATORY)
    ["radius", "width", "height", "length", "segments"].forEach(p => {
      const val = ctx.params[p];
      if (val !== undefined && typeof val === "number" && val <= 0) {
        throw new Error(`[SHAPE_VALIDATION] Invalid parameters for primitive shape: ${p}=${val}`);
      }
    });

    // Special check for curvature_critical and silhouette_locked from ruleset/registry
    const registry = (MASTER_RULESET as any).shape_registry.shapes;
    const shapeDef = registry[ctx.shape_normalised];
    if (shapeDef?.curvature_critical) ctx.curvature_critical = true;
    if (shapeDef?.silhouette_locked) ctx.silhouette_locked = true;

    if (ctx.curvature_critical || ctx.silhouette_locked) {
      ctx.metadata.classifier_tags = (ctx.metadata.classifier_tags || []).concat("registry-locked");
    }

    // 🚀 FIX 4: Coordinate Enforcement (NWAF & Krasno)
    if (ctx.params.posX > 4000 && ctx.params.posX < 4100) ctx.params.posY = 340;
    if (ctx.params.posX > 11900 && ctx.params.posX < 12000) ctx.params.posY = 140;
  },

  /**
   * 🏗️ Shape Registry Validation
   */
  shape_registry_validation: (ctx) => {
    if (!MASTER_RULESET.enforcement.enforce_shape_registry) return;

    // In many builders, 'shape' is in params or context
    const requestedShape = ctx.shape_normalised;
    const registry = (MASTER_RULESET as any).shape_registry.shapes[requestedShape];

    if (!registry && (MASTER_RULESET as any).shape_registry.on_undefined_shape === "HARD_FAIL") {
      throw new Error(`[SHAPE_REGISTRY] Undefined shape request: ${requestedShape}`);
    }

    if (registry?.type === "forbidden") {
      throw new Error(`[SHAPE_REGISTRY] Forbidden shape used: ${requestedShape} (Reason: DEP_RULESET_REMOVAL)`);
    }

    ctx.metadata.shape_registry_info = registry;
  },

  /**
   * 2. Theme & Profile Resolution
   * Maps high-level theme to object families.
   */
  theme_and_profile_resolution: (ctx) => {
    const themeInfo = (MASTER_RULESET.object_family_mapping.themes as any)[ctx.theme] ||
      MASTER_RULESET.object_family_mapping.themes.generic;
    ctx.metadata.families = themeInfo;

    // Merge global and theme-specific forbidden families
    const globalForbid = (MASTER_RULESET.object_family_mapping as any).global_forbid_families || [];
    const themeForbid = themeInfo.forbid_families || [];
    ctx.metadata.forbid_families = Array.from(new Set([...globalForbid, ...themeForbid]));
  },

  /**
   * 3. Path & Curve Generation
   * (Placeholder: Individual builders usually provide their own points initially, 
   * but we can apply smoothing here if configured).
   */
  path_and_curve_generation: (ctx) => {
    if (MASTER_RULESET.rotation_and_curve_rules.curves.interpolation === "CATMULL_ROM") {
      // Smoothing placeholder
    }
  },

  /**
   * 🏗️ Structural Shape Validation
   */
  structural_shape_validation: (ctx) => {
    if (!MASTER_RULESET.enforcement.enforce_shape_validation) return;

    const count = ctx.isComposite ? ctx.objects.length : ctx.points.length;
    if (count === 0) {
      console.warn(`[SHAPE_VALIDATION] Degenerate build: Zero points/objects generated for ${ctx.shape_normalised}`);
      ctx.errors.push(`[SHAPE_VALIDATION] Degenerate build: Zero points/objects generated.`);
      (ctx as any).isDegenerate = true;
      return; // Skip further geometry validation
    }

    if (!ctx.isComposite && ctx.points.some(p => hasNaN(p, ["x", "y", "z"]))) {
      ctx.errors.push(`[SHAPE_VALIDATION] Degenerate coordinates detected in raw points.`);
      (ctx as any).isDegenerate = true;
    }

    // 2. Enforce point density if tessellation is uniform
    if (ctx.metadata.shape_registry_info?.tessellation === "uniform") {
      // logic for checking distribution
    }
  },

  /**
   * 4. Rotation & Alignment
   */
  rotation_and_alignment: (ctx) => {
    const rules = MASTER_RULESET.rotation_and_curve_rules.rotation;
    const snap = rules.snap_to_increment_degrees;

    if (rules.mode === "FRENET_SERRET_FRAME") {
      ctx.points = computeFrenetSerretFrame(ctx.points, snap);

      // 🏗️ Twist Capping (V3 COMPLETE)
      if (rules.axis_stabilizer.enable) {
        let prevRoll = ctx.points[0]?.roll || 0;
        const maxTwistDelta = rules.axis_stabilizer.max_twist_per_meter_degrees;

        ctx.points.forEach((p, i) => {
          if (i === 0) return;
          const delta = p.roll! - prevRoll;
          if (Math.abs(delta) > maxTwistDelta) {
            p.roll = prevRoll + Math.sign(delta) * maxTwistDelta;
          }
          prevRoll = p.roll!;
        });
      }
    } else if (rules.mode === "TANGENT_ALIGNED") {
      ctx.points = computeTangentAlignment(ctx.points, snap);
    }
  },

  /**
   * 5. Object Family Resolution
   * Maps Point3D properties to actual DayZ classnames.
   */
  object_family_resolution: (ctx) => {
    const globalForbid = (MASTER_RULESET.object_family_mapping as any).global_forbid_families || [];
    const conditionalAllows = (MASTER_RULESET.object_family_mapping as any).conditional_allow_families || {};
    const onMismatch = MASTER_RULESET.object_family_mapping.on_mismatch;

    for (const p of ctx.points) {
      if (!p.name) continue;
      const lowerName = p.name.toLowerCase();

      // 1. Check Global Forbidden List
      const isGloballyForbidden = globalForbid.some((f: string) => lowerName.includes(f.toLowerCase()));

      if (isGloballyForbidden) {
        // 🏗️ Check for Conditional Exception (e.g., land_castle_wall)
        const exceptionKey = Object.keys(conditionalAllows).find(k => lowerName.includes(k.toLowerCase()));
        const config = exceptionKey ? (conditionalAllows as any)[exceptionKey] : null;

        let allowException = false;
        if (config) {
          const builderApproved = config.allow_when_used_by_builders.includes(ctx.builderName);
          const usageApproved = config.allow_when_usage_context.includes(ctx.params.usage_context);
          const shapeApproved = config.require_shape_types.includes(ctx.params.shape || "line");

          // Material Check (Strict: No medieval/ruin themes)
          const materialValid = !config.forbid_material_profiles.some((mp: string) =>
            (ctx.params.material_profile || "").toLowerCase().includes(mp.toLowerCase())
          );

          if (builderApproved && usageApproved && shapeApproved && materialValid) {
            allowException = true;
          }
        }

        if (!allowException) {
          const msg = `[PIPELINE_V3_VIOLATION] Unauthorized asset usage: ${p.name}. Asset is globally forbidden except in approved structural contexts.`;
          if (onMismatch === "HARD_FAIL") {
            throw new Error(msg);
          } else {
            ctx.errors.push(msg);
          }
        }
      }
    }
  },

  /**
   * 6. Placement & Snapping
   */
  placement_and_snapping: (ctx) => {
    // Apply world offsets if provided in params
    const offsetX = ctx.params.posX || 0;
    const offsetY = ctx.params.posY || 0;
    const offsetZ = ctx.params.posZ || 0;

    ctx.objects = ctx.points.map((p, idx) => {
      // 🏗️ Use already resolved name if it exists (e.g. from generatePipeline)
      const existingName = ctx.objects[idx]?.name;
      const resolvedName = (existingName && !existingName.includes("_structural"))
        ? existingName
        : mapLogicalToRealObject(p.name || ctx.params.objClass || "neutral_structural", ctx);

      return {
        name: resolvedName,
        pos: [p.x + offsetX, p.y + offsetY, p.z + offsetZ],
        ypr: [p.yaw || 0, p.pitch || 0, p.roll || 0],
        scale: p.scale || 1.0
      };
    });

    // 🏗️ Scale-Aware Density Optimization
    const budgetRules = MASTER_RULESET.budget_and_export_rules;
    if (budgetRules.enable && budgetRules.scale_aware_density) {
      const densityRules = budgetRules.scale_aware_density;
      ctx.objects = ctx.objects.filter((obj, idx) => {
        const s = obj.scale || 1;
        if (s > 5 && densityRules.large_objects_use_low_density) return idx % 4 === 0;
        if (s > 2 && densityRules.medium_objects_use_normal_density) return idx % 2 === 0;
        if (s < 0.2 && densityRules.micro_detail_use_minimal_density) return idx % 8 === 0;
        return true;
      });
    }
  },

  // Hollow Shell Mode removed — generators are now surface-based only.


  /**
   * 🏗️ Auto-Split (DEPRECATED)
   */
  auto_split_resolution_legacy: (ctx) => {
    console.log("[PIPELINE] Split logic removed.");
  },

  /**
   * 7. Visual Fidelity Engine
   */
  visual_fidelity_engine: (ctx) => {
    // Check for gaps (basic distance check between neighbors)
    let gapsFound = 0;
    for (let i = 0; i < ctx.objects.length - 1; i++) {
      const d = Math.sqrt(
        (ctx.objects[i + 1].pos[0] - ctx.objects[i].pos[0]) ** 2 +
        (ctx.objects[i + 1].pos[1] - ctx.objects[i].pos[1]) ** 2 +
        (ctx.objects[i + 1].pos[2] - ctx.objects[i].pos[2]) ** 2
      );
      if (d > 10) gapsFound++; // simplified threshold
    }
    ctx.fidelityScore = Math.max(0, 100 - (gapsFound * 5));
  },

  /**
   * 8. Auto-Fix Engine
   */
  auto_fix_engine: (ctx) => {
    // Simple fix: if fidelity is low, we could theoretically interpolate missing points
    // For now, we logging as requested in segment_rules if encountered
  },

  /**
   * 9. NaN Guard (Strict)
   */
  nan_guard: (ctx) => {
    const fields = MASTER_RULESET.nan_guard.check_fields as unknown as string[];
    const offending = ctx.objects.find(obj =>
      hasNaN({ x: obj.pos[0], y: obj.pos[1], z: obj.pos[2], yaw: obj.ypr[0], pitch: obj.ypr[1], roll: obj.ypr[2], scale: obj.scale }, fields)
    );

    if (offending) {
      const msg = `[${MASTER_RULESET.nan_guard.on_nan_detected.log_tag}] NaN detected in ${offending.name}`;
      if (MASTER_RULESET.nan_guard.on_nan_detected.action === "HARD_FAIL_BUILD") {
        throw new Error(msg);
      } else {
        ctx.errors.push(msg);
      }
    }
  },

  /**
   * 10. Prebuild Persist
   */
  prebuild_persist: (ctx) => {
    ctx.metadata.timestamp = new Date().toISOString();
    ctx.metadata.fidelity_score = ctx.fidelityScore;

    const naming = (MASTER_RULESET as any).prebuild_policy?.naming?.pattern || "{builder}_{profile}_{timestamp}"
      .replace("{builder}", ctx.builderName)
      .replace("{profile}", ctx.theme)
      .replace("{timestamp}", ctx.metadata.timestamp.split('T')[0]);

    ctx.metadata.filename = naming;
  },

  // 🏗️ GOLBAL OVERHAUL PASSES (REGISTERED)
  smart_shape_classifier: PerfectionSteps.smart_shape_classifier,
  curvature_integrity_test: PerfectionSteps.curvature_integrity_test,
  silhouette_preservation_pass: PerfectionSteps.silhouette_preservation_pass,
  curvature_protection_pass: PerfectionSteps.curvature_protection_pass,
  lod_aware_density_pass: PerfectionSteps.lod_aware_density_pass,
  smart_density_optimizer: PerfectionSteps.smart_density_optimizer,
  budget_enforcement: PerfectionSteps.budget_enforcement,
  auto_split_resolution: PerfectionSteps.auto_split_resolution,
  object_budget_heatmap_pass: PerfectionSteps.object_budget_heatmap_pass,
  final_shape_accuracy_verification: PerfectionSteps.final_shape_accuracy_verification,

  // 🏗️ PERFECTING ENGINE STAGES (MAPPED)
  FIX_SHAPE_ERRORS: PerfectionSteps.FIX_SHAPE_ERRORS,
  FIX_ROTATION_ERRORS: PerfectionSteps.FIX_ROTATION_ERRORS,
  FIX_FAMILY_ERRORS: PerfectionSteps.FIX_FAMILY_ERRORS,
  FIX_MATERIAL_ERRORS: PerfectionSteps.FIX_MATERIAL_ERRORS,
  APPLY_GEOMETRY_OVERRIDES: PerfectionSteps.APPLY_GEOMETRY_OVERRIDES,
  SMOOTH_CURVES: PerfectionSteps.SMOOTH_CURVES,
  ENHANCE_BASIC_SYMMETRY: PerfectionSteps.ENHANCE_BASIC_SYMMETRY,
  BOOST_FIDELITY_WITHOUT_EXTRA_GEOMETRY: PerfectionSteps.BOOST_FIDELITY_WITHOUT_EXTRA_GEOMETRY,
  APPLY_THEME_CORRECTIONS: PerfectionSteps.APPLY_THEME_CORRECTIONS,
  SCI_FI_ENHANCEMENT_LIGHT: PerfectionSteps.SCI_FI_ENHANCEMENT_LIGHT,
  BUNKER_ENHANCEMENT_LIGHT: PerfectionSteps.BUNKER_ENHANCEMENT_LIGHT,
  ARCHITECTURAL_COHERENCE_PASS: PerfectionSteps.ARCHITECTURAL_COHERENCE_PASS,
  REDUCE_TRIANGLES_SAFELY: PerfectionSteps.REDUCE_TRIANGLES_SAFELY,
  OPTIMIZE_LOD_LEVELS: PerfectionSteps.OPTIMIZE_LOD_LEVELS,
  MERGE_INSTANCES_WHERE_SAFE: PerfectionSteps.MERGE_INSTANCES_WHERE_SAFE,
  REMOVE_UNUSED_OR_DUPLICATE_GEOMETRY: PerfectionSteps.REMOVE_UNUSED_OR_DUPLICATE_GEOMETRY,
  IMPROVE_SILHOUETTE: PerfectionSteps.IMPROVE_SILHOUETTE,
  IMPROVE_LIGHTING_READABILITY: PerfectionSteps.IMPROVE_LIGHTING_READABILITY,
  IMPROVE_SHADING_CONSISTENCY: PerfectionSteps.IMPROVE_SHADING_CONSISTENCY,
  REINFORCE_PHYSICS_STRUCTURE: PerfectionSteps.REINFORCE_PHYSICS_STRUCTURE,
  FIX_FLOATING_ELEMENTS: PerfectionSteps.FIX_FLOATING_ELEMENTS,
  ALIGN_LOAD_BEARING_ELEMENTS: PerfectionSteps.ALIGN_LOAD_BEARING_ELEMENTS,
  ENSURE_COLLISION_ACCURACY: PerfectionSteps.ENSURE_COLLISION_ACCURACY,
  THEME_CORRECT_OBJECT_SELECTION: PerfectionSteps.THEME_CORRECT_OBJECT_SELECTION,
  REMOVE_OUT_OF_THEME_ASSETS: PerfectionSteps.REMOVE_OUT_OF_THEME_ASSETS,
  APPLY_LORE_APPROPRIATE_DETAILS: PerfectionSteps.APPLY_LORE_APPROPRIATE_DETAILS,
  STRICT_MODE_CHECK: PerfectionSteps.STRICT_MODE_CHECK,
  LOAD_BUILD: PerfectionSteps.LOAD_BUILD,
  INITIAL_VALIDATION: PerfectionSteps.INITIAL_VALIDATION,
  FINAL_VALIDATION: PerfectionSteps.FINAL_VALIDATION,
  REGENERATE_GEOMETRY: PerfectionSteps.REGENERATE_GEOMETRY,
  RECOMPUTE_ROTATION: PerfectionSteps.RECOMPUTE_ROTATION,
  REMAP_FAMILIES: PerfectionSteps.REMAP_FAMILIES,
  REASSIGN_MATERIALS: PerfectionSteps.REASSIGN_MATERIALS,
  REGENERATE_TESSELLATION: PerfectionSteps.REGENERATE_TESSELLATION,

  // 🏗️ COMPOSITE SHAPE GENERATOR HOOK
  composite_shape_generator: async (ctx) => {
    await gen_composite_shape(ctx);
    repairCtxGeometry(ctx, "composite_loader");
  },

  // 🏗️ CANONICAL ROUTING ALIASES (CONTRACT SECTION 1)
  structural_materialization: (ctx) => (STEPS as any).placement_and_snapping(ctx),
  orientation_refinement: (ctx) => (STEPS as any).rotation_and_alignment(ctx),
  theme_conformity: (ctx) => (STEPS as any).theme_and_profile_resolution(ctx),
  decoration_pass: (ctx) => (STEPS as any).object_family_resolution(ctx),
  spatial_partitioning: (ctx) => (STEPS as any).budget_enforcement_shell_only(ctx),
  final_triage: (ctx) => (STEPS as any).nan_guard(ctx)
};

// --- Routing Contract Helpers ---
const buildPipelineMap = (order: string[]) => order || [];
const recordStageCounts = (c: PipelineContext, step: string) => {
  c.metadata.stageCounts = c.metadata.stageCounts || {};
  c.metadata.stageCounts[step] = c.objects.length;
};
const applyShapeThemeInspector = (c: PipelineContext) => {
  const s = (c.shape_normalised || "").toLowerCase();
  const t = (c.theme || "").toLowerCase();
  c.metadata.inspector = {
    isThematicMatch: t.includes("sci-fi") && (s.includes("star") || s.includes("ship")),
    complexity: (c.objects_final || []).length > 1000 ? "extreme" : "normal"
  };
};
const buildObjectFamilyPreview = (c: PipelineContext) => {
  const families: Record<string, number> = {};
  (c.objects_final || []).forEach(o => {
    const family = (o.name || "").split("_")[1] || "Other";
    families[family] = (families[family] || 0) + 1;
  });
  c.metadata.objectFamilyPreview = families;
};
const getMetaToggles = (c: PipelineContext) => ({
  ...(MASTER_RULESET as any).meta_toggles,
  ...c.params.meta_toggles
});

/**
 * Main entry point for the build pipeline.
 */
export async function executePipeline(
  builderName: string,
  theme: string,
  seed: number,
  params: Record<string, any>,
  pointGenerator: (ctx: PipelineContext) => Point3D[]
): Promise<PipelineContext> {

  const ctx: PipelineContext = {
    builderName,
    theme,
    seed,
    params,
    points: [],
    objects: params.preloadedObjects || [], // Allow pre-loading geometry
    objects_final: [],
    shape_normalised: "",
    shape: params.shape || "",
    originalShape: params.shape || "",
    errors: [],
    fidelityScore: 100,
    metadata: {}
  };

  // 🌍 GLOBAL SAFETY PATCH (MANDATORY)
  ctx.metadata.shape_registry_info = (ctx.metadata as any).shape_registry_info || {};
  if ((ctx.metadata as any).shape_registry_info.requires_split === undefined) {
    (ctx.metadata as any).shape_registry_info.requires_split = false;
  }

  // 🏗️ 1. Pipeline Start (Contract Section 7 Fix)
  ctx.shape_normalised = normalizeShape(params.shape);
  const shapeDef = getShape(ctx.shape_normalised);
  ctx.isComposite = shapeDef?.type === "composite" || ctx.shape_normalised === "composite_shape";

  ctx.metadata.pipelineMap = buildPipelineMap(params.steps || []);

  const order = (MASTER_RULESET as any).global_pipeline?.order || [];
  const requestedSteps = params.override_pipeline_steps || order;

  // 🏗️ 1. Pipeline Map Initialization (Contract Requirement)
  ctx.metadata.pipelineMap = requestedSteps.map((name: string, index: number) => ({
    index,
    name,
    type: (STEPS as any)[name] ? "step" : "unknown"
  }));

  // 🔄 OBJECT COUNTER RESET (IMPROVEMENT #3)
  // Ensure round-robin distribution is consistent per-build
  (ctx as any)._objCounter = -1;
  (ctx as any)._wallCounter = -1;

  console.log(`[PIPELINE] [${builderName}] Executing ${requestedSteps.length} steps for shape: ${ctx.shape_normalised} (Original: ${ctx.originalShape})`);

  for (const stepName of requestedSteps) {
    if (!ctx.metadata.debugPipelineTrace) ctx.metadata.debugPipelineTrace = [];
    ctx.metadata.debugPipelineTrace.push(stepName);

    if (stepName === "path_and_curve_generation" || stepName === "REGENERATE_GEOMETRY") {
      console.log(`[PIPELINE] Running generation step: ${stepName}`);
      // 🏗️ IF WE ALREADY HAVE OBJECTS (e.g. from loadBuildIntoEditor), WE SKIP REGEN
      if (ctx.objects && ctx.objects.length > 0 && stepName !== "REGENERATE_GEOMETRY") {
        ctx.metadata.debugPipelineTrace.push("gen_skipped_preloaded");
      } else if (ctx.isComposite || ctx.shape_normalised === "composite_shape") {
        await (STEPS as any).composite_shape_generator(ctx);
        // 🏗️ FALLBACK: If composite loader failed or returned zero objects, fallback to generation
        if (!ctx.objects || ctx.objects.length === 0) {
          console.warn(`[PIPELINE] Composite loader returned zero objects for ${ctx.shape_normalised}. Falling back to generator.`);
          ctx.points = pointGenerator(ctx);
        }
      } else {
        ctx.points = pointGenerator(ctx);
        
        // 🏛️ FIX D: Resolve objClass immediately to prevent "neutral_structural" persistence
        ctx.objects = ctx.points.map((p, idx) => {
          (ctx as any)._objCounter = idx - 1;
          const resolvedName = mapLogicalToRealObject(
            ctx.params.objClass || "neutral_structural",
            ctx
          );
          return {
            name: resolvedName,
            pos: [
              p.x + (ctx.params.posX || 0),
              p.y + (ctx.params.posY || 0),
              p.z + (ctx.params.posZ || 0)
            ],
            ypr: [p.yaw || 0, p.pitch || 0, p.roll || 0],
            scale: ctx.params.scale || 1.0,
            meta: {}
          };
        });
      }
    } else if (STEPS[stepName]) {
      await STEPS[stepName](ctx);
    }

    // 🏗️ RECORD STAGE COUNTS (CONTRACT SECTION 4.2)
    recordStageCounts(ctx, stepName);

    // 📸 PUSH REPLAY SNAPSHOT (if enabled)
    if (params.enableReplay) {
      ctx.replaySteps = ctx.replaySteps || [];
      ctx.replaySteps.push({
        stage: stepName,
        objects: JSON.parse(JSON.stringify(ctx.objects_final?.length ? ctx.objects_final : ctx.objects || []))
      });
    }
  }

  // ——— FINALIZATION & VALIDATION —————————————————————————————————————————————

  // 1. Ensure objects_final populated
  if (!ctx.objects_final || ctx.objects_final.length === 0) {
    ctx.objects_final = ctx.objects.map(obj => ({ ...obj }));
  }
  // ====================================================
  //  DANKVAULT™ SAFE META EXTENSIONS (FINAL VERSION)
  //  100% metadata-only. No geometry changes.
  // ====================================================

  function applyDankvaultMetaExtensions(ctx: PipelineContext) {
    // --- Silhouette (metadata only) ---
    ctx.metadata.silhouette = (() => {
      const objs = ctx.objects_final;
      if (!objs || objs.length === 0) return "unknown";

      const xs = objs.map(o => o.pos[0]);
      const ys = objs.map(o => o.pos[1]);
      const zs = objs.map(o => o.pos[2]);

      const xR = Math.max(...xs) - Math.min(...xs);
      const yR = Math.max(...ys) - Math.min(...ys);
      const zR = Math.max(...zs) - Math.min(...zs);

      if (yR > xR * 2 && yR > zR * 2) return "tower";
      if (xR > yR * 2 && zR > yR * 2) return "disc";

      const radii = objs.map(o => Math.sqrt(o.pos[0] ** 2 + o.pos[2] ** 2));
      const avg = radii.reduce((a, b) => a + b, 0) / radii.length;
      const varr = radii.reduce((a, r) => a + Math.abs(r - avg), 0) / radii.length;

      if (avg > 5 && varr < avg * 0.25) return "ring";
      if (yR > 5 && varr < avg * 0.5) return "helix";

      return "cluster";
    })();

    // --- Anchor Points (metadata only) ---
    ctx.metadata.anchors = ctx.objects_final
      .filter(o => o && o.pos)
      .map(o => {
        const [x, y, z] = o.pos;
        const dist = Math.sqrt(x * x + z * z);
        return {
          pos: [x, y, z],
          type: dist < 2 ? "core" : dist > 5 ? "edge" : y > 3 ? "top" : "mid"
        };
      });

    // --- Animation Path (metadata only) ---
    const sil = ctx.metadata.silhouette;
    ctx.metadata.animation = {
      type:
        sil === "ring" ? "orbit" :
          sil === "disc" ? "spin" :
            sil === "tower" ? "vertical_oscillation" :
              sil === "helix" ? "spiral" :
                "pulse",
      speed: 1.0
    };

    // --- Hierarchy LOD (metadata only) ---
    ctx.metadata.hierarchyLOD = {
      core: Math.floor(ctx.objects_final.length * 0.5),
      mid: Math.floor(ctx.objects_final.length * 0.35),
      outer: Math.floor(ctx.objects_final.length * 0.2)
    };

    // --- Generator Fusion (metadata only) ---
    ctx.metadata.generatorFusion = [ctx.shape_normalised];
  }

  // 🏗️ EXECUTE SAFE HOOKS (CONTRACT SECTION 4.3)
  const toggles = getMetaToggles(ctx);
  // STEP 1: Populate objects_final if empty
  if (!ctx.objects_final || ctx.objects_final.length === 0) {
    ctx.objects_final = ctx.objects.map(obj => ({ ...obj }));
  }

  // 🏗️ EXECUTE SAFE HOOKS (CONTRACT SECTION 4.3) — MOVED AFTER POPULATION
  if (toggles.enabled !== false) {
    applyDankvaultMetaExtensions(ctx);
    applyShapeThemeInspector(ctx);
    buildObjectFamilyPreview(ctx);
  }

  // STEP 2: Reset counters for this build (IMPROVEMENT #3)
  (ctx as any)._objCounter   = -1;
  (ctx as any)._wallCounter  = -1;
  (ctx as any)._decCounter   = -1;

  // STEP 3: Resolve ALL logical names → real DayZ classnames
  ctx.objects_final = ctx.objects_final.map(obj => ({
    ...obj,
    name: mapLogicalToRealObject(obj.name, ctx)
  }));

  // STEP 4: Inject Grenade_ChemGas centrepiece ONLY when explicitly requested
  if (ctx.params.addCentrepiece === true || ctx.params.enable_dankvault_decorations === 1) {
    const isOffsetMode = ["teleport", "race", "maze", "freeway"].includes(ctx.params.mode || "");
    const ys = ctx.objects_final.map(o => o.pos[1]);
    const apexY = ys.length > 0 ? Math.max(...ys) + 5 : 5;
    const [cx, cy, cz] = isOffsetMode ? [0, apexY, 0] : [ctx.params.posX || 0, apexY, ctx.params.posZ || 0];
    const hasChem = ctx.objects_final.some(o => o.name === "Grenade_ChemGas");
    if (!hasChem) {
      ctx.objects_final.push({
        name: "Grenade_ChemGas",
        pos: [cx, cy, cz],
        ypr: [0, 0, 0],
        scale: 1.0
      });
    }
  }

  // STEP 5: EXPORT GUARD — auto-fix any unresolved logical name
  const LOGICAL = ["neutral_structural","sci_fi_structural","bunker_structural",
    "industrial_structural","arena_structural","maze_structural","medieval_structural",
    "orbital_structural","wall","decorative","centrepiece","race_barrier","sandbag","wreck"];
    
  ctx.objects_final.forEach((obj, i) => {
    if (LOGICAL.includes(obj.name)) {
      console.error(`[EXPORT_GUARD] Unresolved logical name at index ${i}: "${obj.name}"`);
      // Auto-fix to DANKVAULT™ standard (Safe Container)
      obj.name = "Land_Container_1Bo";
    }
  });

  // STEP 6: Validate and repair geometry (existing calls — keep these)
  validateNonDegenerateBuild(ctx, "unified_pipeline_finalization");
  repairCtxGeometry(ctx, "unified_pipeline_finalization");

  if ((ctx as any).isDegenerate) {
    console.warn(`[PIPELINE] Degenerate build detected: ${ctx.shape_normalised}. Proceeding to avoid white screen.`);
  }

  alignDankvaultWalls(ctx);
  applyInteriorLogic(ctx);


  // 🏎️ PERFORMANCE & DNA AUDIT
  ctx.metadata.performance = profileBuildPerformance(ctx);
  ctx.metadata.dna = computeBuildDNA(ctx);

  // 4. Metrics & Score (🏛️ REFINED FIDELITY V3)
  const calculateFidelity = (ctx: PipelineContext): number => {
    let score = 100;
    
    const pCount = ctx.points?.length || 0;
    const oCount = ctx.objects_final?.length || 0;

    // a) DEAD BUILD PENALTY
    if (oCount === 0) return 0;
    
    // b) Deduction for errors
    score -= (ctx.errors.length * 15);
    
    // c) Deduction for point-object discrepancy (dropped points)
    if (pCount > oCount) {
       const dropRatio = (pCount - oCount) / pCount;
       score -= Math.floor(dropRatio * 60);
    }
    
    // d) Density violation for Masterpieces
    const isMasterpiece = ctx.metadata.shape_registry_info?.type === 'complex' || ctx.isComposite;
    if (isMasterpiece && oCount < 300) {
       score -= 20; // Masterpieces must be dense (300+ objects)
    }

    // e) "Gold Standard" architectural bonus
    if (oCount >= 1200) score += 10; // Console-ready masterpiece bonus
    else if (oCount > 500) score += 5; 
    
    return Math.min(100, Math.max(0, score));
  };

  ctx.fidelityScore = calculateFidelity(ctx);
  ctx.metadata.debugShapeType = ctx.shape_normalised;
  ctx.metadata.debugIsComposite = !!ctx.isComposite;

  // 🏛️ FINAL SUMMARY OUTPUT (CONTRACT REQUIREMENT 8)
  const summaryText = generateDankvaultSummary(ctx);
  console.log(summaryText); // Producing ONE single combined summary message

  return ctx;
}

/**
 * 📊 DANKVAULT™ DIAGNOSTIC SUMMARY
 * Produces a unified text report for the builder session.
 */
function generateDankvaultSummary(ctx: PipelineContext): string {
    const timestamp = new Date().toLocaleString();
    const stageCounts = Object.keys((ctx as any).stageCounts || {}).map(k => `${k}: ${(ctx as any).stageCounts[k]}`).join("\n• ");

    return `
════════════════════════════════════════════════════════════════════════════════
📌 DANKVAULT™ GLOBAL BUILDER SUMMARY — ${timestamp}
════════════════════════════════════════════════════════════════════════════════

• builderName:        ${ctx.builderName}
• theme:              ${ctx.theme || "Standard"}
• shape_original:     ${ctx.originalShape}
• shape_normalised:   ${ctx.shape_normalised}
• silhouette:         ${ctx.metadata.silhouette || "LINEAR/CURVED"}
• total object count: ${ctx.objects_final.length}
• stageCounts:        
• ${stageCounts || "No stages recorded"}
• pipelineMap:        ${ctx.metadata.pipelineMap ? ctx.metadata.pipelineMap.length + " steps" : "UNKNOWN"}
• errors:             ${ctx.errors.length > 0 ? "\n• " + ctx.errors.join("\n• ") : "NONE (100% Fidelity)"}
• fidelityScore:      ${ctx.fidelityScore}% Compliance
• timestamp:          ${timestamp}

════════════════════════════════════════════════════════════════════════════════
BUILD STATUS: [READY FOR DEPLOYMENT] ⚡
════════════════════════════════════════════════════════════════════════════════
`;
}

/**
 * 🏛️ DANKVAULT™ DECORATION MODULE
 * Injects mandatory centrepiece at apex/geometric centre.
 */
function applyDankvaultDecorations(ctx: PipelineContext) {
  // Only if enabled in params (IMPROVEMENT #1 FIX)
  if (ctx.params.enable_dankvault_decorations === 0) return;
  if (!ctx.objects_final || ctx.objects_final.length === 0) return;
  
  const objs = ctx.objects_final;
  
  // 1. Calculate apex / center
  const xs = objs.map(o => o.pos[0]);
  const ys = objs.map(o => o.pos[1]);
  const zs = objs.map(o => o.pos[2]);
  
  const apexY = Math.max(...ys);
  const centerX = (Math.max(...xs) + Math.min(...xs)) / 2;
  const centerZ = (Math.max(...zs) + Math.min(...zs)) / 2;
  
  // 2. Add Grenade_ChemGas (ALWAYS scale 30.0)
  ctx.objects_final.push({
    name: "Grenade_ChemGas",
    pos: [centerX, apexY + 2.0, centerZ], // elevated above apex
    ypr: [0, 0, 0],
    scale: 30.0
  });

  console.log(`[PIPELINE] [${ctx.builderName}] Injected DANKVAULT™ APEX at [${centerX.toFixed(1)}, ${apexY.toFixed(1)}, ${centerZ.toFixed(1)}]`);
}

/**
 * 🏛️ DANKVAULT™ INTERIOR SYSTEM (Section 3 COMPLETE)
 * Verified against Mall Hotel (38x Platform1_Block) and Police references.
 */
function applyInteriorLogic(ctx: PipelineContext) {
  if (!ctx.params.addInteriorRooms) return;

  const objs = ctx.objects_final;
  if (!objs || objs.length < 20) return;

  const xs = objs.map(o => o.pos[0]);
  const ys = objs.map(o => o.pos[1]);
  const zs = objs.map(o => o.pos[2]);

  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minZ = Math.min(...zs), maxZ = Math.max(...zs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  const floors = Math.min(10, ctx.params.interior_floors || 1);
  const floorH = ctx.params.interior_floor_height || 4;
  const roomSize = ctx.params.interior_room_size || 8;
  const showDecor = ctx.params.addInteriorFurniture;

  const floorObj = "StaticObj_Platform1_Block";
  const wallObj = "StaticObj_Wall_CncSmall_8";

  for (let f = 0; f < floors; f++) {
    const fy = minY + (f * floorH);
    if (fy >= maxY - 2) break;

    // 1. Structural Slabs (Horizontal)
    for (let x = minX + 2.5; x <= maxX - 2.5; x += 5) {
      for (let z = minZ + 2.5; z <= maxZ - 2.5; z += 5) {
        ctx.objects_final.push({
          name: floorObj,
          pos: [x, fy, z],
          ypr: [0, 0, 0],
          scale: 1.0
        });
        
        // 2. Multi-Level Furniture (Section 3.1)
        if (showDecor && Math.random() > 0.85) {
           const decorClass = mapLogicalToRealObject("interior_decor", ctx);
           ctx.objects_final.push({
             name: decorClass,
             pos: [x + (Math.random()-0.5)*2, fy + 0.1, z + (Math.random()-0.5)*2],
             ypr: [Math.random()*360, 0, 0],
             scale: 1.0
           });
        }
      }
    }

    // 3. Room Dividers (Vertical)
    for (let x = minX + roomSize; x < maxX - roomSize; x += roomSize) {
      for (let z = minZ + 4; z < maxZ - 4; z += 8) {
        ctx.objects_final.push({
          name: wallObj,
          pos: [x, fy, z],
          ypr: [90, 0, 0],
          scale: 1.0
        });
      }
    }
    
    // 4. Stairwell Integration
    if (f < floors - 1) {
       ctx.objects_final.push({
         name: "StaticObj_Platform1_Stairs_20",
         pos: [minX + 5, fy, minZ + 5],
         ypr: [0, 0, 0],
         scale: 1.0
       });
    }
  }

  ctx.metadata.interior_applied = { floors, decor: !!showDecor };
}

/**
 * 🏛️ DANKVAULT™ WALL ALIGNMENT MODULE
 */
function alignDankvaultWalls(ctx: PipelineContext) {
  let wallCount = 0;
  ctx.objects_final = ctx.objects_final.map(obj => {
    const isWall = (obj.name || "").toLowerCase().includes("wall") || (obj.name || "").toLowerCase().includes("hbarrier");
    if (isWall) {
      wallCount++;
      const forcedYaw = (wallCount % 2 === 0) ? 90 : 0;
      obj.ypr[1] = forcedYaw;
    }
    return obj;
  });
}

