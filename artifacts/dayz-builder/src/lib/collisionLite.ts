
import { SpatialIndex, queryNearbyObjects } from "./spatialQueries";

export function raycast(index: SpatialIndex, origin: { x: number; y: number; z: number }, direction: { x: number; y: number; z: number }, maxDistance: number) {
  const stepSize = 0.5;
  const steps = Math.ceil(maxDistance / stepSize);
  
  for (let i = 0; i <= steps; i++) {
    const t = i * stepSize;
    const pt = {
      x: origin.x + direction.x * t,
      y: origin.y + direction.y * t,
      z: origin.z + direction.z * t
    };
    
    // Check nearby for AABB hits
    const nearby = queryNearbyObjects(index, pt, 2.0);
    for (const obj of nearby) {
      const halfW = 1.0; // Approximation: Most DayZ assets are roughly 2m wide
      if (Math.abs(obj.x - pt.x) < halfW && Math.abs(obj.y - pt.y) < 2.0 && Math.abs(obj.z - pt.z) < halfW) {
        return { hit: true, point: pt, object: obj, distance: t };
      }
    }
  }
  return { hit: false };
}

export function capsuleCheck(index: SpatialIndex, start: { x: number; y: number; z: number }, end: { x: number; y: number; z: number }, radius: number) {
  // Checks if a capsule (player/AI) collides with the build
  const samples = 4;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const pt = {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
      z: start.z + (end.z - start.z) * t
    };
    const blockers = queryNearbyObjects(index, pt, radius);
    if (blockers.length > 0) return true;
  }
  return false;
}

export function isPlayerCapsuleWalkable(index: SpatialIndex, path: Array<{ x: number; y: number; z: number }>) {
  for (let i = 0; i < path.length - 1; i++) {
    if (capsuleCheck(index, path[i], path[i+1], 0.4)) return false;
  }
  return true;
}
