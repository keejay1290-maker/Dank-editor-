import { validateAllBuilds } from "./validateAllBuilds";
import { addBuildToRegistry, getAllBuildsFromRegistry, RegistryBuild } from "./buildRegistry";
import { computeBuildHealth } from "./computeBuildHealth";

/**
 * 🌙 NIGHTLY AUTO-VALIDATION SYSTEM
 * Automatically scans the entire build fleet for structural failures.
 */
export async function nightlyAutoValidate() {
  console.log("[NIGHTLY] Running auto-validation pass...");
  const results = await validateAllBuilds();
  
  // 1. Report Saving (Simulated or via API)
  saveValidationReport(results, "/validation/last-run.json");

  // 2. State & UI Sync
  updateBuildBadges(results);
  updateHealthScores(results);

  console.log(`[NIGHTLY] Pass complete. ${results.filter(r => r.status === "PASS").length} builds passed.`);
}

/**
 * 📄 REPORT STORAGE
 * Writes the validation data to a persistence layer.
 */
function saveValidationReport(results: any[], path: string) {
  const report = {
    timestamp: new Date().toISOString(),
    totalBuilds: results.length,
    passed: results.filter(r => r.status === "PASS").length,
    failed: results.filter(r => r.status === "FAIL").length,
    perBuildResults: results,
    healthScores: results.map(r => ({ name: r.build, score: r.health })),
    errors: results.filter(r => r.error).map(r => ({ name: r.build, msg: r.error })),
    traces: results.map(r => ({ name: r.build, trace: r.trace }))
  };

  // Persist to localStorage for frontend visibility
  localStorage.setItem("DANK_VALIDATION_REPORT", JSON.stringify(report));
  
  // Also log to console for background monitoring
  console.table(report.perBuildResults.map(r => ({ Name: r.build, Status: r.status, Health: r.health })));
}

/**
 * 🏅 BADGE SYNC
 */
function updateBuildBadges(results: any[]) {
    // This is handled by global state updates in App.tsx reacting to results mapping
}

/**
 * 🏥 HEALTH METADATA UPDATE
 */
function updateHealthScores(results: any[]) {
  const currentBuilds = getAllBuildsFromRegistry();
  results.forEach(res => {
    const build = currentBuilds.find(b => b.name === res.build || b.id === res.id);
    if (build) {
      (build.metadata as any).healthScore = res.health;
      (build.metadata as any).validationStatus = res.status;
      addBuildToRegistry(build); // Push update to UI listeners
    }
  });
}

/**
 * ⏰ 24H SCHEDULER
 */
export function startNightlyScheduler() {
    const DAY_MS = 24 * 60 * 60 * 1000;
    console.log("[NIGHTLY] Scheduler active. Scan runs every 24 hours.");
    
    // Initial run on startup (background)
    setTimeout(nightlyAutoValidate, 5000); 

    // Recursive schedule
    setInterval(nightlyAutoValidate, DAY_MS);
}
