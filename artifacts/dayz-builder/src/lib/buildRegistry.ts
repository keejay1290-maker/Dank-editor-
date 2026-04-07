import { DayZObject } from "./dayzParser";
import { executePipeline, PipelineContext } from "./pipeline";
import { getShapePoints } from "./shapeGenerators";
import { COMPLETED_BUILDS } from "./completedBuilds";
import { VAULT_FILES, VaultFile } from "./vaultData";

export interface RegistryBuild {
  id: string;
  name: string;
  category: string;
  icon?: string;
  tagline?: string;
  objectCount: number;
  dimensions?: { w: number; h: number; d: number };
  source: "prebuild" | "vault" | "editor";
  shape?: string;
  params: Record<string, number>;
  objects_final: DayZObject[];
  metadata: {
    size: number;
    tags: string[];
    timestamp: string;
    analyzed_shape?: string;
    analysis_hints?: string[];
  };
}

import { autoAnalyzeAndRegisterBuild } from "./shapeAnalyzer";

let globalRegistry: RegistryBuild[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach(l => l());
}

export const subscribeToRegistry = (l: () => void) => {
  listeners.push(l);
  return () => { listeners = listeners.filter(x => x !== l); };
};

export const getAllBuildsFromRegistry = () => globalRegistry;

export const addBuildToRegistry = (build: RegistryBuild) => {
  // 🛰️ AUTO-SHAPE ANALYZER HOOK
  const analyzedEntry = autoAnalyzeAndRegisterBuild(build);
  
  const finalBuild = {
      ...build,
      shape: analyzedEntry.shape || build.id,
      metadata: {
          ...build.metadata,
          analyzed_shape: analyzedEntry.shape,
          analysis_hints: analyzedEntry.analysis?.hints || []
      }
  };

  const index = globalRegistry.findIndex(b => b.id === finalBuild.id);
  if (index !== -1) {
    globalRegistry[index] = finalBuild;
  } else {
    globalRegistry.push(finalBuild);
  }
  notify();
};

// 🗃️ Registry Filtering Rules
const EXCLUDED_CATEGORIES = ["airdrops", "items", "weapons", "trader", "json"];
const EXCLUDED_FILES = ["atat_walker.json", "atat_walker.c", "atat_walker.dze"];

export const initRegistry = async () => {
  if (globalRegistry.length > 0) return;

  // 1. Load COMPLETED_BUILDS (Prebuilds)
  for (const b of COMPLETED_BUILDS) {
    if (EXCLUDED_FILES.includes(b.id + ".json")) continue;

    try {
      const ctx = await executePipeline(
        "PrebuildRegistry",
        "generic",
        123,
        { ...b.params, shape: b.shape, posX: b.posX, posY: b.posY, posZ: b.posZ, fillObj: b.fillObj },
        () => getShapePoints(b.shape, b.params)
      );

      addBuildToRegistry({
        id: `prebuild-${b.id}`,
        name: b.name,
        category: b.category,
        icon: b.icon,
        tagline: b.tagline,
        objectCount: ctx.objects_final.length,
        source: "prebuild",
        shape: b.shape,
        params: b.params || {},
        objects_final: ctx.objects_final,
        metadata: {
          size: 0,
          tags: [b.category, "Prebuild"],
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error(`[REGISTRY_LOAD] Failed build: ${b.id}`, err);
    }
  }

  // 2. Load VAULT_FILES (Filtered)
  for (const f of VAULT_FILES) {
    if (EXCLUDED_CATEGORIES.includes((f.category || "").toLowerCase())) continue;
    if (EXCLUDED_FILES.includes((f.name || "").toLowerCase())) continue;

    const isMasterpiece = f.path.includes("INTERNAL:masterpiece:") || 
                         COMPLETED_BUILDS.some(b => b.id === f.name.replace(".json", "").replace(".dze", ""));
    
    if (!isMasterpiece) {
      addBuildToRegistry({
        id: `vault-${f.name}`,
        name: f.name.replace(".json", "").replace(".dze", "").replace(/_/g, " "),
        category: f.category || "Vault",
        source: "vault",
        params: {},
        objectCount: Math.ceil(f.size / 250),
        objects_final: [], 
        metadata: {
          size: f.size,
          tags: [f.category, f.ext.toUpperCase()],
          timestamp: f.mtime
        }
      });
    }
  }

  console.log(`[REGISTRY] Initialized with ${globalRegistry.length} verified builds.`);
};

export const getRegistryBuildById = (id: string) => globalRegistry.find(b => b.id === id);
