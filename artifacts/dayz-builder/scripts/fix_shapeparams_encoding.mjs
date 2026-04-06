import fs from 'fs';
import path from 'path';

const f = './src/lib/shapeParams.ts';
if (!fs.existsSync(f)) {
    console.error(`File not found: ${f}`);
    process.exit(1);
}

let code = fs.readFileSync(f, 'utf8');

// Replace all non-ASCII characters with ASCII equivalents
const replacements = {
  'û': 'u', 'ü': 'u', 'ö': 'o', 'ä': 'a', 'é': 'e', 'è': 'e',
  '─': '-', '╗': '', '╔': '', '║': '|', '└': '', '┘': '',
  '🪐': '', '⭐': '', '☄': '', '⚔': '', '🌉': '', '⬠': '',
  '⛓': '', '🧗': '', '❄': '', '👁': '', '🍄': '', '☢': '',
  '🏜': '', '🦖': '', '⚓': '', '🔫': '', '🔘': '', '🏢': '',
  '🦍': '', '🌐': '', '🟦': '', '🛸': '',
};

for (const [from, to] of Object.entries(replacements)) {
  code = code.split(from).join(to);
}

// Remove any remaining non-ASCII (catches anything missed above)
code = code.replace(/[^\x00-\x7F]/g, '');

fs.writeFileSync(f, code, 'utf8');
console.log('shapeParams.ts cleaned of all non-ASCII characters');
