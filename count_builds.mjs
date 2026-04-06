import fs from 'fs';
const content = fs.readFileSync('./artifacts/dayz-builder/src/lib/completedBuilds.ts', 'utf8');
const count = (content.match(/"id":/g) || []).length;
console.log(`Total builds in completedBuilds.ts: ${count}`);
const countUnquoted = (content.match(/\bid:/g) || []).length;
console.log(`Total unquoted ids: ${countUnquoted}`);
const total = count + countUnquoted;
console.log(`GRAND TOTAL: ${total}`);
