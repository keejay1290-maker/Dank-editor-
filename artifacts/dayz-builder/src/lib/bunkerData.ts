
// ─── DankDayZ Bunker Maker — Piece Definitions ──────────────────────────────
// All classnames verified from real DayZ Underground module JSON files.
// These are the actual DayZ Underground DLC objects confirmed working on console (Xbox/PS5).

export interface BunkerPieceDef {
  classname: string;
  label: string;
  w: number;   // footprint width  (along local X when yaw=0)
  d: number;   // footprint depth  (along local Z when yaw=0)
  h: number;   // approximate height
  category: 'entrance' | 'room' | 'corridor' | 'stairs' | 'wall' | 'floor' | 'exterior' | 'panel' | 'decor' | 'wreck';
  sakhal?: boolean;
  note?: string;
}

// ─── Surface Entrance & Exit Structures ─────────────────────────────────────

export const PIECE_ENTRANCE_MAIN: BunkerPieceDef = {
  classname: 'Land_Underground_Entrance',
  label: 'Underground Entrance (Main)',
  w: 5, d: 5, h: 4,
  category: 'entrance',
  note: 'Primary surface entrance tunnel. Connects directly to underground tunnel segments.',
};

export const PIECE_ENTRANCE_SMALL: BunkerPieceDef = {
  classname: 'Land_Underground_Stairs_Exit',
  label: 'Underground Stairs Exit (Emergency Exit)',
  w: 4, d: 4, h: 4,
  category: 'entrance',
  note: 'Secondary surface exit. Pair with Stairs_Block below for depth.',
};

// ─── Underground Rooms ───────────────────────────────────────────────────────

export const PIECE_ROOM_BARRACKS: BunkerPieceDef = {
  classname: 'Land_Underground_Storage_Barracks',
  label: 'Underground Barracks',
  w: 10, d: 15, h: 4,
  category: 'room',
  note: 'Barracks-style underground room. Sink below terrain.',
};

export const PIECE_ROOM_BIG: BunkerPieceDef = {
  classname: 'Land_Underground_Storage_Big',
  label: 'Underground Storage Big',
  w: 12, d: 18, h: 4.5,
  category: 'room',
  note: 'Large underground storage room.',
};

export const PIECE_ROOM_BIG_VENT: BunkerPieceDef = {
  classname: 'Land_Underground_Storage_Big_Vent',
  label: 'Underground Storage Big (Vented)',
  w: 12, d: 18, h: 4.5,
  category: 'room',
  note: 'Large underground storage room with vent details.',
};

export const PIECE_ROOM_AMMO: BunkerPieceDef = {
  classname: 'Land_Underground_Storage_Ammo',
  label: 'Underground Ammo Storage',
  w: 8, d: 12, h: 3.5,
  category: 'room',
  note: 'Ammo depot room.',
};

export const PIECE_ROOM_AMMO2: BunkerPieceDef = {
  classname: 'Land_Underground_Storage_Ammo2',
  label: 'Underground Ammo Storage Mk2',
  w: 8, d: 12, h: 3.5,
  category: 'room',
};

export const PIECE_ROOM_LAB: BunkerPieceDef = {
  classname: 'Land_Underground_Storage_Laboratory',
  label: 'Underground Laboratory',
  w: 10, d: 14, h: 4,
  category: 'room',
};

export const PIECE_ROOM_WORKSHOP: BunkerPieceDef = {
  classname: 'Land_Underground_Storage_Workshop',
  label: 'Underground Workshop',
  w: 10, d: 14, h: 4,
  category: 'room',
};

export const PIECE_ROOM_PRISON: BunkerPieceDef = {
  classname: 'Land_Underground_Storage_Prison',
  label: 'Underground Prison',
  w: 10, d: 14, h: 4,
  category: 'room',
};

export const PIECE_ROOM_WATER_MAINTENANCE: BunkerPieceDef = {
  classname: 'Land_Underground_WaterMaintenance',
  label: 'Underground Water Maintenance',
  w: 8, d: 8, h: 3.5,
  category: 'room',
};

export const PIECE_ROOM_WATER_RESERVOIR: BunkerPieceDef = {
  classname: 'Land_Underground_WaterReservoir',
  label: 'Underground Water Reservoir',
  w: 8, d: 10, h: 4,
  category: 'room',
};

export const PIECE_ROOM_WARHEAD1: BunkerPieceDef = {
  classname: 'Land_WarheadStorage_Room1',
  label: 'Warhead Storage Room 1',
  w: 8, d: 10, h: 3.5,
  category: 'room',
};

export const PIECE_ROOM_WARHEAD2: BunkerPieceDef = {
  classname: 'Land_WarheadStorage_Room2',
  label: 'Warhead Storage Room 2',
  w: 8, d: 10, h: 3.5,
  category: 'room',
};

export const PIECE_ROOM_WARHEAD3: BunkerPieceDef = {
  classname: 'Land_WarheadStorage_Room3',
  label: 'Warhead Storage Room 3',
  w: 8, d: 10, h: 3.5,
  category: 'room',
};

// ─── Corridor / Tunnel Segments ───────────────────────────────────────────────
// These are the actual DayZ Underground tunnel/corridor modular pieces.
// They fit together like LEGO — tunnel pieces run straight, corridor junctions branch off.

export const PIECE_TUNNEL_SINGLE: BunkerPieceDef = {
  classname: 'Land_Underground_Tunnel_Single',
  label: 'Tunnel Single (Straight)',
  w: 4.5, d: 9, h: 3.5,
  category: 'corridor',
  note: 'Straight tunnel segment. Chain end-to-end for long runs.',
};

export const PIECE_TUNNEL_LEFT: BunkerPieceDef = {
  classname: 'Land_Underground_Tunnel_Single_Left',
  label: 'Tunnel Single Left (T-junction left)',
  w: 9, d: 9, h: 3.5,
  category: 'corridor',
};

export const PIECE_TUNNEL_RIGHT: BunkerPieceDef = {
  classname: 'Land_Underground_Tunnel_Single_Right',
  label: 'Tunnel Single Right (T-junction right)',
  w: 9, d: 9, h: 3.5,
  category: 'corridor',
};

export const PIECE_CORRIDOR_BOTH: BunkerPieceDef = {
  classname: 'Land_Underground_Corridor_Main_Both',
  label: 'Corridor Main Both (T-junction both sides)',
  w: 11, d: 11, h: 3.5,
  category: 'corridor',
  note: 'Wide corridor junction piece — branches left AND right off main tunnel.',
};

export const PIECE_CORRIDOR_LEFT: BunkerPieceDef = {
  classname: 'Land_Underground_Corridor_Main_Left',
  label: 'Corridor Main Left (T-junction left)',
  w: 11, d: 11, h: 3.5,
  category: 'corridor',
};

export const PIECE_CORRIDOR_RIGHT: BunkerPieceDef = {
  classname: 'Land_Underground_Corridor_Main_Right',
  label: 'Corridor Main Right (T-junction right)',
  w: 11, d: 11, h: 3.5,
  category: 'corridor',
};

export const PIECE_CONNECTOR: BunkerPieceDef = {
  classname: 'Land_Underground_Corridor_Connector',
  label: 'Corridor Connector',
  w: 4.5, d: 4.5, h: 3.5,
  category: 'corridor',
  note: 'Short connector segment between junctions.',
};

export const PIECE_CONNECTOR_INV: BunkerPieceDef = {
  classname: 'Land_Underground_Corridor_Connector_Inv',
  label: 'Corridor Connector Inverse',
  w: 4.5, d: 4.5, h: 3.5,
  category: 'corridor',
};

// ─── Gates (place at corridor entrances for visual access points) ─────────────

export const PIECE_GATE_L: BunkerPieceDef = {
  classname: 'StaticObj_Underground_Corridor_Main_Gate_L',
  label: 'Corridor Main Gate (Left leaf)',
  w: 2, d: 1, h: 4,
  category: 'entrance',
};

export const PIECE_GATE_R: BunkerPieceDef = {
  classname: 'StaticObj_Underground_Corridor_Main_Gate_R',
  label: 'Corridor Main Gate (Right leaf)',
  w: 2, d: 1, h: 4,
  category: 'entrance',
};

// ─── Stair & Level-Transition Objects ────────────────────────────────────────
// Stair stack: Stairs_Start (top) → Stairs_Block (×n mid) → Stairs_Block_Terminator (bottom)

export const PIECE_STAIRS_START: BunkerPieceDef = {
  classname: 'Land_Underground_Stairs_Start',
  label: 'Underground Stairs Start (top)',
  w: 4.5, d: 4.5, h: 5,
  category: 'stairs',
  note: 'Top of stairwell at upper level. Chain Stairs_Block below it.',
};

export const PIECE_STAIRS_BLOCK: BunkerPieceDef = {
  classname: 'Land_Underground_Stairs_Block',
  label: 'Underground Stairs Block (mid section)',
  w: 4.5, d: 4.5, h: 5,
  category: 'stairs',
  note: 'Middle stair segment — stack for more depth.',
};

export const PIECE_STAIRS_TERMINATOR: BunkerPieceDef = {
  classname: 'Land_Underground_Stairs_Block_Terminator',
  label: 'Underground Stairs Block Terminator (bottom)',
  w: 4.5, d: 4.5, h: 5,
  category: 'stairs',
  note: 'Bottom cap for the stairwell stack.',
};

export const PIECE_STAIRS_EXIT: BunkerPieceDef = {
  classname: 'Land_Underground_Stairs_Exit',
  label: 'Underground Stairs Exit (surface)',
  w: 4.5, d: 4.5, h: 4,
  category: 'stairs',
  note: 'Surface exit cap — exits to ground level.',
};

export const PIECE_STAIRS_NODOOR: BunkerPieceDef = {
  classname: 'Land_Underground_Stairs_Block_Corridor_NoDoor',
  label: 'Stair Block Corridor No Door',
  w: 4.5, d: 4.5, h: 5,
  category: 'stairs',
};

export const PIECE_STAIRS_COLLAPSED: BunkerPieceDef = {
  classname: 'Land_Underground_Stairs_Collapsed',
  label: 'Collapsed Stairs (atmospheric prop)',
  w: 4.5, d: 4.5, h: 3,
  category: 'stairs',
  note: 'Use as a blocked/ruined passage for abandoned-feel builds.',
};

// ─── Floor Objects ─────────────────────────────────────────────────────────────

export const PIECE_FLOOR_CREW: BunkerPieceDef = {
  classname: 'Land_Underground_Floor_Crew',
  label: 'Underground Floor Crew',
  w: 10, d: 10, h: 0.3,
  category: 'floor',
};

export const PIECE_FLOOR_COMMS: BunkerPieceDef = {
  classname: 'Land_Underground_Floor_Comms',
  label: 'Underground Floor Comms',
  w: 10, d: 10, h: 0.3,
  category: 'floor',
};

// ─── Panel ────────────────────────────────────────────────────────────────────

export const PIECE_PANEL: BunkerPieceDef = {
  classname: 'Land_Underground_Panel',
  label: 'Underground Panel',
  w: 1, d: 0.5, h: 2,
  category: 'panel',
  note: 'Control panel prop. Place near entrance or in rooms.',
};

export const PIECE_PANEL_EXTERIOR: BunkerPieceDef = {
  classname: 'Land_UGComplex_Console_01',
  label: 'UG Complex Console 01 (Sakhal Entry Panel)',
  w: 0.6, d: 0.3, h: 1.4,
  category: 'panel',
  sakhal: true,
  note: 'Sakhal underground complex keypad panel. Requires DayZ 1.25+.',
};

export const PIECE_PANEL_INTERIOR: BunkerPieceDef = {
  classname: 'Land_UGComplex_Console_02',
  label: 'UG Complex Console 02 (Sakhal Exit Panel)',
  w: 0.6, d: 0.3, h: 1.4,
  category: 'panel',
  sakhal: true,
  note: 'Interior exit panel. Requires DayZ 1.25+.',
};

export const PIECE_PANEL_FALLBACK: BunkerPieceDef = {
  classname: 'Land_Underground_Panel',
  label: 'Underground Panel (non-Sakhal fallback)',
  w: 1, d: 0.5, h: 2,
  category: 'panel',
};

// ─── Exterior Wall / Perimeter Pieces ─────────────────────────────────────────
// Standard verified console classnames for surface perimeter

export const PIECE_WALL_CONCRETE_4: BunkerPieceDef = {
  classname: 'Land_Wall_Concrete_4m_DE',
  label: 'Concrete Wall 4m',
  w: 0.3, d: 4, h: 3,
  category: 'wall',
};

export const PIECE_WALL_CONCRETE_8: BunkerPieceDef = {
  classname: 'Land_Wall_Concrete_8m_DE',
  label: 'Concrete Wall 8m',
  w: 0.3, d: 8, h: 3,
  category: 'wall',
};

export const PIECE_WALL_CASTLE_3: BunkerPieceDef = {
  classname: 'Land_Castle_Wall_3m_DE',
  label: 'Castle Wall 3m (Exterior)',
  w: 0.8, d: 3, h: 5,
  category: 'exterior',
};

export const PIECE_WALL_CASTLE_6: BunkerPieceDef = {
  classname: 'Land_Castle_Wall_6m_DE',
  label: 'Castle Wall 6m (Exterior Tall)',
  w: 0.8, d: 6, h: 7,
  category: 'exterior',
};

export const PIECE_HBARRIER_5: BunkerPieceDef = {
  classname: 'Land_HBarrier_5m_DE',
  label: 'HESCO Barrier 5m',
  w: 1, d: 5, h: 2.5,
  category: 'exterior',
};

export const PIECE_HBARRIER_10: BunkerPieceDef = {
  classname: 'Land_HBarrier_10m_DE',
  label: 'HESCO Barrier 10m',
  w: 1, d: 10, h: 2.5,
  category: 'exterior',
};

export const PIECE_HBARRIER_CORNER: BunkerPieceDef = {
  classname: 'Land_HBarrier_Corner_DE',
  label: 'HESCO Barrier Corner',
  w: 1, d: 1, h: 2.5,
  category: 'exterior',
};

export const PIECE_SANDBAG_WALL: BunkerPieceDef = {
  classname: 'Land_Sandbag_Wall_DE',
  label: 'Sandbag Wall',
  w: 0.5, d: 1.5, h: 0.85,
  category: 'exterior',
};

// ─── Decorative Props ─────────────────────────────────────────────────────────

export interface DecorProp {
  classname: string;
  label: string;
  w: number;
  d: number;
  h: number;
  weight: number;
  category: 'crate' | 'barrel' | 'military' | 'garbage' | 'industrial' | 'sandbag';
}

export const DECOR_PROPS: DecorProp[] = [
  // Crates & Storage
  { classname: 'WoodenCrate',                   label: 'Wooden Crate',         w: 1.0, d: 1.0, h: 0.8,  weight: 10, category: 'crate'      },
  { classname: 'WoodenCrateSmall',              label: 'Crate Small',           w: 0.6, d: 0.6, h: 0.5,  weight: 10, category: 'crate'      },
  { classname: 'PalletBox_DE',                  label: 'Pallet Box',            w: 1.2, d: 0.8, h: 1.0,  weight: 8,  category: 'crate'      },
  { classname: 'Pallet_EP1',                    label: 'Wooden Pallet',         w: 1.2, d: 0.8, h: 0.1,  weight: 7,  category: 'crate'      },
  // Barrels
  { classname: 'Barrel_Blue',                   label: 'Blue Barrel',           w: 0.6, d: 0.6, h: 1.0,  weight: 8,  category: 'barrel'     },
  { classname: 'Barrel_Green',                  label: 'Green Barrel',          w: 0.6, d: 0.6, h: 1.0,  weight: 8,  category: 'barrel'     },
  { classname: 'Barrel_Red',                    label: 'Red Barrel',            w: 0.6, d: 0.6, h: 1.0,  weight: 7,  category: 'barrel'     },
  { classname: 'Barrel_Yellow',                 label: 'Yellow Barrel',         w: 0.6, d: 0.6, h: 1.0,  weight: 7,  category: 'barrel'     },
  { classname: 'Land_GasTank_Cylindrical',      label: 'Gas Tank',              w: 0.8, d: 0.8, h: 1.2,  weight: 4,  category: 'industrial' },
  // Military Props
  { classname: 'Land_Sandbag_Wall_DE',          label: 'Sandbag Wall',          w: 0.5, d: 1.5, h: 0.85, weight: 8,  category: 'sandbag'    },
  { classname: 'Land_Sandbag_Round_DE',         label: 'Sandbag Round',         w: 1.5, d: 1.5, h: 0.85, weight: 4,  category: 'sandbag'    },
  { classname: 'Land_Sandbag_Corner_DE',        label: 'Sandbag Corner',        w: 1.0, d: 1.0, h: 0.85, weight: 5,  category: 'sandbag'    },
  { classname: 'Land_BarrierConcrete_02_DE',    label: 'Small Barrier',         w: 0.5, d: 1.2, h: 0.8,  weight: 5,  category: 'military'   },
  { classname: 'Land_BarrierConcrete_01_DE',    label: 'Jersey Barrier',        w: 0.5, d: 2.4, h: 0.8,  weight: 4,  category: 'military'   },
  { classname: 'Land_TankTrap_DE',              label: 'Tank Trap',             w: 1.0, d: 1.0, h: 1.0,  weight: 3,  category: 'military'   },
  // Garbage
  { classname: 'GarbageContainer_Yellow_DE',    label: 'Garbage Bin Yellow',    w: 0.8, d: 1.5, h: 1.1,  weight: 6,  category: 'garbage'    },
  { classname: 'GarbageContainer_Green_DE',     label: 'Garbage Bin Green',     w: 0.8, d: 1.5, h: 1.1,  weight: 6,  category: 'garbage'    },
  // Industrial
  { classname: 'StaticObj_Lamp_Ind',            label: 'Industrial Lamp',       w: 0.3, d: 0.3, h: 2.0,  weight: 6,  category: 'industrial' },
  { classname: 'Land_Misc_Well_Pump_Yellow',    label: 'Well Pump',             w: 0.8, d: 0.8, h: 1.5,  weight: 2,  category: 'industrial' },
];

export const WRECK_PROPS: DecorProp[] = [
  { classname: 'Land_Wreck_V3S_DE',              label: 'V3S Truck Wreck',      w: 2.5, d: 8.0, h: 3.0, weight: 8, category: 'military'   },
  { classname: 'Land_Wreck_Ural_DE',             label: 'Ural Truck Wreck',     w: 2.7, d: 9.0, h: 3.2, weight: 4, category: 'military'   },
  { classname: 'Land_Wreck_Trailer_Closed_DE',   label: 'Trailer Wreck',        w: 2.5, d: 6.0, h: 2.5, weight: 6, category: 'military'   },
  { classname: 'Land_Wreck_BTR_DE',              label: 'BTR APC Wreck',        w: 3.0, d: 7.0, h: 2.8, weight: 3, category: 'military'   },
  { classname: 'Land_Wreck_hb01_aban1_blue_DE',  label: 'Hatchback Wreck',      w: 2.0, d: 4.0, h: 1.5, weight: 6, category: 'military'   },
  { classname: 'Land_Wreck_offroad02_aban1_DE',  label: 'M1025 Wreck',          w: 2.2, d: 4.6, h: 1.8, weight: 6, category: 'military'   },
  { classname: 'Land_Wreck_sed01_aban1_black_DE',label: 'Sedan Wreck',          w: 2.0, d: 4.5, h: 1.5, weight: 5, category: 'military'   },
];

// ─── Style Presets ────────────────────────────────────────────────────────────

export type BunkerStyle = 'military' | 'industrial' | 'abandoned' | 'horror';
export type BunkerSize  = 'compact' | 'standard' | 'large' | 'mega';

export interface StyleDef {
  label: string;
  primaryRoom: BunkerPieceDef;
  altRoom: BunkerPieceDef;
  tunnelStraight: BunkerPieceDef;
  tunnelBranch: BunkerPieceDef;
  exteriorWall: BunkerPieceDef;
  decorBias: ('crate' | 'barrel' | 'military' | 'garbage' | 'industrial' | 'sandbag')[];
  description: string;
}

export const STYLES: Record<BunkerStyle, StyleDef> = {
  military: {
    label: 'Military',
    primaryRoom: PIECE_ROOM_BARRACKS,
    altRoom: PIECE_ROOM_AMMO,
    tunnelStraight: PIECE_TUNNEL_SINGLE,
    tunnelBranch: PIECE_CORRIDOR_BOTH,
    exteriorWall: PIECE_HBARRIER_10,
    decorBias: ['crate', 'sandbag', 'military'],
    description: 'HQ command centre — sandbags, crates, concrete barriers',
  },
  industrial: {
    label: 'Industrial',
    primaryRoom: PIECE_ROOM_WORKSHOP,
    altRoom: PIECE_ROOM_BIG_VENT,
    tunnelStraight: PIECE_TUNNEL_SINGLE,
    tunnelBranch: PIECE_CORRIDOR_LEFT,
    exteriorWall: PIECE_WALL_CASTLE_6,
    decorBias: ['barrel', 'industrial', 'garbage'],
    description: 'Soviet-era factory: gas tanks, barrels, machinery',
  },
  abandoned: {
    label: 'Abandoned',
    primaryRoom: PIECE_ROOM_BARRACKS,
    altRoom: PIECE_ROOM_WATER_MAINTENANCE,
    tunnelStraight: PIECE_TUNNEL_SINGLE,
    tunnelBranch: PIECE_CORRIDOR_RIGHT,
    exteriorWall: PIECE_WALL_CASTLE_3,
    decorBias: ['garbage', 'crate', 'barrel'],
    description: 'Derelict and overgrown: rubbish, broken crates, scattered barrels',
  },
  horror: {
    label: 'Horror',
    primaryRoom: PIECE_ROOM_PRISON,
    altRoom: PIECE_ROOM_WARHEAD1,
    tunnelStraight: PIECE_TUNNEL_SINGLE,
    tunnelBranch: PIECE_CORRIDOR_BOTH,
    exteriorWall: PIECE_HBARRIER_5,
    decorBias: ['military', 'garbage', 'sandbag'],
    description: 'Tight, claustrophobic — maximum tension, dark rooms',
  },
};

export const SIZES: Record<BunkerSize, { label: string; spineMin: number; spineMax: number; branchMin: number; branchMax: number; extraRooms: number }> = {
  compact:  { label: 'Compact',  spineMin: 2, spineMax: 3, branchMin: 1, branchMax: 2, extraRooms: 0 },
  standard: { label: 'Standard', spineMin: 3, spineMax: 5, branchMin: 2, branchMax: 3, extraRooms: 1 },
  large:    { label: 'Large',    spineMin: 5, spineMax: 7, branchMin: 3, branchMax: 4, extraRooms: 2 },
  mega:     { label: 'Mega',     spineMin: 7, spineMax: 9, branchMin: 4, branchMax: 6, extraRooms: 3 },
};

// ─── Placed Object (output type) ─────────────────────────────────────────────

export interface PlacedObject {
  classname: string;
  note: string;        // human-readable label — ASCII only, no emoji
  dx: number;          // offset from bunker world origin (worldX + dx)
  dy: number;          // offset from world Y (negative = underground)
  dz: number;          // offset from bunker world origin (worldZ + dz)
  yaw: number;         // rotation around Y axis
  pitch: number;
  roll: number;
  level: number;       // 0 = surface, 1/2/3 = underground level
  section: 'entrance' | 'exit' | 'panel' | 'exterior' | 'stair' | 'tunnel' | 'branch' | 'room' | 'decor';
}
