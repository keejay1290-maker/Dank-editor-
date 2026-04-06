
import { getShapePoints } from "../src/lib/shapeGenerators";
import { MASTER_RULESET } from "../src/lib/ruleset";

async function runStressTest() {
  const shapes = Object.keys(MASTER_RULESET.shape_registry.shapes);
  console.log(`Starting Stress Test for ${shapes.length} shapes...`);
  
  const results = [];
  
  for (const shape of shapes) {
    // Only test complex or sphere shapes (which are generators)
    const config = (MASTER_RULESET.shape_registry.shapes as any)[shape];
    if (config?.type === "complex" || config?.type === "sphere" || shape === "death_star") {
      try {
        const points = getShapePoints(shape, {});
        const count = points.length;
        console.log(`[PASS] ${shape}: ${count} points.`);
        results.push({ shape, status: "PASS", count });
      } catch (err: any) {
        console.error(`[FAIL] ${shape}: ${err.message}`);
        results.push({ shape, status: "FAIL", error: err.message });
      }
    } else {
      // console.log(`[SKIP] ${shape}: Type is ${config?.type}`);
    }
  }
  
  console.log("\n--- Stress Test Summary ---");
  const passed = results.filter(r => r.status === "PASS");
  const failed = results.filter(r => r.status === "FAIL");
  console.log(`Total Tested: ${results.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log("\nFailed Shapes:");
    failed.forEach(f => console.log(`  - ${f.shape}: ${f.error}`));
    process.exit(1);
  } else {
    console.log("\nAll generator-backed shapes are stable.");
    process.exit(0);
  }
}

runStressTest();
