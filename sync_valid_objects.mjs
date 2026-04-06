import fs from 'fs';
import path from 'path';

const catalogueFile = './artifacts/dayz-builder/src/lib/masterObjectCatalogue.ts';
const content = fs.readFileSync(catalogueFile, 'utf8');

const matches = Array.from(content.matchAll(/"(Land_[^"]+|staticobj_[^"]+|StaticObj_[^"]+)"/gi)).map(m => m[1]);
const uniqueLower = Array.from(new Set(matches.map(o => o.toLowerCase())));

fs.writeFileSync('valid_objects_lower.json', JSON.stringify(uniqueLower, null, 2), 'utf8');
console.log(`Updated valid_objects_lower.json with ${uniqueLower.length} authorized objects.`);
