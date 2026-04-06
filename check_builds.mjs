import { readFileSync } from 'fs';
const raw = readFileSync('./valid_objects_lower.json', 'utf8');

const keys = [
  'land_container_1bo', 'land_container_1mo', 'land_wreck_bmp1', 'land_wreck_t72wreck',
  'land_prison_wall_large', 'land_czechhedgehog', 'land_mil_fortified_nest_big',
  'land_mil_fortified_nest_small', 'land_castle_bergfrit', 'land_castle_bergfrit2',
  'land_castle_bastion2', 'land_mil_guardtower', 'land_bunker1_double',
  'land_mil_tent_big1_1', 'land_misc_scaffolding', 'land_dieselpowerplant_tank_big',
  'land_dieselpowerplant_tank_small', 'land_power_station', 'land_radio_building',
  'wreck_mi8', 'wreck_mi8_crashed', 'barbedwire', 'barrel_blue', 'barrel_red',
  'barrel_green', 'barrel_yellow', 'land_mil_guardhouse1', 'land_mil_cargo_tower',
  'land_mil_barracks_i', 'land_mil_barracks_hq', 'land_tanks_gas_small',
  'land_tank_big', 'land_hbarrier_5m', 'land_wall_concrete_4m', 'land_wall_concrete_8m',
  'land_wall_brick_4m', 'land_mil_watchtower', 'land_barn_brick1',
  'land_powerline_tower', 'land_woodenpier_15m', 'land_boat_small1',
  'land_wreck_t72wreck', 'land_castle_stairs_nolc',
];

const missing = [];
const ok = [];
for (const k of keys) {
  if (raw.includes(`"${k}"`)) ok.push(k);
  else missing.push(k);
}

console.log('\n=== OK ===');
ok.forEach(k => console.log('  ✓', k));
console.log('\n=== MISSING (need replacement) ===');
missing.forEach(k => console.log('  ✗', k));
