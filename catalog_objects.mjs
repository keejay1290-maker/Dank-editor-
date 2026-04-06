import fs from 'fs';

const v = JSON.parse(fs.readFileSync('valid_objects_lower.json', 'utf-8'));

const cats = {
  barrels: v.filter(x => x.includes('barrel') && !x.includes('barrelhole')),
  wrecks: v.filter(x => x.includes('wreck')),
  containers: v.filter(x => x.includes('container')),
  staticobj: v.filter(x => x.startsWith('staticobj_') && !x.includes('wreck') && !x.includes('container')),
  land_misc: v.filter(x => x.startsWith('land_') && x.includes('misc')),
  land_mil: v.filter(x => x.startsWith('land_') && x.includes('mil')),
  land_buildings: v.filter(x => x.startsWith('land_') && !x.includes('misc') && !x.includes('mil') && !x.includes('wreck')),
  contaminated: v.filter(x => x.includes('contaminated') || x.includes('chemgas') || x.includes('gas_zone')),
  other: v.filter(x => !x.startsWith('land_') && !x.startsWith('staticobj_') && !x.includes('barrel') && !x.includes('wreck'))
};

let output = '';
for (const [k, arr] of Object.entries(cats)) {
  output += `\n=== ${k.toUpperCase()} (${arr.length}) ===\n`;
  output += arr.join('\n') + '\n';
}

fs.writeFileSync('vanilla_objects_catalog.txt', output);
console.log('Catalog written. Totals:');
for (const [k, arr] of Object.entries(cats)) {
  console.log(`  ${k}: ${arr.length}`);
}
