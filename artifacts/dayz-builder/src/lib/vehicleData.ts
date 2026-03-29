// All classnames verified against vanilla DayZ 1.25 types.xml (console-safe Xbox / PS5)

export interface VehicleSlot {
  id: string;
  label: string;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  svgX: number;
  svgY: number;
}

export interface VehicleDef {
  id: string;
  classname: string;
  name: string;
  icon: string;
  desc: string;
  length: number;
  width: number;
  slots: VehicleSlot[];
}

export interface LootItem {
  classname: string;
  name: string;
  category: string;
}

export const VEHICLES: VehicleDef[] = [
  {
    id: "civilian_sedan",
    classname: "CivilianSedan",
    name: "Civilian Sedan",
    icon: "🚗",
    desc: "Standard 4-door Lada-style car",
    length: 4.2,
    width: 1.8,
    slots: [
      { id: "driver",       label: "Driver Seat",      offsetX: -0.4, offsetY: 0.8, offsetZ:  0.7, svgX: 68, svgY: 52 },
      { id: "front_pass",   label: "Front Passenger",  offsetX:  0.4, offsetY: 0.8, offsetZ:  0.7, svgX: 32, svgY: 52 },
      { id: "rear_left",    label: "Rear Left",        offsetX: -0.4, offsetY: 0.8, offsetZ: -0.3, svgX: 68, svgY: 68 },
      { id: "rear_right",   label: "Rear Right",       offsetX:  0.4, offsetY: 0.8, offsetZ: -0.3, svgX: 32, svgY: 68 },
      { id: "trunk",        label: "Trunk",            offsetX:  0.0, offsetY: 0.5, offsetZ: -1.6, svgX: 50, svgY: 84 },
      { id: "ground_left",  label: "Ground Left",      offsetX: -1.3, offsetY: 0.0, offsetZ:  0.0, svgX: 80, svgY: 60 },
      { id: "ground_right", label: "Ground Right",     offsetX:  1.3, offsetY: 0.0, offsetZ:  0.0, svgX: 20, svgY: 60 },
    ],
  },
  {
    id: "sedan_02",
    classname: "Sedan_02",
    name: "Hatchback (Golf)",
    icon: "🚙",
    desc: "Compact 3-door hatchback",
    length: 3.9,
    width: 1.7,
    slots: [
      { id: "driver",       label: "Driver Seat",      offsetX: -0.4, offsetY: 0.75, offsetZ:  0.6, svgX: 68, svgY: 50 },
      { id: "front_pass",   label: "Front Passenger",  offsetX:  0.4, offsetY: 0.75, offsetZ:  0.6, svgX: 32, svgY: 50 },
      { id: "rear_left",    label: "Rear Left",        offsetX: -0.35, offsetY: 0.75, offsetZ: -0.3, svgX: 68, svgY: 68 },
      { id: "rear_right",   label: "Rear Right",       offsetX:  0.35, offsetY: 0.75, offsetZ: -0.3, svgX: 32, svgY: 68 },
      { id: "trunk",        label: "Hatch / Boot",     offsetX:  0.0, offsetY: 0.5, offsetZ: -1.4, svgX: 50, svgY: 83 },
      { id: "ground_left",  label: "Ground Left",      offsetX: -1.2, offsetY: 0.0, offsetZ:  0.0, svgX: 80, svgY: 60 },
      { id: "ground_right", label: "Ground Right",     offsetX:  1.2, offsetY: 0.0, offsetZ:  0.0, svgX: 20, svgY: 60 },
    ],
  },
  {
    id: "hatchback_02",
    classname: "Hatchback_02",
    name: "Sarka 120 (Small Car)",
    icon: "🚕",
    desc: "Tiny communist-era Sarka",
    length: 3.4,
    width: 1.6,
    slots: [
      { id: "driver",       label: "Driver Seat",      offsetX: -0.35, offsetY: 0.7, offsetZ:  0.55, svgX: 68, svgY: 50 },
      { id: "front_pass",   label: "Front Passenger",  offsetX:  0.35, offsetY: 0.7, offsetZ:  0.55, svgX: 32, svgY: 50 },
      { id: "rear",         label: "Back Seat",        offsetX:  0.0,  offsetY: 0.7, offsetZ: -0.25, svgX: 50, svgY: 68 },
      { id: "trunk",        label: "Boot",             offsetX:  0.0,  offsetY: 0.5, offsetZ: -1.2,  svgX: 50, svgY: 82 },
      { id: "ground_left",  label: "Ground Left",      offsetX: -1.1,  offsetY: 0.0, offsetZ:  0.0,  svgX: 80, svgY: 60 },
      { id: "ground_right", label: "Ground Right",     offsetX:  1.1,  offsetY: 0.0, offsetZ:  0.0,  svgX: 20, svgY: 60 },
    ],
  },
  {
    id: "offroad",
    classname: "OffroadHatchback",
    name: "Civilian Offroad 4×4",
    icon: "🛻",
    desc: "Soviet-era civilian 4×4 utility vehicle (Niva-type)",
    length: 4.5,
    width: 2.0,
    slots: [
      { id: "driver",       label: "Driver Seat",      offsetX: -0.5, offsetY: 1.0, offsetZ:  0.8, svgX: 68, svgY: 50 },
      { id: "front_pass",   label: "Front Passenger",  offsetX:  0.5, offsetY: 1.0, offsetZ:  0.8, svgX: 32, svgY: 50 },
      { id: "rear_left",    label: "Rear Left",        offsetX: -0.5, offsetY: 1.0, offsetZ: -0.3, svgX: 68, svgY: 67 },
      { id: "rear_right",   label: "Rear Right",       offsetX:  0.5, offsetY: 1.0, offsetZ: -0.3, svgX: 32, svgY: 67 },
      { id: "trunk",        label: "Cargo Bed",        offsetX:  0.0, offsetY: 0.8, offsetZ: -1.7, svgX: 50, svgY: 83 },
      { id: "roof",         label: "Roof / Hood",      offsetX:  0.0, offsetY: 1.6, offsetZ:  0.5, svgX: 50, svgY: 34 },
      { id: "ground_left",  label: "Ground Left",      offsetX: -1.4, offsetY: 0.0, offsetZ:  0.0, svgX: 80, svgY: 60 },
      { id: "ground_right", label: "Ground Right",     offsetX:  1.4, offsetY: 0.0, offsetZ:  0.0, svgX: 20, svgY: 60 },
    ],
  },
  {
    id: "truck_covered",
    classname: "Truck_01_Covered",
    name: "V3S Truck (Covered)",
    icon: "🚛",
    desc: "Heavy military truck with canvas-covered bed",
    length: 7.5,
    width: 2.4,
    slots: [
      { id: "driver",       label: "Driver Cab",       offsetX: -0.6, offsetY: 1.3, offsetZ:  2.4, svgX: 65, svgY: 44 },
      { id: "front_pass",   label: "Co-Driver",        offsetX:  0.6, offsetY: 1.3, offsetZ:  2.4, svgX: 35, svgY: 44 },
      { id: "cargo_l1",     label: "Cargo Slot 1",     offsetX: -0.7, offsetY: 0.9, offsetZ:  0.3, svgX: 65, svgY: 60 },
      { id: "cargo_m",      label: "Cargo Slot 2",     offsetX:  0.0, offsetY: 0.9, offsetZ:  0.0, svgX: 50, svgY: 66 },
      { id: "cargo_r1",     label: "Cargo Slot 3",     offsetX:  0.7, offsetY: 0.9, offsetZ: -0.5, svgX: 35, svgY: 72 },
      { id: "cargo_r2",     label: "Cargo Slot 4",     offsetX: -0.7, offsetY: 0.9, offsetZ: -1.5, svgX: 65, svgY: 78 },
      { id: "ground_left",  label: "Ground Left",      offsetX: -1.7, offsetY: 0.0, offsetZ:  0.0, svgX: 78, svgY: 60 },
      { id: "ground_right", label: "Ground Right",     offsetX:  1.7, offsetY: 0.0, offsetZ:  0.0, svgX: 22, svgY: 60 },
    ],
  },
  {
    id: "offroad_02",
    classname: "Offroad_02",
    name: "M1025 HMMWV",
    icon: "🪖",
    desc: "Military Humvee — 4-door + open flatbed rear",
    length: 4.6,
    width: 2.2,
    slots: [
      { id: "driver",       label: "Driver",           offsetX: -0.55, offsetY: 1.1, offsetZ:  1.0, svgX: 66, svgY: 44 },
      { id: "front_pass",   label: "Front Passenger",  offsetX:  0.55, offsetY: 1.1, offsetZ:  1.0, svgX: 34, svgY: 44 },
      { id: "rear_left",    label: "Rear Left",        offsetX: -0.55, offsetY: 1.1, offsetZ: -0.1, svgX: 66, svgY: 59 },
      { id: "rear_right",   label: "Rear Right",       offsetX:  0.55, offsetY: 1.1, offsetZ: -0.1, svgX: 34, svgY: 59 },
      { id: "bed_left",     label: "Flatbed Left",     offsetX: -0.55, offsetY: 0.9, offsetZ: -1.3, svgX: 66, svgY: 74 },
      { id: "bed_right",    label: "Flatbed Right",    offsetX:  0.55, offsetY: 0.9, offsetZ: -1.3, svgX: 34, svgY: 74 },
      { id: "roof",         label: "Roof / Turret",    offsetX:  0.0,  offsetY: 1.9, offsetZ:  0.5, svgX: 50, svgY: 30 },
      { id: "ground_left",  label: "Ground Left",      offsetX: -1.6,  offsetY: 0.0, offsetZ:  0.0, svgX: 82, svgY: 60 },
      { id: "ground_right", label: "Ground Right",     offsetX:  1.6,  offsetY: 0.0, offsetZ:  0.0, svgX: 18, svgY: 60 },
    ],
  },
  {
    id: "boat_01",
    classname: "Boat_01_Black",
    name: "Fishing Boat (Driveable)",
    icon: "⛵",
    desc: "Small wooden fishing boat — driveable on water",
    length: 4.2,
    width: 1.8,
    slots: [
      { id: "pilot",        label: "Pilot / Helm",     offsetX:  0.0,  offsetY: 0.6, offsetZ:  0.8, svgX: 50, svgY: 40 },
      { id: "pass_left",    label: "Port Passenger",   offsetX: -0.5,  offsetY: 0.5, offsetZ: -0.2, svgX: 68, svgY: 60 },
      { id: "pass_right",   label: "Starboard Passenger", offsetX: 0.5, offsetY: 0.5, offsetZ: -0.2, svgX: 32, svgY: 60 },
      { id: "bow",          label: "Bow Deck",         offsetX:  0.0,  offsetY: 0.4, offsetZ:  1.4, svgX: 50, svgY: 24 },
      { id: "stern",        label: "Stern / Rear",     offsetX:  0.0,  offsetY: 0.4, offsetZ: -1.5, svgX: 50, svgY: 82 },
      { id: "water_left",   label: "Water Left",       offsetX: -1.2,  offsetY: 0.0, offsetZ:  0.0, svgX: 82, svgY: 60 },
      { id: "water_right",  label: "Water Right",      offsetX:  1.2,  offsetY: 0.0, offsetZ:  0.0, svgX: 18, svgY: 60 },
    ],
  },
];

export const LOOT_ITEMS: LootItem[] = [
  // Medical
  { classname: "FirstAidKit",              name: "FAK (First Aid Kit)",    category: "Medical"  },
  { classname: "BandageDressing",          name: "Bandage Dressing",       category: "Medical"  },
  { classname: "Morphine",                 name: "Morphine Auto-Injector", category: "Medical"  },
  { classname: "Epinephrine",              name: "Epinephrine Pen",        category: "Medical"  },
  { classname: "BloodBagFull",             name: "Blood Bag (Full)",       category: "Medical"  },
  { classname: "BloodBagIV",              name: "Blood Bag IV",           category: "Medical"  },
  { classname: "SalineBagIV",             name: "Saline Bag IV",          category: "Medical"  },
  { classname: "Splint",                   name: "Splint",                 category: "Medical"  },
  { classname: "CharcoalTablets",          name: "Charcoal Tablets",       category: "Medical"  },
  { classname: "TetracyclineAntibiotics",  name: "Tetracycline",           category: "Medical"  },
  { classname: "VitaminBottle",            name: "Vitamins",               category: "Medical"  },

  // Food
  { classname: "Rice",                    name: "Rice Bag",               category: "Food"     },
  { classname: "TunaCan",                 name: "Tuna Can",               category: "Food"     },
  { classname: "BakedBeansCan",           name: "Baked Beans Can",        category: "Food"     },
  { classname: "WaterBottle",             name: "Water Bottle (Full)",    category: "Food"     },
  { classname: "Canteen",                 name: "Canteen",                category: "Food"     },
  { classname: "SodaCan_Pipsi",          name: "Pipsi Can",              category: "Food"     },
  { classname: "Apple",                   name: "Apple",                  category: "Food"     },
  { classname: "CannedSardines",          name: "Canned Sardines",        category: "Food"     },

  // Vehicle Parts
  { classname: "CanisterGasoline",        name: "Gasoline Jerry Can",     category: "Vehicle"  },
  { classname: "CanisterOil",             name: "Oil Canister",           category: "Vehicle"  },
  { classname: "CarBattery",             name: "Car Battery",            category: "Vehicle"  },
  { classname: "SparkPlug",              name: "Spark Plug",             category: "Vehicle"  },
  { classname: "CarRadiator",            name: "Car Radiator",           category: "Vehicle"  },
  { classname: "CivSedanWheel",          name: "Sedan Wheel",            category: "Vehicle"  },
  { classname: "Offroad_02_Wheel",       name: "Offroad Wheel",          category: "Vehicle"  },
  { classname: "Truck_01_Wheel",         name: "Truck Wheel",            category: "Vehicle"  },
  { classname: "TruckBattery",           name: "Truck Battery",          category: "Vehicle"  },
  { classname: "CarKey",                name: "Car Key",                category: "Vehicle"  },

  // Tools
  { classname: "Hacksaw",               name: "Hacksaw",                category: "Tools"    },
  { classname: "FirefighterAxe",        name: "Fire Axe",               category: "Tools"    },
  { classname: "Screwdriver",           name: "Screwdriver",            category: "Tools"    },
  { classname: "WeldingMask",           name: "Welding Mask",           category: "Tools"    },
  { classname: "BarbedWire",            name: "Barbed Wire",            category: "Tools"    },
  { classname: "CombinationLock",       name: "Combination Lock",       category: "Tools"    },
  { classname: "TireRepairKit",         name: "Tire Repair Kit",        category: "Tools"    },
  { classname: "Rope",                  name: "Rope",                   category: "Tools"    },

  // Gear
  { classname: "TacticalGloves_Black",  name: "Tactical Gloves (Black)",category: "Gear"     },
  { classname: "HikingBootsLow_Beige",  name: "Hiking Boots (Beige)",   category: "Gear"     },
  { classname: "BallisticHelmet_Black", name: "Ballistic Helmet",       category: "Gear"     },
  { classname: "PlateCarrierVest",      name: "Plate Carrier",          category: "Gear"     },
  { classname: "NVGoggles",            name: "Night Vision Goggles",    category: "Gear"     },

  // Weapons
  { classname: "M4A1",                 name: "M4A1",                   category: "Weapons"  },
  { classname: "AKM",                  name: "AKM",                    category: "Weapons"  },
  { classname: "CZ527",                name: "CZ 527",                 category: "Weapons"  },
  { classname: "Winchester70",         name: "Winchester Model 70",    category: "Weapons"  },
  { classname: "FNX45",               name: "FNX-45 Pistol",          category: "Weapons"  },
  { classname: "CZ75",               name: "CZ 75 Pistol",            category: "Weapons"  },
  { classname: "MP5K",               name: "MP5-K",                   category: "Weapons"  },
  { classname: "AK101",              name: "AK-101",                  category: "Weapons"  },

  // Ammo
  { classname: "Mag_STANAG_30Rnd",         name: "STANAG 30rnd Mag",   category: "Ammo" },
  { classname: "Mag_AKM_Drum75Rnd",        name: "AK Drum 75rnd",      category: "Ammo" },
  { classname: "Mag_FNX45_15Rnd",          name: "FNX-45 15rnd Mag",   category: "Ammo" },
  { classname: "Ammo_762x39",              name: "7.62x39 Loose Ammo", category: "Ammo" },
  { classname: "Ammo_308Win",              name: ".308 Win Loose",      category: "Ammo" },
  { classname: "Ammo_45ACP",              name: ".45 ACP Loose",       category: "Ammo" },
  { classname: "RGD5Grenade",             name: "RGD-5 Grenade",       category: "Ammo" },
  { classname: "FlashGrenade",             name: "Flash Grenade",       category: "Ammo" },
];

export const LOOT_CATEGORIES = [...new Set(LOOT_ITEMS.map(i => i.category))];
