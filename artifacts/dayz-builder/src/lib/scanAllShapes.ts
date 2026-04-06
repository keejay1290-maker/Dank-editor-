import { registerShape, getShape } from "./shapeRegistry";
import { COMPLETED_BUILDS } from "./completedBuilds";
import { VAULT_FILES } from "./vaultData";
import { getAllBuildsFromRegistry } from "./buildRegistry";
import { prebuildJsonExists } from "./prebuildLoader";

/**
 * 🛰️ CRASH-PROOF SHAPE SCANNER WRAPPER
 * Ensures that the discovery pass never throws a fatal exception.
 */
export function safeScanAllShapes() {
  try {
    if (!registerShape) {
        console.error("[SCAN] CRITICAL: registerShape definition missing from registry.");
        return;
    }

    console.log("[SCAN] Starting architectural discovery pass...");
    scanAllShapes();
    console.log("[SCAN] Architectural discovery pass completed.");
  } catch (err) {
    console.error("[SCAN_FATAL] SHAPE SCANNER CRASHED:", err);
  }
}

/**
 * 🛰️ SHAPE AUTO-SCANNER (PROTECTED)
 * Discovers and registers all available architectural blueprints.
 */
export function scanAllShapes() {
  const safeCall = (fn: any) => {
    try {
        return (typeof fn === "function") ? fn() : [];
    } catch (err) {
        console.error("[SCAN] Source fetch failed:", fn?.name || "anonymous", err);
        return [];
    }
  };

  // 1. Gather all potential build sources (with defensive array guards)
  let masterpieces = Array.isArray(COMPLETED_BUILDS) ? COMPLETED_BUILDS : [];
  let vaultEntries = Array.isArray(VAULT_FILES) ? VAULT_FILES : [];
  let registryBuilds = safeCall(getAllBuildsFromRegistry);

  const sources = [
    ...masterpieces,
    ...vaultEntries.map(f => ({ 
        shape: String(f?.name || "").replace(".json", ""), 
        source: "vault" 
    })),
    ...registryBuilds
  ];

  // 2. Scan all builds for unique shapes
  sources.forEach((build: any) => {
    if (!build?.shape) return;
    const key = String(build.shape).toLowerCase().trim();
    if (!key) return;

    // Check if it exists in prebuild registry (baked assets)
    if (typeof prebuildJsonExists === "function" && prebuildJsonExists(key)) {
      registerShape(key, {
        type: "composite",
        bakedKey: key,
        source: "prebuild"
      });
      return;
    }

    // Auto-register as composite if not already present in registry
    if (typeof getShape === "function" && !getShape(key)) {
      registerShape(key, {
        type: "composite",
        bakedKey: key,
        source: "auto"
      });
    }
  });

  // 3. Known Legacy/Manual Shapes (Hardcoded Scanner Fallbacks)
  const manualShapes = ["orbital_station", "titan_ring", "mech_core", "mega_spire", "bunker_complex"];
  manualShapes.forEach(key => {
    if (typeof getShape === "function" && !getShape(key)) {
      registerShape(key, {
        type: "composite",
        bakedKey: key,
        source: "manual"
      });
    }
  });
}
