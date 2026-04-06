import { COMPLETED_BUILDS } from "../src/lib/completedBuilds";
import { SHAPE_DEFS } from "../src/lib/shapeParams";
// We can't import getShapePoints easily because it might have side effects or be complex, 
// so we'll just check if the shape key exists in SHAPE_DEFS as a proxy.

console.log("Checking for missing shape definitions...");
const missing = [];
for (const b of COMPLETED_BUILDS) {
    if (!SHAPE_DEFS[b.shape]) {
        missing.push({ id: b.id, shape: b.shape });
    }
}

if (missing.length > 0) {
    console.log(`Found ${missing.length} builds with missing shape definitions:`);
    missing.forEach(m => console.log(`  - ${m.id} (Shape: ${m.shape})`));
} else {
    console.log("All global builds have associated shape definitions.");
}
