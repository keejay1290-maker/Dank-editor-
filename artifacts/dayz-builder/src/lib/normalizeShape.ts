import { getShape } from "./shapeRegistry";
import { prebuildJsonExists } from "./prebuildLoader";
import { identifyShapeArchetype } from "./shapeUtils";

const GENERATOR_SHAPES = new Set([
  "full_sphere", "ring", "cylinder", "cube", "cluster", "disc", "tower", "line", "spoke_hub",
  "millennium_falcon", "torus", "star_fort", "death_star", "deathstar", "stargate_portal",
  "helms_deep", "azkaban_prison", "stargate", "normandy_bunkers", "taj_mahal", "pyramid_giza",
  "stonehenge", "colosseum_complex", "matrix_zion_dock", "halo_control_room", "nakatomi_plaza",
  "jurassic_park_gate", "peach_castle", "shinra_hq", "orbital_station", "borg_cube",
  "star_destroyer", "starship_enterprise", "king_kong_empire", "eye_of_sauron", "alcatraz_prison",
  "roman_aqueduct", "military_fob", "checkpoint_charlie", "trench_network", "crop_circle",
  "the_wall_game_of_thrones", "minas_tirith_tier", "oil_rig", "panama_canal_locks",
  "airport_runway", "bunker_complex_entrance", "medieval_fort", "bridge_of_khazad_dum",
  "arena_colosseum", "arena_fort", "arena_maze", "arena_siege", "arena_compound", "pvp_arena",
  "wall_perimeter", "gothic_arch", "bridge_truss", "amphitheater", "vaulted_ceiling",
  "pitched_roof", "log_cabin", "freeway_curve", "saturn", "crown", "olympic_rings",
  "submarine", "aircraft_carrier", "destroyer", "helicarrier", "teleporter_scifi",
  "teleporter_transporter", "teleporter_stargate", "teleporter_ufo", "teleporter_ritual",
  "teleporter_lava", "teleporter_bunker_hatch", "teleporter_event_mega", "sci_fi_gate",
  "cannon_turret", "tunnel_circle", "tunnel_square", "tunnel_hex", "dna_double",
  "reactor_core", "crashed_ufo", "volcano", "colosseum", "treehouse", "checkpoint",
  "watchtower_post", "fuel_depot", "sniper_nest", "farmstead", "survivor_camp",
  "bunker_line", "power_relay", "radio_outpost", "dragon", "pirate_ship", "helipad",
  // Masterpiece generators (session 2026-04-06)
  "statue_liberty", "xwing", "x_wing", "christ_redeemer", "hogwarts", "sydney_opera",
  "space_needle", "cn_tower", "leaning_pisa", "tower_pisa", "pisa", "sagrada_familia",
  "arc_triomphe", "parthenon", "big_ben", "eiffel_tower", "colosseum", "pyramid_giza",
  "stonehenge", "taj_mahal", "golden_gate_bridge", "london_eye", "minas_tirith",
  "barad_dur", "helms_deep", "tony_stark_tower", "tardis", "zion_dock",
  "skyscraper", "torus", "wall_arc", "helix", "tunnel_circle", "leaning_tower"
]);

/**
 * 🏗️ SHAPE NORMALISER (AUTO-SCANNER AWARE)
 * Converts user-friendly or legacy shape names into canonical registry IDs.
 */
export function normalizeShape(shape: any): string {
  try {
    const s = String(shape || "cluster").toLowerCase().trim();
    if (!s) return "cluster";

    // 1. Check Registry (Auto-Scanner catches existing shapes)
    // Priority: Specific registry definitions MUST override generic archetypes
    const def = typeof getShape === "function" ? getShape(s) : null;
    if (def) {
        if (def.type === "composite" && !GENERATOR_SHAPES.has(s)) {
            if (typeof prebuildJsonExists === "function" && prebuildJsonExists(s)) {
                return "composite_shape";
            }
            return s; 
        }
        return s;
    }

    // 2. Structural Identification (Advanced Architectural Mapping)
    // Fallback: If not in registry, guess the archetype
    const archetype = identifyShapeArchetype(s);
    if (archetype !== "cluster") return archetype;

    // 3. Last Resort: Archetype (Usually 'cluster')
    return archetype;
  } catch (err) {
    console.error("[NORMALIZE_SHAPE_CRASH]", err);
    return "cluster";
  }
}
