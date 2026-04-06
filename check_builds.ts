
import { COMPLETED_BUILDS } from './artifacts/dayz-builder/src/lib/completedBuilds';
import { getShapePoints } from './artifacts/dayz-builder/src/lib/shapeGenerators';

console.log(`Checking ${COMPLETED_BUILDS.length} builds...`);

let issues = 0;
for (const b of COMPLETED_BUILDS) {
    try {
        const pts = getShapePoints(b.shape, b.params || {});
        if (!pts || pts.length === 0) {
            console.error(`❌ Build ${b.id} (${b.name}) generated 0 points! Shape: ${b.shape}`);
            issues++;
        } else {
            // console.log(`✅ Build ${b.id} (${b.name}) generated ${pts.length} points.`);
        }
    } catch (err) {
        console.error(`❌ Build ${b.id} (${b.name}) CRASHED! Shape: ${b.shape}. Error: ${err.message}`);
        issues++;
    }
}

if (issues === 0) {
    console.log("🚀 All builds passed geometric integrity check!");
} else {
    console.log(`⚠️ Found ${issues} issues.`);
}
