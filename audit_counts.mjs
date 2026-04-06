// Quick object count estimator for completedBuilds entries
// These are rough estimates based on shape type and params
// The real count is computed by shapeGenerators.ts at runtime but we need to catch obvious violators

const MAX_OBJECTS = 1200;

const builds = [
  // Sci-Fi
  { id: "death_star",     shape: "deathstar",         params: { radius: 40, latSegs: 10, lonSegs: 16, dishRadius: 12, dishDepth: 6 },         estimate: 640 },
  { id: "borg_cube",      shape: "borg_cube",          params: { size: 40, gridLines: 4 },                                                      estimate: 192 },
  { id: "orbital_station",shape: "orbital_station",    params: { radius: 40, height: 12, ringSegs: 24, spokes: 6 },                             estimate: 180 },
  { id: "millennium_falcon",shape:"millennium_falcon",  params: { radius: 25, height: 6, mandibleLen: 14, cockpitOffset: 10 },                   estimate: 180 },
  { id: "black_hole",     shape: "black_hole",         params: { radius: 35, arms: 5, turns: 2 },                                              estimate: 200 },
  { id: "crashed_ufo",    shape: "crashed_ufo",        params: { radius: 25, tilt: 28, rings: 6 },                                             estimate: 150 },
  // Movies
  { id: "eye_of_sauron",  shape: "eye_of_sauron",      params: { height: 90, towerWidth: 28, eyeRadius: 22 },                                  estimate: 300 },
  { id: "minas_tirith",   shape: "azkaban_tower",       params: { baseRadius: 35, height: 90, towerCount: 7 },                                  estimate: 420 },
  { id: "atat_walker",    shape: "atat_walker",         params: { height: 30, width: 20 },                                                      estimate: 200 },
  { id: "t800",           shape: "t800_endoskeleton",   params: { height: 22, width: 10 },                                                      estimate: 220 },
  { id: "mordor_gate",    shape: "sci_fi_gate",         params: { width: 80, height: 60 },                                                      estimate: 480 },
  { id: "star_destroyer", shape: "pyramid_stepped",     params: { size: 60, height: 20, steps: 5 },                                            estimate: 360 },
  // Monuments
  { id: "stonehenge",     shape: "stonehenge",          params: { radius: 18, stones: 12, stoneH: 8, lintels: 6, innerRadius: 10 },            estimate: 60  },
  { id: "colosseum",      shape: "colosseum",           params: { radius: 35, height: 24, tiers: 3, arches: 20 },                              estimate: 720 },
  { id: "celtic_ring",    shape: "celtic_ring",         params: { outerR: 25, innerR: 18, stones: 16, lintels: 8 },                            estimate: 80  },
  { id: "pyramid_aztec",  shape: "pyramid_stepped",     params: { size: 60, height: 30, steps: 5 },                                            estimate: 360 },
  // Dark
  { id: "giant_skull",    shape: "body_skull",          params: { radius: 18, eyeSocket: 5, jawDrop: 8 },                                      estimate: 400 },
  { id: "volcano",        shape: "volcano",             params: { baseRadius: 50, height: 32, craterRadius: 10, rimHeight: 4, rings: 10, spacing: 6 }, estimate: 600 },
  { id: "mushroom_cloud", shape: "mushroom_cloud",      params: { radius: 40, height: 80 },                                                    estimate: 500 },
  // Mechs
  { id: "mech_bipedal",   shape: "mech_bipedal",        params: { height: 25, width: 14 },                                                     estimate: 250 },
  { id: "spider_walker",  shape: "mech_walker",          params: { height: 18, width: 14 },                                                     estimate: 220 },
  // Bases
  { id: "star_fort",      shape: "star_fort",           params: { outerR: 40, innerR: 24, points: 6, height: 8, rings: 2 },                    estimate: 480 },
  { id: "prison_tower",   shape: "prison_tower",        params: { radius: 12, height: 30, floors: 5, corridorDepth: 3 },                       estimate: 300 },
  // Lightweight — known small counts (from objectNotes)
  { id: "lw_treehouse",        frameCount: 22,  fillCount: 22  },
  { id: "lw_checkpoint",       frameCount: 9,   fillCount: 9   },
  { id: "lw_watchtower_triangle", frameCount: 7, fillCount: 7  },
  { id: "lw_fuel_depot",       frameCount: 10,  fillCount: 10  },
  { id: "lw_sniper_nest",      frameCount: 8,   fillCount: 8   },
  { id: "lw_farmstead",        frameCount: 16,  fillCount: 16  },
  { id: "lw_survivor_camp",    frameCount: 10,  fillCount: 10  },
  { id: "lw_bunker_line",      frameCount: 11,  fillCount: 11  },
  { id: "lw_power_relay",      frameCount: 8,   fillCount: 8   },
  { id: "lw_radio_outpost",    frameCount: 6,   fillCount: 6   },
  { id: "lw_guard_post",       frameCount: 9,   fillCount: 9   },
  { id: "lw_tank_trap_line",   frameCount: 11,  fillCount: 11  },
  // Fantasy
  { id: "dragon",         shape: "dragon",              params: { scale: 1, length: 12, wings: 8, neck: 4 },    estimate: 160 },
  { id: "pirate_ship",    shape: "pirate_ship",         params: { scale: 1, length: 20, masts: 3 },            estimate: 300 },
  // Structures/Arenas
  { id: "pvp_arena",       shape: "pvp_arena",          params: { scale: 1, radius: 15, height: 5, walls: 8 }, estimate: 320 },
  { id: "helipad",         shape: "helipad",            params: { scale: 1, radius: 8, elevated: 0, lights: 1 }, estimate: 100 },
  { id: "arena_colosseum", shape: "arena_colosseum",    params: { scale: 1, radiusX: 22, radiusZ: 15, height: 7, tiers: 3 }, estimate: 480 },
  { id: "arena_fort",      shape: "arena_fort",         params: { scale: 1, width: 28, depth: 28, height: 6, bastions: 1 }, estimate: 320 },
  { id: "arena_maze",      shape: "arena_maze",         params: { scale: 1, size: 10, wallH: 3 },              estimate: 200 },
  { id: "arena_siege",     shape: "arena_siege",        params: { scale: 1, width: 35, wallH: 6, towerH: 14 }, estimate: 280 },
  { id: "arena_compound",  shape: "arena_compound",     params: { scale: 1, width: 32, depth: 24, height: 4, rows: 3 }, estimate: 320 },
  { id: "pvp_featured_hesco",       estimate: 280, note: "280 per tagline — SAFE" },
  { id: "pvp_featured_colosseum_heavy", estimate: 900, note: "~900 per tagline — SAFE (under 1200)" },
];

console.log("\n=== COMPLETED BUILD OBJECT COUNT AUDIT ===\n");
console.log("(Estimates — actual count computed by shapeGenerators at runtime)\n");

const warnings = [];
for (const b of builds) {
  const count = b.estimate ?? Math.max(b.frameCount ?? 0, b.fillCount ?? 0);
  const status = count >= MAX_OBJECTS ? "❌ OVER LIMIT" : count > 800 ? "⚠  WARNING" : "✓  OK";
  if (count >= MAX_OBJECTS) warnings.push(b.id);
  console.log(`${status.padEnd(14)} ${b.id.padEnd(36)} ~${count} objects`);
}

console.log(`\nTotal builds: ${builds.length}`);
console.log(`Flagged over ${MAX_OBJECTS}: ${warnings.length > 0 ? warnings.join(", ") : "NONE"}`);
