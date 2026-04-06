import { PipelineContext } from "../pipeline";
import { loadPrebuildGeometry } from "../prebuildLoader";

/**
 * 📦 UNIVERSAL COMPOSITE SHAPE LOADER
 * Replaces generation with baked geometry from masterpieces, vault entries, or registry.
 */
export async function gen_composite_shape(ctx: PipelineContext): Promise<PipelineContext> {
    try {
        if (!ctx) return ctx;
        const key = (ctx.originalShape || ctx.shape_normalised || ctx.shape || "").toLowerCase().trim();
        
        // 🛡️ Load guard
        const baked = typeof loadPrebuildGeometry === "function" ? loadPrebuildGeometry(key) : null;
        
        if (!baked?.objects || !Array.isArray(baked.objects) || baked.objects.length === 0) {
            console.warn(`[COMPOSITE_SHAPE] Missing baked geometry for artifact: ${key}`);
            ctx.objects = ctx.objects || [];
            return ctx;
        }

        // 🛡️ Safe Mapping
        ctx.objects = baked.objects.map(o => ({
            name: o?.name || "unknown_object",
            pos: Array.isArray(o?.pos) ? [o.pos[0] ?? 0, o.pos[1] ?? 0, o.pos[2] ?? 0] as [number, number, number] : [0,0,0] as [number, number, number],
            ypr: Array.isArray(o?.ypr) ? [o.ypr[0] ?? 0, o.ypr[1] ?? 0, o.ypr[2] ?? 0] as [number, number, number] : [0,0,0] as [number, number, number],
            scale: o?.scale ?? 1,
            meta: o?.meta || {}
        }));

        ctx.isComposite = true;
        ctx.curvature_critical = false;
        ctx.silhouette_locked = false;

        // Log trace
        if (!ctx.metadata.debugPipelineTrace) ctx.metadata.debugPipelineTrace = [];
        ctx.metadata.debugPipelineTrace.push(`gen_composite_shape (${key})`);

        return ctx;
    } catch (err) {
        console.error("[COMPOSITE_SHAPE_FATAL] CRITICAL MATERIALIZATION FAILURE:", err);
        ctx.objects = ctx.objects || [];
        return ctx;
    }
}
