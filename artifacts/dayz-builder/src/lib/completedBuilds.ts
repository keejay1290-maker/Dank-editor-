// ─── COMPLETED BUILDS ────────────────────────────────────────────────────────
// Coordinates calibrated for real Chernarus+ map locations (Section 15, Fix 4).
// ─────────────────────────────────────────────────────────────────────────────

export interface CompletedBuild {
  id: string; category: string; icon: string; name: string; tagline: string; shape: string; 
  params: Record<string, number>; frameObj: string; fillObj: string; extraFrame?: string; extraFill?: string;
  autoOrient?: boolean; posX: number; posY: number; posZ: number; objectNotes: string; interiorType: "open" | "structure"; lootTheme: string;
  frameCount?: number; fillCount?: number;
  objects_final?: any[];
}

const NWAF  = { posX: 4050,  posY: 400, posZ: 10450 }; // NWAF elevated ~400m
const KRASN = { posX: 11950, posY: 142, posZ: 12500 }; // Krasno ~142m
const BALOTA = { posX: 8220, posY: 470, posZ: 9010  }; // Balota airfield ~470m
const STARY  = { posX: 5800, posY: 470, posZ: 8200  }; // Stary Sobor ~470m
const TISY   = { posX: 600,  posY: 503, posZ: 13690 }; // Tisy Military ~503m
const UNDERGROUND = { posY: 3.0 }; // Real subterranean floor for bunkers

export const COMPLETED_BUILDS: CompletedBuild[] = [
  { id: "death_star_v2", category: "Sci-Fi", icon: "🚀", name: "Death Star (Master)", tagline: "Absolute fidelity moon-station.", shape: "death_star", params: { radius: 44 }, frameObj: "staticobj_wall_milcnc_4", fillObj: "staticobj_wall_cncsmall_8", ...NWAF, objectNotes: "Zero-gap hull, equatorial trench, governed to 1200 objs.", interiorType: "structure", lootTheme: "Military" },
  { id: "stonehenge_v2", category: "Historical", icon: "🪨", name: "Stonehenge (Master)", tagline: "Precision prehistoric circle.", shape: "stonehenge", params: { radius: 25 }, frameObj: "staticobj_wall_stone", fillObj: "staticobj_wall_stone2", ...TISY, objectNotes: "Trilithon horseshoe, gapless outer ring.", interiorType: "open", lootTheme: "Historical" },
  { id: "colosseum_v2", category: "Historical", icon: "🏛️", name: "Colosseum (Master)", tagline: "Flavian ellipse amphitheatre.", shape: "colosseum", params: { width: 100 }, frameObj: "staticobj_wall_stone2", fillObj: "staticobj_wall_stone", ...KRASN, objectNotes: "Multi-tiered arched gallery, perfect scaling.", interiorType: "open", lootTheme: "Historical" },
  { id: "pyramid_v2", category: "Historical", icon: "📐", name: "Great Pyramid (Master)", tagline: "Giza fidelity structure.", shape: "pyramid_giza", params: { width: 120 }, frameObj: "staticobj_wall_stone2", fillObj: "staticobj_wall_stone", ...BALOTA, objectNotes: "True geometry peak, zero gaps.", interiorType: "structure", lootTheme: "Historical" },
];;
