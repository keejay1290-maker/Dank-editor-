import fs from 'fs';
import { getShapePoints } from "../src/lib/shapeGenerators";
import { COMPLETED_BUILDS } from "../src/lib/completedBuilds";

async function runFullAudit() {
  console.log(`Starting Full Build Audit for ${COMPLETED_BUILDS.length} global builds...`);
  const reportLines = ["DANKVAULT FULL AUDIT REPORT", "==========================="];
  
  let failedCount = 0;
  for (const build of COMPLETED_BUILDS) {
    try {
      const points = getShapePoints(build.shape, build.params || {});
      const count = points.length;
      if (count === 0) throw new Error("ZERO_POINTS_GENERATED");
      reportLines.push(`[PASS] ${build.id}: ${count} objects.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[FAIL] ${build.id}: ${msg}`);
      reportLines.push(`[FAIL] ${build.id}: ${msg}`);
      failedCount++;
    }
  }
  
  reportLines.push("", `Total: ${COMPLETED_BUILDS.length}`, `Passed: ${COMPLETED_BUILDS.length - failedCount}`, `Failed: ${failedCount}`);
  fs.writeFileSync('FULL_AUDIT_RESULTS.txt', reportLines.join("\n"));
  process.exit(failedCount > 0 ? 1 : 0);
}

runFullAudit();
