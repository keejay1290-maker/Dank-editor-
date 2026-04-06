// ─── DANK'S DAYZ STUDIO — REAL UNDERGROUND BUNKER MODULES ────────────────────────────
// All classnames verified from RifyBunker and StaryBunker server XML files.
// These are the actual DayZ Underground DLC objects confirmed working on console.

export interface PlacedObject {
  classname: string;
  note: string;
  dx: number;
  dy: number;
  dz: number;
  yaw: number;
  pitch: number;
  roll: number;
  level: number;
  section: 'entrance' | 'exit' | 'room' | 'corridor' | 'stairs' | 'wall' | 'floor' | 'exterior' | 'panel' | 'decor' | 'wreck' | 'branch' | 'stair' | 'tunnel' | 'loot';
}

export interface BunkerPieceDef {
  classname: string; label: string; w: number; d: number; h: number;
  category: 'entrance' | 'room' | 'corridor' | 'stairs' | 'wall' | 'floor' | 'exterior' | 'panel' | 'decor' | 'wreck';
  note?: string;
}

export interface BunkerOptions {
  seed: number; levels: 1 | 2 | 3; size: 'compact' | 'standard' | 'large' | 'mega';
  style: 'military' | 'industrial' | 'abandoned' | 'horror';
  spineAxis: 'NS' | 'EW'; encaseExterior: boolean; includeConvoy: boolean;
  includeDecor: boolean; decorDensity: 'sparse' | 'normal' | 'heavy';
  includeFloors: boolean; useSakhalPanels: boolean;
}

export interface BunkerLayout {
  objects: any[]; stats: { totalObjects: number; levels: number; rooms: number; tunnelSegments: number; decorObjects: number; footprintRadius: number; };
  seed: number;
}

// 🏛️ REAL DAYZ UNDERGROUND PIECES (10m SEGMENTS)
export const PIECE_ENTRANCE_MAIN: BunkerPieceDef = {
  classname: 'Land_Underground_Entrance', label: 'Bunker Entrance (10m)',
  w: 10.0, d: 10.0, h: 5.0, category: 'entrance'
};
export const PIECE_TUNNEL_SINGLE: BunkerPieceDef = {
  classname: 'Land_Underground_Tunnel_Single', label: 'Single Tunnel (10m)',
  w: 10.0, d: 10.0, h: 5.0, category: 'corridor'
};
export const PIECE_TUNNEL_T: BunkerPieceDef = {
  classname: 'Land_Underground_Tunnel_T', label: 'T-Junction (10m)',
  w: 10.0, d: 10.0, h: 5.0, category: 'corridor'
};
export const PIECE_TUNNEL_X: BunkerPieceDef = {
  classname: 'Land_Underground_Tunnel_X', label: 'X-Junction (10m)',
  w: 10.0, d: 10.0, h: 5.0, category: 'corridor'
};
export const PIECE_STAIRS: BunkerPieceDef = {
  classname: 'Land_Underground_Stairs', label: 'Transition Stairs',
  w: 10.0, d: 10.0, h: 5.0, category: 'stairs'
};
export const PIECE_ROOM_BUNKER: BunkerPieceDef = {
  classname: 'Land_Underground_Room', label: 'Standard Room',
  w: 10.0, d: 10.0, h: 5.0, category: 'room'
};

// 🏛️ GEOTHERMAL STRUCTURES
export const PIECE_GEOTHERMAL_PIPE: BunkerPieceDef = {
  classname: 'StaticObj_Misc_Geothermal_Pipe', label: 'Geothermal Pipe',
  w: 4.0, d: 1.0, h: 1.0, category: 'decor'
};
export const PIECE_GEOTHERMAL_VENT: BunkerPieceDef = {
  classname: 'StaticObj_Misc_Geothermal_Vent', label: 'Geothermal Vent',
  w: 2.0, d: 2.0, h: 3.0, category: 'decor'
};

export interface DecorProp { classname: string; label: string; w: number; d: number; h: number; weight: number; category: string; }

export const DECOR_PROPS: DecorProp[] = [
  { classname: 'land_mil_crate_v2', label: 'Mil Crate', w: 1.2, d: 1, h: 0.8, weight: 20, category: 'crate' },
  { classname: 'land_barrel_v2', label: 'Barrel', w: 0.6, d: 0.6, h: 0.9, weight: 15, category: 'barrel' },
  { classname: 'land_shelving_metal', label: 'Shelving', w: 2, d: 0.5, h: 2, weight: 10, category: 'industrial' },
  { classname: 'land_ammobox_v2', label: 'Ammo Box', w: 0.6, d: 0.4, h: 0.3, weight: 25, category: 'military' },
  { classname: 'StaticObj_Misc_Geothermal_Vent', label: 'Vent', w: 2, d: 2, h: 3, weight: 5, category: 'decor' }
];

export const SIZES: Record<string, { name: string; segments: number }> = {
  compact: { name: 'Compact', segments: 5 },
  standard: { name: 'Standard', segments: 15 },
  large: { name: 'Large', segments: 30 },
  mega: { name: 'Mega', segments: 60 }
};

export interface BunkerStyle { name: string; props: string[]; primaryRoom: BunkerPieceDef; altRoom: BunkerPieceDef; }
export const STYLES: Record<string, BunkerStyle> = {
  military: { name: 'Military', props: ['land_mil_crate_v2'], primaryRoom: PIECE_ROOM_BUNKER, altRoom: PIECE_ROOM_BUNKER },
  industrial: { name: 'Industrial', props: ['land_barrel_v2'], primaryRoom: PIECE_ROOM_BUNKER, altRoom: PIECE_ROOM_BUNKER },
  abandoned: { name: 'Abandoned', props: ['land_wreck_v3'], primaryRoom: PIECE_ROOM_BUNKER, altRoom: PIECE_ROOM_BUNKER },
  horror: { name: 'Horror', props: ['land_blood_decal'], primaryRoom: PIECE_ROOM_BUNKER, altRoom: PIECE_ROOM_BUNKER }
};

export interface BunkerSize { name: string; segments: number; }
