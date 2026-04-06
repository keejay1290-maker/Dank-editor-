/**
 * 🛰️ DANKVAULT™ PREBUILD PROTECTION + PREVIEW RESTORATION
 * Ensures prebuilds always exist, always display, and are never overwritten by auto-analyzer.
 */

import { SHAPE_REGISTRY } from "./shapeRegistry";
import { getAllBuildsFromRegistry, RegistryBuild } from "./buildRegistry";
import { COMPLETED_BUILDS } from "./completedBuilds";

if (!(globalThis as any).__DANKVAULT_PREBUILD_RESTORE__) {
  (globalThis as any).__DANKVAULT_PREBUILD_RESTORE__ = true;

  // ---------------------------------------------
  // 1. PROTECT PREBUILDS FROM BEING OVERWRITTEN
  // ---------------------------------------------
  const PREBUILD_SOURCES = ["prebuild", "CompletedBuilds", "Vault", "Prebuilds"];

  (globalThis as any).isPrebuild = function isPrebuild(entry: any) {
    return PREBUILD_SOURCES.includes(entry?.source);
  };

  /**
   * 🛠️ RESTORE PREBUILD REGISTRY ENTRIES
   * Repopulates the core shape registry with verified masterpiece definitions.
   */
  (globalThis as any).restorePrebuilds = function restorePrebuilds(prebuildList: any[]) {
    for (const pb of prebuildList) {
      if (!pb || !pb.name) continue;
      const key = String(pb.name).toLowerCase().trim();

      SHAPE_REGISTRY[key] = {
        ...pb,
        source: "Prebuilds",
        analyzed: true
      };

      console.log("[PREBUILD_RESTORE] Restored architectural entry:", pb.name);
    }
  };

  /**
   * 🛠️ ENHANCE REGISTRY WITH PREVIEW METADATA
   * Ensures every build has a render-ready objects array for thumbnails.
   */
  (globalThis as any).getEnhancedPrebuildList = function getEnhancedPrebuildList(): RegistryBuild[] {
    const list = getAllBuildsFromRegistry();

    return list.map(pb => ({
      ...pb,
      previewReady: true,
      previewObjects: Array.isArray(pb.objects_final) ? pb.objects_final : []
    } as any));
  };

  /**
   * 🛠️ RENDER PREBUILD THUMBNAIL
   * Uses the safe pipeline renderer to generate a diagnostic preview for the library grid.
   */
  (globalThis as any).renderPrebuildThumbnail = function renderPrebuildThumbnail(pb: any) {
    if (!pb || !pb.previewObjects || pb.previewObjects.length === 0) {
      return `
        <div style="color:#aaa;font-family:monospace;padding:8px;font-size:10px;text-align:center;border:1px solid #333;">
          PREVIEW_MISSING
        </div>
      `;
    }

    // Logic to be used in the PointCloud3D or Thumbnail component
    return {
        objects: pb.previewObjects,
        isDegenerate: false
    };
  };

  console.log("DankVault™ Prebuild Protection + Restoration Initialized.");
}

export const restorePrebuilds = (globalThis as any).restorePrebuilds;
export const getEnhancedPrebuildList = (globalThis as any).getEnhancedPrebuildList;
export const renderPrebuildThumbnail = (globalThis as any).renderPrebuildThumbnail;
