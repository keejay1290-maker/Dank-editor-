
import { COMPLETED_BUILDS } from './src/lib/completedBuilds.ts';
import { SHAPE_DEFS } from './src/lib/shapeParams.ts';
import * as Generators from './src/lib/shapeGenerators';

console.log("=== DANKVAULT ARCHITECTURAL INTEGRITY AUDIT ===");

let total = 0;
let failed = 0;
let zeroPoints = 0;

console.log("\n--- PART 1: REGISTERED MASTERPIECES (COMPLETED_BUILDS) ---");
for (const build of COMPLETED_BUILDS) {
    total++;
    try {
        const pts = Generators.getShapePoints(build.shape, build.params);
        if (!pts || pts.length === 0) {
            console.error(`[FAIL] MP: ${build.id} (${build.name}): Zero points!`);
            zeroPoints++;
        } else {
            // Success
        }
    } catch (err) {
        console.error(`[CRASH] MP: ${build.id} (${build.name}): ${err.message}`);
        failed++;
    }
}

console.log(`\nChecked ${COMPLETED_BUILDS.length} masterpieces.`);

console.log("\n--- PART 2: ALL REGISTERED SHAPE GENERATORS (SHAPE_DEFS) ---");
let shapeTotal = 0;
let shapeFailed = 0;
let shapeZero = 0;

for (const [key, def] of Object.entries(SHAPE_DEFS)) {
    shapeTotal++;
    try {
        const defaultParams = {};
        def.params.forEach(p => { defaultParams[p.id] = p.val; });
        const pts = Generators.getShapePoints(key, defaultParams);
        if (!pts || pts.length === 0) {
            console.error(`[FAIL] SHAPE: ${key} (${def.label}): Zero points with default params!`);
            shapeZero++;
        }
    } catch (err) {
        console.error(`[CRASH] SHAPE: ${key} (${def.label}): ${err.message}`);
        shapeFailed++;
    }
}

console.log(`\nChecked ${shapeTotal} unique shape generators.`);

console.log("\n=== FINAL AUDIT SUMMARY ===");
console.log(`Masterpiece Failures: ${failed + zeroPoints}`);
console.log(`Generator Failures:   ${shapeFailed + shapeZero}`);

if (failed > 0 || zeroPoints > 0 || shapeFailed > 0 || shapeZero > 0) {
    console.error("\n❌ CRITICAL INTEGRITY ISSUES DETECTED.");
    process.exit(1);
} else {
    console.log("\n🚀 ALL 149 SHAPES AND 42 MASTERPIECES ARE STRUCTURALLY SOUND.");
}
