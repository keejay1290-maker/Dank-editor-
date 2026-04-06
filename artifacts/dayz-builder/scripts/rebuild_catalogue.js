const fs = require('fs');
const path = require('path');

const backupFile = path.resolve(__dirname, '../../../DayZAllStaticOBJbckUp.json');
const content = fs.readFileSync(backupFile, 'utf8');

const matches = Array.from(content.matchAll(/\b(Land_[a-z0-9_]+|staticobj_[a-z0-9_]+|StaticObj_[a-z0-9_]+)\b/gi)).map(m => m[1]);
const uniqueObjects = Array.from(new Set(matches.filter(n => n.length > 5)));

console.log(`Extracted ${uniqueObjects.length} unique objects.`);

const categories = [
  { label: "🧱 STRUCTURES & WALLS", keywords: ["wall", "hbarrier", "roadblock", "fence", "cnc", "bags", "nest", "castle", "fort", "bastion"] },
  { label: "🪐 SCI-FI & INDUSTRIAL", keywords: ["container", "pipe", "tank", "transformer", "smokestack", "transmitter", "power", "fuel"] },
  { label: "🔫 MILITARY & WRECKS", keywords: ["mil_", "wreck_", "bmp", "t72", "hmmwv", "ural", "brdm", "btr", "mi8", "gun", "artilery"] },
  { label: "🏠 FURNITURE & DECOR", keywords: ["furniture", "misc", "chair", "table", "bed", "lamp", "tv", "pc", "trash", "garbage", "couch"] },
  { label: "🛣️ TERRAIN & ROADS", keywords: ["roads", "sidewalk", "pier", "bridge", "rail", "stone", "sidewalk", "asphalt", "dirt"] }
];

const catalogue = categories.map(c => ({
  label: c.label,
  objects: []
}));

const remaining = [];

uniqueObjects.forEach(obj => {
  const low = obj.toLowerCase();
  let matched = false;
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].keywords.some(k => low.includes(k))) {
      catalogue[i].objects.push(obj);
      matched = true;
      break;
    }
  }
  if (!matched) remaining.push(obj);
});

if (remaining.length > 0) {
  catalogue.push({
    label: "📦 MISCELLANEOUS",
    objects: remaining
  });
}

const output = `export interface ObjectCategory {
  label: string;
  objects: string[];
}

export const MASTER_OBJECT_CATALOGUE: ObjectCategory[] = ${JSON.stringify(catalogue, null, 2)};

export const ALL_MASTER_OBJECTS = MASTER_OBJECT_CATALOGUE.flatMap(c => c.objects);
`;

const targetFile = path.resolve(__dirname, '../src/lib/masterObjectCatalogue.ts');
fs.writeFileSync(targetFile, output, 'utf8');
console.log(`Master Object Catalogue rebuilt with ${uniqueObjects.length} objects.`);
