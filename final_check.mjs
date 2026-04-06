import { readFileSync } from 'fs';
const raw = readFileSync('./valid_objects_lower.json', 'utf8');
const d = JSON.parse(raw);
// d is an array of lowercase strings

const toCheck = [
  'NorseHelm', 'GreatHelm', 'ChristmasTree',
  'UndergroundStashSnow', 'EasterEgg', 'Plant_Pumpkin',
  'Land_Boat_Small1', 'Land_Boat_Small2',
  'Land_Castle_Bergfrit', 'Land_Castle_Bergfrit2', 'Land_Castle_Bastion2',
  'Land_Castle_Stairs_nolc', 'Land_Power_Station',
  'Land_Radio_Building', 'Land_Pier_Crane_A',
  'Land_Barn_Brick1', 'Land_Barn_Brick2',
  'Land_Mil_Tent_Big1_1', 'Land_Mil_Barracks1', 'Land_Mil_Barracks2',
  'Land_Bunker1_Double', 'Land_Mil_Fortified_Nest_Big', 'Land_Mil_Fortified_Nest_Small',
  'Land_Mil_Fortified_Nest_Watchtower',
  'Land_DieselPowerPlant_Tank_Big', 'Land_DieselPowerPlant_Tank_Small',
  'Land_Container_1Bo', 'Land_Container_1Mo',
  'Land_Prison_Wall_Large',
  'StaticObj_Wreck_BMP1_DE', 'StaticObj_Wreck_T72_Chassis_DE',
  'Wreck_MI8_Crashed', 'BarbedWire',
  'Barrel_Blue', 'Barrel_Red', 'Barrel_Green', 'Barrel_Yellow',
];

const missing = [];
const ok = [];
for (const k of toCheck) {
  if (d.includes(k.toLowerCase())) ok.push(k);
  else missing.push(k);
}

console.log('\n=== FINAL VERIFICATION REPORT ===');
console.log('\nVERIFIED (' + ok.length + '):');
ok.forEach(k => console.log('  OK: ' + k));
console.log('\nNOT IN valid_objects_lower (' + missing.length + '):');
missing.forEach(k => console.log('  ?? ' + k));
console.log('\nNote: "??" does not necessarily mean invalid.');
console.log('mapgroupproto/mapgrouppos objects (map structures) may not appear in types.xml but ARE vanilla.');
