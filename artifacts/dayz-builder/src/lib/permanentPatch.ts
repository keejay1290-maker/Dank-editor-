import { PipelineContext } from "./pipeline";
import { loadPrebuildGeometry } from "./prebuildLoader";

// ——— GLOBAL IMMUTABILITY ENFORCEMENT ——————————————————————————————————————
(globalThis as any).__DANKVAULT_IMMUTABLE__ = true;
(globalThis as any).__DANKVAULT_ALWAYS_SUMMARY__ = true;
(globalThis as any).__DANKVAULT_PREVALIDATION__ = true;

/**
 * 🛰️ PRE-PIPELINE BUILD VALIDATION HOOK
 * Ensures every build has geometry BEFORE pipeline runs.
 * Auto-recovers baked geometry for composite shapes if the build is empty.
 */
export function preValidateBuild(ctx: PipelineContext): boolean {
  if (!ctx) {
     console.error("[PREVALIDATION] Missing context during archetype resolution.");
     return false;
  }

  // Ensure objects arrays exist
  ctx.objects = Array.isArray(ctx.objects) ? ctx.objects : [];
  ctx.objects_final = Array.isArray(ctx.objects_final) ? ctx.objects_final : [];

  const rawCount = ctx.objects.length;
  const finalCount = ctx.objects_final.length;

  // If geometry exists, all good
  if (rawCount > 0 || finalCount > 0) {
    return true;
  }

  // If composite build: try to reload baked geometry from prebuild registry
  const shapeKey = (ctx.originalShape || ctx.shape || "").toLowerCase().trim();
  if (shapeKey) {
    try {
      const baked = loadPrebuildGeometry(shapeKey);

      if (baked && Array.isArray(baked.objects) && baked.objects.length > 0) {
        ctx.objects = [...baked.objects];
        ctx.objects_final = [...baked.objects];
        console.warn(`[PREVALIDATION] Auto-recovered baked geometry for: ${shapeKey}`);
        return true;
      }
    } catch (err) {
      console.error("[PREVALIDATION_FATAL] Structural recovery failed:", err);
    }
  }

  // If still empty: mark as degenerate but DO NOT crash the entire app
  ctx.objects = [];
  ctx.objects_final = [];
  (ctx as any).isDegenerate = true;

  console.warn(`[PREVALIDATION] Build has zero geometry BEFORE pipeline: ${ctx.shape || "unknown"}`);

  return false;
}

/**
 * 1. UNIVERSAL VALIDATOR (CORE)
 * Ensures that a build never terminates without geometry if raw objects exist.
 */
export function validateNonDegenerateBuild(ctx: PipelineContext, label: string = "UNKNOWN_STAGE"): boolean {
  const rawCount = Array.isArray(ctx.objects) ? ctx.objects.length : 0;
  const finalCount = Array.isArray(ctx.objects_final) ? ctx.objects_final.length : 0;

  // If final geometry exists, all good
  if (finalCount > 0) return true;

  console.error("[SHAPE_VALIDATION] Degenerate build detected:", {
    label,
    shape: ctx.shape_normalised,
    originalShape: ctx.originalShape,
    rawCount,
    finalCount
  });

  // Auto-fix: fallback to raw geometry if final is empty but raw exists
  if (rawCount > 0 && finalCount === 0) {
    ctx.objects_final = [...ctx.objects].map(o => ({ ...o })); 
    (ctx as any).isDegenerate = false;
    console.warn("[SHAPE_VALIDATION] Auto-fix applied: using ctx.objects as ctx.objects_final");
    return true;
  }

  // Fully degenerate: mark but DO NOT crash the entire app
  ctx.objects_final = [];
  (ctx as any).isDegenerate = true;
  return false;
}

/**
 * 2. PATCH COMPOSITE LOADER WRAPPER
 */
export async function wrapCompositeLoader(fn: (ctx: PipelineContext) => Promise<void>, ctx: PipelineContext) {
  try {
    await fn(ctx);
    validateNonDegenerateBuild(ctx, "composite_loader_patch");
  } catch (err) {
    console.error("[COMPOSITE_FATAL_PATCH]", err);
    ctx.objects = [];
    ctx.objects_final = [];
    (ctx as any).isDegenerate = true;
  }
}

/**
 * 3. PATCH PRIMITIVE GENERATOR WRAPPER
 */
export function wrapPrimitiveGenerator(fn: (ctx: PipelineContext) => any[], ctx: PipelineContext): any[] {
  const pts = fn(ctx);
  
  if (!pts || pts.length === 0) {
    console.warn(`[PRIMITIVE_PATCH] Generator produced zero geometry for: ${ctx.shape_normalised}`);
  }
  
  return pts;
}

/**
 * 4. PATCH UNIFIED PIPELINE FINALIZATION
 */
export function patchPipelineFinalization(ctx: PipelineContext) {
  if (!validateNonDegenerateBuild(ctx, "unified_pipeline_patch")) {
     console.warn(`[PIPELINE_PATCH] Zero geometry after all pipeline steps for: ${ctx.shape_normalised}`);
  }
}

console.log("DankVault™ Permanent Patch Module Initialized (Immutable, Additive, Hardened)");
