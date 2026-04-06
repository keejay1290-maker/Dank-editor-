import { MASTER_OBJECT_CATALOGUE } from "./masterObjectCatalogue";

export interface DayzObject {
  value: string;
  label: string;
  group: string;
}

/**
 * 🚀 DANKVAULT™ MASTER OBJECT REGISTRY (1400+ ASSETS)
 * Automatically categorised from vanilla game files.
 */
export const DAYZ_OBJECTS: DayzObject[] = MASTER_OBJECT_CATALOGUE.flatMap(cat => 
  cat.objects.map(obj => ({
    value: obj,
    label: obj.replace(/staticobj_|land_/gi, "").replace(/_/g, " "),
    group: cat.label
  }))
);

export const OBJECT_GROUPS = MASTER_OBJECT_CATALOGUE.map(c => c.label);

export function formatInitC(
  objectClass: string,
  worldX: number,
  worldY: number,
  worldZ: number,
  pitch: number,
  yaw: number,
  roll: number,
  scale: number
): string {
  return `SpawnObject("${objectClass}", "${worldX.toFixed(3)} ${worldY.toFixed(3)} ${worldZ.toFixed(3)}", "${pitch.toFixed(6)} ${yaw.toFixed(6)} ${roll.toFixed(6)}", ${scale.toFixed(2)});`;
}

export function formatJSON(
  objectClass: string,
  worldX: number,
  worldY: number,
  worldZ: number,
  pitch: number,
  yaw: number,
  roll: number,
  scale: number,
  enableCEPersistency: number
): string {
  return JSON.stringify({
    name: objectClass,
    pos: [parseFloat(worldX.toFixed(6)), parseFloat(worldY.toFixed(6)), parseFloat(worldZ.toFixed(6))],
    ypr: [parseFloat(pitch.toFixed(6)), parseFloat(yaw.toFixed(6)), parseFloat(roll.toFixed(6))],
    scale: parseFloat(scale.toFixed(6)),
    enableCEPersistency,
    customString: ""
  }, null, 2);
}

export const HELPER_FUNC = `// SpawnObject helper — paste this in your init.c mission file
// Usage: SpawnObject("ClassName", "X Y Z", "Pitch Yaw Roll", Scale);
ref Object SpawnObject(string type, string pos, string ori, float scale) {
    vector vPos = pos.ToVector();
    vector vOri = ori.ToVector();
    Object obj = GetGame().CreateObjectEx(type, vPos, ECE_SETUP | ECE_UPDATEPATHGRAPH | ECE_CREATEPHYSICS);
    if (obj) {
        obj.SetOrientation(vOri);
        obj.SetScale(scale);
    }
    return obj;
}

`;
