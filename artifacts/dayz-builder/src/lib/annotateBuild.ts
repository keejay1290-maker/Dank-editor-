
import { SpatialIndex, queryNearbyObjects } from "./spatialQueries";

export interface BuildAnnotations {
  entrances: any[];
  exits: any[];
  chokePoints: any[];
  platforms: any[];
  ramps: any[];
  walls: any[];
  floors: any[];
  ceilings: any[];
  decorative: any[];
  structural: any[];
}

export function annotateBuild(ctx: any): BuildAnnotations {
  const index = ctx.spatialIndex;
  const objects = ctx.objects_final || [];
  
  return {
    entrances: detectEntrances(index, objects),
    exits: detectExits(index, objects),
    chokePoints: detectChokePoints(index, objects),
    platforms: detectPlatforms(index, objects),
    ramps: detectRamps(index, objects),
    walls: detectWalls(objects),
    floors: detectFloors(objects),
    ceilings: detectCeilings(objects),
    decorative: detectDecorative(objects),
    structural: detectStructural(objects)
  };
}

function detectEntrances(index: SpatialIndex, objects: any[]) {
  // Look for gaps in wall clusters with floor assets below them at ground level
  return objects.filter(o => o.name.toLowerCase().includes("door") || o.name.toLowerCase().includes("gate"));
}

function detectExits(index: SpatialIndex, objects: any[]) { return detectEntrances(index, objects); }

function detectChokePoints(index: SpatialIndex, objects: any[]) {
  // Narrow passages between wall assets
  return []; 
}

function detectPlatforms(index: SpatialIndex, objects: any[]) {
  return objects.filter(o => o.name.toLowerCase().includes("platform") || (o.name.toLowerCase().includes("floor") && o.y > 2));
}

function detectRamps(index: SpatialIndex, objects: any[]) {
  return objects.filter(o => o.name.toLowerCase().includes("ramp") || o.name.toLowerCase().includes("stairs") || Math.abs(objRoll(o)) > 10);
}

function objRoll(o: any) { return (o.roll || 0); }

function detectWalls(objects: any[]) { return objects.filter(o => o.name.toLowerCase().includes("wall")); }

function detectFloors(objects: any[]) { return objects.filter(o => o.name.toLowerCase().includes("floor") || o.name.toLowerCase().includes("bottom")); }

function detectCeilings(objects: any[]) { return objects.filter(o => o.name.toLowerCase().includes("ceiling") || o.name.toLowerCase().includes("roof")); }

function detectDecorative(objects: any[]) {
  const decos = ["light", "barrel", "crate", "furniture", "sign", "graffiti"];
  return objects.filter(o => decos.some(d => o.name.toLowerCase().includes(d)));
}

function detectStructural(objects: any[]) {
  const struc = ["beam", "pillar", "column", "support", "girder"];
  return objects.filter(o => struc.some(s => o.name.toLowerCase().includes(s)));
}
