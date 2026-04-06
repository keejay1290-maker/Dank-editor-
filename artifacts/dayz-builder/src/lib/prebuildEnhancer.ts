/**
 * 🛰️ DANKVAULT™ PREBUILD ENHANCER & UPGRADE ENGINE
 * Combined module for auto-rebuilding geometry, generating thumbnails,
 * and modernizing existing builds.
 */

import { loadPrebuildGeometry } from "./prebuildLoader";
import { getAllBuildsFromRegistry } from "./buildRegistry";
import { repairCtxGeometry } from "./autoRepair";
import { SHAPE_REGISTRY } from "./shapeRegistry";
import { getShapePoints } from "./shapeGenerators";
import { COMPLETED_BUILDS } from "./completedBuilds";

// ====================================================
// 🛸 DANKVAULT™ PREBUILD ENHANCER MODULE
// ====================================================

if (!(globalThis as any).__DANKVAULT_PREBUILD_ENHANCER__) {
  (globalThis as any).__DANKVAULT_PREBUILD_ENHANCER__ = true;

  const PREVIEW_CACHE = new Map<string, string>();
  const GEOMETRY_CACHE = new Map<string, any[]>();

  // Ensure dependencies are on globalThis for the snippet logic
  (globalThis as any).loadPrebuildGeometry = (globalThis as any).loadPrebuildGeometry || loadPrebuildGeometry;
  (globalThis as any).getPrebuildList = (globalThis as any).getPrebuildList || getAllBuildsFromRegistry;

  (globalThis as any).detectTheme = function detectTheme(name: string) {
    const n = (name || "").toLowerCase();
    if (n.includes("ufo") || n.includes("alien") || n.includes("xeno")) return "alien";
    if (n.includes("mech") || n.includes("core") || n.includes("walker")) return "mech";
    if (n.includes("station") || n.includes("orbital") || n.includes("satellite")) return "sci-fi";
    if (n.includes("industrial") || n.includes("factory") || n.includes("plant")) return "industrial";
    return "sci-fi";
  };

  (globalThis as any).autoRebuildPrebuildGeometry = function autoRebuildPrebuildGeometry(pb: any) {
    if (!pb || !pb.name) return pb;
    const key = pb.name;

    if (GEOMETRY_CACHE.has(key)) {
      pb.objects = GEOMETRY_CACHE.get(key);
      return pb;
    }

    let objects = Array.isArray(pb.objects) ? pb.objects : [];

    if (!objects.length && (globalThis as any).loadPrebuildGeometry) {
      try {
        const baked = (globalThis as any).loadPrebuildGeometry(key.toLowerCase());
        if (baked && Array.isArray(baked.objects) && baked.objects.length > 0) {
          objects = baked.objects;
          console.warn("[PREBUILD_AUTOREBUILD] Recovered baked geometry for:", key);
        } else {
          // 🚀 NEW: Fallback to real-time generator for masterpieces
          const master = COMPLETED_BUILDS.find(b => b.id === pb.id || b.name === pb.name);
          if (master) {
             const points = getShapePoints(master.shape, master.params);
             objects = points.map(p => ({
               name: p.name || master.fillObj || "Land_Container_1Bo",
               pos: [p.x + (master.posX || 0), p.y + (master.posY || 0), p.z + (master.posZ || 0)],
               ypr: [p.yaw || 0, p.pitch || 0, p.roll || 0],
               scale: p.scale || 1.0
             }));
          }
        }
      } catch (err) {
        console.error("[PREBUILD_AUTOREBUILD_FATAL]", key, err);
      }
    }

    pb.objects = Array.isArray(objects) ? objects : [];
    GEOMETRY_CACHE.set(key, pb.objects);
    return pb;
  };

  (globalThis as any).renderPrebuildThumbnail = function renderPrebuildThumbnail(pb: any) {
    if (!pb || !pb.name) {
      return `<div style="color:#aaa;font-family:monospace;padding:8px;font-size:10px;">Invalid prebuild</div>`;
    }

    const key = pb.name;

    if (PREVIEW_CACHE.has(key)) {
      return PREVIEW_CACHE.get(key);
    }

    pb = (globalThis as any).autoRebuildPrebuildGeometry(pb);

    if (!pb.objects || pb.objects.length === 0) {
      const html = `<div style="color:#5a8a5a;font-family:monospace;padding:8px;font-size:9px;text-align:center;border:1px solid #1a2e1a;background:#0c1510;">No preview available</div>`;
      PREVIEW_CACHE.set(key, html);
      return html;
    }

    // Use safe preview renderer (Integrated high-fidelity SVG logic)
    const previewHtml = (globalThis as any).renderPreviewSafe ? (globalThis as any).renderPreviewSafe({
      objects_final: pb.objects,
      isDegenerate: false
    }) : `
      <div style="background:#060402;height:100%;width:100%;display:flex;align-items:center;justify-content:center;color:#27ae60;font-family:monospace;font-size:10px;border:1px solid #1a2e1a;">
        PREVIEW_ACTIVE: ${pb.objects.length} NODES
      </div>
    `;

    PREVIEW_CACHE.set(key, previewHtml);
    return previewHtml;
  };

  (globalThis as any).getThemedPrebuildGroups = function getThemedPrebuildGroups() {
    if (!(globalThis as any).getPrebuildList) return {};

    const list = (globalThis as any).getPrebuildList();
    const groups: Record<string, any[]> = {
      "sci-fi": [],
      "mech": [],
      "alien": [],
      "industrial": [],
      "other": []
    };

    for (const pb of list) {
      if (!pb || !pb.name) continue;

      const theme = (globalThis as any).detectTheme(pb.name);
      const entry = {
        ...pb,
        theme,
        thumbnail: (globalThis as any).renderPrebuildThumbnail(pb)
      };

      if (!groups[theme]) groups[theme] = [];
      groups[theme].push(entry);
    }

    return groups;
  };

  console.log("DankVault™ Prebuild Enhancer Loaded (auto-rebuild, thumbnails, cache, themed groups).");
}


// ====================================================
// 🏗️ DANKVAULT™ EXISTING BUILD UPGRADE ENGINE
// ====================================================

if (!(globalThis as any).__DANKVAULT_EXISTING_BUILD_UPGRADER__) {
  (globalThis as any).__DANKVAULT_EXISTING_BUILD_UPGRADER__ = true;

  // Sync SHAPE_REGISTRY to global
  (globalThis as any).SHAPE_REGISTRY = (globalThis as any).SHAPE_REGISTRY || SHAPE_REGISTRY;

  function collectAllBuilds() {
    const registry = (globalThis as any).SHAPE_REGISTRY || {};
    const builds = [];
    for (const key in registry) {
      const entry = registry[key];
      if (!entry || !entry.name) continue;
      builds.push(entry);
    }
    return builds;
  }

  function upgradeBuild(build: any) {
    if (!build || !build.name) return build;

    if ((globalThis as any).autoRebuildPrebuildGeometry) {
      build = (globalThis as any).autoRebuildPrebuildGeometry(build);
    }

    if (typeof repairCtxGeometry === "function") {
      const ctx = {
        objects: build.objects || [],
        objects_final: build.objects || [],
        errors: [],
        warnings: [],
        id: build.id || build.name,
        params: {},
        fidelityScore: 0,
        isDegenerate: false
      };
      repairCtxGeometry(ctx as any, "existing_build_upgrade");
      build.objects = ctx.objects_final;
    }

    if ((globalThis as any).resolveShape) {
      build.shape = (globalThis as any).resolveShape(build.name, build.objects);
    }

    if ((globalThis as any).detectTheme) {
      build.theme = (globalThis as any).detectTheme(build.name);
    }

    if ((globalThis as any).renderPrebuildThumbnail) {
      build.thumbnail = (globalThis as any).renderPrebuildThumbnail(build);
    }

    build.upgraded = true;
    return build;
  }

  (globalThis as any).upgradeAllExistingBuilds = function upgradeAllExistingBuilds() {
    const builds = collectAllBuilds();
    console.log(`[BUILD_UPGRADE] 현대화 process started for ${builds.length} targets...`);

    for (const build of builds) {
      try {
        const upgraded = upgradeBuild(build);
        (globalThis as any).SHAPE_REGISTRY[build.name] = upgraded;
        console.log("[BUILD_UPGRADE] Upgraded:", build.name, "→", upgraded.shape);
      } catch (err) {
        console.error(`[BUILD_UPGRADE_FATAL] ${build.name}:`, err);
      }
    }
    console.log("DankVault™ Existing Build Upgrade Complete.");
  };

  setTimeout(() => {
    if ((globalThis as any).upgradeAllExistingBuilds) {
      (globalThis as any).upgradeAllExistingBuilds();
    }
  }, 250);

  console.log("DankVault™ Existing Build Upgrade Engine Loaded.");
}
