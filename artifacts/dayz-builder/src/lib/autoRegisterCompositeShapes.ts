import { registerShape, getShape } from "./shapeRegistry";
import { COMPLETED_BUILDS } from "./completedBuilds";
import { gen_composite_shape } from "./generators/gen_composite_shape";
import { prebuildJsonExists } from "./prebuildLoader";

/**
 * 🏗️ AUTO-REGISTER COMPOSITE SHAPES
 * Scans static masterpieces and ensures they are in SHAPE_REGISTRY as composite types.
 */
export function autoRegisterCompositeShapes() {
    COMPLETED_BUILDS.forEach(build => {
        const shapeName = build.shape.toLowerCase();
        
        // Only register if file/geometry exists and not already in registry
        if (!getShape(shapeName) && prebuildJsonExists(shapeName)) {
            console.log(`[AUTO_REGISTER] Registering ${shapeName} as composite_shape`);
            registerShape(shapeName, { 
                type: "composite",
                generator: gen_composite_shape,
                supports_hollow_shell: false,
                curvature_critical: false
            });
        } else if (!prebuildJsonExists(shapeName)) {
            console.warn(`[AUTO_REGISTER] Skipped ${shapeName}: Baked geometry missing.`);
        }
    });

    console.log(`[AUTO_REGISTER] Composite scan complete.`);
}
