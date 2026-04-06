import fs from 'fs';
const file = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/App.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes('const QUICK_PRESETS: Preset[] = ['));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.trim() === '];');

if (startIndex !== -1 && endIndex !== -1) {
  const newPresets = `const QUICK_PRESETS: Preset[] = [
  // 🪖 Military & Defenses
  { category: "🪖 Military", label: "FOB Bastion",         shape: "star_fort",        params: { outerR:30,innerR:18,points:6,height:4,rings:1 },            suggestedClass: "Land_HBarrier_5m" },
  { category: "🪖 Military", label: "Command Bunker",      shape: "arena_compound",   params: { scale: 1, width: 25, depth: 25, height: 4, rows: 2 },      suggestedClass: "Land_Bunker1_Double" },
  { category: "🪖 Military", label: "Evac Helipad",        shape: "helipad",          params: { scale: 1, radius: 10, elevated: 0, lights: 1 },            suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🪖 Military", label: "Tank Trap Line",      shape: "bunker_line",      params: { length: 20, width: 8 },                                    suggestedClass: "Land_CzechHedgehog" },
  { category: "🪖 Military", label: "Military Checkpoint", shape: "checkpoint",       params: { width: 14, depth: 10 },                                    suggestedClass: "Land_Wall_Concrete_4m" },

  // ⛺ Survivor Camps & Settlements
  { category: "⛺ Settlements", label: "Trader Outpost",    shape: "celtic_ring",      params: { outerR: 20, innerR: 12, stones: 14, lintels: 0 },          suggestedClass: "Land_Container_1Bo" },
  { category: "⛺ Settlements", label: "Scrap Yard",        shape: "arena_compound",   params: { scale: 1, width: 30, depth: 20, height: 4, rows: 2 },      suggestedClass: "StaticObj_Wreck_BMP1_DE" },
  { category: "⛺ Settlements", label: "Bandit Hideout",    shape: "sniper_nest",      params: { radius: 8, height: 4 },                                    suggestedClass: "DZ\\\\rocks_bliss\\\\rock_monolith2.p3d" },
  { category: "⛺ Settlements", label: "Survivor Camp",     shape: "survivor_camp",    params: { radius: 12 },                                              suggestedClass: "Land_Mil_Tent_Big1_1" },

  // ☣️ Quarantine & Infested
  { category: "☣️ Quarantine", label: "CDC Camp",           shape: "arena_maze",       params: { scale: 1, size: 8, wallH: 3 },                             suggestedClass: "Land_Mil_Tent_Big1_3" },
  { category: "☣️ Quarantine", label: "Burn Pit",           shape: "colosseum",        params: { radius: 15, height: 4, tiers: 2, arches: 10 },             suggestedClass: "Land_CzechHedgehog" },

  // 🧱 DayZ Architecture & Props
  { category: "🧱 Props", label: "Concrete Wall (Long)",    shape: "wall_line",        params: { length:20,height:4,rings:1,spacing:2 },                    suggestedClass: "Land_Wall_Concrete_8m" },
  { category: "🧱 Props", label: "Guard Tower",             shape: "tower",            params: { radius:5,height:15,rings:3,points:8 },                     suggestedClass: "Land_Mil_Watchtower" },
  { category: "🧱 Props", label: "Fuel Depot",              shape: "fuel_depot",       params: { size: 10 },                                                suggestedClass: "Land_Tanks_Gas_Small" },
  { category: "🧱 Props", label: "Radio Outpost",           shape: "radio_outpost",    params: { radius: 8 },                                               suggestedClass: "Land_Power_Station" },

  // ⚡ Teleporters / Points of Interest
  { category: "⚡ POI", label: "Bunker Hatch",     shape: "teleporter_bunker_hatch", params: { scale: 1, radius: 4,  padRadius: 4  },                 suggestedClass: "Land_Mil_Barracks_i" },
  { category: "⚡ POI", label: "Helicopter Crash", shape: "disc",                    params: { radius: 10, rings: 2, points: 12, innerRadius: 4 },    suggestedClass: "StaticObj_Wreck_UH1Y" },
  { category: "⚡ POI", label: "Cult Ritual",      shape: "teleporter_ritual",       params: { scale: 1, radius: 4,  stones: 8, padRadius: 4 },       suggestedClass: "DZ\\\\rocks_bliss\\\\rock_monolith1.p3d" }
];`;

  lines.splice(startIndex, endIndex - startIndex + 1, newPresets);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('App.tsx QUICK_PRESETS completely replaced by deleting rows', startIndex, 'to', endIndex);
} else {
  console.log('Could not find start or end index', startIndex, endIndex);
}
