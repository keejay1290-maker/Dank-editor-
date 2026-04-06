// ─── DAYZ WEAPON DISPLAY BUILDER — DATA ──────────────────────────────────────
// All classnames verified against the provided types.xml (Source of Truth)
// Rule 1 Compliance: 100% Vanilla verified names for server & console stability.

export type SlotType = 'optic' | 'muzzle' | 'stock' | 'magazine' | 'handguard';

export const SLOT_LABELS: Record<SlotType, string> = {
  optic:     '🔭 Sight / Scope',
  muzzle:    '🔇 Muzzle Device',
  stock:     '🪵 Buttstock',
  magazine:  '📦 Magazine',
  handguard: '✋ Handguard / Grip',
};

export const SLOT_COLORS: Record<SlotType, string> = {
  optic:     '#4fc3f7',
  muzzle:    '#ef9a9a',
  stock:     '#a5d6a7',
  magazine:  '#ffe082',
  handguard: '#ce93d8',
};

export interface AttachOffset {
  x: number;
  y: number;
  z: number;
}

export interface AttachmentDef {
  id: string;
  name: string;
  classname: string;
  slot: SlotType;
  offset: AttachOffset;
  ypr?: [number, number, number];
  note?: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  classname: string;
  category: 'Assault Rifle' | 'Sniper Rifle' | 'SMG' | 'Pistol' | 'Shotgun' | 'Civilian Rifle' | 'Special';
  attachments: string[];
  barrelLen: number;
  note?: string;
}

// ─── ATTACHMENTS (VERIFIED) ──────────────────────────────────────────────────

export const ATTACHMENTS: AttachmentDef[] = [
  // Optics
  {
    id: 'kobra',
    name: 'Kobra Red Dot',
    classname: 'KobraOptic',
    slot: 'optic',
    offset: { x: 0.02, y: 0.06, z: 0 },
  },
  {
    id: 'kashtan',
    name: 'Kashtan Scope',
    classname: 'KashtanOptic',
    slot: 'optic',
    offset: { x: 0.03, y: 0.07, z: 0 },
  },
  {
    id: 'acog',
    name: 'ACOG Optic',
    classname: 'ACOGOptic',
    slot: 'optic',
    offset: { x: 0.02, y: 0.08, z: 0 },
  },
  {
    id: 'acog6x',
    name: 'ACOG 6×',
    classname: 'ACOGOptic_6x',
    slot: 'optic',
    offset: { x: 0.02, y: 0.08, z: 0 },
  },
  {
    id: 'm68',
    name: 'M68 CCO',
    classname: 'M68Optic',
    slot: 'optic',
    offset: { x: 0.02, y: 0.07, z: 0 },
  },
  {
    id: 'pu',
    name: 'PU Scope',
    classname: 'PUScopeOptic',
    slot: 'optic',
    offset: { x: 0.02, y: 0.07, z: 0 },
  },
  {
    id: 'hunting_optic',
    name: 'Hunting Optic',
    classname: 'HuntingOptic',
    slot: 'optic',
    offset: { x: 0.02, y: 0.08, z: 0 },
  },
  {
    id: 'reflex',
    name: 'Reflex Sight',
    classname: 'ReflexOptic',
    slot: 'optic',
    offset: { x: 0.01, y: 0.06, z: 0 },
  },
  {
    id: 'pistol_optic',
    name: 'Pistol Sight',
    classname: 'PistolOptic',
    slot: 'optic',
    offset: { x: 0.01, y: 0.05, z: 0 },
  },
  {
    id: 'm4_carry',
    name: 'M4 Carry Handle',
    classname: 'M4_CarryHandleOptic',
    slot: 'optic',
    offset: { x: 0.0, y: 0.04, z: 0 },
  },

  // Muzzle
  {
    id: 'supp_m4',
    name: 'M4 Suppressor',
    classname: 'M4_Suppressor',
    slot: 'muzzle',
    offset: { x: 0.32, y: 0, z: 0 },
  },
  {
    id: 'supp_ak',
    name: 'AK Suppressor',
    classname: 'AK_Suppressor',
    slot: 'muzzle',
    offset: { x: 0.28, y: 0, z: 0 },
  },
  {
    id: 'supp_pistol',
    name: 'Pistol Suppressor',
    classname: 'PistolSuppressor',
    slot: 'muzzle',
    offset: { x: 0.14, y: 0, z: 0 },
  },
  {
    id: 'supp_improvised',
    name: 'Bottle Suppressor',
    classname: 'ImprovisedSuppressor',
    slot: 'muzzle',
    offset: { x: 0.20, y: 0, z: 0 },
  },
  {
    id: 'mp5_comp',
    name: 'MP5 Compensator',
    classname: 'MP5_Compensator',
    slot: 'muzzle',
    offset: { x: 0.08, y: 0, z: 0 },
  },

  // Stocks
  { id: 'm4_stock_cqb', name: 'M4 CQB Stock', classname: 'M4_CQBBttstck', slot: 'stock', offset: { x: -0.26, y: 0, z: 0 } },
  { id: 'm4_stock_mp', name: 'M4 MP Stock', classname: 'M4_MPBttstck', slot: 'stock', offset: { x: -0.28, y: 0, z: 0 } },
  { id: 'm4_stock_oe', name: 'M4 OE Stock', classname: 'M4_OEBttstck', slot: 'stock', offset: { x: -0.30, y: 0, z: 0 } },
  { id: 'ak_plastic_stock', name: 'AK Poly Stock', classname: 'AK_PlasticBttstck', slot: 'stock', offset: { x: -0.30, y: 0, z: 0 } },
  { id: 'ak_folding_stock', name: 'AK Fold Stock', classname: 'AK_FoldingBttstck', slot: 'stock', offset: { x: -0.22, y: 0, z: 0 } },
  { id: 'ak_wood_stock', name: 'AK Wood Stock', classname: 'AK_WoodBttstck', slot: 'stock', offset: { x: -0.30, y: 0, z: 0 } },

  // Handguards
  { id: 'm4_ris_hnd', name: 'M4 RIS Rail', classname: 'M4_RISHndgrd', slot: 'handguard', offset: { x: 0.15, y: -0.04, z: 0 } },
  { id: 'm4_mp_hnd', name: 'M4 MP Grip', classname: 'M4_MPHndgrd', slot: 'handguard', offset: { x: 0.13, y: -0.04, z: 0 } },
  { id: 'ak_rail_hnd', name: 'AK Rail Grip', classname: 'AK_RailHndgrd', slot: 'handguard', offset: { x: 0.14, y: -0.04, z: 0 } },
  { id: 'ak_wood_hnd', name: 'AK Wood Grip', classname: 'AK_WoodHndgrd', slot: 'handguard', offset: { x: 0.13, y: -0.04, z: 0 } },

  // Magazines
  { id: 'mag_stanag_30', name: '30rd STANAG', classname: 'Mag_STANAG_30Rnd', slot: 'magazine', offset: { x: 0.02, y: -0.12, z: 0 } },
  { id: 'mag_cmag_20', name: '20rd CMAG', classname: 'Mag_CMAG_20Rnd', slot: 'magazine', offset: { x: 0.02, y: -0.10, z: 0 } },
  { id: 'mag_stanag_60', name: '60rd Drum', classname: 'Mag_STANAG_60Rnd', slot: 'magazine', offset: { x: 0.02, y: -0.18, z: 0 } },
  { id: 'mag_akm_30', name: '30rd AKM', classname: 'Mag_AKM_30Rnd', slot: 'magazine', offset: { x: 0.02, y: -0.14, z: 0 } },
  { id: 'mag_ak74_30', name: '30rd AK74', classname: 'Mag_AK74_30Rnd', slot: 'magazine', offset: { x: 0.02, y: -0.13, z: 0 } },
  { id: 'mag_vss_10', name: '10rd VSS', classname: 'Mag_VSS_10Rnd', slot: 'magazine', offset: { x: 0.02, y: -0.09, z: 0 } },
  { id: 'mag_svd_10', name: '10rd SVD', classname: 'Mag_SVD_10Rnd', slot: 'magazine', offset: { x: 0.02, y: -0.13, z: 0 } },
  { id: 'mag_ump_25', name: '25rd UMP', classname: 'Mag_UMP_25Rnd', slot: 'magazine', offset: { x: 0.02, y: -0.12, z: 0 } },
  { id: 'mag_fnx_15', name: '15rd FNX', classname: 'Mag_FNX45_15Rnd', slot: 'magazine', offset: { x: 0, y: -0.10, z: 0 } },
];

export const ATTACHMENT_MAP: Record<string, AttachmentDef> =
  Object.fromEntries(ATTACHMENTS.map(a => [a.id, a]));

// ─── WEAPONS (VERIFIED) ──────────────────────────────────────────────────────

export const WEAPONS: WeaponDef[] = [
  {
    id: 'm4a1',
    name: 'M4-A1',
    classname: 'M4A1',
    category: 'Assault Rifle',
    barrelLen: 0.52,
    attachments: ['m68', 'kashtan', 'acog', 'reflex', 'supp_m4', 'm4_stock_cqb', 'm4_stock_mp', 'm4_stock_oe', 'm4_ris_hnd', 'm4_mp_hnd', 'mag_stanag_30', 'mag_cmag_20', 'mag_stanag_60'],
  },
  {
    id: 'akm',
    name: 'AKM',
    classname: 'AKM',
    category: 'Assault Rifle',
    barrelLen: 0.42,
    attachments: ['kobra', 'supp_ak', 'ak_plastic_stock', 'ak_folding_stock', 'ak_wood_stock', 'ak_rail_hnd', 'ak_wood_hnd', 'mag_akm_30'],
  },
  {
    id: 'ak74',
    name: 'AK-74',
    classname: 'AK74',
    category: 'Assault Rifle',
    barrelLen: 0.42,
    attachments: ['kobra', 'supp_ak', 'ak_plastic_stock', 'ak_folding_stock', 'ak_wood_stock', 'ak_rail_hnd', 'mag_ak74_30'],
  },
  {
    id: 'ak101',
    name: 'AK-101',
    classname: 'AK101',
    category: 'Assault Rifle',
    barrelLen: 0.42,
    attachments: ['kobra', 'kashtan', 'acog', 'supp_ak', 'ak_plastic_stock', 'ak_folding_stock', 'ak_rail_hnd', 'mag_stanag_30'],
  },
  {
    id: 'ash12',
    name: 'ASVAL',
    classname: 'ASVAL',
    category: 'Assault Rifle',
    barrelLen: 0.38,
    attachments: ['kobra', 'mag_vss_10'],
  },
  {
    id: 'vss',
    name: 'VSS Vintorez',
    classname: 'VSS',
    category: 'Sniper Rifle',
    barrelLen: 0.38,
    attachments: ['kobra', 'mag_vss_10'],
  },
  {
    id: 'vikhr',
    name: 'Vikhr',
    classname: 'Vikhr',
    category: 'SMG',
    barrelLen: 0.28,
    attachments: ['kobra', 'mag_vss_10'],
  },
  {
    id: 'svd',
    name: 'SVD Dragunov',
    classname: 'SVD',
    category: 'Sniper Rifle',
    barrelLen: 0.62,
    attachments: ['mag_svd_10'],
  },
  {
    id: 'sks',
    name: 'SKS',
    classname: 'SKS',
    category: 'Sniper Rifle',
    barrelLen: 0.52,
    attachments: ['pu', 'hunting_optic'],
  },
  {
    id: 'fal',
    name: 'FAL (LAR)',
    classname: 'FAL',
    category: 'Assault Rifle',
    barrelLen: 0.53,
    attachments: ['reflex', 'acog'],
  },
  {
    id: 'famas',
    name: 'FAMAS',
    classname: 'FAMAS',
    category: 'Assault Rifle',
    barrelLen: 0.48,
    attachments: [],
  },
  {
    id: 'ssg82',
    name: 'SSG 82',
    classname: 'SSG82',
    category: 'Sniper Rifle',
    barrelLen: 0.60,
    attachments: [],
  },
  {
    id: 'sv98',
    name: 'SV-98',
    classname: 'SV98',
    category: 'Sniper Rifle',
    barrelLen: 0.65,
    attachments: ['hunting_optic'],
  },
  {
    id: 'm14',
    name: 'M14',
    classname: 'M14',
    category: 'Sniper Rifle',
    barrelLen: 0.56,
    attachments: ['hunting_optic'],
  },
  {
    id: 'm16a2',
    name: 'M16-A2',
    classname: 'M16A2',
    category: 'Assault Rifle',
    barrelLen: 0.51,
    attachments: [],
  },
  {
    id: 'winchester70',
    name: 'Winchester 70',
    classname: 'Winchester70',
    category: 'Civilian Rifle',
    barrelLen: 0.60,
    attachments: ['hunting_optic'],
  },
  {
    id: 'mp5k',
    name: 'MP5-K',
    classname: 'MP5K',
    category: 'SMG',
    barrelLen: 0.20,
    attachments: ['supp_improvised', 'mp5_comp'],
  },
  {
    id: 'ump45',
    name: 'UMP-45',
    classname: 'UMP45',
    category: 'SMG',
    barrelLen: 0.26,
    attachments: ['supp_improvised', 'mag_ump_25'],
  },
  {
    id: 'fnx45',
    name: 'FNX-45',
    classname: 'FNX45',
    category: 'Pistol',
    barrelLen: 0.13,
    attachments: ['pistol_optic', 'supp_pistol', 'mag_fnx_15'],
  },
  {
    id: 'magnum',
    name: 'Magnum',
    classname: 'Magnum',
    category: 'Pistol',
    barrelLen: 0.16,
    attachments: [],
  },
  {
    id: 'saiga',
    name: 'Saiga-12K',
    classname: 'Saiga',
    category: 'Shotgun',
    barrelLen: 0.43,
    attachments: ['kobra', 'ak_folding_stock', 'ak_plastic_stock'],
  },
  {
    id: 'izh43',
    name: 'IZH-43 Shotgun',
    classname: 'Izh43Shotgun',
    category: 'Shotgun',
    barrelLen: 0.60,
    attachments: [],
  },
  {
    id: 'm79',
    name: 'M79 Launcher',
    classname: 'M79',
    category: 'Special',
    barrelLen: 0.35,
    attachments: [],
  },
  {
    id: 'longhorn',
    name: 'Longhorn',
    classname: 'Longhorn',
    category: 'Pistol',
    barrelLen: 0.25,
    attachments: ['pistol_optic'],
  },
];

export const WEAPON_MAP: Record<string, WeaponDef> =
  Object.fromEntries(WEAPONS.map(w => [w.id, w]));

export const WEAPON_CATEGORIES = [
  'Assault Rifle',
  'Sniper Rifle',
  'Civilian Rifle',
  'SMG',
  'Pistol',
  'Shotgun',
  'Special',
] as const;
