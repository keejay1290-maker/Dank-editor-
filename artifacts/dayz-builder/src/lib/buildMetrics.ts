
import { SpatialIndex, queryNearbyObjects } from "./spatialQueries";

export interface BuildMetrics {
  walkableArea: number;
  enclosedVolume: number;
  openVolume: number;
  avgCeilingHeight: number;
  avgCorridorWidth: number;
  chokePoints: number;
  deadEnds: number;
  verticalLayers: number;
  reachablePlatforms: number;
  unreachableObjects: number;
}

export function computeBuildMetrics(ctx: any): BuildMetrics {
  const index = ctx.spatialIndex;
  const objects = ctx.objects_final || [];
  
  return {
    walkableArea: estimateWalkableArea(index, objects),
    enclosedVolume: estimateEnclosedVolume(index, objects),
    openVolume: estimateOpenVolume(index, objects),
    avgCeilingHeight: estimateAvgCeilingHeight(index, objects),
    avgCorridorWidth: estimateAvgCorridorWidth(index, objects),
    chokePoints: countChokePoints(index, objects),
    deadEnds: countDeadEnds(index, objects),
    verticalLayers: countVerticalLayers(index, objects),
    reachablePlatforms: countReachablePlatforms(index, objects),
    unreachableObjects: countUnreachableObjects(index, objects)
  };
}

function estimateWalkableArea(index: SpatialIndex, objects: any[]) {
  // Count floor-like objects and multiply by their footprint (roughly 4x4m)
  const floorLike = objects.filter(o => o.name.toLowerCase().includes("floor") || o.name.toLowerCase().includes("platform"));
  return floorLike.length * 16;
}

function estimateEnclosedVolume(index: SpatialIndex, objects: any[]) {
  // Estimate interior volume via interior/exterior parity check logic
  return floorLikeObjects(objects).length * 16 * 3; // Best-effort height=3
}

function floorLikeObjects(objs: any[]) { return objs.filter(o => o.name.toLowerCase().includes("floor")); }

function estimateOpenVolume(index: SpatialIndex, objects: any[]) {
  // Bounding box volume minus enclosed
  return 1000; // Placeholder
}

function estimateAvgCeilingHeight(index: SpatialIndex, objects: any[]) {
  // Average distance between floor and ceiling assets vertically aligned in grid
  return 3.5; // Placeholder
}

function estimateAvgCorridorWidth(index: SpatialIndex, objects: any[]) {
  // Average distance between wall segments
  return 2.5; // Placeholder
}

function countChokePoints(index: SpatialIndex, objects: any[]) {
  // Narrow passages between structural walls
  return 2 + Math.floor(objects.length / 50); // Heuristic
}

function countDeadEnds(index: SpatialIndex, objects: any[]) {
  // Enclosed regions with only one entry point
  return 0; // Placeholder
}

function countVerticalLayers(index: SpatialIndex, objects: any[]) {
  // Count unique floor-level Y-values (+/-1m variance)
  const ys = new Set();
  objects.filter(o => o.name.includes("Floor")).forEach(o => ys.add(Math.round(o.y / 3) * 3));
  return ys.size || 1;
}

function countReachablePlatforms(index: SpatialIndex, objects: any[]) {
  // Platforms connected by ramps/stairs
  return 2; // Placeholder
}

function countUnreachableObjects(index: SpatialIndex, objects: any[]) {
  // Objects isolated from the primary navigation mesh
  return 0; // Placeholder
}
