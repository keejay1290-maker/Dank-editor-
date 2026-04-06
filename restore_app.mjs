import fs from 'fs';
const file = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/App.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes('const QUICK_PRESETS: Preset[] = ['));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.trim() === '];');

if (startIndex !== -1 && endIndex !== -1) {
  const newPresets = `const QUICK_PRESETS: Preset[] = [
  // 🚀 Sci-Fi & Space
  { category: "🚀 Sci-Fi", label: "Death Star",       shape: "deathstar",        params: { radius:50,latSegs:16,lonSegs:24,dishRadius:14,dishDepth:8,dishLat:30 }, suggestedClass: "Land_Wall_Concrete_8m" },
  { category: "🚀 Sci-Fi", label: "Orbital Ring",     shape: "orbital_station",  params: { radius:40 },                                                             suggestedClass: "Land_Wall_Concrete_8m" },
  { category: "🚀 Sci-Fi", label: "DNA Helix",        shape: "dna_double",       params: { radius:12,height:40,turns:5,pointsPerTurn:12 },                         suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🚀 Sci-Fi", label: "Millennium Falcon",shape: "millennium_falcon", params: { radius:30 },                                                             suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🚀 Sci-Fi", label: "Sci-Fi Gate",      shape: "sci_fi_gate",      params: { width:40,height:30 },                                                    suggestedClass: "Land_Wall_Concrete_8m" },
  { category: "🚀 Sci-Fi", label: "Reactor Core",     shape: "reactor_core",     params: { radius:25,height:30,rings:5 },                                           suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🚀 Sci-Fi", label: "Crashed UFO",      shape: "crashed_ufo",      params: { radius:25,tiltDeg:25,debris:10 },                                        suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🚀 Sci-Fi", label: "Alien Mothership", shape: "alien_mothership", params: { radius:50,emitterCount:8 },                                              suggestedClass: "Land_Wall_Concrete_8m" },
  { category: "🚀 Sci-Fi", label: "Black Hole",       shape: "black_hole",       params: { radius:30,arcs:4 },                                                      suggestedClass: "Land_Wall_Concrete_8m" },
  { category: "🚀 Sci-Fi", label: "Torus Gate",       shape: "torus",            params: { majorR:30,minorR:8,majorSegs:20,minorSegs:10 },                          suggestedClass: "Land_Wall_Concrete_4m" },

  // 🤖 Mechs & Robots
  { category: "🤖 Mechs", label: "Mech Warrior",  shape: "mech_bipedal", params: { height:25,width:14 },            suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🤖 Mechs", label: "Spider Walker",  shape: "mech_walker",  params: { height:20,width:14 },            suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🤖 Mechs", label: "Minigun Turret", shape: "mech_minigun", params: { baseRadius:10,height:20,barrelCount:6 }, suggestedClass: "Land_Wall_Concrete_4m" },

  // 🏛️ Monuments & Structures
  { category: "🏛️ Monuments", label: "Colosseum",     shape: "colosseum",       params: { radius:60,height:30,tiers:3,arches:20 },                                         suggestedClass: "Land_Wall_Concrete_8m" },
  { category: "🏛️ Monuments", label: "Stonehenge",    shape: "stonehenge",      params: { outerRadius:30,innerRadius:16,stoneHeight:8,stoneWidth:2,outerCount:30,trilithonCount:5,archCount:6 }, suggestedClass: "DZ\\\\rocks_bliss\\\\rock_monolith1.p3d" },
  { category: "🏛️ Monuments", label: "Azkaban",       shape: "azkaban_tower",   params: { baseRadius:20,height:60,towerCount:5 },                                           suggestedClass: "Land_Prison_Wall_Large" },
  { category: "🏛️ Monuments", label: "Skyscraper",    shape: "skyscraper",      params: { width:20,height:100,floors:20 },                                                  suggestedClass: "Land_HouseBlock_5F" },
  { category: "🏛️ Monuments", label: "Pyramid Aztec", shape: "pyramid_stepped", params: { baseSize:100,height:50,steps:7,shrink:0.15,spacing:4 },                           suggestedClass: "Land_Wall_Brick_4m" },

  // 🪖 Military & Defenses
  { category: "🪖 Military", label: "FOB Bastion",         shape: "star_fort",        params: { outerR:30,innerR:18,points:6,height:4,rings:1 },            suggestedClass: "Land_HBarrier_5m" },
  { category: "🪖 Military", label: "Command Bunker",      shape: "arena_compound",   params: { scale: 1, width: 25, depth: 25, height: 4, rows: 2 },      suggestedClass: "Land_Bunker1_Double" },
  { category: "🪖 Military", label: "Evac Helipad",        shape: "helipad",          params: { scale: 1, radius: 10, elevated: 0, lights: 1 },            suggestedClass: "Land_Wall_Concrete_4m" },

  // ⛺ Survivor Camps & Settlements
  { category: "⛺ Settlements", label: "Trader Outpost",    shape: "celtic_ring",      params: { outerR: 20, innerR: 12, stones: 14, lintels: 0 },          suggestedClass: "Land_Container_1Bo" },
  { category: "⛺ Settlements", label: "Bandit Hideout",    shape: "sniper_nest",      params: { radius: 8, height: 4 },                                    suggestedClass: "DZ\\\\rocks_bliss\\\\rock_monolith2.p3d" },

  // 💀 Dark & Horror
  { category: "💀 Dark", label: "Mushroom Cloud", shape: "mushroom_cloud",params: { radius:40,height:80 },                                                     suggestedClass: "Land_DieselPowerPlant_Tank_Small" },
  { category: "💀 Dark", label: "Volcano",        shape: "volcano",      params: { baseRadius:50,height:32,craterRadius:10,rimHeight:4,rings:10,spacing:6 },   suggestedClass: "DZ\\\\rocks_bliss\\\\stone9_moss.p3d" },

  // 🎬 Movies & TV
  { category: "🎬 Movies", label: "Halo Ring",      shape: "torus",            params: { majorR:60,minorR:4,majorSegs:36,minorSegs:6 },               suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🎬 Movies", label: "AT-AT Walker",   shape: "atat_walker",      params: { height:30,width:20 },                                        suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🎬 Movies", label: "The Wall (GoT)", shape: "wall_line",        params: { length:120,height:24,rings:12,spacing:2 },                   suggestedClass: "Land_Wall_Brick_4m" },
  { category: "🎬 Movies", label: "Eye of Sauron",  shape: "eye_of_sauron",    params: { height:90,towerWidth:28,eyeRadius:22 },                      suggestedClass: "Land_Castle_Stairs_nolc" },
  { category: "🎬 Movies", label: "Avengers Tower", shape: "avengers_tower",   params: { width:14,height:130,floors:26 },                             suggestedClass: "Land_HouseBlock_5F" },
  { category: "🎬 Movies", label: "Minas Tirith",   shape: "pyramid_stepped",  params: { baseSize:100,height:80,steps:6,shrink:0.15,spacing:12 },      suggestedClass: "Land_Prison_Wall_Large" },

  // 🦄 Fantasy & Mythic
  { category: "🦄 Fantasy", label: "Dragon", shape: "dragon", params: { scale: 1.5, length: 16, wings: 10, neck: 5 }, suggestedClass: "DZ\\\\rocks_bliss\\\\rock_spike1.p3d" },

  // 🏴‍☠️ Nautical
  { category: "🏴‍☠️ Nautical", label: "Pirate Ship", shape: "pirate_ship", params: { scale: 1, length: 20, masts: 3 },   suggestedClass: "Land_Ship_Big_FrontA" },

  // 🧱 DayZ Architecture & Props
  { category: "🧱 Props", label: "Concrete Wall (Long)",    shape: "wall_line",        params: { length:20,height:4,rings:1,spacing:2 },                    suggestedClass: "Land_Wall_Concrete_8m" },
  { category: "🧱 Props", label: "Guard Tower",             shape: "tower",            params: { radius:5,height:15,rings:3,points:8 },                     suggestedClass: "Land_Mil_Watchtower" },
  
  // ⚡ Teleporters / Points of Interest
  { category: "⚡ POI", label: "Bunker Hatch",     shape: "teleporter_bunker_hatch", params: { scale: 1, radius: 4,  padRadius: 4  },                 suggestedClass: "Land_Mil_Barracks_i" },
  { category: "⚡ POI", label: "Helicopter Crash", shape: "disc",                    params: { radius: 10, rings: 2, points: 12, innerRadius: 4 },    suggestedClass: "StaticObj_Wreck_UH1Y" },
  { category: "⚡ POI", label: "Cult Ritual",      shape: "teleporter_ritual",       params: { scale: 1, radius: 4,  stones: 8, padRadius: 4 },       suggestedClass: "DZ\\\\rocks_bliss\\\\rock_monolith1.p3d" }
];`;

  lines.splice(startIndex, endIndex - startIndex + 1, newPresets);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('App.tsx QUICK_PRESETS completely restored with accurate geometries');
} else {
  console.log('Could not find start or end index', startIndex, endIndex);
}
