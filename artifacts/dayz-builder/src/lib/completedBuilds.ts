// ─── COMPLETED BUILDS ────────────────────────────────────────────────────────
// Each entry is a fully configured, ready-to-download build.
// frameObj = primary object used in FRAME (outline) mode.
// fillObj  = primary object used in FILL (solid) mode.
// extraFrame / extraFill = comma-sep extras stacked on each point (optional).
// posX/Y/Z = pre-set world coordinates (flat ground at NWAF or Krasnoe).
// ─────────────────────────────────────────────────────────────────────────────

export interface CompletedBuild {
  id: string;
  category: string;
  icon: string;
  name: string;
  tagline: string;
  // Shape generation
  shape: string;
  params: Record<string, number>;
  // Object selection
  frameObj: string;
  fillObj: string;
  extraFrame?: string;
  extraFill?: string;
  // Auto-orient outward (good for rings, forts, walls)
  autoOrient?: boolean;
  // World position — NWAF or Krasnoe flat tarmac
  posX: number;
  posY: number;
  posZ: number;
  // Why these objects were chosen
  objectNotes: string;
  // suggested fill density (1=sparse 4=dense)
  fillDensity?: number;
}

// NWAF (Northwest Airfield, Chernarus) — long flat tarmac runway
const NWAF = { posX: 4630, posY: 135, posZ: 10490 };
// Krasnoe Airfield (SE coast) — wide flat apron area
const KRASN = { posX: 11950, posY: 148, posZ: 12540 };

export const COMPLETED_BUILDS: CompletedBuild[] = [

  // ─── 🚀 Sci-Fi & Space ─────────────────────────────────────────────────────
  {
    id: "death_star",
    category: "🚀 Sci-Fi",
    icon: "☄️",
    name: "Death Star",
    tagline: "Full sphere with dish trench. Hovers at 40m over the runway.",
    shape: "deathstar",
    params: { radius: 40, latSegs: 10, lonSegs: 16, dishRadius: 12, dishDepth: 6 },
    frameObj: "Land_GasTank_Cylindrical",
    fillObj: "Barrel_Blue",
    ...NWAF, posY: 175,
    objectNotes: "Gas tanks trace the spherical rings; barrels give a dense blue metallic fill.",
  },
  {
    id: "halo_ring",
    category: "🚀 Sci-Fi",
    icon: "💫",
    name: "Halo Ring",
    tagline: "Massive torus floating over the airfield — 120m across.",
    shape: "torus",
    params: { majorR: 60, minorR: 5, majorSegs: 36, minorSegs: 6 },
    frameObj: "StaticObj_Rail_Platform_Segment",
    fillObj: "Land_Concrete_01_F_10x10_DE",
    autoOrient: true,
    ...NWAF, posY: 160,
    objectNotes: "Rail platform segments curve naturally around the ring; concrete slabs thicken the band.",
  },
  {
    id: "borg_cube",
    category: "🚀 Sci-Fi",
    icon: "🟩",
    name: "Borg Cube",
    tagline: "40×40×40m wireframe cube. Shipping containers are peak Borg aesthetic.",
    shape: "borg_cube",
    params: { size: 40, gridLines: 4 },
    frameObj: "StaticObj_Container_1D",
    fillObj: "StaticObj_Container_1C",
    ...NWAF,
    objectNotes: "Industrial shipping containers on every face grid — perfect Borg collective architecture.",
  },
  {
    id: "orbital_station",
    category: "🚀 Sci-Fi",
    icon: "🛸",
    name: "Orbital Station",
    tagline: "Ring + spokes space station silhouette, hovering high.",
    shape: "orbital_station",
    params: { radius: 40, height: 12, ringSegs: 24, spokes: 6 },
    frameObj: "Land_Tank_SmallConcrete_Round",
    fillObj: "Land_GasTank_Cylindrical",
    ...NWAF, posY: 165,
    objectNotes: "Concrete round tanks trace the ring; gas tanks fill the curved station body.",
  },
  {
    id: "millennium_falcon",
    category: "🚀 Sci-Fi",
    icon: "🚀",
    name: "Millennium Falcon",
    tagline: "Saucer with mandibles and cockpit offset — iconic silhouette.",
    shape: "millennium_falcon",
    params: { radius: 25, height: 6, mandibleLen: 14, cockpitOffset: 10 },
    frameObj: "Land_GasTank_Cylindrical",
    fillObj: "Barrel_Green",
    ...NWAF,
    objectNotes: "Gas tanks frame the hull rings; green barrels fill the disc — distinct ship silhouette.",
  },
  {
    id: "black_hole",
    category: "🚀 Sci-Fi",
    icon: "🌀",
    name: "Black Hole",
    tagline: "Spiral arms radiating from a dense core — eerie gravitational art.",
    shape: "black_hole",
    params: { radius: 35, arms: 5, turns: 2 },
    frameObj: "Land_TankTrap_DE",
    fillObj: "Land_BarbedWire_01_DE",
    ...NWAF,
    objectNotes: "Czech hedgehog tank traps spiral outward; barbed wire fills the accretion disc arms.",
  },
  {
    id: "crashed_ufo",
    category: "🚀 Sci-Fi",
    icon: "💥",
    name: "Crashed UFO",
    tagline: "Tilted saucer disc half-buried in the airfield. Alien crash site.",
    shape: "crashed_ufo",
    params: { radius: 25, tilt: 28, rings: 6 },
    frameObj: "Land_GasTank_Cylindrical",
    fillObj: "Barrel_Green",
    extraFrame: "Barrel_Yellow",
    ...KRASN,
    objectNotes: "Gas cylinders trace the crashed disc edge; green + yellow barrels imply bio-contamination.",
  },

  // ─── 🎬 Movies & TV ─────────────────────────────────────────────────────────
  {
    id: "eye_of_sauron",
    category: "🎬 Movies",
    icon: "👁️",
    name: "Eye of Sauron",
    tagline: "Barad-dûr spire + fiery oval eye. 90m tall. Takes Mordor to DayZ.",
    shape: "eye_of_sauron",
    params: { height: 90, towerWidth: 28, eyeRadius: 22 },
    frameObj: "Land_PowerLine_Tower_DE",
    fillObj: "Land_RadioTower_1_DE",
    extraFrame: "Land_BarbedWire_01_DE",
    ...NWAF,
    objectNotes: "Power line towers trace the dark spire; radio towers fill the frame with a sinister silhouette. Barbed wire adds the spike detail.",
  },
  {
    id: "minas_tirith",
    category: "🎬 Movies",
    icon: "🏰",
    name: "Minas Tirith",
    tagline: "Multi-tower citadel rings. 7 towers, 90m tall — Gondor's capital.",
    shape: "azkaban_tower",
    params: { baseRadius: 35, height: 90, towerCount: 7 },
    frameObj: "StaticObj_Monument_Wall",
    fillObj: "Land_Wall_Concrete_4m_DE",
    extraFrame: "Land_Wall_Brick_8m_DE",
    ...KRASN,
    objectNotes: "Monument walls trace the iconic white-stone tower rings; brick+concrete walls fill the citadel body.",
  },
  {
    id: "atat_walker",
    category: "🎬 Movies",
    icon: "🐘",
    name: "AT-AT Walker",
    tagline: "4-legged walker: elevated box body, neck, boxy head, twin cannons.",
    shape: "atat_walker",
    params: { height: 30, width: 20 },
    frameObj: "Land_Wreck_BTR_DE",
    fillObj: "StaticObj_Container_1D",
    extraFrame: "Land_BarrierConcrete_01_DE",
    ...NWAF,
    objectNotes: "BTR wreck chunks trace the leg/body structure; containers fill the boxy hull; concrete barriers add the armour plate detail.",
  },
  {
    id: "t800",
    category: "🎬 Movies",
    icon: "💀",
    name: "T-800 Endoskeleton",
    tagline: "Skull cage, ribcage, spine, limbs. 22m tall chrome nightmare.",
    shape: "t800_endoskeleton",
    params: { height: 22, width: 10 },
    frameObj: "Land_TankTrap_DE",
    fillObj: "Barrel_Blue",
    extraFrame: "Land_BarbedWire_01_DE",
    ...NWAF,
    objectNotes: "Czech hedgehog traps read as the angular skeleton joints; barbed wire laces through the ribcage. Blue barrels give a metallic chrome fill.",
  },
  {
    id: "mordor_gate",
    category: "🎬 Movies",
    icon: "🌋",
    name: "Black Gate of Mordor",
    tagline: "Massive arch gate with flanking towers. 60m tall.",
    shape: "sci_fi_gate",
    params: { width: 80, height: 60 },
    frameObj: "Land_Wall_Concrete_8m_DE",
    fillObj: "Land_Wall_Brick_8m_DE",
    extraFrame: "Land_BarrierConcrete_02_DE",
    ...KRASN,
    objectNotes: "Concrete 8m walls form the dark tower flanks; concrete barriers detail the arch. Very imposing gate structure.",
  },
  {
    id: "star_destroyer",
    category: "🎬 Movies",
    icon: "🔺",
    name: "Star Destroyer",
    tagline: "Stepped pyramid wedge — the profile of an Imperial Star Destroyer.",
    shape: "pyramid_stepped",
    params: { size: 60, height: 20, steps: 5 },
    frameObj: "StaticObj_Container_1D",
    fillObj: "Land_BarrierConcrete_01_DE",
    ...NWAF,
    objectNotes: "Shipping containers define the wedge silhouette; concrete barriers fill the stepped decks.",
  },

  // ─── 🏛 Monuments ─────────────────────────────────────────────────────────
  {
    id: "stonehenge",
    category: "🏛 Monuments",
    icon: "🪨",
    name: "Stonehenge",
    tagline: "Standing stone circle with trilithon lintels. Built from rock monoliths.",
    shape: "stonehenge",
    params: { radius: 18, stones: 12, stoneH: 8, lintels: 6, innerRadius: 10 },
    frameObj: "DZ\\rocks_bliss\\rock_monolith1.p3d",
    fillObj: "DZ\\rocks_bliss\\stone9_moss.p3d",
    ...NWAF,
    objectNotes: "Rock monoliths ARE the standing stones — couldn't be more fitting. Mossy stones fill between the megaliths.",
  },
  {
    id: "colosseum",
    category: "🏛 Monuments",
    icon: "🏟️",
    name: "Colosseum",
    tagline: "Elliptical arena with 3 tiers, arch columns, and arena floor.",
    shape: "colosseum",
    params: { radius: 35, height: 24, tiers: 3, arches: 20 },
    frameObj: "Land_Wall_Concrete_4m_DE",
    fillObj: "Land_BarrierConcrete_01_DE",
    extraFrame: "Land_Wall_Brick_4m_DE",
    autoOrient: true,
    ...KRASN,
    objectNotes: "Concrete 4m walls trace the tiered arches; brick walls add texture between tiers; barriers fill the seating bowl.",
  },
  {
    id: "celtic_ring",
    category: "🏛 Monuments",
    icon: "⭕",
    name: "Celtic Stone Ring",
    tagline: "Double-ring megalith circle with inner altar stones.",
    shape: "celtic_ring",
    params: { outerR: 25, innerR: 18, stones: 16, lintels: 8 },
    frameObj: "DZ\\rocks_bliss\\rock_monolith1.p3d",
    fillObj: "DZ\\rocks_bliss\\stone9_moss.p3d",
    extraFill: "DZ\\rocks_bliss\\clutter_01.p3d",
    ...NWAF,
    objectNotes: "Monolith rocks form the outer standing stones; mossy stones and rock clutter fill the inner sacred ground.",
  },
  {
    id: "pyramid_aztec",
    category: "🏛 Monuments",
    icon: "🔺",
    name: "Aztec Pyramid",
    tagline: "5-step pyramid — 60m wide, 30m tall. Flat top for sacrificial altar.",
    shape: "pyramid_stepped",
    params: { size: 60, height: 30, steps: 5 },
    frameObj: "Land_Wall_Concrete_8m_DE",
    fillObj: "Land_ConcreteSlab_03_DE",
    extraFrame: "Land_BarrierConcrete_01_DE",
    autoOrient: true,
    ...NWAF,
    objectNotes: "8m concrete walls define each step tier; large concrete slabs fill the step faces; barriers add the decorative detail.",
  },

  // ─── 💀 Dark & Horror ──────────────────────────────────────────────────────
  {
    id: "giant_skull",
    category: "💀 Dark",
    icon: "💀",
    name: "Giant Skull",
    tagline: "18m radius skull with eye sockets and jaw. Horrifying base marker.",
    shape: "body_skull",
    params: { radius: 18, eyeSocket: 5, jawDrop: 8 },
    frameObj: "DZ\\rocks_bliss\\rock_spike1.p3d",
    fillObj: "Barrel_Red",
    ...KRASN,
    objectNotes: "Rock spikes form the jagged skull bone structure; red barrels fill the skull with a bloody interior.",
  },
  {
    id: "volcano",
    category: "💀 Dark",
    icon: "🌋",
    name: "Volcano",
    tagline: "Mt. Fuji profile — wide base, curved sides, open jagged crater. 50m base.",
    shape: "volcano",
    params: { baseRadius: 50, height: 32, craterRadius: 10, rimHeight: 4, rings: 10, spacing: 6 },
    frameObj: "DZ\\rocks_bliss\\rock_monolith2.p3d",
    fillObj: "DZ\\rocks_bliss\\stone9_moss.p3d",
    extraFill: "DZ\\rocks_bliss\\clutter_01.p3d",
    ...KRASN,
    objectNotes: "Rock monoliths outline the volcanic cone ridges and lava flows; mossy stones and clutter fill the mountain body.",
  },
  {
    id: "mushroom_cloud",
    category: "💀 Dark",
    icon: "☢️",
    name: "Mushroom Cloud",
    tagline: "Nuclear explosion silhouette. Yellow barrels = radiological hazard.",
    shape: "mushroom_cloud",
    params: { radius: 40, height: 80 },
    frameObj: "Barrel_Yellow",
    fillObj: "Land_GasTank_Big",
    extraFrame: "Barrel_Red",
    ...NWAF, posY: 135,
    objectNotes: "Yellow hazmat barrels trace the cloud outline; big gas tanks fill the stem and cap. Red barrels accent the fireball base.",
  },

  // ─── 🤖 Mechs ─────────────────────────────────────────────────────────────
  {
    id: "mech_bipedal",
    category: "🤖 Mechs",
    icon: "🤖",
    name: "Mech Warrior",
    tagline: "Bipedal mech — cockpit, torso, arms, legs. 25m tall war machine.",
    shape: "mech_bipedal",
    params: { height: 25, width: 14 },
    frameObj: "Land_Wreck_BTR_DE",
    fillObj: "StaticObj_Container_1D",
    extraFrame: "Land_Wreck_T72_DE",
    ...NWAF,
    objectNotes: "BTR wreck chunks form the armour plates; T72 wreck pieces add heavy tank-grade armour to the mech joints. Containers fill the torso.",
  },
  {
    id: "spider_walker",
    category: "🤖 Mechs",
    icon: "🕷️",
    name: "Spider Walker",
    tagline: "6-legged arachnid mech. Alien/Zerg aesthetic. 18m tall body.",
    shape: "mech_walker",
    params: { radius: 12, height: 18, legs: 6 },
    frameObj: "Land_Wreck_BTR_DE",
    fillObj: "Land_TankTrap_DE",
    extraFrame: "Land_BarbedWire_01_DE",
    ...NWAF,
    objectNotes: "BTR wrecks mark the leg joints and body rings; hedgehogs fill with a spiky mechanical look; barbed wire adds leg-spine detail.",
  },

  // ─── 🏰 Military & Bases ───────────────────────────────────────────────────
  {
    id: "star_fort",
    category: "🏰 Bases",
    icon: "⭐",
    name: "Star Fort",
    tagline: "6-pointed star bastion — DayZ's most defensible ground base shape.",
    shape: "star_fort",
    params: { radius: 40, points: 6, height: 8, wallThick: 3 },
    frameObj: "Land_HBarrier_5m_DE",
    fillObj: "Land_Sandbag_Wall_DE",
    extraFrame: "Land_BarbedWire_01_DE",
    autoOrient: true,
    ...KRASN,
    objectNotes: "HESCO 5m barriers form the star-fort walls and bastions; sandbag walls fill the ramparts; barbed wire crowns the parapets.",
  },
  {
    id: "prison_tower",
    category: "🏰 Bases",
    icon: "🗼",
    name: "Prison Tower",
    tagline: "5-floor circular tower with walkway ring per floor. 30m tall.",
    shape: "prison_tower",
    params: { radius: 12, height: 30, floors: 5, corridorDepth: 3 },
    frameObj: "Land_Mil_WatchtowerH_DE",
    fillObj: "Land_Bunker_DE",
    extraFrame: "Land_Wall_Concrete_4m_DE",
    autoOrient: true,
    ...KRASN,
    objectNotes: "Tall military watchtowers ring each floor; concrete 4m walls fill between towers; bunkers at ground level anchor the structure.",
  },
];
