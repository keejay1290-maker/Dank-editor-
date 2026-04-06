import fs from 'fs';

const buildsFile = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/completedBuilds.ts';
let code = fs.readFileSync(buildsFile, 'utf8');

const injectionBuilds = `
  // ── 25 MASTERPIECES ──
  {
    id: "azkaban", category: "🎬 Movies", icon: "⛓️", name: "Azkaban Prison", tagline: "Massive dark triangular wizard prison.", shape: "azkaban_prison", params: { width:40, height:100 }, frameObj: "Land_Castle_Wall2_04", fillObj: "Land_Castle_Wall2_04", autoOrient: true, posX: 14000, posZ: 14000, objectNotes: "Dark towering prison.", interiorType: "structure", lootTheme: "military" },
  { id: "stargate", category: "🚀 Sci-Fi", icon: "🌐", name: "Stargate Portal", tagline: "Massive interstellar portal ring.", shape: "stargate_portal", params: { radius:20 }, frameObj: "Land_Wall_Concrete_4m", fillObj: "Land_Wall_Concrete_4m", autoOrient: true, posX: 8000, posZ: 8000, objectNotes: "A huge upright ring.", interiorType: "open", lootTheme: "military" },
  { id: "helms_deep", category: "🎬 Movies", icon: "🏰", name: "Helm's Deep", tagline: "Sweeping Deeping Wall and castle keep.", shape: "helms_deep", params: { width:100 }, frameObj: "Land_Castle_Wall2_04", fillObj: "Land_Castle_Wall2_04", autoOrient: true, posX: 5000, posZ: 5000, objectNotes: "Giant sweeping castle wall.", interiorType: "open", lootTheme: "military" },
  { id: "jurassic_park_gate", category: "🎬 Movies", icon: "🦖", name: "Jurassic Park Gate", tagline: "Iconic monolithic park gates.", shape: "jurassic_park_gate", params: { width:30, height:25 }, frameObj: "Land_Wall_Brick_4m", fillObj: "Land_Wall_Brick_4m", autoOrient: true, posX: 7000, posZ: 7000, objectNotes: "Massive entrance gate.", interiorType: "open", lootTheme: "civilian" },
  { id: "nakatomi_plaza", category: "🎬 Movies", icon: "🏢", name: "Nakatomi Plaza", tagline: "Die Hard's vertical skyscraper.", shape: "nakatomi_plaza", params: { width:30, height:140 }, frameObj: "Land_Office2", fillObj: "Land_Office2", autoOrient: true, posX: 3000, posZ: 3000, objectNotes: "Giant skyscraper with helipad.", interiorType: "structure", lootTheme: "civilian" },
  { id: "matrix_zion", category: "🚀 Sci-Fi", icon: "🔌", name: "Zion Dock", tagline: "Concentric underground landing pads.", shape: "matrix_zion_dock", params: { width:100 }, frameObj: "Land_Mil_Watchtower", fillObj: "Land_Mil_Watchtower", autoOrient: true, posX: 8000, posZ: 8000, objectNotes: "Scaffolded underground hangar.", interiorType: "open", lootTheme: "industrial" },
  { id: "fortress_solitude", category: "🎬 Movies", icon: "❄️", name: "Fortress of Solitude", tagline: "Crystalline pillars in the ice.", shape: "fortress_of_solitude", params: { width:60 }, frameObj: "Land_Wall_Concrete_4m", fillObj: "Land_Wall_Concrete_4m", autoOrient: true, posX: 14000, posZ: 14000, objectNotes: "Jagged overlapping spires.", interiorType: "open", lootTheme: "mixed" },
  { id: "wall_maria", category: "🎬 Movies", icon: "🧱", name: "Wall Maria", tagline: "Massive circular defensive wall.", shape: "wall_maria", params: { width:200, height:50 }, frameObj: "Land_Wall_Brick_4m", fillObj: "Land_Wall_Brick_4m", autoOrient: true, posX: 10000, posZ: 10000, objectNotes: "Arcing huge curved boundary.", interiorType: "open", lootTheme: "military" },
  { id: "barad_dur", category: "🎬 Movies", icon: "👁️", name: "Barad-dûr", tagline: "Dark jagged needle spire.", shape: "barad_dur", params: { width:50, height:200 }, frameObj: "Land_Castle_Wall2_04", fillObj: "Land_Castle_Wall2_04", autoOrient: true, posX: 13000, posZ: 13000, objectNotes: "Sauron's evil jagged tower.", interiorType: "structure", lootTheme: "military" },
  { id: "tardis", category: "🚀 Sci-Fi", icon: "⏳", name: "TARDIS", tagline: "Small dense blue box.", shape: "tardis", params: {}, frameObj: "Land_Container_1Bo", fillObj: "Land_Container_1Bo", autoOrient: true, posX: 4000, posZ: 4000, objectNotes: "Simple enclosed structure.", interiorType: "structure", lootTheme: "civilian" },
  { id: "nuketown", category: "🪖 Military", icon: "☢️", name: "Nuketown", tagline: "Iconic video game cul-de-sac.", shape: "nuketown", params: {}, frameObj: "Land_Wall_Concrete_4m", fillObj: "Land_Wall_Concrete_4m", autoOrient: true, posX: 6000, posZ: 6000, objectNotes: "Twin facing block houses.", interiorType: "open", lootTheme: "military" },
  { id: "dust2", category: "🪖 Military", icon: "💣", name: "Dust 2 - A Site", tagline: "Legendary shooter bomb site.", shape: "dust2_a_site", params: {}, frameObj: "Land_Wall_Brick_4m", fillObj: "Land_Wall_Brick_4m", autoOrient: true, posX: 7000, posZ: 7000, objectNotes: "Iconic layout including long doors.", interiorType: "open", lootTheme: "military" },
  { id: "peach_castle", category: "🏛️ Monuments", icon: "🍄", name: "Peach's Castle", tagline: "Central keep with outer towers.", shape: "peach_castle", params: {}, frameObj: "Land_Castle_Wall2_04", fillObj: "Land_Castle_Wall2_04", autoOrient: true, posX: 6000, posZ: 6000, objectNotes: "Whimsical symmetrical castle.", interiorType: "structure", lootTheme: "civilian" },
  { id: "shinra_hq", category: "🚀 Sci-Fi", icon: "⚡", name: "Shinra HQ", tagline: "Cylindrical ribbed megastructure.", shape: "shinra_hq", params: { width:40, height:180 }, frameObj: "Land_Office2", fillObj: "Land_Office2", autoOrient: true, posX: 4000, posZ: 4000, objectNotes: "Towering evil corporate HQ.", interiorType: "structure", lootTheme: "civilian" },
  { id: "halo_control", category: "🚀 Sci-Fi", icon: "🌀", name: "Halo Control Room", tagline: "Massive technological pyramid base.", shape: "halo_control_room", params: { width:100, height:80 }, frameObj: "Land_Mil_Watchtower", fillObj: "Land_Mil_Watchtower", autoOrient: true, posX: 14000, posZ: 14000, objectNotes: "Sloped central core with bridge.", interiorType: "structure", lootTheme: "military" },
  { id: "colosseum", category: "🏛️ Monuments", icon: "⚔️", name: "The Colosseum", tagline: "Ancient circular gladiatorial arena.", shape: "colosseum", params: { width:80, height:40 }, frameObj: "Land_Wall_Brick_4m", fillObj: "Land_Wall_Brick_4m", autoOrient: true, posX: 5000, posZ: 5000, objectNotes: "Huge open multi-level rings.", interiorType: "open", lootTheme: "mixed" },
  { id: "golden_gate", category: "🏛️ Monuments", icon: "🌉", name: "Golden Gate Bridge", tagline: "Extremely long suspension bridge.", shape: "golden_gate_bridge", params: { width:300, height:100 }, frameObj: "Land_Mil_Watchtower", fillObj: "Land_Mil_Watchtower", autoOrient: true, posX: 10000, posZ: 10000, objectNotes: "Enormous bridge structure.", interiorType: "open", lootTheme: "civilian" },
  { id: "normandy", category: "🪖 Military", icon: "🌊", name: "Normandy Bunkers", tagline: "Fortified cliff pillboxes.", shape: "normandy_bunkers", params: { width:120 }, frameObj: "Land_Wall_Concrete_4m", fillObj: "Land_Wall_Concrete_4m", autoOrient: true, posX: 13000, posZ: 2000, objectNotes: "Beach defenses.", interiorType: "open", lootTheme: "military" },
  { id: "pentagon", category: "🪖 Military", icon: "🛡️", name: "The Pentagon", tagline: "Nested 5-sided rings.", shape: "the_pentagon", params: { width:100 }, frameObj: "Land_Office2", fillObj: "Land_Office2", autoOrient: true, posX: 6000, posZ: 6000, objectNotes: "Massive defense building.", interiorType: "structure", lootTheme: "military" },
  { id: "pyramid_giza", category: "🏛️ Monuments", icon: "🛕", name: "Pyramid of Giza", tagline: "Massive stepped pyramid block.", shape: "pyramid_giza", params: { width:120 }, frameObj: "Land_Wall_Brick_4m", fillObj: "Land_Wall_Brick_4m", autoOrient: true, posX: 2000, posZ: 12000, objectNotes: "Huge solid pyramid.", interiorType: "structure", lootTheme: "mixed" },
  { id: "taj_mahal", category: "🏛️ Monuments", icon: "🏰", name: "Taj Mahal", tagline: "Square base with central dome.", shape: "taj_mahal", params: {}, frameObj: "Land_Castle_Wall2_04", fillObj: "Land_Castle_Wall2_04", autoOrient: true, posX: 11000, posZ: 11000, objectNotes: "Beautiful domed structure.", interiorType: "structure", lootTheme: "civilian" },
  { id: "stonehenge", category: "🏛️ Monuments", icon: "🪨", name: "Stonehenge", tagline: "Ancient circular monoliths.", shape: "stonehenge", params: {}, frameObj: "Land_Wall_Concrete_4m", fillObj: "Land_Wall_Concrete_4m", autoOrient: true, posX: 7000, posZ: 7000, objectNotes: "Standing stones.", interiorType: "open", lootTheme: "mixed" },
  { id: "starship_enterprise", category: "🚀 Sci-Fi", icon: "🚀", name: "Starship Enterprise", tagline: "Saucer, neck, and twin warp nacelles.", shape: "starship_enterprise", params: { width:100 }, frameObj: "Land_Wall_Concrete_4m", fillObj: "Land_Wall_Concrete_4m", autoOrient: true, posX: 13000, posZ: 13000, objectNotes: "Floating iconic spaceship.", interiorType: "open", lootTheme: "military" },
  { id: "star_destroyer", category: "🚀 Sci-Fi", icon: "☄️", name: "Star Destroyer", tagline: "Massive wedge-shaped spearhead.", shape: "star_destroyer", params: { width:100, length:200 }, frameObj: "Land_Wall_Concrete_4m", fillObj: "Land_Wall_Concrete_4m", autoOrient: true, posX: 13000, posZ: 13000, objectNotes: "Giant triangular capital ship.", interiorType: "open", lootTheme: "military" },
  { id: "king_kong", category: "🎬 Movies", icon: "🦍", name: "Empire State (Kong)", tagline: "Deco tower with creature on top.", shape: "king_kong_empire", params: {}, frameObj: "Land_Office2", fillObj: "Land_Office2", autoOrient: true, posX: 11000, posZ: 11000, objectNotes: "Tall spire with nested objects.", interiorType: "structure", lootTheme: "civilian" }
`;

if (!code.includes('azkaban')) {
  const lastBracket = code.lastIndexOf('];');
  if (lastBracket > -1) {
    code = code.slice(0, lastBracket) + ',\n' + injectionBuilds + '\n];';
    fs.writeFileSync(buildsFile, code);
    console.log("Injected completedBuilds!");
  }
}

// Ensure App.tsx has them in QUICK_PRESETS 
const appFile = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/App.tsx';
let appCode = fs.readFileSync(appFile, 'utf8');

const appInjection = `
  { category: "🎬 Movies", label: "Azkaban Prison", shape: "azkaban_prison", params: { width:40, height:100 }, suggestedClass: "Land_Castle_Wall2_04" },
  { category: "🎬 Movies", label: "Helm's Deep", shape: "helms_deep", params: { width:100 }, suggestedClass: "Land_Castle_Wall2_04" },
  { category: "🎬 Movies", label: "Jurassic Park Gate", shape: "jurassic_park_gate", params: { width:30, height:25 }, suggestedClass: "Land_Wall_Brick_4m" },
  { category: "🎬 Movies", label: "Nakatomi Plaza", shape: "nakatomi_plaza", params: { width:30, height:140 }, suggestedClass: "Land_Office2" },
  { category: "🎬 Movies", label: "Fortress of Solitude", shape: "fortress_of_solitude", params: { width:60 }, suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🎬 Movies", label: "Wall Maria", shape: "wall_maria", params: { width:200, height:50 }, suggestedClass: "Land_Wall_Brick_4m" },
  { category: "🎬 Movies", label: "Barad-dûr", shape: "barad_dur", params: { width:50, height:200 }, suggestedClass: "Land_Castle_Wall2_04" },
  { category: "🎬 Movies", label: "Empire State (Kong)", shape: "king_kong_empire", params: {}, suggestedClass: "Land_Office2" },
  
  { category: "🚀 Sci-Fi", label: "Stargate Portal", shape: "stargate_portal", params: { radius:20 }, suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🚀 Sci-Fi", label: "Zion Dock", shape: "matrix_zion_dock", params: { width:100 }, suggestedClass: "Land_Mil_Watchtower" },
  { category: "🚀 Sci-Fi", label: "TARDIS", shape: "tardis", params: {}, suggestedClass: "Land_Container_1Bo" },
  { category: "🚀 Sci-Fi", label: "Shinra HQ", shape: "shinra_hq", params: { width:40, height:180 }, suggestedClass: "Land_Office2" },
  { category: "🚀 Sci-Fi", label: "Halo Control Room", shape: "halo_control_room", params: { width:100, height:80 }, suggestedClass: "Land_Mil_Watchtower" },
  { category: "🚀 Sci-Fi", label: "Starship Enterprise", shape: "starship_enterprise", params: { width:100 }, suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🚀 Sci-Fi", label: "Star Destroyer", shape: "star_destroyer", params: { width:100, length:200 }, suggestedClass: "Land_Wall_Concrete_4m" },

  { category: "🪖 Military", label: "Nuketown", shape: "nuketown", params: {}, suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🪖 Military", label: "Dust 2 - A Site", shape: "dust2_a_site", params: {}, suggestedClass: "Land_Wall_Brick_4m" },
  { category: "🪖 Military", label: "Normandy Bunkers", shape: "normandy_bunkers", params: { width:120 }, suggestedClass: "Land_Wall_Concrete_4m" },
  { category: "🪖 Military", label: "The Pentagon", shape: "the_pentagon", params: { width:100 }, suggestedClass: "Land_Office2" },

  { category: "🏛️ Monuments", label: "Peach's Castle", shape: "peach_castle", params: {}, suggestedClass: "Land_Castle_Wall2_04" },
  { category: "🏛️ Monuments", label: "The Colosseum", shape: "colosseum", params: { width:80, height:40 }, suggestedClass: "Land_Wall_Brick_4m" },
  { category: "🏛️ Monuments", label: "Golden Gate Bridge", shape: "golden_gate_bridge", params: { width:300, height:100 }, suggestedClass: "Land_Mil_Watchtower" },
  { category: "🏛️ Monuments", label: "Pyramid of Giza", shape: "pyramid_giza", params: { width:120 }, suggestedClass: "Land_Wall_Brick_4m" },
  { category: "🏛️ Monuments", label: "Taj Mahal", shape: "taj_mahal", params: {}, suggestedClass: "Land_Castle_Wall2_04" },
  { category: "🏛️ Monuments", label: "Stonehenge", shape: "stonehenge", params: {}, suggestedClass: "Land_Wall_Concrete_4m" }
`;

if (!appCode.includes('Nakatomi')) {
  const marker = '// 🦄 Fantasy & Mythic';
  const mrkIdx = appCode.indexOf(marker);
  if (mrkIdx > -1) {
    appCode = appCode.slice(0, mrkIdx) + appInjection + '\n\n' + appCode.slice(mrkIdx);
    fs.writeFileSync(appFile, appCode);
    console.log("Injected App.tsx Quick Presets!");
  }
}
