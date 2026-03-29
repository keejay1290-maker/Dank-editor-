
// ─── DankDayZ Bunker Maker — Piece Definitions ──────────────────────────────
// All classnames verified console-compatible (SpawnObject-safe).
// Sakhal-flagged items require DayZ 1.25+ (Sakhal map).

export interface BunkerPieceDef {
  classname: string;
  label: string;
  w: number;   // footprint width  (along local X when yaw=0)
  d: number;   // footprint depth  (along local Z when yaw=0)
  h: number;   // approximate height
  category: 'entrance' | 'room' | 'corridor' | 'stairs' | 'wall' | 'floor' | 'exterior' | 'panel' | 'decor' | 'wreck';
  sakhal?: boolean;  // Sakhal-specific asset (DayZ 1.25+)
  note?: string;
}

// ─── Surface Entrance & Exit Structures ─────────────────────────────────────

export const PIECE_ENTRANCE_MAIN: BunkerPieceDef = {
  classname: 'Land_Bunker_DE',
  label: 'Concrete Bunker (Main Entrance)',
  w: 6, d: 8, h: 4.2,
  category: 'entrance',
  note: 'Primary surface entrance. Internal stairs descend ~2.5m. Face opening toward players.',
};

export const PIECE_ENTRANCE_SMALL: BunkerPieceDef = {
  classname: 'Land_Bunker_Small_DE',
  label: 'Small Bunker (Emergency Exit)',
  w: 4, d: 5.5, h: 3.5,
  category: 'entrance',
  note: 'Secondary surface exit/emergency egress.',
};

export const PIECE_GUARDHOUSE: BunkerPieceDef = {
  classname: 'Land_Mil_Guardhouse_DE',
  label: 'Military Guardhouse (Surface Post)',
  w: 4, d: 4, h: 3.2,
  category: 'entrance',
  note: 'Surface guard post near entrance. Adds realism.',
};

// ─── Underground Rooms ───────────────────────────────────────────────────────

export const PIECE_ROOM_BARRACKS: BunkerPieceDef = {
  classname: 'Land_Mil_Barracks_DE',
  label: 'Military Barracks (Underground Room)',
  w: 5, d: 12, h: 4.2,
  category: 'room',
  note: 'Main underground room. Sink 4-5m below terrain.',
};

export const PIECE_ROOM_BARRACKS_HQ: BunkerPieceDef = {
  classname: 'Land_Mil_Barracks_HQ_DE',
  label: 'HQ Barracks (Command Room)',
  w: 5, d: 12, h: 4.2,
  category: 'room',
  note: 'Command/HQ variant barracks. Same dimensions as standard.',
};

export const PIECE_ROOM_SHED: BunkerPieceDef = {
  classname: 'Land_Shed_Ind_DE',
  label: 'Industrial Shed (Warehouse Level)',
  w: 10, d: 16, h: 6,
  category: 'room',
  note: 'Large underground warehouse space. Great for vehicle storage rooms.',
};

export const PIECE_ROOM_GARAGE: BunkerPieceDef = {
  classname: 'Land_Garage_Big',
  label: 'Large Garage (Motor Pool)',
  w: 8.5, d: 13, h: 5,
  category: 'room',
  note: 'Garage bay. Great for convoy staging area underground.',
};

// ─── Corridor Tunnel Segments ────────────────────────────────────────────────
// Containers paired side-by-side create a ~5m wide walkable tunnel corridor.
// Single containers create a narrow utility tunnel.

export const PIECE_CONTAINER_DARK: BunkerPieceDef = {
  classname: 'Land_Container_1Bo_DE',
  label: 'Dark Container (Corridor Segment)',
  w: 2.44, d: 6.1, h: 2.6,
  category: 'corridor',
  note: 'Darkened container. Pair two side-by-side for a full corridor.',
};

export const PIECE_CONTAINER_STD: BunkerPieceDef = {
  classname: 'StaticObj_Container_1D',
  label: 'Container 1D (Corridor Segment)',
  w: 2.44, d: 6.1, h: 2.6,
  category: 'corridor',
};

export const PIECE_CONTAINER_ALT: BunkerPieceDef = {
  classname: 'StaticObj_Container_1C',
  label: 'Container 1C (Alt Corridor)',
  w: 2.44, d: 6.1, h: 2.6,
  category: 'corridor',
};

export const PIECE_CONTAINER_OPEN: BunkerPieceDef = {
  classname: 'Land_Container_1Aoh_DE',
  label: 'Open Container (Pass-through Segment)',
  w: 2.44, d: 6.1, h: 2.6,
  category: 'corridor',
  note: 'Open-ended. Players can walk straight through. Use for connected tunnel runs.',
};

// ─── Stair & Level-Transition Objects ────────────────────────────────────────

export const PIECE_STAIRS_CONCRETE: BunkerPieceDef = {
  classname: 'Land_Stairs_Concrete_DE',
  label: 'Concrete Stairs',
  w: 3, d: 4, h: 2,
  category: 'stairs',
  note: 'Stack 2-3 at increasing heights to descend between levels. ~2m per flight.',
};

export const PIECE_LADDER: BunkerPieceDef = {
  classname: 'Land_PierLadder_DE',
  label: 'Pier Ladder (Vertical Climb)',
  w: 0.5, d: 0.5, h: 3.5,
  category: 'stairs',
  note: 'Essential for level transitions. Place vertically in shaft.',
};

export const PIECE_PLATFORM: BunkerPieceDef = {
  classname: 'Land_Platform_Mil_DE',
  label: 'Military Platform (Landing)',
  w: 2, d: 2, h: 0.5,
  category: 'stairs',
  note: 'Use as landing between stair flights.',
};

export const PIECE_CONCRETE_STEP: BunkerPieceDef = {
  classname: 'Land_Concrete_Step_DE',
  label: 'Concrete Step (Single)',
  w: 1.5, d: 1, h: 0.25,
  category: 'stairs',
};

// ─── Wall Pieces (interior walls & exterior enclosure) ───────────────────────

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

export const PIECE_WALL_BRICK_4: BunkerPieceDef = {
  classname: 'Land_Wall_Brick_4m_DE',
  label: 'Brick Wall 4m',
  w: 0.3, d: 4, h: 3,
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
  label: 'HESCO Barrier 5m (Exterior)',
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

// ─── Floor / Ceiling Slabs ────────────────────────────────────────────────────

export const PIECE_FLOOR_10: BunkerPieceDef = {
  classname: 'Land_Concrete_01_F_10x10_DE',
  label: 'Concrete Floor 10×10',
  w: 10, d: 10, h: 0.1,
  category: 'floor',
};

export const PIECE_FLOOR_5: BunkerPieceDef = {
  classname: 'Land_Concrete_01_F_5x5_DE',
  label: 'Concrete Floor 5×5',
  w: 5, d: 5, h: 0.1,
  category: 'floor',
};

export const PIECE_SLAB: BunkerPieceDef = {
  classname: 'Land_ConcreteSlab_03_DE',
  label: 'Concrete Slab (Ceiling/Roof)',
  w: 4, d: 8, h: 0.3,
  category: 'floor',
  note: 'Flip upside down (pitch=180) to use as ceiling.',
};

// ─── Panel / Keypad Objects ───────────────────────────────────────────────────
// Exterior panel: placed beside the entrance for punchcard/keypad access.
// Interior panel: placed just inside the exit stairwell to let players out.

export const PIECE_PANEL_EXTERIOR: BunkerPieceDef = {
  classname: 'Land_UGComplex_Console_01',
  label: 'UG Facility Console (Entry Panel)',
  w: 0.6, d: 0.3, h: 1.4,
  category: 'panel',
  sakhal: true,
  note: 'Sakhal underground complex console — appears as a punchcard/keypad panel. Requires DayZ 1.25+.',
};

export const PIECE_PANEL_INTERIOR: BunkerPieceDef = {
  classname: 'Land_UGComplex_Console_02',
  label: 'UG Facility Exit Console (Interior)',
  w: 0.6, d: 0.3, h: 1.4,
  category: 'panel',
  sakhal: true,
  note: 'Interior exit panel for the bunker complex. Requires DayZ 1.25+.',
};

export const PIECE_PANEL_FALLBACK: BunkerPieceDef = {
  classname: 'StaticObj_Furniture_shelf_DZ',
  label: 'Shelf Unit (Panel Stand — Fallback)',
  w: 1, d: 0.4, h: 1.8,
  category: 'panel',
  note: 'Fallback panel stand. Use if Sakhal console objects unavailable.',
};

// ─── Decorative Props ─────────────────────────────────────────────────────────

export interface DecorProp {
  classname: string;
  label: string;
  w: number;
  d: number;
  h: number;
  weight: number; // spawn probability weight (higher = more common)
  category: 'crate' | 'barrel' | 'military' | 'garbage' | 'industrial' | 'sandbag';
}

export const DECOR_PROPS: DecorProp[] = [
  // ── Crates & Storage ──
  { classname: 'WoodenCrate',            label: 'Wooden Crate',       w: 1.0, d: 1.0, h: 0.8,  weight: 10, category: 'crate'      },
  { classname: 'WoodenCrateSmall',       label: 'Crate Small',        w: 0.6, d: 0.6, h: 0.5,  weight: 10, category: 'crate'      },
  { classname: 'PalletBox_DE',           label: 'Pallet Box',         w: 1.2, d: 0.8, h: 1.0,  weight: 8,  category: 'crate'      },
  { classname: 'Pallet_EP1',             label: 'Wooden Pallet',      w: 1.2, d: 0.8, h: 0.1,  weight: 7,  category: 'crate'      },
  // ── Barrels ──
  { classname: 'Barrel_Blue',            label: 'Blue Barrel',        w: 0.6, d: 0.6, h: 1.0,  weight: 8,  category: 'barrel'     },
  { classname: 'Barrel_Green',           label: 'Green Barrel',       w: 0.6, d: 0.6, h: 1.0,  weight: 8,  category: 'barrel'     },
  { classname: 'Barrel_Red',             label: 'Red Barrel',         w: 0.6, d: 0.6, h: 1.0,  weight: 7,  category: 'barrel'     },
  { classname: 'Barrel_Yellow',          label: 'Yellow Barrel',      w: 0.6, d: 0.6, h: 1.0,  weight: 7,  category: 'barrel'     },
  { classname: 'Land_GasTank_Cylindrical', label: 'Gas Tank',         w: 0.8, d: 0.8, h: 1.2,  weight: 4,  category: 'industrial' },
  // ── Military Props ──
  { classname: 'Land_Sandbag_Wall_DE',   label: 'Sandbag Wall',       w: 0.5, d: 1.5, h: 0.85, weight: 8,  category: 'sandbag'    },
  { classname: 'Land_Sandbag_Round_DE',  label: 'Sandbag Round',      w: 1.5, d: 1.5, h: 0.85, weight: 4,  category: 'sandbag'    },
  { classname: 'Land_Sandbag_Corner_DE', label: 'Sandbag Corner',     w: 1.0, d: 1.0, h: 0.85, weight: 5,  category: 'sandbag'    },
  { classname: 'Land_BarrierConcrete_02_DE', label: 'Small Barrier',  w: 0.5, d: 1.2, h: 0.8,  weight: 5,  category: 'military'   },
  { classname: 'Land_BarrierConcrete_01_DE', label: 'Jersey Barrier', w: 0.5, d: 2.4, h: 0.8,  weight: 4,  category: 'military'   },
  { classname: 'Land_TankTrap_DE',       label: 'Tank Trap',          w: 1.0, d: 1.0, h: 1.0,  weight: 3,  category: 'military'   },
  // ── Garbage ──
  { classname: 'GarbageContainer_Yellow_DE', label: 'Garbage Bin Y',  w: 0.8, d: 1.5, h: 1.1,  weight: 6,  category: 'garbage'    },
  { classname: 'GarbageContainer_Green_DE',  label: 'Garbage Bin G',  w: 0.8, d: 1.5, h: 1.1,  weight: 6,  category: 'garbage'    },
  // ── Industrial ──
  { classname: 'StaticObj_Lamp_Ind',     label: 'Industrial Lamp',    w: 0.3, d: 0.3, h: 2.0,  weight: 6,  category: 'industrial' },
  { classname: 'Land_Misc_Well_Pump_Yellow', label: 'Well Pump',      w: 0.8, d: 0.8, h: 1.5,  weight: 2,  category: 'industrial' },
];

export const WRECK_PROPS: DecorProp[] = [
  { classname: 'Land_Wreck_V3S_DE',              label: 'V3S Truck Wreck',     w: 2.5, d: 8.0,  h: 3.0, weight: 8,  category: 'military'   },
  { classname: 'Land_Wreck_Ural_DE',             label: 'Ural Truck Wreck',    w: 2.7, d: 9.0,  h: 3.2, weight: 4,  category: 'military'   },
  { classname: 'Land_Wreck_Trailer_Closed_DE',   label: 'Trailer Wreck',       w: 2.5, d: 6.0,  h: 2.5, weight: 6,  category: 'military'   },
  { classname: 'Land_Wreck_BTR_DE',              label: 'BTR APC Wreck',       w: 3.0, d: 7.0,  h: 2.8, weight: 3,  category: 'military'   },
  { classname: 'Land_Wreck_hb01_aban1_blue_DE',  label: 'Hatchback Wreck',     w: 2.0, d: 4.0,  h: 1.5, weight: 6,  category: 'military'   },
  { classname: 'Land_Wreck_offroad02_aban1_DE',  label: 'M1025 Wreck',         w: 2.2, d: 4.6,  h: 1.8, weight: 6,  category: 'military'   },
  { classname: 'Land_Wreck_sed01_aban1_black_DE',label: 'Sedan Wreck',         w: 2.0, d: 4.5,  h: 1.5, weight: 5,  category: 'military'   },
  { classname: 'Land_Train_Wagon_Box_DE',        label: 'Train Wagon Box',     w: 3.0, d: 9.0,  h: 3.5, weight: 2,  category: 'industrial' },
  { classname: 'Land_Train_Wagon_Box_Mil_DE',    label: 'Military Wagon',      w: 3.0, d: 9.0,  h: 3.5, weight: 2,  category: 'military'   },
];

// ─── Style Presets ────────────────────────────────────────────────────────────

export type BunkerStyle = 'military' | 'industrial' | 'abandoned' | 'horror';
export type BunkerSize  = 'compact' | 'standard' | 'large' | 'mega';

export interface StyleDef {
  label: string;
  primaryRoom: BunkerPieceDef;
  altRoom: BunkerPieceDef;
  corridorA: BunkerPieceDef;
  corridorB: BunkerPieceDef;
  wallType: BunkerPieceDef;
  exteriorWall: BunkerPieceDef;
  decorBias: ('crate' | 'barrel' | 'military' | 'garbage' | 'industrial' | 'sandbag')[];
  description: string;
}

export const STYLES: Record<BunkerStyle, StyleDef> = {
  military: {
    label: '🪖 Military',
    primaryRoom: PIECE_ROOM_BARRACKS_HQ,
    altRoom: PIECE_ROOM_BARRACKS,
    corridorA: PIECE_CONTAINER_DARK,
    corridorB: PIECE_CONTAINER_STD,
    wallType: PIECE_WALL_CONCRETE_4,
    exteriorWall: PIECE_HBARRIER_10,
    decorBias: ['crate', 'sandbag', 'military'],
    description: 'HQ command centre vibes — sandbags, crates, concrete barriers',
  },
  industrial: {
    label: '⚙️ Industrial',
    primaryRoom: PIECE_ROOM_SHED,
    altRoom: PIECE_ROOM_GARAGE,
    corridorA: PIECE_CONTAINER_OPEN,
    corridorB: PIECE_CONTAINER_ALT,
    wallType: PIECE_WALL_CONCRETE_8,
    exteriorWall: PIECE_WALL_CASTLE_6,
    decorBias: ['barrel', 'industrial', 'garbage'],
    description: 'Soviet-era factory: gas tanks, barrels, machinery',
  },
  abandoned: {
    label: '🏚 Abandoned',
    primaryRoom: PIECE_ROOM_BARRACKS,
    altRoom: PIECE_ROOM_SHED,
    corridorA: PIECE_CONTAINER_STD,
    corridorB: PIECE_CONTAINER_DARK,
    wallType: PIECE_WALL_BRICK_4,
    exteriorWall: PIECE_WALL_CASTLE_3,
    decorBias: ['garbage', 'crate', 'barrel'],
    description: 'Derelict & overgrown: rubbish, broken crates, scattered barrels',
  },
  horror: {
    label: '💀 Horror',
    primaryRoom: PIECE_ROOM_BARRACKS,
    altRoom: PIECE_ROOM_BARRACKS_HQ,
    corridorA: PIECE_CONTAINER_DARK,
    corridorB: PIECE_CONTAINER_DARK,
    wallType: PIECE_WALL_CONCRETE_4,
    exteriorWall: PIECE_HBARRIER_5,
    decorBias: ['military', 'garbage', 'sandbag'],
    description: 'Tight, claustrophobic and threatening — maximum tension',
  },
};

export const SIZES: Record<BunkerSize, { label: string; spineMin: number; spineMax: number; branchMin: number; branchMax: number; extraRooms: number }> = {
  compact:  { label: '📦 Compact',  spineMin: 2, spineMax: 3, branchMin: 1, branchMax: 2, extraRooms: 0 },
  standard: { label: '🏗 Standard', spineMin: 3, spineMax: 5, branchMin: 2, branchMax: 3, extraRooms: 1 },
  large:    { label: '🏛 Large',    spineMin: 5, spineMax: 7, branchMin: 3, branchMax: 4, extraRooms: 2 },
  mega:     { label: '🌆 Mega',     spineMin: 7, spineMax: 9, branchMin: 4, branchMax: 6, extraRooms: 3 },
};

// ─── Placed Object (output type) ─────────────────────────────────────────────

export interface PlacedObject {
  classname: string;
  note: string;        // human-readable label (used as comment in output)
  dx: number;          // offset from bunker world origin (worldX + dx)
  dy: number;          // offset from world Y (negative = underground)
  dz: number;          // offset from bunker world origin (worldZ + dz)
  yaw: number;         // rotation around Y axis (0 = North / facing +Z)
  pitch: number;       // pitch (usually 0)
  roll: number;        // roll (usually 0)
  level: number;       // 0 = surface, 1/2/3 = underground level
  section: 'entrance' | 'exit' | 'spine' | 'branch' | 'room' | 'stair' | 'decor' | 'exterior' | 'panel';
}
