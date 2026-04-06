import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogueFile = path.resolve(__dirname, '../src/lib/masterObjectCatalogue.ts');
const buildsFile = path.resolve(__dirname, '../src/lib/completedBuilds.ts');

const catalogueCode = fs.readFileSync(catalogueFile, 'utf8');
const objects = Array.from(catalogueCode.matchAll(/"(Land_[^"]+|staticobj_[^"]+|StaticObj_[^"]+)"/gi)).map(m => m[1]);
const masterLower = new Set(objects.map(o => o.toLowerCase()));

console.log(`Loaded ${objects.length} authorized objects from catalogue.`);

let buildsCode = fs.readFileSync(buildsFile, 'utf8');
const buildRegex = /"frameObj":\s*"([^"]+)"|"fillObj":\s*"([^"]+)"|"extraFrame":\s*"([^"]+)"|"extraFill":\s*"([^"]+)"/g;

buildsCode = buildsCode.replace(buildRegex, (match, frame, fill, exFrame, exFill) => {
  const val = (frame || fill || exFrame || exFill || "").replace(/^"|"$/g, "");
  if (!val) return match;
  
  if (!masterLower.has(val.toLowerCase())) {
     // Check if it's a list (extraFrame/extraFill)
     if (val.includes(",")) {
         const parts = val.split(",").map(p => p.trim());
         const validParts = parts.filter(p => masterLower.has(p.toLowerCase()));
         if (validParts.length === 0) return match.replace(`"${val}"`, `"Land_Container_1Bo"`);
         return match.replace(`"${val}"`, `"${validParts.join(",")}"`);
     }
    console.log(`⚠️ unauthorized object: ${val}. Remapping to Land_Container_1Bo`);
    return match.replace(`"${val}"`, `"Land_Container_1Bo"`);
  }
  return match;
});

fs.writeFileSync(buildsFile, buildsCode, 'utf8');
console.log('Build asset audit complete.');
