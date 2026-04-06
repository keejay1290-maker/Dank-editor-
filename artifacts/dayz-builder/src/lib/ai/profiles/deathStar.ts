import { OBJECT_FAMILY_MAP } from "../engines/objectFamilyMap";

export const DEATH_STAR_PROFILE = {
  id: "death_star",
  name: "Death Star",
  category: "🚀 Sci-Fi",
  shape: "deathstar",
  params: { radius: 50, latSegs: 32, lonSegs: 64, dishRadius: 12, dishDepth: 8, dishLat: 30 },
  frameObj: OBJECT_FAMILY_MAP.scifi.walls[0],
  fillObj: OBJECT_FAMILY_MAP.scifi.walls[0],
  lootTheme: "military",
  objectNotes: "High-fidelity industrial grey metal hull.",
  interiorType: "structure"
};
