import { PipelineContext } from "./pipeline";

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * DANKVAULT™ MASTER OBJECT REGISTRY
 * Updated with real building objects from community build analysis.
 * ════════════════════════════════════════════════════════════════════════════════
 */

export const OBJECT_FAMILIES: Record<string, string[]> = {

  // ── CONTAINERS (industrial/sci-fi shapes only) ────────────────────────
  neutral_structural: [
    "Land_Container_1Bo",
    "Land_Container_1Aoh",
    "Land_ContainerLocked_Blue_DE",
    "Land_Container_1Mo",
  ],

  // ── REAL BUILDING WALLS (skyscraper, police, mall, hotel) ────────────
  building_wall: [
    "StaticObj_Wall_CncSmall_8",     // 8m concrete wall panel — PRIMARY
    "StaticObj_Wall_CncSmall_4",     // 4m concrete wall panel
    "StaticObj_Wall_CGry_Corner",    // grey concrete corner
    "StaticObj_Wall_Tin_5",          // tin cladding 5m
    "StaticObj_Wall_IndCNC4_Low_8",  // low industrial wall 8m
    "StaticObj_Platform1_Wall",      // platform wall
  ],

  // ── FLOORS / SLABS (confirmed from Mall Hotel: 38x Platform1_Block) ──
  floor_slab: [
    "StaticObj_Platform1_Block",     // 5x5m concrete floor slab — PRIMARY
    "StaticObj_Platform2_Block",     // platform block variant
    "StaticObj_Road_Sidewalk4_8m",   // flat sidewalk 8m
    "StaticObj_Sidewalk2_5m",        // flat sidewalk 5m
    "StaticObj_Sidewalk1_10m",       // flat sidewalk 10m
  ],

  // ── LOG CABIN / RUSTIC (confirmed from Log Cabin: 594x Timbers_Log4) ─
  log_cabin: [
    "StaticObj_Misc_Timbers_Log4",   // horizontal log wall — PRIMARY
    "StaticObj_Misc_Timbers_Log5",   // log wall variant
    "StaticObj_Misc_Timbers_Log3",   // log wall variant
    "StaticObj_Misc_Timbers_Log2",   // small log
    "StaticObj_Misc_Timbers_Log1",   // small log
  ],

  // ── SCI-FI / SPACE ────────────────────────────────────────────────────
  sci_fi_structural: [
    "Land_Container_1Bo",
    "Land_ContainerLocked_Blue_DE",
    "StaticObj_Roadblock_CncBlocks_short",
    "StaticObj_Roadblock_CncBlock",
  ],

  // ── BUNKER / MILITARY ─────────────────────────────────────────────────
  bunker_structural: [
    "StaticObj_Mil_HBarrier_6m",
    "StaticObj_Mil_HBarrier_Big",
    "StaticObj_Roadblock_CncBlock",
    "Land_Container_1Bo",
  ],

  // ── WALLS (enclosures, perimeter) ────────────────────────────────────
  wall: [
    "StaticObj_BusStation_wall",
    "Land_Castle_Wall1_20",
    "StaticObj_Wall_CncSmall_8",
    "StaticObj_Wall_IndCNC4_Low_4",
  ],

  // ── STAIRS (interior multi-level) ────────────────────────────────────
  stairs: [
    "StaticObj_Platform1_Stairs_20",       // primary stair
    "StaticObj_Platform1_Stairs_Block",    // stair block
    "StaticObj_Platform1_Stairs_30_WallR", // stair wall right
    "StaticObj_Platform1_Stairs_30_WallL", // stair wall left
    "StaticObj_Platform2_Stairs_20",       // variant
    "StaticObj_Pipe_Small_Stairs",         // pipe stairs
  ],

  // ── INTERIOR DECORATION (confirmed from police station images) ───────
  interior_decor: [
    "StaticObj_Furniture_drapes_long",        // ceiling panels
    "StaticObj_Furniture_sofa_leather_new",   // sofa
    "StaticObj_Furniture_sofa_leather_old",   // sofa variant
    "StaticObj_Furniture_office_desk",        // office desk
    "StaticObj_Furniture_table_dz",           // table
    "StaticObj_Furniture_case_a",             // cabinet
    "StaticObj_Furniture_flowers_01",         // plant
    "StaticObj_Furniture_flowers_02",         // plant variant
    "StaticObj_Furniture_picture_a",          // wall picture
    "StaticObj_Furniture_wall_board",         // wall board
    "StaticObj_Furniture_carpet_2_dz",        // floor carpet
    "StaticObj_Furniture_lobby_chair",        // chair
  ],

  // ── RACE / BARRIERS ──────────────────────────────────────────────────
  race_barrier: ["StaticObj_Misc_ConcreteBlock2_Stripes"],

  // ── CENTREPIECE ──────────────────────────────────────────────────────
  centrepiece: ["Grenade_ChemGas"],

  // ── ROCKS (for mansion/cave/natural builds) ───────────────────────────
  rock_structural: [
    "DZ\\rocks\\rock_monolith1.p3d",
    "DZ\\rocks\\rock_spike1.p3d",
    "DZ\\rocks\\rock_spike2.p3d",
    "DZ\\rocks\\rock_wallv.p3d",
    "DZ\\rocks\\rock_bright_monolith1.p3d",
  ],

  // ── WRECKS / SHIPS (confirmed from shipwreck images) ──────────────────
  wreck_structural: [
    "Wreck_Ship_Large_Front",
    "Wreck_Ship_Large_Mid",
    "Wreck_Ship_Large_Back",
    "Wreck_Ship_Fishing",
    "Wreck_Ship_Sml",
  ],

  // ── UI DROPDOWN ───────────────────────────────────────────────────────
  suggested: [
    "StaticObj_Wall_CncSmall_8",
    "StaticObj_Wall_CncSmall_4",
    "StaticObj_Platform1_Block",
    "Land_Container_1Bo",
    "Land_Container_1Aoh",
    "Land_ContainerLocked_Blue_DE",
    "StaticObj_Roadblock_CncBlock",
    "StaticObj_Mil_HBarrier_6m",
    "StaticObj_BusStation_wall",
    "Land_Castle_Wall1_20",
    "StaticObj_Misc_Timbers_Log4",
    "StaticObj_Misc_ConcreteBlock2_Stripes",
  ],
};

export const OBJECT_LENGTHS: Record<string, number> = {
  "Land_Container_1Bo":                    6.0,
  "Land_Container_1Aoh":                   6.0,
  "Land_Container_1Mo":                    6.0,
  "Land_ContainerLocked_Blue_DE":          6.0,
  "StaticObj_Wall_CncSmall_8":              8.0,
  "StaticObj_Wall_CncSmall_4":              4.0,
  "StaticObj_Wall_CGry_Corner":             4.0,
  "StaticObj_Wall_Tin_5":                   5.0,
  "StaticObj_Platform1_Block":              5.0,
  "StaticObj_Platform2_Block":              5.0,
  "StaticObj_Misc_Timbers_Log4":            4.0,
  "StaticObj_Misc_Timbers_Log5":            5.0,
  "StaticObj_Misc_Timbers_Log3":            3.0,
  "StaticObj_Platform1_Stairs_20":          5.0,
  "StaticObj_Platform1_Stairs_Block":       2.5,
  "StaticObj_Platform1_Stairs_30_WallR":    4.0,
  "StaticObj_Road_Sidewalk4_8m":            8.0,
  "StaticObj_Sidewalk2_5m":                 5.0,
  "StaticObj_Sidewalk1_10m":               10.0,
  "StaticObj_Roadblock_CncBlock":          3.0,
  "StaticObj_BusStation_wall":             8.0,
  "Land_Castle_Wall1_20":                 20.0,
  "Wreck_Ship_Large_Front":               15.0,
  "Wreck_Ship_Large_Mid":                 15.0,
  "Wreck_Ship_Large_Back":                15.0,
};

/**
 * 🗺️ MAP LOGICAL TO REAL OBJECT
 * Determines the final classname based on logical placeholder and pipeline context.
 */
export function mapLogicalToRealObject(
  logicalName: string,
  ctx: PipelineContext
): string {
  if (!logicalName) return "Land_Container_1Bo";

  // 🛡️ HARD GUARD: ChemGas is never a structural object unless flagged
  if (logicalName === "Grenade_ChemGas" && !ctx.params?.isCentrepiece) {
    return "Land_Container_1Bo"; // Reroute to safe structural
  }

  const knownPrefixes = ["Land_", "StaticObj_", "Grenade_", "Wreck_", "land_", "staticobj_", "grenade_", "wreck_", "DZ\\"];
  if (knownPrefixes.some(p => (logicalName || "").startsWith(p))) {
    return remapLegacyObject(logicalName);
  }

  const userObj = ctx.params?.objClass;
  if (userObj && userObj !== "neutral_structural" && knownPrefixes.some(p => userObj.startsWith(p))) {
    return remapLegacyObject(userObj);
  }

  const shape = (ctx.originalShape || ctx.params?.shape || "").toLowerCase();
  const theme = (ctx.metadata?.theme || ctx.theme || "generic").toLowerCase();

  // 🧠 SMART ROUTING (Section 12)
  const BUILDING_SHAPES = new Set([
    'skyscraper','tony_stark_tower','iron_man_mansion','police_station',
    'medical_centre','modern_cottage','nakatomi_plaza','shinra_hq',
    'king_kong_empire','avengers_tower','colosseum','pentagon',
    'helms_deep','peach_castle','castle_keep','barad_dur',
    'taj_mahal','fortress_of_solitude','tardis','prison_tower'
  ]);
  const LOG_SHAPES = new Set(['log_cabin', 'treehouse', 'farmstead']);
  const WRECK_SHAPES = new Set(['shipwreck', 'aircraft_carrier', 'submarine', 'destroyer', 'helicarrier']);

  let familyKey = "neutral_structural";

  if (BUILDING_SHAPES.has(shape)) familyKey = 'building_wall';
  else if (LOG_SHAPES.has(shape)) familyKey = 'log_cabin';
  else if (WRECK_SHAPES.has(shape)) familyKey = 'wreck_structural';
  else if (shape.includes("deathstar") || shape.includes("ufo") || theme === "sci_fi") familyKey = "sci_fi_structural";
  else if (shape.includes("bunker") || theme === "bunker") familyKey = "bunker_structural";
  else if (shape.includes("arena") || theme === "arena") familyKey = "arena_structural";
  else if (shape.includes("maze")) familyKey = "maze_structural";
  else if (shape.includes("castle") || theme === "medieval") familyKey = "medieval_structural";
  else if (OBJECT_FAMILIES[logicalName]) familyKey = logicalName;

  const family = OBJECT_FAMILIES[familyKey] ?? OBJECT_FAMILIES.neutral_structural;
  const idx = (ctx as any)._objCounter = (((ctx as any)._objCounter ?? -1) + 1);
  return family[idx % family.length];
}

export function remapLegacyObject(name: string): string {
  const LEGACY_MAP: Record<string, string> = {
    "Land_Wall_Concrete_4m":        "StaticObj_Wall_CncSmall_4",
    "Land_Wall_Concrete_8m":        "StaticObj_Wall_CncSmall_8",
    "Land_Wall_Brick_4m":           "StaticObj_Wall_CncSmall_4",
    "Land_Wall_Brick_2m":           "StaticObj_Wall_CncSmall_4",
    "Land_Wall_Stone_8m":           "StaticObj_Wall_CncSmall_8",
    "neutral_structural":           "Land_Container_1Bo",
    "wall":                         "StaticObj_BusStation_wall",
  };
  if (!name) return "Land_Container_1Bo";
  return LEGACY_MAP[name] || LEGACY_MAP[name.toLowerCase()] || name;
}

export function getObjectLength(objName: string): number {
  if (!objName) return 6.0;
  if (OBJECT_LENGTHS[objName]) return OBJECT_LENGTHS[objName];
  return 6.0;
}
