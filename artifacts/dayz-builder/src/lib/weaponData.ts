// ─── DAYZ WEAPON DISPLAY BUILDER — DATA ──────────────────────────────────────
// All classnames verified against vanilla DayZ 1.25 types.xml (console-safe)
// These weapons + attachments are SEPARATE ITEMS spawned close together
// so they LOOK attached — players pick them up and attach themselves.

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

// Offset from weapon spawn point (metres):
//   x = along barrel (+x toward muzzle)
//   y = vertical      (+y upward)
//   z = lateral       (+z right when facing muzzle)
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
  offset: AttachOffset;        // default "looks attached" offset
  ypr?: [number, number, number]; // yaw pitch roll override (degrees)
  note?: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  classname: string;
  category: 'Assault Rifle' | 'Sniper Rifle' | 'SMG' | 'Pistol' | 'Shotgun' | 'Civilian Rifle';
  attachments: string[];       // attachment IDs this weapon accepts
  barrelLen: number;           // approx barrel length in metres (for diagram)
  note?: string;
}

// ─── ATTACHMENTS ─────────────────────────────────────────────────────────────

export const ATTACHMENTS: AttachmentDef[] = [

  // ── Optics / Sights ──────────────────────────────────────────────────────
  {
    id: 'kobra',
    name: 'Kobra Red Dot',
    classname: 'KobraOptic',
    slot: 'optic',
    offset: { x: 0.02, y: 0.06, z: 0 },
    note: 'AK-series red dot — mounts on side rail',
  },
  {
    id: 'pso1',
    name: 'PSO-1 Scope (4×)',
    classname: 'PSO1Optic',
    slot: 'optic',
    offset: { x: 0.04, y: 0.07, z: 0 },
    note: 'Classic 4× Soviet scope for AKs, SVD',
  },
  {
    id: 'pu',
    name: 'PU Scope (3.5×)',
    classname: 'PUScopeOptic',
    slot: 'optic',
    offset: { x: 0.02, y: 0.07, z: 0 },
    note: 'WW2-era scope — Mosin and SKS',
  },
  {
    id: 'hunting_optic',
    name: 'Hunting Optic (4×)',
    classname: 'HuntingOptic',
    slot: 'optic',
    offset: { x: 0.02, y: 0.08, z: 0 },
    note: 'Standard civilian hunting scope',
  },
  {
    id: 'm68',
    name: 'M68 CCO Red Dot',
    classname: 'M68Optic',
    slot: 'optic',
    offset: { x: 0.02, y: 0.07, z: 0 },
    note: 'NATO red dot — M4A1 only',
  },
  {
    id: 'kashtan',
    name: 'Kashtan Scope',
    classname: 'KashtanOptic',
    slot: 'optic',
    offset: { x: 0.03, y: 0.07, z: 0 },
    note: 'Compact scope — M4A1 and AK-101',
  },
  {
    id: 'acog',
    name: 'ACOG (4×)',
    classname: 'ACOGOptic',
    slot: 'optic',
    offset: { x: 0.02, y: 0.08, z: 0 },
    note: 'NATO 4× combat optic — M4A1 / AK-101',
  },
  {
    id: 'reflex',
    name: 'Reflex Sight',
    classname: 'ReflexOptic',
    slot: 'optic',
    offset: { x: 0.01, y: 0.06, z: 0 },
    note: 'Compact open red dot — most rifles',
  },
  {
    id: 'pistol_optic',
    name: 'Pistol Red Dot',
    classname: 'PistolOptic',
    slot: 'optic',
    offset: { x: 0.01, y: 0.05, z: 0 },
    note: 'Mini red dot for pistols',
  },

  // ── Muzzle Devices ───────────────────────────────────────────────────────
  {
    id: 'supp_m4',
    name: 'Suppressor (M4)',
    classname: 'M4_Suppressor',
    slot: 'muzzle',
    offset: { x: 0.32, y: 0, z: 0 },
    note: '5.56 suppressor — M4A1 only',
  },
  {
    id: 'supp_ak',
    name: 'Suppressor (AK)',
    classname: 'AK_Suppressor',
    slot: 'muzzle',
    offset: { x: 0.28, y: 0, z: 0 },
    note: '7.62/5.45/5.56 suppressor — all AK variants',
  },
  {
    id: 'supp_pistol',
    name: 'Pistol Suppressor',
    classname: 'PistolSuppressor',
    slot: 'muzzle',
    offset: { x: 0.14, y: 0, z: 0 },
    note: '9mm suppressor — CZ75, Glock, P1',
  },
  {
    id: 'supp_improvised',
    name: 'Improvised Suppressor',
    classname: 'ImprovisedSuppressor',
    slot: 'muzzle',
    offset: { x: 0.20, y: 0, z: 0 },
    note: 'Crafted suppressor — MP5, UMP, some rifles',
  },
  {
    id: 'mosin_comp',
    name: 'Mosin Compensator',
    classname: 'Mosin_Compensator',
    slot: 'muzzle',
    offset: { x: 0.09, y: 0, z: 0 },
    note: 'Mosin-Nagant muzzle compensator',
  },
  {
    id: 'mp5_comp',
    name: 'MP5 Compensator',
    classname: 'MP5_Compensator',
    slot: 'muzzle',
    offset: { x: 0.08, y: 0, z: 0 },
    note: 'MP5 muzzle compensator',
  },

  // ── Buttstocks ───────────────────────────────────────────────────────────
  {
    id: 'm4_stock_cqb',
    name: 'M4 CQB Buttstock',
    classname: 'M4_CQBBttstck',
    slot: 'stock',
    offset: { x: -0.26, y: 0, z: 0 },
    note: 'Compact CQB stock for M4A1',
  },
  {
    id: 'm4_stock_mp',
    name: 'M4 MP Buttstock',
    classname: 'M4_MPBttstck',
    slot: 'stock',
    offset: { x: -0.28, y: 0, z: 0 },
    note: 'Military Police stock — M4A1',
  },
  {
    id: 'm4_stock_oe',
    name: 'M4 OE Buttstock',
    classname: 'M4_OEBttstck',
    slot: 'stock',
    offset: { x: -0.30, y: 0, z: 0 },
    note: 'Original equipment stock — M4A1',
  },
  {
    id: 'ak_plastic_stock',
    name: 'AK Plastic Buttstock',
    classname: 'AK_PlasticBttstck',
    slot: 'stock',
    offset: { x: -0.30, y: 0, z: 0 },
    note: 'Polymer stock — all AK variants',
  },
  {
    id: 'ak_folding_stock',
    name: 'AK Folding Buttstock',
    classname: 'AK_FoldingBttstck',
    slot: 'stock',
    offset: { x: -0.22, y: 0, z: 0 },
    note: 'Side-folding stock — AK variants',
  },
  {
    id: 'ak_wood_stock',
    name: 'AK Wood Buttstock',
    classname: 'AK_WoodBttstck',
    slot: 'stock',
    offset: { x: -0.30, y: 0, z: 0 },
    note: 'Classic wooden stock — AK/AKM',
  },

  // ── Handguards ───────────────────────────────────────────────────────────
  {
    id: 'm4_ris_handguard',
    name: 'M4 RIS Handguard',
    classname: 'M4_RISHndgrd',
    slot: 'handguard',
    offset: { x: 0.15, y: -0.04, z: 0 },
    note: 'Picatinny rail handguard — M4A1',
  },
  {
    id: 'm4_mp_handguard',
    name: 'M4 MP Handguard',
    classname: 'M4_MPHndgrd',
    slot: 'handguard',
    offset: { x: 0.13, y: -0.04, z: 0 },
    note: 'Shorter MP handguard — M4A1',
  },
  {
    id: 'ak_rail_handguard',
    name: 'AK Rail Handguard',
    classname: 'AK_RailHndgrd',
    slot: 'handguard',
    offset: { x: 0.14, y: -0.04, z: 0 },
    note: 'Picatinny rail handguard for AK',
  },
  {
    id: 'ak_wood_handguard',
    name: 'AK Wood Handguard',
    classname: 'AK_WoodHndgrd',
    slot: 'handguard',
    offset: { x: 0.13, y: -0.04, z: 0 },
    note: 'Classic wooden handguard — AK/AKM',
  },

  // ── Magazines ────────────────────────────────────────────────────────────
  {
    id: 'mag_stanag_30',
    name: 'STANAG 30rnd (5.56)',
    classname: 'Mag_STANAG_30Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.12, z: 0 },
    note: 'Standard M4A1 / AK-101 magazine',
  },
  {
    id: 'mag_cmag_20',
    name: 'CMAG 20rnd (5.56)',
    classname: 'Mag_CMAG_20Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.10, z: 0 },
    note: 'Short M4A1 magazine',
  },
  {
    id: 'mag_stanag_60',
    name: 'STANAG 60rnd Drum (5.56)',
    classname: 'Mag_STANAG_60Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.18, z: 0 },
    note: 'Drum magazine — M4A1 / AK-101',
  },
  {
    id: 'mag_cmag_30',
    name: 'CMAG 30rnd (5.56)',
    classname: 'Mag_CMAG_30Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.12, z: 0 },
    note: 'Civilian CMAG — M4A1 / AK-101',
  },
  {
    id: 'mag_cmag_40',
    name: 'CMAG 40rnd (5.56)',
    classname: 'Mag_CMAG_40Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.14, z: 0 },
    note: 'Extended CMAG — M4A1 / AK-101',
  },
  {
    id: 'mag_akm_30',
    name: 'AKM 30rnd (7.62×39)',
    classname: 'Mag_AKM_30Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.14, z: 0 },
    note: 'Standard curved AKM magazine',
  },
  {
    id: 'mag_akm_drum',
    name: 'AKM 75rnd Drum (7.62×39)',
    classname: 'Mag_AKM_Drum75Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.22, z: 0 },
    note: 'RPK-style drum magazine',
  },
  {
    id: 'mag_akm_palm',
    name: 'AKM Palm 30rnd',
    classname: 'Mag_AKM_Palm30Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.12, z: 0 },
    note: 'Straight palm magazine — AKM',
  },
  {
    id: 'mag_ak74_30',
    name: 'AK-74 30rnd (5.45×39)',
    classname: 'Mag_AK74_30Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.13, z: 0 },
  },
  {
    id: 'mag_ak74_45',
    name: 'AK-74 45rnd (5.45×39)',
    classname: 'Mag_AK74_45Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.15, z: 0 },
  },
  {
    id: 'mag_ak101_30',
    name: 'AK-101 30rnd (5.56×45)',
    classname: 'Mag_AK101_30Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.13, z: 0 },
    note: 'Straight magazine — AK-101',
  },
  {
    id: 'mag_val_20',
    name: 'VAL/VSD 20rnd (9×39)',
    classname: 'Mag_VAL_20Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.11, z: 0 },
    note: 'Subsonic 9×39mm — VSS/VAL/VSD',
  },
  {
    id: 'mag_vss_10',
    name: 'VSS 10rnd (9×39)',
    classname: 'Mag_VSS_10Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.09, z: 0 },
    note: 'Short 9×39mm mag — VSS/VSD',
  },
  {
    id: 'mag_svd_10',
    name: 'SVD 10rnd (7.62×54R)',
    classname: 'Mag_SVD_10Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.13, z: 0 },
  },
  {
    id: 'mag_cz527_5',
    name: 'CZ-527 5rnd (7.62×39)',
    classname: 'Mag_CZ527_5rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.07, z: 0 },
  },
  {
    id: 'mag_mp5_30',
    name: 'MP5 30rnd (9×19)',
    classname: 'Mag_MP5_30Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.13, z: 0 },
  },
  {
    id: 'mag_mp5_15',
    name: 'MP5 15rnd (9×19)',
    classname: 'Mag_MP5_15Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.10, z: 0 },
  },
  {
    id: 'mag_ump_25',
    name: 'UMP 25rnd (.45 ACP)',
    classname: 'Mag_UMP_25Rnd',
    slot: 'magazine',
    offset: { x: 0.02, y: -0.12, z: 0 },
  },
  {
    id: 'mag_cz75_15',
    name: 'CZ-75 15rnd (9×19)',
    classname: 'Mag_CZ75_15Rnd',
    slot: 'magazine',
    offset: { x: 0.0, y: -0.10, z: 0 },
  },
  {
    id: 'mag_p1_8',
    name: 'P1 8rnd (9×18)',
    classname: 'Mag_P1_8Rnd',
    slot: 'magazine',
    offset: { x: 0.0, y: -0.08, z: 0 },
  },
  {
    id: 'mag_glock_15',
    name: 'Glock 15rnd (9×19)',
    classname: 'Mag_Glock_15Rnd',
    slot: 'magazine',
    offset: { x: 0.0, y: -0.10, z: 0 },
  },
  {
    id: 'mag_fnx45_15',
    name: 'FNX-45 15rnd (.45 ACP)',
    classname: 'Mag_FNX45_15Rnd',
    slot: 'magazine',
    offset: { x: 0.0, y: -0.10, z: 0 },
  },
  {
    id: 'mag_deagle_9',
    name: 'Desert Eagle 9rnd (.44)',
    classname: 'Mag_Deagle_9rnd',
    slot: 'magazine',
    offset: { x: 0.0, y: -0.10, z: 0 },
  },
  {
    id: 'mag_ruger_30',
    name: 'Ruger 10/22 30rnd (.22 LR)',
    classname: 'Mag_Ruger1022_30Rnd',
    slot: 'magazine',
    offset: { x: 0.0, y: -0.10, z: 0 },
    note: '.22 LR magazine — Sporter 22 / Ruger 10/22',
  },
];

// Build a lookup map
export const ATTACHMENT_MAP: Record<string, AttachmentDef> =
  Object.fromEntries(ATTACHMENTS.map(a => [a.id, a]));

// ─── WEAPONS ─────────────────────────────────────────────────────────────────

export const WEAPONS: WeaponDef[] = [

  // ── Assault Rifles ───────────────────────────────────────────────────────
  {
    id: 'm4a1',
    name: 'M4-A1',
    classname: 'M4A1',
    category: 'Assault Rifle',
    barrelLen: 0.52,
    attachments: ['m68', 'kashtan', 'hunting_optic', 'acog', 'reflex', 'supp_m4', 'm4_stock_cqb', 'm4_stock_mp', 'm4_stock_oe', 'm4_ris_handguard', 'm4_mp_handguard', 'mag_stanag_30', 'mag_cmag_20', 'mag_stanag_60', 'mag_cmag_30', 'mag_cmag_40'],
    note: 'US 5.56mm assault rifle — most customisable in the game',
  },
  {
    id: 'akm',
    name: 'AKM',
    classname: 'AKM',
    category: 'Assault Rifle',
    barrelLen: 0.42,
    attachments: ['kobra', 'pso1', 'supp_ak', 'ak_plastic_stock', 'ak_folding_stock', 'ak_wood_stock', 'ak_rail_handguard', 'ak_wood_handguard', 'mag_akm_30', 'mag_akm_drum', 'mag_akm_palm'],
    note: '7.62×39mm — iconic Soviet rifle with banana mag',
  },
  {
    id: 'ak74',
    name: 'AK-74',
    classname: 'AK74',
    category: 'Assault Rifle',
    barrelLen: 0.42,
    attachments: ['kobra', 'pso1', 'supp_ak', 'ak_plastic_stock', 'ak_folding_stock', 'ak_wood_stock', 'ak_rail_handguard', 'mag_ak74_30', 'mag_ak74_45'],
    note: '5.45×39mm — modernised AK platform',
  },
  {
    id: 'ak101',
    name: 'AK-101',
    classname: 'AK101',
    category: 'Assault Rifle',
    barrelLen: 0.42,
    attachments: ['kobra', 'kashtan', 'pso1', 'acog', 'supp_ak', 'ak_plastic_stock', 'ak_folding_stock', 'ak_rail_handguard', 'mag_ak101_30', 'mag_stanag_30', 'mag_stanag_60'],
    note: '5.56×45mm AK — uses NATO STANAG mags',
  },
  {
    id: 'vsd',
    name: 'VSD (VSS-type)',
    classname: 'VSD',
    category: 'Assault Rifle',
    barrelLen: 0.38,
    attachments: ['pso1', 'mag_val_20', 'mag_vss_10'],
    note: 'Subsonic 9×39mm — integral suppressor and sight, magazine only swappable item',
  },

  // ── Sniper Rifles ────────────────────────────────────────────────────────
  {
    id: 'svd',
    name: 'SVD (Dragunov)',
    classname: 'SVD',
    category: 'Sniper Rifle',
    barrelLen: 0.62,
    attachments: ['pso1', 'mag_svd_10'],
    note: '7.62×54R semi-auto sniper — PSO-1 is the definitive optic',
  },
  {
    id: 'mosin',
    name: 'Mosin-Nagant',
    classname: 'Mosin',
    category: 'Sniper Rifle',
    barrelLen: 0.72,
    attachments: ['pu', 'hunting_optic', 'mosin_comp'],
    note: 'Long bolt-action — most common sniper platform in DayZ',
  },
  {
    id: 'sks',
    name: 'SKS',
    classname: 'SKS',
    category: 'Sniper Rifle',
    barrelLen: 0.52,
    attachments: ['pu', 'hunting_optic'],
    note: '7.62×39mm — fixed 10-round internal magazine',
  },
  {
    id: 'cz527',
    name: 'CZ-527',
    classname: 'CZ527',
    category: 'Civilian Rifle',
    barrelLen: 0.56,
    attachments: ['hunting_optic', 'mag_cz527_5'],
    note: '7.62×39mm bolt-action — civilian precision rifle',
  },
  {
    id: 'blaze95',
    name: 'Blaze 95',
    classname: 'Blaze95',
    category: 'Civilian Rifle',
    barrelLen: 0.52,
    attachments: ['hunting_optic'],
    note: 'Double-barrelled — internal magazine, optic rail only',
  },
  {
    id: 'winchester70',
    name: 'Winchester Model 70',
    classname: 'Winchester70',
    category: 'Civilian Rifle',
    barrelLen: 0.60,
    attachments: ['hunting_optic'],
    note: '.308 bolt-action — internal magazine',
  },

  // ── SMGs ─────────────────────────────────────────────────────────────────
  {
    id: 'mp5k',
    name: 'MP5-K',
    classname: 'MP5K',
    category: 'SMG',
    barrelLen: 0.20,
    attachments: ['supp_improvised', 'mp5_comp', 'mag_mp5_30', 'mag_mp5_15'],
    note: '9mm compact SMG — very short barrel',
  },
  {
    id: 'ump45',
    name: 'UMP-45',
    classname: 'UMP45',
    category: 'SMG',
    barrelLen: 0.26,
    attachments: ['supp_improvised', 'mag_ump_25'],
    note: '.45 ACP SMG — polymer frame, folding stock',
  },

  // ── Pistols ──────────────────────────────────────────────────────────────
  {
    id: 'cz75',
    name: 'CZ-75',
    classname: 'CZ75',
    category: 'Pistol',
    barrelLen: 0.12,
    attachments: ['pistol_optic', 'supp_pistol', 'mag_cz75_15'],
    note: '9mm — most common pistol in DayZ, suppressible',
  },
  {
    id: 'glock19',
    name: 'Glock 19',
    classname: 'Glock19',
    category: 'Pistol',
    barrelLen: 0.12,
    attachments: ['pistol_optic', 'supp_pistol', 'mag_glock_15'],
    note: '9mm — high capacity pistol',
  },
  {
    id: 'fnx45',
    name: 'FNX-45',
    classname: 'FNX45',
    category: 'Pistol',
    barrelLen: 0.13,
    attachments: ['pistol_optic', 'supp_pistol', 'mag_fnx45_15'],
    note: '.45 ACP — large-frame tactical pistol',
  },
  {
    id: 'p1',
    name: 'P1',
    classname: 'P1',
    category: 'Pistol',
    barrelLen: 0.10,
    attachments: ['supp_pistol', 'mag_p1_8'],
    note: '9mm — classic Walther P1 style, suppressible',
  },
  {
    id: 'magnum',
    name: 'Magnum (.357)',
    classname: 'Magnum',
    category: 'Pistol',
    barrelLen: 0.16,
    attachments: ['mag_deagle_9'],
    note: '.357 Magnum revolver — no rail, no suppressor',
  },

  // ── Shotguns ─────────────────────────────────────────────────────────────
  {
    id: 'izh43',
    name: 'IZH-43 (Double Barrel)',
    classname: 'IZH43',
    category: 'Shotgun',
    barrelLen: 0.60,
    attachments: [],
    note: 'Break-action shotgun — no attachments available',
  },

  // ── Civilian Rifles ───────────────────────────────────────────────────────
  {
    id: 'sporter22',
    name: 'Sporter 22',
    classname: 'Sporter22',
    category: 'Civilian Rifle',
    barrelLen: 0.48,
    attachments: ['mag_ruger_30'],
    note: '.22 LR — detachable mag, no optic rail',
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
] as const;
