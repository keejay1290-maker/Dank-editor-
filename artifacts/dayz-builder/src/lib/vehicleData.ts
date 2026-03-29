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
    name: "Offroad (UAZ)",
    icon: "🛻",
    desc: "Heavy 4x4 off-road utility",
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
    desc: "Heavy military truck with covered bed",
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
    id: "truck_open",
    classname: "Truck_01_Open",
    name: "V3S Truck (Open)",
    icon: "🚚",
    desc: "Heavy military truck open flatbed",
    length: 7.5,
    width: 2.4,
    slots: [
      { id: "driver",      label: "Driver Cab",        offsetX: -0.6, offsetY: 1.3, offsetZ:  2.4, svgX: 65, svgY: 44 },
      { id: "front_pass",  label: "Co-Driver",         offsetX:  0.6, offsetY: 1.3, offsetZ:  2.4, svgX: 35, svgY: 44 },
      { id: "bed_fl",      label: "Bed Front-Left",    offsetX: -0.8, offsetY: 0.9, offsetZ:  0.8, svgX: 65, svgY: 57 },
      { id: "bed_fr",      label: "Bed Front-Right",   offsetX:  0.8, offsetY: 0.9, offsetZ:  0.8, svgX: 35, svgY: 57 },
      { id: "bed_rl",      label: "Bed Rear-Left",     offsetX: -0.8, offsetY: 0.9, offsetZ: -1.0, svgX: 65, svgY: 73 },
      { id: "bed_rr",      label: "Bed Rear-Right",    offsetX:  0.8, offsetY: 0.9, offsetZ: -1.0, svgX: 35, svgY: 73 },
      { id: "ground_left", label: "Ground Left",       offsetX: -1.7, offsetY: 0.0, offsetZ:  0.0, svgX: 78, svgY: 60 },
      { id: "ground_right", label: "Ground Right", offsetX:  1.7, offsetY: 0.0, offsetZ:  0.0, svgX: 22, svgY: 60 },
    ],
  },
  {
    id: "bus",
    classname: "CivilianBus",
    name: "Civilian Bus",
    icon: "🚌",
    desc: "Large passenger bus",
    length: 9.5,
    width: 2.5,
    slots: [
      { id: "driver",       label: "Driver",           offsetX: -0.8, offsetY: 1.1, offsetZ:  3.8, svgX: 65, svgY: 38 },
      { id: "front_seats",  label: "Front Seats",      offsetX:  0.0, offsetY: 1.1, offsetZ:  2.0, svgX: 50, svgY: 50 },
      { id: "mid_seats",    label: "Mid Seats",        offsetX:  0.0, offsetY: 1.1, offsetZ:  0.0, svgX: 50, svgY: 60 },
      { id: "rear_seats",   label: "Rear Seats",       offsetX:  0.0, offsetY: 1.1, offsetZ: -2.5, svgX: 50, svgY: 72 },
      { id: "cargo_rear",   label: "Rear Cargo Bay",   offsetX:  0.0, offsetY: 0.5, offsetZ: -4.0, svgX: 50, svgY: 82 },
      { id: "ground_left",  label: "Ground Left",      offsetX: -1.8, offsetY: 0.0, offsetZ:  0.0, svgX: 78, svgY: 60 },
      { id: "ground_right", label: "Ground Right",     offsetX:  1.8, offsetY: 0.0, offsetZ:  0.0, svgX: 22, svgY: 60 },
    ],
  },
  {
    id: "ambulance",
    classname: "AmbulanceCar",
    name: "Ambulance",
    icon: "🚑",
    desc: "Medical response vehicle",
    length: 5.2,
    width: 2.1,
    slots: [
      { id: "driver",       label: "Driver",           offsetX: -0.5, offsetY: 1.0, offsetZ:  1.5, svgX: 65, svgY: 42 },
      { id: "front_pass",   label: "Paramedic",        offsetX:  0.5, offsetY: 1.0, offsetZ:  1.5, svgX: 35, svgY: 42 },
      { id: "med_left",     label: "Med Bay Left",     offsetX: -0.7, offsetY: 1.0, offsetZ: -0.2, svgX: 65, svgY: 60 },
      { id: "med_right",    label: "Med Bay Right",    offsetX:  0.7, offsetY: 1.0, offsetZ: -0.2, svgX: 35, svgY: 60 },
      { id: "med_rear",     label: "Rear Bay",         offsetX:  0.0, offsetY: 0.7, offsetZ: -1.8, svgX: 50, svgY: 78 },
      { id: "ground_left",  label: "Ground Left",      offsetX: -1.5, offsetY: 0.0, offsetZ:  0.0, svgX: 78, svgY: 60 },
      { id: "ground_right", label: "Ground Right",     offsetX:  1.5, offsetY: 0.0, offsetZ:  0.0, svgX: 22, svgY: 60 },
    ],
  },
  {
    id: "police",
    classname: "PoliceCar",
    name: "Police Car",
    icon: "🚓",
    desc: "Law enforcement Lada",
    length: 4.2,
    width: 1.8,
    slots: [
      { id: "driver",       label: "Driver",           offsetX: -0.4, offsetY: 0.8, offsetZ:  0.7, svgX: 68, svgY: 50 },
      { id: "front_pass",   label: "Partner Seat",     offsetX:  0.4, offsetY: 0.8, offsetZ:  0.7, svgX: 32, svgY: 50 },
      { id: "rear_left",    label: "Rear Cage Left",   offsetX: -0.4, offsetY: 0.8, offsetZ: -0.2, svgX: 68, svgY: 66 },
      { id: "rear_right",   label: "Rear Cage Right",  offsetX:  0.4, offsetY: 0.8, offsetZ: -0.2, svgX: 32, svgY: 66 },
      { id: "trunk",        label: "Trunk",            offsetX:  0.0, offsetY: 0.5, offsetZ: -1.6, svgX: 50, svgY: 82 },
      { id: "ground_left",  label: "Ground Left",      offsetX: -1.3, offsetY: 0.0, offsetZ:  0.0, svgX: 78, svgY: 60 },
      { id: "ground_right", label: "Ground Right",     offsetX:  1.3, offsetY: 0.0, offsetZ:  0.0, svgX: 22, svgY: 60 },
    ],
  },
];

export const LOOT_ITEMS: LootItem[] = [
  { classname: "FirstAidKit",              name: "FAK (First Aid Kit)",   category: "Medical"  },
  { classname: "Bandage_clean",            name: "Bandage (Clean)",       category: "Medical"  },
  { classname: "Morphine",                 name: "Morphine Auto-Injector",category: "Medical"  },
  { classname: "Epinephrine",              name: "Epinephrine Pen",       category: "Medical"  },
  { classname: "BloodBagIV_O_P",          name: "Blood Bag IV (O+)",     category: "Medical"  },
  { classname: "SalineIV_500",            name: "Saline IV 500ml",       category: "Medical"  },
  { classname: "Defibrillator",           name: "Defibrillator",         category: "Medical"  },
  { classname: "Splint",                  name: "Splint",                category: "Medical"  },

  { classname: "RiceBox",                 name: "Rice Box",              category: "Food"     },
  { classname: "TunaCan",                 name: "Tuna Can",              category: "Food"     },
  { classname: "BakedBeans",             name: "Baked Beans",           category: "Food"     },
  { classname: "WaterBottle",             name: "Water Bottle (Full)",   category: "Food"     },
  { classname: "Canteen",                 name: "Canteen",               category: "Food"     },
  { classname: "SodaCan_Pipsi",          name: "Pipsi Can",             category: "Food"     },
  { classname: "ChristmasCake",           name: "Christmas Cake",        category: "Food"     },

  { classname: "CanisterGasoline",        name: "Gasoline Jerry Can",    category: "Vehicle"  },
  { classname: "CanisterOil",             name: "Oil Canister",          category: "Vehicle"  },
  { classname: "CarBattery",             name: "Car Battery",           category: "Vehicle"  },
  { classname: "SparkPlug",              name: "Spark Plug",            category: "Vehicle"  },
  { classname: "CarRadiator",            name: "Car Radiator",          category: "Vehicle"  },
  { classname: "WheelCar",              name: "Car Wheel",             category: "Vehicle"  },
  { classname: "WheelOffroad",          name: "Offroad Wheel",         category: "Vehicle"  },
  { classname: "TruckBattery",          name: "Truck Battery",         category: "Vehicle"  },
  { classname: "CarKey",                name: "Car Key",               category: "Vehicle"  },

  { classname: "Hacksaw",               name: "Hacksaw",               category: "Tools"    },
  { classname: "Axe_Firefighters",      name: "Fire Axe",              category: "Tools"    },
  { classname: "Screwdriver",           name: "Screwdriver",           category: "Tools"    },
  { classname: "WeldingMask",           name: "Welding Mask",          category: "Tools"    },
  { classname: "WireFencing",           name: "Wire Fencing",          category: "Tools"    },
  { classname: "CombinationLock",       name: "Combination Lock",      category: "Tools"    },
  { classname: "TireRepairKit",         name: "Tire Repair Kit",       category: "Tools"    },
  { classname: "Rope",                  name: "Rope",                  category: "Tools"    },

  { classname: "Backpack_CodeLock_Camo",name: "Camo Backpack",         category: "Gear"     },
  { classname: "TacticalGloves",        name: "Tactical Gloves",       category: "Gear"     },
  { classname: "HikingBootsLow_Green",  name: "Green Hiking Boots",    category: "Gear"     },
  { classname: "BallisticHelmet_Black", name: "Ballistic Helmet",      category: "Gear"     },
  { classname: "PlateCarrierVest",      name: "Plate Carrier",         category: "Gear"     },
  { classname: "NVGoggles",            name: "Night Vision Goggles",   category: "Gear"     },

  { classname: "M4A1",                 name: "M4A1",                  category: "Weapons"  },
  { classname: "AKM",                  name: "AKM",                   category: "Weapons"  },
  { classname: "SniperRifle_CZ527",    name: "CZ 527",                category: "Weapons"  },
  { classname: "Winchester70",         name: "Winchester Model 70",   category: "Weapons"  },
  { classname: "FNX45",               name: "FNX-45 Pistol",         category: "Weapons"  },
  { classname: "CZ75",               name: "CZ 75 Pistol",           category: "Weapons"  },
  { classname: "MP5K",               name: "MP5-K",                  category: "Weapons"  },
  { classname: "AK101",              name: "AK-101",                 category: "Weapons"  },

  { classname: "Mag_STANAG_30Rnd_556x45",   name: "STANAG 30rnd Mag",    category: "Ammo" },
  { classname: "Mag_AKM_Drum75Rnd_762x39",  name: "AK Drum 75rnd",       category: "Ammo" },
  { classname: "Mag_FNX45_15Rnd_45ACP",     name: "FNX-45 15rnd Mag",    category: "Ammo" },
  { classname: "Ammo_762x39",               name: "7.62x39 Loose Ammo",  category: "Ammo" },
  { classname: "Ammo_308Win",               name: ".308 Win Loose",       category: "Ammo" },
  { classname: "Ammo_45ACP",               name: ".45 ACP Loose",        category: "Ammo" },
  { classname: "GrenadeHand_RGD5",         name: "RGD-5 Grenade",        category: "Ammo" },
  { classname: "FlashGrenade",             name: "Flash Grenade",         category: "Ammo" },
];

export const LOOT_CATEGORIES = [...new Set(LOOT_ITEMS.map(i => i.category))];
