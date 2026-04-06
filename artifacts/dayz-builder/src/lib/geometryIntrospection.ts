
import { Point3D } from "./shapeGenerators";

export interface IntrospectionResult {
  holes: any[];
  misalignments: any[];
  floatingObjects: any[];
  buriedObjects: any[];
  symmetry: number;
  curvature: number;
  silhouetteComplexity: number;
  densityMap: Record<string, number>;
}

export function analyzeGeometry(ctx: any): IntrospectionResult {
  const objects = ctx.objects_final || [];
  
  return {
    holes: detectHoles(objects),
    misalignments: detectMisalignments(objects),
    floatingObjects: detectFloatingObjects(objects),
    buriedObjects: detectBuriedObjects(objects),
    symmetry: detectSymmetry(objects),
    curvature: estimateCurvature(objects),
    silhouetteComplexity: estimateSilhouetteComplexity(objects),
    densityMap: computeDensityMap(objects)
  };
}

function detectHoles(objects: any[]) {
  // Look for gaps > threshold in sequences of similar objects (e.g. walls)
  return []; // Best-effort placeholder
}

function detectMisalignments(objects: any[]) {
  // Detect objects with odd rotations (not 0, 90, 180, 270) or floating-point drift
  const mis = [];
  for (const obj of objects) {
    const ay = Math.abs(obj.yaw % 90);
    if (ay > 1 && ay < 89) mis.push(obj);
  }
  return mis;
}

function detectFloatingObjects(objects: any[]) {
  // Objects with Y significantly higher than ground (0) and no support below
  // For now, any object with Y > 0.5 without a "floor" or "ground" tag is suspicious
  return objects.filter(o => o.y > 1.0 && !o.name.includes("Wall") && !o.name.includes("Floor"));
}

function detectBuriedObjects(objects: any[]) {
  // Objects with Y < -0.2 (below ground)
  return objects.filter(o => o.y < -0.2);
}

function detectSymmetry(objects: any[]) {
  // Calculate average distance from center for mirrored points
  return 0.85; // Placeholder
}

function estimateCurvature(objects: any[]) {
  // Calculate variance in yaw between neighbors
  if (objects.length < 2) return 0;
  return 0.5; // Placeholder
}

function estimateSilhouetteComplexity(objects: any[]) {
  // Ratio of bounding box volume to object count
  return 0.6; // Placeholder
}

function computeDensityMap(objects: any[]) {
  // Count objects in 10x10 grid cells
  const map: Record<string, number> = {};
  objects.forEach(o => {
    const gx = Math.floor(o.x / 10);
    const gz = Math.floor(o.z / 10);
    const key = `${gx},${gz}`;
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}
