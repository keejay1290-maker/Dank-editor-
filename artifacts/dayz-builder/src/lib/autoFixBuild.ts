import { PipelineContext, executePipeline } from "./pipeline";
import { getShapePoints } from "./shapeGenerators";
import { loadPrebuildGeometry } from "./prebuildLoader";
import { normalizeShape } from "./normalizeShape";
import { mapLogicalToRealObject, getObjectLength } from "./objectFamilies";
import { getShape, SHAPE_REGISTRY } from "./shapeRegistry";
import { addBuildToRegistry, RegistryBuild } from "./buildRegistry";
import { DayZObject } from "./dayzParser";

/**
 * 🛠️ AUTO BUILD REPAIR SYSTEM (MAGIC FIX)
 * Uses advanced heuristics to resolve common structural and pipeline failures.
 */
export async function autoFixBuild(build: any): Promise<PipelineContext> {
    console.log(`[AUTO-FIX] Initiating repair on: ${build.name || build.id}`);
    
    // 1. Load Build into PipelineContext
    const ctx_input = {
        shape: build.shape || build.id || "unknown",
        params: build.params || {},
        objects: build.objects_final || build.objects || [],
        metadata: { debugPipelineTrace: [] }
    };

    // 2. Fix Initial Shape Invalidation
    let finalShape = normalizeShape(ctx_input.shape);
    if (finalShape === "invalid_shape") {
        console.warn("[AUTO-FIX] Invalid shape detected. Guessing closest valid geometry...");
        finalShape = guessClosestValidShape(ctx_input.shape);
    }

    // 3. Fix Missing Baked Geometry (Composite)
    const shapeDef = getShape(finalShape);
    const isComposite = shapeDef?.type === "composite";
    let baked = null;
    if (isComposite) {
        baked = loadPrebuildGeometry(finalShape);
        if (!baked) {
           console.warn(`[AUTO-FIX] Missing baked geometry for ${finalShape}. Attempting to rebuild from generators...`);
           // Fallback to primitive sphere if we can't find baked data for a composite
           if (!baked) finalShape = "full_sphere"; 
        }
    }

    // 4. Regenerate Geometry if Empty
    if (ctx_input.objects.length === 0) {
        console.log("[AUTO-FIX] Zero points detected. Triggering emergency generator pass...");
        ctx_input.objects = await regenerateGeometryFromParams(finalShape, ctx_input.params);
    }

    // 5. Run Unified Pipeline (Repairs Mapping, Spacing, and Normalization)
    const ctx = await executePipeline(
        "Auto-Repair-Engine",
        build.theme || "generic",
        0,
        { ...ctx_input.params, shape: finalShape, preloadedObjects: ctx_input.objects },
        () => getShapePoints(finalShape, ctx_input.params)
    );

    // 6. Fix Spacing and Overlap (Aggressive Pass)
    ctx.objects_final = fixSpacingAndOverlap(ctx.objects_final);

    // 7. Save Fixed Build to Registry
    saveFixedBuild(build, ctx);

    return ctx;
}

/**
 * 🧠 Closest Valid Shape Suggester
 */
function guessClosestValidShape(badShape: string): string {
    const registryKeys = Object.keys(SHAPE_REGISTRY);
    const known = registryKeys.find(k => badShape.toLowerCase().includes(k) || k.includes(badShape.toLowerCase()));
    return known || "full_sphere"; // Default to gold standard sphere if all else fails
}

/**
 * 📏 Aggressive Spacing and Overlap Fixer
 */
function fixSpacingAndOverlap(objects: DayZObject[]): DayZObject[] {
    if (objects.length < 2) return objects;
    
    const fixed: DayZObject[] = [objects[0]];
    for (let i = 1; i < objects.length; i++) {
        const prev = fixed[fixed.length - 1];
        const curr = objects[i];

        const dist = Math.sqrt(
            Math.pow(curr.pos[0] - prev.pos[0], 2) + 
            Math.pow(curr.pos[2] - prev.pos[2], 2)
        );

        const L = getObjectLength(curr.name);
        
        // Remove overlaps (spacing < 80% of length)
        if (dist < 0.80 * L && curr.name === prev.name) {
            continue;
        }

        fixed.push(curr);
    }
    return fixed;
}

/**
 * 🏗️ Emergency Generator Trigger
 */
async function regenerateGeometryFromParams(shape: string, params: any): Promise<DayZObject[]> {
    const pts = getShapePoints(shape, params);
    return pts.map(p => ({
        name: p.name || "neutral_structural",
        pos: [p.x, p.y, p.z],
        ypr: [p.yaw || 0, p.pitch || 0, p.roll || 0],
        scale: p.scale || 1.0
    }));
}

/**
 * 💾 Preservation Logic
 */
function saveFixedBuild(originalBuild: any, ctx: PipelineContext) {
    const fixedBuild: RegistryBuild = {
        id: originalBuild.id || `repaired-${Date.now()}`,
        name: originalBuild.name,
        category: originalBuild.category || "Repaired",
        objectCount: ctx.objects_final.length,
        source: "editor", // Marked as editor-saved post-repair
        shape: ctx.shape_normalised || originalBuild.shape,
        params: originalBuild.params || {},
        objects_final: ctx.objects_final,
        metadata: {
            ...originalBuild.metadata,
            size: 0,
            tags: [...(originalBuild.metadata?.tags || []), "repaired"],
            timestamp: new Date().toISOString()
        }
    };

    addBuildToRegistry(fixedBuild);
}
