
import { identifyShapeArchetype } from "./shapeUtils";

export const SHAPE_REGISTRY: Record<string, any> = {
  // Canonical primitives
  "full_sphere": { type: "primitive", category: "sphere" },
  "ring": { type: "primitive", category: "ring" },
  "cylinder": { type: "primitive", category: "tower" },
  "cube": { type: "primitive", category: "box" },
  "cluster": { type: "primitive", category: "cluster" },
  "disc": { type: "primitive", category: "disc" },
  "tower": { type: "primitive", category: "tower" },
  "line": { type: "primitive", category: "line" },
  "spoke_hub": { type: "primitive", category: "spoke_hub" },
  "millennium_falcon": { type: "masterpiece", category: "millennium_falcon" },
  "torus": { type: "masterpiece", category: "torus" },
  "star_fort": { type: "masterpiece", category: "star_fort" }
};

const PREBUILD_SOURCES = ["prebuild", "CompletedBuilds", "Vault", "Prebuilds"];
const isPrebuild = (entry: any) => PREBUILD_SOURCES.includes(entry?.source);

export function registerShape(name: string, def: any) {
  const key = String(name).toLowerCase().trim();
  const existing = SHAPE_REGISTRY[key];

  if (existing && isPrebuild(existing)) {
    console.log("[PREBUILD_PROTECT] Preventing manual overwrite of masterpiece:", key);
    return;
  }

  SHAPE_REGISTRY[key] = { ...def, name: key };
}

/**
 * 🕵️ AUTO-SCANNER & REGISTRY PATCH
 * Intercepts unknown shape requests and auto-registers them with fallback logic.
 */
export function getShape(name: string) {
  if (!name) return SHAPE_REGISTRY["cluster"];

  const key = String(name).toLowerCase().trim();
  const existing = SHAPE_REGISTRY[key];

  if (existing) return existing;

  // 🛰️ SHAPE NOT FOUND -> AUTO-CLASSIFY
  // We use identifyShapeArchetype instead of normalizeShape to break circularity
  const normalized = identifyShapeArchetype(key);
  const fallback = SHAPE_REGISTRY[normalized];

  if (fallback) {
    console.warn(`[AUTO_SHAPE_REGISTRY] Unknown shape '${key}' auto-registered as fallback '${normalized}'`);
    SHAPE_REGISTRY[key] = { ...fallback, isAutoRegistered: true, originalName: key };
    return SHAPE_REGISTRY[key];
  }

  // 🚑 CRITICAL FALLBACK
  console.error(`[AUTO_SHAPE_REGISTRY] Total failure to classify shape '${key}'. Using cluster emergency fallback.`);
  return SHAPE_REGISTRY["cluster"];
}

export const getShapeDef = getShape;

export function getShapeRegistry() {
  return SHAPE_REGISTRY;
}
