import { OBJECT_FAMILY_MAP } from "../engines/objectFamilyMap";

export const TAJ_MAHAL_PROFILE = {
  id: "taj_mahal",
  name: "Taj Mahal",
  category: "🏛️ Monuments",
  shape: "taj_mahal",
  params: { width: 60, height: 40 },
  frameObj: OBJECT_FAMILY_MAP.architectural.white[0],
  fillObj: OBJECT_FAMILY_MAP.architectural.white[0],
  lootTheme: "civilian",
  objectNotes: "Clean white stone domed architectural landmark.",
  interiorType: "structure"
};
