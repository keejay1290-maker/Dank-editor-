export interface DayzObject {
  value: string;
  label: string;
  group: string;
}

export const DAYZ_OBJECTS: DayzObject[] = [
  // ─── ⚔ Arena & Castle Walls ── BEST FOR PvP ARENAS ──────────────────────
  // ★ RECOMMENDED: Land_Castle_Wall_3m_DE — authentic stone height, perfect for arena perimeters
  // ★ ALSO GREAT:  Land_Wall_Concrete_4m_DE — modern fortress feel, excellent cover height
  { value: "Land_Castle_Wall_3m_DE",     label: "Castle Stone Wall 3m ★ BEST ARENA WALL", group: "Arena & Castle Walls" },
  { value: "Land_Castle_Wall_6m_DE",     label: "Castle Stone Wall 6m (tall)",             group: "Arena & Castle Walls" },
  { value: "Land_Castle_Gate_DE",        label: "Castle Gate Archway",                      group: "Arena & Castle Walls" },
  { value: "Land_Castle_Bastion_DE",     label: "Castle Bastion Section",                   group: "Arena & Castle Walls" },
  { value: "Land_Castle_Tower_Round_DE", label: "Castle Round Tower",                       group: "Arena & Castle Walls" },
  { value: "Land_Castle_Tower_Square_DE", label: "Castle Square Tower",                    group: "Arena & Castle Walls" },
  { value: "Land_Wall_Stone_3m_DE",      label: "Stone Ruin Wall 3m",                       group: "Arena & Castle Walls" },
  { value: "Land_Wall_Stone_6m_DE",      label: "Stone Ruin Wall 6m",                       group: "Arena & Castle Walls" },
  { value: "Land_Wall_Stone_Corner_DE",  label: "Stone Ruin Corner",                        group: "Arena & Castle Walls" },
  { value: "Land_Wall_Stone_Gate_DE",    label: "Stone Ruin Gate",                          group: "Arena & Castle Walls" },
  { value: "Land_Wall_Concrete_4m_DE",   label: "Concrete Wall 4m ★ BEST MODERN",          group: "Arena & Castle Walls" },
  { value: "Land_Wall_Concrete_8m_DE",   label: "Concrete Wall 8m (long run)",              group: "Arena & Castle Walls" },
  { value: "Land_Wall_Brick_4m_DE",      label: "Brick Wall 4m",                            group: "Arena & Castle Walls" },
  { value: "Land_Wall_Brick_8m_DE",      label: "Brick Wall 8m",                            group: "Arena & Castle Walls" },
  { value: "Land_HBarrier_5m_DE",        label: "HESCO Barrier 5m ★ BEST MILITARY",         group: "Arena & Castle Walls" },
  { value: "Land_HBarrier_10m_DE",       label: "HESCO Barrier 10m (long)",                 group: "Arena & Castle Walls" },
  { value: "Land_HBarrier_Corner_DE",    label: "HESCO Barrier Corner",                     group: "Arena & Castle Walls" },
  { value: "Land_BarrierConcrete_01_DE", label: "Jersey Barrier Long ★ CLASSIC",            group: "Arena & Castle Walls" },
  { value: "Land_BarrierConcrete_02_DE", label: "Jersey Barrier Short",                     group: "Arena & Castle Walls" },
  { value: "Land_Fence_Palisade_4m_DE",  label: "Wooden Palisade 4m",                       group: "Arena & Castle Walls" },
  { value: "Land_Fence_Palisade_8m_DE",  label: "Wooden Palisade 8m",                       group: "Arena & Castle Walls" },
  { value: "Land_Fence_Palisade_Gate_DE", label: "Palisade Gate",                          group: "Arena & Castle Walls" },
  { value: "Land_Sandbag_Wall_DE",       label: "Sandbag Wall",                             group: "Arena & Castle Walls" },
  { value: "Land_Sandbag_Corner_DE",     label: "Sandbag Corner",                           group: "Arena & Castle Walls" },
  { value: "Land_BarbedWire_01_DE",      label: "Barbed Wire (wall topper)",                group: "Arena & Castle Walls" },

  // ─── 🪵 Wooden Crates, Pallets & Storage ─────────────────────────────────
  { value: "WoodenCrate",               label: "Wooden Crate ★ best loot/obstacle",  group: "Crates & Storage" },
  { value: "WoodenCrateSmall",          label: "Wooden Crate Small",                 group: "Crates & Storage" },
  { value: "PalletBox_DE",             label: "Pallet Box (stackable) ★",            group: "Crates & Storage" },
  { value: "Pallet_EP1",               label: "Wooden Pallet (flat)",                group: "Crates & Storage" },
  { value: "GarbageContainer_Yellow_DE","label":"Garbage Container Yellow",           group: "Crates & Storage" },
  { value: "GarbageContainer_Green_DE", label: "Garbage Container Green",             group: "Crates & Storage" },
  { value: "Barrel_Blue",               label: "Barrel Blue",                         group: "Crates & Storage" },
  { value: "Barrel_Green",              label: "Barrel Green",                        group: "Crates & Storage" },
  { value: "Barrel_Yellow",             label: "Barrel Yellow",                       group: "Crates & Storage" },
  { value: "Barrel_Red",                label: "Barrel Red",                          group: "Crates & Storage" },
  { value: "Land_GasTank_Cylindrical",  label: "Gas Tank (cylinder)",                 group: "Crates & Storage" },
  { value: "Land_GasTank_Big",          label: "Gas Tank (big)",                      group: "Crates & Storage" },

  // ─── 🪜 Steps, Ladders & Platforms ───────────────────────────────────────
  // TIP: Stack Jersey Barriers (Barrier 2 on top of Barrier 1) as steps for multi-level arenas
  { value: "Land_PierLadder_DE",            label: "Pier Ladder (climb) ★ best step",          group: "Steps & Access" },
  { value: "Land_Stairs_Concrete_DE",       label: "Concrete Stairs (set)",                    group: "Steps & Access" },
  { value: "Land_Concrete_Step_DE",         label: "Concrete Step (single)",                   group: "Steps & Access" },
  { value: "Land_BarrierConcrete_02_DE",    label: "Jersey Barrier Short (use as step/riser)",  group: "Steps & Access" },
  { value: "Land_BarrierConcrete_01_DE",    label: "Jersey Barrier Long (ground level)",        group: "Steps & Access" },
  { value: "Land_Platform_Mil_DE",          label: "Military Platform",                        group: "Steps & Access" },
  { value: "Land_Pier_DE",                  label: "Pier Section (raised walkway)",             group: "Steps & Access" },
  { value: "Land_Pier_Long_DE",             label: "Pier Section Long (ramp/walkway)",          group: "Steps & Access" },
  { value: "Land_Mil_WatchtowerL_DE",       label: "Mil Watchtower L (multi-level)",            group: "Steps & Access" },
  { value: "Land_Mil_WatchtowerH_DE",       label: "Mil Watchtower H (multi-level tall)",       group: "Steps & Access" },

  // ─── Containers / Industrial ───────────────────────────────────────────────
  { value: "StaticObj_Container_1D",    label: "Shipping Container 1D",  group: "Containers" },
  { value: "StaticObj_Container_1C",    label: "Shipping Container 1C",  group: "Containers" },
  { value: "Land_Container_1Bo_DE",     label: "Container 1Bo (dark)",   group: "Containers" },
  { value: "Land_Container_1Aoh_DE",    label: "Container 1Aoh",         group: "Containers" },

  // ─── Wrecks / Vehicles ─────────────────────────────────────────────────────
  { value: "Land_Wreck_V3S_DE", label: "Wreck V3S Truck", group: "Wrecks" },
  { value: "Land_Wreck_Ikarus_DE", label: "Wreck Ikarus Bus", group: "Wrecks" },
  { value: "Land_Train_Wagon_Box_DE", label: "Train Wagon Box", group: "Wrecks" },
  { value: "Land_Train_Wagon_Box_Mil_DE", label: "Train Wagon Mil", group: "Wrecks" },
  { value: "Land_Wreck_Trailer_Closed_DE", label: "Trailer Closed", group: "Wrecks" },
  { value: "Land_Wreck_hb01_aban1_blue_DE", label: "Wreck Hatchback Blue", group: "Wrecks" },
  { value: "Land_Wreck_sed01_aban1_black_DE", label: "Wreck Sedan Black", group: "Wrecks" },
  { value: "Land_Wreck_offroad02_aban1_DE", label: "Wreck Offroad", group: "Wrecks" },
  { value: "Land_Boat_Small9_DE", label: "Small Boat", group: "Wrecks" },
  { value: "Land_Wreck_T72_DE", label: "Wreck T72 Tank", group: "Wrecks" },
  { value: "Land_Wreck_BTR_DE", label: "Wreck BTR APC", group: "Wrecks" },
  { value: "Land_Wreck_heli_MI8_DE", label: "Wreck MI-8 Helicopter", group: "Wrecks" },

  // ─── Rocks / Natural ───────────────────────────────────────────────────────
  { value: "DZ\\rocks_bliss\\stone10_moss.p3d", label: "Stone Moss (med)", group: "Rocks" },
  { value: "DZ\\rocks_bliss\\stone9_moss.p3d", label: "Stone Moss (large)", group: "Rocks" },
  { value: "DZ\\rocks_bliss\\rock_monolith1.p3d", label: "Rock Monolith 1", group: "Rocks" },
  { value: "DZ\\rocks_bliss\\rock_spike1.p3d", label: "Rock Spike 1", group: "Rocks" },
  { value: "DZ\\rocks_bliss\\rock_monolith2.p3d", label: "Rock Monolith 2", group: "Rocks" },
  { value: "DZ\\rocks_bliss\\clutter_01.p3d", label: "Rock Clutter Small", group: "Rocks" },

  // ─── Props / Buildings ─────────────────────────────────────────────────────
  { value: "Land_PetrolStation_Canopy", label: "Petrol Station Canopy", group: "Props" },
  { value: "StaticObj_Rail_Platform_Segment", label: "Rail Platform Segment", group: "Props" },
  { value: "StaticObj_Monument_Wall", label: "Monument Wall", group: "Props" },
  { value: "StaticObj_Lamp_Ind", label: "Industrial Lamp", group: "Props" },
  { value: "Land_Misc_Well_Pump_Yellow", label: "Well Pump Yellow", group: "Props" },
  { value: "Land_Garage_Big", label: "Big Garage", group: "Props" },
  { value: "StaticObj_Furniture_shelf_DZ", label: "Shelf DZ", group: "Props" },
  { value: "Land_Fence_Barbed", label: "Barbed Fence", group: "Props" },
  { value: "Land_Fence_Barbed_Wire", label: "Barbed Wire Coil", group: "Props" },
  { value: "Land_Tank_SmallConcrete_Round", label: "Concrete Tank Round", group: "Props" },
  { value: "Land_BusStop_DE", label: "Bus Stop", group: "Props" },
  { value: "Land_PowerLine_Tower_DE", label: "Power Line Tower", group: "Props" },
  { value: "Land_RadioTower_1_DE", label: "Radio Tower", group: "Props" },
  { value: "Land_WaterTower_01_DE", label: "Water Tower", group: "Props" },
  { value: "Land_WaterTower_02_DE", label: "Water Tower 2", group: "Props" },
  { value: "Land_CraneGrond_DE", label: "Ground Crane", group: "Props" },

  // ─── Buildings ─────────────────────────────────────────────────────────────
  { value: "Land_Mil_Barracks_HQ_DE", label: "Military Barracks HQ", group: "Buildings" },
  { value: "Land_Mil_Barracks_DE", label: "Military Barracks", group: "Buildings" },
  { value: "Land_Mil_Guardhouse_DE", label: "Military Guardhouse", group: "Buildings" },
  { value: "Land_Mil_WatchtowerL_DE", label: "Watchtower L", group: "Buildings" },
  { value: "Land_Mil_WatchtowerH_DE", label: "Watchtower H", group: "Buildings" },
  { value: "Land_Silo_DE", label: "Industrial Silo", group: "Buildings" },
  { value: "Land_SiloFarm_DE", label: "Farm Silo", group: "Buildings" },
  { value: "Land_Shed_W4_DE", label: "Shed W4", group: "Buildings" },
  { value: "Land_Shed_Ind_DE", label: "Industrial Shed", group: "Buildings" },
  { value: "Land_Wall_Brick_4m_DE", label: "Brick Wall 4m", group: "Buildings" },
  { value: "Land_Wall_Brick_8m_DE", label: "Brick Wall 8m", group: "Buildings" },
  { value: "Land_Wall_Concrete_4m_DE", label: "Concrete Wall 4m", group: "Buildings" },
  { value: "Land_Wall_Concrete_8m_DE", label: "Concrete Wall 8m", group: "Buildings" },
  { value: "Land_PierLadder_DE", label: "Pier Ladder", group: "Buildings" },

  // ─── Military Props ────────────────────────────────────────────────────────
  { value: "Land_Mil_Tent_Big_DE", label: "Military Tent Big", group: "Military" },
  { value: "Land_Mil_Tent_Small_DE", label: "Military Tent Small", group: "Military" },
  { value: "Land_Bunker_DE", label: "Concrete Bunker", group: "Military" },
  { value: "Land_Bunker_Small_DE", label: "Concrete Bunker Small", group: "Military" },
  { value: "Land_Sandbag_Wall_DE", label: "Sandbag Wall", group: "Military" },
  { value: "Land_Sandbag_Corner_DE", label: "Sandbag Corner", group: "Military" },
  { value: "Land_Sandbag_Round_DE", label: "Sandbag Round", group: "Military" },
  { value: "Land_BarrierConcrete_01_DE", label: "Concrete Barrier 1", group: "Military" },
  { value: "Land_BarrierConcrete_02_DE", label: "Concrete Barrier 2", group: "Military" },
  { value: "Land_BarrierConcrete_03_DE", label: "Concrete Barrier 3", group: "Military" },
  { value: "Land_HBarrier_5m_DE", label: "HESCO Barrier 5m", group: "Military" },
  { value: "Land_HBarrier_10m_DE", label: "HESCO Barrier 10m", group: "Military" },
  { value: "Land_HBarrier_Corner_DE", label: "HESCO Barrier Corner", group: "Military" },
  { value: "Land_BarbedWire_01_DE", label: "Barbed Wire Line", group: "Military" },
  { value: "Land_TankTrap_DE", label: "Tank Trap Czech Hedgehog", group: "Military" },

  // ─── ⚔️ Weapons & Melee (great for thrones, circles, dramatic builds) ──────
  { value: "BaseballBat", label: "Baseball Bat", group: "Weapons" },
  { value: "BaseballBat_Nails", label: "Baseball Bat (Nails)", group: "Weapons" },
  { value: "Sledgehammer", label: "Sledgehammer", group: "Weapons" },
  { value: "Axe_Splitting", label: "Splitting Axe", group: "Weapons" },
  { value: "FirefighterAxe", label: "Firefighter Axe (red)", group: "Weapons" },
  { value: "Pitchfork", label: "Pitchfork", group: "Weapons" },
  { value: "Shovel", label: "Shovel", group: "Weapons" },
  { value: "Pickaxe", label: "Pickaxe", group: "Weapons" },
  { value: "Crowbar", label: "Crowbar", group: "Weapons" },
  { value: "HuntingKnife", label: "Hunting Knife", group: "Weapons" },
  { value: "CombatKnife", label: "Combat Knife", group: "Weapons" },
  { value: "MeleeMachete", label: "Machete", group: "Weapons" },
  { value: "MeleeSpear", label: "Improvised Spear", group: "Weapons" },
  { value: "ImprovKnife", label: "Improvised Knife", group: "Weapons" },
  { value: "BarbedWireItem", label: "Barbed Wire (item)", group: "Weapons" },

  // ─── 💛 Armbands (very compact, great for text spelling) ──────────────────
  { value: "ArmBandBlack", label: "Armband Black ★ text fave", group: "Armbands" },
  { value: "ArmBandBlue", label: "Armband Blue", group: "Armbands" },
  { value: "ArmBandGreen", label: "Armband Green", group: "Armbands" },
  { value: "ArmBandRed", label: "Armband Red", group: "Armbands" },
  { value: "ArmBandWhite", label: "Armband White", group: "Armbands" },
  { value: "ArmBandYellow", label: "Armband Yellow", group: "Armbands" },
  { value: "ArmBandOrange", label: "Armband Orange", group: "Armbands" },

  // ─── Plants / Trees ────────────────────────────────────────────────────────
  { value: "DZ\\plants_bliss\\tree\\t_fagussylvatica_3f_summer.p3d", label: "Beech Tree", group: "Plants" },
  { value: "DZ\\plants_bliss\\tree\\t_pinussylvestris_2f_summer.p3d", label: "Pine Tree", group: "Plants" },
  { value: "DZ\\plants_bliss\\bush\\b_prunusspinosa_1s_summer.p3d", label: "Blackthorn Bush", group: "Plants" },
  { value: "DZ\\plants_bliss\\tree\\t_quercusrobur_2f_summer.p3d", label: "Oak Tree", group: "Plants" },
  { value: "DZ\\plants_bliss\\tree\\t_betulapendula_2f_summer.p3d", label: "Birch Tree", group: "Plants" },

  // ─── Parts ─────────────────────────────────────────────────────────────────
  { value: "HatchbackWheel", label: "Hatchback Wheel", group: "Parts" },
  { value: "OffroadWheel", label: "Offroad Wheel", group: "Parts" },
  { value: "TruckWheel", label: "Truck Wheel", group: "Parts" },

  // ─── ✈ Airstrip Lights (console-safe, highly visible from above) ───────────
  { value: "StaticObj_Airfield_Light_PAPI1", label: "PAPI Light ★ best for spelling", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Threshold_01", label: "Threshold Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Threshold_02", label: "Threshold Light 2", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Centreline_01", label: "Centreline Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Centreline_02", label: "Centreline Light 2", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Edge_01", label: "Edge Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Edge_02", label: "Edge Light 2", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Taxiway_01", label: "Taxiway Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Taxiway_02", label: "Taxiway Light 2", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Approach_01", label: "Approach Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Strobe_01", label: "Strobe Light", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_End_01", label: "Runway End Light", group: "Airstrip Lights" },

  // ─── 🔲 Flat Objects (floors, pads, runways, spelling bases) ───────────────
  { value: "Land_Asphalt_01_F_10x10_DE", label: "Asphalt 10×10", group: "Flat Objects" },
  { value: "Land_Asphalt_01_F_20x20_DE", label: "Asphalt 20×20", group: "Flat Objects" },
  { value: "Land_Asphalt_01_F_5x5_DE", label: "Asphalt 5×5", group: "Flat Objects" },
  { value: "Land_Asphalt_01_Cor_DE", label: "Asphalt Corner", group: "Flat Objects" },
  { value: "Land_Asphalt_01_T_DE", label: "Asphalt T-Junction", group: "Flat Objects" },
  { value: "Land_Asphalt_01_Cross_DE", label: "Asphalt Cross", group: "Flat Objects" },
  { value: "Land_Concrete_01_F_10x10_DE", label: "Concrete 10×10", group: "Flat Objects" },
  { value: "Land_Concrete_01_F_20x20_DE", label: "Concrete 20×20", group: "Flat Objects" },
  { value: "Land_Concrete_01_F_5x5_DE", label: "Concrete 5×5", group: "Flat Objects" },
  { value: "Land_Concrete_01_Cor_DE", label: "Concrete Corner", group: "Flat Objects" },
  { value: "Land_Concrete_01_T_DE", label: "Concrete T-Junction", group: "Flat Objects" },
  { value: "Land_Pier_DE", label: "Pier Section (flat)", group: "Flat Objects" },
  { value: "Land_Pier_Long_DE", label: "Pier Section Long", group: "Flat Objects" },
  { value: "Land_Pier_Corner_DE", label: "Pier Corner", group: "Flat Objects" },
  { value: "Land_Pier_T_DE", label: "Pier T-Junction", group: "Flat Objects" },
  { value: "Land_Pier_Cross_DE", label: "Pier Cross", group: "Flat Objects" },
  { value: "Land_Runway_01_F_DE", label: "Runway Strip (flat)", group: "Flat Objects" },
  { value: "Land_Runway_01_Line_DE", label: "Runway Centre Line", group: "Flat Objects" },
  { value: "Land_Runway_01_TH_DE", label: "Runway Threshold Mark", group: "Flat Objects" },
  { value: "Land_Runway_01_Cor_DE", label: "Runway Corner", group: "Flat Objects" },
  { value: "Land_Pavement_01_F_10x10_DE", label: "Pavement 10×10", group: "Flat Objects" },
  { value: "Land_Pavement_01_F_5x5_DE", label: "Pavement 5×5", group: "Flat Objects" },
  { value: "Land_Pavement_01_Cor_DE", label: "Pavement Corner", group: "Flat Objects" },
  { value: "Land_ConcreteSlab_01_DE", label: "Concrete Slab 1", group: "Flat Objects" },
  { value: "Land_ConcreteSlab_02_DE", label: "Concrete Slab 2", group: "Flat Objects" },
  { value: "Land_ConcreteSlab_03_DE", label: "Concrete Slab 3 (large)", group: "Flat Objects" },
  { value: "Land_GarageFloor_01_DE", label: "Garage Floor", group: "Flat Objects" },
  { value: "Land_TarmacFloor_01_DE", label: "Tarmac Floor", group: "Flat Objects" },
  { value: "Land_Puddle_01_DE", label: "Puddle / Water Pool", group: "Flat Objects" },
  { value: "Land_SandFloor_01_DE", label: "Sand Floor Pad", group: "Flat Objects" },
  { value: "Land_GrassFloor_01_DE", label: "Grass Floor Pad", group: "Flat Objects" },
  { value: "Land_MudFloor_01_DE", label: "Mud Floor Pad", group: "Flat Objects" },
];

export const OBJECT_GROUPS = [...new Set(DAYZ_OBJECTS.map(o => o.group))];

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
