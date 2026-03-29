export interface DayzObject {
  value: string;
  label: string;
  group: string;
}

export const DAYZ_OBJECTS: DayzObject[] = [
  // Containers / Industrial (console-safe)
  { value: "StaticObj_Container_1D", label: "Shipping Container 1D", group: "Containers" },
  { value: "StaticObj_Container_1C", label: "Shipping Container 1C", group: "Containers" },
  { value: "Land_Container_1Bo_DE", label: "Container 1Bo (dark)", group: "Containers" },
  { value: "Land_Container_1Aoh_DE", label: "Container 1Aoh", group: "Containers" },
  { value: "Land_GasTank_Cylindrical", label: "Gas Tank (cylinder)", group: "Containers" },
  { value: "Land_GasTank_Big", label: "Gas Tank (big)", group: "Containers" },
  { value: "Barrel_Blue", label: "Barrel Blue", group: "Containers" },
  { value: "Barrel_Green", label: "Barrel Green", group: "Containers" },
  { value: "Barrel_Yellow", label: "Barrel Yellow", group: "Containers" },
  { value: "Barrel_Red", label: "Barrel Red", group: "Containers" },
  { value: "Pallet_EP1", label: "Pallet", group: "Containers" },

  // Vehicles / Wrecks (console-safe)
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

  // Rocks / Natural
  { value: "DZ\\rocks_bliss\\stone10_moss.p3d", label: "Stone Moss (med)", group: "Rocks" },
  { value: "DZ\\rocks_bliss\\stone9_moss.p3d", label: "Stone Moss (large)", group: "Rocks" },
  { value: "DZ\\rocks_bliss\\rock_monolith1.p3d", label: "Rock Monolith 1", group: "Rocks" },
  { value: "DZ\\rocks_bliss\\rock_spike1.p3d", label: "Rock Spike 1", group: "Rocks" },
  { value: "DZ\\rocks_bliss\\rock_monolith2.p3d", label: "Rock Monolith 2", group: "Rocks" },
  { value: "DZ\\rocks_bliss\\clutter_01.p3d", label: "Rock Clutter Small", group: "Rocks" },

  // Static Props / Buildings
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
  { value: "Land_Mil_Barracks_HQ_DE", label: "Military Barracks HQ", group: "Buildings" },
  { value: "Land_Mil_Barracks_DE", label: "Military Barracks", group: "Buildings" },
  { value: "Land_Mil_Guardhouse_DE", label: "Military Guardhouse", group: "Buildings" },
  { value: "Land_Mil_WatchtowerL_DE", label: "Watchtower L", group: "Buildings" },
  { value: "Land_Mil_WatchtowerH_DE", label: "Watchtower H", group: "Buildings" },
  { value: "Land_Silo_DE", label: "Industrial Silo", group: "Buildings" },
  { value: "Land_SiloFarm_DE", label: "Farm Silo", group: "Buildings" },
  { value: "Land_Shed_W4_DE", label: "Shed W4", group: "Buildings" },
  { value: "Land_Shed_Ind_DE", label: "Industrial Shed", group: "Buildings" },
  { value: "Land_ConcretePath_F_DE", label: "Concrete Path", group: "Buildings" },
  { value: "Land_ConcretePath_Corner_DE", label: "Concrete Path Corner", group: "Buildings" },
  { value: "Land_Wall_Brick_4m_DE", label: "Brick Wall 4m", group: "Buildings" },
  { value: "Land_Wall_Brick_8m_DE", label: "Brick Wall 8m", group: "Buildings" },
  { value: "Land_Wall_Concrete_4m_DE", label: "Concrete Wall 4m", group: "Buildings" },
  { value: "Land_Wall_Concrete_8m_DE", label: "Concrete Wall 8m", group: "Buildings" },
  { value: "Land_Pier_DE", label: "Pier Section", group: "Buildings" },
  { value: "Land_PierLadder_DE", label: "Pier Ladder", group: "Buildings" },
  { value: "Land_CraneGrond_DE", label: "Ground Crane", group: "Buildings" },

  // Military Props
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

  // Plants / Trees
  { value: "DZ\\plants_bliss\\tree\\t_fagussylvatica_3f_summer.p3d", label: "Beech Tree", group: "Plants" },
  { value: "DZ\\plants_bliss\\tree\\t_pinussylvestris_2f_summer.p3d", label: "Pine Tree", group: "Plants" },
  { value: "DZ\\plants_bliss\\bush\\b_prunusspinosa_1s_summer.p3d", label: "Blackthorn Bush", group: "Plants" },
  { value: "DZ\\plants_bliss\\tree\\t_quercusrobur_2f_summer.p3d", label: "Oak Tree", group: "Plants" },
  { value: "DZ\\plants_bliss\\tree\\t_betulapendula_2f_summer.p3d", label: "Birch Tree", group: "Plants" },

  // Wheels / Vehicles Parts
  { value: "HatchbackWheel", label: "Hatchback Wheel", group: "Parts" },
  { value: "OffroadWheel", label: "Offroad Wheel", group: "Parts" },
  { value: "Land_BusStop_DE", label: "Bus Stop", group: "Props" },
  { value: "Land_PowerLine_Tower_DE", label: "Power Line Tower", group: "Props" },
  { value: "Land_RadioTower_1_DE", label: "Radio Tower", group: "Props" },
  { value: "Land_WaterTower_01_DE", label: "Water Tower", group: "Props" },
  { value: "Land_WaterTower_02_DE", label: "Water Tower 2", group: "Props" },

  // ✈ Airstrip / Runway Lights  (from TaxiRank JSON — console-safe)
  { value: "StaticObj_Airfield_Light_PAPI1", label: "✈ PAPI Light (bright, spelling!)", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Threshold_01", label: "✈ Threshold Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Threshold_02", label: "✈ Threshold Light 2", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Centreline_01", label: "✈ Centreline Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Centreline_02", label: "✈ Centreline Light 2", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Edge_01", label: "✈ Edge Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Edge_02", label: "✈ Edge Light 2", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Taxiway_01", label: "✈ Taxiway Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Taxiway_02", label: "✈ Taxiway Light 2", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Approach_01", label: "✈ Approach Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Approach_02", label: "✈ Approach Light 2", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_Strobe_01", label: "✈ Strobe Light", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_End_01", label: "✈ Runway End Light 1", group: "Airstrip Lights" },
  { value: "StaticObj_Airfield_Light_End_02", label: "✈ Runway End Light 2", group: "Airstrip Lights" },

  // 🔲 Flat / Ground-Level Objects (great for floors, pads, spelling)
  { value: "Land_ConcretePath_F_DE", label: "Flat Concrete Path", group: "Flat Objects" },
  { value: "Land_ConcretePath_Corner_DE", label: "Flat Concrete Corner", group: "Flat Objects" },
  { value: "Land_Asphalt_F_DE", label: "Flat Asphalt Tile", group: "Flat Objects" },
  { value: "Land_Asphalt_Corner_DE", label: "Flat Asphalt Corner", group: "Flat Objects" },
  { value: "Land_Asphalt_Cross_DE", label: "Flat Asphalt Cross", group: "Flat Objects" },
  { value: "Land_Asphalt_T_DE", label: "Flat Asphalt T-Junction", group: "Flat Objects" },
  { value: "Land_Runway_F_DE", label: "Flat Runway Strip", group: "Flat Objects" },
  { value: "Land_Runway_Marking_DE", label: "Flat Runway Marking", group: "Flat Objects" },
  { value: "Land_Pavement_DE", label: "Flat Pavement Tile", group: "Flat Objects" },
  { value: "Land_Pavement_Corner_DE", label: "Flat Pavement Corner", group: "Flat Objects" },
  { value: "Pallet_EP1", label: "Flat Pallet", group: "Flat Objects" },
  { value: "Land_Pier_DE", label: "Flat Pier Section", group: "Flat Objects" },
  { value: "Land_GarageFloor_DE", label: "Flat Garage Floor", group: "Flat Objects" },
  { value: "Land_TarmacFloor_DE", label: "Flat Tarmac Floor", group: "Flat Objects" },
  { value: "Land_ConcreteSlab_DE", label: "Flat Concrete Slab", group: "Flat Objects" },
  { value: "Land_Puddle_DE", label: "Flat Puddle/Water", group: "Flat Objects" },
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
