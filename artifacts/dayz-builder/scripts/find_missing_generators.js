import fs from 'fs';
import path from 'path';

const generatorsCode = fs.readFileSync('src/lib/shapeGenerators.ts', 'utf8');
const generators2Code = fs.readFileSync('src/lib/shapeGenerators2.ts', 'utf8');
const masterpiecesCode = fs.readFileSync('src/lib/shapeMasterpieces.ts', 'utf8');
const buildsCode = fs.readFileSync('src/lib/completedBuilds.ts', 'utf8');

const combinedGenerators = generatorsCode + generators2Code + masterpiecesCode;

const casesInSwitch = Array.from(generatorsCode.matchAll(/case\s+['"]([^'"]+)['"]/g)).map(m => m[1]);
const casesInSwitch2 = Array.from(generators2Code.matchAll(/case\s+['"]([^'"]+)['"]/g)).map(m => m[1]);
const allCases = new Set([...casesInSwitch, ...casesInSwitch2]);

const buildsRaw = buildsCode.split('COMPLETED_BUILDS:')[1];
const shapesInBuilds = Array.from(buildsRaw.matchAll(/"shape":\s*"([^"]+)"/g)).map(m => m[1]);
const uniqueShapes = new Set(shapesInBuilds);

console.log("Missing Generators for Builds:");
for (const s of uniqueShapes) {
    if (!allCases.has(s)) {
        console.log(`  - ${s}`);
    }
}
