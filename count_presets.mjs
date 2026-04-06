import fs from 'fs';
const content = fs.readFileSync('./artifacts/dayz-builder/src/App.tsx', 'utf8');
const count = (content.match(/"label":/g) || []).length;
console.log(`Total presets in App.tsx: ${count}`);
const start = content.indexOf('export const QUICK_PRESETS');
const end = content.indexOf('];', start);
const arrayContent = content.substring(start, end + 2);
const items = (arrayContent.match(/{/g) || []).length;
console.log(`Total {} objects inside QUICK_PRESETS: ${items}`);
