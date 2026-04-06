import { readFileSync } from 'fs';
const raw = readFileSync('./valid_objects_lower.json', 'utf8');
const d = JSON.parse(raw);

const searches = [
  'czechhedgehog', 'barracks', 'watchtower', 'hbarrier', 'wall_concrete',
  'wreck_bmp', 'wreck_t72', 'cargo_tower', 'wall_brick', 'pier', 'boat_small',
  'tanks_gas', 'tank_big', 'powerline', 'barn_brick', 'castle_stairs',
  'guardian', 'hedgehog', 'hesco', 'nest_big', 'nest_small', 'fortif',
  'bunker', 'container', 'watchtow', 'guard_tower', 'guard tower',
  'czechh', 'bmp', 't72', 'wreck_heli', 'mi8', 'heli_wreck'
];

for (const s of searches) {
  const matches = d.filter(x => x.toLowerCase().includes(s.toLowerCase()));
  console.log(`${s}: ${matches.length ? matches.slice(0, 8).join(' | ') : 'NOT FOUND'}`);
}
