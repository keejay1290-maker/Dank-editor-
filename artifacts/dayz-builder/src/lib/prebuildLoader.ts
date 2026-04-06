import { COMPLETED_BUILDS } from "./completedBuilds";
import { getAllBuildsFromRegistry } from "./buildRegistry";
import { repairObjectArray } from "./autoRepair";

/**
 * 📦 PREBUILD LOADER UTILITIES
 * Centralises access to baked geometry for composite shapes.
 */

export function prebuildJsonExists(shapeName: string): boolean {
  if (!shapeName) return false;
  const s = shapeName.toLowerCase();
  
  // 1. Check COMPLETED_BUILDS (Masterpieces)
  const isMasterpiece = COMPLETED_BUILDS.some(b => b.id.toLowerCase() === s || b.shape.toLowerCase() === s);
  if (isMasterpiece) return true;

  // 2. Check Global Registry (Includes Vault and Custom Editor builds)
  const inRegistry = getAllBuildsFromRegistry().some(b => b.id.toLowerCase() === s);
  if (inRegistry) return true;

  return false;
}

export function loadPrebuildGeometry(shapeName: string) {
  if (!shapeName) return null;
  const s = shapeName.toLowerCase();

  // 1. Priority: Registry (Active builds in current session)
  const regBuild = getAllBuildsFromRegistry().find(b => 
    b.id.toLowerCase() === s || 
    b.id.toLowerCase() === `prebuild-${s}` ||
    (b as any).shape?.toLowerCase() === s
  );

  if (regBuild && regBuild.objects_final) {
    return { 
        objects: repairObjectArray(regBuild.objects_final) 
    };
  }

  // 2. Fallback: Completed Builds (Source configuration)
  const compBuild = COMPLETED_BUILDS.find(b => b.id.toLowerCase() === s || b.shape.toLowerCase() === s);
  if (compBuild) {
    // If it has objects_final, return them (Gold Standard)
    if (compBuild.objects_final && Array.isArray(compBuild.objects_final) && compBuild.objects_final.length > 0) {
        return { 
            objects: repairObjectArray(compBuild.objects_final) 
        };
    }
    // Otherwise return null so gen_composite_shape can fall back to generator
    return null;
  }

  return null;
}
