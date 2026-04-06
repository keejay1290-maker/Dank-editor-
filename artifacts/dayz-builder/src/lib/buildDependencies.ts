import { SHAPE_REGISTRY } from "./shapeRegistry";
import { OBJECT_FAMILIES } from "./objectFamilies";

/**
 * 🔗 BUILD DEPENDENCY ANALYZER
 * Maps masterpieces to their static geometric and theme requirements.
 */

export interface BuildDependencies {
  bakedFiles: string[];
  objectFamilies: string[];
  materials: string[];
  subBuilds: string[];
}

export function computeBuildDependencies(build: any): BuildDependencies {
  const deps: BuildDependencies = {
    bakedFiles: [],
    objectFamilies: [],
    materials: [],
    subBuilds: []
  };

  const shape = build.shape || build.id || "unknown";
  const def = SHAPE_REGISTRY[shape];

  // 1. Map baked geometry requirements
  if (def?.type === "composite") {
    deps.bakedFiles = [`/prebuilds/${shape}.json`];
  }

  // 2. Identify object families
  const isSciFi = build.category?.toLowerCase().includes("sci-fi") || build.theme === "death_star";
  deps.objectFamilies = isSciFi ? ["sci_fi_structural"] : ["neutral_structural"];

  // 3. Extract materials (if any specified in params)
  if (build.params?.material) deps.materials = [build.params.material];

  // 4. Resolve nested references
  if (build.params?.subShapes) deps.subBuilds = build.params.subShapes;

  return deps;
}

export function buildDependencyGraph(allBuilds: any[]): Record<string, BuildDependencies> {
  const graph: Record<string, BuildDependencies> = {};
  allBuilds.forEach(build => {
    graph[build.name || build.id] = computeBuildDependencies(build);
  });
  return graph;
}
